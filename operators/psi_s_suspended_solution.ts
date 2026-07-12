/**
 * Ψˢ — Suspended Solution Operator (Toán tử Nghiệm Lửng Lơ)
 * Operatorology / Operator Intelligence artifact
 *
 * Mục tiêu:
 * - Ổn định "nghiệm bán hội tụ" (metastable equilibrium): tồn tại bền mà không cần hội tụ tuyệt đối.
 * - Dùng như một lớp "stabilizer/anchor" cho A.i và O.i: dừng tối ưu vô hạn, khóa trạng thái ổn định cục bộ.
 *
 * Quy ước dữ liệu:
 * - Không dùng LaTeX/KaTeX trong chuỗi hiển thị.
 * - Dùng Unicode math (Math_Unicode) cho ký hiệu: Ωₜ₊₁ = T(Ωₜ), ‖T(x) − x‖ ≤ ε, Ψˢ ∘ Ψˢ ≈ Ψˢ
 * - Có semantics AST tối thiểu để compile/trace trên chip (tùy stack).
 */

export type Scalar = number;

export interface Vector {
  /** Vector ℝⁿ */
  v: number[];
}

export interface Tensor2 {
  /** Ma trận/tensor bậc 2 ℝⁿˣᵐ (row-major) */
  shape: [number, number];
  data: number[]; // length = n*m
}

/** Trạng thái tổng quát: vector hoặc tensor */
export type State = Vector | Tensor2;

/** Hàm chuẩn (norm) */
export type NormFn = (delta: number[]) => number;

/** Toán tử chuyển trạng thái T: Ω → Ω */
export type TransitionFn = (x: State) => State;

/** Tham số của Ψˢ */
export interface SuspendedSolutionParams {
  /** ε: ngưỡng bán ổn định (metastability threshold) */
  epsilon: number;
  /** K: số bước kiểm chứng liên tiếp (streak) */
  streakK: number;
  /** Chuẩn dùng đo độ trôi (mặc định L2) */
  norm?: NormFn;
}

/** Kết quả đánh giá metastability */
export interface SuspendedSolutionResult {
  /** xˢ: trạng thái được coi là nghiệm lửng lơ (có thể chính là x hiện tại) */
  xs: State;
  /** ‖T(xˢ) − xˢ‖ */
  drift: number;
  /** số bước liên tiếp đạt điều kiện drift ≤ ε */
  streak: number;
  /** đã kích hoạt khóa trạng thái hay chưa */
  locked: boolean;
}

/** L2 norm mặc định */
export const l2Norm: NormFn = (delta) => {
  let s = 0;
  for (let i = 0; i < delta.length; i++) s += delta[i] * delta[i];
  return Math.sqrt(s);
};

/** Trừ hai vector */
function sub(a: number[], b: number[]): number[] {
  const n = Math.min(a.length, b.length);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = a[i] - b[i];
  return out;
}

/** Lấy dữ liệu phẳng của State */
function flatten(x: State): number[] {
  if ((x as Vector).v) return (x as Vector).v.slice();
  return (x as Tensor2).data.slice();
}

/** Clone state */
function cloneState(x: State): State {
  if ((x as Vector).v) return { v: (x as Vector).v.slice() };
  const t = x as Tensor2;
  return { shape: [t.shape[0], t.shape[1]], data: t.data.slice() };
}

/**
 * Ψˢ — Toán tử Nghiệm Lửng Lơ
 *
 * Định nghĩa (mức triển khai):
 * - Xét hệ: Ωₜ₊₁ = T(Ωₜ)
 * - Drift: d(x) = ‖T(x) − x‖
 * - Kích hoạt Ψˢ nếu d(x) ≤ ε trong K bước liên tiếp
 *
 * Lưu ý: Ở mức lý thuyết, Ψˢ(x) = xˢ với:
 * - ‖T(xˢ) − xˢ‖ ≤ ε
 * - ∇‖T(x) − x‖ |ₓ₌ₓˢ = 0 (cực tiểu cục bộ)
 * Ở mức runtime/chip, ta dùng tiêu chuẩn drift + streak để xấp xỉ điều kiện cực tiểu.
 */
