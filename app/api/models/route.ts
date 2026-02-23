import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Missing GOOGLE_GENERATIVE_AI_API_KEY. Set it in .env.local and restart the dev server.',
        },
        { status: 500 }
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const json = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          error: 'Failed to list models',
          status: res.status,
          details: json,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(json);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
