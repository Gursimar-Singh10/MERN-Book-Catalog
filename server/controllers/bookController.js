const Book = require("../models/Book");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const maxYear = () => new Date().getFullYear() + 1;

function validateBook({ title, author, year }) {
  if (!String(title || "").trim()) return "Title is required";
  if (!String(author || "").trim()) return "Author is required";
  const y = Number(year);
  if (!Number.isInteger(y) || y < 1000 || y > maxYear()) return `Year must be a whole number between 1000 and ${maxYear()}`;
  return null;
}

// GET /api/books?page=1&limit=5&search=martin  (public)
exports.getBooks = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 5, 1), 50);
    const search = String(req.query.search || "").trim();

    // Empty search -> empty filter -> every book.
    const filter = search
      ? {
          $or: [
            { title: { $regex: escapeRegex(search), $options: "i" } },
            { author: { $regex: escapeRegex(search), $options: "i" } },
          ],
        }
      : {};

    // Page and count share one filter, so totalPages follows the search.
    const [data, totalItems] = await Promise.all([
      Book.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Book.countDocuments(filter),
    ]);

    res.json({ success: true, data, page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not load books" });
  }
};

exports.createBook = async (req, res) => {
  const problem = validateBook(req.body);
  if (problem) return res.status(400).json({ success: false, message: problem });
  try {
    const book = await Book.create({
      title: req.body.title,
      author: req.body.author,
      year: Number(req.body.year),
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not create book" });
  }
};

exports.updateBook = async (req, res) => {
  const problem = validateBook(req.body);
  if (problem) return res.status(400).json({ success: false, message: problem });
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, author: req.body.author, year: Number(req.body.year) },
      { new: true, runValidators: true }
    );
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    res.json({ success: true, data: book });
  } catch (err) {
    const bad = err.name === "CastError";
    res.status(bad ? 400 : 500).json({ success: false, message: bad ? "Invalid book ID" : "Could not update book" });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    res.json({ success: true, message: "Book deleted" });
  } catch (err) {
    const bad = err.name === "CastError";
    res.status(bad ? 400 : 500).json({ success: false, message: bad ? "Invalid book ID" : "Could not delete book" });
  }
};
