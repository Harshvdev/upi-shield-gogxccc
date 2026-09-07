import { NextRequest, NextResponse } from 'next/server';

function splitTextIntoChunks(text: string, maxLen = 160): string[] {
  const clean = text
    .replace(/[*_~`#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];

  // Match sentences or clauses ending with ., !, ?, ।, ;, or newline
  const rawParts = clean.match(/[^.!?।;\n]+[.!?।;\n]+|[^.!?।;\n]+/g) || [clean];
  const chunks: string[] = [];
  let current = '';

  for (const rawPart of rawParts) {
    const part = rawPart.trim();
    if (!part) continue;

    if ((current ? `${current} ${part}` : part).length <= maxLen) {
      current = current ? `${current} ${part}` : part;
    } else {
      if (current) chunks.push(current);
      if (part.length > maxLen) {
        // Fallback: split long clauses by words
        const words = part.split(' ');
        current = '';
        for (const word of words) {
          if ((current ? `${current} ${word}` : word).length <= maxLen) {
            current = current ? `${current} ${word}` : word;
          } else {
            if (current) chunks.push(current);
            current = word;
          }
        }
      } else {
        current = part;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text');
    const lang = searchParams.get('lang') || 'hi';

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text parameter required' }, { status: 400 });
    }

    const chunks = splitTextIntoChunks(text, 160);
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Valid text content required' }, { status: 400 });
    }

    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    };

    // Fetch all audio chunks in parallel
    const chunkPromises = chunks.map(async (chunk) => {
      const gttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
        lang
      )}&client=tw-ob&q=${encodeURIComponent(chunk)}`;

      const response = await fetch(gttsUrl, { headers });
      if (!response.ok) {
        throw new Error(`TTS provider returned HTTP ${response.status}`);
      }
      return Buffer.from(await response.arrayBuffer());
    });

    const buffers = await Promise.all(chunkPromises);
    const audioBuffer = Buffer.concat(buffers);

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

