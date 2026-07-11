const state = {
  operators: [],
  selected: {
    inference: "AUG",
    knowledge: "ON",
    priority: "EXPLAIN",
  },
  settings: {
    provider: "Gemini",
    model: "gemini-3.5-flash",
    apiKey: "",
    endpoint: "",
  },
  language: localStorage.getItem("oiBoxLanguage") || "EN",
  commandTouched: false,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const i18n = {
  EN: {
    settingsShort: "SET",
    brandSubtitle: "Decompose > Analyze > Recompose",
    defaultCommand: "If all prime numbers were removed from the universe, what would remain?",
    executionCommand: "Execution Command",
    command: "Command",
    inferenceLayer: "Inference Layer",
    knowledge: "Knowledge",
    outputMode: "Output Mode",
    modeExplain: "Explain",
    modeAnalyze: "Analyze",
    modeWrite: "Write",
    modeCode: "Code",
    modePlan: "Plan",
    priority: "Priority",
    priorityExplain: "Explain",
    priorityStrict: "Strict",
    priorityCreative: "Creative",
    run: "EXECUTE",
    runningButton: "RUNNING",
    idle: "Idle",
    processing: "Processing",
    missingKeyCaption: "Missing key",
    connectionErrorCaption: "Connection error",
    complete: "Complete",
    tabAnswer: "Answer",
    tabTrace: "Trace",
    tabOperators: "Operators",
    tabSetup: "Setup",
    responseDraft: "O.i Response Draft",
    readyTitle: "Operator console is ready.",
    readyText: "Note: paste your Gemini API key in Setup for AI answers. Without a key, The Prime Excalibur still runs offline by returning an operator-chain analysis.",
    searchOperators: "Search operators...",
    aiProvider: "Active AI Provider",
    model: "Model",
    activeModel: "Active Model",
    apiKey: "API Key",
    apiKeyPlaceholder: "Paste key here. Stored locally for prototype only.",
    apiConfigRequired: "API Key Configuration Required",
    apiConfigHint: "Paste your personal Gemini API key below to launch evaluation.",
    getFreeKey: "Get free key",
    applySettings: "Apply",
    autoDefaultModel: "Auto default by provider",
    customEndpoint: "",
    saveSettings: "Save Local Settings",
    operatorChain: "Operator Chain",
    runtime: "Runtime",
    provider: "Provider",
    operators: "Operators",
    loading: "Loading",
    bundled: "bundled",
    operatorCount: "operators",
    noCommandTitle: "No execution command.",
    noCommandText: "Enter a command before running The Prime Excalibur.",
    missingKeyTitle: "API key is missing.",
    missingKeyText: "Gemini needs your personal free API key. Open Setup, paste the key, then press Apply.",
    offlineAnswerTitle: "Offline operator-chain response.",
    offlineAnswerIntro: "No Gemini API key is saved, so The Prime Excalibur generated a local response from the selected operator chain.",
    offlineQuestion: "Question",
    offlineReading: "Operator reading",
    offlineNext: "To get a full AI answer, paste a Gemini API key in Setup and press Apply.",
    callingProviderTitle: "Calling {provider}...",
    callingProviderText: "The Prime Excalibur is compiling the operator chain and sending the request to the AI provider.",
    responseReadyTitle: "O.i response is ready.",
    providerErrorTitle: "Provider call failed.",
    traceInput: "Input Capture",
    traceInputDetail: "Received a command with {count} characters.",
    traceOperator: "Operator Selection",
    traceOperatorDetail: "Selected {count} operators for {mode} mode.",
    tracePrompt: "Prompt Compile",
    tracePromptDetail: "Packed command, policy, operator chain, and output contract.",
    traceProvider: "Provider Adapter",
    traceProviderDetail: "Calling {provider}/{model}.",
    traceMissingProvider: "Stopped because the API key is missing.",
    traceOutput: "Output Filter",
    traceOutputDetail: "Received the response and displayed it after the operator chain.",
    traceProviderError: "Provider Error",
    fileFetchError: "Cannot call the provider from the current app surface. If you opened file://, run .\\start.ps1 and use http://localhost:4173. If it still fails, the provider may block browser CORS; the Tauri/.exe build will call through a native backend.",
    highDemand: "The selected model is under high demand right now. The API key works, but the provider is temporarily overloaded. Try again later or switch to another Gemini model.",
    promptReturn: "Return a clear English answer. Include a short 'Operator chain used' section at the end.",
    langName: "English",
    freeAiModels: "Choose AI Assistant",
    freeAiModelsHint: "Pick a quick preset or edit the active configuration below.",
    freeGeminiHint: "Free-tier friendly via Google AI Studio",
    freeGeminiAltHint: "Alternative Flash model when demand spikes",
    requiresFreeApiKey: "Requires free API key",
    supportWork: "Support My Work",
    developedBy: "Developed by:",
    activeConfig: "Active Configuration",
    activeConfigHint: "Advanced users can override provider, model, key, and endpoint here.",
    customPresetSummary: "Custom configuration",
    companionApps: "Companion Apps",
    companionAppsHint: "Open bundled O.i tools as separate work surfaces.",
    trajectoryLabName: "Trajectory Lab",
    trajectoryLabHint: "Manuscript trajectory framework",
    elementPassportName: "Element Passport",
    elementPassportHint: "Element passport generator",
    primeUlamAtlasName: "Prime Ulam Atlas",
    primeUlamAtlasHint: "Prime Ulam nuclear integer atlas",
  },
  VN: {
    settingsShort: "CÀI",
    brandSubtitle: "Phân rã > Phân Tích > Tái Tổ Hợp",
    defaultCommand: "Nếu rút toàn bộ số nguyên tố ra khỏi vũ trụ, ta còn gì?",
    executionCommand: "Lệnh Thực Thi",
    command: "Lệnh",
    inferenceLayer: "Tầng Suy Luận",
    knowledge: "Tri Thức",
    outputMode: "Chế Độ Kết Quả",
    modeExplain: "Giải thích",
    modeAnalyze: "Phân tích",
    modeWrite: "Viết",
    modeCode: "Code",
    modePlan: "Lập kế hoạch",
    priority: "Mức Ưu Tiên",
    priorityExplain: "Giải thích",
    priorityStrict: "Chặt chẽ",
    priorityCreative: "Sáng tạo",
    run: "THỰC THI",
    runningButton: "ĐANG CHẠY",
    idle: "Trạng thái chờ",
    processing: "Đang xử lý",
    missingKeyCaption: "Thiếu key",
    connectionErrorCaption: "Lỗi kết nối",
    complete: "Hoàn tất",
    tabAnswer: "Trả lời",
    tabTrace: "Dấu vết",
    tabOperators: "Toán tử",
    tabSetup: "Cài đặt",
    responseDraft: "Bản Nháp Phản Hồi O.i",
    readyTitle: "Bảng điều khiển toán tử đã sẵn sàng.",
    readyText: "Lưu ý: hãy dán Gemini API key trong tab Cài đặt để nhận câu trả lời O,i. Nếu chưa có key, The Prime Excalibur vẫn chạy offline bằng chuỗi toán tử.",
    searchOperators: "Tìm toán tử...",
    aiProvider: "AI Phụ Trợ Đang Dùng",
    model: "Mô Hình",
    activeModel: "Mô Hình Đang Chọn",
    apiKey: "API Key",
    apiKeyPlaceholder: "Dán key vào đây. Bản thử nghiệm chỉ lưu cục bộ.",
    autoDefaultModel: "Tự chọn mặc định theo provider",
    customEndpoint: "",
    saveSettings: "Lưu Cài Đặt Cục Bộ",
    operatorChain: "Chuỗi Toán Tử",
    runtime: "Runtime",
    provider: "Provider",
    operators: "Toán tử",
    loading: "Đang tải",
    bundled: "đã đóng gói",
    operatorCount: "toán tử",
    noCommandTitle: "Chưa có lệnh thực thi.",
    noCommandText: "Hãy nhập lệnh trước khi chạy The Prime Excalibur.",
    missingKeyTitle: "Thiếu API key.",
    missingKeyText: "Gemini cần API key miễn phí của bạn. Mở Cài đặt, dán key, rồi bấm Áp dụng.",
    offlineAnswerTitle: "Phản hồi offline bằng chuỗi toán tử.",
    offlineAnswerIntro: "Chưa có Gemini API key, nên The Prime Excalibur tạo phản hồi cục bộ từ chuỗi toán tử đang chọn.",
    offlineQuestion: "Câu hỏi",
    offlineReading: "Diễn giải toán tử",
    offlineNext: "Để nhận câu trả lời AI đầy đủ, hãy dán Gemini API key trong Cài đặt rồi bấm Áp dụng.",
    callingProviderTitle: "Đang gọi {provider}...",
    callingProviderText: "The Prime Excalibur đang biên dịch chuỗi toán tử và gửi request tới AI phụ trợ.",
    responseReadyTitle: "Phản hồi O.i đã sẵn sàng.",
    providerErrorTitle: "Lỗi khi gọi provider.",
    traceInput: "Nhận Lệnh",
    traceInputDetail: "Đã nhận lệnh gồm {count} ký tự.",
    traceOperator: "Chọn Toán Tử",
    traceOperatorDetail: "Đã chọn {count} toán tử cho chế độ {mode}.",
    tracePrompt: "Biên Dịch Prompt",
    tracePromptDetail: "Đã đóng gói lệnh, policy, chuỗi toán tử và hợp đồng đầu ra.",
    traceProvider: "Adapter Provider",
    traceProviderDetail: "Đang gọi {provider}/{model}.",
    traceMissingProvider: "Dừng lại vì thiếu API key.",
    traceOutput: "Bộ Lọc Đầu Ra",
    traceOutputDetail: "Đã nhận phản hồi và hiển thị kết quả sau chuỗi toán tử.",
    traceProviderError: "Lỗi Provider",
    fileFetchError: "Không gọi được provider từ bề mặt app hiện tại. Nếu đang mở bằng file://, hãy chạy .\\start.ps1 rồi vào http://localhost:4173. Nếu vẫn lỗi, có thể provider đang chặn CORS trong browser; bản Tauri/.exe sẽ gọi qua native backend để xử lý điểm này.",
    highDemand: "Mô hình đang bị quá tải tạm thời. API key đã hoạt động, nhưng provider đang có nhu cầu cao. Hãy thử lại sau hoặc đổi sang model Gemini khác.",
    promptReturn: "Trả lời rõ ràng bằng tiếng Việt. Cuối câu trả lời thêm một mục ngắn 'Chuỗi toán tử đã dùng'.",
    langName: "tiếng Việt",
    freeAiModels: "Chọn Nhanh AI Phụ Trợ",
    freeAiModelsHint: "Chọn một preset nhanh hoặc chỉnh cấu hình đang dùng bên dưới.",
    freeGeminiHint: "Thân thiện với free-tier qua Google AI Studio",
    freeGeminiAltHint: "Model Flash thay thế khi model chính quá tải",
    requiresFreeApiKey: "Cần API key miễn phí",
    supportWork: "Ủng Hộ Dự Án",
    developedBy: "Phát triển bởi:",
    activeConfig: "Cấu Hình Đang Dùng",
    activeConfigHint: "Người dùng nâng cao có thể sửa provider, model, key và endpoint tại đây.",
    customPresetSummary: "Cấu hình thủ công",
    companionApps: "Ứng Dụng Phụ Trợ",
    companionAppsHint: "Mở các công cụ O.i đi kèm như những bề mặt làm việc riêng.",
    trajectoryLabName: "Phòng Thí Nghiệm Quỹ Đạo",
    trajectoryLabHint: "Khung quỹ đạo bản thảo",
    elementPassportName: "Hộ Chiếu Nguyên Tố",
    elementPassportHint: "Trình tạo hộ chiếu nguyên tố",
    primeUlamAtlasName: "Atlas Prime Ulam",
    primeUlamAtlasHint: "Atlas số nguyên hạt nhân Prime Ulam",
  },
  JP: {
    settingsShort: "設定",
    brandSubtitle: "分解 > 分析 > 再構成",
    defaultCommand: "宇宙からすべての素数を取り除いたら、何が残るのでしょうか？",
    executionCommand: "実行コマンド",
    command: "コマンド",
    inferenceLayer: "推論レイヤー",
    knowledge: "知識",
    outputMode: "出力モード",
    modeExplain: "説明",
    modeAnalyze: "分析",
    modeWrite: "執筆",
    modeCode: "コード",
    modePlan: "計画",
    priority: "優先度",
    priorityExplain: "説明",
    priorityStrict: "厳密",
    priorityCreative: "創造",
    run: "実行",
    runningButton: "実行中",
    idle: "待機中",
    processing: "処理中",
    missingKeyCaption: "キー不足",
    connectionErrorCaption: "接続エラー",
    complete: "完了",
    tabAnswer: "回答",
    tabTrace: "トレース",
    tabOperators: "演算子",
    tabSetup: "設定",
    responseDraft: "O.i 応答ドラフト",
    readyTitle: "演算子コンソールの準備ができました。",
    readyText: "注意: AI 回答には Setup で Gemini API key を貼り付けてください。key がない場合でも、The Prime Excalibur は演算子チェーンで offline 応答を生成します。",
    searchOperators: "演算子を検索...",
    aiProvider: "使用中 AI プロバイダー",
    model: "モデル",
    activeModel: "選択中モデル",
    apiKey: "API Key",
    apiKeyPlaceholder: "ここにキーを貼り付けます。プロトタイプではローカルにのみ保存します。",
    autoDefaultModel: "プロバイダー別の既定モデル",
    customEndpoint: "",
    saveSettings: "ローカル設定を保存",
    operatorChain: "演算子チェーン",
    runtime: "Runtime",
    provider: "Provider",
    operators: "演算子",
    loading: "読み込み中",
    bundled: "同梱",
    operatorCount: "演算子",
    noCommandTitle: "実行コマンドがありません。",
    noCommandText: "The Prime Excalibur を実行する前にコマンドを入力してください。",
    missingKeyTitle: "API key がありません。",
    missingKeyText: "Gemini には無料の個人 API key が必要です。設定で key を貼り付け、適用を押してください。",
    offlineAnswerTitle: "offline 演算子チェーン応答。",
    offlineAnswerIntro: "Gemini API key が保存されていないため、選択された演算子チェーンからローカル応答を生成しました。",
    offlineQuestion: "質問",
    offlineReading: "演算子による読み解き",
    offlineNext: "完全な AI 回答を得るには、Setup で Gemini API key を貼り付けて Apply を押してください。",
    callingProviderTitle: "{provider} を呼び出しています...",
    callingProviderText: "The Prime Excalibur は演算子チェーンをコンパイルし、AI プロバイダーへリクエストを送信しています。",
    responseReadyTitle: "O.i 応答の準備ができました。",
    providerErrorTitle: "Provider 呼び出しに失敗しました。",
    traceInput: "入力取得",
    traceInputDetail: "{count} 文字のコマンドを受信しました。",
    traceOperator: "演算子選択",
    traceOperatorDetail: "{mode} モード用に {count} 個の演算子を選択しました。",
    tracePrompt: "プロンプト生成",
    tracePromptDetail: "コマンド、ポリシー、演算子チェーン、出力契約をまとめました。",
    traceProvider: "Provider Adapter",
    traceProviderDetail: "{provider}/{model} を呼び出しています。",
    traceMissingProvider: "API key がないため停止しました。",
    traceOutput: "出力フィルター",
    traceOutputDetail: "応答を受信し、演算子チェーン適用後の結果を表示しました。",
    traceProviderError: "Provider エラー",
    fileFetchError: "現在の app 表面から provider を呼び出せません。file:// で開いている場合は .\\start.ps1 を実行し、http://localhost:4173 を使ってください。それでも失敗する場合、provider が browser CORS をブロックしている可能性があります。Tauri/.exe 版では native backend 経由で呼び出します。",
    highDemand: "選択したモデルは現在高負荷です。API key は機能していますが、provider 側が一時的に混雑しています。後でもう一度試すか、別の Gemini model に切り替えてください。",
    promptReturn: "日本語で明確に回答してください。最後に短い '使用した演算子チェーン' セクションを含めてください。",
    langName: "日本語",
    freeAiModels: "AI アシスタントを選択",
    freeAiModelsHint: "クイック preset を選ぶか、下の使用中設定を編集してください。",
    freeGeminiHint: "Google AI Studio の free-tier 向け",
    freeGeminiAltHint: "高負荷時に切り替える Flash model",
    requiresFreeApiKey: "無料 API key が必要",
    supportWork: "プロジェクト支援",
    developedBy: "開発者:",
    activeConfig: "使用中設定",
    activeConfigHint: "上級ユーザーは provider、model、key、endpoint をここで上書きできます。",
    customPresetSummary: "手動設定",
    companionApps: "連携アプリ",
    companionAppsHint: "同梱された O.i ツールを別の作業画面として開きます。",
    trajectoryLabName: "軌道ラボ",
    trajectoryLabHint: "原稿の軌道フレームワーク",
    elementPassportName: "元素パスポート",
    elementPassportHint: "元素パスポート生成ツール",
    primeUlamAtlasName: "Prime Ulam アトラス",
    primeUlamAtlasHint: "Prime Ulam 核整数アトラス",
  },
};

function t(key, values = {}) {
  const template = i18n[state.language]?.[key] || i18n.EN[key] || key;
  return Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), template);
}

