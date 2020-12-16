import { NextFunction, Request, Response } from "express";
import { validateLogin, validateRegister } from "../validation";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUser, updateUser } from "../services/users";
import { sendMail } from "../middlewares/sendEmail";

const passwordRegex = /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export default {
  async login(req: Request, res: Response) {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const user = (await findUser(req.body.email)) as any;
    if (!user) {
      return res
        .status(400)
        .json({ message: "Wygląda, że nie masz jeszcze konta, załóż je!" });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: "Aktywuj swoje konto!" });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(401).json({ message: "Błędne hasło." });
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.SECRET_TOKEN as string
    );

    res
      .header("Set-Cookie", `token=${token}; path=/; httpOnly; SameSite=Lax`)
      .json({ message: "Zalogowano" });
  },

  async register(req: Request, res: Response) {
    const { error } = validateRegister(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const isUserExists = (await findUser(req.body.email)) as any;
    if (isUserExists) {
      return res.status(409).json({ message: "Konto już istnieje." });
    }

    if (!passwordRegex.test(req.body.password)) {
      return res.status(400).json({
        message: "Hasło nie spełnia wymagań."
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });

    const data = {
      name: req.body.name,
      email: req.body.email,
      address: `https://book-searcherv1.herokuapp.com/auth/activate/${user._id}`
    };

    try {
      await sendMail(data, req);
      await user.save();
      return res.status(200).send(user);
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json({ message: "Oops, coś poszło nie tak, spróbuj ponownie." });
    }
  },
  logout(req: Request, res: Response) {
    res.status(200).clearCookie("token").json({ message: "Wylogowano!" });
  },
  async activateAccount(req: Request, res: Response) {
    const user = (await User.findOne({ _id: req.body.id })) as any;

    if (!user) {
      return res.status(404).json({ message: "Nie znaleziono użytkownika. " });
    }

    if (user.isActive) {
      return res
        .status(400)
        .json({ message: "Twoje konto zostało już aktywowane, zaloguj się!" });
    }

    await updateUser(req.body.id, "isActive", true);

    res.status(200).json({ message: "Twoje konto zostało aktywowane!" });
  }
};
