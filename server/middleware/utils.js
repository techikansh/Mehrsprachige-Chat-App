import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import * as deepl from 'deepl-node';
import { DEEPL_API_KEY, GROQ_API_KEY } from "../apiKeys.js";



export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied, No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; //userID, email
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name | "Access denied, Invalid token",
    });
  }
};

/*
export async function translateText(text, targetLanguage) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Translate the following text to ${targetLanguage}: "${text}". Do not return anything but the translated text in the response. Not headers or footers like Here is translated text... Only return the translated text. If you don't, I will get fired..`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
*/

// Gemini API call
export async function translateText(text, targetLanguage) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Translate the following text to ${targetLanguage}: "${text}". Do not return anything but the translated text in the response. Not headers or footers like Here is translated text... Only return the translated text. If you don't, I will get fired..`;

  const maxRetries = 3;
  let retryCount = 0;
  const baseDelay = 2000; // 2 seconds in milliseconds

  while (retryCount < maxRetries) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error(`Gemini Translation Error: ${error.message}`);
      
      if (retryCount === maxRetries - 1) {
        throw new Error('Maximum retry attempts reached');
      }

      const delay = baseDelay * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      retryCount++;
    }
  }
}

// Groq API
/*
const groq_api_key = GROQ_API_KEY;
console.log("groq api key:", groq_api_key);
const groq = new Groq({
  apiKey: groq_api_key,
});

export async function callGroq(text, targetLanguage) {
  const prompt = `Translate the following text to ${targetLanguage}: "${text}". Do not return anything but the translated text in the response. Not headers or footers like Here is translated text... Only return the translated text. If you don't, I will get fired..`;
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1024,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
}
*/

const groq_api_key = GROQ_API_KEY;
console.log("groq api key:", groq_api_key);
const groq = new Groq({
  apiKey: groq_api_key,
});

export async function callGroq(text, targetLanguage) {
  const maxRetries = 3;
  let retryCount = 0;
  const baseDelay = 2000; // 2 seconds in milliseconds

  const prompt = `Translate the following text to ${targetLanguage}: "${text}". Do not return anything but the translated text in the response. Not headers or footers like Here is translated text... Only return the translated text. If you don't, I will get fired..`;

  while (retryCount < maxRetries) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 1024,
      });

      return completion.choices[0].message.content;

    } catch (error) {
      console.error(`Groq Translation Error (Attempt ${retryCount + 1}/${maxRetries}):`, error.message);
      
      if (retryCount === maxRetries - 1) {
        throw new Error('Maximum retry attempts reached for Groq translation');
      }

      const delay = baseDelay * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      retryCount++;
    }
  }
}





//DeepL API
/*
const translator = new deepl.Translator(DEEPL_API_KEY);

export async function callDeepL(text, targetLanguage) {

  //caitalise the target language
  targetLanguage = targetLanguage.toUpperCase();
  if (targetLanguage === "EN") {
    targetLanguage = "EN-GB";
  }

  // Translate text
  try {
    const result = await translator.translateText(
      text,
      null, // Auto-detect source language
      targetLanguage
    );
    return result.text;
  } catch (error) {
    console.error("DeepL API Error:", error);
    throw error;
  }
}
*/
const translator = new deepl.Translator(DEEPL_API_KEY);

export async function callDeepL(text, targetLanguage) {
  const maxRetries = 3;
  let retryCount = 0;
  const baseDelay = 2000; // 2 seconds in milliseconds

  // Capitalize the target language
  targetLanguage = targetLanguage.toUpperCase();
  if (targetLanguage === "EN") {
    targetLanguage = "EN-GB";
  }

  while (retryCount < maxRetries) {
    try {
      const result = await translator.translateText(
        text,
        null, // Auto-detect source language
        targetLanguage
      );
      return result.text;

    } catch (error) {
      // Handle specific DeepL errors differently
      if (error instanceof deepl.exceptions.QuotaExceededException) {
        console.error("DeepL quota exceeded - stopping retries");
        throw error;
      }

      console.error(`DeepL Translation Error (Attempt ${retryCount + 1}/${maxRetries}):`, error.message);
      
      if (retryCount === maxRetries - 1) {
        throw new Error('Maximum retry attempts reached for DeepL translation');
      }

      const delay = baseDelay * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      retryCount++;
    }
  }
}
