/**
 * Toán tử Nền (𝓢₀) — Foundation Operator (VI)
 *
 * Mục đích:
 *   𝓢₀ trích phần bất biến (luật nền) của trạng thái x dưới tập biến đổi hợp lệ G.
 *   Dạng thực hành phổ biến: lấy trung bình/pooling embedding qua K biến thể.
 *
 * Tính chất bắt buộc:
 *   (1) Bất biến: 𝓢₀(x) = 𝓢₀(g·x)
 *   (2) Idempotent: 𝓢₀(𝓢₀(x)) = 𝓢₀(x)
 *
 * Liên hệ với Height:
 *   𝓗(x) = D(x, 𝓢₀(x))
 */

export type Vec = Float32Array;
export type Transform = (x: Vec) => Vec;

/** Encoder: biến input state thành vector đặc trưng/embedding */
export type Encoder = (x: Vec) => Vec;

/** Thước đo khác biệt D(x,y) */
export type Divergence = (a: Vec, b: Vec) => number;

export interface FoundationConfig {
  /** Tập biến đổi hợp lệ (đối xứng) */
  transforms: Transform[];
  /** Nếu true, gồm cả identity */
  includeIdentity?: boolean;

  /** Encoder f: nếu bỏ trống thì coi x đã là embedding */
  encoder?: Encoder;

  /** Có chuẩn hóa L2 sau pooling không */
  l2Normalize?: boolean;
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

export function l2Normalize(a: Vec): Vec {
  const n = l2(a);
  if (n === 0) return a.slice() as Vec;
  const out = new Float32Array(a.length);
  const inv = 1 / n;
  for (let i = 0; i < a.length; i++) out[i] = a[i] * inv;
  return out;
}

export function addInPlace(acc: Float32Array, v: Vec): void {
  if (acc.length !== v.length) throw new Error("addInPlace: sai kích thước");
  for (let i = 0; i < acc.length; i++) acc[i] += v[i];
}

export function scale(v: Vec, c: number): Vec {
  const out = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v[i] * c;
  return out;
}

export function sub(a: Vec, b: Vec): Vec {
  if (a.length !== b.length) throw new Error("sub: sai kích thước");
  const out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] - b[i];
  return out;
}

/* ------------------------ divergences ------------------------ */

export function cosineDivergence(a: Vec, b: Vec): number {
  const na = l2(a);
  const nb = l2(b);
  if (na === 0 || nb === 0) return 1;
  const c = dot(a, b) / (na * nb);
  const cc = Math.max(-1, Math.min(1, c));
  return 1 - cc;
}

/* ------------------------ Foundation Operator 𝓢₀ ------------------------ */

/**
 * 𝓢₀ thực hành: pooling/average qua các biến thể hợp lệ g∈G.
 *  z = 𝓢₀(x) ≈ (1/K) Σ_i f(T_i(x))
 */
export function S0(x: Vec, cfg: FoundationConfig): Vec {
  const encoder = cfg.encoder ?? ((v: Vec) => v);
  const xs: Vec[] = [];

  if (cfg.includeIdentity !== false) xs.push(x);
  for (const T of cfg.transforms) xs.push(T(x));

  // encode each variant
  const encoded: Vec[] = xs.map(encoder);

  // pooling (mean)
  const acc = new Float32Array(encoded[0].length);
  for (const v of encoded) addInPlace(acc, v);
  let out = scale(acc, 1 / encoded.length);

  if (cfg.l2Normalize) out = l2Normalize(out);
  return out;
}

/**
 * Kiểm định bất biến (gần đúng):
 *  D(S0(x), S0(g·x)) phải nhỏ với mọi g trong tập mẫu.
 */
export function invarianceScore(x: Vec, cfg: FoundationConfig, D: Divergence = cosineDivergence): number {
  const z = S0(x, cfg);
  const xs: Vec[] = [];
  if (cfg.includeIdentity !== false) xs.push(x);
  for (const T of cfg.transforms) xs.push(T(x));

  let s = 0;
  for (const v of xs) {
    const zg = S0(v, cfg);
    s += D(z, zg);
  }
  return s / xs.length;
}

/**
 * Height từ 𝓢₀:
 *  𝓗(x)=D(x, S0(x))
 *
 * Lưu ý: Nếu x không phải embedding, hãy cung cấp encoder để so sánh trong cùng không gian.
 */
export function heightFromS0(x: Vec, cfg: FoundationConfig, D: Divergence = cosineDivergence): number {
  const encoder = cfg.encoder ?? ((v: Vec) => v);
  const ex = encoder(x);
  const z = S0(x, cfg);
  return D(ex, z);
}

/* ------------------------ ví dụ transforms đơn giản ------------------------ */

/**
 * Transform ví dụ: thêm nhiễu nhỏ (mô phỏng). Với silicon: ưu tiên canonicalization/LUT đơn giản.
 */
export function makeNoiseTransform(seed: number, std = 0.01): Transform {
  let s = seed >>> 0;
  const rand = () => {
    // xorshift32
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17; s >>>= 0;
    s ^= s << 5;  s >>>= 0;
    return (s >>> 0) / 0xFFFFFFFF;
  };

  return (x: Vec) => {
    const out = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) {
      const u1 = Math.max(1e-12, rand());
      const u2 = Math.max(1e-12, rand());
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      out[i] = x[i] + std * z;
    }
    return out;
  };
}
