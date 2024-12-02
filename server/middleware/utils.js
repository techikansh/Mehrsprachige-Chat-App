import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";


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

export async function translateText(text, targetLanguage) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Translate the following text to ${targetLanguage}: "${text}". Do not return anything but the translated text in the response. Not headers or footers like Here is translated text... Only return the translated text. If you don't, I will get fired..`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