function setLanguage(language) {
  state.language = language;
  localStorage.setItem("oiBoxLanguage", language);
  applyLanguage();
}

function applyLanguage() {
  const commandInput = $("#commandInput");
  const defaultCommands = Object.values(i18n).map((locale) => locale.defaultCommand);
  const shouldReplaceDefaultCommand = commandInput && (!state.commandTouched || defaultCommands.includes(commandInput.value.trim()));
  document.documentElement.lang = state.language === "VN" ? "vi" : state.language === "JP" ? "ja" : "en";
  $$("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  $$("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  $$("#languageSwitch button").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === state.language);
  });
  if ($("#answerTitle")?.dataset.i18n) {
    $("#answerTitle").textContent = t($("#answerTitle").dataset.i18n);
  }
  if ($("#answerText")?.dataset.i18n) {
    const key = $("#answerText").dataset.i18n;
    $("#answerText").innerHTML = key === "readyText"
      ? formatAnswerText(t(key), { note: t("apiConfigRequired") })
      : formatAnswerText(t(key));
  }
  if (shouldReplaceDefaultCommand) {
    commandInput.value = t("defaultCommand");
    state.commandTouched = false;
  }
  renderRuntime();
  renderOperatorLibrary();
}

function saveSettings() {
  state.settings.provider = "Gemini";
  state.settings.model = getDefaultModel("Gemini");
  state.settings.apiKey = $("#apiKeyInput").value.trim();
  state.settings.endpoint = "";
  localStorage.setItem("oiBoxSettings", JSON.stringify(state.settings));
  syncSettingsFields();
  renderRuntime();
}

