const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const updateImage = require("../middleware/sharp")

const bookCtrl = require("../controllers/book");

router.post("/", auth, multer, updateImage, bookCtrl.createBook);
router.post('/:id/rating', auth, bookCtrl.bookRating);
router.get('/bestrating', bookCtrl.getBestBooks);
router.put('/:id', auth, multer, updateImage, bookCtrl.modifyBook)
router.delete("/:id", auth, bookCtrl.deleteBook);
router.get("/:id", bookCtrl.getOneBook);
router.get("/", bookCtrl.getAllBooks);

module.exports = router;
