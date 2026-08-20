/* ═══════════════════════════════════════════════════════════
   MONEY ALERT — script.js

   ► TU ZMIENIASZ WSZYSTKO, CO TWOJE: linki, ceny, modele.
   Reszta pliku nie wymaga edycji.
   ═══════════════════════════════════════════════════════════ */

const CONFIG = {
  // Linki (podmień na swoje)
  links: {
    discord:  "https://discord.gg/TWOJ-KOD",      // zaproszenie na serwer
    checkout: "https://twoj-sklep.pl/zamowienie"  // płatność za ebooka / pakiet
  },

  // Ceny wyświetlane na stronie
  prices: {
    old:    "197 zł",
    now:    "97 zł",
    free:   "0 zł<small>na zawsze</small>",
    sniper: "49 zł<small>/ miesiąc</small>",
    bundle: "119 zł<small>/ pierwszy miesiąc</small>"
  },

  // Modele do kalkulatora i feedu — widełki rynkowe (ustaw wg swojego rynku)
  models: [
    { name:"iPhone 11 64GB",        buy: 620,  sell: 1090 },
    { name:"iPhone 11 128GB",       buy: 750,  sell: 1250 },
    { name:"iPhone 12 64GB",        buy: 940,  sell: 1490 },
    { name:"iPhone 12 Pro 128GB",   buy: 1240, sell: 1890 },
    { name:"iPhone 13 128GB",       buy: 1350, sell: 1990 },
    { name:"iPhone 13 Pro 256GB",   buy: 1780, sell: 2560 },
    { name:"iPhone 14 128GB",       buy: 1690, sell: 2340 },
    { name:"iPhone 14 Pro 256GB",   buy: 2350, sell: 3150 },
    { name:"iPhone 15 128GB",       buy: 2290, sell: 2990 },
    { name:"iPhone 15 Pro 256GB",   buy: 3050, sell: 3890 }
  ],

  // Próg opłacalności — poniżej tej kwoty zysk podświetla się na czerwono
  minProfit: 150
};

/* ─── helpery ─── */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const zl = n => Math.round(n).toLocaleString("pl-PL") + " zł";
const rnd = (a, b) => a + Math.random() * (b - a);
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ═══════ 1. PRELOADER ═══════ */
(function preloader(){
  const box = $("#loader"), bar = $("#loaderBar"), status = $("#loaderStatus");
  if (!box) return;

  const steps = [
    "Uruchamianie skanera…",
    "Łączenie z OLX…",
    "Łączenie z Vinted…",
    "Wczytywanie wyceny modeli…",
    "Nasłuch alertów aktywny"
  ];
  let i = 0, pct = 0;
  const total = REDUCED ? 400 : 2100;
  const tick = total / steps.length;

  const walk = setInterval(() => {
    status.textContent = steps[i];
    pct = Math.round(((i + 1) / steps.length) * 100);
    bar.style.width = pct + "%";
    if (++i >= steps.length) {
      clearInterval(walk);
      setTimeout(done, REDUCED ? 100 : 420);
    }
  }, tick);

  function done(){
    box.classList.add("is-done");
    document.body.classList.remove("is-locked");
    setTimeout(() => box.remove(), 700);
    startFeed();
  }

  document.body.classList.add("is-locked");
  // bezpiecznik: gdyby coś zablokowało timery
  setTimeout(() => { if (document.body.contains(box)) done(); }, 6000);
})();

/* ═══════ 2. LINKI I CENY Z CONFIG ═══════ */
$$("[data-link]").forEach(a => {
  const url = CONFIG.links[a.dataset.link];
  if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
});
$$("[data-price]").forEach(el => { el.innerHTML = CONFIG.prices[el.dataset.price] || ""; });
$("#year").textContent = new Date().getFullYear();

/* ═══════ 3. NAWIGACJA ═══════ */
const nav = $("#nav"), burger = $("#burger"), navLinks = $("#navLinks");

addEventListener("scroll", () => nav.classList.toggle("is-stuck", scrollY > 24), { passive:true });

