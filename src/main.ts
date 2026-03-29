import "./style.css";
import { RallyGame } from "./game/rally";
import {
  type PlayerId,
  fetchLeaderboard,
  isLeaderboardConfigured,
  submitScore,
} from "./leaderboard";

const STORAGE_KEY = "tennis-br-90-player";

function loadPlayer(): PlayerId | null {
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "pascal" || v === "franciele") return v;
  return null;
}

function savePlayer(p: PlayerId): void {
  localStorage.setItem(STORAGE_KEY, p);
}

function el<T extends HTMLElement>(sel: string): T {
  const n = document.querySelector(sel);
  if (!n) throw new Error(`missing ${sel}`);
  return n as T;
}

function renderLeaderboard(
  container: HTMLElement,
  snap: Awaited<ReturnType<typeof fetchLeaderboard>>
): void {
  if (!snap) {
    container.innerHTML =
      '<p class="lb-offline">Ranking indisponível. Configure o Supabase (veja <code>SETUP.md</code>).</p>';
    return;
  }
  const rows = snap.recent
    .slice(0, 12)
    .map(
      (r) =>
        `<tr><td>${r.player === "pascal" ? "Pascal" : "Franciele"}</td><td class="num">${r.score}</td><td class="dt">${formatDate(r.created_at)}</td></tr>`
    )
    .join("");
  container.innerHTML = `
    <div class="lb-bests">
      <div><span class="tag pascal">Pascal</span> <strong>${snap.pascalBest}</strong> pts</div>
      <div><span class="tag franciele">Franciele</span> <strong>${snap.francieleBest}</strong> pts</div>
    </div>
    <table class="lb-table"><thead><tr><th>Quem</th><th>Pts</th><th>Quando</th></tr></thead><tbody>${rows}</tbody></table>
  `;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function scheduleLula(cameo: HTMLElement): void {
  const delay = 45_000 + Math.random() * 75_000;
  window.setTimeout(() => {
    cameo.classList.remove("hidden");
    cameo.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      cameo.classList.add("hidden");
      cameo.setAttribute("aria-hidden", "true");
      scheduleLula(cameo);
    }, 2800);
  }, delay);
}

/** Side-view jaguar: low feline profile, rosettes, long tail. */
const SVG_LEOPARD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 52" width="104" height="42" aria-hidden="true">
  <defs>
    <linearGradient id="wildLeoFur" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#dcc4a4"/>
      <stop offset="100%" style="stop-color:#9d7449"/>
    </linearGradient>
  </defs>
  <path fill="url(#wildLeoFur)" d="M22 38 L18 44 L14 44 L16 36 L12 32 Q8 28 14 24 L26 20 Q32 10 48 8 L58 6 Q72 4 82 12 L88 10 Q96 8 102 14 L108 22 Q112 30 108 36 L100 40 L92 38 L88 34 L82 36 L76 34 L70 38 L62 36 L54 40 L46 38 L40 42 L32 40 Z"/>
  <ellipse cx="94" cy="14" rx="10" ry="9" fill="#c49a6c"/>
  <path fill="#b88960" d="M86 6 L90 2 L94 7 L98 2 L102 8 L96 12 Z"/>
  <ellipse cx="100" cy="13" rx="2.2" ry="2" fill="#1a120c"/>
  <ellipse cx="106" cy="16" rx="5" ry="3" fill="#2a1f18" opacity="0.88"/>
  <ellipse cx="50" cy="18" rx="8" ry="5.5" fill="none" stroke="#3d2914" stroke-width="2"/>
  <ellipse cx="50" cy="18" rx="3.2" ry="2" fill="#1f1610"/>
  <ellipse cx="66" cy="21" rx="7" ry="5" fill="none" stroke="#3d2914" stroke-width="1.8"/>
  <ellipse cx="66" cy="21" rx="2.8" ry="1.8" fill="#1f1610"/>
  <ellipse cx="80" cy="17" rx="7" ry="4.5" fill="none" stroke="#3d2914" stroke-width="1.8"/>
  <ellipse cx="80" cy="17" rx="2.6" ry="1.6" fill="#1f1610"/>
  <ellipse cx="36" cy="28" rx="5" ry="3.5" fill="none" stroke="#3d2914" stroke-width="1.6"/>
  <ellipse cx="36" cy="28" rx="2" ry="1.3" fill="#1f1610"/>
  <path fill="#9a7038" d="M108 28 Q124 24 126 38 Q122 48 108 44 Q104 36 108 28 Z"/>
  <path fill="#6b4e32" d="M22 38 L26 44 L20 46 L18 40 Z M40 42 L44 48 L38 50 L36 44 Z M54 40 L58 46 L52 48 Z M70 38 L74 44 L68 46 Z"/>
