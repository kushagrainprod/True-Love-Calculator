/* =====================================================
   LOVE PERCENTAGE CALCULATOR - easy-to-edit settings
   ===================================================== */
const CONFIG = {
  creator: "Kushagra Goyal",
  // Free form-to-email service: https://formsubmit.co (no account or key needed)
  // Change the recipient email here. First submission triggers a one-time activation email.
  recipient: "education.kushagra@gmail.com",
  get endpoint() { return "https://formsubmit.co/ajax/" + this.recipient; },
  shareText: "I just tried the Love Percentage Calculator 😂❤️ Try it yourself:",
  loadingMessages: [
    "Connecting hearts… ❤️", "Analyzing the chemistry… 💕", "Checking compatibility… 👀",
    "Consulting the love algorithm… 🔮", "Comparing the names… 💗", "Almost there…"
  ],
  // [minimum percentage, message] - checked from the top
  verdicts: [
    [90, "Okay… this is suspiciously perfect ❤️👀"],
    [75, "There is definitely something here 😏❤️"],
    [50, "Hmm… the chemistry is getting interesting 👀"],
    [25, "Maybe destiny needs a little help 😂"],
    [1, "The calculator says… keep trying 😭😂"]
  ],
  suspense: ["Wait…", "We found something interesting 👀", "Something about this calculation isn't right…", "Actually…"]
};

const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
let busy = false;       // stops double submissions
let emailSent = false;  // true only if the email service confirmed success

/* ---------- Screens ---------- */
function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
}

/* ---------- Read form ---------- */
function getData() {
  const radio = n => (document.querySelector(`input[name="${n}"]:checked`) || {}).value || "";
  return {
    name1: $("name1").value.trim(), gender1: radio("g1"), relation: radio("rel"),
    name2: $("name2").value.trim(), gender2: radio("g2"), consent: $("consent").checked
  };
}

/* ---------- Validation: button stays disabled until everything is filled ---------- */
function validateForm() {
  const d = getData();
  const ok = d.name1 && d.gender1 && d.relation && d.name2 && d.gender2 && d.consent;
  $("calcBtn").disabled = !ok;
  return !!ok;
}

/* ---------- Deterministic love algorithm (same input = same result) ---------- */
function calculateLovePercentage(d) {
  // Names are sorted so "A+B" and "B+A" give the same answer
  const names = [d.name1, d.name2].map(n => n.toLowerCase().replace(/\s+/g, "")).sort().join("|");
  let h = 7;
  for (const ch of names) h = (h * 31 + ch.charCodeAt(0)) >>> 0;     // mix character values
  h = (h + names.length * 13 + d.relation.length * 7) >>> 0;          // name lengths + relationship
  if (d.gender1 !== d.gender2) h += 11;                               // tiny fun bonus
  return (h % 100) + 1;                                               // always 1..100
}

/* ---------- Send email (Web3Forms) ---------- */
async function sendSubmission(d, pct) {
  const when = new Date().toLocaleString();
  const line = "━━━━━━━━━━━━━━━━━━━━";
  const message =
    `❤️ LOVE CALCULATOR SUBMISSION

🕐 Date & Time:
${when}

${line}

👤 PERSON 1

Name:
${d.name1}

Gender:
${d.gender1}

Relationship:
${d.relation}

${line}

👤 PERSON 2

Name:
${d.name2}

Gender:
${d.gender2}

${line}

❤️ LOVE RESULT

Love Percentage:
${pct}%

${line}

🎭 PRANK WEBSITE

Created by:
${CONFIG.creator}`;

  try {
    const res = await fetch(CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `❤️ Love Calculator Submission — ${d.name1} ❤️ ${d.name2}`,
        _captcha: "false",
        _template: "basic",
        message
      })
    });
    const json = await res.json();
    emailSent = res.ok && (json.success === true || json.success === "true");
    if (!emailSent) console.error("Email service rejected the submission:", json);
  } catch (err) {
    emailSent = false;
    console.error("Email sending failed:", err);
  }
}

/* ---------- Loading animation (~4.5s) ---------- */
async function showLoadingAnimation() {
  show("loading");
  for (const m of CONFIG.loadingMessages) {
    $("loadMsg").textContent = m;
    await sleep(750);
  }
}

/* ---------- Result ---------- */
async function showResult(d, pct) {
  $("names").textContent = `${d.name1} ❤️ ${d.name2}`;
  $("pct").textContent = 0;
  $("verdict").textContent = "";
  show("result");
  const step = Math.max(15, Math.floor(1800 / pct));   // count up 0 -> pct
  for (let i = 1; i <= pct; i++) { $("pct").textContent = i; await sleep(step); }
  $("verdict").textContent = CONFIG.verdicts.find(v => pct >= v[0])[1];
  await sleep(2800);
}

