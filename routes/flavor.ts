import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { todaysFlavor } from '@/prompts/todaysFlavor';

const router = express.Router();

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const fetchFlavorWithRetry = async (
  apiKey: string,
  retries: number = MAX_RETRIES,
) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
  };

  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: 'user',
        parts: [todaysFlavor],
      },
    ],
  });

  let attempts = 0;

  while (attempts < retries) {
    try {
      const response = await chatSession.sendMessage('');
      if (response && response.response && response.response.text) {
        console.log(response.response.text());
        return response.response.text();
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      attempts++;
      console.error({
        error: error,
        message: `Attempt ${attempts} failed. Retrying...`,
      });
      if (attempts >= retries) {
        throw new Error('Failed to generate flavor after multiple attempts');
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS)); // Retry after delay
    }
  }
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return;

    const flavor = await fetchFlavorWithRetry(apiKey);

    res.status(200).json({
      flavor: flavor || 'フレーバーの取得に失敗しました',
    });
  } catch (error) {
    console.error('Error occurred while generating flavor:', error);

    res.status(500).json({
      error,
    });
  }
});

export default router;
