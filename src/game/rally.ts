export type RallyCallbacks = {
  onRallyChange: (rally: number) => void;
  onGameOver: (finalRally: number) => void;
};

type Vec2 = { x: number; y: number };

const MAX_SPEED = 520;
const SPEED_BUMP_EVERY = 5;
const SPEED_MULT = 1.06;

export class RallyGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cb: RallyCallbacks;
  private dpr = 1;
  private w = 320;
  private h = 480;

  private ball: Vec2 = { x: 0, y: 0 };
  private vel: Vec2 = { x: 0, y: 0 };
  private ballR = 9;

  private paddleW = 88;
  private paddleH = 12;
  private paddleX = 0;
  private targetPaddleX = 0;

  private rally = 0;
  private running = false;
  private raf = 0;
  private last = 0;

  /** Cheese sparkle phase for ball draw */
  private cheeseT = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: RallyCallbacks) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context required");
    this.canvas = canvas;
    this.ctx = ctx;
    this.cb = callbacks;
    this.paddleX = this.w / 2 - this.paddleW / 2;
    this.targetPaddleX = this.paddleX;
    this.resize();
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const cssW = Math.max(280, Math.min(rect.width || 320, 480));
    const cssH = Math.max(360, Math.min((rect.width || 320) * 1.35, 640));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.floor(cssW * this.dpr);
    this.h = Math.floor(cssH * this.dpr);
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.ballR = Math.max(7, this.w * 0.028);
    this.paddleW = this.w * 0.28;
    this.paddleH = Math.max(10, this.h * 0.022);
    this.paddleX = Math.min(
      Math.max(this.paddleX, this.paddleW / 2),
      this.w - this.paddleW / 2
    );
    this.targetPaddleX = this.paddleX;
    if (!this.running) {
      this.ball.x = this.w / 2;
      this.ball.y = this.h * 0.35;
      this.draw();
    }
  }

  setPaddleTargetFromClient(clientX: number): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * this.w;
    this.targetPaddleX = x;
  }

  nudgePaddle(dir: -1 | 1): void {
    const step = this.w * 0.08;
    this.targetPaddleX += dir * step;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.rally = 0;
    this.cb.onRallyChange(this.rally);
    this.resetBall();
    this.last = performance.now();
    const loop = (t: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (t - this.last) / 1000);
      this.last = t;
      this.step(dt);
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private resetBall(): void {
    this.ball.x = this.w / 2;
    this.ball.y = this.h * 0.35;
    const angle = ((Math.random() - 0.5) * 0.9 + 0.5) * Math.PI;
    const speed = 220 * this.dpr;
    this.vel.x = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
    this.vel.y = Math.sin(angle) * speed;
  }

  private step(dt: number): void {
    this.cheeseT += dt;

    const maxPx = this.w - this.paddleW / 2;
    const minPx = this.paddleW / 2;
    this.targetPaddleX = Math.min(maxPx, Math.max(minPx, this.targetPaddleX));
    const lerp = 1 - Math.pow(0.001, dt * 60);
    this.paddleX += (this.targetPaddleX - this.paddleX) * lerp;

    this.ball.x += this.vel.x * dt;
    this.ball.y += this.vel.y * dt;

    const r = this.ballR;
    const px = this.paddleX - this.paddleW / 2;
    const py = this.h - this.paddleH - this.h * 0.06;

    if (this.ball.x < r) {
      this.ball.x = r;
      this.vel.x *= -1;
    } else if (this.ball.x > this.w - r) {
      this.ball.x = this.w - r;
      this.vel.x *= -1;
    }

    if (this.ball.y < r) {
      this.ball.y = r;
      this.vel.y *= -1;
    }

    if (this.vel.y > 0 && this.ball.y + r >= py && this.ball.y - r <= py + this.paddleH) {
      if (this.ball.x >= px - r && this.ball.x <= px + this.paddleW + r) {
        this.ball.y = py - r;
        const offset = (this.ball.x - (px + this.paddleW / 2)) / (this.paddleW / 2);
        this.vel.y = -Math.abs(this.vel.y);
        this.vel.x += offset * 140 * this.dpr;
        this.rally += 1;
        this.cb.onRallyChange(this.rally);
        if (this.rally > 0 && this.rally % SPEED_BUMP_EVERY === 0) {
          const m = Math.min(MAX_SPEED * this.dpr, Math.hypot(this.vel.x, this.vel.y) * SPEED_MULT);
          const len = Math.hypot(this.vel.x, this.vel.y) || 1;
          this.vel.x = (this.vel.x / len) * m;
          this.vel.y = (this.vel.y / len) * m;
        }
      }
    }

    if (this.ball.y - r > this.h) {
      this.running = false;
      cancelAnimationFrame(this.raf);
      this.cb.onGameOver(this.rally);
    }
  }

  private draw(): void {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;
    const r = this.ballR;

    ctx.fillStyle = "#1e6b32";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(255, 215, 0, 0.35)";
    ctx.lineWidth = 2 * this.dpr;
    ctx.setLineDash([10 * this.dpr, 12 * this.dpr]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 3 * this.dpr;
    ctx.strokeRect(r * 0.5, r * 0.5, w - r, h - r);

    const py = h - this.paddleH - h * 0.06;
    const px = this.paddleX - this.paddleW / 2;
    ctx.fillStyle = "#3d2914";
    ctx.fillRect(px, py, this.paddleW, this.paddleH);
    ctx.strokeStyle = "#f4e4bc";
    ctx.lineWidth = this.dpr;
    ctx.strokeRect(px + 0.5 * this.dpr, py + 0.5 * this.dpr, this.paddleW - this.dpr, this.paddleH - this.dpr);

    const bx = this.ball.x;
    const by = this.ball.y;
    const br = this.ballR;
    const grd = ctx.createRadialGradient(bx - br * 0.3, by - br * 0.3, 0, bx, by, br);
    grd.addColorStop(0, "#fff3c4");
    grd.addColorStop(0.45, "#e8c547");
    grd.addColorStop(1, "#b8860b");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 4; i++) {
      const a = this.cheeseT * 2 + i * 1.7;
      const dx = Math.cos(a) * br * 0.35;
      const dy = Math.sin(a * 0.9) * br * 0.35;
      ctx.fillStyle = "rgba(180, 120, 30, 0.45)";
      ctx.beginPath();
      ctx.arc(bx + dx, by + dy, br * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
