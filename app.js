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
  language: localStorage.getItem("oiBoxLanguage") || "VN",
  commandTouched: false,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const GLOBAL_COUNTER_BASE = "https://api.counterapi.dev/v1/o-i-vn-prime-excalibur";

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
    readyText: "Note: paste your Gemini API key in Setup for O.i answers. Without a key, The Prime Excalibur still runs in Openbeta mode by returning an operator-chain analysis.",
    searchOperators: "Search operators...",
    aiProvider: "Active AI Provider",
    model: "Model",
    activeModel: "Active Model",
    apiKey: "API Key",
    apiKeyPlaceholder: "Paste key here",
    apiConfigRequired: "API Key Configuration Required",
    apiConfigHint: "Paste your personal Gemini API key below to launch evaluation.",
    getFreeKey: "Get free key",
    applySettings: "Apply",
    keySavedTitle: "Gemini API key is ready.",
    keySavedText: "The key has been saved. You can now ask for an O.i answer.",
    keySavedStatus: "Key saved. Returning to Answer.",
    keyMissingStatus: "Paste a Gemini API key first.",
    autoDefaultModel: "Auto default by provider",
    customEndpoint: "",
    saveSettings: "Save Openbeta Settings",
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
    offlineAnswerTitle: "Openbeta operator-chain response.",
    offlineAnswerIntro: "No Gemini API key is active, so The Prime Excalibur generated an Openbeta response from the selected operator chain.",
    offlineQuestion: "Question",
    offlineReading: "Operator reading",
    offlineModeLabel: "Mode",
    offlineInferenceLabel: "Inference layer",
    offlineKnowledgeLabel: "Knowledge",
    offlinePriorityLabel: "Priority",
    offlineChainUsed: "Operator chain used",
    offlineNext: "To get a full O.i answer, paste a Gemini API key in Setup and press Apply.",
    callingProviderTitle: "Calling {provider}...",
    callingProviderText: "The Prime Excalibur is compiling the operator chain and sending the request to the O.i provider.",
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
    fileFetchError: "Cannot call the provider from the current app surface. Use the Openbeta web build or GitHub Pages version, then try again.",
    highDemand: "The selected model is under high demand right now. The API key works, but the provider is temporarily overloaded. Try again later or switch to another Gemini model.",
    promptReturn: "Return a clear English answer. Include a short 'Operator chain used' section at the end.",
    langName: "English",
    freeAiModels: "Choose AI Assistant",
    freeAiModelsHint: "Pick a quick preset or edit the active configuration below.",
    freeGeminiHint: "Free-tier friendly via Google AI Studio",
    freeGeminiAltHint: "Alternative Flash model when demand spikes",
    requiresFreeApiKey: "Requires free API key",
    supportWork: "Support My Work",
    activityTotal: "Total Activity",
    visits: "Visits",
    totalVisits: "Total visits",
    onlineNow: "Online now",
    executions: "Executions",
    globalCounter: "Global counter",
    counterFallback: "Local fallback",
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
    readyText: "Lưu ý: hãy dán Gemini API key trong tab Cài đặt để nhận câu trả lời O.i. Nếu chưa có key, The Prime Excalibur vẫn chạy Openbeta bằng chuỗi toán tử.",
    searchOperators: "Tìm toán tử...",
    aiProvider: "AI Phụ Trợ Đang Dùng",
    model: "Mô Hình",
    activeModel: "Mô Hình Đang Chọn",
    apiKey: "API Key",
    apiKeyPlaceholder: "Dán Key vào đây",
    apiConfigRequired: "Cần Cấu Hình API Key",
    apiConfigHint: "Dán Gemini API key của bạn để bắt đầu đánh giá.",
    getFreeKey: "Lấy key miễn phí",
    applySettings: "Áp dụng",
    keySavedTitle: "Gemini API key đã sẵn sàng.",
    keySavedText: "Key đã được lưu. Bạn có thể nhận câu trả lời O.i ngay bây giờ.",
    keySavedStatus: "Đã lưu key. Đang chuyển về Trả lời.",
    keyMissingStatus: "Hãy dán Gemini API key trước.",
    autoDefaultModel: "Tự chọn mặc định theo provider",
    customEndpoint: "",
    saveSettings: "Lưu Cài Đặt Openbeta",
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
    offlineAnswerTitle: "Phản hồi Openbeta bằng chuỗi toán tử.",
    offlineAnswerIntro: "Chưa có Gemini API key, nên The Prime Excalibur tạo phản hồi Openbeta từ chuỗi toán tử đang chọn.",
    offlineQuestion: "Câu hỏi",
    offlineReading: "Diễn giải toán tử",
    offlineModeLabel: "Chế độ",
    offlineInferenceLabel: "Tầng suy luận",
    offlineKnowledgeLabel: "Tri thức",
    offlinePriorityLabel: "Mức ưu tiên",
    offlineChainUsed: "Chuỗi toán tử đã dùng",
    offlineNext: "Để nhận câu trả lời O.i đầy đủ, hãy dán Gemini API key trong Cài đặt rồi bấm Áp dụng.",
    callingProviderTitle: "Đang gọi {provider}...",
    callingProviderText: "The Prime Excalibur đang biên dịch chuỗi toán tử và gửi request tới O.i provider.",
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
    fileFetchError: "Không gọi được provider từ bề mặt app hiện tại. Hãy dùng bản Openbeta web hoặc bản GitHub Pages rồi thử lại.",
    highDemand: "Mô hình đang bị quá tải tạm thời. API key đã hoạt động, nhưng provider đang có nhu cầu cao. Hãy thử lại sau hoặc đổi sang model Gemini khác.",
    promptReturn: "Trả lời rõ ràng bằng tiếng Việt. Cuối câu trả lời thêm một mục ngắn 'Chuỗi toán tử đã dùng'.",
    langName: "tiếng Việt",
    freeAiModels: "Chọn Nhanh AI Phụ Trợ",
    freeAiModelsHint: "Chọn một preset nhanh hoặc chỉnh cấu hình đang dùng bên dưới.",
    freeGeminiHint: "Thân thiện với free-tier qua Google AI Studio",
    freeGeminiAltHint: "Model Flash thay thế khi model chính quá tải",
    requiresFreeApiKey: "Cần API key miễn phí",
    supportWork: "Ủng Hộ Dự Án",
    activityTotal: "Tổng Hoạt Động",
    visits: "Truy cập",
    totalVisits: "Tổng truy cập",
    onlineNow: "Đang trực tuyến",
    executions: "Thực thi",
    globalCounter: "Bộ đếm toàn cầu",
    counterFallback: "Dự phòng cục bộ",
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
    readyText: "注意: O.i 応答には Setup で Gemini API key を貼り付けてください。key がない場合でも、The Prime Excalibur は Openbeta モードで演算子チェーン応答を生成します。",
    searchOperators: "演算子を検索...",
    aiProvider: "使用中 AI プロバイダー",
    model: "モデル",
    activeModel: "選択中モデル",
    apiKey: "API Key",
    apiKeyPlaceholder: "キーを貼り付け",
    apiConfigRequired: "API Key 設定が必要です",
    apiConfigHint: "Gemini API key を貼り付けて評価を開始します。",
    getFreeKey: "無料 key を取得",
    applySettings: "適用",
    keySavedTitle: "Gemini API key の準備ができました。",
    keySavedText: "key を保存しました。これで O.i 応答を取得できます。",
    keySavedStatus: "key を保存しました。回答タブへ戻ります。",
    keyMissingStatus: "先に Gemini API key を貼り付けてください。",
    autoDefaultModel: "プロバイダー別の既定モデル",
    customEndpoint: "",
    saveSettings: "Openbeta 設定を保存",
    operatorChain: "演算子チェーン",
    runtime: "Runtime",
    provider: "Provider",
    operators: "演算子",
    loading: "読み込み中",
    bundled: "同梱",
    operatorCount: "演算子",
    noCommandTitle: "実行コマンドがありません。",
    noCommandText: "The Prime Excalib￿޷z{-Ωܪם�ˈ
