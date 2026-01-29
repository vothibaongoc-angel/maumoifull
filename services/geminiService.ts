
import { GoogleGenAI, Type } from "@google/genai";
import { CategoryType, ContentData, MovementData, WeeklyAnalysis, MovementArticle } from "../types";

const WEEKLY_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    week: { type: Type.STRING, description: "Số tuần, ví dụ: 21" },
    date: { type: Type.STRING, description: "Ngày tháng năm, ví dụ: 26/01/2026" },
    topic: { type: Type.STRING, description: "Tên câu chuyện/cuốn sách/tấm gương" },
    presenter: { type: Type.STRING, description: "Họ tên học sinh và lớp" },
    lesson: { type: Type.STRING, description: "Bài học rút ra từ nội dung" },
    feedback: { type: Type.STRING, description: "Lời nhận xét về giọng kể/buổi sinh hoạt" },
    spread: { type: Type.STRING, description: "Thông điệp lan tỏa phong trào" }
  },
  required: ["week", "date", "topic", "presenter", "lesson", "feedback", "spread"]
};

const MOVEMENT_ARTICLE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    introduction: { type: Type.STRING, description: "Đoạn văn giới thiệu tổng hợp ngày, địa điểm, số lượng." },
    detailedContent: { type: Type.STRING, description: "Đoạn văn chi tiết, hấp dẫn dựa trên nội dung cơ bản." },
    significance: { type: Type.STRING, description: "Đoạn văn về ý nghĩa của phong trào." }
  },
  required: ["name", "introduction", "detailedContent", "significance"]
};

// Refactored to create GoogleGenAI instance within each function for best practice
export const analyzeWeeklyImage = async (base64Image: string): Promise<WeeklyAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } },
        { text: "Hãy phân tích hình ảnh buổi sinh hoạt dưới cờ này và viết nội dung cho phong trào 'Mỗi tuần một câu chuyện đẹp, một cuốn sách hay, một tấm gương sáng'. Hãy sáng tạo tên câu chuyện, tên học sinh (nếu không thấy rõ) và bài học nhân văn dựa trên bối cảnh trong ảnh." }
      ]
    },
    config: {
      systemInstruction: "Bạn là Tổng phụ trách Đội. Hãy phân tích ảnh và trả về thông tin chi tiết để đăng bài lên fanpage nhà trường theo đúng format truyền thống của Đội TNTP Hồ Chí Minh.",
      responseMimeType: "application/json",
      responseSchema: WEEKLY_ANALYSIS_SCHEMA
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateMovementArticle = async (data: {
  name: string,
  date: string,
  location: string,
  participants: string,
  content: string
}): Promise<MovementArticle> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tạo bài viết phong trào với thông tin sau:
    Tên phong trào: ${data.name}
    Ngày: ${data.date}
    Địa điểm: ${data.location}
    Số lượng tham gia: ${data.participants}
    Nội dung cơ bản: ${data.content}`,
    config: {
      systemInstruction: `Bạn là Tổng phụ trách Đội chuyên nghiệp. Hãy viết bài đăng fanpage. 
      1. 'introduction': Viết một đoạn văn mượt mà lồng ghép ngày tháng, địa điểm và số lượng tham gia.
      2. 'detailedContent': Phát triển nội dung cơ bản thành một đoạn văn lôi cuốn, truyền cảm hứng.
      3. 'significance': Tự viết một đoạn văn sâu sắc về ý nghĩa và giá trị giáo dục của phong trào này.
      Lưu ý: Chỉ trả về text thuần trong các đoạn văn, KHÔNG kèm icon ở đây (icon sẽ được thêm ở UI).`,
      responseMimeType: "application/json",
      responseSchema: MOVEMENT_ARTICLE_SCHEMA
    }
  });

  const result = JSON.parse(response.text || '{}');
  // Trả về name gốc của user
  return { ...result, name: data.name };
};

const CONTENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    summary: { type: Type.STRING },
    content: { type: Type.STRING },
    imagePrompt: { type: Type.STRING, description: "Mô tả hình ảnh bằng tiếng Anh để tạo hình minh họa" },
    authorOrTarget: { type: Type.STRING },
    lessons: { 
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["title", "summary", "content", "imagePrompt"]
};

const MOVEMENT_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      description: { type: Type.STRING },
      activities: { 
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      impact: { type: Type.STRING }
    },
    required: ["name", "description", "activities", "impact"]
  }
};

export const fetchEducationalContent = async (type: CategoryType): Promise<ContentData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const promptMap = {
    [CategoryType.STORY]: "Hãy viết một câu chuyện đẹp, nhân văn về tình bạn, lòng tốt hoặc sự trung thực dành cho thiếu nhi Việt Nam.",
    [CategoryType.BOOK]: "Hãy giới thiệu một cuốn sách hay phù hợp với lứa tuổi học sinh (VD: Cho tôi xin một vé đi tuổi thơ, Dế Mèn phiêu lưu ký...).",
    [CategoryType.EXAMPLE]: "Hãy giới thiệu một tấm gương sáng (anh hùng trẻ tuổi hoặc học sinh tiêu biểu) vượt khó học giỏi hoặc có hành động dũng cảm.",
    [CategoryType.MOVEMENT]: "Dữ liệu không phù hợp cho phương thức này."
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: promptMap[type],
    config: {
      systemInstruction: "Bạn là một trợ lý giáo dục chuyên viết nội dung truyền cảm hứng cho phong trào Đội Thiếu niên Tiền phong Hồ Chí Minh. Ngôn ngữ: Tiếng Việt.",
      responseMimeType: "application/json",
      responseSchema: CONTENT_SCHEMA
    }
  });

  return JSON.parse(response.text || '{}');
};

export const fetchMovements = async (): Promise<MovementData[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Hãy liệt kê 5 phong trào tiêu biểu của Liên đội trường học hiện nay (VD: Kế hoạch nhỏ, Nghìn việc tốt, Đền ơn đáp nghĩa...).",
    config: {
      systemInstruction: "Bạn là Tổng phụ trách Đội giỏi. Hãy mô tả chi tiết các phong trào hoạt động thiếu nhi tại Việt Nam.",
      responseMimeType: "application/json",
      responseSchema: MOVEMENT_SCHEMA
    }
  });

  return JSON.parse(response.text || '[]');
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: `Cute 2D illustration for children school activity, pastel colors, soft lighting: ${prompt}`,
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  // Iterating through all parts to find the image part as per guidelines
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return 'https://picsum.photos/800/450';
};
