import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { config } from '@/lib/config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
) {
  try {
    // Await params in Next.js 15+
    const resolvedParams = await params
    const pathSegments = resolvedParams.path || []
    const targetPath = pathSegments.join('/')
    const searchParams = request.nextUrl.searchParams.toString()
    const queryString = searchParams ? `?${searchParams}` : ''

    const targetUrl = `${config.apiUrl}/${targetPath}${queryString}`

    // Define public endpoints that don't require authentication
    const publicEndpoints = ['api/sign-up', 'api/login']
    const isPublicEndpoint = publicEndpoints.some(
      (endpoint) =>
        targetPath === endpoint || targetPath.startsWith(endpoint + '/')
    )

    const session = await getServerSession(authOptions)

    console.log(`🔄 Proxying ${method} request to: ${targetUrl}`)
    console.log(`🔐 Session available: ${!!session}`)
    console.log(`🌐 Public endpoint: ${isPublicEndpoint}`)
    console.log(`🎫 Access token available: ${!!session?.accessToken}`)

    const headers: Record<string, string> = {}

    // Preserve original Content-Type header if present
    const originalContentType = request.headers.get('content-type')
    if (originalContentType) {
      headers['Content-Type'] = originalContentType
    } else {
      headers['Content-Type'] = 'application/json'
    }

    // Add authorization header for authenticated requests (not for public endpoints)
    if (session?.accessToken && !isPublicEndpoint) {
      headers.Authorization = `Bearer ${session.accessToken}`
      console.log(`🎫 Added Authorization header`)
    }

    let body = undefined
    if (method !== 'GET' && method !== 'DELETE') {
      // Check if it's FormData (multipart) or regular body
      const contentType = originalContentType || 'application/json'
      if (contentType.includes('multipart/form-data')) {
        // For FormData, use the raw body
        body = await request.blob()
      } else {
        // For JSON/text content, read as text
        body = await request.text()
      }
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body: body || undefined,
    })

    console.log(`📡 Backend response status: ${response.status}`)

    const responseText = await response.text()
    let responseData

    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }

    if (!response.ok) {
      console.log(`❌ Backend error: ${response.status} - ${responseText}`)
      return Response.json(responseData, { status: response.status })
    }

    console.log(`✅ Backend success: ${response.status}`)
    return Response.json(responseData, { status: response.status })
  } catch (error) {
    console.error('❌ Proxy error:', error)
    return Response.json(
      {
        error: 'Proxy request failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