function loadSettings() {
  const stored = localStorage.getItem("oiBoxSettings");
  if (stored) {
    state.settings = { ...state.settings, ...JSON.parse(stored) };
  }
  state.settings.provider = "Gemini";
  state.settings.model = getDefaultModel("Gemini");
  state.settings.endpoint = "";
  syncSettingsFields();
  renderRuntime();
}

function syncSettingsFields() {
  state.settings.provider = "Gemini";
  state.settings.model = getDefaultModel("Gemini");
  state.settings.endpoint = "";
  $("#providerSelect").value = "Gemini";
  $("#modelInput").value = state.settings.model;
  $("#apiKeyInput").value = state.settings.apiKey;
  $("#endpointInput").value = state.settings.endpoint;
  $("#apiKeyField")?.classList.remove("is-hidden");
  updateFreeModelSelection();
}

function getDefaultModel(provider) {
  return "gemini-3.5-flash";
}

function getOperatorName(operator, file) {
  return cleanText(operator.name || operator.operator_name || operator.title || operator.short_name || file.split("/").pop().replace(".json", ""));
}

function getOperatorCategory(operator) {
  return cleanText(operator.category || operator.domain || operator.layer || operator.type || "operator");
}

function getOperatorDescription(operator) {
  return cleanText(operator.description || operator.summary || operator.purpose || "Local O.i operator specification loaded from the bundled pack.");
}

