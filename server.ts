import express, { Request, Response } from 'express';
import flavorRouter from './routes/flavor';

const app = express();

const PORT = 3000;

app.get('/', (req: Request, res: Response) => {
  console.log('"hello express');
  res.send('<h1>こんにちは</h1>');
});

// routing
app.use('/flavor', flavorRouter);

app.listen(PORT, () => console.log('server start'));
