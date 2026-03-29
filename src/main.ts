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

function mount(): void {
  const root = el<HTMLDivElement>("#app");
  const hit = String(Math.floor(Math.random() * 900_000) + 100_000);

  root.innerHTML = `
    <div class="page">
      <div class="crt-overlay" aria-hidden="true"></div>
      <header class="top-bar">
        <div class="brand">
          <span class="brand__main">TÊNIS.BR</span>
          <span class="brand__sub">quadra virtual — modo 1996</span>
        </div>
        <div class="header-meta">
          <span class="counter" title="decorativo">visitas: ${hit}</span>
          <label class="toggle-crt"><input type="checkbox" id="crtToggle" /> CRT</label>
        </div>
      </header>

      <div class="macaw" aria-hidden="true" title="arara">
        <svg viewBox="0 0 64 64" width="56" height="56">
          <ellipse cx="28" cy="36" rx="18" ry="14" fill="#c41e3a"/>
          <ellipse cx="38" cy="34" rx="14" ry="12" fill="#1e6b32"/>
          <circle cx="22" cy="32" r="5" fill="#111"/>
          <circle class="macaw-eye" cx="23" cy="31" r="1.6" fill="#fff"/>
          <path d="M8 34 Q2 30 6 26 Q12 28 14 34" fill="#f4d03f"/>
        </svg>
      </div>

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
          <canvas id="gameCanvas" width="320" height="440"></canvas>
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

      <footer class="footer">
        <span>Melhor visto em 800×600 (brincadeira)</span>
        <span class="sep">·</span>
        <span>Feito pra Pascal &amp; Franciele</span>
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
    submittedForLast = true;
    submitHint.textContent = ok ? "Salvo! Atualize o ranking." : "Não rolou salvar — rede ou config.";
    void refreshLb();
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

  if (currentPlayer) showPlay(currentPlayer);
}

mount();
