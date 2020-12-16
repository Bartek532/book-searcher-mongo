declare namespace Express {
  interface Request {
    authToken?: Token;
    user?: {
      _id: number;
      rates: string[];
      library: string[];
      name: string;
      email: string;
      password: string;
    };
  }
}
