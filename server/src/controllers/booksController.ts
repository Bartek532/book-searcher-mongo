import { Request, Response } from "express";
import {
  fetchBooks,
  fetchBook,
  fetchBooksByQuery,
  fetchBooksByFilters,
  fetchBooksBySeries,
  updateBookRates,
  advancedFetchBooks,
  insertBook
} from "../services/books";
import { validateFilters } from "../middlewares/validateData";

export default {
  async getBooks(req: Request, res: Response) {
    res.status(200).send(await fetchBooks());
  },

  async getBook(req: Request, res: Response) {
    res.status(200).send(await fetchBook(req.params.slug));
  },

  async searchBooks(req: Request, res: Response) {
    if (req.query.q) {
      const data = await fetchBooksByQuery(req.query.q as string);
      res.status(200).send(data);
    } else {
      const data = await fetchBooksByFilters({ ...validateFilters(req) });
      res.status(200).send(data);
    }
  },
  async searchBySeries(req: Request, res: Response) {
    res.status(200).send(await fetchBooksBySeries(req.params.series));
  },

  async rateBook(req: Request, res: Response) {
    if (
      typeof req.body.rate !== "number" ||
      req.body.rate > 6 ||
      req.body.rate < 1
    ) {
      return res.status(400).json({ message: "Niepoprawna wartość." });
    }
    await updateBookRates(req.body.slug, req.body.rate);
    res.status(200).json({ message: "Dziękujemy za opinię!" });
  },
  async advancedSearch(req: Request, res: Response) {
    const query = {
      name: req.body.name,
      author: req.body.author,
      tags: req.body.tags
    };
    res.status(200).send(await advancedFetchBooks(query));
  },
  async createBook(req: Request, res: Response) {
    await insertBook(req, res);
  }
};