function cleanText(value) {
  const text = String(value ?? "");
  if (!/[ÃÂÄÅáºá»]/.test(text)) {
    return text;
  }
  try {
    const bytes = Uint8Array.from(Array.from(text, (char) => char.charCodeAt(0) & 255));
    const repaired = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return repaired.includes("�") ? text : repaired;
  } catch (error) {
    return text;
  }
}

async function loadOperators() {
  let loaded = [];
  try {
    const manifestResponse = await fetch("./operator-manifest.json");
    const files = await manifestResponse.json();
    loaded = await Promise.all(files.map(async (file) => {
      const response = await fetch(`./${file}`);
      const json = await response.json();
      return {
        file,
        raw: json,
        id: json.id || json.operator_id || file,
        name: getOperatorName(json, file),
        category: getOperatorCategory(json),
        description: getOperatorDescription(json),
        status: cleanText(json.status || json.version || "bundled"),
        symbol: cleanText(json.symbol || json.short_name || "O.i"),
      };
    }));
  } catch (error) {
    loaded = (window.OI_OPERATOR_DATA || []).map((operator) => ({
      ...operator,
      name: cleanText(operator.name),
      category: cleanText(operator.category),
      description: cleanText(operator.description),
      status: cleanText(operator.status),
      symbol: cleanText(operator.symbol),
      raw: operator,
    }));
  }
  state.operators = loaded;
  renderOperatorLibrary();
  renderChain();
  renderRuntime();
}