burger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", open);
});
navLinks.addEventListener("click", e => {
  if (e.target.tagName === "A") {
    navLinks.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }
});

/* ═══════ 4. FEED ALERTÓW (sygnatura strony) ═══════ */
const feed = $("#feedBody");
const CITIES = ["Warszawa","Kraków","Gdańsk","Poznań","Wrocław","Łódź","Katowice","Olsztyn","Toruń","Lublin","Rzeszów","Szczecin"];
const MAX_CARDS = 4;

function makeAlert(){
  const m = CONFIG.models[Math.floor(Math.random() * CONFIG.models.length)];
  const buy  = Math.round(rnd(m.buy * .86, m.buy * 1.04) / 10) * 10;
  const sell = m.sell;
  const gain = sell - buy;
  const vinted = Math.random() < .38;

  const el = document.createElement("article");
  el.className = "alert";
  el.innerHTML = `
    <div class="alert__head">
      <span class="alert__src ${vinted ? "is-vinted" : ""}">${vinted ? "VINTED" : "OLX"}</span>
      <span class="alert__name">${m.name}</span>
      <span class="alert__time" data-born="${Date.now()}">teraz</span>
    </div>
    <div class="alert__row">
      <span>Cena: <b>${zl(buy)}</b></span>
      <span>Wycena: <b>${zl(sell)}</b></span>
      <span>Marża: <b class="up">+${zl(gain)}</b></span>
      <span>${vinted ? "Wysyłka" : CITIES[Math.floor(Math.random()*CITIES.length)]}</span>
    </div>
    <div class="alert__bar"><i style="--w:${Math.min(96, Math.round(gain / sell * 260))}%"></i></div>`;
  return el;
}

function pushAlert(){
  if (!feed || document.hidden) return;
  feed.appendChild(makeAlert());
  while (feed.children.length > MAX_CARDS){
    const first = feed.firstElementChild;
    first.classList.add("is-out");
    setTimeout(() => first.remove(), 400);
    break;
  }
}

function ageStamps(){
  $$(".alert__time", feed).forEach(t => {
    const s = Math.round((Date.now() - +t.dataset.born) / 1000);
    t.textContent = s < 3 ? "teraz" : s < 60 ? `${s} s temu` : `${Math.floor(s/60)} min temu`;
  });
}

function startFeed(){
  if (!feed) return;
  for (let i = 0; i < 3; i++) feed.appendChild(makeAlert());
  ageStamps();
  const loop = () => {
    pushAlert();
    setTimeout(loop, rnd(3200, 6200));
  };
  setTimeout(loop, 1800);
  setInterval(ageStamps, 1000);
}

/* ═══════ 5. TICKER ═══════ */
(function ticker(){
  const track = $("#tickerTrack");
  if (!track) return;
  const row = CONFIG.models.map(m =>
    `<span class="ticker__item">${m.name} · kupno ${zl(m.buy)} · sprzedaż ${zl(m.sell)} · <b>+${zl(m.sell - m.buy)}</b></span>`
  ).join("");
  track.innerHTML = row + row; // dwie kopie = płynna pętla
})();

/* ═══════ 6. KALKULATOR FLIPA ═══════ */
(function calc(){
  const sel = $("#calcModel"), buy = $("#calcBuy"), sell = $("#calcSell"), cost = $("#calcCost");
  if (!sel) return;

  sel.innerHTML = CONFIG.models.map((m, i) => `<option value="${i}">${m.name}</option>`).join("");

  function loadModel(){
    const m = CONFIG.models[sel.value];
    buy.min  = Math.round(m.buy * .55);  buy.max  = Math.round(m.buy * 1.5);
    sell.min = Math.round(m.sell * .7);  sell.max = Math.round(m.sell * 1.35);
    buy.value = m.buy; sell.value = m.sell;
    render();
  }

  function render(){
    const b = +buy.value, s = +sell.value, c = +cost.value;
    const profit = s - b - c;
    const margin = b > 0 ? profit / b * 100 : 0;

    $("#calcBuyVal").textContent  = zl(b);
    $("#calcSellVal").textContent = zl(s);
    $("#calcCostVal").textContent = zl(c);
    $("#calcProfit").textContent  = (profit >= 0 ? "+" : "") + zl(profit);
    $("#calcMargin").textContent  = Math.round(margin) + "%";
    $("#calcMonth").textContent   = (profit >= 0 ? "+" : "") + zl(profit * 10);
    $("#calcBar").style.width     = Math.max(2, Math.min(100, margin * 1.6)) + "%";
    $("#calcOut").classList.toggle("is-bad", profit < CONFIG.minProfit);
  }

  sel.addEventListener("change", loadModel);
  [buy, sell, cost].forEach(r => r.addEventListener("input", render));
  loadModel();
})();

