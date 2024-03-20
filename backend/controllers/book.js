const Book = require("../models/Books");
const fs = require("fs");
const path = require("path");

exports.createBook = async (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = await new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${path.parse(req.file.originalname).name}.webp`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.bookRating = async (req, res, next) => {
  const bookId = req.params.id;
  const { userId, rating } = req.body;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: "La note doit être comprise entre 0 et 5" });
  }

  try {
    const book = Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ error: "Livre non trouvé !" });
    }

    const ratingIndex = book.ratings.findIndex((rating) => rating.userId == req.auth.userId);

    if (ratingIndex !== -1) {
      return res.status(400).json({ error: "Déjà noté" });
    } else {
      book.ratings.push({ userId, grade: rating });
    }

    const totalRating = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
    book.averageRating = (totalRating / book.ratings.length).toFixed(1);

    await book.save();
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getBestBooks = async (req, res) => {
  const bestBooks = [
    {
      $project: {
        title: 1,
        imageUrl: 1,
        author: 1,
        year: 1,
        genre: 1,
        averageRating: { $avg: "$ratings.grade" },
      },
    },
    { $sort: { averageRating: -1 } },
    { $limit: 3 },
  ];

  try {
    const books = await Book.aggregate(bestBooks);
    return res.json(books);
  } catch (error) {
    return res.status(400).json({ error });
  }
};

exports.modifyBook = async (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${path.parse(req.file.originalname).name}.webp`,
      }
    : { ...req.body };

  delete bookObject._userId;
  await Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = async (req, res, next) => {
  await Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneBook = async (req, res, next) => {
  await Book.findOne({
    _id: req.params.id,
  })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.getAllBooks = async (req, res, next) => {
  await Book.find()
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};