ˈX]
HOȜݘ\ڊٛٙ\Ә]^
X]ݙJJJBȈܙ\Xيח

לה׊ϊW
Kً
ˈX]
HOȜݘ\ڊٛٙ\Ә]^
X]؛يJJBȈܙ\Xي׉
׉׊ϊW	ً
ˈX]
HOȜݘ\ڊٛٙ\Ә]^
X]؛يJJNȈݝ]H\ؘ\R[
ݝ]
BȈܙ\Xي׊׊ʋʏʗ
׊˙ˈϜݜُۛɌOܝُۛȊNȈڙ[܋ܑٛXXڊ
ݛڙ[ˈ[JHOȞݝ]Hݝ]ܙ\Xِ[
ڙ[ˈ[
NJNٝ\ۈݝ]Bݛ؝[ۈٛٙ\Ә]^
۝\ؙK\ܛ^HH؛يHۛܝ[H]^ҝ[
۝\ؙJNٝ\ۈ\ܛ^BȈȘܘ[Șۘ\܏Hۘ]Xؚۛȏɞڝ[Oܜ[ϘȈȘܘ[Șۘ\܏Hۘ]Z[ۚ[وωڝ[Oܜ[ϘBݛ؝[ۈ]^ҝ[
۝\ؙJH]X]Hݜڛي۝\ؙHȊKݜڛJ
Nۛܝڙ[܈H׎ۛܝݘ\ڈH
[
HOȞۛܝڙ[ȏHҗӐUɞݛڙ[܋ۙ[ٝPڙ[܋ܝ\ڊݛڙ[ˈ[JNٝ\ۈڙ[΂ȈNX]HX]Ȉܙ\XيחY݋ًȊBȈܙ\XيחڙڝًȊBȈܙ\XيחًȈʂȈܙ\Xيח˙ˈȈʂȈܙ\XيחKًȊBȈܙ\Xيחٛ݋ًЭȊBȈܙ\Xيח[Y\˙ˈХȊBȈܙ\Xيח]˙ˈЭȊBȈܙ\XيחKًЬHʂȈܙ\Xيח\ًآ$ȊBȈܙ\Xيח\O˙ˈآiʂȈܙ\XيחٜO˙ˈآiHʂȈܙ\XيחٜKًآhʂȈܙ\Xيח\۞ًآbʂȈܙ\XيחڛKًآ/ʂȈܙ\Xيח[ٝKًآ'ȊBȈܙ\Xيחڙڝ\ܛݟ˙ˈءĈʂȈܙ\XيחYݘ\ܛ݋ًءĈʂȈܙ\Xيחڙڝ\ܛ݋ًء䈊BȈܙ\XيחYݘ\ܛ݋ًء䈊BȈܙ\XيחYݜڙڝ\ܛ݋ًءňʂȈܙ\XيחݛKًآ$HʂȈܙ\Xيחۙًآ#ȊBȈܙ\Xيח[݋ًآ*ȊBȈܙ\XيחܜݗʖמߗJʗKًآ&ʉJHʂȈܙ\XيחܘXמʖמߗJʗWʖמߗJʗKً
ˈݛY\؝܋[ۛZ[؝܊HOȞٝ\ۈݘ\ڊܘ[Șۘ\܏Hۘ]YܘXȏϜܘ[ωۘ]^ҝ[
ݛY\؝܊_Oܜ[Ϗܘ[ωۘ]^ҝ[
[ۛZ[؝܊_Oܜ[Ϗܜ[Ϙ
NJNȈۛܝޛXۛȏH[NȈӬHˈٝNȈӬȋ؛[XNȈӬȋ[NȈӭˈ\ڛێȈӭHˈ؜ٜڛێȈӭH˂ȈٝNȈӭȋ]NȈӭȋ]NȈӮˈ؜ݚ]NȈӤHˈ[ݘNȈӮHˈ؜NȈӮȋȈ[X٘NȈӮȋ]NȈӯˈݎȈӯHˈNȈӯȋNȈӠˈ؜ܚNȈӥȋȈڛΈӠHˈڙۘNȈӠȋ]NȈӡˈ\ڛێȈӡHˈNȈӡȋ؜ܚNȈӡȋȈښNȈӡȋڎȈӢˈۙY؎ȈӢHˈ؛[XNȈӤȋ[NȈӥˈ]NȈӦ˂Ȉ[X٘NȈӦȋNȈӧȋNȈӨˈڙۘNȈӨȋ\ڛێȈөHˈNȈөȋȈڎȈӪˈۙY؎ȈӪHˈX]؎ȈȋX]ێȈȋX]َȈȋȈNX]HX]ܙ\Xيח
ЋV؋^׊ʋً
X]ڋ؛YJHOȜޛXۛ֛؛YWHψX]ڋܛXيJJNX]HX]ܙ\XيמʖמߗJʗKًɌHʎX]H\ؘ\R[
X]
NX]HX]Ȉܙ\XيʖЋV؋^̋Nsċsʳ̋sⳠ3ϳϳγγ᳢3⳪WJʗʖЋV؋^̋Nsċsʳ̋sⳠ3ϳϳγγ᳢3⳪WJʋًɌOݘωϋܝXψʂȈܙ\XيʖЋV؋^̋Nsċsʳ̋sⳠ3ϳϳγγ᳢3⳪WJʗʖЋV؋^̋NJ׋sċsʳ̋sⳠ3ϳϳγγ᳢3⳪WJʋًɌOݜɌϋܝ\ȊNڙ[܋ܑٛXXڊ
ݛڙ[ˈ[JHOȞX]HX]ܙ\Xِ[
ڙ[ˈ[
NJNٝ\ۈX]Bݛ؝[ۈ؛ܛ]Y[ٙJ[ٙJHۛܝٞHH^Z[ΈۛٙQ^Z[ȋȈ[؛^َȈۛٙP[؛^و˂Ȉܚ]NȈۛٙUܚ]H˂ȈۙNȈۛٙPۙH˂Ȉ[ΈۛٙT[ȋȈVۛٙWNٝ\ۈٞHȝ
ٞJHț[ٙNBݛ؝[ۈ؛ܛ]Yڛܚ]Jڛܚ]JHۛܝٞHHVRSΈܜڛܚ]Q^Z[ȋȈՔҐՎȈܜڛܚ]Tݜژ݈˂ȈԑPUUюȈܜڛܚ]PܙX]]و˂ȈVܜڛܚ]WNٝ\ۈٞHȝ
ٞJHȜڛܚ]NBݛ؝[ۈݚ[ٙۚ[ِ[ܝٜʘۛ[X[ًژZ[ˈ[ٙJHۛܝܙ\؝ܓ[ٜȏHژZ[˛X\

ܙ\؝܋[ٙ^
HOȞۛܝ؝YۜވHܙ\؝܋ؘ]YۜވȘ
	ۜ\؝܋ؘ]YۜޟJXȈȎٝ\ۈ	ڛٙ^
Ȍ_KȊʉۜ\؝܋ۘ[Y_Jʉؘ]YۜޟNȉݜڛU^
ܙ\؝܋ٙ\؜ڜ[ۋL̊_XJNȈٝ\ۈ	݊ۙٛ[ٔ]Y\ݚ[ۈʟN؋Ȉۛ[X[ًȈȋȈ	݊ۙٛ[ٔ٘Y[وʟN؋ȈH	݊ۙٛ[ٓ[ٙSXٛʟNȊʉݜ؛ܛ]Y[ٙJ[ٙJ_JʘȈH	݊ۙٛ[ْ[ٙ\ؙٛSXٛʟNȊʉܝ]Kܙ[XݙYڛٙ\ؙٛ_JʘȈH	݊ۙٛ[ْۛݛYٓXٛʟNȊʉܝ]Kܙ[XݙYڛ۝ۙYٟJʘȈH	݊ۙٛ[ٔڛܚ]SXٛʟNȊʉݜ؛ܛ]Yڛܚ]Jݘ]Kܙ[XݙYܜڛܚ]J_JʘȈȋȈ	݊ۙٛ[ِژZ[՜ٙʟN؋Ȉˋۜ\؝ܓ[ٜ˂ȈȋȈ
ۙٛ[ٓٞʋȈKڛڛʈכȊNB\ޛ؈ݛ؝[ۈ؛ٛZ[ڊۛ\
HۛܝٜܛۜوH]ؚ]ٝڊڝ΋˙ٜٛ؝]ٛ[ٝXYًٛۙۙX\\˘ۛK݌XٝKڛݙ\ؘݚ[ۜȋY]َȈԓԕ˂ȈXY\܎ȞЛ۝[݋U\HΈ؜X؝[ۋڜۛȋȈދYًۛX\KZٞHΈݘ]Kܙ][ٜ˘\RٞKȈKȈۙNȒԓӋܝڛٚYފ[ٙ[Ȝݘ]Kܙ][ٜ˛[ٙ[ٝY؝[[ٙ[
љ[Z[ڈʋȈ[ܝ]Ȝۛ\Ȉޜݙ[Wڛܝݘݚ[ێȈ֛݈\وHڛYH^؛Xݜˈ\HH۝ڙYܙ\؝܈ژZ[Șٙۜو[ܝٜڛًȋȈٜٛ؝[ۗ؛ۙڙΈ[\\؝\َȜݘ]Kܙ[XݙYܜڛܚ]HOOHДѐUUшȏȌ΍HȌ̍KȈ[ښ[ٗۙ]ٛȜݘ]Kܙ[XݙYڛٙ\ؙٛHOOHёQTȏȈښYڈȎȈ݈ۛ˂ȈKȈJKȈJNȈۛܝ]HH]ؚ]٘Yܛ۔ٜܛۜيٜܛۜيNYȊ\ٜܛًۜۚʈ۝țٝȑ\ܛ܊ٝ۝ڙ\ќܛ܊]Kٜܛًۜܝ]\ʊNBȈٝ\ۈ]K۝]]ݙ^^ؘݑٛZ[ڕ^
]JHԓӋܝڛٚYފ]KݛʎB\ޛ؈ݛ؝[ۈ؛۝ڙ\ʜۛ\
Hݘ]Kܙ][ٜ˜۝ڙ\ȏHљ[Z[ڈ΂Ȉݘ]Kܙ][ٜ˛[ٙ[HٝY؝[[ٙ[
љ[Z[ڈʎٝ\ۈ؛ٛZ[ڊۛ\
NB\ޛ؈ݛ؝[ۈ٘Yܛ۔ٜܛۜيٜܛۜيHۛܝ^H]ؚ]ٜܛًۜݙ^

NYȊ]^
Hٝ\ۈߎވٝ\ۈԓӋܘ\ܙJ^
NH؝ڈ
\ܛ܊Hٝ\ۈȜ؝Έ^NB߂ݛ؝[ۈ^ؘݑٛZ[ڕ^
]JHYȊP\ܘ^KڜМܘ^J]Kܝ\ʊHٝ\ۈȎٝ\ۈ]Kܝ\ٛ]X\

ݙ\
HOȜݙ\؛۝[݈ݙ\۝]]׊BȈۘ\

][JHOȚ][Kݙ^][K؛۝[݈ȊBȈٚ[\ʐۛۙX[ʂȈڛڛʈכȊNBݛ؝[ۈٝ۝ڙ\ќܛ܊]Kݘ]\ʈٝ\ۈ]Kٜܛ܏˛Y\ܘYو]Kۙ\ܘYو]Kܘ]ȟ۝ڙ\Ȝٜ]Y\݈ؚ[Yڝ	ܝ]\ߋ؎Bݛ؝[ۈٝܚY[ٛQ\ܛ܊\ܛ܊HۛܝY\ܘYوH\ܛ܏˛Y\ܘYوݜڛي\ܛ܊NYȊY\ܘYًݛӛݙ\И\ي
Kڛ؛Y\ʈښYڈ[X[وʈY\ܘYًݛӛݙ\И\ي
Kڛ؛Y\ʈܜZٜȚ[ș[X[وʊHٝ\ۈ	݊ښYڑ[X[وʟH	ۙ\ܘYٟXBȈYȊY\ܘYًڛ؛Y\ʈјZ[YșٝڈʈY\ܘYًڛ؛Y\ʈә]ۜڑ\ܛ܈ʊHٝ\ۈ	݊ٚ[Qٝڑ\ܛ܈ʟH	ۙ\ܘYٟXBȈٝ\ۈY\ܘYَB\ޛ؈ݛ؝[ۈݛўXݝ[ۊ
H؝ٔٝ[ٜʊNۛܝۛ[X[وH	
Șۛ[X[ْ[ܝ]ʋݘ[YKݜڛJ
NۛܝژZ[ȏHڛِۜژZ[ʊNۛܝ[ٙHH	
țݝ][ٙHʋݘ[YNۛܝ\ҙ^HHݘ]Kܙ][ٜ˘\RٞKۙ[ٝȌȈYȊXۛ[X[يHٝ[ܝٜʝ
ۛЛۛX[ٕ]Hʋ
ۛЛۛX[ٕ^ʊNٝ\ێB[؜ٛY[ݑ^Xݝ[ې۝[݊
NȈ	
ȜݘYِ؜[ۈʋݙ^ۛݙ[݈H
ܜٜۘܚ[وʎ	
ȜݛН]ۈʋٚ\ؘۙYHݙN	
ȜݛН]ۈʋݙ^ۛݙ[݈H
ܝ[ۚ[ِݝۈʎٝ[ܝٜʂȈ\ҙ^Hȝ
ؘ[[ٔ۝ڙ\՚]HˈȜ۝ڙ\Έݘ]Kܙ][ٜ˜۝ڙ\ȟJHȝ
ۙٛ[ِ[ܝٜ՚]HʋȈ\ҙ^Hȝ
ؘ[[ٔ۝ڙ\ՙ^ʈȘݚ[ٙۚ[ِ[ܝٜʘۛ[X[ًژZ[ˈ[ٙJKȈ\ҙ^HȞ߈Ȟț۝Nȝ
ۙٛ[ِ[ܝٜқݜۈʈKȈ
NȈۛܝ؜ٕؘوH݊ݜؘْ[ܝ]ʋ
ݜؘْ[ܝ]]Z[ˈȘ۝[ݎȘۛ[X[ًۙ[ٝJWKȈ݊ݜؘٓܙ\؝܈ʋ
ݜؘٓܙ\؝ܑ]Z[ˈȘ۝[ݎȘژZ[˛[ٝ[ٙHJWKȈ݊ݜؘٔۛ\ʋ
ݜؘٔۛ\]Z[ʗKȈ݊ݜؘٔ۝ڙ\ȊK\ҙ^Hȝ
ݜؘٔ۝ڙ\љ]Z[ˈȜ۝ڙ\Έݘ]Kܙ][ٜ˜۝ڙ\ˈ[ٙ[Ȝݘ]Kܙ][ٜ˛[ٙ[JHȝ
ݜؘٓZ\ܚ[ٔ۝ڙ\ȊWKȈNȈٝؘي؜ٕؘيNȈXݚ]؝UXʈ؛ܝٜȊNٛٙ\КZ[ʊNȈYȊZ\ҙ^JH	
ȜݘYِ؜[ۈʋݙ^ۛݙ[݈H
؛ۜ]Hʎ	
ȜݛН]ۈʋٚ\ؘۙYH؛َ	
ȜݛН]ۈʋݙ^ۛݙ[݈H
ܝ[ȊNٝؘيˋ˘؜ٕًؘ݊ݜؘٓݝ]ʋ
ݜؘٓݝ]]Z[ʗWJNٝ\ێBވۛܝۛ\Hۛ\[Sܙ\؝ܔۛ\
ۛ[X[ًژZ[ˈ[ٙJNۛܝݝ]H]ؚ]؛۝ڙ\ʜۛ\
Nٝ[ܝٜʝ
ܙ\ܛۜٔ٘YU]Hʋݝ]
N	
ȜݘYِ؜[ۈʋݙ^ۛݙ[݈H
؛ۜ]Hʎٝؘيˋ˘؜ٕًؘ݊ݜؘٓݝ]ʋ
ݜؘٓݝ]]Z[ʗWJNH؝ڈ
\ܛ܊Hٝ[ܝٜʝ
ܜ۝ڙ\ќܛܕ]HʋٝܚY[ٛQ\ܛ܊\ܛ܊JN	
ȜݘYِ؜[ۈʋݙ^ۛݙ[݈H
؛ۛ٘ݚ[ۑ\ܛܐ؜[ۈʎٝؘيˋ˘؜ٕًؘ݊ݜؘٔ۝ڙ\ќܛ܈ʋٝܚY[ٛQ\ܛ܊\ܛ܊WWJNHڛ؛H	
ȜݛН]ۈʋٚ\ؘۙYH؛َ	
ȜݛН]ۈʋݙ^ۛݙ[݈H
ܝ[ȊNB߂ݛ؝[ۈXݚ]؝UXʝXʈ		
˝X܈ݝۈʋܑٛXXڊ
ݝۊHOȘݝۋ؛\ܓ\݋ݛٙۙJؘݚ]وˈݝۋ٘]\ٝݘXȏOOHXʊN		
˝X˜[ٛʋܑٛXXڊ
[ٛ
HOȜ[ٛ؛\ܓ\݋ܙ[[ݙJؘݚ]وʊN	
ɞݘXߔ[ٛ
K؛\ܓ\݋ؙ
ؘݚ]وʎBݛ؝[ۈڛU^
^[ٝ
Hٝ\ۈ^ۙ[ٝț[ٝȘ	ݙ^ܛXي[ٝHʟKˋ؈ȝ^Bݛ؝[ۈ\ؘ\R[
؛YJHٝ\ۈݜڛي؛YJBȈܙ\Xِ[
Ɉˈɘ[\ȊBȈܙ\Xِ[
ψˈɛȊBȈܙ\Xِ[
ψˈəݎȊBȈܙ\Xِ[
	ȉˈɜ][ݎȊBȈܙ\Xِ[
ɈˈɈ̌ΎȊNBݛ؝[ۈ٘Y\ؙِ۝[݊ٞJHۛܝ؛YHHݛXٜ˜\ܙR[݊ؘ[ݛܘYًٙ]][JٞJH̈ˈL
Nٝ\ۈݛXٜ˚\њ[ڝJ؛YJH	Ɉ؛YHψȝ؛YHȌB]ۛ[ٔؙٜٛTٙڜݙ\ٙH؛َٝ[؝[ۈٛٙ\՜ؙٓY]ژ܊ȈڜڝȏH٘Y\ؙِ۝[݊ۚP۞ڜڝȊKȈ^Xݝ[ۜȏH٘Y\ؙِ۝[݊ۚP۞^Xݝ[ۜȊKȈۛ[وH؝[Y[݋ښY[ȏȌȌKȈ؛ܙRٞHH؛ݛݙ\ј[ؘڈ˂ʈYȊ	
ȝڜڝ۝[݈ʊH	
ȝڜڝ۝[݈ʋݙ^ۛݙ[݈Hڜڝ˝ӛؘ[Tݜڛي
NYȊ	
țۛ[ِ۝[݈ʊH	
țۛ[ِ۝[݈ʋݙ^ۛݙ[݈HX]ۘ^
ۛ[يKݛӛؘ[Tݜڛي
NYȊ	
ș^Xݝ[ې۝[݈ʊH	
ș^Xݝ[ې۝[݈ʋݙ^ۛݙ[݈H^Xݝ[ۜ˝ӛؘ[Tݜڛي
NYȊ	
ȘXݚ]ڝUݘ[۝[݈ʊH	
ȘXݚ]ڝUݘ[۝[݈ʋݙ^ۛݙ[݈H
ڜڝȊș^Xݝ[ۜʋݛӛؘ[Tݜڛي
Nۛܝ؛ܙHH	
Ș۝[ݙ\ԘۜHʎYȊ؛ܙJH؛ܙK٘]\ٝڌNȏH؛ܙRٞN؛ܙKݙ^ۛݙ[݈H
؛ܙRٞJNB߂\ޛ؈ݛ؝[ۈٜ]Y\ݑؘۛ[۝[ݙ\ʛ؛YKXݚ[ۈHȊHۛܝۛݜۛ\ȏHٝȐXۜݐۛݜۛ\ʊNۛܝ[Y[ݝHڛٛ݋ܙ][Y[ݝ


HOȘۛݜۛ\˘Xۜ݊
KL
Nވۛܝݙٚ^HXݚ[ۈȘɞؘݚ[۟XȈȎۛܝٜܛۜوH]ؚ]ٝڊ	ѓАSГՓՑTאДџKɞۘ[Y_IܝYٚ^XY]َȈёU˂ȈؘڙNȈۛ˜ݛܙH˂Ȉڙۘ[Șۛݜۛ\˜ڙۘ[ȈJNYȊٜܛًۜܝ]\ȏOOH	ɈXXݚ[ۊHٝ\ۈYȊ\ٜܛًۜۚʈ۝țٝȑ\ܛ܊۝[ݙ\ȐTH	ܙ\ܛًۜܝ]\ߘ
Nۛܝ^[ؙH]ؚ]ٜܛًۜڜۛʊNۛܝ؛YHHݛXٜʜ^[ؙݘ[YHψ^[ؙ؛ݛ݈ψ^[ؙ٘]O˝؛YJNYȊSݛXٜ˚\њ[ڝJ؛YJJH۝țٝȑ\ܛ܊Лݛݙ\ȐTHٝ\ۙY[Ț[ݘ[Y؛YHʎٝ\ۈ؛YNHڛ؛Hڛٛ݋؛X\՚[Y[ݝ
[Y[ݝ
NB߂\ޛ؈ݛ؝[ۈޛؘؑۛ[۝[ݙ\܊ٙڜݙ\՚\ڝH؛ً[؜ٛY[ݑ^Xݝ[ۈH؛ًٙڜݙ\ӛۚ[وH؛يHۛܝڛݛٙڜݙ\՚\ڝHٙڜݙ\՚\ڝ	Ɉ\ٜܚ[۔ݛܘYًٙ]][JۚP۞ؘۛ[ڜڝٙڜݙ\ٙʎۛܝڛݛٙڜݙ\ӛۚ[وHٙڜݙ\ӛۚ[و	Ɉ[ۛ[ٔؙٜٛTٙڜݙ\ٙވۛܝݚ\ڝˈ^Xݝ[ۜˈۛ[ٗHH]ؚ]ۛZ\ً؛
ٜ]Y\ݑؘۛ[۝[ݙ\ʈݚ\ڝȋڛݛٙڜݙ\՚\ڝȈݜȎȈȊKȈٜ]Y\ݑؘۛ[۝[ݙ\ʈٞXݝ[ۜȋ[؜ٛY[ݑ^Xݝ[ۈȈݜȎȈȊKȈٜ]Y\ݑؘۛ[۝[ݙ\ʈۛۚ[وˈڛݛٙڜݙ\ӛۚ[وȈݜȎȈȊKȈJNYȊڛݛٙڜݙ\՚\ڝ
Hٜܚ[۔ݛܘYًܙ]][JۚP۞ؘۛ[ڜڝٙڜݙ\ٙˈ̈ʎYȊڛݛٙڜݙ\ӛۚ[يHۛ[ٔؙٜٛTٙڜݙ\ٙHݙNٛٙ\՜ؙٓY]ژ܊ڜڝˈ^Xݝ[ۜˈۛ[ًٛؘ[۝[ݙ\ȊNH؝ڈ
\ܛ܊Hٛٙ\՜ؙٓY]ژ܊
NB߂ݛ؝[ۈٛX\ٓۛ[ٔؙٜٛJ
HYȊ[ۛ[ٔؙٜٛTٙڜݙ\ٙ
Hٝ\ێۛ[ٔؙٜٛTٙڜݙ\ٙH؛َٝڊ	ѓАSГՓՑTאДџKۛۚ[ًٛݛ؋Y]َȈёU˂ȈؘڙNȈۛ˜ݛܙH˂Ȉٙ\[]َȝݙKȈJKؘ]ڊ

HOȞߊNBݛ؝[ۈ[ڝX[^ٕ\ؙٓY]ژ܊
HYȊ\ٜܚ[۔ݛܘYًٙ]][JۚP۞ڜڝٙڜݙ\ٙʊHؘ[ݛܘYًܙ]][JۚP۞ڜڝȋݜڛي٘Y\ؙِ۝[݊ۚP۞ڜڝȊH
ȌJJNٜܚ[۔ݛܘYًܙ]][JۚP۞ڜڝٙڜݙ\ٙˈ̈ʎBȈٛٙ\՜ؙٓY]ژ܊
Nޛؘؑۛ[۝[ݙ\܊ݙK؛ًݙJNڛٛ݋ܙ][ݙ\ݘ[


HOȞYȊY؝[Y[݋ښY[ʈޛؘؑۛ[۝[ݙ\܊
NK̌
Nڛٛ݋ؙ]ٛݓ\ݙ[ٜʈܘYٚYHˈٛX\ٓۛ[ٔؙٜٛJNڛٛ݋ؙ]ٛݓ\ݙ[ٜʈܘYٜڛ݈ˈ

HOȞYȊ[ۛ[ٔؙٜٛTٙڜݙ\ٙ
Hޛؘؑۛ[۝[ݙ\܊؛ً؛ًݙJNJNBݛ؝[ۈ[؜ٛY[ݑ^Xݝ[ې۝[݊
Hؘ[ݛܘYًܙ]][JۚP۞^Xݝ[ۜȋݜڛي٘Y\ؙِ۝[݊ۚP۞^Xݝ[ۜȊH
ȌJJNٛٙ\՜ؙٓY]ژ܊
Nޛؘؑۛ[۝[ݙ\܊؛ًݙJNBݛ؝[ۈڛِۛݜۛʊH		
֙]KXڛٗHʋܑٛXXڊ
ܛݜ
HOȞܛݜؙ]ٛݓ\ݙ[ٜʈ؛Xڈˈ
]ٛ݊HOȞۛܝݝۈH]ٛ݋ݘ\ٙ]؛ܙ\݊؝]ۈʎYȊXݝۊHٝ\ێܛݜܝY\ޔٛXݛܐ[
؝]ۈʋܑٛXXڊ
][JHOȚ][K؛\ܓ\݋ܙ[[ݙJؘݚ]وʊNݝۋ؛\ܓ\݋ؙ
ؘݚ]وʎݘ]Kܙ[XݙYٜ۝\٘]\ٝؚ[ٗHHݝۋ٘]\ٝݘ[YNٛٙ\ԝ[ݚ[YJ
Nٛٙ\КZ[ʊNJNJNȈ		
˝X܈ݝۈʋܑٛXXڊ
ݝۊHOȞݝۋؙ]ٛݓ\ݙ[ٜʈ؛Xڈˈ

HOȘXݚ]؝UXʘݝۋ٘]\ٝݘXʊNJNȈ	
ȜݛН]ۈʋؙ]ٛݓ\ݙ[ٜʈ؛XڈˈݛўXݝ[ۊN	
Șۛ[X[ْ[ܝ]ʋؙ]ٛݓ\ݙ[ٜʈڛܝ]ˈ

HOȞݘ]K؛ۛX[ٕݘڙYHݙNJN	
Ȝ؝ٔٝ[ٜН]ۈʋؙ]ٛݓ\ݙ[ٜʈ؛Xڈˈ؝ٔٝ[ٜʎ	
țܙ\؝ܔ٘\ؚʋؙ]ٛݓ\ݙ[ٜʈڛܝ]ˈٛٙ\Ӝ\؝ܓXܘ\ފN	
țݝ][ٙHʋؙ]ٛݓ\ݙ[ٜʈؚ[ٙHˈٛٙ\КZ[ʎ	
Ȝٝ[ٜН]ۈʋؙ]ٛݓ\ݙ[ٜʈ؛Xڈˈ

HOȘXݚ]؝UXʈܙ]\ʊN		
ț[ٝXYٔݚ]ڈݝۈʋܑٛXXڊ
ݝۊHOȞݝۋؙ]ٛݓ\ݙ[ٜʈ؛Xڈˈ

HOȜٝ[ٝXYيݝۋ٘]\ٝۘ[يJNJN		
˙ܙYK[[ٙ[X؜وʋܑٛXXڊ
؜يHOȞ؜ًؙ]ٛݓ\ݙ[ٜʈ؛Xڈˈ

HOȞݘ]Kܙ][ٜ˜۝ڙ\ȏH؜ً٘]\ٝܜ۝ڙ\΂Ȉݘ]Kܙ][ٜ˛[ٙ[H؜ً٘]\ٝۛٙ[ޛؔٝ[ٜњY[ʊN؝ٔٝ[ٜʊNٛٙ\ԝ[ݚ[YJ
NJNJN	
Ȝ۝ڙ\ԙ[X݈ʋؙ]ٛݓ\ݙ[ٜʈؚ[ٙHˈ

HOȞۛܝ۝ڙ\ȏH	
Ȝ۝ڙ\ԙ[X݈ʋݘ[YNݘ]Kܙ][ٜ˜۝ڙ\ȏH۝ڙ\΂Ȉݘ]Kܙ][ٜ˛[ٙ[HٝY؝[[ٙ[
۝ڙ\ʎޛؔٝ[ٜњY[ʊNٛٙ\ԝ[ݚ[YJ
NJNBڛِۛݜۛʊN[ڝX[^ٕ\ؙٓY]ژ܊
N\S[ٝXYي
Nؙٝ[ٜʊNؙܙ\؝ܜʊKؘ]ڊ
\ܛ܊HOȞ	
Ș[ܝٜ՚]Hʋܙ[[ݙP]ژݝJ٘]KZLNȊN	
Ș[ܝٜՙ^ʋܙ[[ݙP]ژݝJ٘]KZLNȊN	
Ș[ܝٜ՚]Hʋݙ^ۛݙ[݈Hݘ]Kۘ[ٝXYوOOHՓȂȈȈҚ0훙ȝ8nȚH1$q̸n蘈ܙ\؝܈XڋȂȈȜݘ]Kۘ[ٝXYوOOHҔȈۜ\؝܈Xڈ8ऺ*˸௺/ϸ࠸௸সसࠈȈИ[݈ۛؙܙ\؝܈XڋȎ	
Ș[ܝٜՙ^ʋݙ^ۛݙ[݈Hݘ]Kۘ[ٝXYوOOHՓȂȈȘ	ٜܛ܋ۙ\ܘYٟKȒ0螈ڸnȞH\خ̛وؘ[ٜݙ\ȝ^HЫxn爙ڛHخ예xnϜ؂ȈȜݘ]Kۘ[ٝXYوOOHҔȘ	ٜܛ܋ۙ\ܘYٟKșڛH8ह歹éze¸ࣸ૸੸૸સࣸࠛؘ[ٜݙ\ȸੈ\8हkǺ(c8ॸ੸ࣸਸॸࡸ࠘ȈȘ	ٜܛ܋ۙ\ܘYٟKȔݛȝH\۝YڈHؘ[ٜݙ\Ț[ܝXYوܙ[ڛوHڛH\٘ݛK؎JNBÂ