const express = require("express");
const router = express.Router();
const requirePermission = require("../middlewares/requirepermission.js");
const requireLogin = require("../middlewares/requireLogin.js");
const User = require("../models/Users.js");
const Department = require("../models/Departments.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// İstersen boş da bırakabilirsin ama en azından şöyle olsun:
router.get("/", requireLogin, requirePermission("view_user"), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const { searchCategory, searchTerm } = req.query;

    let filter = {};

    if (searchCategory && searchTerm) {
      const regex = new RegExp(searchTerm, "i");

      if (searchCategory === "username") {
        filter.username = { $regex: regex };
      } else if (searchCategory === "department") {
        // department adı üzerinden filtrelemek için önce departmentları bul
        const departments = await Department.find({ name: { $regex: regex } }).select("_id");
        filter.department = { $in: departments.map(d => d._id) };
      }
    }

    const totalItems = await User.countDocuments(filter);

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("role department", "name");

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Kullanıcılar alınırken hata oluştu" });
  }
});





router.post("/add", requireLogin, requirePermission("add_user"), async (req, res) => {
  const { username, password, department, role } = req.body;
  console.log(req.body);

  if (!username || !password || !department || !role) {
    return res.status(400).json({ message: "Tüm alanlar zorunludur." });
  }

  try {
    // Aynı username varsa engelle
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Bu kullanıcı adı zaten var." });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcıyı oluştur
    const newUser = new User({
      username,
      passwordHash: hashedPassword,
      department,  // ObjectId olarak gönderilmiş olmalı
      role         // ObjectId olarak gönderilmiş olmalı
    });

    await newUser.save();

    res.status(201).json({ message: "Çalışan başarıyla eklendi." });
  } catch (error) {
    console.error("Çalışan eklenirken hata:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

module.exports = router;
