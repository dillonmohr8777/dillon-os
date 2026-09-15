"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";

export function ContactForm() {
  const [done, setDone] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "" });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  if (done) {
    return (
      <div className="card grid min-h-[360px] place-items-center p-8 text-center">
        <div>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-ice to-ice-dark">
            <Check className="h-7 w-7 text-white" />
          </div>
          <h3 className="heading mt-5 text-xl text-white">Message sent</h3>
          <p className="mt-2 text-sm text-slate-400">
            Thanks for reaching out — we'll get back to you shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className="card space-y-5 p-6 sm:p-8"
    >
      <h3 className="heading text-xl text-white">Send us a message</h3>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-white">Name</span>
          <input
            required
            value={f.name}
            onChange={(e) => set("name", e.target.value)}
            className="cf-input"
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-white">Phone</span>
          <input
            type="tel"
            value={f.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="cf-input"
            placeholder="(847) 000-0000"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-white">Email</span>
        <input
          required
          type="email"
          value={f.email}
          onChange={(e) => set("email", e.target.value)}
          className="cf-input"
          placeholder="you@email.com"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-white">How can we help?</span>
        <textarea
          required
          rows={4}
          value={f.message}
          onChange={(e) => set("message", e.target.value)}
          className="cf-input resize-none"
          placeholder="Tell us about your HVAC needs…"
        />
      </label>
      <button type="submit" className="btn-ember w-full">
        <Send className="h-4 w-4" /> Send Message
      </button>

      <style>{`
        .cf-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          padding: 0.7rem 0.9rem;
          color: #fff;
          font-size: 0.9rem;
          outline: none;
          transition: border-color .2s;
        }
        .cf-input::placeholder { color: #64748b; }
        .cf-input:focus { border-color: rgba(255,90,31,0.6); }
      `}</style>
    </form>
  );
}
