import { NextRequest, NextResponse } from 'next/server';
import { getTwilioClient } from '@/lib/twilio';

export async function GET(_req: NextRequest, { params }: { params: { sid: string } }) {
  const client = getTwilioClient();
  const { sid } = params;
  // Proxy fetch recording media URL if available
  try {
    const rec = await client.recordings(sid).fetch();
    if (!rec.mediaUrl) {
      return new NextResponse('Recording media unavailable', { status: 404 });
    }
    return NextResponse.redirect(rec.mediaUrl, 302);
  } catch (e: any) {
    return new NextResponse('Not found', { status: 404 });
  }
}


