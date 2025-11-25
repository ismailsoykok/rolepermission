const express = require("express");
const router = express.Router();
const requirePermission = require("../middlewares/requirepermission.js");
const requireLogin = require("../middlewares/requireLogin.js");
const Department = require("../models/Departments");
const User = require("../models/Users.js");
const Job = require("../models/Jobs.js");
// şimdilik boş route, ya da bir örnek:
router.get("/my-employees", requireLogin, requirePermission("view_employees"), async (req, res) => {
  try {
      console.log("Session user:", req.session.user);  // Buraya bak
  if (!req.session.user || !req.session.user.department) {
    return res.status(400).json({ message: "Departman bilgisi bulunamadı." });
  }
    // session.user objesinde departman id var
    const managerDepartmentId = req.session.user.department;

    if (!managerDepartmentId) {
      return res.status(400).json({ message: "Departman bilgisi bulunamadı." });
    }

    const employees = await User.find(
      { department: managerDepartmentId },
      "_id username"
    );

    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Çalışanlar getirilemedi." });
  }
});

const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/add", upload.single("file"), requireLogin, requirePermission("add_jobs"), async (req, res) => {
  const { title, description, assignedTo } = req.body;
  
  // assignedTo boş string ise null'a çevir
  const finalAssignedTo = assignedTo && assignedTo.trim() !== "" ? assignedTo : null;
  
  const job = new Job({
    title,
    description,
    assignedTo: finalAssignedTo,
    department: req.session.user.department,
    createdBy: req.session.user.id,
    // Eğer birine atanmışsa ASSIGNED, atanmamışsa OPEN
    status: finalAssignedTo ? "ASSIGNED" : "OPEN",
    attachments: req.file ? [{
      data: req.file.buffer,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    }] : []
  });
  await job.save();
  res.status(201).json({ message: "Job created." });
});


router.get("/jobs", requireLogin, requirePermission("get_jobs"), async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const { searchCategory, searchTerm } = req.query;

    // Mevcut filtreler: kullanıcı department ve createdBy
    let filter = {
      department: req.session.user.department,
      createdBy:  req.session.user.id
    };

    // 🔍 Arama filtresi
    if (searchTerm && searchCategory) {
      const regex = new RegExp(searchTerm, "i"); // case insensitive regex

      if (searchCategory === "title") {
        filter.title = { $regex: regex };
      } else if (searchCategory === "content") {
        filter.description = { $regex: regex };
      } else if (searchCategory === "personnel") {
        // assignedTo user'ın username'ine göre filtreleme
        const users = await User.find({ username: { $regex: regex } }).select("_id");
        filter.assignedTo = { $in: users.map(u => u._id) };
      }
    }

    const totalItems = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy assignedTo department", "username name");

    // Buffer → Base64 dönüşümü
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



router.delete("/deletejob/:id", requireLogin, requirePermission("delete_job"), async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session.user?.id;  // sessionda user varsa id'sini al
// veya req.session.user._id olabilir

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "İş bulunamadı" });
    }



    if (job.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "Bu işi silme yetkiniz yok" });
    }

    await Job.findByIdAndDelete(id);
    res.json({ message: "İş silindi" });
  } catch (error) {
    console.error("Silme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});



module.exports = router;
