import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractInBodyData(fileBase64: string, mimeType: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("未配置 Gemini API Key");
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview', // Use pro preview for high accuracy data extraction
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType
            }
          },
          {
            text: "Please extract the InBody test results from this document. Return ONLY valid JSON representing the data. Ensure the date is accurately extracted."
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "YYYY-MM-DD format, usually at the top right of the paper/report" },
          weight: { type: Type.NUMBER, description: "体重 Weight (kg)" },
          muscle: { type: Type.NUMBER, description: "骨骼肌 SMM (kg)" },
          fat: { type: Type.NUMBER, description: "体脂肪量 Body Fat Mass (kg)" },
          bmi: { type: Type.NUMBER, description: "BMI" },
          fatPercent: { type: Type.NUMBER, description: "体脂百分比 PBF (%)" },
          score: { type: Type.NUMBER, description: "InBody评分 InBody Score (out of 100)" },
          tbw: { type: Type.NUMBER, description: "身体中含水量 / 身体总水分 Total Body Water (L)" },
          protein: { type: Type.NUMBER, description: "蛋白质 Protein (kg)" },
          minerals: { type: Type.NUMBER, description: "无机盐 Minerals (kg)" },
          whr: { type: Type.NUMBER, description: "腰臀比 Waist-Hip Ratio" },
          visceralFat: { type: Type.NUMBER, description: "内脏脂肪等级/级别 Visceral Fat Level" },
          ffm: { type: Type.NUMBER, description: "去脂体重 Fat Free Mass (kg)" },
          bmr: { type: Type.NUMBER, description: "基础代谢率 BMR (kcal)" },
          obesityDegree: { type: Type.NUMBER, description: "肥胖度 Obesity Degree (%)" },
          smi: { type: Type.NUMBER, description: "SMI (kg/m²), usually in the research parameters section" },
          calorieIntake: { type: Type.NUMBER, description: "建议的热量摄入 Recommended Calorie Intake (kcal)" }
        },
        required: ["date", "weight", "muscle", "fat"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("API returned empty text");
  
  return JSON.parse(text);
}