function chooseChain() {
  const mode = $("#outputMode").value;
  const byName = (fragment) => state.operators.find((operator) => operator.name.toLowerCase().includes(fragment));
  const base = [
    byName("existence") || state.operators[0],
    byName("valid") || state.operators[1],
    byName("prime") || state.operators[2],
  ].filter(Boolean);

  const maps = {
    Explain: ["governance", "eco", "phase"],
    Analyze: ["entropy", "fixed", "horizon"],
    Write: ["pin", "stack", "deo"],
    Code: ["runtime", "phase", "valid"],
    Plan: ["governance", "horizon", "stack"],
  };

  const extra = (maps[mode] || maps.Explain)
    .map((fragment) => byName(fragment))
    .filter(Boolean);

  const merged = [...base, ...extra];
  const unique = new Map(merged.map((operator) => [operator.id, operator]));
  return Array.from(unique.values()).slice(0, state.selected.inference === "DEEP" ? 7 : 5);
}

function renderChain() {
  const chain = chooseChain();
  if (!$("#chainList")) return;
  $("#chainList").innerHTML = chain.map((operator, index) => `
    <article class="chain-item">
      <b>${index + 1}</b>
      <div>
        <strong title="${escapeHtml(operator.name)}">${escapeHtml(operator.name)}</strong>
        <span title="${escapeHtml(operator.category)}">${escapeHtml(operator.category)}</span>
      </div>
    </article>
  `).join("");
  if ($("#runtimeOperators")) {
    $("#runtimeOperators").textContent = `${state.operators.length} ${t("bundled")}`;
  }
}

