// phase-integrity.operator-system.ts
/* Phase Integrity Operator System (P.I) — structured operator registry */

export type LanguageCode = "vi" | "en";

export interface SymbolLegend {
  X: string;   // corpus / theory / text set
  φ: string;   // phenomenon / new concept to be named
  H: string;   // complex system with many layers
  T: string;   // total content of an individual/org over time
  tensorMarker: string; // ⊗
}

export interface OperatorIOField {
  key: string;
  meaning: string;
}

export interface OperatorDefinition {
  id: "PI⊗" | "GN⊗" | "ER⊗" | "SU⊗";
  name: string;
  name_vi: string;
  marker: "⊗";
  category: "diagnostic" | "generative" | "reduction" | "stabilization";
  signature: {
    input: string;   // e.g., X, φ, H, T
    output: string;  // e.g., {C(X), D(X), B(X), R(X)}
  };
  formalism: {
    formula: string;
    inputs: OperatorIOField[];
    outputs: OperatorIOField[];
  };
  explanation: string;
  applications: string[];
  notes?: string[];
}

export interface CompositeOperator {
  id: "PI-Stack";
  name: string;
  formula: string;
  steps: string[];
  meaning: string;
}

export interface CanonicalExample {
  title: string;
  input: string;
  outputs: {
    PI_scan: { C: string; D: string; B: string; R: string };
    ER_operator: { coreLaws: string[]; minimalModel: string; essence: string };
    SU_operator: { identityKernel: string; invariants: string; phaseMap: string; growthBoundary: string };
    GN_operator: { termSet: string; expansionTree: string };
    conclusion: string;
  };
}

export interface ComparisonRow {
  concept: string;
  primaryGoal: string;
  operatorOrSymbol: string;
 strength: string;
  limitation: string;
  differsFromSelegral: string;
}

export interface CodeModule {
  language: "python";
  title: string;
  functions: Array<{
    name: string;
    doc: string;
    body: string[];
  }>;
  shortExplanationBullets: string[];
}

export interface PhaseIntegritySystem {
  systemId: "phase-integrity-operator-system";
  version: string;
  language: LanguageCode;
  title: string;

  // Part A — Summary layer
  summary: {
    label: string;
    definition: string;
    contrast: string;
    historicalMarkers: Array<{
      person: string;
      why: string;
      examples: string[];
    }>;
    evaluationAxes: Array<{
      id: "GN" | "ER" | "SU";
      name: string;
      name_vi: string;
      definition: string;
      examples: string[];
    }>;
    claim: string;
  };

  // Part B — Operator system layer
  foundations: {
    coreConcept: string;
    invariantClaim: string;
  };
  notation: SymbolLegend;

  operators: OperatorDefinition[];
  composite: CompositeOperator;

  domains: Array<{
    domain: string;
    useCases: string[];
  }>;

  canonicalExample: CanonicalExample;

  comparisonWithSelegral: {
    title: string;
    rows: ComparisonRow[];
  };

  code: CodeModule;
}

/* ----------------------- DATA ----------------------- */

