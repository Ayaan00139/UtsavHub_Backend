const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY 
});

const SYSTEM_PERSONA = `You are an expert Document OCR and Identity Verification AI specializing in Indian Aadhaar cards.
Extract identity details accurately from the card image(s).
Rules:
1. Extract ONLY visible text. Do NOT guess or hallucinate.
2. If any field is unreadable, blurred, or missing, return null for that field.
3. If both front and back are provided, merge details: front has Name, DOB, Gender, and 12-digit number; back has Address.
4. Extract English text for name and address.
5. Return pure 12 digits for Aadhaar card number (e.g. 543289104721).
6. Output raw JSON only.
7.If a url is "nopic.jpg" avoid that and move to the next url
`;

const EXTRACTION_PROMPT = `Extract the citizen details from the provided Aadhaar image(s) into this exact JSON structure:
{
  "citizenName": "Full Name in English or null",
  "citizenDob": "YYYY-MM-DD or DD/MM/YYYY or null",
  "citizenGender": "Male" | "Female" | "Other" | null,
  "citizenAcardno": "12-digit number without spaces or null",
  "citizenAddress": {
    "fullAddress": "Full street and locality address or null",
    "city": "City or District or null",
    "state": "State or null",
    "pincode": "6-digit PIN code or null"
  },
  "confidenceScore": 0.95
}`;


async function CallAi(imgUrls, userPrompt = EXTRACTION_PROMPT) {
    try {
        console.log(imgUrls)
        imgUrls = imgUrls.filter(url => url !== "nopic.jpg");
        console.log(imgUrls); 
        const urlList = Array.isArray(imgUrls) ? imgUrls : [imgUrls];

        // Fetch each Cloudinary image and convert to base64 inlineData
        const imageParts = [];
        for (const url of urlList) {
            if (!url) continue;
            const imageResp = await fetch(url).then((response) => response.arrayBuffer());
            const base64Image = Buffer.from(imageResp).toString("base64");

            imageParts.push({
                inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg",
                },
            });
        }

        if (imageParts.length === 0) {
            throw new Error("No images available to send to AI");
        }

        // Pass userPrompt and all image parts together
        const result = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite", 
            contents: [
                userPrompt,
                ...imageParts // Spreads both front and back images
            ],
            config: {
                systemInstruction: SYSTEM_PERSONA,
                responseMimeType: "application/json",
                temperature: 0.1,
            },
        });

        console.log("Raw Response from Gemini:", result.text);

        const jsonData = JSON.parse(result.text);
        return jsonData;
    } catch (err) {
        console.error("AI Extraction Error:", err);
        throw err;
    }
}

module.exports = { CallAi };