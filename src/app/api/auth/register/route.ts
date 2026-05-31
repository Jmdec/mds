import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>

    console.log('=== REGISTRATION DEBUG START ===')
    console.log('Request body received:', body)

    // Validate required fields
    if (!body.name || !body.email || !body.password || !body.password_confirmation) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name, email, password, and password confirmation are required.',
        },
        { status: 400 }
      )
    }

    // Password match
    if (body.password !== body.password_confirmation) {
      return NextResponse.json(
        {
          success: false,
          message: 'Passwords do not match.',
        },
        { status: 400 }
      )
    }

    // Password length
    if (typeof body.password === 'string' && body.password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password must be at least 8 characters long.',
        },
        { status: 400 }
      )
    }

    // Phone validation
    if (body.phone && typeof body.phone === 'string' && body.phone.length !== 11) {
      return NextResponse.json(
        {
          success: false,
          message: 'Phone number must be exactly 11 digits.',
        },
        { status: 400 }
      )
    }

    const apiUrl =
      (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/g, '')
    const fullUrl = new URL('/api/auth/register', apiUrl).toString()

    console.log('Connecting to Laravel:', fullUrl)

    // ✅ ONLY REQUIRED FIELDS
    const requestData = {
      name: typeof body.name === 'string' ? body.name.trim() : '',
      email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : '',
      phone: typeof body.phone === 'string' ? body.phone.trim() : undefined,
      password: body.password,
      password_confirmation: body.password_confirmation,
    }

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    const responseText = await response.text()
    console.log('Laravel raw response:', responseText)

    let data: Record<string, unknown>
    try {
      data = JSON.parse(responseText) as Record<string, unknown>
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON from backend',
        },
        { status: 502 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: typeof data.message === 'string' ? data.message : 'Registration failed',
          errors: data.errors || {},
        },
        { status: 400 }
      )
    }

    console.log('=== REGISTRATION DEBUG END ===')

    return NextResponse.json({
      success: true,
      message: typeof data.message === 'string' ? data.message : 'Registration successful',
      data: data.data,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('REGISTRATION ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Server error during registration',
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
