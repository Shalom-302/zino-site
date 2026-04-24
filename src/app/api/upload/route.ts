import { NextRequest, NextResponse } from 'next/server';

const BUCKET = 'zino-2a974.firebasestorage.app';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string | null;
    const token = formData.get('token') as string | null;

    if (!file || !path || !token) {
      return NextResponse.json({ error: 'Missing file, path or token' }, { status: 400 });
    }

    const encodedPath = encodeURIComponent(path);
    const bytes = await file.arrayBuffer();

    const uploadRes = await fetch(
      `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o?name=${encodedPath}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: bytes,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return NextResponse.json({ error: err }, { status: uploadRes.status });
    }

    const data = await uploadRes.json();
    const downloadToken = data.downloadTokens;
    const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodedPath}?alt=media&token=${downloadToken}`;

    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export const config = { api: { bodyParser: false } };
