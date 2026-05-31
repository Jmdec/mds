'use client'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Mail, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
  const days: Date[] = [];
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
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${String(rawMinutes).padStart(2, '0')}`;
}

export default function Book() {
  const router = useRouter();
  const { isLoggedIn, user, token } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn || !token) {
      router.replace('/login?redirect=/book');
    }
  }, [isLoggedIn, token, router]);

  // Booking state — pre-fill from auth store
  const [service, setService] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
const [phone, setPhone] = useState("")
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect home after successful booking
  useEffect(() => {
    if (!submitted) return;
    if (countdown <= 0) {
      router.push('/');
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [submitted, countdown, router]);

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
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name, email, phone,
          date: formatDate(selectedDate),
          time: formatTimeTo24(selectedTime),
          guests: 1,
          package: selectedService?.label || 'General Booking',
          reservation_fee: selectedService?.priceNumeric || 0,
          payment_method: 'cash',
          payment_status: 'pending',
        }),
      });
      const data = await response.json() as Record<string, unknown>;
      if (response.status === 401) {
        router.replace('/login?redirect=/book');
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error((data.message as string) || 'Failed to save booking.');
      }
      setSubmitted(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong while saving your booking.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Render nothing while redirecting unauthenticated users
  if (!isLoggedIn || !token) return null;

  // ── Success screen ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-md"
          >
            {/* Animated checkmark ring */}
            <div className="relative w-20 h-20 mx-auto mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center"
              >
                <CheckCircle className="text-cyan-400" size={36} />
              </motion.div>
              {/* Pulsing outer ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-cyan-400/40"
              />
            </div>

            <h2 className="font-serif text-3xl text-white mb-3">Appointment Confirmed</h2>
            <p className="text-slate-400 mb-1 font-medium">
              {selectedService?.label} — {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
            </p>
            <p className="text-slate-500 text-sm mb-8">
              A confirmation has been sent to <span className="text-slate-300">{email}</span>. We look forward to seeing you.
            </p>

            {/* Countdown redirect */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-slate-600 text-xs">
                Redirecting to home in <span className="text-cyan-400 font-semibold">{countdown}s</span>…
              </p>
              {/* Progress bar */}
              <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className="h-full bg-cyan-400/60 rounded-full"
                />
              </div>
              <button
                onClick={() => router.push('/')}
                className="mt-2 text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors underline underline-offset-2"
              >
                Go home now
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Booking form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">
      {/* Nav rendered directly — guaranteed regardless of ClientLayout */}
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
          <motion.div {...fade} className="mb-12 flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-cyan-400 text-sm uppercase tracking-[0.3em] mb-3">Booking</p>
              <h1 className="font-serif text-4xl md:text-5xl text-white">Schedule Your Visit</h1>
            </div>
            {/* Logged-in badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full self-start mt-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-slate-400 text-sm">
                Signed in as <span className="text-white">{user?.name}</span>
              </span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Service */}
              <motion.div {...fade}>
                <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 text-xs flex items-center justify-center font-bold">1</span> Select Service
                  </h3>
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

              {/* Date */}
              <motion.div {...fade} transition={{ delay: 0.1 }}>
                <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 text-xs flex items-center justify-center font-bold">2</span> Choose Date
                  </h3>
                  <div className="grid grid-cols-7 gap-2">
                    {days.slice(0, 21).map((d, i) => (
                      <button
                        key={i}
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

              {/* Time */}
              <motion.div {...fade} transition={{ delay: 0.2 }}>
                <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 text-xs flex items-center justify-center font-bold">3</span> Select Time
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {timeSlots.map(t => (
                      <button
                        key={t}
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

              {/* Patient Info */}
              <motion.div {...fade} transition={{ delay: 0.3 }}>
                <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 text-xs flex items-center justify-center font-bold">4</span> Your Information
                  </h3>
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
                      <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="+63 912 345 6789" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <motion.div {...fade} transition={{ delay: 0.2 }}>
                  <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                    <h3 className="text-white font-medium mb-6">Appointment Summary</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Service</span>
                        <span className="text-white">{selectedService?.label || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Date</span>
                        <span className="text-white">{selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Time</span>
                        <span className="text-white">{selectedTime || '—'}</span>
                      </div>
                      <div className="border-t border-white/10 pt-4 flex justify-between">
                        <span className="text-slate-500">Duration</span>
                        <span className="text-white">{selectedService?.duration || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Starting at</span>
                        <Badge variant="outline" className="border-cyan-400/30 text-cyan-400">{selectedService?.price || '—'}</Badge>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Calendar size={12} /> MDS Dental & Aesthetic Clinic</div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs"><Clock size={12} /> Mon–Sat: 9AM–7PM</div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      onClick={handleSubmit}
                      disabled={!service || !selectedDate || !selectedTime || !name || !email || !phone || loading}
                      className="w-full mt-6 bg-cyan-400 text-slate-950 hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all disabled:opacity-30"
                      size="lg"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Confirming…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Confirm Booking <ArrowRight size={16} />
                        </span>
                      )}
                    </Button>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
