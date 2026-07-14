"use client";

import { useState } from "react";
import { AlertCircle, Check, Loader2, Send } from "lucide-react";

export function ContactForm() {
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
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
            Thanks for reaching out. We will get back to you shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={async (e) => {
        e.preventDefault();
        setSending(true);
        setError("");
        try {
          const body = new URLSearchParams({ "form-name": "contact", ...f });
          const response = await fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
          });
          if (!response.ok) throw new Error("Submission failed");
          setDone(true);
        } catch {
          setError("We could not send that message. Please call us and we will help right away.");
        } finally {
          setSending(false);
        }
      }}
      className="card space-y-5 p-6 sm:p-8"
    >
      <input type="hidden" name="form-name" value="contact" />
      <p className="absolute h-px w-px overflow-hidden [clip:rect(0,0,0,0)]">
        <label>Do not fill this out <input name="bot-field" /></label>
      </p>
      <h3 className="heading text-xl text-white">Send us a message</h3>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-white">Name</span>
          <input
            required
            name="name"
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
            name="phone"
            value={f.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="cf-input"
            placeholder="(847) 000 0000"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-white">Email</span>
        <input
          required
          type="email"
          name="email"
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
          name="message"
          rows={4}
          value={f.message}
          onChange={(e) => set("message", e.target.value)}
          className="cf-input resize-none"
          placeholder="Tell us about your HVAC needs"
        />
      </label>
      {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}</p>}
      <button type="submit" disabled={sending} className="btn-ember w-full disabled:cursor-wait disabled:opacity-60">
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {sending ? "Sending" : "Send Message"}
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
