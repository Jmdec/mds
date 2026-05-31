from pathlib import Path

page_text = '''
'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Mail, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const fade = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

const services = [
  { value: 'implants', label: 'Dental Implants', duration: '2-3 hours', price: '2,500+', priceNumeric: 2500 },
  { value: 'whitening', label: 'Teeth Whitening', duration: '45 min', price: '350', priceNumeric: 350 },
  { value: 'orthodontics', label: 'Orthodontics', duration: 'Consultation', price: '150', priceNumeric: 150 },
  { value: 'skin', label: 'Skin Rejuvenation', duration: '60 min', price: '450', priceNumeric: 450 },
  { value: 'contouring', label: 'Facial Contouring', duration: '45-90 min', price: '800+', priceNumeric: 800 },
  { value: 'antiaging', label: 'Anti-Aging Treatment', duration: '60-90 min', price: '600+', priceNumeric: 600 },
];

const timeSlots = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'];

function generateDays() {
  const days = [];
  const now = new Date();
  for (let i = 1; i <= 28; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    if (d.getDay() !== 0) days.push(d);
  }
  return days;
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatTimeTo24(time: string) {
  const [timeValue, modifier] = time.split(' ');
  const [rawHours, rawMinutes] = timeValue.split(':').map(Number);
  let hours = rawHours;

  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, '0')}:${String(rawMinutes).padStart(2, '0')}`;
}

export default function Book() {
  const [service, setService] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const days = generateDays();
  const selectedService = services.find(s => s.value === service);

  async function handleSubmit() {
    if (!service || !selectedDate || !selectedTime || !name || !email || !phone) {
      setError('Please complete all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          date: formatDate(selectedDate),
          time: formatTimeTo24(selectedTime),
          guests: 1,
          package: selectedService?.label || 'General Booking',
          reservation_fee: selectedService?.priceNumeric || 0,
          payment_method: 'cash',
          payment_status: 'pending',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save booking.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while saving your booking.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-6 pt-20">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-cyan-400/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-cyan-400" size={32} />
          </div>
          <h2 className="font-serif text-3xl text-white mb-4">Appointment Confirmed</h2>
          <p className="text-slate-400 mb-2">
            {selectedService?.label} {' — '} {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
          </p>
          <p className="text-slate-500 text-sm">Your booking has been saved. A confirmation has been sent to {email}.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <motion.div {...fade} className="mb-12">
          <p className="text-cyan-400 text-sm uppercase tracking-[0.3em] mb-3">Booking</p>
          <h1 className="font-serif text-4xl md:text-5xl text-white">Schedule Your Visit</h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div {...fade}>
              <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 text-xs flex items-center justify-center font-bold">1</span> Select Service</h3>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Card>
            </motion.div>

            <motion.div {...fade} transition={{ delay: 0.1 }}>
              <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 text-xs flex items-center justify-center font-bold">2</span> Choose Date</h3>
                <div className="grid grid-cols-7 gap-2">
                  {days.slice(0, 21).map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      className={`p-2 rounded-lg text-center text-sm transition-all ${
                        selectedDate?.toDateString() === d.toDateString()
                          ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-[10px] opacity-60">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="font-medium">{d.getDate()}</div>
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div {...fade} transition={{ delay: 0.2 }}>
              <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 text-xs flex items-center justify-center font-bold">3</span> Select Time</h3>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {timeSlots.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      className={`py-2 px-3 rounded-lg text-sm transition-all ${
                        selectedTime === t
                          ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div {...fade} transition={{ delay: 0.3 }}>
              <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 text-xs flex items-center justify-center font-bold">4</span> Your Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400 text-xs mb-1.5 flex items-center gap-1"><User size={12} /> Full Name</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="John Doe" />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs mb-1.5 flex items-center gap-1"><Mail size={12} /> Email</Label>
                    <Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="bg-white/5 border-white/10 text-white" placeholder="john@example.com" />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-slate-400 text-xs mb-1.5 flex items-center gap-1"><Phone size={12} /> Phone</Label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div {...fade} transition={{ delay: 0.2 }}>
                <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                  <h3 className="text-white font-medium mb-6">Appointment Summary</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Service</span>
                      <span className="text-white">{selectedService?.label || '\u2014'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date</span>
                      <span className="text-white">{selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '\u2014'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Time</span>
                      <span className="text-white">{selectedTime || '\u2014'}</span>
                    </div>
                    <div className="border-t border-white/10 pt-4 flex justify-between">
                      <span className="text-slate-500">Duration</span>
                      <span className="text-white">{selectedService?.duration || '\u2014'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Starting at</span>
                      <Badge variant="outline" className="border-cyan-400/30 text-cyan-400">{selectedService?.price || '\u2014'}</Badge>
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Calendar size={12} /> {"MDS Dental & Aesthetic Clinic"}</div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs"><Clock size={12} /> {"Mon–Sat: 9AM–7PM"}</div>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={!service || !selectedDate || !selectedTime || !name || !email || !phone || loading}
                    className="w-full mt-6 bg-cyan-400 text-slate-950 hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all disabled:opacity-30"
                    size="lg"
                  >
                    {loading ? 'Saving Booking...' : 'Confirm Booking'} <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'''
route_text = '''import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || !body.email || !body.phone || !body.date || !body.time) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name, email, phone, date, and time are required.',
        },
        { status: 400 },
      )
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      return NextResponse.json(
        {
          success: false,
          message: 'NEXT_PUBLIC_API_URL is not configured.',
        },
        { status: 500 },
      )
    }

    const response = await fetch(`${apiUrl}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Book API Error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save booking. Please try again later.',
      },
      { status: 500 },
    )
  }
}
'''
Path('src/app/book/page.tsx').write_text(page_text, encoding='utf-8')
Path('src/app/api/book/route.ts').write_text(route_text, encoding='utf-8')
print('wrote page', Path('src/app/book/page.tsx').stat().st_size)
print('wrote route', Path('src/app/api/book/route.ts').stat().st_size)
