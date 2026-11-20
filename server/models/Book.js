const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    author: { type: String, required: true, trim: true, maxlength: 120 },
    year: { type: Number, required: true, min: 1000, max: new Date().getFullYear() + 1 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

bookSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Book", bookSchema);
