import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { todaysFlavor } from '../prompts/todaysFlavor';

const router = express.Router();

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const GEMINI_MODEL_NAME = 'gemini-1.5-flash';

const scrapingBaseHeader = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  Referer: process.env.TARGET_DOMAIN,
};

const fetchGeminiWithRetry = async (products: unknown[], mood: string) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 1,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
  };

  const result = await model.generateContent({
    generationConfig,
    contents: [
      {
        role: 'user',
        parts: [todaysFlavor(products, mood)],
      },
    ],
  });

  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const { response } = result;
      if (response) {
        return response.text();
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      attempts++;
      console.error({
        error: error,
        message: `Attempt ${attempts} failed. Retrying...`,
      });
      if (attempts >= MAX_RETRIES) {
        throw new Error('Failed to generate flavor after multiple attempts');
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

const fetchProducts = async () => {
  try {
    const { data } = await axios.get(
      `${process.env.TARGET_DOMAIN}${process.env.TARGET_PATH}`,
      {
        headers: scrapingBaseHeader,
      },
    );

    const $ = cheerio.load(data);

    const element = $(process.env.TARGET_ELE);
    const productsListJson = element.attr(process.env.ELE_ATRR || '');

    if (productsListJson) {
      const jsonResponse = await axios.get(
        `${process.env.TARGET_DOMAIN}${productsListJson}`,
        {
          headers: scrapingBaseHeader,
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const products = jsonResponse.data.products?.map((item: any) => {
        return {
          name: item.nameJa,
          url: item.url,
          image: item.image,
          category: item.categoryJa,
          flavor: item.flavor,
          releaseDate: item.releaseDate,
          releaseState: item.releaseState,
          attribute: item.attribute,
        };
      });

      return products;
    } else {
      console.error('JSON URL not found');
    }

    return;
  } catch (error) {
    console.error(error);
  }
};

router.get('/', async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) return;

    const mood = req.query.mood as string | undefined;

    const products = await fetchProducts();

    const flavor = await fetchGeminiWithRetry(products, mood || '普通の気分');

    console.log(flavor);

    res.status(200).json({
      flavor,
    });
  } catch (error) {
    console.error('Error occurred while generating:', error);

    res.status(500).json({
      error,
    });
  }
});

export default router;
