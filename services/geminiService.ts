
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import type { UploadedImage } from '../types';

const extractImageData = (response: GenerateContentResponse): string | null => {
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    return null;
}

export async function generateA0PosterSeries(
  images: UploadedImage[],
  styleReference: UploadedImage | null,
  studentName: string,
  instructorName: string,
  projectName: string
): Promise<string | null> {
    if (images.length !== 4) {
        throw new Error("Exactly four images are required.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
    You are Studio Poster Builder Pro+, an expert AI layout engine for academic interior design posters at Dar AlUloom University.

    **TASK:**
    Your task is to generate ONE SINGLE, ultra-wide panoramic image. This single image MUST contain FOUR distinct, professional, high-resolution VERTICAL A0 POSTERS arranged side-by-side. The drawings must be inserted EXACTLY as provided, without any alteration.

    **IMPORTANT:**
    The four A0 posters must appear as a cohesive series. The background design MUST be continuous and flow seamlessly across all four posters, visually linking them into one unified composition.

    **CANVAS & LAYOUT:**
    *   **Poster Size:** Each of the four posters must be a VERTICAL A0 size (841 mm x 1189 mm). The aspect ratio is critical.
    *   **Final Output Format:** A single panoramic image with an aspect ratio equivalent to four vertical A0 posters placed next to each other (total aspect ratio would be (4 * 841) : 1189).
    *   **Structure:** The panoramic image is divided into four equal vertical sections. Each section is a complete A0 poster.
    *   **Drawing Placement:** Place exactly one of the four uploaded student drawings into each of the A0 poster sections. Use them in the order provided (image 1 in the first poster on the left, image 2 in the second, and so on).

    **BACKGROUND DESIGN (CRITICAL):**
    ${styleReference 
        ? `*   **Primary Inspiration:** You have been provided with a STYLE REFERENCE image. The entire background design (colors, textures, atmosphere, graphic motifs) MUST be directly inspired by this reference image. Analyze its color palette, material qualities, shadows, and overall mood to create a cohesive and sophisticated background that flows across all four panels.`
        : `*   **Inspiration:** No style reference was provided. You MUST derive the background design inspiration from the four student drawing boards. Analyze their combined color palette, materials, textures, lighting, shadows, and geometric motifs to create a cohesive background that flows across all four panels.`
    }
    *   **Style:** The background must be subtle and academic. Think muted neutral tones, soft gradients, thin architectural linework, gentle curves, translucent layered panels, and subtle shadows. It must unify the four panels into a single, continuous design language.

    **HEADER CONTENT (REPLICATED ON EACH A0 POSTER):**
    The following complete header MUST be perfectly replicated at the top of EACH of the four A0 poster sections. The typography and placement must be identical across all four posters for consistency.
    *   **Top Left (stacked text block):**
        *   Dar AlUloom University
        *   Faculty of Engineering and Digital Design
        *   Interior Design Department
    *   **Top Center / Full-Width (strongest hierarchy):**
        *   Project Name: "${projectName}"
    *   **Top Right (stacked text block):**
        *   Student: ${studentName}
        *   Instructor: ${instructorName}

    **TYPOGRAPHY RULES:**
    *   Use a single, unified, contemporary sans-serif font family throughout.
    *   Ensure strong contrast and legibility for all text.
    *   Maintain a clear typographic hierarchy: Project Name is dominant.

    **BODY CONTENT:**
    *   Place the four uploaded drawing boards, one in each of the four A0 sections, in the order they were provided.
    *   **CRITICAL:** Each uploaded drawing must be rescaled to fill its A0 poster section as much as possible, effectively making each uploaded image a full A0 panel. Scale them uniformly to preserve their aspect ratio. Minimal, proportional cropping is allowed only if absolutely necessary for alignment, but the goal is to present each drawing as a complete A0 board.

    **FINAL OUTPUT:**
    Generate ONE single, ultra-wide, high-resolution image containing the four A0 posters, ready for slicing.
    `;

    const textPart = { text: prompt };
    const imageParts = images.map(image => ({
        inlineData: { data: image.base64, mimeType: image.mimeType }
    }));

    if (styleReference) {
        imageParts.push({
            inlineData: { data: styleReference.base64, mimeType: styleReference.mimeType }
        });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [textPart, ...imageParts] },
        config: { responseModalities: [Modality.IMAGE] },
    });
    
    return extractImageData(response);
}