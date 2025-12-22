import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function fetchPageContent(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove script and style elements
        $('script, style, nav, header, footer, aside').remove();

        // Get main content
        const mainContent = $('main, article, .recipe, .content, body').first().text();

        // Clean up whitespace
        return mainContent.replace(/\s+/g, ' ').trim().slice(0, 8000);
    } catch (error) {
        console.error('Error fetching page:', error);
        throw new Error('Failed to fetch page content');
    }
}

const RECIPE_EXTRACTION_PROMPT = `You are a recipe extraction assistant. Extract recipe information from the provided content and return it in the following JSON format. Be precise and thorough.

{
  "title": "Recipe title",
  "description": "A brief description of the dish (2-3 sentences)",
  "mealTypes": ["array of applicable meal types from: breakfast, lunch, dinner, snack, dessert"],
  "ingredients": [
    {"name": "ingredient name", "amount": "quantity", "unit": "measurement unit"}
  ],
  "instructions": ["Step 1...", "Step 2...", "..."],
  "prepTime": number (in minutes),
  "cookTime": number (in minutes),
  "servings": number,
  "calories": number (estimated calories per serving, can be null if unknown),
  "tags": ["tag1", "tag2", "..."]
}

Important:
- For mealTypes, include ALL applicable types. A recipe can be suitable for multiple meals (e.g., ["lunch", "dinner"])
- For ingredients, separate the name from the amount and unit
- Instructions should be clear, numbered steps
- Estimate times if not explicitly stated
- Estimate calories per serving based on ingredients if not provided
- Include relevant tags (cuisine type, dietary info, etc.)
- If information is missing, make reasonable estimates
- Always return valid JSON`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, content } = body;

        if (!content) {
            return NextResponse.json(
                { success: false, error: 'Content is required' },
                { status: 400 }
            );
        }

        let textContent = content;

        // If it's a URL, fetch the page content
        if (type === 'url') {
            try {
                textContent = await fetchPageContent(content);
            } catch {
                return NextResponse.json(
                    { success: false, error: 'Failed to fetch content from URL' },
                    { status: 400 }
                );
            }
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: RECIPE_EXTRACTION_PROMPT,
                },
                {
                    role: 'user',
                    content: `Extract the recipe information from the following content:\n\n${textContent}`,
                },
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0]?.message?.content;

        if (!responseText) {
            throw new Error('No response from AI');
        }

        const recipeData = JSON.parse(responseText);

        return NextResponse.json({ success: true, data: recipeData });
    } catch (error) {
        console.error('Error extracting recipe:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to extract recipe information' },
            { status: 500 }
        );
    }
}