/* ═══════ 7. ZAKŁADKI OLX / VINTED ═══════ */
$$(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    $$(".tab").forEach(t => { t.classList.remove("is-on"); t.setAttribute("aria-selected","false"); });
    $$(".pane").forEach(p => { p.classList.remove("is-on"); p.hidden = true; });
    tab.classList.add("is-on");
    tab.setAttribute("aria-selected","true");
    const pane = $("#" + tab.getAttribute("aria-controls"));
    pane.hidden = false;
    pane.classList.add("is-on");
    $$(".reveal", pane).forEach(el => el.classList.add("is-in"));
  });
});

/* ═══════ 8. ODSŁANIANIE PRZY SCROLLU + LICZNIKI ═══════ */
const io = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-in");
    obs.unobserve(e.target);
  });
}, { threshold:.16, rootMargin:"0px 0px -60px 0px" });
$$(".reveal").forEach(el => io.observe(el));

const counters = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count;
    const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    let t0 = null;
    const run = ts => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 900, 1);
      el.innerHTML = pre + Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(run);
    };
    if (!REDUCED) requestAnimationFrame(run);
    obs.unobserve(el);
  });
}, { threshold:.6 });
$$("[data-count]").forEach(el => counters.observe(el));

/* ═══════ 9. MIKROINTERAKCJE ═══════ */
// poświata w hero podąża za kursorem
const glow = $("#heroGlow");
if (glow && !REDUCED && matchMedia("(hover:hover)").matches){
  addEventListener("mousemove", e => {
    const x = (e.clientX / innerWidth - .5) * 60;
    const y = (e.clientY / innerHeight - .5) * 40;
    glow.style.transform = `translate(calc(-50% + ${x}px), ${y}px)`;
  }, { passive:true });
}

// podświetlenie karty pod kursorem
$$(".card").forEach(c => {
  c.addEventListener("mousemove", e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", (e.clientX - r.left) + "px");
    c.style.setProperty("--my", (e.clientY - r.top) + "px");
  });
});

// przechylanie okładki ebooka
const book = $("#book");
if (book && !REDUCED && matchMedia("(hover:hover)").matches){
  const wrapEl = book.parentElement;
  wrapEl.addEventListener("mousemove", e => {
    const r = wrapEl.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    book.style.transform = `rotateY(${-16 + x * 20}deg) rotateX(${5 - y * 16}deg) translateY(${y * -8}px)`;
  });
  wrapEl.addEventListener("mouseleave", () => {
    book.style.transform = "rotateY(-16deg) rotateX(5deg)";
  });
}

// jedno otwarte pytanie naraz w FAQ i w spisie rozdziałów
$$(".chapters, .faq").forEach(group => {
  const items = $$("details", group);
  items.forEach(d => d.addEventListener("toggle", () => {
    if (d.open) items.forEach(o => { if (o !== d) o.open = false; });
  }));
});

/* ═══════ 10. KOPIOWANIE LINKU + TOAST ═══════ */
function toast(msg){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("is-on"), 2600);
}

$("#copyBtn")?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(CONFIG.links.discord);
    toast("Link do serwera skopiowany");
  } catch {
    toast("Skopiuj ręcznie: " + CONFIG.links.discord);
  }
});
