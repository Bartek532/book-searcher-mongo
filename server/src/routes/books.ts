import express from "express";
import { catchAsync } from "../middlewares/errors";
import booksController from "../controllers/booksController";
import { validateToken } from "../middlewares/validateToken";
import {
  validateUser,
  validateRates,
  validateLibrary
} from "../middlewares/validateData";

const router = express.Router();

router.get("/", catchAsync(booksController.getBooks));
router.post("/advancedSearch", catchAsync(booksController.advancedSearch));
router.post("/", validateToken, catchAsync(booksController.createBook));
router.get("/search", catchAsync(booksController.searchBooks));
router.get("/:series", catchAsync(booksController.searchBySeries));
router.get("/book/:slug", catchAsync(booksController.getBook));
router.post(
  "/rate",
  validateToken,
  catchAsync(validateUser),
  catchAsync(validateRates),
  catchAsync(booksController.rateBook)
);
router.post(
  "/bookmark",
  validateToken,
  catchAsync(validateUser),
  catchAsync(validateLibrary)
);

export default router;
