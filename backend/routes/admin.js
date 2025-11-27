const express = require("express");
const router = express.Router();
const requirePermission = require("../middlewares/requirepermission.js");
const requireLogin = require("../middlewares/requireLogin.js");
const Department = require("../models/Departments");
const User = require("../models/Users.js");
const Job = require("../models/Jobs.js");
const Permissions = require("../models/Permissions.js");

router.get("/getalljobs", requireLogin, requirePermission("get_alljobs"), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const { searchCategory, searchTerm } = req.query;

    let filter = {};

    // 🔍 Arama filtresi
    if (searchTerm && searchCategory) {
      const regex = new RegExp(searchTerm, "i"); // küçük-büyük harf duyarsız

      if (searchCategory === "title") {
        filter.title = { $regex: regex };
      } else if (searchCategory === "content") {
        filter.description = { $regex: regex };
      } else if (searchCategory === "personnel") {
        // assignedTo user'ın username'ine göre filtreleme (nested)
        const users = await User.find({ username: { $regex: regex } }).select("_id");
        filter.assignedTo = { $in: users.map((u) => u._id) };
      }
    }

    const totalItems = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy assignedTo department", "username name");

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




router.delete("/deleteuser/:id", requireLogin, requirePermission("delete_user"), async (req, res) => {


      try {
    const id = req.params.id;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Kuallnıcı Bulunamadı" });
    }
    res.json({ message: "Kullanıcı silindi" });
  } catch (error) {
    console.error("Silme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }


});

router.delete("/deletejob/:id", requireLogin, requirePermission("delete_job"), async (req, res) => {


      try {
    const id = req.params.id;
    const deleted = await Job.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "İş Bulunamadı" });
    }
    res.json({ message: "İş silindi" });
  } catch (error) {
    console.error("Silme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }


});

router.get("/userduzenle/:id", requireLogin, requirePermission("view_user"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("role", "name")
      .populate("department", "name");

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.json(user);
  } catch (err) {
    console.error("Kullanıcı getirme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});


router.put("/duzenle/:id", requireLogin, requirePermission("update_user"), async (req, res) => {
  try {
    const { username, role, department, isActive } = req.body;

    const updateData = {
      username,
      role,
      department,
      isActive,
    };

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.json({ message: "Kullanıcı güncellendi", user: updatedUser });
  } catch (err) {
    console.error("Kullanıcı güncelleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});


router.delete("/deletepermission/:id", requireLogin, requirePermission("delete_permission"), async (req, res) => {


      try {
    const id = req.params.id;
    const deleted = await Permissions.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Yetki Bulunamadı" });
    }
    res.json({ message: "Yetki silindi" });
  } catch (error) {
    console.error("Silme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }


});

router.delete("/deletedepartment/:id", requireLogin, requirePermission("delete_department"), async (req, res) => {
  try {
    const id = req.params.id;
    
    // Önce departmanı bul
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Departman Bulunamadı" });
    }
    
    // Bu departmandaki tüm kullanıcıları sil
    await User.deleteMany({ department: id });
    
    // Departmanı sil
    await Department.findByIdAndDelete(id);
    
    res.json({ message: "Departman ve ilgili kullanıcılar başarıyla silindi" });
  } catch (error) {
    console.error("Silme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});




module.exports = router;