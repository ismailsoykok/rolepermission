const express = require("express");
const router = express.Router();
const requirePermission = require("../middlewares/requirepermission.js");
const requireLogin = require("../middlewares/requireLogin.js");
const Permission = require("../models/Permissions");

// GET /departments - tüm departmanları listele
router.get("/", requireLogin , requirePermission("view_permission"), async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json(permissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Yetkiler alınırken hata oluştu" });
  }
});

router.post("/add", requireLogin , requirePermission("add_permission"),  async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Yetki adı gerekli" });
    }

    // Aynı isimde departman var mı kontrol et
    const existing = await Permission.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Bu yetki zaten var" });
    }

    const newPermission = new Permission({ name });
    await newPermission.save();

    res.status(201).json({ message: "Permission başarıyla eklendi", permission: newPermission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Permission eklenirken hata oluştu" });
  }
});


module.exports = router;
