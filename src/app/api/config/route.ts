import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3030/ws',
    apiUrlDisplay:
      process.env.NEXT_PUBLIC_API_URL_DISPLAY ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3030',
    version: process.env.npm_package_version || '1.0.0',
  })
}
