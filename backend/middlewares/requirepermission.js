const Permission = require("../models/Permissions");

function requirePermission(permissionName) {
  return async (req, res, next) => {
    if (!req.session?.user?.permissions) {
      return res.status(403).json({ message: "Yetkisiz erişim." });
    }

    try {
      const permission = await Permission.findOne({ name: permissionName });
      if (!permission) return res.status(403).json({ message: "İzin bulunamadı." });

      const permId = permission._id.toString();
      const userPermIds = req.session.user.permissions.map(id => id.toString());

      if (!userPermIds.includes(permId)) {
        return res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok." });
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Sunucu hatası." });
    }
  };
}




module.exports = requirePermission;