function renderRuntime() {
  const providerLabel = getProviderLabel(state.settings.provider);
  if ($("#runtimeProvider")) $("#runtimeProvider").textContent = providerLabel;
  if ($("#runtimeModel")) $("#runtimeModel").textContent = state.settings.model;
  if ($("#runtimeActiveModel")) $("#runtimeActiveModel").textContent = state.settings.model;
  if ($("#providerStatus")) $("#providerStatus").textContent = `${providerLabel} / ${state.selected.inference}`;
  if ($("#activeModelStatus")) $("#activeModelStatus").textContent = state.settings.model;
  updateFreeModelSelection();
}

function getProviderLabel(provider) {
  return "Gemini";
}

function updateFreeModelSelection() {
  let activePreset = null;
  $$(".free-model-card").forEach((card) => {
    const isActive = card.dataset.provider === state.settings.provider && card.dataset.model === state.settings.model;
    card.classList.toggle("active", isActive);
    if (isActive) {
      activePreset = card.querySelector("strong")?.textContent || null;
    }
  });
  if ($("#selectedModelSummary")) {
    const providerLabel = getProviderLabel(state.settings.provider);
    const summaryPrefix = activePreset || t("customPresetSummary");
    $("#selectedModelSummary").textContent = `${summaryPrefix}: ${providerLabel} / ${state.settings.model}`;
  }
}

function renderOperatorLibrary() {
  const query = $("#operatorSearch").value.toLowerCase();
  const filtered = state.operators.filter((operator) => {
    const haystack = `${operator.name} ${operator.category} ${operator.description}`.toLowerCase();
    return haystack.includes(query);
  });
  $("#operatorCount").textContent = `${filtered.length} ${t("operatorCount")}`;
  $("#operatorGrid").innerHTML = filtered.map((operator) => `
    <article class="operator-card">
      <div class="card-kicker">${escapeHtml(operator.symbol)}</div>
      <h4>${escapeHtml(operator.name)}</h4>
      <p>${escapeHtml(trimText(operator.description, 170))}</p>
      <div class="tag-row">
        <span class="tag">${escapeHtml(operator.category)}</span>
        <span class="tag">${escapeHtml(operator.status)}</span>
      </div>
    </article>
  `).join("");
}

