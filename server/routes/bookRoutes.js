const router = require("express").Router();
const auth = require("../middleware/auth");
const { getBooks, createBook, updateBook, deleteBook } = require("../controllers/bookController");

router.get("/", getBooks); // public read
router.post("/", auth, createBook);
router.put("/:id", auth, updateBook);
router.delete("/:id", auth, deleteBook);

module.exports = router;
