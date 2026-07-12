// brauer-operatorology.threshold-block-operators.ts
// UTF-8 — Operator registry for "Toán tử Khối Tín ngưỡng" (Brauer–Operatorology)

export type LanguageCode = "vi" | "en";

export interface DirectionalitySpec {
  metric: string;              // e.g., "h_B"
  monotone: string;            // e.g., "h_B(Π_B(S)) ≤ h_B(S)"
  strictWhenInvalid?: string;  // optional stricter statement
}

export interface OperatorDef {
  id: string;
  symbol: string;
  name: string;
  type: string;
  signature: string;
  purpose: string;
  notes?: string[];
  directionality?: DirectionalitySpec;
  convergence?: string;
}

export interface Axiom {
  id: string;
  name: string;
  statement: string;
  meaning?: string;
}

export interface Proposition {
  id: string;
  name: string;
  statement: string;
  formal?: string | string[];
  proofSketch?: string;
}

export interface Corollary {
  id: string;
  name: string;
  statement: string;
}

export interface DerivedOperator {
  id: string;
  name: string;
  type: string;
  definition: string;
  corollaries: Corollary[];
}

export interface OperatorSystem {
  systemId: string;
  version: string;
  language: LanguageCode;
  title: string;
  subtitle?: string;

  assumptions: string[];
  notation: Record<string, any>;

  coreOperators: OperatorDef[];
  structures: Record<string, any>;

  axioms: Axiom[];
  propositions: Proposition[];
  derivedOperators: DerivedOperator[];

  relations: Record<string, any>;
  summary: string;
}

