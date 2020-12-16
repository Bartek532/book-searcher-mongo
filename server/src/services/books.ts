import Book from "../models/Book";
import { Request, Response } from "express";
import formidable from "formidable";
import cloudinary from "cloudinary";
import slugx from "slugx";
import { validateBook } from "../validation";

export const fetchBooks = () => {
  return Book.find();
};

export const fetchBook = (slug: string) => {
  return Book.findOne({ slug });
};

export const fetchBooksByQuery = (query: string) => {
  const books = Book.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });
  return books;
};

export const fetchBooksByFilters = (filters: object) => {
  return Book.find(filters);
};

export const fetchBooksBySeries = (series: string) => {
  return Book.find({ series });
};

export const updateBookRates = async (slug: string, rate: number) => {
  await Book.update({ slug }, { $push: { rates: rate } });
};

export const advancedFetchBooks = (query: {
  name?: string;
  author?: string;
  tags: string[];
}) => {
  let filters = Object.fromEntries(
    Object.entries(query).filter(item => item[1] && item[1].length)
  );
  if (filters.tags) {
    return Book.find({ ...filters, tags: { $all: filters.tags } });
  }
  return Book.find({ ...filters });
};

export const insertBook = async (data: Request, res: Response) => {
  const form = new formidable.IncomingForm();

  form.parse(data, async (err, fields, files) => {
    if (err) {
      throw new Error(err);
    }
    const { error } = validateBook(fields);
    if (error) return res.status(400).json({ message: err.details[0].message });

    const slug = slugx.create(
      fields.name +
        " " +
        (fields.author as string).substring(
          (fields.author as string).lastIndexOf(" ") + 1 || 0
        )
    );

    if (await fetchBook(slug)) {
      return res.status(400).json({ message: "Książka już istnieje." });
    }

    await cloudinary.v2.uploader.upload(
      files.file.path,
      {
        folder: "book_searcher",
        public_id: slug,
        use_filename: true
      },
      async function (error, result) {
        const book = new Book({
          name: fields.name,
          author: fields.author,
          img: result!.secure_url,
          slug: slug,
          room: fields.room,
          place: fields.place,
          series: fields.series,
          rates: [Number(fields.rate)],
          tags: JSON.parse(fields.tags as string),
          description: fields.description
        });

        await book.save();

        res.status(200).send(book);
      }
    );
  });
};
