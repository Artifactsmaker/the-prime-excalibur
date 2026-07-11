/**
 * Toán tử tồn tại — Existence Operator (𝒰)
 * Operatorology artifact (VN)
 *
 * Lõi định nghĩa:
 *   1) Điều kiện tồn tại (fixed point):        𝒰x = x
 *   2) Metric tồn tại (sai lệch tồn tại):      ℳ(x) = ‖𝒰x − x‖
 *   3) Không gian tồn tại (kernel):           Existence = ker(𝒰 − 𝕀)
 *
 * Ghi chú:
 * - File này cố tình tối giản nhưng “đủ dùng”: bạn có thể thay 𝒰 bằng bất kỳ luật/động lực/update nào.
 * - Không dùng LaTeX trong dữ liệu huấn luyện; chỉ dùng Unicode math trong chuỗi.
 */

export type Scalar = number;

/** Vector số học cơ bản */
export type Vector = number[];

/** Chuẩn (norm) dùng cho metric; mặc định L2 */
export type Norm = (v: Vector) => Scalar;

/** Ánh xạ trạng thái tổng quát: 𝒰 : 𝕊 → 𝕊 */
export type Operator<S> = (x: S) => S;

/** Hàm khoảng cách d(x, y) nếu muốn metric dạng d(x, 𝒰x) */
export type Distance<S> = (a: S, b: S) => Scalar;

/** Cấu hình kiểm tra tồn tại */
export interface ExistenceConfig {
  /** Ngưỡng gần-0 để coi là hội tụ (floating-point tolerance) */
  epsilon: Scalar;
  /** Số vòng lặp tối đa cho phép chiếu về nghiệm tồn tại */
  maxIters: number;
}

/** Kết quả kiểm tra tồn tại / hội tụ */
export interface ExistenceResult<S> {
  /** Trạng thái đầu vào */
  x0: S;
  /** Trạng thái sau khi chiếu/hội tụ */
  xStar: S;
  /** Metric cuối cùng: ℳ(xStar) */
  metric: Scalar;
  /** Có thỏa điều kiện tồn tại (gần fixed point) hay không */
  isFixedPoint: boolean;
  /** Số vòng lặp đã chạy */
  iters: number;
}

/** Chuẩn L2 cho vector */
export const normL2: Norm = (v) => {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  return Math.sqrt(s);
};

/** Chuẩn L1 cho vector */
export const normL1: Norm = (v) => {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += Math.abs(v[i]);
  return s;
};

/** Trừ vector: a − b */
export function subVec(a: Vector, b: Vector): Vector {
  if (a.length !== b.length) throw new Error("subVec: length mismatch");
  const out = new Array<number>(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] - b[i];
  return out;
}

/**
 * Metric tồn tại cho vector:
 *   ℳ(x) = ‖𝒰x − x‖
 */
export function existenceMetricVec(U: Operator<Vector>, x: Vector, norm: Norm = normL2): Scalar {
  const y = U(x);
  return norm(subVec(y, x));
}

/**
 * Metric tồn tại tổng quát theo distance:
 *   ℳ(x) = d(x, 𝒰x)
 * (Hữu ích khi trạng thái không phải vector)
 */
export function existenceMetric<S>(U: Operator<S>, x: S, d: Distance<S>): Scalar {
  return d(x, U(x));
}

/**
 * Kiểm tra fixed point (tồn tại ổn định) theo metric:
 *   Existence ⇔ ℳ(x) = 0  (trong tính toán số dùng epsilon)
 */
export function isFixedPointVec(
  U: Operator<Vector>,
  x: Vector,
  cfg: Partial<ExistenceConfig> = {},
  norm: Norm = normL2
): boolean {
  const { epsilon = 1e-9 } = cfg;
  return existenceMetricVec(U, x, norm) <= epsilon;
}

/**
 * Toán tử chiếu tồn tại (projection) cho vector:
 *   𝒫(x) = lim_{n→∞} 𝒰^n x
 * Trả về x* gần nhất mà 𝒰x* ≈ x* (nếu hội tụ trong maxIters).
 */
export function projectToExistenceVec(
  U: Operator<Vector>,
  x0: Vector,
  cfg: Partial<ExistenceConfig> = {},
  norm: Norm = normL2
): ExistenceResult<Vector> {
  const { epsilon = 1e-9, maxIters = 10_000 } = cfg;

  let x = x0.slice();
  let m = existenceMetricVec(U, x, norm);
  let iters = 0;

  while (m > epsilon && iters < maxIters) {
    x = U(x);
    m = existenceMetricVec(U, x, norm);
    iters++;
  }

  return {
    x0,
    xStar: x,
    metric: m,
    isFixedPoint: m <= epsilon,
    iters
  };
}

/**
 * Ví dụ 1 (AI / tối ưu): Gradient step hội tụ về nghiệm ∇L = 0.
 * Ở đây ta mô phỏng đơn giản: U(x) = x - η * grad(x)
 */
export function makeGradientStepOperator(
  grad: (x: Vector) => Vector,
  eta: Scalar
): Operator<Vector> {
  return (x) => {
    const g = grad(x);
    if (g.length !== x.length) throw new Error("grad length mismatch");
    const out = new Array<number>(x.length);
    for (let i = 0; i < x.length; i++) out[i] = x[i] - eta * g[i];
    return out;
  };
}

/**
 * Ví dụ 2 (động lực tuyến tính): U(x) = A x
 * Nếu A có eigenvalue 1 và x thuộc eigenspace tương ứng thì 𝒰x = x.
 */
export function makeLinearOperator(A: number[][]): Operator<Vector> {
  return (x) => {
    if (A.length === 0 || A[0].length !== x.length) throw new Error("A shape mismatch");
    const out = new Array<number>(A.length).fill(0);
    for (let i = 0; i < A.length; i++) {
      let s = 0;
      for (let j = 0; j < x.length; j++) s += A[i][j] * x[j];
      out[i] = s;
    }
    return out;
  };
}

/**
 * Chuỗi ký hiệu (Math_Unicode) dùng cho hiển thị / training stability.
 */
export const MathUnicode = {
  core: "𝒰x = x",
  metric: "ℳ(x) = ‖𝒰x − x‖",
  kernel: "Existence = ker(𝒰 − 𝕀)",
  projection: "𝒫(x) = lim_{n→∞} 𝒰ⁿx",
  spectrum: "𝒰x = λx"
} as const;
