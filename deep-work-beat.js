// ╔══════════════════════════════════════════════════════╗
// ║  DEEP WORK BEAT — Strudel (pegar en strudel.cc)     ║
// ║  Minimal / lo-fi tech / ambient groove               ║
// ║  Diseñado para 60–120 min de concentración           ║
// ╚══════════════════════════════════════════════════════╝

// ─── KNOBS (ajusta estos 5 valores) ───────────────────
// 1. BPM        → cambiar el número en setcps()
// 2. SWING      → swingBy(0.02)  rango útil: 0 – 0.06
// 3. BRILLO     → lpf en hats/shaker (7000)  bajar = más oscuro
// 4. ENERGÍA HH → gain en hats (0.45)  rango útil: 0.3 – 0.55
// 5. DENSIDAD   → degradeBy en shaker (0.6)  subir = menos hits
// ──────────────────────────────────────────────────────

setcps(100/60/4)

stack(
  // — Kick: negras estables, ancla del pulso —
  s("bd*4")
    .bank("RolandTR808")
    .gain(0.62)
    .lpf(200)
    .hpf(30),

  // — Snare/rim: backbeat discreto —
  s("~ rim ~ rim")
    .bank("RolandTR808")
    .gain(0.32)
    .lpf(5000)
    .hpf(200)
    .room(0.15)
    .delay(0.08),

  // — Hats cerrados: corcheas con swing sutil —
  s("hh*8")
    .bank("RolandTR808")
    .gain(0.45)
    .lpf(7000)
    .hpf(800)
    .room(0.1)
    .swingBy(0.02),

  // — Shaker: textura granular, degradada al 60% —
  s("shaker*16")
    .bank("RolandTR808")
    .gain(0.2)
    .lpf(6000)
    .hpf(1200)
    .degradeBy(0.6)
    .room(0.12)
    .delay(0.05),

  // — Perc sutil: tom bajo muy espaciado —
  s("~ ~ ~ lt")
    .bank("RolandTR808")
    .gain(0.18)
    .lpf(3000)
    .hpf(80)
    .slow(4)
    .room(0.2)
    .sometimesBy(0.7, x => x.gain(0))
)