export const brauerOperatorologyThresholdBlock: OperatorSystem = {
  "systemId": "brauer-operatorology-threshold-block",
  "version": "1.0.0",
  "language": "vi",
  "title": "Toán tử Khối Tín ngưỡng",
  "subtitle": "Thánh–Căn–Trả nghiệp như một hệ Đối xứng cục bộ và Toán tử Biên (Brauer–Operatorology)",
  "assumptions": [
    "Làm việc trong giả định mô hình: tồn tại một 'hệ khối' vận hành ổn định, có chọn lọc, được cộng đồng gọi là 'Thánh–căn–lộc–hầu'.",
    "Mục tiêu là mô hình hoá cấu trúc vận hành, không khẳng định thực nghiệm."
  ],
  "notation": {
    "state": {
      "S": "Trạng thái của một cá thể (tổng hợp cấu hình tâm–thân–hành vi theo thời điểm).",
      "Ω": "Không gian tất cả trạng thái có thể có."
    },
    "block": {
      "B": {
        "definition": "B := ⟨Ω_B, C_B, ∂B⟩",
        "Ω_B": "Miền trạng thái 'thuộc khối' (Ω_B ⊂ Ω).",
        "C_B": "Bộ ràng buộc (luật khối).",
        "∂B": "Biên khối (ranh giới trong/ngoài)."
      }
    },
    "validity": {
      "formula": "S ⊨ C_B",
      "meaning": "Trạng thái S hợp lệ trong khối B khi thỏa ràng buộc C_B."
    },
    "brauerHeight": {
      "symbol": "h_B(S) ≥ 0",
      "meaning": "Độ cao Brauer (độ vênh/độ cản) — thước đo lệch pha giữa S và ràng buộc C_B.",
      "interpretation": {
        "zero": "h_B(S)=0: khớp luật khối (không vênh).",
        "high": "h_B(S) lớn: xung đột/ma sát cao với luật khối."
      }
    },
    "localSymmetry": {
      "I_B(S)": "Tập bất biến mà khối muốn giữ.",
      "G_B": "Tập biến đổi g sao cho I_B(S)=I_B(g(S)) (đối xứng cục bộ của khối).",
      "formula": "g ∈ G_B ⇒ I_B(S)=I_B(g(S))"
    }
  },
  "coreOperators": [
    {
      "id": "Gate_B",
      "symbol": "Cổng_B",
      "name": "Block Gate (lọc căn)",
      "type": "gate/selection",
      "signature": "Cổng_B(S) ∈ {0,1}",
      "purpose": "Quyết định tính tương thích của trạng thái để đi vào vận hành khối.",
      "notes": [
        "Hình thức hoá câu 'chỉ giúp người có căn' theo nghĩa mô hình."
      ]
    },
    {
      "id": "O_∂B",
      "symbol": "O_{∂B}",
      "name": "Boundary Operator (đưa vào/ra khối)",
      "type": "boundary/transition",
      "signature": "O_{∂B}: Ω → Ω_B",
      "purpose": "Ánh xạ trạng thái từ không gian tổng Ω sang miền vận hành của khối Ω_B (khi được phép bởi cổng)."
    },
    {
      "id": "Π_B",
      "symbol": "Π_B",
      "name": "Projection Operator (ép về hợp lệ / 'trả nghiệp')",
      "type": "projection/repair",
      "signature": "Π_B: Ω_B → Ω_B",
      "purpose": "Chỉnh vênh, ép trạng thái về gần miền hợp lệ theo ràng buộc C_B.",
      "directionality": {
        "metric": "h_B",
        "monotone": "h_B(Π_B(S)) ≤ h_B(S)",
        "strictWhenInvalid": "Nếu S ⊭ C_B thì kỳ vọng h_B(Π_B(S)) < h_B(S)"
      }
    },
    {
      "id": "Θ_B",
      "symbol": "Θ_B",
      "name": "Symmetry Anchor (neo đối xứng / ổn định hoá)",
      "type": "stabilization/dynamics",
      "signature": "Θ_B: Ω_B → Ω_B",
      "purpose": "Ổn định hoá quỹ đạo trong khối; lặp lại đưa trạng thái về miền hút ổn định (attractor) của khối.",
      "convergence": "Θ_B^t(S) → 𝒜_B khi t → ∞ (nếu không bị bật ra khỏi khối)."
    }
  ],
  "structures": {
    "attractorRegion": {
      "symbol": "𝒜_B ⊂ Ω_B",
      "name": "Vùng hút ổn định (hưởng lộc/yên)",
      "meaning": "Tập cấu hình bền mà quỹ đạo dưới Θ_B có xu hướng hội tụ."
    },
    "roles": {
      "R_B": "Tập vai trò của khối.",
      "Vai_B": "Ánh xạ gán vai: Vai_B: Ω_B → R_B",
      "meaning": "Vai trò là biểu diễn (representation) của đối xứng cục bộ để thực thi/lan truyền việc duy trì C_B."
    }
  },
  "axioms": [
    {
      "id": "A1",
      "name": "Tồn tại ràng buộc khối",
      "statement": "∃ C_B và ∃ S: S ⊨ C_B, ∃ S': S' ⊭ C_B",
      "meaning": "Khái niệm hợp lệ/không hợp lệ trong khối là có nghĩa."
    },
    {
      "id": "A2",
      "name": "Lọc biên (tính chọn lọc)",
      "statement": "Cổng_B(S)=1 ⇔ S đủ tương thích để đi vào vận hành khối",
      "meaning": "Cổng là tiêu chí tương thích tối thiểu để ghép nối qua biên."
    },
    {
      "id": "A3",
      "name": "Chiếu về hợp lệ (cơ chế chỉnh vênh)",
      "statement": "∀ S ∈ Ω_B, h_B(Π_B(S)) ≤ h_B(S); và nếu S ⊭ C_B thì kỳ vọng h_B(Π_B(S)) < h_B(S).",
      "meaning": "Toán tử chiếu làm giảm 'độ vênh' so với luật khối."
    },
    {
      "id": "A4",
      "name": "Ổn định hoá đối xứng (giữ trật tự địa phương)",
      "statement": "Tồn tại Θ_B sao cho Θ_B^t(S) → 𝒜_B khi t→∞, với điều kiện S không bị bật ra khỏi khối.",
      "meaning": "Động lực học nội khối có attractor ổn định."
    },
    {
      "id": "A5",
      "name": "Bất biến cục bộ được ưu tiên",
      "statement": "g ∈ G_B ⇒ 𝓘_B(S)=𝓘_B(g(S))",
      "meaning": "Các biến đổi 'đúng luật' trong khối phải bảo toàn bất biến cục bộ; 'Thánh' được hiểu như đối xứng cục bộ."
    }
  ],
  "propositions": [
    {
      "id": "P1",
      "name": "Căn như điều kiện ghép nối qua biên",
      "statement": "Nếu Cổng_B(S)=0 thì S không thể duy trì quỹ đạo ổn định trong Ω_B. Nếu Cổng_B(S)=1, tồn tại O_{∂B} đưa S_ngoài → S_trong ∈ Ω_B.",
      "formal": "Cổng_B(S)=1 ⇒ S_ngoài --O_{∂B}--> S_trong ∈ Ω_B",
      "proofSketch": "A2 cho điều kiện cần để vào khối; A4 yêu cầu tồn tại quỹ đạo ổn định chỉ khi ở trong miền vận hành khối; do đó 'căn' là điều kiện ghép nối qua biên."
    },
    {
      "id": "P2",
      "name": "Trả nghiệp là giảm độ cao Brauer",
      "statement": "Trong khối, lặp Π_B làm giảm h_B(S): S_{t+1}=Π_B(S_t) ⇒ h_B(S_{t+1}) ≤ h_B(S_t); và giảm nghiêm khi trạng thái chưa hợp lệ.",
      "formal": [
        "S_{t+1}=Π_B(S_t) ⇒ h_B(S_{t+1}) ≤ h_B(S_t)",
        "S_t ⊭ C_B ⇒ h_B(S_{t+1}) < h_B(S_t)"
      ],
      "proofSketch": "Trực tiếp từ A3; 'trả nghiệp' là cơ chế chỉnh vênh để khớp luật khối."
    },
    {
      "id": "P3",
      "name": "Hưởng lộc/yên là hội tụ về vùng hút ổn định",
      "statement": "Nếu S vào được khối và không bị bật ra, quỹ đạo dưới Θ_B hội tụ về 𝒜_B; trong 𝒜_B thì h_B(S) nhỏ hoặc tiệm cận ngưỡng thấp.",
      "formal": [
        "S ∈ Ω_B ⇒ Θ_B^t(S) → 𝒜_B",
        "S ∈ 𝒜_B ⇒ h_B(S) nhỏ (hoặc tiệm cận ngưỡng thấp)"
      ],
      "proofSketch": "Từ A4; hình thức hoá trải nghiệm 'được đỡ, yên'."
    },
    {
      "id": "P4",
      "name": "Làm lính/hầu là trạng thái nhận biểu diễn vai trò của khối",
      "statement": "Trong khối tồn tại tập vai trò R_B và ánh xạ Vai_B: Ω_B → R_B. Trạng thái mang vai là biểu diễn của đối xứng cục bộ để thực thi duy trì C_B.",
      "formal": "S ∈ Ω_B, Vai_B(S)=r ⇒ S thực thi một phần chức năng duy trì C_B",
      "proofSketch": "Nếu khối có đối xứng cục bộ (A5) và cần duy trì trật tự (A4), khối phải có cơ chế thực thi/lan truyền; 'vai' là cơ chế đó."
    }
  ],
  "derivedOperators": [
    {
      "id": "BZDO",
      "name": "Brauer-Zero Dissolution Operator",
      "type": "limit/dissolution",
      "definition": "BZDO mô tả xu hướng: khi độ cao Brauer tiến về 0 (hoặc ràng buộc cục bộ mất tác dụng), 'bản sắc đặc thù' suy biến và trạng thái hội tụ về đối xứng nền (symmetry nền) của toàn hệ.",
      "corollaries": [
        {
          "id": "C1",
          "name": "Trong khối: bản sắc được khóa bởi ràng buộc cục bộ",
          "statement": "S ∈ Ω_B ⇒ character/vai trò ổn định nhờ C_B."
        },
        {
          "id": "C2",
          "name": "Rời khối: mất khóa cục bộ, dễ hòa tan về symmetry nền",
          "statement": "S ∉ Ω_B hoặc C_B suy yếu ⇒ xu hướng BZDO mạnh lên."
        }
      ]
    }
  ],
  "relations": {
    "tuyCut_vs_localStability": {
      "note": "Ở mức khái niệm (không áp đặt).",
      "mapping": [
        {
          "concept": "Tuy’s Cut",
          "interpretation": "Toán tử tối ưu hoá toàn cục của hệ lớn (tìm nghiệm 'đẹp nhất/đúng nhất' theo tiêu chuẩn chung)."
        },
        {
          "concept": "Θ_B",
          "interpretation": "Tối ưu/ổn định cục bộ theo luật khối C_B và bất biến 𝓘_B."
        }
      ],
      "relationStatement": "Tuy’s Cut ≈ tối ưu toàn cục; Θ_B ≈ tối ưu ổn định cục bộ. Khác 'mặt phẳng tối ưu', không mâu thuẫn."
    },
    "hzso_limit": {
      "note": "Phát biểu mô hình: HZSO như giới hạn khi không còn khối nào giữ được symmetry cục bộ.",
      "statement": "∀B, C_B → ∅ ⇒ hệ tiến về symmetry nền ⇒ HZSO-like limit",
      "intuition": [
        "mọi vai tan",
        "mọi dị biệt mất",
        "chỉ còn luật nền"
      ]
    }
  },
  "summary": "Trong mô hình Brauer–Operatorology, hiện tượng 'Thánh–căn–trả nghiệp–hầu–lộc' được biểu diễn như một khối B=⟨Ω_B, C_B, ∂B⟩ với đối xứng cục bộ G_B. 'Căn' là điều kiện ghép nối qua cổng Cổng_B và toán tử biên O_{∂B}. 'Trả nghiệp' là quá trình giảm độ cao Brauer h_B thông qua toán tử chiếu Π_B để ép trạng thái về miền hợp lệ S ⊨ C_B. 'Hầu/lính' là cơ chế gán vai R_B như một biểu diễn của đối xứng cục bộ nhằm duy trì trật tự C_B. 'Lộc/yên' là hội tụ về vùng hút ổn định 𝒜_B dưới neo đối xứng Θ_B. Khi rời khối hoặc mất khóa ràng buộc, trạng thái có xu hướng hòa tan về đối xứng nền theo cơ chế Brauer-Zero (BZDO). Liên hệ khái niệm: Tuy’s Cut có thể hiểu như tối ưu toàn cục, còn Θ_B như tối ưu ổn định cục bộ; HZSO là giới hạn mô hình khi mọi C_B suy yếu và hệ tiến về symmetry nền."
};

// Convenience getters
export const getCoreOperator = (id: string) =>
  brauerOperatorologyThresholdBlock.coreOperators.find((o) => o.id === id);

export const getAxiom = (id: string) =>
  brauerOperatorologyThresholdBlock.axioms.find((a) => a.id === id);

export const getProposition = (id: string) =>
  brauerOperatorologyThresholdBlock.propositions.find((p) => p.id === id);
