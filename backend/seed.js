const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/Users");
const Role = require("./models/Roles");
const Department = require("./models/Departments");

async function adminKullaniciEkle() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/crm", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB bağlantısı kuruldu - Admin kullanıcı ekleniyor...");

    const adminRol = await Role.findOne({ name: "admin" });
    if (!adminRol) throw new Error("Admin rolü bulunamadı!");

    const itDepartman = await Department.findOne({ name: "Bilgi Teknolojileri" });
    if (!itDepartman) throw new Error("Bilgi Teknolojileri departmanı bulunamadı!");

    const sifreHash = await bcrypt.hash("123456", 10);

    const mevcutAdmin = await User.findOne({ username: "admin" });
    if (mevcutAdmin) {
      console.log("Admin kullanıcı zaten mevcut.");
    } else {
      await User.create({
        username: "admin",
        passwordHash: sifreHash,
        role: adminRol._id,
        department: itDepartman._id,
        isActive: true,
      });
      console.log("Admin kullanıcı başarıyla eklendi.");
    }
  } catch (hata) {
    console.error("Hata oluştu:", hata);
  } finally {
    await mongoose.disconnect();
  }
}

adminKullaniciEkle();
