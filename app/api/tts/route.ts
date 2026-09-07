import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text');
    const lang = searchParams.get('lang') || 'hi';

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text parameter required' }, { status: 400 });
    }

    // Clean and limit text length for TTS
    const sanitized = text.replace(/[*_~`#]/g, '').trim().slice(0, 300);
    const gttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
      lang
    )}&client=tw-ob&q=${encodeURIComponent(sanitized)}`;

    const response = await fetch(gttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'TTS audio provider unavailable' },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('[TTS Route Error]', error);
    return NextResponse.json(
      { error: 'Internal server error while generating TTS audio' },
      { status: 500 }
    );
  }
}