</svg>`;

/** Flying macaw: hooked beak, bare eye ring, red/green/blue plumage. */
const SVG_PARROT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 56" width="96" height="49" aria-hidden="true">
  <path fill="#14532d" d="M12 38 Q6 32 8 26 L18 22 L32 18 Q48 8 64 12 L78 16 Q88 20 92 28 L88 34 L76 32 L62 28 L48 30 L36 34 L24 36 Z"/>
  <path fill="#0f3d22" d="M64 12 L82 6 L96 14 L88 22 L78 16 Z"/>
  <path fill="#c41e3a" d="M32 18 Q38 10 52 8 Q60 8 64 12 L62 22 L48 26 L36 24 Z"/>
  <path fill="#fdf6e3" d="M8 26 Q4 20 10 14 L22 16 L18 22 Z"/>
  <path fill="#1a1a1a" d="M6 24 L2 28 L8 30 Z"/>
  <circle cx="44" cy="16" r="5.5" fill="#f0e6d2"/>
  <circle cx="46" cy="15" r="3" fill="#fff"/>
  <circle cx="47" cy="14.5" r="1.6" fill="#111"/>
  <path fill="none" stroke="#c41e3a" stroke-width="2" d="M38 12 Q44 6 52 10"/>
  <path fill="#1e5ba8" d="M88 22 L102 18 L108 28 L96 34 L88 28 Z"/>
  <path fill="#2563eb" d="M92 28 L108 32 L104 40 L90 36 Z"/>
  <path fill="#f4d03f" d="M18 22 L8 18 L12 12 L24 14 Z"/>
</svg>`;

/** Capuchin-like monkey: pale face mask, ears, long curling tail. */
const SVG_MONKEY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 56" width="80" height="47" aria-hidden="true">
  <path fill="#5c4332" d="M28 48 L24 54 L18 54 L20 46 L14 42 Q10 38 16 34 L22 30 L18 24 Q16 16 24 12 L32 8 Q42 4 52 8 Q58 10 60 16 L58 24 L54 30 L48 34 L42 38 L36 44 Z"/>
  <ellipse cx="46" cy="14" rx="14" ry="13" fill="#6d5340"/>
  <ellipse cx="48" cy="15" rx="10" ry="9" fill="#e8d5c4"/>
  <ellipse cx="48" cy="17" rx="7" ry="5.5" fill="#d4bcaa"/>
  <circle cx="44" cy="14" r="2" fill="#111"/>
  <circle cx="52" cy="14" r="2" fill="#111"/>
  <ellipse cx="48" cy="20" rx="3" ry="2" fill="#8b7355"/>
  <ellipse cx="34" cy="12" rx="4" ry="5" fill="#5c4332"/>
  <ellipse cx="60" cy="12" rx="4" ry="5" fill="#5c4332"/>
  <path fill="none" stroke="#4a3628" stroke-width="4" stroke-linecap="round" d="M60 20 Q88 8 84 32 Q82 44 68 46"/>
  <ellipse cx="22" cy="28" rx="6" ry="5" fill="#5c4332"/>
  <path fill="#4a3628" d="M58 24 L66 28 L62 34 L56 30 Z"/>
