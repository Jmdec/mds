"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, ChevronDown } from "lucide-react";

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
}

const QUICK_REPLIES = [
  "Book an appointment",
  "Our services",
  "Clinic hours",
  "Location",
  "Payment options",
];

const BOT_RESPONSES: Record<string, string> = {
  default:
    "I'm not sure about that, but our team would be happy to help! You can reach us directly or book an appointment online.",
  greet:
    "Hello! 👋 Welcome to MDS Dental & Aesthetic Clinic. How can I help you today?",
  book: "You can book an appointment at mdsdental.com/appointments, call us directly, or send us a message on Facebook or Instagram. Walk-ins are also welcome, subject to availability!",
  services:
    "We offer a wide range of services:\n\n🦷 General Dentistry — check-ups, cleaning, fillings, extractions\n✨ Cosmetic Dentistry — whitening, veneers, smile makeovers\n🔧 Orthodontics — metal braces, ceramic braces, Invisalign\n🏗️ Restorative — implants, crowns, bridges, root canals\n💉 Aesthetics — botox, dermal fillers, facial rejuvenation\n👶 Pediatric Dentistry — gentle care for kids\n\nWould you like details on any specific service?",
  hours:
    "Our clinic hours are:\n\n📅 Mon–Fri: 9:00 AM – 6:00 PM\n📅 Saturday: 9:00 AM – 5:00 PM\n📅 Sunday: 10:00 AM – 3:00 PM\n\nWe recommend booking in advance to secure your preferred time slot!",
  location:
    "We're located in Batangas City, Batangas, Philippines. Visit mdsdental.com or contact us directly for the exact address and directions. 📍",
  payment:
    "We accept multiple payment methods:\n\n💵 Cash\n💳 Credit & Debit Cards\n📱 GCash & Maya\n🏥 PhilHealth (for eligible procedures)\n\nWe also offer flexible installment plans for certain treatments. Ask our front desk for details!",
  whitening:
    "Our professional teeth whitening can lighten your smile by several shades in just one visit! We use safe, clinic-grade whitening agents. Book a consultation to find the best option for you. 😁",
  braces:
    "We offer metal braces, ceramic braces, and Invisalign clear aligners. The best option depends on your case — book a free orthodontic consultation and our dentist will recommend the right treatment for you!",
  implant:
    "Dental implants are the gold standard for replacing missing teeth. They look, feel, and function just like natural teeth. We use advanced 3D imaging to plan implant placement precisely. Book a consultation to learn if you're a candidate!",
  pain: "We prioritize pain-free dentistry! We use modern local anesthesia and gentle techniques to keep you comfortable throughout your treatment. Many patients are pleasantly surprised at how comfortable procedures feel here. 😊",
  price:
    "Our pricing varies depending on the treatment. We offer competitive rates and flexible payment options. For an accurate quote, book a consultation — initial check-ups include a full assessment and treatment plan.",
  emergency:
    "For dental emergencies like severe toothache, knocked-out tooth, or swollen jaw — please contact us immediately by phone or visit the clinic. We accommodate emergency cases as quickly as possible. 🚨",
  kids: "Yes, we're very child-friendly! Our pediatric dental services are designed to make kids feel comfortable and at ease. We use gentle techniques and a warm, welcoming environment to help children develop positive dental habits early. 👶",
  aesthetic:
    "Our aesthetic services include botox, dermal fillers, facial rejuvenation, chemical peels, and skin care treatments. These are performed by trained medical professionals in a safe clinical setting. Book a consultation to discuss your goals!",
};

function getBotResponse(input: string): string {
  const msg = input.toLowerCase();
  if (msg.match(/^(hi|hello|hey|good\s?(morning|afternoon|evening)|kumusta)/))
    return BOT_RESPONSES.greet;
  if (msg.match(/book|appointment|schedule|reserve/)) return BOT_RESPONSES.book;
  if (msg.match(/service|offer|treatment|procedure|what do you/))
    return BOT_RESPONSES.services;
  if (msg.match(/hour|open|close|schedule|time|when/))
    return BOT_RESPONSES.hours;
  if (msg.match(/location|address|where|directions|map|find you/))
    return BOT_RESPONSES.location;
  if (msg.match(/pay|payment|gcash|maya|credit|cash|philhealth|installment/))
    return BOT_RESPONSES.payment;
  if (msg.match(/whiten|bleach|bright/)) return BOT_RESPONSES.whitening;
  if (msg.match(/brace|aligner|invisalign|orthodont|crooked|straight/))
    return BOT_RESPONSES.braces;
  if (msg.match(/implant|missing tooth|missing teeth/))
    return BOT_RESPONSES.implant;
  if (msg.match(/pain|hurt|scared|nervous|anxious|fear/))
    return BOT_RESPONSES.pain;
  if (msg.match(/price|cost|how much|fee|rate|afford/))
    return BOT_RESPONSES.price;
  if (msg.match(/emergency|urgent|swollen|knocked|broken|severe/))
    return BOT_RESPONSES.emergency;
  if (msg.match(/kid|child|children|pediatric|baby|toddler/))
    return BOT_RESPONSES.kids;
  if (msg.match(/botox|filler|aesthetic|skin|facial|peel/))
    return BOT_RESPONSES.aesthetic;
  return BOT_RESPONSES.default;
}

export default function CustomerServiceChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "bot",
      text: "Hi there! 👋 I'm the MDS Dental virtual assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(
      () => {
        const reply = getBotResponse(text);
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "bot", text: reply },
        ]);
        setTyping(false);
      },
      800 + Math.random() * 400,
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div
          className="mb-4 w-[340px] sm:w-[380px] bg-[#0a2540] border border-blue-800/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0d3060] border-b border-blue-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">
                  MDS Dental Assistant
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-blue-300 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-blue-800"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs
                  ${msg.role === "bot" ? "bg-cyan-500/20" : "bg-blue-600/40"}`}
                >
                  {msg.role === "bot" ? (
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-blue-300" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line
                    ${
                      msg.role === "bot"
                        ? "bg-[#0d3060] text-white rounded-bl-sm"
                        : "bg-cyan-500 text-[#0a1628] font-medium rounded-br-sm"
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="bg-[#0d3060] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto scrollbar-none border-t border-blue-800/40">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr}
                onClick={() => sendMessage(qr)}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 transition whitespace-nowrap"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 flex gap-2 items-center border-t border-blue-800/40">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-[#0d3060] border border-blue-700/50 rounded-xl px-3.5 py-2 text-sm text-white placeholder-blue-400/60 focus:outline-none focus:border-cyan-500/60 transition"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-blue-800/50 disabled:cursor-not-allowed flex items-center justify-center transition flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 text-[#0a1628]" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 shadow-lg hover:shadow-cyan-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <ChevronDown className="w-6 h-6 text-[#0a1628]" />
        ) : (
          <MessageCircle className="w-6 h-6 text-[#0a1628]" />
        )}
      </button>
    </>
  );
}
