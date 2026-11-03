/* Fillerless app logic. No build step, no dependencies. */
"use strict";
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ICON = {
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
  read: '<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z"/><path d="M4 20.5A2.5 2.5 0 016.5 18H20v3H6.5"/>',
  structure: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11c0 4-6 3-12 6"/>',
  spot: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  speak: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
  milestone: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  flame: '<path d="M12 2c1 3.5 5 5.5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 .2 1.3.8 2 1.5 2C10 7 11 4.5 12 2z"/>',
  check: '<path d="M5 12l5 5 9-10"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>', path: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 000-6h-4a3 3 0 010-6h6"/>',
  stats: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>', me: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>', bell: '<path d="M6 17V11a6 6 0 0112 0v6l2 2H4zM10 21h4"/>'
};
const ico = (n, cls = "") => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ""}</svg>`;

/* ---------- state ---------- */
const KEY = "fillerless.v1";
const fresh = () => ({ goalMin: 10, remind: "19:00", notif: false, streak: { count: 0, best: 0, lastDay: null }, freezes: 1, days: {}, progress: {}, history: [], badges: [], lastNotified: null, tx: true, ai: { provider: "gemini", key: "", model: "" } });
let S;
try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { S = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage blocked */ } };
const dkey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (k, n) => { const [y, m, d] = k.split("-").map(Number); return dkey(new Date(y, m - 1, d + n)); };
const daysBetween = (a, b) => Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 864e5);
const secToday = () => (S.days[dkey()] || { sec: 0 }).sec;
const goalSec = () => S.goalMin * 60;
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const ALL_NODES = UNITS.flatMap(u => u.nodes.map(n => Object.assign({ unit: u.id }, n)));
const nodeById = id => ALL_NODES.find(n => n.id === id);
const isDone = id => !!(S.progress[id] && S.progress[id].done);
const isUnlocked = id => { const i = ALL_NODES.findIndex(n => n.id === id); return i === 0 || isDone(ALL_NODES[i - 1].id); };
const currentNode = () => ALL_NODES.find(n => !isDone(n.id)) || ALL_NODES[ALL_NODES.length - 1];

function streakInfo() {
  const t = dkey(), s = S.streak;
  if (!s.lastDay) return { count: 0, atRisk: false };
  const gap = daysBetween(s.lastDay, t);
  if (gap <= 0) return { count: s.count, atRisk: false };
  if (gap === 1) return { count: s.count, atRisk: true };
  if (gap === 2 && S.freezes > 0) return { count: s.count, atRisk: true, freeze: true };
  return { count: 0, atRisk: false, lost: s.count };
}
function awardBadge(id) { if (!S.badges.includes(id)) { S.badges.push(id); return true; } return false; }
function addPractice(sec) {
  const k = dkey(), day = S.days[k] || (S.days[k] = { sec: 0, sessions: 0, met: false });
  day.sec += Math.round(sec); day.sessions += 1;
  let msg = "";
  if (!day.met && day.sec >= goalSec()) {
    day.met = true;
    const gap = S.streak.lastDay ? daysBetween(S.streak.lastDay, k) : null;
    if (gap === 1) S.streak.count += 1;
    else if (gap === 2 && S.freezes > 0) { S.freezes -= 1; S.streak.count += 1; msg = "Streak freeze used. "; }
    else if (gap !== 0) S.streak.count = 1;
    S.streak.lastDay = k; S.streak.best = Math.max(S.streak.best, S.streak.count);
    if (S.streak.count % 7 === 0 && S.freezes < 2) { S.freezes += 1; msg += "You earned a streak freeze. "; }
    [3, 7, 14, 30, 60, 100].forEach(n => { if (S.streak.count >= n && awardBadge("streak-" + n)) msg += `New badge: ${n} day streak. `; });
    msg = "Daily goal reached! " + msg;
  }
  save(); return msg.trim();
}

/* ---------- text analysis ---------- */
const FILLER_RX = [["um", /^(um+|umm+|hmm+|mm+)$/], ["uh", /^(uh+|er|erm|ah+)$/], ["basically", /^basically$/], ["actually", /^actually$/], ["literally", /^literally$/]];
const LIKE_BEFORE = new Set(["would", "i", "we", "you", "they", "to", "feel", "feels", "looks", "look", "sounds", "sound", "dont", "don't", "do", "really", "just", "more", "much", "something", "exactly", "and", "or", "if", "what", "is", "it", "that", "things", "people", "anyone", "someone", "what's", "very", "nothing"]);
const PHRASES = [["you know", /\byou know\b/g], ["i mean", /\bi mean\b/g], ["sort of", /\bsort of\b/g], ["kind of", /\bkind of\b/g]];
const HEDGES = /\b(i think|maybe|perhaps|i guess|possibly|probably|i feel like|just|a little bit)\b/g;
const tokens = t => (String(t).toLowerCase().match(/[a-z0-9']+/g) || []);

function countFillers(text) {
  const w = tokens(text), c = {};
  w.forEach((x, i) => {
    for (const [name, rx] of FILLER_RX) if (rx.test(x)) { c[name] = (c[name] || 0) + 1; return; }
    if (x === "like" && !LIKE_BEFORE.has(w[i - 1] || "")) c.like = (c.like || 0) + 1;
  });
  const joined = " " + w.join(" ") + " ";
  PHRASES.forEach(([n, rx]) => { const m = joined.match(rx); if (m) c[n] = (c[n] || 0) + m.length; });
  return c;
}
function lcsMatch(a, b) { // returns Set of indices in a that appear in order in b
  const n = a.length, m = b.length, dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const hit = new Set(); let i = 0, j = 0;
  while (i < n && j < m) { if (a[i] === b[j]) { hit.add(i); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++; }
  return hit;
}
function analyzeAudio(levels) {
  if (!levels || levels.length < 20) return { pauses: [], startDelay: 0, ratio: 0, ok: false };
  const sorted = [...levels].sort((a, b) => a - b), floor = sorted[Math.floor(sorted.length * 0.2)];
  const thr = Math.max(0.012, floor * 3), sp = levels.map(v => v > thr);
  for (let i = 0; i < sp.length;) { if (sp[i]) { i++; continue; } let j = i; while (j < sp.length && !sp[j]) j++; if (j - i <= 3 && i > 0 && j < sp.length) for (let k = i; k < j; k++) sp[k] = true; i = j; }
  const first = sp.indexOf(true), last = sp.lastIndexOf(true);
  if (first < 0) return { pauses: [], startDelay: levels.length / 10, ratio: 0, ok: true };
  const pauses = []; let i = first;
  while (i <= last) { if (sp[i]) { i++; continue; } let j = i; while (j <= last && !sp[j]) j++; if ((j - i) >= 8) pauses.push((j - i) / 10); i = j; }
  return { pauses, startDelay: first / 10, ratio: sp.filter(Boolean).length / (last - first + 1), ok: true };
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function analyze(text, dur, audio, node, passage) {
  const isRead = node.kind === "read", words = tokens(text), n = words.length, mins = Math.max(dur / 60, 0.1);
  const wpm = n / mins, pauses = audio.pauses || [], ppm = pauses.length / mins, long = pauses.filter(p => p > 3).length;
  const out = { dur, words: n, wpm: Math.round(wpm), pauses: pauses.length, longest: pauses.length ? Math.max(...pauses) : 0, long, startDelay: audio.startDelay, hasText: n >= 5, tips: [], good: [], sub: {} };
  const rep = []; words.forEach((w, i) => { if (i && w === words[i - 1] && !["that", "had", "very", "so"].includes(w) && w.length > 1) rep.push(w); }); out.repeats = rep.length;
  const pacePts = max => { const lo = isRead ? 100 : 115, hi = isRead ? 150 : 165, d = wpm < lo ? lo - wpm : wpm > hi ? wpm - hi : 0; return clamp(max - d * (max / 60), 0, max); };
  const pausePts = max => ppm < 2 ? max * 0.4 : ppm > 14 ? max * 0.5 : max * (long ? 0.85 : 1);
  if (!out.hasText) { out.score = null; out.tips.push("No speech was transcribed, so only timing and pauses are shown. Add a transcript below, or try again closer to the microphone."); return out; }

  if (isRead) {
    const ref = tokens(passage.text), hit = lcsMatch(ref, words); out.accuracy = hit.size / ref.length;
    out.missed = ref.map((w, i) => hit.has(i) ? null : i).filter(x => x !== null); out.hit = hit;
    out.sub = { Accuracy: Math.round(out.accuracy * 50) + "/50", Pace: Math.round(pacePts(30)) + "/30", Pauses: Math.round(pausePts(20)) + "/20" };
    out.score = Math.round(out.accuracy * 50 + pacePts(30) + pausePts(20));
    if (out.accuracy < 0.85) out.tips.push("You skipped or changed some words. Slow down a little and follow the line with your eyes before you speak it."); else out.good.push("You read the passage accurately.");
    if (wpm > 150) out.tips.push(`You read at about ${out.wpm} words per minute. Aim for 120 to 145 and breathe at each full stop.`); else if (wpm < 100) out.tips.push(`At about ${out.wpm} words per minute you sound hesitant. Read in longer phrases and keep the rhythm going.`); else out.good.push(`Your pace of ${out.wpm} words per minute is easy to follow.`);
    if (ppm < 2) out.tips.push("You barely paused. Stop for a full beat at each full stop; the silence is the skill.");
    return out;
  }
  const fc = countFillers(text); out.fillers = fc; out.fillerCount = Object.values(fc).reduce((a, b) => a + b, 0) + out.repeats; out.fpm = out.fillerCount / mins;
  const txt = " " + words.join(" ") + " ", firstWords = words.slice(0, 5).join(" ");
  const opening = !/^(um|uh|so um|well|like|i guess|i dont know|i don't know|okay so|ok so)/.test(firstWords) && audio.startDelay < 5;
  const reason = /\b(because|since|the reason|so that|that's why|that is why|therefore|as a result)\b/.test(txt);
  const example = /\b(for example|for instance|such as|once|last (week|year|month)|when i|imagine|take the|a time when)\b/.test(txt);
  const tail = " " + words.slice(Math.floor(n * 0.75)).join(" ") + " ";
  const close = /\b(in summary|to sum up|in conclusion|the takeaway|overall|bottom line|my recommendation|in short|ultimately|that's why|which is why|so the point|finally)\b/.test(tail);
  const signs = (txt.match(/\b(first|second|third|finally|next|then|also|another)\b/g) || []).length;
  const hedges = (txt.match(HEDGES) || []).length, hedgeRate = hedges / Math.max(n / 100, 0.5);
  const structure = (opening ? 6 : 0) + (reason ? 6 : 0) + (example ? 8 : 0) + (close ? 6 : 0) + (signs >= 2 ? 4 : signs ? 2 : 0) - (hedgeRate > 4 ? 3 : 0);
  const fillPts = clamp(30 - 7 * out.fpm, 0, 30), timeRatio = dur / (node.targetSec || dur), timePts = 10 * clamp(timeRatio / 0.9, 0, 1);
  const isPause = node.kind === "pause";
  out.sub = { Fillers: Math.round(fillPts) + "/30", Structure: Math.round(clamp(structure, 0, 30)) + "/30", Pace: Math.round(pacePts(20)) + "/20", Pauses: Math.round(pausePts(10)) + "/10", Time: Math.round(timePts) + "/10" };
  out.score = Math.round(clamp(fillPts + clamp(structure, 0, 30) + pacePts(20) + pausePts(10) + timePts, 0, 100));
  if (isPause) out.score = Math.round(clamp(fillPts * 1.8 + pausePts(10) * 1.5 + pacePts(15) + timePts * 0.6 + (out.repeats ? 0 : 5), 0, 100));
  if (out.fpm <= 1) out.good.push("Very few filler words. Keep replacing them with pauses."); else out.tips.push(`About ${out.fpm.toFixed(1)} filler words per minute. When you feel one coming, close your mouth for one beat instead.`);
  if (out.repeats > 1) out.tips.push(`You repeated a word ${out.repeats} times (such as "I I" or "the the"). Finish the thought in your head before you start the sentence.`);
  if (!opening) out.tips.push(audio.startDelay >= 5 ? "You took a long time to begin. Start with your main point within a couple of seconds." : "Your opening started with a filler or a hedge. Start with your point: 'I believe...' or 'The key issue is...'.");
  if (!reason) out.tips.push("Add a reason. Use the word 'because' once in your answer.");
  if (!example) out.tips.push("Back up your point with a short example, such as 'For example, last month...'.");
  if (!close && n > 40) out.tips.push("End on purpose. Finish with a one sentence takeaway, then stop talking.");
  if (hedgeRate > 4) out.tips.push("You used a lot of softeners ('I think', 'maybe', 'just'). Cut half of them to sound more certain.");
  if (wpm > 165) out.tips.push(`You spoke at about ${out.wpm} words per minute. Slow down and let your key ideas land.`); else if (wpm < 115 && n > 30) out.tips.push(`About ${out.wpm} words per minute is slow. Try linking your ideas so you do not stall between sentences.`); else out.good.push(`Good pace at ${out.wpm} words per minute.`);
  if (ppm < 2 && dur > 20) out.tips.push("You hardly paused. Add a short silence after each key point.");
  if (long) out.tips.push(`You had ${long} pause${long > 1 ? "s" : ""} longer than 3 seconds. Keep a bridge phrase ready, such as 'Let me give an example'.`);
  if (timeRatio < 0.8) out.tips.push(`You used ${Math.round(timeRatio * 100)}% of the time. Build one more point so you can hold the floor for the full ${fmt(node.targetSec)}.`); else out.good.push("You used your time well.");
  if (opening && reason) out.good.push("Clear opening with a reason behind it.");
  if (example) out.good.push("You used an example, which makes your point memorable.");
  return out;
}

/* ---------- recorder ---------- */
const SRClass = window.SpeechRecognition || window.webkitSpeechRecognition;
class Recorder {
  async start(onTick, onText) {
    this.running = true; this.levels = []; this.final = ""; this.chunks = []; this.onText = onText;
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    try { this.mr = new MediaRecorder(this.stream); this.mr.ondataavailable = e => e.data && e.data.size && this.chunks.push(e.data); this.mr.start(); } catch (e) { this.mr = null; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext; this.ac = new AC(); if (this.ac.state === "suspended") this.ac.resume();
      this.an = this.ac.createAnalyser(); this.an.fftSize = 1024; this.ac.createMediaStreamSource(this.stream).connect(this.an);
    } catch (e) { this.an = null; }
    this.t0 = performance.now(); const buf = new Float32Array(1024);
    this.timer = setInterval(() => {
      let rms = 0; if (this.an) { this.an.getFloatTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]; rms = Math.sqrt(s / buf.length); }
      this.levels.push(rms); onTick(rms, (performance.now() - this.t0) / 1000);
    }, 100);
    if (S.tx && SRClass) {
      try {
        const sr = this.sr = new SRClass(); sr.continuous = true; sr.interimResults = true; sr.lang = "en-US";
        sr.onresult = e => { let interim = ""; for (let i = e.resultIndex; i < e.results.length; i++) { const r = e.results[i]; if (r.isFinal) this.final += r[0].transcript + " "; else interim += r[0].transcript; } this.interim = interim; onText((this.final + interim).trim()); };
        sr.onerror = e => { this.srError = e.error; };
        sr.onend = () => { if (this.running) { try { sr.start(); } catch (e) { /* already started */ } } };
        sr.start();
      } catch (e) { this.sr = null; }
    }
  }
  async stop() {
    this.running = false; clearInterval(this.timer); const dur = (performance.now() - this.t0) / 1000;
    if (this.sr) { try { this.sr.stop(); } catch (e) { /* noop */ } await new Promise(r => setTimeout(r, 600)); }
    let blob = null;
    if (this.mr && this.mr.state !== "inactive") blob = await new Promise(res => { this.mr.onstop = () => res(new Blob(this.chunks, { type: this.mr.mimeType || "audio/webm" })); this.mr.stop(); });
    this.stream.getTracks().forEach(t => t.stop()); try { this.ac && this.ac.close(); } catch (e) { /* noop */ }
    return { dur, blob, text: (this.final + (this.interim || "")).trim().replace(/\s+/g, " "), levels: this.levels, srError: this.srError };
  }
  cancel() { this.running = false; clearInterval(this.timer); try { this.sr && this.sr.abort(); } catch (e) { /* noop */ } try { this.mr && this.mr.state !== "inactive" && this.mr.stop(); } catch (e) { /* noop */ } this.stream && this.stream.getTracks().forEach(t => t.stop()); try { this.ac && this.ac.close(); } catch (e) { /* noop */ } }
}

/* ---------- view state ---------- */
let V = { tab: "path", lesson: null };
let rec = null, prepTimer = null, recTimeout = null, audioURL = null;
const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];
function hashStr(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }
function lessonContent(node) {
  const attempt = (S.progress[node.id] && S.progress[node.id].attempts) || 0;
  if (node.kind === "read") return { passage: PASSAGES[node.passage] };
  if (node.kind === "spot") { const q = pick(QUESTIONS, hashStr(node.id) + attempt); return { prompt: q.q, tip: q.tip }; }
  return { prompt: pick(TOPICS[node.topicLevel], hashStr(node.id) + attempt) };
}

/* ---------- rendering ---------- */
function topBar() {
  const si = streakInfo(), pct = clamp(secToday() / goalSec() * 100, 0, 100), min = Math.floor(secToday() / 60);
  return `<header class="top"><div class="chip flame" title="Day streak">${ico("flame")}${si.count}</div>
  <div class="goal"><div class="small"><span>Today</span><span>${min} / ${S.goalMin} min</span></div><div class="bar"><i style="width:${pct}%"></i></div></div>
  <div class="chip" title="Streak freezes" aria-label="${S.freezes} streak freezes">❄ ${S.freezes}</div></header>`;
}
function riskBanner() {
  const si = streakInfo(), now = new Date(); if (secToday() >= goalSec()) return "";
  const [h, m] = S.remind.split(":").map(Number), late = now.getHours() * 60 + now.getMinutes() >= h * 60 + m;
  if (si.lost) return `<div class="banner">${ico("flame")}<div>Your ${si.lost} day streak ended. Practice ${S.goalMin} minutes today to start a new one.</div></div>`;
  if (si.count > 0 && (late || si.atRisk)) return `<div class="banner">${ico("flame")}<div><b>Your ${si.count} day streak is at risk.</b> ${Math.max(0, Math.ceil((goalSec() - secToday()) / 60))} more minutes keeps it alive.${si.freeze ? " A streak freeze will cover yesterday." : ""}</div></div>`;
  return "";
}
function pathView() {
  const cur = currentNode(); let i = 0;
  const units = UNITS.map(u => `<section class="unit"><div class="unit-head"><span class="eyebrow">Unit ${u.id}</span><h2>${esc(u.title)}</h2><span class="small">${esc(u.blurb)}</span></div><div class="nodes">${u.nodes.map(n => {
    const done = isDone(n.id), unl = isUnlocked(n.id), isCur = n.id === cur.id, off = Math.round(Math.sin(i++ * 0.95) * 62), p = S.progress[n.id] || {};
    const stars = p.stars ? "★".repeat(p.stars) + "☆".repeat(3 - p.stars) : "";
    return `<div class="node ${done ? "done" : ""} ${unl ? "" : "locked"} ${isCur ? "current" : ""}" style="transform:translateX(${off}px)">${isCur ? '<span class="start-pill">START</span>' : ""}
      <button data-act="open" data-id="${n.id}" aria-label="${esc(n.title)}${unl ? "" : " (locked)"}"><span class="orb">${ico(done ? "check" : unl ? n.kind : "lock")}</span></button><span class="label">${esc(n.title)}</span><span class="stars" aria-hidden="true">${stars}</span></div>`;
  }).join("")}</div></section>`).join("");
  return `${topBar()}<div class="stack">${riskBanner()}<button class="btn" data-act="open" data-id="${cur.id}">${ico(cur.kind === "milestone" ? "milestone" : "mic")} Start today's practice: ${esc(cur.title)}</button></div>${units}`;
}
function spotView() {
  const q = V.spotQ || (V.spotQ = pick(QUESTIONS, Math.floor(Math.random() * 100)));
  return `${topBar()}<div class="stack"><h1>On the spot</h1><p class="muted">Practice answering unexpected questions. Free practice counts towards your daily goal.</p>
  <div class="card stack"><span class="small muted">Random question</span><div class="prompt">${esc(q.q)}</div><div class="fw"><b>Tip</b><span>${esc(q.tip)}</span></div>
  <button class="btn" data-act="spot-start">${ico("mic")} Answer this (45 sec)</button><button class="btn ghost" data-act="spot-next">Another question</button></div>
  <h2>Your toolkit</h2>${TOOLKIT.map(t => `<div class="card"><h3>${esc(t.name)}</h3><p class="muted" style="margin-top:6px">${esc(t.body)}</p></div>`).join("")}</div>`;
}
function statsView() {
  const days = []; for (let i = 6; i >= 0; i--) { const k = addDays(dkey(), -i), d = S.days[k] || { sec: 0 }; days.push({ k, sec: d.sec, met: d.sec >= goalSec(), lbl: new Date(k + "T00:00:00").toLocaleDateString(undefined, { weekday: "narrow" }) }); }
  const maxS = Math.max(goalSec() * 1.2, ...days.map(d => d.sec)), tot = Object.values(S.days).reduce((a, d) => a + d.sec, 0);
  const sc = S.history.filter(h => h.score != null), last = sc.slice(-8), avg = sc.length ? Math.round(sc.reduce((a, h) => a + h.score, 0) / sc.length) : "–";
  const fl = S.history.filter(h => h.fpm != null).slice(-8);
  let spark = "";
  if (fl.length > 1) { const mx = Math.max(...fl.map(h => h.fpm), 2), pts = fl.map((h, i) => `${(i / (fl.length - 1)) * 280 + 10},${70 - (h.fpm / mx) * 60}`).join(" "); spark = `<svg viewBox="0 0 300 80" width="100%" role="img" aria-label="Filler words per minute over your last sessions"><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${fl.map((h, i) => `<circle cx="${(i / (fl.length - 1)) * 280 + 10}" cy="${70 - (h.fpm / mx) * 60}" r="4" fill="var(--accent)"/>`).join("")}</svg>`; }
  const done = ALL_NODES.filter(n => isDone(n.id)).length;
  return `${topBar()}<div class="stack"><h1>Progress</h1>
  <div class="sub"><div class="stat"><b>${S.streak.best}</b><span>Best streak (days)</span></div><div class="stat"><b>${Math.round(tot / 60)}</b><span>Total minutes</span></div><div class="stat"><b>${avg}</b><span>Average score</span></div><div class="stat"><b>${done}/${ALL_NODES.length}</b><span>Lessons done</span></div></div>
  <div class="card stack"><h3>Last 7 days</h3><div class="bars">${days.map(d => `<div class="b ${d.met ? "met" : ""}"><i style="height:${Math.max(3, d.sec / maxS * 100)}%"></i><span>${d.lbl}</span></div>`).join("")}</div><p class="small muted">Teal bars mean you reached your ${S.goalMin} minute goal.</p></div>
  <div class="card stack"><h3>Filler words per minute</h3>${spark || '<p class="muted small">Finish two speaking lessons to see your trend.</p>'}<p class="small muted">Lower is better. This counts spoken fillers and repeated words.</p></div>
  <div class="card stack"><h3>Badges</h3><div class="row" style="flex-wrap:wrap">${S.badges.length ? S.badges.map(b => `<span class="badge">${ico("milestone")}${esc(BADGES[b] || b)}</span>`).join("") : '<p class="muted small">Hit a streak milestone or finish a unit to earn badges.</p>'}</div></div>
  <div class="card"><h3>Recent sessions</h3><div class="list">${S.history.slice(-6).reverse().map(h => `<div class="row between"><span class="grow">${esc(h.title)}<br><span class="small muted">${new Date(h.ts).toLocaleDateString()} · ${fmt(h.dur)}</span></span><b>${h.score == null ? "–" : h.score}</b></div>`).join("") || '<p class="muted small">No sessions yet.</p>'}</div></div></div>`;
}
function meView() {
  const perm = "Notification" in window ? Notification.permission : "unsupported";
  return `${topBar()}<div class="stack"><h1>Settings</h1>
  <div class="card stack"><h3>Daily goal</h3><div class="seg" role="group" aria-label="Daily goal in minutes">${[5, 10, 15, 20].map(m => `<button class="${S.goalMin === m ? "on" : ""}" data-act="goal" data-m="${m}">${m} min</button>`).join("")}</div><p class="small muted">Minutes of active practice per day keep your streak alive. Start with 5 and raise it as it gets easy.</p></div>
  <div class="card stack"><h3>Daily reminder</h3><label class="small muted" for="remind">Remind me at</label><input type="time" id="remind" value="${S.remind}" data-act-change="remind">
  <button class="btn ghost" data-act="ics">${ico("bell")} Add a repeating reminder to my phone's calendar</button>
  <button class="btn ghost" data-act="notif" ${perm === "granted" || perm === "unsupported" ? "disabled" : ""}>${perm === "granted" ? "Notifications on" : perm === "unsupported" ? "Notifications not supported here" : "Allow notifications while the app is open"}</button>
  <p class="small muted">The calendar reminder is the most dependable option: it fires even when the app is closed. In-app alerts only appear when you open Fillerless.</p></div>
  <div class="card stack"><h3>Transcription</h3><div class="seg"><button class="${S.tx ? "on" : ""}" data-act="tx" data-v="1">On</button><button class="${S.tx ? "" : "on"}" data-act="tx" data-v="0">Off</button></div><p class="small muted">${SRClass ? "Uses your browser's speech recognition. Many browsers hide 'um' and 'uh' from the transcript, so Fillerless also measures your pauses from the audio." : "This browser has no speech recognition. Open Fillerless in Chrome on Android or Safari on iPhone for scoring, or add a transcript by hand."}</p></div>
  <div class="card stack"><h3>AI coaching</h3><div class="seg" role="group" aria-label="AI provider"><button class="${S.ai.provider === "gemini" ? "on" : ""}" data-act="ai-prov" data-v="gemini">Gemini (free tier)</button><button class="${S.ai.provider === "claude" ? "on" : ""}" data-act="ai-prov" data-v="claude">Claude</button></div>
  <label class="small muted" for="aikey">${S.ai.provider === "gemini" ? "Gemini API key (create one free in Google AI Studio)" : "Anthropic API key"}</label><input type="password" id="aikey" value="${esc(S.ai.key)}" autocomplete="off" style="width:100%;font:inherit;color:var(--ink);background:var(--bg);border:2px solid var(--line);border-radius:12px;padding:10px">
  <label class="small muted" for="aimodel">Model (leave blank for ${AI_DEFAULT[S.ai.provider]})</label><input type="text" id="aimodel" value="${esc(S.ai.model)}" style="width:100%;font:inherit;color:var(--ink);background:var(--bg);border:2px solid var(--line);border-radius:12px;padding:10px">
  <p class="small muted">The key stays on this device and is sent only to the provider you pick. After each session you can send the transcript text (never audio) for written coaching. Free tiers have usage limits and may let the provider use your text to improve its models, so avoid confidential material.</p></div>
  <div class="card stack"><h3>Your data</h3><p class="small muted">Everything stays on this device. Recordings are not saved or uploaded.</p><button class="btn ghost" data-act="export">Copy my data as text</button><button class="btn danger" data-act="reset">Reset all progress</button></div></div>`;
}
function tabs() {
  const t = [["path", "Path", "path"], ["spot", "On the spot", "spot"], ["stats", "Progress", "stats"], ["me", "Settings", "me"]];
  return `<nav class="tabs" aria-label="Main"><div>${t.map(([k, l, i]) => `<button class="tab ${V.tab === k ? "on" : ""}" data-act="tab" data-t="${k}" ${V.tab === k ? 'aria-current="page"' : ""}>${ico(i)}<span>${l}</span></button>`).join("")}</div></nav>`;
}
function render() {
  const app = $("#app"); document.body.dataset.view = V.lesson ? "lesson" : V.tab;
  if (V.lesson) { app.innerHTML = lessonView(); return; }
  const v = { path: pathView, spot: spotView, stats: statsView, me: meView }[V.tab]();
  app.innerHTML = `${v}${tabs()}`;
}

