import { NextResponse } from 'next/server';
import { generateAnimatedSvg } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const hasGatewayKey = Boolean(process.env.AI_GATEWAY_API_KEY);
    const hasGoogleKey = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    if (!hasGatewayKey && !hasGoogleKey) {
      return NextResponse.json(
        {
          error:
            'Missing API key. Set GOOGLE_GENERATIVE_AI_API_KEY (Google direct) or AI_GATEWAY_API_KEY (Vercel AI Gateway) in your .env.local, then restart the dev server.',
        },
        { status: 500 }
      );
    }

    const mode = hasGatewayKey ? 'gateway' : 'google';
    const modelName = hasGatewayKey
      ? (process.env.AI_MODEL || 'google/gemini-3.1-pro-preview')
      : (process.env.GOOGLE_MODEL || 'gemini-1.5-flash');

    const body = (await req.json()) as { svgContent?: string; prompt?: string };

    if (!body?.svgContent || !body?.prompt) {
      return NextResponse.json(
        { error: 'svgContent and prompt are required' },
        { status: 400 }
      );
    }

    const result = await generateAnimatedSvg(body.svgContent, body.prompt);
    return NextResponse.json({ svg: result.svg, mode, model: result.model || modelName });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';

    const lowered = message.toLowerCase();
    const isQuotaError =
      lowered.includes('quota') ||
      lowered.includes('resource_exhausted') ||
      lowered.includes('rate limit') ||
      lowered.includes('429');

    const retryMatch = message.match(/retry in\s+([0-9.]+)s/i);
    const retryAfterSeconds = retryMatch ? Math.ceil(Number(retryMatch[1])) : undefined;

    if (isQuotaError) {
      return NextResponse.json(
        {
          error: message,
          mode: process.env.AI_GATEWAY_API_KEY ? 'gateway' : 'google',
          model: process.env.AI_GATEWAY_API_KEY
            ? (process.env.AI_MODEL || 'google/gemini-3.1-pro-preview')
            : (process.env.GOOGLE_MODEL || 'models/gemini-3.1-pro-preview'),
          retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: message,
        mode: process.env.AI_GATEWAY_API_KEY ? 'gateway' : 'google',
        model: process.env.AI_GATEWAY_API_KEY
          ? (process.env.AI_MODEL || 'google/gemini-3.1-pro-preview')
          : (process.env.GOOGLE_MODEL || 'models/gemini-3.1-pro-preview'),
      },
      { status: 500 }
    );
  }
}
