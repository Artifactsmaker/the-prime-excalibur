/* PiOmega_PreObsolescenceHorizonOperator.ts
   ΠΩ — Pre-Obsolescence Horizon Operator
   Runtime scaffold:
   - computes O_launch(I)
   - estimates OHI(I) via discrete integral (samples)
   - normalizes (simple min-max by default, pluggable)
   - computes S(I)
   - classifies: Reject/Pivot | Revise | Proceed/Expand
*/

export type PiOmegaClass =
  | "Loại bỏ / chuyển hướng"
  | "Xem xét chỉnh sửa"
  | "Tiếp tục / mở rộng";

export type NormalizationMethod = "minmax" | "zscore" | "none";

export type PiOmegaInput = {
  ideaId: string;

  // timeline
  tLaunch: number; // t_L
  THorizon: number; // T

  // launch obsolescence (can be raw or normalized)
  Olaunch: number;

  // discrete approximation of O_I(t) over [0..T]
  ohiSamples?: number[]; // O_I(t_k)
  weights?: number[]; // w(t_k) aligned with ohiSamples
  dt?: number; // time step between samples; default = 1

  // score weight α
  alpha?: number; // [0,1], default 0.5

  // classification thresholds
  OmegaLow?: number; // default 0.0
  OmegaHigh?: number; // default 0.5

  // normalization settings
  normalization?: {
    method?: NormalizationMethod;
    // optional reference ranges (for stable comparisons across ideas)
    launchMin?: number;
    launchMax?: number;
    ohiMin?: number;
    ohiMax?: number;
    // for zscore (optional)
    launchMean?: number;
    launchStd?: number;
    ohiMean?: number;
    ohiStd?: number;
  };

  // future context descriptor (optional, for UI/trace)
  futureContext?: string[];
};

export type PiOmegaOutput = {
  PiOmega: {
    Olaunch: number;
    OHI: number;
    classLabel: PiOmegaClass;
  };
  score: {
    S: number;
    alpha: number;
    OlaunchHat: number;
    OHIHat: number;
    OmegaLow: number;
    OmegaHigh: number;
  };
  diagnostics: {
    ideaId: string;
    tLaunch: number;
    THorizon: number;
    integralMode: "discrete" | "missing_samples";
    sampleCount: number;
    dt: number;
    normalizationMethod: NormalizationMethod;
  };
  notes: string[];
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function safeDiv(a: number, b: number) {
  return b === 0 ? 0 : a / b;
}

function minmax(x: number, min: number, max: number) {
  if (max === min) return 0;
  return (x - min) / (max - min);
}

function zscore(x: number, mean: number, std: number) {
  if (std === 0) return 0;
  return (x - mean) / std;
}

// Discrete integral approximation: Σ w_k * O_k * dt
function discreteIntegral(oks: number[], wks: number[], dt: number): number {
  const n = Math.min(oks.length, wks.length);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += wks[i] * oks[i] * dt;
  return sum;
}

function classify(S: number, OmegaLow: number, OmegaHigh: number): PiOmegaClass {
  if (S > OmegaHigh) return "Loại bỏ / chuyển hướng";
  if (S < OmegaLow) return "Tiếp tục / mở rộng";
  return "Xem xét chỉnh sửa";
}

export function runPiOmega(input: PiOmegaInput): PiOmegaOutput {
  const alpha = clamp01(input.alpha ?? 0.5);
  const OmegaLow = input.OmegaLow ?? 0.0;
  const OmegaHigh = input.OmegaHigh ?? 0.5;
  const dt = input.dt ?? 1;

  const method: NormalizationMethod = input.normalization?.method ?? "minmax";

  // 1) O_launch
  const OlaunchRaw = input.Olaunch;

  // 2) OHI via discrete integral if samples exist; otherwise fallback = 0 and warn
  let OHI = 0;
  let integralMode: "discrete" | "missing_samples" = "missing_samples";
  let sampleCount = 0;

  if (input.ohiSamples && input.ohiSamples.length > 0) {
    const oks = input.ohiSamples;
    const wks = (input.weights && input.weights.length > 0)
      ? input.weights
      : oks.map(() => 1); // default uniform weights

    OHI = discreteIntegral(oks, wks, dt);
    integralMode = "discrete";
    sampleCount = Math.min(oks.length, wks.length);
  }

  // 3) Normalize (Ō_launch and ŌHI)
  let OlaunchHat = OlaunchRaw;
  let OHIHat = OHI;

  if (method === "minmax") {
    const lMin = input.normalization?.launchMin ?? 0;
    const lMax = input.normalization?.launchMax ?? 1;
    const hMin = input.normalization?.ohiMin ?? 0;
    const hMax = input.normalization?.ohiMax ?? Math.max(1, OHI); // avoid collapse

    OlaunchHat = minmax(OlaunchRaw, lMin, lMax);
    OHIHat = minmax(OHI, hMin, hMax);
  } else if (method === "zscore") {
    const lMean = input.normalization?.launchMean ?? 0;
    const lStd = input.normalization?.launchStd ?? 1;
    const hMean = input.normalization?.ohiMean ?? 0;
    const hStd = input.normalization?.ohiStd ?? 1;

    // zscore can be outside [0,1]; we keep raw z then optionally clamp for mixing
    OlaunchHat = zscore(OlaunchRaw, lMean, lStd);
    OHIHat = zscore(OHI, hMean, hStd);
  } else if (method === "none") {
    // keep raw values
  }

  // 4) Unified score
  // For zscore, mixing may exceed [0,1] — acceptable if you use zero-centered thresholds.
  const S = alpha * OlaunchHat + (1 - alpha) * OHIHat;

  // 5) Classification
  const classLabel = classify(S, OmegaLow, OmegaHigh);

  // Notes
  const notes: string[] = [];
  if (integralMode === "missing_samples") {
    notes.push("OHI samples missing: OHI set to 0. Provide ohiSamples (and optional weights) for horizon evaluation.");
  }
  if (method === "zscore") {
    notes.push("Normalization method zscore may yield S outside [0,1]. Consider zero-centered thresholds or clamp if needed.");
  }
  notes.push(`Result: ${classLabel}`);

  return {
    PiOmega: {
      Olaunch: OlaunchRaw,
      OHI,
      classLabel
    },
    score: {
      S,
      alpha,
      OlaunchHat,
      OHIHat,
      OmegaLow,
      OmegaHigh
    },
    diagnostics: {
      ideaId: input.ideaId,
      tLaunch: input.tLaunch,
      THorizon: input.THorizon,
      integralMode,
      sampleCount,
      dt,
      normalizationMethod: method
    },
    notes
  };
}

// Helper: default time-weight function w(t) samples (exponential discount)
export function buildTimeWeights(
  n: number,
  discount: number = 0.98
): number[] {
  const w: number[] = [];
  for (let i = 0; i < n; i++) w.push(Math.pow(discount, i));
  return w;
}

// Helper: quick normalization ranges suggestion based on observed values
export function suggestMinMaxRanges(values: number[]) {
  if (values.length === 0) return { min: 0, max: 1 };
  let min = values[0];
  let max = values[0];
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  // avoid zero span
  if (min === max) max = min + 1;
  return { min, max };
}
