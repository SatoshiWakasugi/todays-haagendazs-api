import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send("<h1>フレーバー</h1>");
});

export default router;
