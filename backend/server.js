require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Permission = require("./models/Permissions");
const Role = require("./models/Roles");
const Department = require("./models/Departments");
const User = require("./models/Users");
const Job = require("./models/Jobs");

const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // frontend adresi
  credentials: true, // cookie gönderebilmek için
}));

// ✅ Session yapılandırması
app.use(session({
  secret: 'ismail_soykok',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1:27017/crm" }),
  cookie: {
    secure: false,      // HTTPS yoksa false
    maxAge: 1000 * 60 * 60,
    sameSite: "lax"     // cross-origin durumuna göre ayarla
  }
}));


const JWT_SECRET = process.env.JWT_SECRET || "sifre";

// ✅ MongoDB Bağlantısı
mongoose
  .connect("mongodb://127.0.0.1:27017/crm", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB'ye bağlandı"))
  .catch((err) => {
    console.error("MongoDB bağlantı hatası:", err);
    process.exit(1);
  });

// ✅ Routerlar
app.use("/departments", require("./routes/departments"));
app.use("/manager", require("./routes/manager"));
app.use("/worker", require("./routes/worker"));
app.use("/permission", require("./routes/permission"));
app.use("/role", require("./routes/role"));
app.use("/user", require("./routes/user"));
app.use("/admin", require("./routes/admin"));





// ✅ Login Route (hem JWT hem session)
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Kullanıcı adı ve şifre gerekli" });

    const user = await User.findOne({ username }).populate("role");
    if (!user)
      return res.status(401).json({ message: "Kullanıcı bulunamadı veya şifre yanlış" });

    // ❌ Pasif kullanıcı kontrolü
    if (!user.isActive)
      return res.status(403).json({ message: "Bu kullanıcı pasif. Giriş izni yok." });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: "Kullanıcı bulunamadı veya şifre yanlış" });

    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role.name,
      permissions: user.role.permissions,
      department: user.department
    };

    console.log("Session user:", req.session.user);

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role.name },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      message: "Giriş başarılı",
      token,
      user: req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});


// ✅ Logout Route (session silme)
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Oturum sonlandırılamadı" });
    res.clearCookie("connect.sid");
    res.json({ message: "Çıkış başarılı" });
  });
});



// ✅ Sunucuyu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`${PORT} portunda çalışıyor`));
