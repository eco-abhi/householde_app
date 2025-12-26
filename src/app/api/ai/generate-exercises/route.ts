import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { prompt, memberId, dayOfWeek } = await request.json();

        if (!prompt || !memberId || !dayOfWeek) {
            return NextResponse.json(
                { success: false, error: 'Prompt, memberId, and dayOfWeek are required' },
                { status: 400 }
            );
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a professional fitness trainer. Generate workout exercises based on the user's request.
                    
Return ONLY a valid JSON array of exercises with this exact structure:
[
  {
    "name": "Exercise name",
    "bodyPart": "chest|back|legs|shoulders|arms|abs|cardio|full_body",
    "sets": 3,
    "reps": "10-12",
    "weight": "50 lbs",
    "duration": "30 min",
    "notes": "Additional notes"
  }
]

Rules:
- bodyPart MUST be one of: chest, back, legs, shoulders, arms, abs, cardio, full_body
- sets should be a number (2-5 typically)
- reps can be a range like "10-12" or single number like "10"
- weight is optional, include unit (lbs/kg)
- duration is optional, mainly for cardio (e.g., "30 min", "5 km")
- notes are optional tips or form cues
- Generate 3-8 exercises depending on the request
- Mix compound and isolation exercises appropriately
- Consider rest times and proper workout structure

Return ONLY the JSON array, no other text.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            return NextResponse.json(
                { success: false, error: 'No response from AI' },
                { status: 500 }
            );
        }

        // Parse the JSON response
        let exercises;
        try {
            exercises = JSON.parse(content);
        } catch (parseError) {
            console.error('Failed to parse AI response:', content);
            return NextResponse.json(
                { success: false, error: 'Failed to parse AI response' },
                { status: 500 }
            );
        }

        // Validate and add member and dayOfWeek to each exercise
        const validatedExercises = exercises.map((exercise: any, index: number) => ({
            member: memberId,
            dayOfWeek: dayOfWeek,
            name: exercise.name || 'Unnamed Exercise',
            bodyPart: exercise.bodyPart || 'full_body',
            sets: exercise.sets || undefined,
            reps: exercise.reps || undefined,
            weight: exercise.weight || undefined,
            duration: exercise.duration || undefined,
            notes: exercise.notes || undefined,
            order: index,
        }));

        return NextResponse.json({ 
            success: true, 
            data: validatedExercises 
        });
    } catch (error: any) {
        console.error('Error generating exercises:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to generate exercises' },
            { status: 500 }
        );
    }
}

