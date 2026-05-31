import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface SendEmailsParams {
  name: string
  email: string
  date: string
  time: string
  packageName: string
}

async function sendEmails({ name, email, date, time, packageName }: SendEmailsParams) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER

  await transporter.sendMail({
    from: `"MDS Dental & Aesthetic Clinic" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Appointment Request Received — MDS Dental",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#020617;color:#fff;border-radius:12px;">
        <h2 style="color:#22d3ee;margin-bottom:8px;">Appointment Received</h2>
        <p style="color:#94a3b8;margin-bottom:24px;">Hi ${name}, we've received your appointment request.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#64748b;">Service</td>
            <td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#fff;">${packageName}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#64748b;">Date</td>
            <td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#fff;">${date}</td>
          </tr>
          <tr>
            <td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#64748b;">Time</td>
            <td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#fff;">${time}</td>
          </tr>
        </table>
        <p style="color:#94a3b8;margin-top:24px;font-size:13px;">We will contact you shortly to confirm your appointment.</p>
        <p style="color:#475569;font-size:12px;margin-top:16px;">MDS Dental & Aesthetic Clinic · Mon–Sat: 9AM–7PM</p>
      </div>
    `,
  })

  await transporter.sendMail({
    from: `"MDS Dental System" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `New Appointment — ${name} (${packageName})`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#020617;color:#fff;border-radius:12px;">
        <h2 style="color:#22d3ee;margin-bottom:8px;">New Appointment Request</h2>
        <p style="color:#94a3b8;margin-bottom:24px;">A new booking has been submitted.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#64748b;">Name</td><td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#fff;">${name}</td></tr>
          <tr><td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#64748b;">Email</td><td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#fff;">${email}</td></tr>
          <tr><td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#64748b;">Service</td><td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#fff;">${packageName}</td></tr>
          <tr><td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#64748b;">Date</td><td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#fff;">${date}</td></tr>
          <tr><td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#64748b;">Time</td><td style="padding:10px;border:1px solid rgba(255,255,255,0.1);color:#fff;">${time}</td></tr>
        </table>
        <p style="color:#475569;font-size:12px;margin-top:24px;">Automated notification from MDS Dental booking system.</p>
      </div>
    `,
  })
}

async function parseBody(request: NextRequest) {
  const contentType = request.headers.get("content-type") || ""
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData()
    const body: Record<string, string> = {}
    for (const [key, value] of formData.entries()) {
      if (!(value instanceof File)) body[key] = String(value)
    }
    return body
  }
  return await request.json() as Record<string, unknown>
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || ""

  if (!authHeader) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 }
    )
  }

  if (!API_URL) {
    return NextResponse.json(
      { success: false, message: "NEXT_PUBLIC_API_URL is not configured." },
      { status: 500 }
    )
  }

  try {
    // ✅ Points to the user-scoped endpoint, not the admin index
    const response = await fetch(`${API_URL}/api/my-bookings`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authHeader,
      },
    })

    const data = await response.json() as Record<string, unknown>

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: typeof data.message === 'string' ? data.message : "Failed to fetch bookings." },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, ...data }, { status: 200 })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bookings.'
    console.error("Bookings fetch error:", error)
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const bookingData = await parseBody(request)

    if (!bookingData?.name || !bookingData?.email || !bookingData?.date || !bookingData?.time) {
      return NextResponse.json(
        { success: false, message: "Please provide name, email, date, and time." },
        { status: 400 }
      )
    }

    if (!API_URL) {
      return NextResponse.json(
        { success: false, message: "NEXT_PUBLIC_API_URL is not configured." },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get("authorization") || ""

    const response = await fetch(`${API_URL}/api/bookings`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(bookingData),
    })

    const data = await response.json() as Record<string, unknown>

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: typeof data.message === 'string' ? data.message : "Failed to create booking.", details: data },
        { status: response.status }
      )
    }

    try {
      await sendEmails({
        name: String(bookingData.name),
        email: String(bookingData.email),
        date: String(bookingData.date),
        time: String(bookingData.time),
        packageName: typeof bookingData.package === 'string' ? bookingData.package : "Appointment",
      })
      console.log(`📧 Emails sent to ${bookingData.email} and admin`)
    } catch (emailErr: unknown) {
      const emailError = emailErr instanceof Error ? emailErr.message : 'Unknown error'
      console.error("Email sending failed:", emailError)
    }

    return NextResponse.json({ success: true, ...data }, { status: response.status })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create booking.'
    console.error("Booking proxy error:", error)
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    )
  }
}