</svg>`;

function scheduleWildlife(layer: HTMLElement, mover: HTMLElement): void {
  const svgs = [SVG_LEOPARD, SVG_PARROT, SVG_MONKEY];
  const scheduleNext = (): void => {
    const delay = 22_000 + Math.random() * 38_000;
    window.setTimeout(run, delay);
  };
  const run = (): void => {
    const svg = svgs[Math.floor(Math.random() * svgs.length)] ?? SVG_PARROT;
    const rtl = Math.random() < 0.5;
    const bottomPct = 10 + Math.random() * 52;
    const durationMs = 2800 + Math.random() * 1400;

    mover.style.bottom = `${bottomPct}%`;
    mover.style.animationDuration = `${durationMs}ms`;
    mover.className = "wildlife-cameo__mover";
    mover.classList.add(rtl ? "wildlife-dash--rtl" : "wildlife-dash--ltr");
    mover.innerHTML = `<div class="wildlife-cameo__flip${rtl ? " wildlife-cameo__flip--on" : ""}">${svg}</div>`;

    layer.classList.remove("hidden");
    layer.setAttribute("aria-hidden", "false");

    window.setTimeout(() => {
      layer.classList.add("hidden");
      layer.setAttribute("aria-hidden", "true");
      mover.innerHTML = "";
      scheduleNext();
    }, durationMs + 80);
  };
  scheduleNext();
}

function mount(): void {
  const root = el<HTMLDivElement>("#app");
  const hit = String(Math.floor(Math.random() * 900_000) + 100_000);

  root.innerHTML = `
    <div class="page">
      <div class="crt-overlay" aria-hidden="true"></div>
      <header class="top-bar">
        <div class="brand">
          <span class="brand__main">TÊNIS.BR</span>
          <span class="brand__sub">quadra virtual — modo 1993</span>
        </div>
        <div class="header-meta">
          <span class="counter" title="decorativo">visitas: ${hit}</span>
          <label class="toggle-crt"><input type="checkbox" id="crtToggle" /> CRT</label>
        </div>
      </header>

      <section class="panel intro" id="introPanel">
        <h1>Quem está jogando?</h1>
        <p class="lede">Escolha uma vez — fica gravado neste aparelho. A outra pessoa escolhe o outro nome no telefone dela.</p>
        <div class="pick-row">
          <button type="button" class="btn btn-pascal" data-player="pascal">Sou o Pascal</button>
          <button type="button" class="btn btn-franciele" data-player="franciele">Sou a Franciele</button>
        </div>
        <p class="fine">Melhor de rally na parede. Sem login — sistema honorário.</p>
      </section>

      <main class="play hidden" id="playPanel">
        <div class="play-head">
          <span id="whoLabel" class="who-pill"></span>
          <button type="button" class="btn btn-ghost" id="changePlayer">Trocar jogador</button>
        </div>
        <div class="court-shell jaguar-frame">
          <div class="court-inner">
            <canvas id="gameCanvas" width="320" height="440"></canvas>
          </div>
          <div class="touch-bar">
            <button type="button" class="touch-btn" id="btnLeft" aria-label="Esquerda">◀</button>
            <button type="button" class="btn btn-start" id="btnStart">SERVIR</button>
            <button type="button" class="touch-btn" id="btnRight" aria-label="Direita">▶</button>
          </div>
        </div>
        <div class="hud">
          <span>Rally: <strong id="rallyHud">0</strong></span>
        </div>
        <aside class="panel lb-panel">
          <h2>Ranking compartilhado</h2>
          <button type="button" class="btn btn-small" id="btnRefreshLb">Atualizar</button>
          <div id="lbRoot"></div>
        </aside>
      </main>

      <div class="modal hidden" id="gameOverModal" role="dialog" aria-modal="true" aria-labelledby="goTitle">
        <div class="modal__box">
          <h2 id="goTitle">Bola fora</h2>
          <p class="go-score">Rally final: <strong id="finalScore">0</strong></p>
          <div class="modal__actions">
            <button type="button" class="btn" id="btnSubmit">Mandar pro ranking</button>
            <button type="button" class="btn btn-ghost" id="btnAgain">De novo</button>
          </div>
          <p class="fine" id="submitHint"></p>
        </div>
      </div>

      <div class="lula-cameo hidden" id="lulaCameo" aria-hidden="true">
        <div class="lula-fig" title="">
          <div class="lula-silhouette"></div>
        </div>
      </div>

      <div class="wildlife-cameo hidden" id="wildlifeCameo" aria-hidden="true">
        <div class="wildlife-cameo__mover" id="wildlifeMover"></div>
      </div>

      <footer class="footer">
        <span>Melhor visto em 800×600 (brincadeira)</span>
        <span class="sep">·</span>
        <span>Feito por Pascal e ClaudeCode para Franciele</span>
      </footer>
    </div>
  `;

  const introPanel = el<HTMLElement>("#introPanel");
  const playPanel = el<HTMLElement>("#playPanel");
  const canvas = el<HTMLCanvasElement>("#gameCanvas");
  const rallyHud = el<HTMLElement>("#rallyHud");
  const whoLabel = el<HTMLElement>("#whoLabel");
  const lbRoot = el<HTMLElement>("#lbRoot");
  const modal = el<HTMLElement>("#gameOverModal");
  const finalScoreEl = el<HTMLElement>("#finalScore");
  const submitHint = el<HTMLElement>("#submitHint");
  const crtToggle = el<HTMLInputElement>("#crtToggle");
  const lulaCameo = el<HTMLElement>("#lulaCameo");
  const wildlifeCameo = el<HTMLElement>("#wildlifeCameo");
  const wildlifeMover = el<HTMLElement>("#wildlifeMover");

  let currentPlayer = loadPlayer();
  let game: RallyGame | null = null;
  let lastFinal = 0;
  let submittedForLast = false;

  async function refreshLb(): Promise<void> {
    if (!isLeaderboardConfigured()) {
      renderLeaderboard(lbRoot, null);
      return;
    }
    const snap = await fetchLeaderboard();
    renderLeaderboard(lbRoot, snap);
  }

  function showPlay(player: PlayerId): void {
    currentPlayer = player;
    savePlayer(player);
    whoLabel.textContent = player === "pascal" ? "Pascal" : "Franciele";
    whoLabel.className = `who-pill ${player === "pascal" ? "is-pascal" : "is-franciele"}`;
    introPanel.classList.add("hidden");
    playPanel.classList.remove("hidden");
    requestAnimationFrame(() => {
      game?.resize();
    });
    if (!game) {
      game = new RallyGame(canvas, {
        onRallyChange(n) {
          rallyHud.textContent = String(n);
        },
        onGameOver(n) {
          lastFinal = n;
          submittedForLast = false;
          finalScoreEl.textContent = String(n);
          submitHint.textContent = isLeaderboardConfigured()
            ? "Só você vê este botão — manda se quiser registrar."
            : "Sem Supabase configurado, o ranking não salva online.";
          modal.classList.remove("hidden");
        },
      });
    } else {
      game.resize();
    }
    void refreshLb();
  }

  function showIntro(): void {
    game?.stop();
    playPanel.classList.add("hidden");
    introPanel.classList.remove("hidden");
    modal.classList.add("hidden");
  }

  root.querySelectorAll("[data-player]").forEach((b) => {
    b.addEventListener("click", () => {
      const p = (b as HTMLElement).dataset.player as PlayerId;
      showPlay(p);
    });
  });

  el<HTMLButtonElement>("#changePlayer").addEventListener("click", () => {
    showIntro();
  });

  el<HTMLButtonElement>("#btnStart").addEventListener("click", () => {
    if (!game) return;
    modal.classList.add("hidden");
    game.stop();
    game.resize();
    game.start();
  });

  el<HTMLButtonElement>("#btnLeft").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    game?.nudgePaddle(-1);
  });
  el<HTMLButtonElement>("#btnRight").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    game?.nudgePaddle(1);
  });

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    game?.setPaddleTargetFromClient(e.clientX);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!canvas.hasPointerCapture(e.pointerId)) return;
    e.preventDefault();
    game?.setPaddleTargetFromClient(e.clientX);
  });

  window.addEventListener("keydown", (e) => {
    if (playPanel.classList.contains("hidden")) return;
    if (!modal.classList.contains("hidden")) return;
    if (e.key === "ArrowLeft") game?.nudgePaddle(-1);
    if (e.key === "ArrowRight") game?.nudgePaddle(1);
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      game?.stop();
      game?.resize();
      game?.start();
    }
  });

  window.addEventListener("resize", () => {
    game?.resize();
  });

  el<HTMLButtonElement>("#btnRefreshLb").addEventListener("click", () => void refreshLb());

  el<HTMLButtonElement>("#btnAgain").addEventListener("click", () => {
    modal.classList.add("hidden");
    game?.stop();
    game?.resize();
    game?.start();
  });

  el<HTMLButtonElement>("#btnSubmit").addEventListener("click", async () => {
    if (!currentPlayer || submittedForLast) return;
    const ok = await submitScore(currentPlayer, lastFinal);
    if (ok) {
      submittedForLast = true;
      void refreshLb();
      modal.classList.add("hidden");
    } else {
      submitHint.textContent = "Não rolou salvar — rede ou config.";
    }
  });

  const savedCrt = localStorage.getItem("tennis-br-90-crt") === "1";
  crtToggle.checked = savedCrt;
  document.body.classList.toggle("crt-on", savedCrt);
  crtToggle.addEventListener("change", () => {
    const on = crtToggle.checked;
    localStorage.setItem("tennis-br-90-crt", on ? "1" : "0");
    document.body.classList.toggle("crt-on", on);
  });

  scheduleLula(lulaCameo);
  scheduleWildlife(wildlifeCameo, wildlifeMover);

  if (currentPlayer) showPlay(currentPlayer);
}

mount();
