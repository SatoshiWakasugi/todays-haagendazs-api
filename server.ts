import express, { Request, Response } from 'express';
import flavorRouter from './routes/flavor';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

const PORT = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('<h1>こんにちは</h1>');
});

// routing
app.use('/flavor', flavorRouter);

app.listen(PORT, () => console.log('server start'));
