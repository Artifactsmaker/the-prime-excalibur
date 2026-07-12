/**
 * Toán tử Tuy's Cut (𝒯) — Cắt Nhánh Khả Thể / Chọn–Khóa Thực Tại (VI)
 *
 * Mục đích:
 *  - Ψₑ là tập/ phân bố các khả thể (ứng viên).
 *  - 𝒯 lặp các "cut" (lọc) theo Height và/hoặc Energy để co miền khả thể,
 *    sau đó chọn một nhánh duy nhất (argmin / MAP / sampling).
 *
 * Lưu ý:
 *  - Đây là abstraction theo tinh thần 'cut' trong tối ưu toàn cục, không phải thuật ngữ vật lý chuẩn.
 */

export type Vec = Float32Array;

export type Divergence = (a: Vec, b: Vec) => number;
export type EnergyFn<T> = (x: T) => number;

/** Foundation operator S0: trích luật nền của trạng thái */
export type FoundationFn = (x: Vec) => Vec;

/** Height: 𝓗(x)=D(x, S0(x)) */
export interface HeightFnConfig {
  S0: FoundationFn;
  D: Divergence;
}

/** Ứng viên rời rạc: x_i với trọng số w_i */
export interface Candidate<T> {
  x: T;
  w: number; // weight >=0
}

/** Kết quả chọn */
export interface SelectResult<T> {
  x: T;
  index: number;
  score: number;
}

/* ------------------------ vector utils ------------------------ */

