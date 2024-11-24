import express, { NextFunction, Request, Response } from 'express';
import flavorRouter from './routes/flavor';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/', (req: Request, res: Response) => {
  res.send('<h1>Express api app</h1>');
});

// middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  }),
);

// authenticate
const authenticateAPIKey = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const apiKey = req.header('Authorization')?.split(' ')[1]; // "Bearer <API_KEY>"

  if (!apiKey) {
    res.status(401).send('Access denied. No API key provided.');
    return;
  }

  if (apiKey !== process.env.API_KEY) {
    res.status(403).send('Invalid API key.');
    return;
  }

  next();
};

// routing
app.use('/flavor', authenticateAPIKey, flavorRouter);

app.listen(PORT, () =>
  console.log(`Ready! Available at http://localhost:${PORT}`),
);

export default app;
