const express = require("express");
const router = express.Router();
const requirePermission = require("../middlewares/requirepermission.js");
const requireLogin = require("../middlewares/requireLogin.js");
const Department = require("../models/Departments");

// GET /departments - tüm departmanları listele
router.get("/", requireLogin , requirePermission("view_department"),async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Departmanlar alınırken hata oluştu" });
  }
});

router.post("/add", requireLogin , requirePermission("add_department"),async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Departman adı gerekli" });
    }

    // Aynı isimde departman var mı kontrol et
    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Bu isimde departman zaten var" });
    }

    const newDepartment = new Department({ name });
    await newDepartment.save();

    res.status(201).json({ message: "Departman başarıyla eklendi", department: newDepartment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Departman eklenirken hata oluştu" });
  }
});


module.exports = router;
