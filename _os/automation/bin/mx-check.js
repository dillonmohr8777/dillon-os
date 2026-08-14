#!/usr/bin/env node
/**
 * mx-check.js — verify email domains from a CSV have live MX records.
 *
 * Usage: node _os/automation/bin/mx-check.js <input.csv> [--email-col email] [--out <output.csv>]
 *
 * Reads a CSV with a header row, resolves MX for each unique domain in the
 * email column, and writes the same CSV with an added `mx_status` column
 * (mx_ok | no_mx | bad_syntax | blank). Never sends mail, never probes SMTP —
 * DNS lookups only. Deduplicates domain lookups. No data leaves the machine.
 */
const fs = require("fs");
const path = require("path");
const dns = require("dns").promises;

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function toCsv(rows) {
  return rows
    .map((r) => r.map((f) => (/[",\n\r]/.test(f) ? '"' + f.replace(/"/g, '""') + '"' : f)).join(","))
    .join("\n") + "\n";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function main() {
  const args = process.argv.slice(2);
  const input = args.find((a) => !a.startsWith("--"));
  if (!input) {
    console.error("Usage: node mx-check.js <input.csv> [--email-col email] [--out output.csv]");
    process.exit(1);
  }
  const emailCol = args.includes("--email-col") ? args[args.indexOf("--email-col") + 1] : "email";
  const out = args.includes("--out")
    ? args[args.indexOf("--out") + 1]
    : path.join(path.dirname(input), path.basename(input).replace(/\.csv$/i, "") + ".mx.csv");

  const rows = parseCsv(fs.readFileSync(input, "utf8"));
  const header = rows[0];
  let idx = header.findIndex((h) => h.trim().toLowerCase() === emailCol.toLowerCase());
  if (idx === -1) {
    console.error(`Column "${emailCol}" not found in header: ${header.join(", ")}`);
    process.exit(1);
  }
  header.push("mx_status");

  const cache = new Map();
  async function mxStatus(domain) {
    if (cache.has(domain)) return cache.get(domain);
    let status;
    try {
      const mx = await dns.resolveMx(domain);
      status = mx && mx.length ? "mx_ok" : "no_mx";
    } catch {
      status = "no_mx";
    }
    cache.set(domain, status);
    return status;
  }

  let ok = 0, bad = 0, blank = 0;
  for (let i = 1; i < rows.length; i++) {
    const email = (rows[i][idx] || "").trim().toLowerCase();
    let status;
    if (!email) { status = "blank"; blank++; }
    else if (!EMAIL_RE.test(email)) { status = "bad_syntax"; bad++; }
    else {
      status = await mxStatus(email.split("@")[1]);
      status === "mx_ok" ? ok++ : bad++;
    }
    rows[i].push(status);
  }

  fs.writeFileSync(out, toCsv(rows));
  console.log(`rows=${rows.length - 1} mx_ok=${ok} failing=${bad} blank=${blank}`);
  console.log(`wrote ${out}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