export function dot(a: Vec, b: Vec): number {
  if (a.length !== b.length) throw new Error("dot: sai kích thước");
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function l2(a: Vec): number {
  return Math.sqrt(dot(a, a));
}

export function cosineDivergence(a: Vec, b: Vec): number {
  const na = l2(a);
  const nb = l2(b);
  if (na === 0 || nb === 0) return 1;
  const c = dot(a, b) / (na * nb);
  const cc = Math.max(-1, Math.min(1, c));
  return 1 - cc;
}

/* ------------------------ Height from S0 ------------------------ */

export function heightFromS0(x: Vec, cfg: HeightFnConfig): number {
  const z = cfg.S0(x);
  return cfg.D(x, z);
}

/* ------------------------ Cuts (lọc miền khả thể) ------------------------ */

export interface CutConfig<T> {
  /** Ngưỡng Height τ (nếu null thì bỏ qua) */
  tauH?: number | null;
  /** Ngưỡng Energy ε (nếu null thì bỏ qua) */
  epsE?: number | null;

  /** Hàm energy E(x) */
  energy: EnergyFn<T>;

  /** Nếu ứng viên là Vec và muốn cut theo Height */
  toVec?: (x: T) => Vec;
  heightCfg?: HeightFnConfig;
}

/**
 * Cut: giữ lại ứng viên thỏa 𝓗(x)≤τ và/hoặc E(x)≤ε.
 * Trả về danh sách mới + tổng trọng số để normalize.
 */
export function cutCandidates<T>(cands: Candidate<T>[], cfg: CutConfig<T>): { kept: Candidate<T>[]; totalW: number } {
  const kept: Candidate<T>[] = [];
  let totalW = 0;

  for (const c of cands) {
    if (c.w <= 0) continue;

    const e = cfg.energy(c.x);
    if (cfg.epsE != null && e > cfg.epsE) continue;

    if (cfg.tauH != null) {
      if (!cfg.toVec || !cfg.heightCfg) throw new Error("cutCandidates: cần toVec + heightCfg khi dùng tauH");
      const v = cfg.toVec(c.x);
      const h = heightFromS0(v, cfg.heightCfg);
      if (h > cfg.tauH) continue;
    }

    kept.push(c);
    totalW += c.w;
  }

  return { kept, totalW };
}

/** Normalize trọng số để tổng = 1 */
export function normalizeCandidates<T>(cands: Candidate<T>[], totalW?: number): Candidate<T>[] {
  const s = totalW ?? cands.reduce((acc, c) => acc + c.w, 0);
  if (s <= 0) return [];
  return cands.map(c => ({ x: c.x, w: c.w / s }));
}

/* ------------------------ Selection (chọn nhánh) ------------------------ */

export interface SelectConfig<T> {
  /** Hàm energy E(x) */
  energy: EnergyFn<T>;

  /** Nếu muốn dùng Height: score = E + λ·H */
  lambda?: number;

  toVec?: (x: T) => Vec;
  heightCfg?: HeightFnConfig;

  /** Chế độ chọn */
  mode: "argmin" | "map" | "sample";
  /** PRNG cho sample (0..1) */
  rand?: () => number;
}

/** Tính score: E(x)+λ·H(x) (nếu có) */
export function scoreCandidate<T>(x: T, cfg: SelectConfig<T>): number {
  const e = cfg.energy(x);
  const lam = cfg.lambda ?? 0;
  if (lam <= 0) return e;

  if (!cfg.toVec || !cfg.heightCfg) throw new Error("scoreCandidate: cần toVec + heightCfg khi lambda>0");
  const v = cfg.toVec(x);
  const h = heightFromS0(v, cfg.heightCfg);
  return e + lam * h;
}

/** Chọn theo argmin score */
export function selectArgmin<T>(cands: Candidate<T>[], cfg: SelectConfig<T>): SelectResult<T> {
  if (cands.length === 0) throw new Error("selectArgmin: rỗng");
  let bestI = 0;
  let bestScore = scoreCandidate(cands[0].x, cfg);
  for (let i = 1; i < cands.length; i++) {
    const s = scoreCandidate(cands[i].x, cfg);
    if (s < bestScore) { bestScore = s; bestI = i; }
  }
  return { x: cands[bestI].x, index: bestI, score: bestScore };
}

/** Chọn theo MAP: argmax weight */
export function selectMAP<T>(cands: Candidate<T>[]): SelectResult<T> {
  if (cands.length === 0) throw new Error("selectMAP: rỗng");
  let bestI = 0;
  let bestW = cands[0].w;
  for (let i = 1; i < cands.length; i++) {
    if (cands[i].w > bestW) { bestW = cands[i].w; bestI = i; }
  }
  return { x: cands[bestI].x, index: bestI, score: -bestW };
}

/** Lấy mẫu theo trọng số */
export function sampleByWeight<T>(cands: Candidate<T>[], rand: () => number): SelectResult<T> {
  const norm = normalizeCandidates(cands);
  if (norm.length === 0) throw new Error("sampleByWeight: rỗng");
  let r = rand();
  r = Math.max(0, Math.min(1, r));
  let acc = 0;
  for (let i = 0; i < norm.length; i++) {
    acc += norm[i].w;
    if (r <= acc) return { x: norm[i].x, index: i, score: -norm[i].w };
  }
  return { x: norm[norm.length - 1].x, index: norm.length - 1, score: -norm[norm.length - 1].w };
}

/* ------------------------ Tuy's Cut Operator 𝒯 ------------------------ */

export interface TuyCutConfig<T> {
  /** Số vòng cut tối đa */
  steps?: number;

  /** Lịch ngưỡng: tauH(t), epsE(t) theo bước t. Nếu null thì không dùng ngưỡng đó. */
  tauHSchedule?: ((t: number) => number) | null;
  epsESchedule?: ((t: number) => number) | null;

  /** Cut config (energy + optional height) */
  cut: Omit<CutConfig<T>, "tauH" | "epsE">;

  /** Select config */
  select: SelectConfig<T>;
}

/**
 * 𝒯: lặp cut để co miền khả thể, rồi chọn nhánh.
 * Trả về: ứng viên được chọn + danh sách còn lại sau cut.
 */
export function TuyCut<T>(cands: Candidate<T>[], cfg: TuyCutConfig<T>): { chosen: SelectResult<T>; remaining: Candidate<T>[] } {
  let cur = cands.slice();
  const steps = cfg.steps ?? 3;

  for (let t = 0; t < steps; t++) {
    const tauH = cfg.tauHSchedule ? cfg.tauHSchedule(t) : null;
    const epsE = cfg.epsESchedule ? cfg.epsESchedule(t) : null;

    const { kept, totalW } = cutCandidates(cur, { ...cfg.cut, tauH, epsE });
    cur = normalizeCandidates(kept, totalW);

    if (cur.length <= 1) break;
  }

  let chosen: SelectResult<T>;
  if (cfg.select.mode === "argmin") chosen = selectArgmin(cur, cfg.select);
  else if (cfg.select.mode === "map") chosen = selectMAP(cur);
  else {
    const r = cfg.select.rand ?? Math.random;
    chosen = sampleByWeight(cur, r);
  }

  return { chosen, remaining: cur };
}

/* ------------------------ tiện ích: lịch ngưỡng ------------------------ */

/** Giảm tuyến tính từ a xuống b trong steps bước */
export function linearSchedule(a: number, b: number, steps: number): (t: number) => number {
  const den = Math.max(1, steps - 1);
  return (t: number) => a + (b - a) * (t / den);
}