/* ---------- Suspense, then prank ---------- */
async function showSuspense() {
  show("suspense");
  for (const line of CONFIG.suspense) {
    $("suspenseMsg").textContent = line;
    await sleep(1600);
  }
  document.body.classList.add("prank"); // background slowly changes
  await sleep(900);
}

async function showPrankReveal() {
  show("reveal");
  const main = $("revealMsg"), sub = $("revealSub");
  sub.innerHTML = "";
  main.textContent = "YOU HAVE BEEN FOOLED BY Kushagra😂";
  main.className = "huge pop"; shake(); boom();
  const add = (text, big) => {
    const p = document.createElement("p");
    p.textContent = text; if (big) p.className = "huge";
    sub.appendChild(p);
  };
  await sleep(1800); add("This wasn't really a Love Calculator…");
  await sleep(1600); add("Well… everything you voluntarily entered into this form. 👀");
  await sleep(1800);
  // Honest wording: only claim "received" if the email really went through
  add(emailSent ? "You entered it. I received it. 😭😂" : "The email didn't reach me this time 😅 — but you did type it all in!");
  await sleep(1600); add("Relax — it was just a prank! ❤️😂");
  await sleep(1600); add("Github: kushagrainprod");
  await sleep(1600); add("Instagram: kushagragoyal_2209");
  await sleep(1600); add("Made with ❤️ | Member GDGC | DAU");
  await sleep(1000);
  $("endBtns").classList.remove("hidden");
}

/* ---------- Share ---------- */
async function share() {
  const url = location.href;
  if (navigator.share) {
    try { await navigator.share({ title: "Love Percentage Calculator", text: CONFIG.shareText, url }); } catch (e) { }
  } else {
    try { await navigator.clipboard.writeText(`${CONFIG.shareText} ${url}`); $("shareNote").textContent = "Copied! Paste it anywhere 😂"; }
    catch (e) { $("shareNote").textContent = "Couldn't copy. Please copy the page link manually."; }
  }
}

/* ---------- Reset: clears every value so old data can't be sent again ---------- */
function resetForm() {
  $("loveForm").reset();
  emailSent = false; busy = false;
  $("calcBtn").disabled = true; $("error").textContent = ""; $("shareNote").textContent = "";
  $("endBtns").classList.add("hidden");
  document.body.classList.remove("prank");
  show("formScreen");
}

/* ---------- Main flow ---------- */
async function onSubmit(e) {
  e.preventDefault();
  if (busy) return;
  if (!validateForm()) { $("error").textContent = "⚠️ Please fill in every field and tick the checkbox."; return; }
  busy = true;
  const d = getData();                 // copy the data NOW
  const pct = calculateLovePercentage(d);
  const sending = sendSubmission(d, pct);   // runs while the animation plays
  await showLoadingAnimation();
  await showResult(d, pct);
  await sending;
  await showSuspense();
  await showPrankReveal();
}

/* ---------- Effects ---------- */
function shake() { document.body.classList.remove("shake"); void document.body.offsetWidth; document.body.classList.add("shake"); }
function floatHeart(emoji) {
  const s = document.createElement("span");
  s.textContent = emoji || ["❤️", "💕", "💗", "💖"][Math.floor(Math.random() * 4)];
  s.style.left = Math.random() * 100 + "vw";
  s.style.fontSize = 14 + Math.random() * 26 + "px";
  s.style.animationDuration = 6 + Math.random() * 6 + "s";
  $("hearts").appendChild(s);
  setTimeout(() => s.remove(), 12000);
}
function boom() { for (let i = 0; i < 14; i++) floatHeart(); confetti(); }

function confetti() {
  const c = $("confetti"), x = c.getContext("2d");
  c.width = innerWidth; c.height = innerHeight;
  const cols = ["#ff4d8d", "#e11d48", "#7c3aed", "#fff", "#ffd60a"];
  const bits = Array.from({ length: 120 }, () => ({
    x: Math.random() * c.width, y: -20 - Math.random() * c.height / 2,
    vx: Math.random() * 4 - 2, vy: 2 + Math.random() * 4, s: 5 + Math.random() * 7,
    c: cols[Math.floor(Math.random() * cols.length)]
  }));
  let frames = 0;
  (function tick() {
    x.clearRect(0, 0, c.width, c.height);
    bits.forEach(b => { b.x += b.vx; b.y += b.vy; x.fillStyle = b.c; x.fillRect(b.x, b.y, b.s, b.s * .6); });
    if (++frames < 180) requestAnimationFrame(tick); else x.clearRect(0, 0, c.width, c.height);
  })();
}

/* ---------- Wire up ---------- */
$("startBtn").addEventListener("click", () => show("formScreen"));
$("loveForm").addEventListener("input", validateForm);
$("loveForm").addEventListener("change", validateForm);
$("loveForm").addEventListener("submit", onSubmit);
$("shareBtn").addEventListener("click", share);
$("againBtn").addEventListener("click", resetForm);
setInterval(() => floatHeart(), 900);   // background floating hearts
