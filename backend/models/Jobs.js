const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  // GridFS/S3 vb. kullanmıyorsan dosyanın kendisini Buffer olarak da saklayabilirsin
  data: Buffer,                          // opsiyonel – büyük dosyalarda önerilmez
  fileId: mongoose.Schema.Types.ObjectId, // GridFS/S3 referansı için
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const jobSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String },

    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Müdür
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },                // Çalışan
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true }, // ↖︎ yeni alan

    status: {
      type: String,
      enum: ["OPEN", "ASSIGNED", "IN_PROGRESS", "DONE", "CANCELLED"],
      default: "OPEN"
    },

    dueDate: { type: Date },

    attachments: [fileSchema]  // ↖︎ her türlü dosyayı tutan alt belge dizisi
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