/* ---------- lessons ---------- */
function lessonView() {
  const L = V.lesson, n = L.node, head = `<div class="lhead"><button class="x" data-act="close" aria-label="Close lesson">${ico("x")}</button><div class="grow"><b>${esc(n.title)}</b></div></div>`;
  if (L.stage === "intro") {
    const fw = n.fw ? FRAMEWORKS[n.fw] : null, intro = n.intro || (n.kind === "spot" ? { h: "Think on your feet", t: "You will get a question. Take a breath, answer first, add one reason, then stop. Do not apologise or ramble." } : n.kind === "speak" ? { h: "Speak for the full time", t: "Open with your main point, give one example, and close with a takeaway." } : { h: n.title, t: "" });
    return `${head}<div class="stack"><div class="card stack"><h2>${esc(fw ? fw.title : intro.h)}</h2><p>${esc(fw ? fw.body : intro.t)}</p>${fw ? `<div class="fw"><b>Example</b><em>${esc(fw.example)}</em></div>` : ""}
    ${n.targetSec ? `<p class="small muted">Target: ${fmt(n.targetSec)}${n.prepSec ? ` · ${n.prepSec} seconds to prepare` : ""}</p>` : ""}</div><button class="btn" data-act="begin">${ico("mic")} Continue</button></div>`;
  }
  if (L.stage === "prep") return `${head}<div class="stack"><div class="card stack center"><span class="small muted">${n.kind === "spot" ? "Question" : "Your topic"}</span><div class="prompt">${esc(L.content.prompt)}</div>${L.content.tip ? `<div class="fw"><b>Tip</b><span>${esc(L.content.tip)}</span></div>` : ""}${n.fw ? `<div class="fw"><b>${esc(FRAMEWORKS[n.fw].name)}</b><span>${esc(FRAMEWORKS[n.fw].body)}</span></div>` : ""}</div>
    <div class="ring" style="--p:${L.prepLeft / n.prepSec * 100}"><div id="prepnum">${L.prepLeft}</div></div><p class="center muted">Think of your first sentence. Speak when the timer ends.</p><button class="btn" data-act="skip-prep">I'm ready</button></div>`;
  if (L.stage === "record") {
    const body = n.kind === "read" ? `<div class="card passage" id="passage">${wordsHTML(L.content.passage.text)}</div>` : `<div class="card stack center"><div class="prompt">${esc(L.content.prompt)}</div>${n.fw ? `<div class="fw"><b>${esc(FRAMEWORKS[n.fw].name)}</b><em>${esc(FRAMEWORKS[n.fw].body)}</em></div>` : ""}</div>`;
    return `${head}<div class="stack">${body}<div class="row" style="justify-content:center"><span class="rec-dot"></span><b id="timerlbl">0:00</b>${n.targetSec ? `<span class="muted">/ ${fmt(n.targetSec)}</span>` : ""}</div><div class="meter" id="meter" aria-hidden="true">${"<i></i>".repeat(14)}</div>
    <div class="card live" id="live">${S.tx && SRClass ? "Listening..." : "Recording..."}</div><button class="btn danger" data-act="stop">Stop and get feedback</button></div>`;
  }
  if (L.stage === "result") return resultView(head);
  return head;
}
function wordsHTML(text, missedSet) {
  let idx = -1; return esc(text).replace(/[A-Za-z][A-Za-z'’-]*/g, w => { idx++; return `<button class="w ${missedSet && missedSet.has(idx) ? "miss" : ""}" data-act="word" data-w="${w.toLowerCase().replace(/[’]/g, "'")}">${w}</button>`; });
}
function resultView(head) {
  const L = V.lesson, n = L.node, r = L.res, a = L.an;
  const stars = a.score == null ? 0 : a.score >= 85 ? 3 : a.score >= 70 ? 2 : a.score >= 50 ? 1 : 0;
  const completes = L.completes;
  const ring = a.score == null ? `<div class="ring big" style="--p:100"><div>${fmt(r.dur)}</div></div>` : `<div class="ring big" style="--p:${a.score}"><div>${a.score}</div></div>`;
  let tx = "";
  if (a.hasText) {
    if (n.kind === "read") tx = `<div class="card stack"><h3>Words to revisit</h3><div class="passage small" style="font-size:16px">${wordsHTML(L.content.passage.text, new Set(a.missed))}</div><p class="small muted">Highlighted words were skipped or misheard. Tap a word for its meaning.</p></div>`;
    else tx = `<div class="card stack"><h3>What we heard</h3><p class="transcript">${hlTranscript(r.text)}</p></div>`;
  } else tx = `<div class="card stack"><h3>Add a transcript</h3><p class="small muted">Type or paste roughly what you said to get full feedback.</p><textarea id="manual" aria-label="Transcript"></textarea><button class="btn ghost" data-act="manual">Analyse</button></div>`;
  const fillers = a.fillers && Object.keys(a.fillers).length ? `<div>${Object.entries(a.fillers).map(([k, v]) => `<span class="tag">${esc(k)} ×${v}</span>`).join("")}${a.repeats ? `<span class="tag">repeated words ×${a.repeats}</span>` : ""}</div>` : a.fillers ? '<span class="tag ok">No fillers detected</span>' : "";
  return `${head}<div class="stack"><div class="card stack center">${ring}<h2>${completes ? (stars === 3 ? "Excellent" : stars === 2 ? "Strong work" : "Lesson complete") : "Almost there"}</h2><div class="stars" style="font-size:22px;height:auto">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>${L.msg ? `<div class="banner">${ico("flame")}<div>${esc(L.msg)}</div></div>` : ""}${completes ? "" : `<p class="muted">Speak for at least ${fmt(Math.round((n.targetSec || 30) * 0.6))} to complete this lesson.</p>`}</div>
  <div class="sub"><div class="stat"><b>${fmt(r.dur)}</b><span>Time</span></div><div class="stat"><b>${a.hasText ? a.wpm : "–"}</b><span>Words / min</span></div><div class="stat"><b>${a.pauses}</b><span>Pauses${a.longest ? ` (longest ${a.longest.toFixed(1)}s)` : ""}</span></div><div class="stat"><b>${a.fpm != null ? a.fpm.toFixed(1) : a.accuracy != null ? Math.round(a.accuracy * 100) + "%" : "–"}</b><span>${a.fpm != null ? "Fillers / min" : "Accuracy"}</span></div></div>
  ${Object.keys(a.sub).length ? `<div class="card stack"><h3>Score breakdown</h3><div class="row" style="flex-wrap:wrap">${Object.entries(a.sub).map(([k, v]) => `<span class="badge">${k} ${v}</span>`).join("")}</div>${fillers}</div>` : ""}
  ${a.good.length ? `<div class="card soft stack"><h3>What worked</h3><ul class="tips">${a.good.map(t => `<li>${esc(t)}</li>`).join("")}</ul></div>` : ""}
  ${a.tips.length ? `<div class="card stack"><h3>Work on next</h3><ul class="tips">${a.tips.slice(0, 4).map(t => `<li>${esc(t)}</li>`).join("")}</ul></div>` : ""}
  ${aiCard(L, a)}
  ${tx}${audioURL ? `<div class="card stack"><h3>Listen back</h3><audio controls src="${audioURL}" style="width:100%"></audio></div>` : ""}
  <p class="small muted center">Transcripts from browsers often leave out "um" and "uh". Pause and pace measurements come from the audio itself.</p>
  <button class="btn" data-act="finish">${completes ? "Continue" : "Close"}</button><button class="btn ghost" data-act="retry">Try again</button></div>`;
}
function hlTranscript(t) {
  const fc = new Set(["um", "uh", "er", "erm", "ah", "basically", "actually", "literally", "like"]);
  const w = t.split(/\s+/); return w.map((x, i) => { const low = x.toLowerCase().replace(/[^a-z']/g, ""); const hit = FILLER_RX.some(([, rx]) => rx.test(low)) || (low === "like" && !LIKE_BEFORE.has((w[i - 1] || "").toLowerCase())) || (low === "know" && (w[i - 1] || "").toLowerCase() === "you"); return hit ? `<span class="hl">${esc(x)}</span>` : esc(x); }).join(" ");
}

/* ---------- lesson flow ---------- */
function openNode(id) {
  const node = nodeById(id); if (!node) return;
  if (!isUnlocked(id)) { toast("Finish the previous lesson to unlock this one."); return; }
  if (node.kind === "milestone") { completeMilestone(node); return; }
  startLesson(node);
}
function startLesson(node, contentOverride) {
  stopAll(); V.lesson = { node, stage: "intro", content: contentOverride || lessonContent(node), t0: Date.now() }; render(); window.scrollTo(0, 0);
}
function completeMilestone(node) {
  const first = !isDone(node.id); S.progress[node.id] = Object.assign(S.progress[node.id] || {}, { done: true, stars: 3 });
  let m = `${node.title} unlocked.`; if (first && node.badge) awardBadge(node.badge); save(); render();
  openSheet(`<div class="confetti">🏆</div><h2 class="center">${esc(node.title)}</h2><p class="center muted">${esc(node.blurb)} Keep your streak going to reach the next unit.</p><button class="btn" data-act="sheet-close">Keep going</button>`);
}
function stopAll() { clearInterval(prepTimer); clearTimeout(recTimeout); if (rec) { rec.cancel(); rec = null; } if (audioURL) { URL.revokeObjectURL(audioURL); audioURL = null; } }
function beginPrepOrRecord() {
  const L = V.lesson, n = L.node;
  if (n.kind === "read" || !n.prepSec) { L.stage = "record"; render(); startRecording(); return; }
  L.stage = "prep"; L.prepLeft = n.prepSec; render();
  prepTimer = setInterval(() => { L.prepLeft -= 1; if (L.prepLeft <= 0) { clearInterval(prepTimer); L.stage = "record"; render(); startRecording(); } else render(); }, 1000);
}
async function startRecording() {
  const L = V.lesson, n = L.node; rec = new Recorder();
  try {
    await rec.start((lvl, t) => {
      const lbl = $("#timerlbl"); if (lbl) lbl.textContent = fmt(t);
      const m = $("#meter"); if (m) [...m.children].forEach((el, i) => { el.style.height = Math.max(4, Math.min(36, lvl * 400 * (0.5 + Math.abs(Math.sin(t * 6 + i)) * 0.5))) + "px"; });
    }, txt => { const el = $("#live"); if (el) { el.textContent = txt.slice(-300); el.scrollTop = el.scrollHeight; } });
    if (n.targetSec && n.kind !== "read") recTimeout = setTimeout(() => stopRecording(), n.targetSec * 1000);
  } catch (e) {
    rec = null; L.stage = "intro"; render(); toast("Microphone blocked. Allow microphone access for this site and try again.");
  }
}
async function stopRecording() {
  if (!rec) return; clearTimeout(recTimeout); const r = await rec.stop(); rec = null; const L = V.lesson; if (!L) return;
  audioURL = r.blob ? URL.createObjectURL(r.blob) : null; L.res = r; scoreResult(r.text); L.stage = "result"; render(); window.scrollTo(0, 0);
}
function scoreResult(text) {
  const L = V.lesson, n = L.node, r = L.res; r.text = text;
  L.an = analyze(text, r.dur, analyzeAudio(r.levels), n, L.content.passage);
  const need = n.kind === "read" ? (L.an.hasText ? L.an.accuracy >= 0.6 : r.dur >= 20) : r.dur >= (n.targetSec || 30) * 0.6;
  L.completes = need;
  if (!L.logged) { L.logged = true; const active = clamp((Date.now() - L.t0) / 1000, r.dur, 900); L.msg = addPractice(active); }
}
function finishLesson() {
  const L = V.lesson, n = L.node, a = L.an; if (!L) return;
  if (L.completes) {
    const p = S.progress[n.id] || (S.progress[n.id] = { attempts: 0 }); const stars = a.score == null ? 1 : a.score >= 85 ? 3 : a.score >= 70 ? 2 : a.score >= 50 ? 1 : 0;
    p.done = true; p.attempts += 1; p.best = Math.max(p.best || 0, a.score || 0); p.stars = Math.max(p.stars || 0, stars);
    S.history.push({ ts: Date.now(), title: n.title, kind: n.kind, score: a.score, fpm: a.fpm != null ? +a.fpm.toFixed(2) : null, wpm: a.wpm, dur: Math.round(L.res.dur) }); S.history = S.history.slice(-200);
  }
  save(); stopAll(); V.lesson = null; render(); window.scrollTo(0, 0);
}

/* ---------- AI coaching (your own API key, called straight from this device) ---------- */
const AI_DEFAULT = { gemini: "gemini-2.5-flash", claude: "claude-sonnet-4-5" };
function aiCard(L, a) {
  if (!a.hasText) return "";
  if (L.ai) {
    const x = L.ai, li = arr => (arr || []).map(t => `<li>${esc(t)}</li>`).join("");
    return `<div class="card stack"><h3>AI coach</h3><p>${esc(x.summary || "")}</p>
    ${x.strengths && x.strengths.length ? `<div class="fw"><b>What worked</b><ul class="tips">${li(x.strengths)}</ul></div>` : ""}
    ${x.improvements && x.improvements.length ? `<div class="stack"><b>Improve next</b>${x.improvements.map(i => `<div class="fw"><b>${esc(i.focus || "")}</b><span>${esc(i.advice || "")}</span>${i.before ? `<em>You said: "${esc(i.before)}"</em>` : ""}${i.after ? `<span><b>Try:</b> "${esc(i.after)}"</span>` : ""}</div>`).join("")}</div>` : ""}
    ${x.rewrite ? `<div class="fw"><b>A tighter version of your answer</b><span>${esc(x.rewrite)}</span></div>` : ""}
    ${x.next_drill ? `<p><b>Next drill:</b> ${esc(x.next_drill)}</p>` : ""}</div>`;
  }
  if (!S.ai.key) return `<div class="card stack"><h3>AI coach</h3><p class="small muted">Get written coaching on your structure, wording and delivery. It needs a free API key, added once in Settings.</p><button class="btn ghost" data-act="ai-setup">Set up AI coaching</button></div>`;
  if (L.aiLoading) return `<div class="card stack center"><h3>AI coach</h3><p class="muted">Reading your answer...</p></div>`;
  return `<div class="card stack"><h3>AI coach</h3>${L.aiErr ? `<div class="banner">${ico("flame")}<div>${esc(L.aiErr)}</div></div>` : '<p class="small muted">Sends the transcript text (not your audio) to your chosen AI provider.</p>'}<button class="btn" data-act="ai-go">Get AI coaching</button></div>`;
}
function aiPrompt(L, a) {
  const n = L.node, r = L.res, isRead = n.kind === "read";
  const task = isRead ? `The speaker read this passage aloud: "${L.content.passage.text}"` : `Exercise type: ${n.kind}${n.fw ? " using the " + FRAMEWORKS[n.fw].title + " framework" : ""}. Prompt: "${L.content.prompt}". Target length: ${n.targetSec} seconds.`;
  return `You are a warm, direct speaking coach helping a professional stop using filler words and speak with confident structure. ${task}
Transcript of what they said (speech recognition, so punctuation and some "um"s are missing): "${r.text}"
Measured: ${Math.round(r.dur)} seconds, ${a.wpm} words per minute, ${a.pauses} pauses, ${a.fillerCount != null ? a.fillerCount + " filler words or repeats" : "reading accuracy " + Math.round((a.accuracy || 0) * 100) + "%"}.
Coach only on what the transcript shows. Be specific and quote their words. Do not invent things they did not say. Plain language, no em dashes.
Reply with JSON only, in this shape: {"summary": "2 sentences", "strengths": ["1 to 2 items"], "improvements": [{"focus": "short label", "advice": "one concrete step", "before": "short quote from them", "after": "better wording"}], "rewrite": "a tighter version of their answer in at most 4 sentences (empty string for read-aloud exercises)", "next_drill": "one small drill for tomorrow"}. Give at most 3 improvements.`;
}
async function aiCall(prompt) {
  const { provider, key } = S.ai, model = S.ai.model || AI_DEFAULT[provider];
  if (provider === "claude") {
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" }, body: JSON.stringify({ model, max_tokens: 1200, messages: [{ role: "user", content: prompt }] }) });
    const j = await r.json(); if (!r.ok) throw new Error((j.error && j.error.message) || "Request failed"); return j.content.map(c => c.text || "").join("");
  }
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": key }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.4 } }) });
  const j = await r.json(); if (!r.ok) throw new Error((j.error && j.error.message) || "Request failed");
  return ((j.candidates || [])[0] || { content: { parts: [] } }).content.parts.map(p => p.text || "").join("");
}
async function getCoaching() {
  const L = V.lesson; if (!L || L.aiLoading) return; L.aiLoading = true; L.aiErr = ""; render();
  try {
    const raw = await aiCall(aiPrompt(L, L.an)), m = raw.replace(/^```(json)?|```$/gm, "").trim(), obj = JSON.parse(m.slice(m.indexOf("{"), m.lastIndexOf("}") + 1));
    L.ai = obj;
  } catch (e) {
    L.aiErr = /key|API_KEY|permission|auth/i.test(e.message) ? "The provider rejected your key. Check it in Settings." : /quota|rate|429/i.test(e.message) ? "You hit the free usage limit. Try again in a minute." : e instanceof SyntaxError ? "The coach replied in an unexpected format. Try again." : "Could not reach the AI provider. Check your connection and try again.";
  }
  if (V.lesson === L) { L.aiLoading = false; render(); }
}

/* ---------- word meanings ---------- */
const dictCache = {};
async function showWord(w) {
  const L = V.lesson, p = L && L.content.passage, g = p && p.gloss && p.gloss[w];
  openSheet(`<h2>${esc(w)}</h2><p id="def" class="muted">${g ? esc(g) : "Looking up..."}</p><button class="btn" data-act="sheet-close">Got it</button>`);
  if (g) return;
  try {
    if (!dictCache[w]) { const r = await fetch("https://api.dictionaryapi.dev/v2/entries/en/" + encodeURIComponent(w)); if (!r.ok) throw new Error("none"); const j = await r.json(); dictCache[w] = j[0].meanings.slice(0, 2).map(m => `<b>${esc(m.partOfSpeech)}</b>: ${esc(m.definitions[0].definition)}`).join("<br><br>"); }
    const d = $("#def"); if (d) d.innerHTML = dictCache[w];
  } catch (e) { const d = $("#def"); if (d) d.textContent = "No definition found offline. Try searching for this word online."; }
}
function openSheet(html) { const s = $("#sheet"); s.innerHTML = `<div role="dialog" aria-modal="true">${html}</div>`; s.hidden = false; }
function closeSheet() { $("#sheet").hidden = true; }
let toastT; function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 3200); }

/* ---------- reminders ---------- */
function ics() {
  const [h, m] = S.remind.split(":"), now = new Date(), d = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Fillerless//EN", "BEGIN:VEVENT", `UID:fillerless-daily-${Date.now()}@fillerless`, `DTSTAMP:${d}T000000Z`, `DTSTART:${d}T${h}${m}00`, "DURATION:PT15M", "RRULE:FREQ=DAILY", "SUMMARY:Fillerless practice: keep your streak", "DESCRIPTION:Open Fillerless and practice for a few minutes.", "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Fillerless practice", "TRIGGER:PT0M", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" })); a.download = "fillerless-reminder.ics"; document.body.appendChild(a); a.click(); a.remove(); toast("Open the downloaded file to add the reminder.");
}
function checkReminder() {
  if (!S.notif || !("Notification" in window) || Notification.permission !== "granted") return;
  const now = new Date(), [h, m] = S.remind.split(":").map(Number), k = dkey();
  if (S.lastNotified === k || secToday() >= goalSec() || now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;
  S.lastNotified = k; save(); const si = streakInfo(), body = si.count ? `Keep your ${si.count} day streak alive. ${S.goalMin} minutes is all it takes.` : "Time for your daily speaking practice.";
  navigator.serviceWorker && navigator.serviceWorker.getRegistration().then(reg => reg ? reg.showNotification("Fillerless", { body, icon: "icons/icon-192.png", tag: "daily" }) : new Notification("Fillerless", { body }));
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el) return; const act = el.dataset.act, L = V.lesson;
  switch (act) {
    case "tab": V.tab = el.dataset.t; render(); window.scrollTo(0, 0); break;
    case "open": openNode(el.dataset.id); break;
    case "close": stopAll(); V.lesson = null; render(); break;
    case "begin": beginPrepOrRecord(); break;
    case "skip-prep": clearInterval(prepTimer); L.stage = "record"; render(); startRecording(); break;
    case "stop": stopRecording(); break;
    case "retry": { const n = L.node, keep = L.content; stopAll(); if (n.id !== "free-spot") { const p = S.progress[n.id] || (S.progress[n.id] = { attempts: 0 }); p.attempts += 1; } startLesson(n, n.id === "free-spot" ? keep : undefined); beginPrepOrRecord(); break; }
    case "finish": finishLesson(); break;
    case "word": showWord(el.dataset.w); break;
    case "sheet-close": closeSheet(); break;
    case "manual": { const t = ($("#manual").value || "").trim(); if (tokens(t).length < 5) { toast("Add at least a sentence."); break; } scoreResult(t); render(); break; }
    case "spot-next": V.spotQ = pick(QUESTIONS, Math.floor(Math.random() * 1000)); render(); break;
    case "spot-start": { const node = { id: "free-spot", kind: "spot", title: "On the spot", targetSec: 45, prepSec: 5 }; startLesson(node, { prompt: V.spotQ.q, tip: V.spotQ.tip }); break; }
    case "goal": S.goalMin = +el.dataset.m; save(); render(); break;
    case "tx": S.tx = el.dataset.v === "1"; save(); render(); break;
    case "ics": ics(); break;
    case "ai-prov": S.ai.provider = el.dataset.v; S.ai.model = ""; save(); render(); break;
    case "ai-go": getCoaching(); break;
    case "ai-setup": finishLesson(); V.tab = "me"; render(); break;
    case "notif": Notification.requestPermission().then(p => { S.notif = p === "granted"; save(); render(); }); break;
    case "export": { const t = JSON.stringify(S); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast("Copied."), () => toast("Copy blocked by the browser.")); break; }
    case "reset": openSheet(`<h2>Reset everything?</h2><p class="muted">This clears your streak, minutes and lesson progress on this device.</p><button class="btn danger" data-act="reset-yes">Yes, reset</button><button class="btn ghost" data-act="sheet-close">Cancel</button>`); break;
    case "reset-yes": S = fresh(); save(); closeSheet(); V = { tab: "path", lesson: null }; render(); break;
  }
});
document.addEventListener("change", e => { if (e.target.id === "aikey") { S.ai.key = e.target.value.trim(); save(); toast("Key saved on this device."); } else if (e.target.id === "aimodel") { S.ai.model = e.target.value.trim(); save(); } else if (e.target.id === "remind") { S.remind = e.target.value || "19:00"; S.lastNotified = null; save(); toast("Reminder time saved."); } });
$("#sheet").addEventListener("click", e => { if (e.target.id === "sheet") closeSheet(); });
document.addEventListener("visibilitychange", () => { if (!document.hidden && !V.lesson) { render(); checkReminder(); } });
window.addEventListener("pagehide", () => stopAll());
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => { /* offline cache is optional */ });
render(); checkReminder(); setInterval(checkReminder, 60000);
