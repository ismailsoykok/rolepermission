const express = require("express");
const router = express.Router();
const requirePermission = require("../middlewares/requirepermission.js");
const requireLogin = require("../middlewares/requireLogin.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Department = require("../models/Departments");
const User = require("../models/Users.js");
const Job = require("../models/Jobs.js");


// İstersen boş da bırakabilirsin ama en azından şöyle olsun:
router.get("/jobs", requireLogin, requirePermission("view_ownjobs"), async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const { searchCategory, searchTerm } = req.query;

    // Temel filtre: kullanıcının departmanı + sadece kendisine atanmış işler
    const filter = {
      department: req.session.user.department,
      assignedTo: req.session.user.id,
    };

    // 🔍 Arama filtresi
    if (searchTerm && searchCategory) {
      const regex = new RegExp(searchTerm, "i"); // case-insensitive arama

      if (searchCategory === "title") {
        filter.title = { $regex: regex };
      } else if (searchCategory === "content") {
        filter.description = { $regex: regex };
      } else if (searchCategory === "creator") {
        // createdBy.username'e göre filtreleme
        const users = await User.find({ username: { $regex: regex } }).select("_id");
        filter.createdBy = { $in: users.map((u) => u._id) };
      }
    }

    const totalItems = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy assignedTo department", "username name");

    /* 🔄 Buffer → Base64 */
    const jobsWithBase64 = jobs.map((job) => {
      const obj = job.toObject();                 
      obj.attachments = obj.attachments.map((att) => ({
        ...att,
        data: att.data ? att.data.toString("base64") : undefined
      }));
      return obj;
    });

    res.json({
      jobs: jobsWithBase64,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});



router.get("/jobsfree", requireLogin, requirePermission("view_freejobs"), async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const { searchCategory, searchTerm } = req.query;

    const filter = {
      department: req.session.user.department,
      assignedTo: null,
    };

    // 🔍 Arama filtresi
    if (searchTerm && searchCategory) {
      const regex = new RegExp(searchTerm, "i");

      if (searchCategory === "title") {
        filter.title = { $regex: regex };
      } else if (searchCategory === "content") {
        filter.description = { $regex: regex };
      } else if (searchCategory === "creator") {
        // createdBy.username bazlı arama
        const users = await User.find({ username: { $regex: regex } }).select("_id");
        filter.createdBy = { $in: users.map((u) => u._id) };
      }
    }

    const totalItems = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy assignedTo department", "username name");

    /* 🔄 Buffer → Base64 */
    const jobsWithBase64 = jobs.map((job) => {
      const obj = job.toObject();
      obj.attachments = obj.attachments.map((att) => ({
        ...att,
        data: att.data ? att.data.toString("base64") : undefined,
      }));
      return obj;
    });

    res.json({
      jobs: jobsWithBase64,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});


// PUT /api/jobs/:id/next-status
router.put("/:id/next-status", requireLogin, requirePermission("change_status"), async (req, res) => {

  const statusOrder = ["OPEN", "ASSIGNED", "IN_PROGRESS", "DONE"];
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const currentIndex = statusOrder.indexOf(job.status);
    const nextStatus = statusOrder[currentIndex + 1];

    if (!nextStatus) {
      return res.status(400).json({ error: "Zaten son durumda" });
    }

    job.status = nextStatus;
    await job.save();

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

router.put("/assign", requireLogin, requirePermission("take_freejobs"), async (req, res) => {
  const { jobId } = req.body;  // id body’de gelcek
  const userId = req.session.user.id;

  if (!jobId) return res.status(400).json({ message: "Job ID lazım." });

  try {
    const updatedJob = await Job.findOneAndUpdate(
      { _id: jobId, assignedTo: null },
      { assignedTo: userId, status: "ASSIGNED" },
      { new: true }
    );

    if (!updatedJob)
      return res.status(400).json({ message: "İş atanmış veya bulunamadı." });

    res.json({ message: "İş başarıyla atandı.", job: updatedJob });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.get("/permissions_name", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user?.id; // veya JWT varsa req.user.id
    if (!userId) return res.status(401).json({ error: "Giriş yapılmamış" });

    const user = await User.findById(userId)
      .populate({
        path: "role",
        populate: { path: "permissions", select: "name" },
      })
      .select("role");

    if (!user || !user.role) {
      return res.status(404).json({ error: "Kullanıcı ya da rol bulunamadı" });
    }

    const permissions = user.role.permissions.map(p => p.name);
    res.json({ permissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "İzinler alınamadı" });
  }
});


router.put("/update_password", requireLogin,  async (req, res) => {
  try {
    // 1. Girdileri al
    const { oldPassword, newPassword} = req.body;
    const userId = req.session.user.id // Middleware'den gelen user ID (veya req.session.user.id)





   
    // PasswordHash alanını getirdiğimizden emin oluyoruz (select: false ise .select('+passwordHash') eklenmeli)
    // .select('+passwordHash') ekleyerek şifreyi açıkça istemelisin
const user = await User.findById(userId).select('+passwordHash');

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // 5. Eski Şifre Kontrolü (KRİTİK GÜVENLİK ADIMI)
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Mevcut şifreniz hatalı." });
    }

    // 6. Eski Şifre ile Yeni Şifrenin Aynılığı Kontrolü
    const isSameAsOld = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSameAsOld) {
      return res.status(400).json({ message: "Yeni şifre eskisiyle aynı olamaz." });
    }

    // 7. Yeni Şifreyi Hashleme
 
    const newHash = await bcrypt.hash(newPassword, 10);

    // 8. Veritabanını Güncelleme
    user.passwordHash = newHash;
    
    // (Opsiyonel) Şifre değiştirme tarihini loglayabilir veya token versiyonunu artırarak
    // diğer cihazlardaki oturumları düşürebilirsiniz.
    // user.tokenVersion += 1; 

    await user.save();



    res.json({ message: "Şifreniz başarıyla güncellendi." });

  } catch (error) {
    console.error("Şifre değiştirme hatası:", error);
    res.status(500).json({ message: "İşlem sırasında bir hata oluştu." });
  }
});
module.exports = router;
