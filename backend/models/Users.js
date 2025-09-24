const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username:    { type: String, required: true, unique: true },
    passwordHash :{ type: String, required: true },

    role:        { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    department:  { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },

    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
