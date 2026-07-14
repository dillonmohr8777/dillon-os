"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, ArrowRight, ArrowLeft, CalendarCheck, Loader2, Phone } from "lucide-react";
import { business, services } from "@/lib/site";

const urgencies = ["Emergency (24/7)", "Same day", "This week", "Just a quote"];
const steps = ["Service", "Details", "Contact"];

export function BookingForm() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    service: "",
    urgency: "",
    date: "",
    address: "",
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const canNext =
    (step === 0 && form.service && form.urgency) ||
    (step === 1 && form.address) ||
    step === 2;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const body = new URLSearchParams({ "form-name": "service-request", ...form });
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!response.ok) throw new Error("Submission failed");
      setDone(true);
    } catch {
      setError("We could not send that request. Please call us and we will help right away.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="card p-8 text-center sm:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-ember to-ember-dark">
          <Check className="h-8 w-8 text-white" />
        </div>
        <h3 className="heading mt-6 text-2xl text-white">Request received</h3>
        <p className="mx-auto mt-3 max-w-md text-slate-400">
          Thanks, {form.name || "neighbor"}! Our team will reach out shortly to confirm your{" "}
          {form.service || "service"}. For anything urgent, call us now. We are available 24/7.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={business.phoneHref} className="btn-ember">
            <Phone className="h-4 w-4" /> Call {business.phone}
          </a>
          <a
            href={business.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
          >
            Book instantly online
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 sm:p-8">
      {/* progress */}
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i <= step ? "bg-ember text-white" : "bg-white/10 text-slate-400"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`hidden text-xs font-semibold uppercase tracking-wider sm:block ${
                i <= step ? "text-white" : "text-slate-500"
              }`}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <span
                className={`h-px flex-1 ${i < step ? "bg-ember/60" : "bg-white/10"}`}
              />
            )}
          </div>
        ))}
      </div>

      <form name="service-request" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" onSubmit={submit}>
        <input type="hidden" name="form-name" value="service-request" />
        <p className="absolute h-px w-px overflow-hidden [clip:rect(0,0,0,0)]">
          <label>Do not fill this out <input name="bot-field" /></label>
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">
                    What do you need?
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {services.map((s) => (
                      <button
                        type="button"
                        name="service-choice"
                        key={s.slug}
                        onClick={() => set("service", s.name)}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                          form.service === s.name
                            ? "border-ember/60 bg-ember/10 text-white"
                            : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/25"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">
                    How soon?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {urgencies.map((u) => (
                      <button
                        type="button"
                        name="urgency-choice"
                        key={u}
                        onClick={() => set("urgency", u)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          form.urgency === u
                            ? "border-ice/60 bg-ice/10 text-ice-light"
                            : "border-white/10 text-slate-300 hover:border-white/25"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <Field label="Service address">
                  <input
                    required
                    name="address"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="123 Main St, Hampshire, IL"
                    className="input"
                  />
                </Field>
                <Field label="Preferred date (optional)">
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Anything we should know? (optional)">
                  <textarea
                    value={form.message}
                    name="message"
                    onChange={(e) => set("message", e.target.value)}
                    rows={3}
                    placeholder="Describe the issue or what you would like done"
                    className="input resize-none"
                  />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <Field label="Full name">
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Your name"
                    className="input"
                  />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Phone">
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="(847) 000 0000"
                      className="input"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      required
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="you@email.com"
                      className="input"
                    />
                  </Field>
                </div>
                <p className="text-xs text-slate-500">
                  By submitting, you agree to be contacted about your service request. We never
                  share your information.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-ghost !px-5"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <span />
          )}
          {step < steps.length - 1 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => canNext && setStep((s) => s + 1)}
              className="btn-ember !px-6 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="submit" disabled={sending} className="btn-ember !px-6 disabled:cursor-wait disabled:opacity-60">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />} {sending ? "Sending" : "Request Service"}
            </button>
          )}
        </div>
        {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}</p>}
      </form>

      <style>{`
        .input {
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
        .input::placeholder { color: #64748b; }
        .input:focus { border-color: rgba(255,90,31,0.6); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white">{label}</span>
      {children}
    </label>
  );
}