function compileOperatorPrompt(command, chain, mode) {
  const operatorContract = chain.map((operator, index) => {
    const description = trimText(operator.description, 240);
    return `${index + 1}. ${operator.name} [${operator.category}]: ${description}`;
  }).join("\n");

  return [
    "You are The Prime Excalibur, an Operator Intelligence runtime.",
    "You must answer the user only after applying the bundled operator chain.",
    `Output mode: ${mode}.`,
    `Inference layer: ${state.selected.inference}.`,
    `Knowledge mode: ${state.selected.knowledge}.`,
    `Priority: ${state.selected.priority}.`,
    "",
    "Operator chain:",
    operatorContract,
    "",
    "User command:",
    command,
    "",
    t("promptReturn"),
  ].join("\n");
}

function setTrace(items) {
  $("#traceList").innerHTML = items.map(([title, detail]) => `
    <li>
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(detail)}</span>
    </li>
  `).join("");
}

function setAnswer(title, text, options = {}) {
  $("#answerTitle").removeAttribute("data-i18n");
  $("#answerText").removeAttribute("data-i18n");
  $("#answerTitle").textContent = title;
  $("#answerText").innerHTML = formatAnswerText(text, options);
}

function formatAnswerText(text, options = {}) {
  const normalized = String(text || "").replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  const blocks = [];
  let list = null;

  const closeList = () => {
    if (!list) return;
    blocks.push(`<${list.type}>${list.items.map((item) => `<li>${inlineFormat(item)}</li>`).join("")}</${list.type}>`);
    list = null;
  };

  normalized.split("\n").forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      return;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/) || line.match(/^(.{2,72}):$/);
    if (heading) {
      closeList();
      blocks.push(`<h4>${inlineFormat(heading[2] || heading[1])}</h4>`);
      return;
    }

    const bullet = line.match(/^[-*•]\s+(.+)$/);
    if (bullet) {
      if (!list || list.type !== "ul") {
        closeList();
        list = { type: "ul", items: [] };
      }
      list.items.push(bullet[1]);
      return;
    }

    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (numbered) {
      if (!list || list.type !== "ol") {
        closeList();
        list = { type: "ol", items: [] };
      }
      list.items.push(numbered[1]);
      return;
    }

    closeList();
    blocks.push(`<p>${inlineFormat(line)}</p>`);
  });

  closeList();
  const note = options.note ? `<div class="answer-note">${inlineFormat(options.note)}</div>` : "";
  return note + blocks.join("");
}

function inlineFormat(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function buildOfflineAnswer(command, chain, mode) {
  const operatorLines = chain.map((operator, index) => {
    const category = operator.category ? ` (${operator.category})` : "";
    return `${index + 1}. **${operator.name}**${category}: ${trimText(operator.description, 120)}`;
  });

  return [
    `${t("offlineQuestion")}:`,
    command,
    "",
    `${t("offlineReading")}:`,
    `- Mode: **${mode}**`,
    `- Inference layer: **${state.selected.inference}**`,
    `- Knowledge: **${state.selected.knowledge}**`,
    `- Priority: **${state.selected.priority}**`,
    "",
    "Operator chain used:",
    ...operatorLines,
    "",
    t("offlineNext"),
  ].join("\n");
}

async function callGemini(prompt) {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": state.settings.apiKey,
    },
    body: JSON.stringify({
      model: state.settings.model || getDefaultModel("Gemini"),
      input: prompt,
      system_instruction: "You are The Prime Excalibur. Apply the provided operator chain before answering.",
      generation_config: {
        temperature: state.selected.priority === "CREATIVE" ? 0.95 : 0.35,
        thinking_level: state.selected.inference === "DEEP" ? "high" : "low",
      },
    }),
  });

  const data = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(getProviderError(data, response.status));
  }
  return data.output_text || extractGeminiText(data) || JSON.stringify(data, null, 2);
}

async function callProvider(prompt) {
  state.settings.provider = "Gemini";
  state.settings.model = getDefaultModel("Gemini");
  return callGemini(prompt);
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    return { raw: text };
  }
}

function extractGeminiText(data) {
  if (!Array.isArray(data.steps)) return "";
  return data.steps
    .flatMap((step) => step.content || step.output || [])
    .map((item) => item.text || item.content || "")
    .filter(Boolean)
    .join("\n");
}

function getProviderError(data, status) {
  return data.error?.message || data.message || data.raw || `Provider request failed with HTTP ${status}.`;
}

function getFriendlyError(error) {
  const message = error?.message || String(error);
  if (message.toLowerCase().includes("high demand") || message.toLowerCase().includes("spikes in demand")) {
    return `${t("highDemand")} ${message}`;
  }
  if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
    return `${t("fileFetchError")} ${message}`;
  }
  return message;
}

