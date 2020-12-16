import jwt from "jsonwebtoken";
import User from "../models/User";
import Book from "../models/Book";
import { Request, Response, NextFunction } from "express";

export const validateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id } = jwt.decode(req.authToken) as { _id: string; iat: number };

  const user = (await User.findOne({ _id })) as any;

  if (!user) {
    return res.status(400).json({ message: "Nie znaleziono użytkownika." });
  }

  req.user = user;
  next();
};

export const validateRates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.slug && req.body.rate) {
    if (req.user!.rates.includes(req.body.slug)) {
      return res.status(400).json({ message: "Już oceniałeś tą książkę!" });
    }
    await User.update(
      { _id: req.user!._id },
      { $push: { rates: req.body.slug } }
    );
    next();
  } else {
    return res.status(400).json({ message: "Błędne dane." });
  }
};

export const validateLibrary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user!.library.includes(req.body.slug)) {
    return res
      .status(400)
      .json({ message: "Już masz tą książkę w bibliotece." });
  }

  await User.update(
    { _id: req.user!._id },
    { $push: { library: req.body.slug } }
  );

  res.status(200).json({ message: "Dodano do biblioteki." });
};

export const validateFilters = ({ query }: Request) => {
  const availableFilters = Object.keys(Book.schema.paths);
  return Object.fromEntries(
    Object.entries(query).filter(item => availableFilters.indexOf(item[0]) > -1)
  );
};
