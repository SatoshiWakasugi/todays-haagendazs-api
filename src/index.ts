import express, { Request, Response } from 'express';
import flavorRouter from './routes/flavor';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/', (req: Request, res: Response) => {
  res.send('<h1>Express api app</h1>');
});

// routing
app.use('/flavor', flavorRouter);

app.listen(PORT, () =>
  console.log(`Ready! Available at http://localhost:${PORT}`),
);

export default app;