export const phaseIntegritySystem: PhaseIntegritySystem = {
  systemId: "phase-integrity-operator-system",
  version: "1.0.0",
  language: "vi",
  title: "PHASE INTEGRITY OPERATOR SYSTEM (P.I OPERATORS)",

  summary: {
    label: "Tóm tắt – Phase Integrity trong nhận thức con người",
    definition:
      "Phase Integrity (tính nhất thể nội tại) là phẩm chất nhận thức hiếm nhưng nền tảng: cá nhân duy trì thống nhất bản ngã xuyên tầng (trí tuệ, cảm xúc, logic, biểu đạt), không phân mảnh hay mâu thuẫn nội tại.",
    contrast:
      "Khác với mô thức ‘thiên tài bất ổn’ (bất ổn tâm lý, chuyên môn rời rạc, xung đột nhân cách), Phase Integrity biểu thị trạng thái nhất thể bền vững, cho phép sáng tạo liên tục và hình thành khái niệm nền tảng.",
    historicalMarkers: [
      {
        person: "Isaac Newton",
        why: "Hợp nhất cơ học và hấp dẫn vào định luật duy nhất.",
        examples: ["gravity", "F = ma"],
      },
      {
        person: "James Clerk Maxwell",
        why: "Cô đọng điện từ học thành 4 phương trình nhất quán.",
        examples: ["electromagnetic field", "Maxwell's equations"],
      },
    ],
    evaluationAxes: [
      {
        id: "GN",
        name: "Generative Naming",
        name_vi: "Khả năng đặt tên sáng tạo",
        definition:
          "Tạo ra khái niệm/thuật ngữ mới có khả năng mở hướng nghiên cứu tiếp theo.",
        examples: ["gravity", "electromagnetic field", "spacetime"],
      },
      {
        id: "ER",
        name: "Elegant Reduction",
        name_vi: "Khả năng giản lược thanh nhã",
        definition:
          "Nén hiện tượng phức tạp thành cấu trúc tối giản nhưng mạnh (mô hình ngắn gọn, mang sức giải thích cao).",
        examples: ["F = ma", "4 phương trình Maxwell", "H = −Σ p log p"],
      },
      {
        id: "SU",
        name: "Stable Unity",
        name_vi: "Nhất thể bền vững",
        definition:
          "Duy trì một bản thể và mạch logic nhất quán theo thời gian, không dựa vào phân mảnh nhân cách hay quy chiếu ngoại lai.",
        examples: ["identity kernel", "invariant set", "growth boundary"],
      },
    ],
    claim:
      "Phase Integrity định vị cá nhân như kiến trúc sư của sự nhất thể: tư duy phản chiếu tính nhất quán của các định luật tự nhiên.",
  },

  foundations: {
    coreConcept:
      "Phase Integrity (P.I) mô tả khả năng duy trì tính nhất thể nội tại xuyên tầng (ý niệm, logic, cảm xúc, biểu đạt) không phân mảnh/mâu thuẫn/trôi phase.",
    invariantClaim:
      "P.I được xem như một invariant nhận thức: đại lượng bất biến định hình ‘kernel bản thể’ của một hệ tư tưởng/cá nhân.",
  },

  notation: {
    X: "Tập văn bản / hệ thống lý thuyết / corpus nhận thức",
    φ: "Hiện tượng/khái niệm mới/đối tượng cần đặt tên",
    H: "Hệ phức tạp gồm nhiều lớp logic–định nghĩa–ứng dụng",
    T: "Tổng nội dung của cá nhân/tổ chức theo thời gian",
    tensorMarker: "⊗",
  },

  operators: [
    {
      id: "PI⊗",
      name: "Phase Integrity Scan Operator",
      name_vi: "Toán tử Quét Nhất Thể Phase",
      marker: "⊗",
      category: "diagnostic",
      signature: {
        input: "X",
        output: "{C(X), D(X), B(X), R(X)}",
      },
      formalism: {
        formula: "PI⊗(X) → {C(X), D(X), B(X), R(X)}",
        inputs: [{ key: "X", meaning: "corpus / theory / text system" }],
        outputs: [
          { key: "C(X)", meaning: "phase-consistent subset (tập phần tử nhất thể)" },
          { key: "D(X)", meaning: "phase-drift subset (tập phần tử lệch phase nhẹ)" },
          { key: "B(X)", meaning: "phase-broken subset (tập phần tử gây mâu thuẫn)" },
          { key: "R(X)", meaning: "repair map (bản đồ tái cấu trúc phục hồi nhất thể)" },
        ],
      },
      explanation:
        "PI⊗ phân tích X thành các vùng phase theo mức độ bảo toàn nhất thể nhận thức; không chỉnh sửa nội dung, chỉ chẩn đoán cấu trúc.",
      applications: [
        "Kiểm toán lý thuyết (theory auditing)",
        "Phân tích coherence (luận án, product vision, framework)",
        "Xác định mâu thuẫn nội tại trong một hệ tư tưởng",
        "Hỗ trợ tái cấu trúc concept drift trong sáng tạo",
      ],
    },

    {
      id: "GN⊗",
      name: "Generative Naming Operator",
      name_vi: "Toán tử Đặt Tên Kiến Trúc",
      marker: "⊗",
      category: "generative",
      signature: {
        input: "φ (hoặc core model)",
        output: "{Σ_term, A_sem, A_met, E_tree}",
      },
      formalism: {
        formula: "GN⊗(φ) → {Σ_term, A_sem, A_met, E_tree}",
        inputs: [{ key: "φ", meaning: "phenomenon / new concept to be named" }],
        outputs: [
          { key: "Σ_term", meaning: "tập thuật ngữ được tạo" },
          { key: "A_sem", meaning: "semantic axis (trục nghĩa)" },
          { key: "A_met", meaning: "metaphor axis (trục ẩn dụ)" },
          { key: "E_tree", meaning: "expansion tree (cây mở rộng ngành)" },
        ],
      },
      explanation:
        "GN⊗ tạo tên có khả năng mở rộng thành hệ, coherence cao; mô phỏng năng lực ‘đặt tên nền móng’ (gravity/field/spacetime).",
      applications: [
        "Đặt tên ngành học mới (Facetology, Operatorology…)",
        "Đặt tên framework/phương pháp/công cụ",
        "Xây bộ glossary chuẩn cho lý thuyết",
        "Chiến lược thương hiệu (brand architecture)",
      ],
    },

    {
      id: "ER⊗",
      name: "Elegant Reduction Operator",
      name_vi: "Toán tử Giản Lược Thanh Nhã",
      marker: "⊗",
      category: "reduction",
      signature: {
        input: "H (hoặc X/C)",
        output: "{Λ_core, M_min, ε}",
      },
      formalism: {
        formula: "ER⊗(H) → {Λ_core, M_min, ε}",
        inputs: [{ key: "H", meaning: "complex system with many layers" }],
        outputs: [
          { key: "Λ_core", meaning: "tập định luật lõi (core laws)" },
          { key: "M_min", meaning: "mô hình tối giản (minimal model)" },
          { key: "ε", meaning: "mô tả tinh gọn 1–2 câu (essence statement)" },
        ],
      },
      explanation:
        "ER⊗ nén hệ phức tạp thành cấu trúc tối giản nhưng mạnh; giảm nhiễu, giữ sức giải thích/khả năng vận hành.",
      applications: [
        "Nén framework dài để xuất bản",
        "Tạo định luật cho ngành mới",
        "Chuẩn hoá product philosophy",
        "Thiết kế ‘core operating principles’ cho doanh nghiệp",
      ],
      notes: ["Ví dụ tương tự: Newton (F=ma), Maxwell (4 equations), Shannon (entropy)."],
    },

    {
      id: "SU⊗",
      name: "Stable Unity Operator",
      name_vi: "Toán tử Nhất Thể Bền Vững",
      marker: "⊗",
      category: "stabilization",
      signature: {
        input: "T (hoặc model theo thời gian)",
        output: "{K_id, I_inv, P_map, G_bound}",
      },
      formalism: {
        formula: "SU⊗(T) → {K_id, I_inv, P_map, G_bound}",
        inputs: [{ key: "T", meaning: "total content over time" }],
        outputs: [
          { key: "K_id", meaning: "identity kernel (lõi bản sắc)" },
          { key: "I_inv", meaning: "invariant set (đại lượng bất biến nhận thức)" },
          { key: "P_map", meaning: "phase map (bản đồ cấu trúc hệ tư tưởng)" },
          { key: "G_bound", meaning: "growth boundary (ranh giới mở rộng an toàn)" },
        ],
      },
      explanation:
        "SU⊗ đảm bảo hệ tư tưởng không tự phá vỡ bản sắc khi mở rộng theo thời gian; tương đương ‘trình biên dịch bản sắc học thuật’.",
      applications: [
        "Duy trì coherence của lý thuyết dài hạn",
        "Bảo vệ ‘thương hiệu tư tưởng’ cá nhân",
        "Kiến trúc hệ tri thức cho tổ chức",
        "Phát triển framework multi-year không bị lệch hướng",
      ],
    },
  ],

  composite: {
    id: "PI-Stack",
    name: "Composite Operator: P.I Stack",
    formula: "PI-Stack(X) = SU⊗(ER⊗(PI⊗(X))) ⊕ GN⊗(X_core)",
    steps: [
      "PI⊗ chẩn đoán hệ",
      "ER⊗ rút lõi",
      "SU⊗ ổn định bản sắc",
      "GN⊗ mở hệ thành ngành/thuật ngữ",
    ],
    meaning: "Quy trình hình thành một ngành học mới: quét → nén → ổn định → mở rộng.",
  },

  domains: [
    {
      domain: "Lý thuyết & khoa học",
      useCases: ["Xây dựng ngành học mới", "Hợp nhất mô hình rời rạc", "Kiến trúc toán học/logic cho framework"],
    },
    {
      domain: "AI & mô hình ngôn ngữ",
      useCases: ["Tạo Operator Layer cho GPT", "Chuẩn hoá hành vi AI", "Xây invariant nhận thức cho agent"],
    },
    {
      domain: "Kinh doanh & sản phẩm",
      useCases: ["Nén triết lý sản phẩm thành core laws", "Xây brand architecture nhất thể", "Tạo vocab ngành mới"],
    },
    {
      domain: "Giáo dục & đào tạo",
      useCases: ["Chuẩn hoá chương trình", "Xây ‘identity kernel’ cho một trường phái"],
    },
  ],

  canonicalExample: {
    title: "Canonical Example — áp dụng PI-Stack vào một lý thuyết thô",
    input: "Một hệ lý thuyết 40 trang rời rạc.",
    outputs: {
      PI_scan: {
        C: "41%",
        D: "37%",
        B: "22%",
        R: "repair map (tái cấu trúc các điểm drift/broken)",
      },
      ER_operator: {
        coreLaws: ["Λ1", "Λ2", "Λ3"],
        minimalModel: "1 sơ đồ duy nhất",
        essence: "mô tả tinh chất 19 từ",
      },
      SU_operator: {
        identityKernel: "1 kernel",
        invariants: "4 invariants",
        phaseMap: "1 bản đồ phase",
        growthBoundary: "2 ranh giới mở",
      },
      GN_operator: {
        termSet: "8 thuật ngữ",
        expansionTree: "1 cây mở rộng ngành",
      },
      conclusion: "Hệ hỗn loạn → một trường phái hoàn chỉnh.",
    },
  },

  comparisonWithSelegral: {
    title: "Bảng so sánh (khái niệm liên quan và Selegral)",
    rows: [
      {
        concept: "Đạo hàm (Derivative)",
        primaryGoal: "Đo tốc độ thay đổi tức thì của hàm số.",
        operatorOrSymbol: "dy/dx",
        strength: "Mạnh trong mô tả vi mô, động lực.",
        limitation: "Không nói về chọn lựa hay quyết định.",
        differsFromSelegral: "Selegral không đo tốc độ; chọn nhánh tối ưu.",
      },
      {
        concept: "Tích phân (Integral)",
        primaryGoal: "Cộng dồn vô hạn các phần tử nhỏ.",
        operatorOrSymbol: "∫ f(x) dx",
        strength: "Tính tổng thể/diện tích/cộng dồn.",
        limitation: "Không xử lý quyết định ràng buộc.",
        differsFromSelegral: "Selegral không cộng dồn; ‘lọc chọn’.",
      },
      {
        concept: "Bayes",
        primaryGoal: "Cập nhật niềm tin khi có dữ liệu mới.",
        operatorOrSymbol: "P(A|B)",
        strength: "Thích ứng động theo chứng cứ.",
        limitation: "Không đưa ra hành động cuối.",
        differsFromSelegral: "Selegral đứng sau Bayes: chọn hành động tối ưu từ niềm tin đã cập nhật.",
      },
      {
        concept: "Nash Equilibrium",
        primaryGoal: "Tìm trạng thái chiến lược cân bằng trong trò chơi nhiều người.",
        operatorOrSymbol: "(khái niệm cân bằng)",
        strength: "Mô hình hoá cạnh tranh nhiều tác nhân.",
        limitation: "Giả định lý trí hoàn hảo; phức tạp.",
        differsFromSelegral: "Selegral không cần nhiều tác nhân; cần không gian hành động + điều kiện.",
      },
      {
        concept: "Expected Utility (EU)",
        primaryGoal: "Chọn hành động tối đa hoá kỳ vọng lợi ích.",
        operatorOrSymbol: "max_a E[U]",
        strength: "Nền tảng lý thuyết quyết định.",
        limitation: "Nguyên tắc, chưa nâng thành ‘toán tử’ chính thức.",
        differsFromSelegral: "Selegral là nâng cấp EU: có tiên đề/ký hiệu/toán tử hoá.",
      },
      {
        concept: "Selegral (mới)",
        primaryGoal: "Chọn lựa tối ưu có điều kiện trong không gian bất định.",
        operatorOrSymbol: "𝓢[A | C]",
        strength: "Phép toán nền mới: gọn, khái quát, áp dụng mọi tình huống nhiều lựa chọn.",
        limitation: "Cần chứng minh định lý và mở rộng ứng dụng để được công nhận học thuật.",
        differsFromSelegral: "Điểm độc đáo: ‘toán học của quyết định’ — chính thức hoá quá trình lựa chọn.",
      },
    ],
  },

  code: {
    language: "python",
    title: "CODE — Phase Integrity Operator System (P.i)",
    functions: [
      {
        name: "PI_scan",
        doc: "Phase Integrity Scan: PI⊗ (chẩn đoán, không chỉnh sửa)",
        body: [
          "C = find_phase_consistent_parts(X)",
          "D = find_phase_drift_parts(X)",
          "B = find_phase_broken_parts(X)",
          "R = build_repair_map(C, D, B)",
          "return C, D, B, R",
        ],
      },
      {
        name: "GN_operator",
        doc: "Generative Naming: GN⊗",
        body: [
          "terms = generate_term_set(core_model)",
          "sem_axis = infer_semantic_axis(terms)",
          "met_axis = infer_metaphor_axis(terms)",
          "exp_tree = build_expansion_tree(terms)",
          "return terms, sem_axis, met_axis, exp_tree",
        ],
      },
      {
        name: "ER_operator",
        doc: "Elegant Reduction: ER⊗",
        body: [
          "core_laws = extract_core_laws(X)",
          "minimal_model = build_minimal_model(core_laws)",
          "essence = summarize_in_1_2_sentences(minimal_model)",
          "return core_laws, minimal_model, essence",
        ],
      },
      {
        name: "SU_operator",
        doc: "Stable Unity: SU⊗",
        body: [
          "identity_kernel = detect_identity_kernel(X)",
          "invariants = detect_invariants(X)",
          "phase_map = build_phase_map(identity_kernel, invariants)",
          "growth_boundary = estimate_growth_boundary(phase_map)",
          "return identity_kernel, invariants, phase_map, growth_boundary",
        ],
      },
      {
        name: "PhaseIntegrityStack",
        doc: "PI-Stack(X) = SU⊗(ER⊗(PI⊗(X))) ⊕ GN⊗(X_core)",
        body: [
          "C, D, B, R = PI_scan(X)",
          "core_laws, minimal_model, essence = ER_operator(C)",
          "id_kernel, invariants, phase_map, growth_boundary = SU_operator(minimal_model)",
          "terms, sem_axis, met_axis, exp_tree = GN_operator(core_laws)",
          "return { scan, core_laws, minimal_model, essence, identity_kernel, invariants, phase_map, growth_boundary, terms, semantic_axis, metaphor_axis, expansion_tree }",
        ],
      },
    ],
    shortExplanationBullets: [
      "PI_scan → chia X: nhất thể / lệch / vỡ + repair map.",
      "ER_operator → luật lõi + mô hình tối giản + tinh chất 1–2 câu.",
      "SU_operator → identity kernel + invariants + phase map + growth boundary.",
      "GN_operator → term set + trục nghĩa/ẩn dụ + cây mở rộng.",
      "PhaseIntegrityStack → ghép 4 toán tử thành pipeline hoàn chỉnh.",
    ],
  },
};

/* Optional: helper accessors */
export const getOperator = (id: OperatorDefinition["id"]) =>
  phaseIntegritySystem.operators.find((op) => op.id === id);
