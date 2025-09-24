const express = require("express");
const router = express.Router();
const requirePermission = require("../middlewares/requirepermission.js");
const requireLogin = require("../middlewares/requireLogin.js");
const Role = require("../models/Roles");
const Permission = require("../models/Permissions");

router.get("/", requireLogin, requirePermission("view_role"), async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Roller alınırken hata oluştu" });
  }
});

router.post("/add", requireLogin, requirePermission("add_role"), async (req,res) => {
  try {
    const { name, permissions } = req.body;

    // ---- Basit doğrulamalar ------------------------------
    if (!name) {
      return res.status(400).json({ message: "Rol adı zorunludur." });
    }
    if (!Array.isArray(permissions)) {
      return res
        .status(400)
        .json({ message: "permissions alanı dizi olmalıdır." });
    }

    // ---- Aynı isimli rol var mı? --------------------------
    const existing = await Role.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: "Bu rol zaten mevcut." });
    }

    // ---- İzin ID’leri gerçekten var mı? -------------------
    const permDocs = await Permission.find({
      _id: { $in: permissions },
    }).select("_id");
    if (permDocs.length !== permissions.length) {
      return res
        .status(400)
        .json({ message: "Geçersiz izin ID’leri gönderildi." });
    }

    // ---- Rolü oluştur ------------------------------------
    const role = await Role.create({ name, permissions });
    return res.status(201).json(role); // ↩︎ frontend’e yeni rolü döner
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      // benzersiz alan ihlali (unique:true)
      return res.status(409).json({ message: "Bu rol zaten mevcut." });
    }
    return res.status(500).json({ message: "Sunucu hatası." });
  }



});




module.exports = router;