export class SuspendedSolutionOperator {
  public readonly symbol = "Ψˢ";
  public readonly name_vi = "Toán tử Nghiệm Lửng Lơ";
  public readonly name_en = "Suspended Solution Operator";

  private readonly T: TransitionFn;
  private readonly epsilon: number;
  private readonly K: number;
  private readonly norm: NormFn;

  private streak = 0;
  private locked = false;
  private lastStable: State | null = null;
  private lastDrift = Number.POSITIVE_INFINITY;

  constructor(T: TransitionFn, params: SuspendedSolutionParams) {
    if (!Number.isFinite(params.epsilon) || params.epsilon <= 0) {
      throw new Error("epsilon phải là số dương hữu hạn.");
    }
    if (!Number.isInteger(params.streakK) || params.streakK < 1) {
      throw new Error("streakK phải là số nguyên ≥ 1.");
    }
    this.T = T;
    this.epsilon = params.epsilon;
    this.K = params.streakK;
    this.norm = params.norm ?? l2Norm;
  }

  /** Reset bộ nhớ streak/lock */
  reset(): void {
    this.streak = 0;
    this.locked = false;
    this.lastStable = null;
    this.lastDrift = Number.POSITIVE_INFINITY;
  }

  /** Tính drift d(x) = ‖T(x) − x‖ */
  drift(x: State): number {
    const tx = this.T(x);
    const dx = sub(flatten(tx), flatten(x));
    return this.norm(dx);
  }

  /**
   * Apply Ψˢ lên trạng thái hiện tại.
   * - Nếu chưa lock: cập nhật streak theo drift, lock khi streak đạt K.
   * - Nếu đã lock: trả về trạng thái đã lock (xs) để duy trì persistence.
   */
  apply(x: State): SuspendedSolutionResult {
    if (this.locked && this.lastStable) {
      return {
        xs: cloneState(this.lastStable),
        drift: this.lastDrift,
        streak: this.streak,
        locked: true,
      };
    }

    const tx = this.T(x);
    const dx = sub(flatten(tx), flatten(x));
    const d = this.norm(dx);

    if (d <= this.epsilon) {
      this.streak += 1;
      // Lưu ứng viên ổn định (xs) là x hiện tại (hoặc có thể là tx tuỳ policy)
      this.lastStable = cloneState(x);
      this.lastDrift = d;

      if (this.streak >= this.K) {
        this.locked = true;
      }
    } else {
      // drift lớn: reset streak
      this.streak = 0;
      this.lastStable = null;
      this.lastDrift = d;
    }

    return {
      xs: this.lastStable ? cloneState(this.lastStable) : cloneState(x),
      drift: d,
      streak: this.streak,
      locked: this.locked,
    };
  }

  /** Trạng thái khóa (nếu có) */
  getLockedState(): State | null {
    return this.lastStable ? cloneState(this.lastStable) : null;
  }

  /** Đã khóa hay chưa */
  isLocked(): boolean {
    return this.locked;
  }
}

/**
 * Gợi ý dùng trong A.i:
 * - inference stabilization: dừng khi drift nhỏ liên tiếp
 * - RL: dừng exploration khi policy drift nhỏ
 *
 * Gợi ý dùng trong O.i:
 * - existence anchor: giữ state ổn định mà không cần fixed point tuyệt đối
 * - identity persistence: Identity(x) = Ψˢ(x)
 */
export const notes = {
  math_unicode: [
    "Ωₜ₊₁ = T(Ωₜ)",
    "d(x) = ‖T(x) − x‖",
    "Ψˢ(x) = xˢ, nếu ‖T(xˢ) − xˢ‖ ≤ ε",
    "Ψˢ ∘ Ψˢ ≈ Ψˢ",
  ],
};