async function runExecution() {
  saveSettings();
  const command = $("#commandInput").value.trim();
  const chain = chooseChain();
  const mode = $("#outputMode").value;
  const hasKey = state.settings.apiKey.length > 0;

  if (!command) {
    setAnswer(t("noCommandTitle"), t("noCommandText"));
    return;
  }

  $("#stageCaption").textContent = t("processing");
  $("#runButton").disabled = true;
  $("#runButton").textContent = t("runningButton");
  setAnswer(
    hasKey ? t("callingProviderTitle", { provider: state.settings.provider }) : t("offlineAnswerTitle"),
    hasKey ? t("callingProviderText") : buildOfflineAnswer(command, chain, mode),
    hasKey ? {} : { note: t("offlineAnswerIntro") },
  );

  const baseTrace = [
    [t("traceInput"), t("traceInputDetail", { count: command.length })],
    [t("traceOperator"), t("traceOperatorDetail", { count: chain.length, mode })],
    [t("tracePrompt"), t("tracePromptDetail")],
    [t("traceProvider"), hasKey ? t("traceProviderDetail", { provider: state.settings.provider, model: state.settings.model }) : t("traceMissingProvider")],
  ];

  setTrace(baseTrace);

  activateTab("answer");
  renderChain();

  if (!hasKey) {
    $("#stageCaption").textContent = t("complete");
    $("#runButton").disabled = false;
    $("#runButton").textContent = t("run");
    setTrace([...baseTrace, [t("traceOutput"), t("traceOutputDetail")]]);
    return;
  }

  try {
    const prompt = compileOperatorPrompt(command, chain, mode);
    const output = await callProvider(prompt);
    setAnswer(t("responseReadyTitle"), output);
    $("#stageCaption").textContent = t("complete");
    setTrace([...baseTrace, [t("traceOutput"), t("traceOutputDetail")]]);
  } catch (error) {
    setAnswer(t("providerErrorTitle"), getFriendlyError(error));
    $("#stageCaption").textContent = t("connectionErrorCaption");
    setTrace([...baseTrace, [t("traceProviderError"), getFriendlyError(error)]]);
  } finally {
    $("#runButton").disabled = false;
    $("#runButton").textContent = t("run");
  }
}

function activateTab(tab) {
  $$(".tabs button").forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  $$(".tab-panel").forEach((panel) => panel.classList.remove("active"));
  $(`#${tab}Panel`).classList.add("active");
}

function trimText(text, length) {
  return text.length > length ? `${text.slice(0, length - 3)}...` : text;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function bindControls() {
  $$("[data-bind]").forEach((group) => {
    group.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      group.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.selected[group.dataset.bind] = button.dataset.value;
      renderRuntime();
      renderChain();
    });
  });

  $$(".tabs button").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
  });

  $("#runButton").addEventListener("click", runExecution);
  $("#commandInput").addEventListener("input", () => {
    state.commandTouched = true;
  });
  $("#saveSettingsButton").addEventListener("click", saveSettings);
  $("#operatorSearch").addEventListener("input", renderOperatorLibrary);
  $("#outputMode").addEventListener("change", renderChain);
  $("#settingsButton").addEventListener("click", () => activateTab("setup"));
  $$("#languageSwitch button").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });
  $$(".free-model-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.settings.provider = card.dataset.provider;
      state.settings.model = card.dataset.model;
      syncSettingsFields();
      saveSettings();
      renderRuntime();
    });
  });
  $("#providerSelect").addEventListener("change", () => {
    const provider = $("#providerSelect").value;
    state.settings.provider = provider;
    state.settings.model = getDefaultModel(provider);
    syncSettingsFields();
    renderRuntime();
  });
}

bindControls();
applyLanguage();
loadSettings();
loadOperators().catch((error) => {
  $("#answerTitle").removeAttribute("data-i18n");
  $("#answerText").removeAttribute("data-i18n");
  $("#answerTitle").textContent = state.language === "VN"
    ? "Không tải được operator pack."
    : state.language === "JP"
      ? "operator pack を読み込めません。"
      : "Cannot load operator pack.";
  $("#answerText").textContent = state.language === "VN"
    ? `${error.message}. Hãy chạy app bằng local server thay vì mở file trực tiếp.`
    : state.language === "JP"
      ? `${error.message}. file を直接開くのではなく、local server で app を実行してください。`
      : `${error.message}. Run the app through a local server instead of opening the file directly.`;
});
