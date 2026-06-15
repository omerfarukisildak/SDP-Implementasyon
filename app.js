const { useMemo, useState } = React
const html = htm.bind(React.createElement)

const phaseDeadlineFieldMap = {
  "system-setup": {
    inputKey: "phase_1_input",
    outputKey: "phase_1_output",
    legacyKey: "system-setup"
  },
  "parallel-cost": {
    inputKey: "phase_2_input",
    outputKey: "phase_2_output",
    legacyKey: "parallel-cost"
  },
  "implementation-report": {
    inputKey: "phase_3_input",
    outputKey: "phase_3_output",
    legacyKey: "implementation-report"
  },
  "transition-call": {
    inputKey: "phase_4_input",
    outputKey: "phase_4_output",
    legacyKey: "transition-call"
  },
  integrations: {
    inputKey: "phase_5_input",
    outputKey: "phase_5_output",
    legacyKey: "integrations"
  },
  "operations-handover": {
    goliveKey: "phase_6_golive",
    legacyKey: "operations-handover"
  }
}

function createEmptyPhaseDeadlines(overrides = {}) {
  return {
    phase_1_input: "",
    phase_1_output: "",
    phase_2_input: "",
    phase_2_output: "",
    phase_3_input: "",
    phase_3_output: "",
    phase_4_input: "",
    phase_4_output: "",
    phase_5_input: "",
    phase_5_output: "",
    phase_6_golive: "",
    ...overrides
  }
}

function normalizePhaseDeadlines(deadlines = {}) {
  const source = deadlines || {}
  const normalized = createEmptyPhaseDeadlines()

  Object.values(phaseDeadlineFieldMap).forEach((meta) => {
    if (meta.goliveKey) {
      normalized[meta.goliveKey] = source[meta.goliveKey] ?? source[meta.legacyKey] ?? ""
      return
    }

    normalized[meta.inputKey] = source[meta.inputKey] ?? ""
    normalized[meta.outputKey] = source[meta.outputKey] ?? source[meta.legacyKey] ?? ""
  })

  return normalized
}

function getPhaseDeadlineValue(deadlines, phaseId, lane = "output") {
  const meta = phaseDeadlineFieldMap[phaseId]
  const normalized = normalizePhaseDeadlines(deadlines)

  if (!meta) {
    return ""
  }

  if (meta.goliveKey) {
    return normalized[meta.goliveKey]
  }

  return lane === "input" ? normalized[meta.inputKey] : normalized[meta.outputKey]
}

function setPhaseDeadlineValue(deadlines, phaseId, lane, value) {
  const meta = phaseDeadlineFieldMap[phaseId]
  const normalized = normalizePhaseDeadlines(deadlines)

  if (!meta) {
    return normalized
  }

  if (meta.goliveKey) {
    normalized[meta.goliveKey] = value
    return normalized
  }

  const key = lane === "input" ? meta.inputKey : meta.outputKey
  normalized[key] = value
  return normalized
}

function clearPhaseDeadlineValues(deadlines, phaseId) {
  const meta = phaseDeadlineFieldMap[phaseId]
  const normalized = normalizePhaseDeadlines(deadlines)

  if (!meta) {
    return normalized
  }

  if (meta.goliveKey) {
    normalized[meta.goliveKey] = ""
    return normalized
  }

  normalized[meta.inputKey] = ""
  normalized[meta.outputKey] = ""
  return normalized
}

const seedCompanies = [
  {
    id: "company-214",
    name: "Anadolu Lojistik Operasyon",
    onboardingType: "enterprise",
    transitionType: "fast",
    assignee: "Zerrin Altun",
    currentStepIndex: 3, // Muhasebe (0: Kurulum, 1: Bordro, 2: G&E, 3: Muhasebe, 4: Live, 5: Canlı, 6: Tamamlandı)
    hasGE: true,
    hasAccountingReport: true,
    startDate: "2026-05-27", // 15 gün önce (Bugün 11 Haziran 2026 kabul edilmiştir)
    deadlines: createEmptyPhaseDeadlines({
      phase_1_output: "2026-06-01",
      phase_2_output: "2026-06-08",
      phase_3_output: "2026-06-15",
      phase_4_output: "2026-06-22",
      phase_5_output: "2026-06-29",
      phase_6_golive: "2026-07-05"
    }),
    delayLogs: [],
    users: [
      {
        id: "u-214-1",
        firstName: "Bora",
        lastName: "Demir",
        email: "b.demir@anadolu.com",
        role: "editor",
        username: "bora.demir",
        password: "Sdp!Bora214",
        status: "credentials_ready",
        createdAt: "11 Haz 2026, 09:20"
      },
      {
        id: "u-214-2",
        firstName: "Selin",
        lastName: "Acar",
        email: "selin.acar@datassist.com",
        role: "viewer",
        username: "selin.acar",
        password: "Sdp!Selin214",
        status: "credentials_ready",
        createdAt: "11 Haz 2026, 09:28"
      }
    ]
  },
  {
    id: "company-208",
    name: "Marmara Grup Bordro",
    onboardingType: "local",
    transitionType: "normal",
    assignee: "Gözde Gökdağ Tumbar",
    currentStepIndex: 1, // Bordro
    hasGE: false,
    hasAccountingReport: false,
    startDate: "2026-05-02", // 40 gün önce (Hedef 25 gün, 15 gün aşmış)
    deadlines: createEmptyPhaseDeadlines({
      phase_1_output: "2026-05-10",
      phase_2_output: "2026-05-25",
      phase_5_output: "2026-06-15",
      phase_6_golive: "2026-06-25"
    }),
    delayLogs: [
      {
        id: "dl-208-1",
        type: "client",
        step: "parallel-cost",
        days: 12,
        reason: "Eski bordro ve çalışan özlük verilerinin geç iletilmesi",
        createdAt: "2026-05-25"
      }
    ],
    users: [
      {
        id: "u-208-1",
        firstName: "Okan",
        lastName: "Tuna",
        email: "okan.tuna@marmara.com",
        role: "viewer",
        username: "okan.tuna",
        password: "Sdp!Okan208",
        status: "credentials_ready",
        createdAt: "10 Haz 2026, 16:12"
      }
    ]
  },
  {
    id: "company-197",
    name: "Nova Retail HR",
    onboardingType: "saas",
    transitionType: "sample",
    assignee: "Engincan Büyükçolak",
    currentStepIndex: 6, // Tamamlandı
    hasGE: true,
    hasAccountingReport: false,
    startDate: "2026-05-10",
    endDate: "2026-06-04", // 25 gün sürdü (Hedef 35 gündü)
    deadlines: createEmptyPhaseDeadlines({
      phase_1_output: "2026-05-15",
      phase_2_output: "2026-05-22",
      phase_3_output: "2026-05-29",
      phase_5_output: "2026-06-01",
      phase_6_golive: "2026-06-04"
    }),
    delayLogs: [
      {
        id: "dl-197-1",
        type: "datassist",
        step: "system-setup",
        days: 5,
        reason: "Entegrasyon sunucusu API yetkilendirme hatası",
        createdAt: "2026-05-15"
      }
    ],
    users: [
      {
        id: "u-197-1",
        firstName: "Dilan",
        lastName: "Demir",
        email: "dilan.demir@datassist.com",
        role: "editor",
        username: "dilan.demir",
        password: "Sdp!Dilan197",
        status: "credentials_ready",
        createdAt: "09 Haz 2026, 13:42"
      },
      {
        id: "u-197-2",
        firstName: "Ece",
        lastName: "Akin",
        email: "ece.akin@novaretail.com",
        role: "viewer",
        username: "ece.akin",
        password: "Sdp!Ece197",
        status: "credentials_ready",
        createdAt: "09 Haz 2026, 13:55"
      }
    ]
  }
]

const roleOptions = [
  {
    value: "editor",
    label: "Duzenleyici",
    description:
      "Sirket alanindaki verileri goruntuleyebilir, veri yukleyebilir ve dokumanlari indirebilir."
  },
  {
    value: "viewer",
    label: "Goruntuleyici",
    description:
      "Yalnizca verileri goruntuleyebilir ve dokumanlari indirebilir. Veri yukleme yapamaz."
  }
]

const onboardingOptions = [
  {
    value: "saas",
    label: "SaaS",
    description: "Hazir bulut kurulumuyla hizli acilis yapisi."
  },
  {
    value: "local",
    label: "Local",
    description: "Sirket ici ortamlara uygun kontrollu kurulum akisi."
  },
  {
    value: "global",
    label: "Global",
    description: "Coklu ulke ve ekip koordinasyonu gerektiren onboarding."
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Genis kapsamli yapilar icin daha fazla kontrol noktasi."
  }
]

const transitionOptions = [
  {
    value: "normal",
    label: "Normal Gecis",
    description: "Standart proje plani ve normal hizda gecis akisi."
  },
  {
    value: "fast",
    label: "Hizli Gecis",
    description: "Sikistirilmis takvimle hizlandirilmis onboarding."
  },
  {
    value: "extra_fast",
    label: "Ekstra Hizli Gecis",
    description: "Oncelikli destekle minimum surede canli hazirlik."
  },
  {
    value: "sample",
    label: "Orneklem Gecis",
    description: "Pilot ekip veya ornek veriyle kontrollu deneme kurgusu."
  }
]

const assigneeOptions = [
  { value: "Zerrin Altun", label: "Zerrin Altun" },
  { value: "Gözde Gökdağ Tumbar", label: "Gözde Gökdağ Tumbar" },
  { value: "Engincan Büyükçolak", label: "Engincan Büyükçolak" }
]

const moduleAccessUrl = "https://sdp.datassist.com.tr"

const implementationBaseSteps = [
  { id: "system-setup",          number: "01", title: "Sistem Kurulumu",                  planned: "Haz 01", completedDate: "Haz 01" },
  { id: "parallel-cost",         number: "02", title: "Bordro Analiz Calismalari",         planned: "Haz 08", completedDate: "Haz 08" },
  { id: "implementation-report", number: "03", title: "Rapor Gelistirme ve Entegrasyon",   planned: "Haz 15", completedDate: "Haz 15" },
  { id: "transition-call",       number: "04", title: "Muhasebe Rapor Kurulumu",           planned: "Haz 22", completedDate: "Haz 22" },
  { id: "integrations",          number: "05", title: "Live Hazirliklari",                 planned: "Haz 29", completedDate: "Haz 29" },
  { id: "operations-handover",   number: "06", title: "Canliya Gecis",                     planned: "Tem 05", completedDate: "Tem 05" }
]

const starterKitDownloadHref = "file:///Users/omerisildak/Downloads/1%20-%20Starter%20Kit.xls"

// Her adim icin belgeler (coklu belge destegi)
const implementationStepTemplates = {
  "system-setup": {
    title: "Sistem Kurulumu",
    description: "Asagidaki sablonlari indirin, doldurun ve yukleyin. Tum dosyalar hazir oldugunda onaya gonderin.",
    documents: [
      {
        id: "doc-starter-kit",
        label: "Starter Kit",
        templateUrl: starterKitDownloadHref,
        templateName: "Starter-Kit.xls",
        description: "Personel ve Kurum kurulum bilgilerinden olusmakta olup, firma ve personel kartlarinin yaratilmasi icin gereklidir. Sonraki donemde bu form kullanilmayacaktir."
      },
      {
        id: "doc-puantaj",
        label: "Puantaj Formu",
        templateUrl: createTemplateDownloadHref("Puantaj"),
        templateName: "Puantaj-Formu-Sablon.xlsx",
        description: "Paralel maliyet ve aktif bordro hizmeti donemlerinde personel puantaj bilgilerini Datassist'e bildireceginizdosyadan olusmaktadir. Starter kit ile firma kurulumunuz gerceklestikten sonra puantaj formu ile surec devam ettirilecektir."
      },
      {
        id: "doc-giris-cikis",
        label: "Giris Cikis Nakil Formu",
        templateUrl: createTemplateDownloadHref("Giris Cikis Nakil"),
        templateName: "Giris-Cikis-Nakil-Sablon.xlsx",
        description: "Starter kit gonderimi sonrasi ise giren, cikan veya nakil olan personellerin Datassist kayitlarina alinabilmesi icin bu form ile bildirilmesi gerekir."
      }
    ]
  },
  "parallel-cost": {
    title: "Bordro Analiz Calismalari",
    description: "Asagidaki sablonlari indirin, doldurun ve yukleyin. Tum dosyalar hazir oldugunda onaya gonderin.",
    documents: [
      { id: "doc-maas-bordro",  label: "Maas Bordrosu",      templateUrl: createTemplateDownloadHref("Maas Bordrosu"),      templateName: "Maas-Bordrosu-Sablon.xlsx" },
      { id: "doc-sgk-bildirge", label: "SGK Bildirge",       templateUrl: createTemplateDownloadHref("SGK Bildirge"),       templateName: "SGK-Bildirge-Sablon.xlsx" },
      { id: "doc-izin-takip",   label: "Izin Takip Cetveli", templateUrl: createTemplateDownloadHref("Izin Takip"),         templateName: "Izin-Takip-Sablon.xlsx" }
    ]
  },
  "implementation-report": {
    title: "Rapor Gelistirme ve Entegrasyon",
    description: "Raporlama ve entegrasyon belgelerini doldurup yukleyin, ardindan onaya gonderin.",
    documents: [
      { id: "doc-rapor-haritasi", label: "Rapor Haritasi",        templateUrl: createTemplateDownloadHref("Rapor Haritasi"),        templateName: "Rapor-Haritasi-Sablon.xlsx" },
      { id: "doc-entegrasyon",    label: "Entegrasyon Tanimi",    templateUrl: createTemplateDownloadHref("Entegrasyon Tanimi"),    templateName: "Entegrasyon-Tanimi-Sablon.xlsx" },
      { id: "doc-alan-esleme",    label: "Alan Esleme Tablosu",   templateUrl: createTemplateDownloadHref("Alan Esleme"),           templateName: "Alan-Esleme-Sablon.xlsx" },
      { id: "doc-test-senaryosu", label: "Test Senaryolari",      templateUrl: createTemplateDownloadHref("Test Senaryolari"),      templateName: "Test-Senaryolari-Sablon.xlsx" }
    ]
  },
  "transition-call": {
    title: "Muhasebe Rapor Kurulumu",
    description: "Muhasebe rapor sablonlarini doldurun ve yukleyin.",
    documents: [
      { id: "doc-muhasebe-fis",    label: "Muhasebe Fisi Sablonu",  templateUrl: createTemplateDownloadHref("Muhasebe Fisi"),    templateName: "Muhasebe-Fisi-Sablon.xlsx" },
      { id: "doc-masraf-merkezi",  label: "Masraf Merkezi Esleme",  templateUrl: createTemplateDownloadHref("Masraf Merkezi"),  templateName: "Masraf-Merkezi-Sablon.xlsx" }
    ]
  },
  integrations: {
    title: "Live Hazirliklari",
    description: "Live gecis oncesi kontrol belgelerini doldurun ve yukleyin.",
    documents: [
      { id: "doc-kontrol-listesi", label: "Kontrol Listesi",    templateUrl: createTemplateDownloadHref("Kontrol Listesi"),    templateName: "Kontrol-Listesi-Sablon.xlsx" },
      { id: "doc-banka-odeme",     label: "Banka Odeme Dosyasi", templateUrl: createTemplateDownloadHref("Banka Odeme"),      templateName: "Banka-Odeme-Sablon.xlsx" }
    ]
  },
  "operations-handover": {
    title: "Canliya Gecis",
    description: "Devir teslim belgelerini doldurun ve yukleyin.",
    documents: [
      { id: "doc-devir-teslim", label: "Devir Teslim Formu", templateUrl: createTemplateDownloadHref("Devir Teslim"), templateName: "Devir-Teslim-Sablon.xlsx" }
    ]
  }
}

// Her adim icin baslangic durumlari
// docs: { [docId]: null | { id, name, uploadedAt, downloadUrl } }
const implementationStepUploadSeeds = {
  "system-setup":          { status: "waiting",          submitted: false, docs: {} },
  "parallel-cost":         { status: "pending_approval", submitted: true,  docs: {
    "doc-maas-bordro":  { id: "u-mb",  name: "maas-bordrosu.xlsx",    uploadedAt: "1 Haz 2026, 09:15", downloadUrl: createTemplateDownloadHref("Maas Bordrosu") },
    "doc-sgk-bildirge": { id: "u-sgk", name: "sgk-bildirge.xlsx",     uploadedAt: "1 Haz 2026, 09:40", downloadUrl: createTemplateDownloadHref("SGK Bildirge") },
    "doc-izin-takip":   null
  }},
  "implementation-report": { status: "waiting",          submitted: false, docs: {} },
  "transition-call":       { status: "approved",         submitted: true,  docs: {
    "doc-muhasebe-fis":   { id: "u-mf", name: "muhasebe-fisi.xlsx",   uploadedAt: "5 Haz 2026, 14:00", downloadUrl: createTemplateDownloadHref("Muhasebe Fisi") },
    "doc-masraf-merkezi": { id: "u-mm", name: "masraf-merkezi.xlsx",   uploadedAt: "5 Haz 2026, 14:20", downloadUrl: createTemplateDownloadHref("Masraf Merkezi") }
  }},
  integrations:            { status: "waiting",          submitted: false, docs: {} },
  "operations-handover":   { status: "waiting",          submitted: false, docs: {} }
}

const implementationInitialMessages = [
  {
    id: "impl-welcome-1",
    type: "implementation",
    author: "Defne Uzun",
    avatar: "DU",
    text: "Merhaba! Implementasyon surecine hosgeldiniz. Baslangic olarak Starter Kit sablonunu indirip doldurmanizi, ardindan sisteme yuklemenizi bekliyoruz. Herhangi bir sorunuzda buradan bize ulasabilirsiniz.",
    time: "1 Haz 2026, 09:00",
    isWelcome: true,
    starterKit: true
  }
]

function createEmptyUserDraft() {
  return {
    firstName: "",
    lastName: "",
    email: "",
    role: "viewer"
  }
}

function createEmptyCompanyDraft() {
  return {
    name: "",
    onboardingType: "saas",
    transitionType: "normal",
    assignee: "Zerrin Altun",
    hasGE: true,
    hasAccountingReport: true,
    startDate: "2026-06-11",
    deadlines: createEmptyPhaseDeadlines(),
    delayLogs: []
  }
}

function createCompanyDraftFromCompany(company) {
  return {
    name: company?.name || "",
    onboardingType: company?.onboardingType || "saas",
    transitionType: company?.transitionType || "normal",
    assignee: company?.assignee || "Zerrin Altun",
    hasGE: company?.hasGE !== undefined ? company.hasGE : true,
    hasAccountingReport: company?.hasAccountingReport !== undefined ? company.hasAccountingReport : true,
    startDate: company?.startDate || "2026-06-11",
    deadlines: normalizePhaseDeadlines(company?.deadlines),
    delayLogs: company?.delayLogs ? [...company.delayLogs] : []
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function classNames(...values) {
  return values.filter(Boolean).join(" ")
}

function getRoleMeta(role) {
  return roleOptions.find((option) => option.value === role) || roleOptions[1]
}

function getOnboardingMeta(value) {
  return onboardingOptions.find((option) => option.value === value) || onboardingOptions[0]
}

function getTransitionMeta(value) {
  return transitionOptions.find((option) => option.value === value) || transitionOptions[0]
}

function getUserStatusMeta(status) {
  const statusMap = {
    credentials_ready: {
      label: "Bilgiler Hazir",
      badgeClass: "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]"
    },
    updating: {
      label: "Guncelleniyor",
      badgeClass: "border-[#D5E2FF] bg-[#EEF4FF] text-[#285BD4]"
    }
  }

  return statusMap[status] || statusMap.credentials_ready
}

function getFeedbackClass(tone) {
  if (tone === "error") {
    return "text-[#D92D20]"
  }

  if (tone === "success") {
    return "text-[#067647]"
  }

  return "text-[#667085]"
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function normalizeForSystem(value) {
  const transliterated = value
    .trim()
    .replace(/[Çç]/g, "c")
    .replace(/[Ğğ]/g, "g")
    .replace(/[İIı]/g, "i")
    .replace(/[Öö]/g, "o")
    .replace(/[Şş]/g, "s")
    .replace(/[Üü]/g, "u")

  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.+|\.+$)/g, "")
}

function buildSystemUsername(firstName, lastName) {
  const first = normalizeForSystem(firstName)
  const last = normalizeForSystem(lastName)
  const base = [first, last].filter(Boolean).join(".")

  return base || `kullanici.${Date.now().toString().slice(-4)}`
}

function buildSystemPassword(firstName) {
  const base = normalizeForSystem(firstName).slice(0, 4) || "user"
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `Sdp!${base[0]?.toUpperCase() || "U"}${base.slice(1)}${randomPart}`
}

async function provisionUserInDakika(user) {
  await delay(950)

  return {
    username: buildSystemUsername(user.firstName, user.lastName),
    password: buildSystemPassword(user.firstName)
  }
}

function buildCredentialMailTo(user, companyName) {
  const subject = "SDP Implementasyon Modulu Kullanici Bilgileri"
  const body = [
    `Merhaba ${user.firstName},`,
    "",
    "Implementasyon sureclerinizi yoneteceginiz module ait giris bilgileriniz asagidadadir.",
    "",
    `Sirket: ${companyName}`,
    `Kullanici Adi: ${user.username}`,
    `Sifre: ${user.password}`,
    `Modul Linki: ${moduleAccessUrl}`,
    "",
    "Iyi calismalar."
  ].join("\n")

  return `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function formatTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date)
}

function formatChatTime(date = new Date()) {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date)
}

function formatDateOnly(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(d)
  } catch (e) {
    return dateStr
  }
}

function getImplementationTaskStatusMeta(status) {
  const statusMap = {
    waiting: {
      label: "Bekliyor",
      badgeClass: "border-[#EAECF0] bg-[#F9FAFB] text-[#475467]",
      progress: 0.1
    },
    uploaded: {
      label: "Dosya Yuklendi",
      badgeClass: "border-[#D5E2FF] bg-[#F5F8FF] text-[#285BD4]",
      progress: 0.4
    },
    pending_approval: {
      label: "Onayda Bekliyor",
      badgeClass: "border-[#FEC84B] bg-[#FFFAEB] text-[#B54708]",
      progress: 0.6
    },
    reviewing: {
      label: "Inceleniyor",
      badgeClass: "border-[#DCEBFF] bg-[#EEF4FF] text-[#1D4ED8]",
      progress: 0.6
    },
    revision_requested: {
      label: "Revize Talep Edildi",
      badgeClass: "border-[#F7D79A] bg-[#FFFAEB] text-[#B54708]",
      progress: 0.3
    },
    approved: {
      label: "Onaylandi",
      badgeClass: "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]",
      progress: 1
    }
  }

  return statusMap[status] || statusMap.waiting
}

function getImplementationStepStatusMeta(status) {
  const statusMap = {
    completed: {
      label: "Tamamlandi",
      dotClass: "bg-[#12B76A]",
      textClass: "text-[#067647]"
    },
    in_progress: {
      label: "Devam Ediyor",
      dotClass: "bg-[#2F6FED]",
      textClass: "text-[#285BD4]"
    },
    not_started: {
      label: "Baslamadi",
      dotClass: "bg-[#D0D5DD]",
      textClass: "text-[#667085]"
    }
  }

  return statusMap[status] || statusMap.not_started
}

function createTemplateDownloadHref(templateLabel) {
  const header = "Alan,Aciklama\n"
  const body = `ornek_deger,${templateLabel} icin ornek aciklama\n`
  return `data:text/csv;charset=utf-8,${encodeURIComponent(header + body)}`
}

function deriveSystemSetupStepStatus(tasks) {
  if (tasks.every((task) => task.status === "approved")) {
    return "completed"
  }

  if (tasks.some((task) => task.status !== "waiting")) {
    return "in_progress"
  }

  return "not_started"
}

function UsersIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
      <circle cx="9.5" cy="7" r="4"></circle>
      <path d="M20 8v6"></path>
      <path d="M23 11h-6"></path>
    </svg>
  `
}

function TrashIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M3 6h18"></path>
      <path d="M8 6V4.8A1.8 1.8 0 0 1 9.8 3h4.4A1.8 1.8 0 0 1 16 4.8V6"></path>
      <path d="M19 6l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
      <path d="M10 11v6"></path>
      <path d="M14 11v6"></path>
    </svg>
  `
}

function SelectorIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M7 10l5-5 5 5"></path>
      <path d="M7 14l5 5 5-5"></path>
    </svg>
  `
}

function PlusIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 5v14"></path>
      <path d="M5 12h14"></path>
    </svg>
  `
}

function DownloadIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 3v12"></path>
      <path d="M7 10l5 5 5-5"></path>
      <path d="M5 21h14"></path>
    </svg>
  `
}

function UploadIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 21V9"></path>
      <path d="M7 14l5-5 5 5"></path>
      <path d="M5 3h14"></path>
    </svg>
  `
}

function SendIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M22 2L11 13"></path>
      <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
    </svg>
  `
}

function PencilIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
    </svg>
  `
}

function EyeIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  `
}

function CloseIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M18 6L6 18"></path>
      <path d="M6 6l12 12"></path>
    </svg>
  `
}

function ProgressIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3.3-6.94"></path>
      <path d="M3 4v5h5"></path>
    </svg>
  `
}

function CheckCircleIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <path d="M22 4L12 14.01l-3-3"></path>
    </svg>
  `
}

function LayersIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 2l9 4.5-9 4.5-9-4.5 9-4.5z"></path>
      <path d="M3 12l9 4.5 9-4.5"></path>
      <path d="M3 17l9 4.5 9-4.5"></path>
    </svg>
  `
}

function LayoutIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="9" rx="1"></rect>
      <rect x="14" y="3" width="7" height="5" rx="1"></rect>
      <rect x="14" y="10" width="7" height="11" rx="1"></rect>
      <rect x="3" y="14" width="7" height="7" rx="1"></rect>
    </svg>
  `
}

function ClockIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M12 7v5l3 2"></path>
    </svg>
  `
}

function CheckSmallIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7"></path>
    </svg>
  `
}

function MessageSquareIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `
}

function MinimizeIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M6 12h12"></path>
    </svg>
  `
}

function InfoIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M12 10v6"></path>
      <path d="M12 7h.01"></path>
    </svg>
  `
}

function ChevronDownIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6"></path>
    </svg>
  `
}

function SettingsIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21"></path>
      <path d="M4.6 9A1.65 1.65 0 0 0 4.27 7.18l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 8.92 4"></path>
      <path d="M12 3a2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51"></path>
      <path d="M21 12a2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1"></path>
      <path d="M3 12a2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 6.6 9"></path>
      <path d="M12 21a2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51"></path>
    </svg>
  `
}

function GridIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
      <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
      <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
      <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
    </svg>
  `
}

function HelpCircleIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  `
}

function SpeedometerIcon() {
  return html`
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M2 17a10 10 0 0 1 20 0" />
      <path d="m11.2 12.8 4.6-4.6" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  `
}

function formatTurkishDate(dateStr) {
  if (!dateStr) return "Belirtilmedi"
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ]
  try {
    const parts = dateStr.split("-")
    if (parts.length === 3) {
      const year = parts[0]
      const monthIndex = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${day} ${months[monthIndex]} ${year}`
      }
    }
  } catch (e) {
    // fallback
  }
  return dateStr
}

function getInitials(value) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) {
    return "SR"
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("")
}

function RoleBadge({ role }) {
  const roleMeta = getRoleMeta(role)
  const badgeClass =
    roleMeta.value === "editor"
      ? "border-[#D5E2FF] bg-[#F5F8FF] text-[#285BD4]"
      : "border-[#EAECF0] bg-[#F9FAFB] text-[#475467]"

  return html`
    <span
      className=${classNames(
        "inline-flex h-7 items-center rounded-full border px-2.5 text-[12px] font-medium",
        badgeClass
      )}
    >
      ${roleMeta.label}
    </span>
  `
}

function SidebarNavButton({ active, icon, label, onClick }) {
  return html`
    <button
      type="button"
      onClick=${onClick}
      className=${classNames("nav-item", active && "nav-item--active")}
      aria-current=${active ? "page" : undefined}
      title=${label}
    >
      <span className="nav-item__icon" aria-hidden="true">${icon}</span>
      <span className="nav-item__text">${label}</span>
    </button>
  `
}

function Sidebar({ activePage, isCollapsed, onPageChange, onToggleCollapse }) {
  const primaryItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: html`<${LayoutIcon} />`
    },
    {
      id: "processes",
      label: "Implementasyon Surecleri",
      icon: html`<${LayersIcon} />`
    },
    {
      id: "sla",
      label: "SLA",
      icon: html`<${SpeedometerIcon} />`
    },
    {
      id: "management",
      label: "Şirket Yönetimi",
      icon: html`<${UsersIcon} />`
    }
  ]

  const footerItems = [
    {
      id: "settings",
      label: "Ayarlar",
      icon: html`<${SettingsIcon} />`
    },
    {
      id: "apps",
      label: "Tum Uygulamalar",
      icon: html`<${GridIcon} />`
    },
    {
      id: "help",
      label: "Yardim Merkezi",
      icon: html`<${HelpCircleIcon} />`
    }
  ]

  return html`
    <div className=${classNames("sidebar-shell hidden lg:flex", isCollapsed && "is-collapsed")}>
      <aside
        id="sidebar"
        className=${classNames("sidebar", isCollapsed && "is-collapsed")}
        aria-label="Ana menu"
      >
        <div className="sidebar__top">
          <div className="sidebar-logo-link" aria-label="Datassist">
            <img
              className="sidebar-logo sidebar-logo--full"
              src="Assets/dakika-logo.png"
              alt="Datassist"
              decoding="async"
            />
            <img
              className="sidebar-logo sidebar-logo--compact"
              src="Assets/logo-2.png"
              alt=""
              width="44"
              height="44"
              decoding="async"
              aria-hidden="true"
            />
          </div>
          <span className="sidebar__badge">SDP</span>
        </div>

        <div className="sidebar__nav-stack">
          <nav className="sidebar__nav sidebar__nav--flat" aria-label="SDP Implementasyon">
            <p className="sidebar__section">Implementasyon</p>
            <ul className="nav-list">
              ${primaryItems.map(
                (item) => html`
                  <li key=${item.id}>
                    <${SidebarNavButton}
                      active=${activePage === item.id}
                      icon=${item.icon}
                      label=${item.label}
                      onClick=${() => onPageChange(item.id)}
                    />
                  </li>
                `
              )}
            </ul>
          </nav>
        </div>

        <nav className="sidebar__footer" aria-label="Ayarlar ve yardim">
          <ul className="nav-list sidebar-footer__list">
            ${footerItems.map(
              (item) => html`
                <li key=${item.id}>
                  <${SidebarNavButton}
                    active=${false}
                    icon=${item.icon}
                    label=${item.label}
                    onClick=${() => {}}
                  />
                </li>
              `
            )}
          </ul>
        </nav>
      </aside>

      <button
        type="button"
        className="sidebar-toggle"
        onClick=${onToggleCollapse}
        aria-expanded=${String(!isCollapsed)}
        aria-controls="sidebar"
        title=${isCollapsed ? "Menuyu genislet" : "Menuyu daralt"}
      >
        <svg className="sidebar-toggle__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </button>
    </div>
  `
}

function TopBar({
  companies,
  selectedCompany,
  companyDraft,
  isCreatingCompany,
  onCreateNewCompany,
  onSelectCompany,
  activePage,
  selectedOnboardingType,
  setSelectedOnboardingType,
  selectedStatus,
  setSelectedStatus
}) {
  const { useEffect, useRef } = React
  const [isOpen, setIsOpen] = useState(false)
  const [isDeptOpen, setIsDeptOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)

  const dropdownRef = useRef(null)
  const deptDropdownRef = useRef(null)
  const statusDropdownRef = useRef(null)

  const displayedCompanyName = isCreatingCompany
    ? companyDraft.name.trim() || "Yeni Sirket"
    : selectedCompany?.name || (activePage === "sla" ? "Tüm Şirketler" : "Sirket Secin")

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target)) {
        setIsDeptOpen(false)
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setIsStatusOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const currentDeptLabel = selectedOnboardingType === "all"
    ? "Tümü"
    : (onboardingOptions.find((opt) => opt.value === selectedOnboardingType)?.label || "Tümü")

  const currentStatusLabel = selectedStatus === "all"
    ? "Tümü"
    : selectedStatus === "devam_ediyor" ? "Devam Ediyor" : "Tamamlandı"

  return html`
    <header className="topbar">
      <div className="topbar__kurum">
        <span className="topbar__rule" aria-hidden="true"></span>
        ${activePage === "dashboard"
          ? html`
              <div className="kurum-block" ref=${deptDropdownRef}>
                <div className="relative">
                  <button
                    type="button"
                    onClick=${() => setIsDeptOpen((c) => !c)}
                    className="kurum-select kurum-select--interactive"
                    aria-expanded=${String(isDeptOpen)}
                  >
                    <span className="kurum-select__eyebrow">Bölüm</span>
                    <span className="kurum-select__row">
                      <span className="kurum-select__name">${currentDeptLabel}</span>
                      <span
                        className="kurum-select__chevron"
                        style=${{ transform: isDeptOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      >
                        <${ChevronDownIcon} />
                      </span>
                    </span>
                  </button>

                  ${isDeptOpen
                    ? html`
                        <div className="topbar-dropdown" style=${{ minWidth: "180px" }}>
                          <div className="topbar-dropdown__list">
                            <button
                              type="button"
                              onClick=${() => { setSelectedOnboardingType("all"); setIsDeptOpen(false); }}
                              className=${classNames(
                                "topbar-dropdown__item",
                                selectedOnboardingType === "all" && "topbar-dropdown__item--active"
                              )}
                            >
                              <span className="block truncate text-[13px] font-medium text-[#101828]">Tüm Bölümler</span>
                            </button>
                            ${onboardingOptions.map(
                              (opt) => html`
                                <button
                                  key=${opt.value}
                                  type="button"
                                  onClick=${() => { setSelectedOnboardingType(opt.value); setIsDeptOpen(false); }}
                                  className=${classNames(
                                    "topbar-dropdown__item",
                                    selectedOnboardingType === opt.value && "topbar-dropdown__item--active"
                                  )}
                                >
                                  <span className="block truncate text-[13px] font-medium text-[#101828]">${opt.label}</span>
                                </button>
                              `
                            )}
                          </div>
                        </div>
                      `
                    : null}
                </div>
              </div>

              <span className="topbar__rule" aria-hidden="true"></span>

              <div className="kurum-block" ref=${statusDropdownRef}>
                <div className="relative">
                  <button
                    type="button"
                    onClick=${() => setIsStatusOpen((c) => !c)}
                    className="kurum-select kurum-select--interactive"
                    aria-expanded=${String(isStatusOpen)}
                  >
                    <span className="kurum-select__eyebrow">Durum</span>
                    <span className="kurum-select__row">
                      <span className="kurum-select__name">${currentStatusLabel}</span>
                      <span
                        className="kurum-select__chevron"
                        style=${{ transform: isStatusOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      >
                        <${ChevronDownIcon} />
                      </span>
                    </span>
                  </button>

                  ${isStatusOpen
                    ? html`
                        <div className="topbar-dropdown" style=${{ minWidth: "160px" }}>
                          <div className="topbar-dropdown__list">
                            <button
                              type="button"
                              onClick=${() => { setSelectedStatus("all"); setIsStatusOpen(false); }}
                              className=${classNames(
                                "topbar-dropdown__item",
                                selectedStatus === "all" && "topbar-dropdown__item--active"
                              )}
                            >
                              <span className="block truncate text-[13px] font-medium text-[#101828]">Tüm Durumlar</span>
                            </button>
                            <button
                              type="button"
                              onClick=${() => { setSelectedStatus("devam_ediyor"); setIsStatusOpen(false); }}
                              className=${classNames(
                                "topbar-dropdown__item",
                                selectedStatus === "devam_ediyor" && "topbar-dropdown__item--active"
                              )}
                            >
                              <span className="block truncate text-[13px] font-medium text-[#101828]">Devam Ediyor</span>
                            </button>
                            <button
                              type="button"
                              onClick=${() => { setSelectedStatus("tamamlandi"); setIsStatusOpen(false); }}
                              className=${classNames(
                                "topbar-dropdown__item",
                                selectedStatus === "tamamlandi" && "topbar-dropdown__item--active"
                              )}
                            >
                              <span className="block truncate text-[13px] font-medium text-[#101828]">Tamamlandı</span>
                            </button>
                          </div>
                        </div>
                      `
                    : null}
                </div>
              </div>
            `
          : html`
              <div className="kurum-block" ref=${dropdownRef}>
                <div className="relative">
                  <button
                    type="button"
                    onClick=${() => setIsOpen((c) => !c)}
                    className="kurum-select kurum-select--interactive"
                    aria-expanded=${String(isOpen)}
                    aria-haspopup="listbox"
                  >
                    <span className="kurum-select__eyebrow">Sirket</span>
                    <span className="kurum-select__row">
                      <span className="kurum-select__name">${displayedCompanyName}</span>
                      <span
                        className="kurum-select__chevron"
                        style=${{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      >
                        <${ChevronDownIcon} />
                      </span>
                    </span>
                  </button>

                  ${isOpen
                    ? html`
                        <div
                          role="listbox"
                          className="topbar-dropdown"
                        >
                          <button
                            type="button"
                            onClick=${() => { onCreateNewCompany(); setIsOpen(false) }}
                            className="topbar-dropdown__item"
                          >
                            <span className="topbar-dropdown__icon topbar-dropdown__icon--accent">
                              <${PlusIcon} />
                            </span>
                            <span className="topbar-dropdown__label">Yeni Sirket Hazirla</span>
                          </button>

                          <div className="topbar-dropdown__sep"></div>

                          <div className="topbar-dropdown__list">
                            ${activePage === "sla"
                              ? html`
                                  <button
                                    type="button"
                                    onClick=${() => { onSelectCompany("all"); setIsOpen(false) }}
                                    className=${classNames(
                                      "topbar-dropdown__item",
                                      (!selectedCompany || selectedCompany.id === "all") && "topbar-dropdown__item--active"
                                    )}
                                  >
                                    <span className="topbar-dropdown__icon topbar-dropdown__icon--accent">
                                      <span className="material-symbols-outlined text-[16px]">business</span>
                                    </span>
                                    <span className="topbar-dropdown__label font-semibold text-[#1570EF]">Tüm Şirketler</span>
                                  </button>
                                  <div className="topbar-dropdown__sep"></div>
                                `
                              : null}
                            ${companies.map(
                              (company) => html`
                                <button
                                  key=${company.id}
                                  type="button"
                                  role="option"
                                  aria-selected=${selectedCompany?.id === company.id}
                                  onClick=${() => { onSelectCompany(company.id); setIsOpen(false) }}
                                  className=${classNames(
                                    "topbar-dropdown__item",
                                    selectedCompany?.id === company.id && "topbar-dropdown__item--active"
                                  )}
                                >
                                  <span className="topbar-dropdown__icon topbar-dropdown__icon--muted">
                                    ${getInitials(company.name)}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[13px] font-medium text-[#101828]">${company.name}</span>
                                    <span className="mt-0.5 block text-[12px] text-[#667085]">
                                      ${getOnboardingMeta(company.onboardingType).label} • ${(company.users || []).length} kullanici
                                    </span>
                                  </span>
                                </button>
                              `
                            )}
                          </div>
                        </div>
                      `
                    : null}
                </div>
              </div>

              <!-- SLA page filters when "Tüm Şirketler" is selected -->
              ${activePage === "sla" && (!selectedCompany || selectedCompany.id === "all")
                ? html`
                    <span className="topbar__rule" aria-hidden="true"></span>
                    
                    <div className="kurum-block" ref=${deptDropdownRef}>
                      <div className="relative">
                        <button
                          type="button"
                          onClick=${() => setIsDeptOpen((c) => !c)}
                          className="kurum-select kurum-select--interactive"
                          aria-expanded=${String(isDeptOpen)}
                        >
                          <span className="kurum-select__eyebrow">Bölüm</span>
                          <span className="kurum-select__row">
                            <span className="kurum-select__name">${currentDeptLabel}</span>
                            <span
                              className="kurum-select__chevron"
                              style=${{ transform: isDeptOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                            >
                              <${ChevronDownIcon} />
                            </span>
                          </span>
                        </button>
                        ${isDeptOpen
                          ? html`
                              <div className="topbar-dropdown" style=${{ minWidth: "180px" }}>
                                <div className="topbar-dropdown__list">
                                  <button
                                    type="button"
                                    onClick=${() => { setSelectedOnboardingType("all"); setIsDeptOpen(false); }}
                                    className=${classNames(
                                      "topbar-dropdown__item",
                                      selectedOnboardingType === "all" && "topbar-dropdown__item--active"
                                    )}
                                  >
                                    <span className="block truncate text-[13px] font-medium text-[#101828]">Tüm Bölümler</span>
                                  </button>
                                  ${onboardingOptions.map(
                                    (opt) => html`
                                      <button
                                        key=${opt.value}
                                        type="button"
                                        onClick=${() => { setSelectedOnboardingType(opt.value); setIsDeptOpen(false); }}
                                        className=${classNames(
                                          "topbar-dropdown__item",
                                          selectedOnboardingType === opt.value && "topbar-dropdown__item--active"
                                        )}
                                      >
                                        <span className="block truncate text-[13px] font-medium text-[#101828]">${opt.label}</span>
                                      </button>
                                    `
                                  )}
                                </div>
                              </div>
                            `
                          : null}
                      </div>
                    </div>

                    <span className="topbar__rule" aria-hidden="true"></span>

                    <div className="kurum-block" ref=${statusDropdownRef}>
                      <div className="relative">
                        <button
                          type="button"
                          onClick=${() => setIsStatusOpen((c) => !c)}
                          className="kurum-select kurum-select--interactive"
                          aria-expanded=${String(isStatusOpen)}
                        >
                          <span className="kurum-select__eyebrow">Durum</span>
                          <span className="kurum-select__row">
                            <span className="kurum-select__name">${currentStatusLabel}</span>
                            <span
                              className="kurum-select__chevron"
                              style=${{ transform: isStatusOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                            >
                              <${ChevronDownIcon} />
                            </span>
                          </span>
                        </button>
                        ${isStatusOpen
                          ? html`
                              <div className="topbar-dropdown" style=${{ minWidth: "160px" }}>
                                <div className="topbar-dropdown__list">
                                  <button
                                    type="button"
                                    onClick=${() => { setSelectedStatus("all"); setIsStatusOpen(false); }}
                                    className=${classNames(
                                      "topbar-dropdown__item",
                                      selectedStatus === "all" && "topbar-dropdown__item--active"
                                    )}
                                  >
                                    <span className="block truncate text-[13px] font-medium text-[#101828]">Tüm Durumlar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick=${() => { setSelectedStatus("devam_ediyor"); setIsStatusOpen(false); }}
                                    className=${classNames(
                                      "topbar-dropdown__item",
                                      selectedStatus === "devam_ediyor" && "topbar-dropdown__item--active"
                                    )}
                                  >
                                    <span className="block truncate text-[13px] font-medium text-[#101828]">Devam Ediyor</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick=${() => { setSelectedStatus("tamamlandi"); setIsStatusOpen(false); }}
                                    className=${classNames(
                                      "topbar-dropdown__item",
                                      selectedStatus === "tamamlandi" && "topbar-dropdown__item--active"
                                    )}
                                  >
                                    <span className="block truncate text-[13px] font-medium text-[#101828]">Tamamlandı</span>
                                  </button>
                                </div>
                              </div>
                            `
                          : null}
                      </div>
                    </div>
                  `
                : null}
            `}
        <span className="topbar__rule" aria-hidden="true"></span>
      </div>

      <div className="topbar__spacer" aria-hidden="true"></div>

      <div className="topbar__actions">
        <span className="topbar__user-pill">Implementasyon Kullanicisi</span>

        <button type="button" className="lang-btn" title="Dil: Turkce" aria-label="Dil secici">
          <span className="lang-btn__flag" aria-hidden="true">🇹🇷</span>
        </button>

        <button type="button" className="avatar" aria-label="Profil menusu">
          <span className="avatar__initials">DD</span>
        </button>
      </div>
    </header>
  `
}

function AppFooter() {
  return html`
    <footer className="app-footer" role="contentinfo">
      <div className="app-footer__left">
        <span className="app-footer__year">© 2026</span>
        <a href="#" className="app-footer__brand" aria-label="Datassist">
          <img
            className="app-footer__logo"
            src="Assets/dakika-logo.png"
            alt="Datassist"
            decoding="async"
          />
        </a>
      </div>

      <nav className="app-footer__nav" aria-label="Yasal baglantilar">
        <a href="#" className="app-footer__link">Yasal Uyari</a>
        <span className="app-footer__sep" aria-hidden="true">-</span>
        <a href="#" className="app-footer__link">KVKK Politikasi</a>
        <span className="app-footer__sep" aria-hidden="true">-</span>
        <a href="#" className="app-footer__link">KVKK Aydinlatma</a>
      </nav>

      <div className="app-footer__right" aria-hidden="true"></div>
    </footer>
  `
}

function ProfileFieldLabel({ label }) {
  return html`
    <span className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[#475467]">
      ${label}
    </span>
  `
}

function ProfileInputRow({ label, name, autoComplete, value, onChange, placeholder, hasDivider = true }) {
  return html`
    <div className=${classNames(
      "grid gap-3 py-5 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-center",
      hasDivider && "border-t border-[#EAECF0]"
    )}>
      <${ProfileFieldLabel} label=${label} />

      <input
        type="text"
        name=${name}
        autoComplete=${autoComplete}
        value=${value}
        onInput=${(event) => onChange(event.target.value)}
        placeholder=${placeholder}
        className="h-12 w-full rounded-[14px] border border-[#D0D5DD] bg-[#FCFCFD] px-4 text-[14px] font-medium text-[#101828] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#DCE8FF] placeholder:text-[#98A2B3]"
      />
    </div>
  `
}

function ProfileSelectRow({ label, name, options, value, onChange, hasDivider = true }) {
  return html`
    <div className=${classNames(
      "grid gap-3 py-5 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-center",
      hasDivider && "border-t border-[#EAECF0]"
    )}>
      <${ProfileFieldLabel} label=${label} />

      <${MinimalSelectField}
        name=${name}
        options=${options}
        value=${value}
        onChange=${onChange}
      />
    </div>
  `
}

function EditActionButton({ label, onClick, icon = PencilIcon }) {
  return html`
    <button
      type="button"
      onClick=${onClick}
      className=${classNames(
        "inline-flex h-11 items-center justify-center rounded-[12px] border border-[#D0D5DD] bg-white text-[14px] font-semibold text-[#344054] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:bg-[#F9FAFB]",
        label ? "gap-2 px-4" : "w-11"
      )}
      aria-label=${label || "Duzenle"}
    >
      <${icon} />
      ${label ? html`<span>${label}</span>` : null}
    </button>
  `
}

function ProfileValueRow({ label, value, hasDivider = true }) {
  return html`
    <div className=${classNames(
      "grid gap-3 py-5 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-center",
      hasDivider && "border-t border-[#EAECF0]"
    )}>
      <${ProfileFieldLabel} label=${label} />
      <p className="text-[16px] font-medium text-[#101828]">${value}</p>
    </div>
  `
}

function MinimalSelectField({ name, options, value, onChange }) {
  const { useEffect, useRef } = React
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)
  const selectedOption = options.find((option) => option.value === value) || options[0]

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return html`
    <div ref=${selectRef} className=${classNames("relative w-full", isOpen && "z-30")}>
      <button
        type="button"
        name=${name}
        onClick=${() => setIsOpen((current) => !current)}
        aria-expanded=${String(isOpen)}
        aria-haspopup="listbox"
        className="flex h-12 w-full items-center justify-between rounded-[14px] border border-[#D0D5DD] bg-[#FCFCFD] px-4 text-left text-[14px] font-medium text-[#101828] outline-none transition hover:bg-white focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#DCE8FF]"
      >
        <span>${selectedOption?.label || ""}</span>
        <span className=${classNames("text-[#98A2B3] transition", isOpen && "rotate-180")}>
          <${ChevronDownIcon} />
        </span>
      </button>

      ${
        isOpen
          ? html`
              <div
                role="listbox"
                className="absolute left-0 right-0 top-[calc(100%+8px)] rounded-[16px] border border-[#D7E0EC] bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.14)]"
              >
                ${options.map(
                  (option) => html`
                    <button
                      key=${option.value}
                      type="button"
                      role="option"
                      aria-selected=${value === option.value}
                      onClick=${() => {
                        onChange(option.value)
                        setIsOpen(false)
                      }}
                      className=${classNames(
                        "flex w-full items-start rounded-[12px] px-3 py-2.5 text-left transition",
                        value === option.value
                          ? "bg-[#F5F8FF] text-[#1D4ED8]"
                          : "text-[#344054] hover:bg-[#F8FAFC]"
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block text-[14px] font-medium">${option.label}</span>
                        ${
                          option.description
                            ? html`
                                <span
                                  className=${classNames(
                                    "mt-0.5 block text-[12px] leading-5",
                                    value === option.value ? "text-[#5B7CE2]" : "text-[#667085]"
                                  )}
                                >
                                  ${option.description}
                                </span>
                              `
                            : null
                        }
                      </span>
                    </button>
                  `
                )}
              </div>
            `
          : null
      }
    </div>
  `
}

function UserComposerModal({
  isOpen,
  mode,
  companyName,
  draft,
  onDraftChange,
  onSubmit,
  onClose,
  emailError,
  feedback,
  feedbackTone,
  isBusy
}) {
  if (!isOpen) {
    return null
  }

  const selectedRole = getRoleMeta(draft.role)
  const isEditMode = mode === "edit"

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.42)] px-4 py-6 backdrop-blur-[2px] lg:pl-[220px]" onClick=${onClose}>
      <div
        className="w-full max-w-[980px] rounded-[22px] border border-[#D7E0EC] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        onClick=${(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F7] px-5 py-4">
          <div className="space-y-1">
            <p className="text-[18px] font-semibold text-[#101828]">
              ${isEditMode ? "Kullanici Bilgilerini Duzenle" : "Kullanici Ekle"}
            </p>
            <p className="text-[12px] text-[#667085]">${companyName}</p>
          </div>

          <button
            type="button"
            onClick=${onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[11px] border border-[#D0D5DD] bg-white text-[#344054] transition hover:bg-[#F9FAFB]"
            aria-label="Modal kapat"
          >
            <${CloseIcon} />
          </button>
        </div>

        <form onSubmit=${onSubmit} className="space-y-4 px-5 py-5">
          <div className="grid gap-3 lg:grid-cols-[0.8fr_0.8fr_1.2fr_0.85fr]">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                Ad
              </span>
              <input
                type="text"
                name="firstName"
                autoComplete="given-name"
                value=${draft.firstName}
                onInput=${(event) => onDraftChange("firstName", event.target.value)}
                placeholder="Ad"
                className="h-11 w-full rounded-[13px] border border-[#D5DBE5] bg-white px-4 text-[14px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF] placeholder:text-[#98A2B3]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                Soyad
              </span>
              <input
                type="text"
                name="lastName"
                autoComplete="family-name"
                value=${draft.lastName}
                onInput=${(event) => onDraftChange("lastName", event.target.value)}
                placeholder="Soyad"
                className="h-11 w-full rounded-[13px] border border-[#D5DBE5] bg-white px-4 text-[14px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF] placeholder:text-[#98A2B3]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                E-posta
              </span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value=${draft.email}
                onInput=${(event) => onDraftChange("email", event.target.value)}
                placeholder="ornek@sirket.com"
                aria-invalid=${Boolean(emailError)}
                className=${classNames(
                  "h-11 w-full rounded-[13px] border bg-white px-4 text-[14px] text-[#101828] outline-none transition placeholder:text-[#98A2B3]",
                  emailError
                    ? "border-[#F04438] focus:border-[#F04438] focus:ring-4 focus:ring-[#FEE4E2]"
                    : "border-[#D5DBE5] focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
                )}
              />
              ${
                emailError
                  ? html`<span className="mt-2 block text-[12px] text-[#F04438]">${emailError}</span>`
                  : null
              }
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                Rol
              </span>
              <${MinimalSelectField}
                name="role"
                value=${draft.role}
                options=${roleOptions}
                onChange=${(nextValue) => onDraftChange("role", nextValue)}
              />
            </label>
          </div>

          <div className="flex flex-col gap-2 border-t border-[#EEF2F7] pt-3 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[12px] leading-5 text-[#667085]">
              ${selectedRole.label}: ${selectedRole.description}
            </p>
            ${
              feedback
                ? html`
                    <p className=${classNames("text-[12px] leading-5", getFeedbackClass(feedbackTone))}>
                      ${feedback}
                    </p>
                  `
                : null
            }
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick=${onClose}
              className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#D0D5DD] bg-white px-4 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
            >
              Vazgec
            </button>
            <button
              type="submit"
              disabled=${isBusy}
              className=${classNames(
                "inline-flex h-10 items-center justify-center rounded-[12px] px-5 text-[13px] font-semibold text-white transition",
                isBusy
                  ? "cursor-not-allowed bg-[#B8CCFF]"
                  : "bg-[linear-gradient(135deg,#2F6FED_0%,#1747B8_100%)] shadow-[0_10px_20px_rgba(47,111,237,0.22)] hover:translate-y-[-1px] hover:shadow-[0_14px_24px_rgba(47,111,237,0.24)]"
              )}
            >
              ${isBusy ? "Kaydediliyor..." : isEditMode ? "Degisiklikleri Kaydet" : "Kullaniciyi Olustur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
}

function CompanyHeader({ companyName, isCreatingCompany }) {
  return html`
    <header className="rounded-[22px] border border-[#DCE3EE] bg-[radial-gradient(circle_at_top_left,#FFFFFF_0%,#F7FAFF_45%,#F1F6FF_100%)] p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <span className="inline-flex h-8 items-center rounded-full border border-[#D5E2FF] bg-white/80 px-3 text-[12px] font-semibold text-[#285BD4]">
            Sirket ve Kullanici Onboarding
          </span>

          <span className="inline-flex h-9 items-center rounded-full border border-white/80 bg-white/85 px-3.5 text-[12px] font-semibold text-[#344054]">
            ${isCreatingCompany ? "Yeni sirket taslagi" : "Aktif sirket kaydi"}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-[#101828]">
            ${companyName}
          </h1>
          <p className="max-w-[720px] text-[13px] leading-6 text-[#526071]">
            Sirket adini, onboarding modelini ve gecis hizini ayni akista netlestirin. Kullanici
            hesaplari da tek listede olussun, erisim bilgileri ayni yerden yonetilsin.
          </p>
        </div>
      </div>
    </header>
  `
}

function CompanyProfileCard({
  companyDraft,
  onDraftChange,
  onSaveCompany,
  onStartEdit,
  onCancelEdit,
  feedback,
  feedbackTone,
  isCreatingCompany,
  isBusy,
  isEditing
}) {
  const onboardingMeta = getOnboardingMeta(companyDraft.onboardingType)
  const transitionMeta = getTransitionMeta(companyDraft.transitionType)

  return html`
    <section className="rounded-[22px] border border-[#F2F4F7] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-[18px] font-semibold text-[#101828]">Sirket Profili</h2>
            <p className="text-[13px] text-[#667085]">
              Sirket bilgisini once burada netlestirin; kullanici olusturma akisi bu bilgiyi baz alir.
            </p>
          </div>

          ${
            isEditing
              ? html`
                  <div className="flex flex-wrap items-center gap-2">
                    ${
                      isCreatingCompany
                        ? null
                        : html`
                            <button
                              type="button"
                              onClick=${onCancelEdit}
                              className="inline-flex h-11 items-center justify-center rounded-[12px] border border-[#D0D5DD] bg-white px-4 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
                            >
                              Vazgec
                            </button>
                          `
                    }
                    <button
                      type="button"
                      onClick=${onSaveCompany}
                      disabled=${isBusy}
                      className=${classNames(
                        "inline-flex h-11 items-center justify-center rounded-[12px] px-5 text-[13px] font-semibold text-white transition",
                        isBusy ? "cursor-not-allowed bg-[#B8CCFF]" : "bg-[#2F6FED] hover:bg-[#285FD0]"
                      )}
                    >
                      ${isCreatingCompany ? "Sirketi Hazirla" : "Kaydet"}
                    </button>
                  </div>
                `
              : html`
                  <${EditActionButton} label="Duzenle" onClick=${onStartEdit} />
                `
          }
        </div>

        <div className="overflow-visible">
          ${
            isEditing
              ? html`
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 py-3">
                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Sirket
                      </span>
                      <input
                        type="text"
                        name="companyName"
                        autoComplete="organization"
                        value=${companyDraft.name}
                        onInput=${(event) => onDraftChange("name", event.target.value)}
                        placeholder="Ornek: Ege Perakende Bordro Ekibi"
                        className="h-11 w-full rounded-[13px] border border-[#D5DBE5] bg-[#FCFCFD] px-4 text-[14px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#DCE8FF] placeholder:text-[#98A2B3]"
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Bolum
                      </span>
                      <${MinimalSelectField}
                        name="onboardingType"
                        options=${onboardingOptions}
                        value=${companyDraft.onboardingType}
                        onChange=${(nextValue) => onDraftChange("onboardingType", nextValue)}
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Gecis Modeli
                      </span>
                      <${MinimalSelectField}
                        name="transitionType"
                        options=${transitionOptions}
                        value=${companyDraft.transitionType}
                        onChange=${(nextValue) => onDraftChange("transitionType", nextValue)}
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Sorumlu
                      </span>
                      <${MinimalSelectField}
                        name="assignee"
                        options=${assigneeOptions}
                        value=${companyDraft.assignee}
                        onChange=${(nextValue) => onDraftChange("assignee", nextValue)}
                      />
                    </label>
                  </div>

                  <div className="border-t border-[#F2F4F7] my-4 pt-4">
                    <h3 className="text-[13px] font-semibold text-[#344054] mb-3">İmplementasyon Kapsamı ve Opsiyonel Aşamalar</h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <label className="block space-y-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                          Rapor Geliştirme ve Entegrasyon (G&E)
                        </span>
                        <${MinimalSelectField}
                          name="hasGE"
                          options=${[
                            { value: true, label: "Evet (Aktif)" },
                            { value: false, label: "Hayır (Opsiyonel / Pasif)" }
                          ]}
                          value=${companyDraft.hasGE}
                          onChange=${(nextValue) => onDraftChange("hasGE", nextValue)}
                        />
                      </label>

                      <label className="block space-y-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                          Muhasebe Rapor Kurulumu
                        </span>
                        <${MinimalSelectField}
                          name="hasAccountingReport"
                          options=${[
                            { value: true, label: "Evet (Aktif)" },
                            { value: false, label: "Hayır (Opsiyonel / Pasif)" }
                          ]}
                          value=${companyDraft.hasAccountingReport}
                          onChange=${(nextValue) => onDraftChange("hasAccountingReport", nextValue)}
                        />
                      </label>

                      <label className="block space-y-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                          Başlangıç Tarihi
                        </span>
                        <input
                          type="date"
                          name="startDate"
                          value=${companyDraft.startDate || ""}
                          onInput=${(event) => onDraftChange("startDate", event.target.value)}
                          className="h-12 w-full rounded-[14px] border border-[#D0D5DD] bg-[#FCFCFD] px-4 text-[14px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#DCE8FF]"
                        />
                      </label>
                    </div>
                  </div>
                `
              : html`
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 py-4 px-2">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Sirket
                      </span>
                      <p className="text-[15px] font-medium text-[#101828]">
                        ${companyDraft.name || "Sirket adi girilmedi"}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Bolum
                      </span>
                      <p className="text-[15px] font-medium text-[#101828]">
                        ${onboardingMeta.label}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Gecis Modeli
                      </span>
                      <p className="text-[15px] font-medium text-[#101828]">
                        ${transitionMeta.label}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Sorumlu
                      </span>
                      <p className="text-[15px] font-medium text-[#101828]">
                        ${companyDraft.assignee || "Sorumlu secilmedi"}
                      </p>
                    </div>
                  </div>

                `
          }
        </div>

        ${
          feedback
            ? html`
                <p className=${classNames("text-[13px]", getFeedbackClass(feedbackTone))}>
                  ${feedback}
                </p>
              `
            : null
        }
      </div>
    </section>
  `
}

function UserProvisionCard({
  feedback,
  feedbackTone,
  companyName,
  users,
  isBusy,
  isUserModalOpen,
  userModalMode,
  userModalDraft,
  emailError,
  onOpenCreateUserModal,
  onCloseUserModal,
  onUserModalDraftChange,
  onUserModalSubmit,
  onStartEditUser,
  onDeleteUser
}) {
  const [openCredentialsUserId, setOpenCredentialsUserId] = useState("")

  return html`
    <section className="rounded-[22px] border border-[#F2F4F7] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#101828]">
            Kullanici Yonetimi
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <${EditActionButton} label="Ekle" icon=${PlusIcon} onClick=${onOpenCreateUserModal} />
          </div>
        </div>

        ${
          feedback
            ? html`
                <div className="rounded-[14px] border border-[#EEF2F7] bg-[#FCFCFD] px-4 py-3">
                  <p className=${classNames("text-[12px] leading-5", getFeedbackClass(feedbackTone))}>
                    ${feedback}
                  </p>
                </div>
              `
            : null
        }

        <div className="overflow-visible border border-[#F2F4F7] rounded-xl bg-white shadow-[0_4px_18px_rgba(16,24,40,0.01)]">
          <div className="hidden grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_auto] gap-3 border-b border-[#F2F4F7] bg-[#FAFBFC] px-6 py-3.5 md:grid rounded-t-xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#98A2B3]">
              Ad Soyad
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#98A2B3]">
              Rol
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#98A2B3]">
              E-posta
            </span>
            <span className="text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-[#98A2B3]">
              Aksiyonlar
            </span>
          </div>

          ${
            users.length
              ? html`
                  <div className="divide-y divide-[#F2F4F7]">
                    ${users.map((user) => {
                      const roleMeta = getRoleMeta(user.role)
                      const isCredentialsOpen = openCredentialsUserId === user.id

                      return html`
                        <div key=${user.id} className="bg-white hover:bg-[#F9FAFB]/75 transition-colors">
                          <div className="grid gap-3 px-6 py-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_auto] md:items-center">
                            <div className="min-w-0">
                              <p className="truncate text-[14px] font-semibold text-[#101828]">
                                ${user.firstName} ${user.lastName}
                              </p>
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-normal text-[#475467]">
                                ${roleMeta.label}
                              </p>
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-normal text-[#475467]">
                                ${user.email}
                              </p>
                            </div>

                            <div className="relative flex items-center gap-1 md:justify-end">
                              ${
                                isCredentialsOpen
                                  ? html`
                                      <div className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-[248px] rounded-[14px] border border-[#D9E4FF] bg-white p-3 shadow-[0_16px_34px_rgba(15,23,42,0.12)]">
                                        <div className="absolute bottom-[-6px] right-6 h-3 w-3 rotate-45 border-b border-r border-[#D9E4FF] bg-white"></div>
                                        <p className="text-[12px] font-semibold text-[#101828]">
                                          Dakika Erisim Bilgileri
                                        </p>
                                        <div className="mt-2 space-y-2">
                                          <div className="rounded-[10px] bg-[#F8FAFC] px-3 py-2">
                                            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
                                              Kullanici Adi
                                            </span>
                                            <p className="mt-1 text-[13px] font-medium text-[#101828]">
                                              ${user.username}
                                            </p>
                                          </div>
                                          <div className="rounded-[10px] bg-[#F8FAFC] px-3 py-2">
                                            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
                                              Sifre
                                            </span>
                                            <p className="mt-1 text-[13px] font-medium text-[#101828]">
                                              ${user.password}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    `
                                  : null
                              }

                              <button
                                type="button"
                                title="Bilgileri goster"
                                aria-label="Bilgileri goster"
                                onClick=${() =>
                                  setOpenCredentialsUserId((current) => (current === user.id ? "" : user.id))}
                                className=${classNames(
                                  "relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                                  isCredentialsOpen
                                    ? "bg-[#EEF4FF] text-[#285BD4]"
                                    : "text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7]"
                                )}
                              >
                                <${EyeIcon} />
                              </button>

                              <a
                                href=${buildCredentialMailTo(user, companyName)}
                                title="Mail gonder"
                                aria-label="Mail gonder"
                                className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7] transition-all duration-200"
                              >
                                <${SendIcon} />
                              </a>

                              <button
                                type="button"
                                title="Duzenle"
                                aria-label="Duzenle"
                                onClick=${() => {
                                  setOpenCredentialsUserId((current) => (current === user.id ? "" : current))
                                  onStartEditUser(user)
                                }}
                                className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7] transition-all duration-200"
                              >
                                <${PencilIcon} />
                              </button>

                              <button
                                type="button"
                                title="Sil"
                                aria-label="Sil"
                                onClick=${() => onDeleteUser(user.id)}
                                className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#475467] hover:text-[#D92D20] hover:bg-[#FEF3F2] transition-all duration-200"
                              >
                                <${TrashIcon} />
                              </button>
                            </div>
                          </div>
                        </div>
                      `
                    })}
                  </div>
                `
              : null
          }

          ${
            !users.length
              ? html`
                  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F7FB] text-[#98A2B3]">
                      <${UsersIcon} />
                    </div>
                    <h3 className="text-[15px] font-semibold text-[#101828]">Henuz kullanici olusmadi</h3>
                    <p className="mt-2 max-w-[420px] text-[13px] leading-6 text-[#667085]">
                      Ilk kaydi duzenle aksiyonuyla actiginiz pencereden olusturdugunuzda erisim
                      bilgileri ve aksiyonlar burada listelenecek.
                    </p>
                  </div>
                `
              : null
          }
        </div>

        <${UserComposerModal}
          isOpen=${isUserModalOpen}
          mode=${userModalMode}
          companyName=${companyName}
          draft=${userModalDraft}
          onDraftChange=${onUserModalDraftChange}
          onSubmit=${onUserModalSubmit}
          onClose=${onCloseUserModal}
          emailError=${emailError}
          feedback=${feedbackTone === "success" ? "" : feedback}
          feedbackTone=${feedbackTone}
          isBusy=${isBusy}
        />
      </div>
    </section>
  `
}

function UserAccountCard({
  user,
  companyName,
  isEditing,
  editDraft,
  onEditChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete
}) {
  const statusMeta = getUserStatusMeta(user.status)

  if (isEditing) {
    return html`
      <article className="rounded-[22px] border border-[#DCE3EE] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <div className="space-y-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-[17px] font-semibold text-[#101828]">Kullaniciyi Duzenle</h3>
              <p className="text-[13px] text-[#667085]">
                Kullanici adi ve sifre korunur; ad, soyad, e-posta ve rol guncellenir.
              </p>
            </div>
            <span className="inline-flex h-8 items-center rounded-full border border-[#D5E2FF] bg-[#EEF4FF] px-3 text-[12px] font-semibold text-[#285BD4]">
              ${user.username}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-[#101828]">Ad</span>
              <input
                type="text"
                name="editFirstName"
                autoComplete="given-name"
                value=${editDraft.firstName}
                onInput=${(event) => onEditChange("firstName", event.target.value)}
                className="h-11 w-full rounded-[12px] border border-[#D0D5DD] px-4 text-[14px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-[#101828]">Soyad</span>
              <input
                type="text"
                name="editLastName"
                autoComplete="family-name"
                value=${editDraft.lastName}
                onInput=${(event) => onEditChange("lastName", event.target.value)}
                className="h-11 w-full rounded-[12px] border border-[#D0D5DD] px-4 text-[14px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-[#101828]">E-posta</span>
              <input
                type="email"
                name="editEmail"
                autoComplete="email"
                value=${editDraft.email}
                onInput=${(event) => onEditChange("email", event.target.value)}
                className="h-11 w-full rounded-[12px] border border-[#D0D5DD] px-4 text-[14px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-[#101828]">Rol</span>
              <select
                name="editRole"
                value=${editDraft.role}
                onChange=${(event) => onEditChange("role", event.target.value)}
                className="h-11 w-full rounded-[12px] border border-[#D0D5DD] bg-white px-4 text-[14px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
              >
                ${roleOptions.map(
                  (option) => html`
                    <option key=${option.value} value=${option.value}>${option.label}</option>
                  `
                )}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#F2F4F7] pt-4">
            <button
              type="button"
              onClick=${onCancelEdit}
              className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#D0D5DD] bg-white px-4 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
            >
              Vazgec
            </button>
            <button
              type="button"
              onClick=${() => onSaveEdit(user.id)}
              className="inline-flex h-10 items-center justify-center rounded-[10px] bg-[#2F6FED] px-4 text-[13px] font-semibold text-white transition hover:bg-[#285FD0]"
            >
              Degisiklikleri Kaydet
            </button>
          </div>
        </div>
      </article>
    `
  }

  return html`
    <article className="rounded-[22px] border border-[#E4EAF3] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[17px] font-semibold text-[#101828]">
              ${user.firstName} ${user.lastName}
            </h3>
            <${RoleBadge} role=${user.role} />
            <span
              className=${classNames(
                "inline-flex h-7 items-center rounded-full border px-2.5 text-[12px] font-semibold",
                statusMeta.badgeClass
              )}
            >
              ${statusMeta.label}
            </span>
          </div>

          <p className="text-[14px] text-[#667085]">${user.email}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href=${buildCredentialMailTo(user, companyName)}
            className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#D0D5DD] bg-white px-4 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
          >
            Mail Gonder
          </a>
          <button
            type="button"
            onClick=${() => onStartEdit(user)}
            className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#D0D5DD] bg-white px-4 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
          >
            Duzenle
          </button>
          <button
            type="button"
            onClick=${() => onDelete(user.id)}
            className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#F04438] bg-white px-4 text-[13px] font-semibold text-[#D92D20] transition hover:bg-[#FFF5F5]"
          >
            Sil
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-[16px] border border-[#EEF2F7] bg-[#FCFCFD] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
            Kullanici Adi
          </span>
          <p className="mt-2 font-mono text-[14px] font-semibold text-[#101828]">${user.username}</p>
        </div>

        <div className="rounded-[16px] border border-[#EEF2F7] bg-[#FCFCFD] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
            Sifre
          </span>
          <p className="mt-2 font-mono text-[14px] font-semibold text-[#101828]">${user.password}</p>
        </div>

        <div className="rounded-[16px] border border-[#EEF2F7] bg-[#FCFCFD] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">
            Sistem Sonucu
          </span>
          <p className="mt-2 text-[14px] font-semibold text-[#101828]">Dakika'dan alindi</p>
          <p className="mt-1 text-[12px] text-[#667085]">${user.createdAt || "-"}</p>
        </div>
      </div>
    </article>
  `
}

function UserAccountsSection({
  users,
  companyName,
  editingUserId,
  editingUserDraft,
  onEditDraftChange,
  onStartEditUser,
  onCancelEditUser,
  onSaveUserEdit,
  onDeleteUser,
  feedback,
  feedbackTone
}) {
  return html`
    <section className="rounded-[24px] border border-[#E4EAF3] bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-[19px] font-semibold text-[#101828]">Olusan Kullanici Hesaplari</h2>
            <p className="text-[14px] text-[#667085]">
              Her kullanici icin kullanici adi, sifre ve hazir mail aksiyonlari ayni kartta yonetilir.
            </p>
          </div>
          <span className="inline-flex h-9 items-center rounded-full border border-[#E4E7EC] bg-[#F8FAFC] px-3.5 text-[12px] font-semibold text-[#344054]">
            ${users.length} kullanici
          </span>
        </div>

        <p className=${classNames("text-[13px]", getFeedbackClass(feedbackTone))}>
          ${feedback || "Mail gonder aksiyonu alici adresini kullanicinin e-postasi ile otomatik doldurur."}
        </p>

        ${
          users.length
            ? html`
                <div className="space-y-4">
                  ${users.map(
                    (user) => html`
                      <${UserAccountCard}
                        key=${user.id}
                        user=${user}
                        companyName=${companyName}
                        isEditing=${editingUserId === user.id}
                        editDraft=${editingUserDraft}
                        onEditChange=${onEditDraftChange}
                        onStartEdit=${onStartEditUser}
                        onCancelEdit=${onCancelEditUser}
                        onSaveEdit=${onSaveUserEdit}
                        onDelete=${onDeleteUser}
                      />
                    `
                  )}
                </div>
              `
            : html`
                <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-6 py-14 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F7FB] text-[#98A2B3]">
                    <${UsersIcon} />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#101828]">Henuz kullanici olusmadi</h3>
                  <p className="mt-2 max-w-[520px] text-[14px] leading-6 text-[#667085]">
                    Sirket profilini hazirlayip yukaridaki formdan ilk kullaniciyi olusturdugunuzda
                    kullanici adi, sifre ve mail aksiyonlari burada listelenecek.
                  </p>
                </div>
              `
        }
      </div>
    </section>
  `
}

function MailTemplateCard({ companyName, sampleUser }) {
  const previewUser = sampleUser || {
    firstName: "[Ad]",
    email: "kullanici@sirket.com",
    username: "kullanici.adi",
    password: "Sdp!Ornek123"
  }

  return html`
    <section className="rounded-[24px] border border-[#E4EAF3] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-[18px] font-semibold text-[#101828]">Mail Sablonu</h2>
          <p className="text-[14px] text-[#667085]">
            Her karttaki "Mail Gonder" aksiyonu asagidaki icerigi varsayilan olarak acar.
          </p>
        </div>

        <div className="rounded-[18px] border border-[#EEF2F7] bg-[#FCFCFD] p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">Kime</p>
          <p className="mt-2 text-[14px] font-medium text-[#101828]">${previewUser.email}</p>

          <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">Konu</p>
          <p className="mt-2 text-[14px] font-medium text-[#101828]">
            SDP Implementasyon Modulu Kullanici Bilgileri
          </p>

          <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">Icerik</p>
          <div className="mt-2 whitespace-pre-wrap rounded-[14px] bg-white p-4 text-[13px] leading-6 text-[#475467]">
${`Merhaba ${previewUser.firstName},

Implementasyon sureclerinizi yoneteceginiz module ait giris bilgileriniz asagidadir.

Sirket: ${companyName}
Kullanici Adi: ${previewUser.username}
Sifre: ${previewUser.password}
Modul Linki: ${moduleAccessUrl}

Iyi calismalar.`}
          </div>
        </div>
      </div>
    </section>
  `
}

function ImplementationCircularProgress({ progress }) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return html`
    <div className="relative h-12 w-12">
      <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90">
        <circle cx="24" cy="24" r=${radius} fill="none" stroke="#E5E7EB" strokeWidth="6"></circle>
        <circle
          cx="24"
          cy="24"
          r=${radius}
          fill="none"
          stroke="#2563EB"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray=${circumference}
          strokeDashoffset=${offset}
        ></circle>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-[#101828]">
        %${progress}
      </div>
    </div>
  `
}

function ImplementationHeader({ progress }) {
  return html`
    <header className="flex items-start justify-between gap-6">
      <div className="space-y-3">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#101828]">
          Implementasyon Surecleri
        </h1>
        <p className="max-w-[760px] text-[14px] leading-6 text-[#667085]">
          Implementasyon surecindeki adimlari takip edebilir, gerekli dosyalari yukleyebilir ve
          implementasyon ekibi ile iletisim kurabilirsiniz.
        </p>
      </div>

      <div className="shrink-0">
        <${ImplementationCircularProgress} progress=${progress} />
      </div>
    </header>
  `
}

function CheckCircleIcon() {
  return html`<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 7L5 9.5L10.5 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>`
}

function ImplementationStep({ step, index, isSelected, isCompleted, isCurrent, onSelect }) {
  const isPending = !isCompleted && !isCurrent

  return html`
    <button
      type="button"
      onClick=${() => onSelect(step.id)}
      className="impl-step"
    >
      <div className=${classNames(
        "impl-step__circle",
        isCompleted ? "impl-step__circle--done" : "impl-step__circle--pending"
      )}>
        ${isCompleted ? html`<${CheckCircleIcon} />` : null}
      </div>

      <p className="impl-step__title">
        ${step.title}
      </p>

      ${step.planned ? html`<p className="impl-step__planned">Planned: ${step.planned}</p>` : null}

      ${isCompleted && step.completedDate
        ? html`<p className="impl-step__completed">Completed: ${step.completedDate}</p>`
        : !isCompleted && step.pendingLabel
          ? html`<p className="impl-step__pending-label">${step.pendingLabel}</p>`
          : null
      }
    </button>
  `
}

function ImplementationTimeline({ steps, activeStepId, onStepChange, progress }) {
  const completedCount = steps.filter((s) => s.status === "completed").length
  const n = steps.length
  // fill from center of first dot to center of last completed dot
  const fillPct = completedCount === 0 ? 0 : (completedCount - 1) / n * 100

  return html`
    <section className="impl-timeline">
      <div className="impl-timeline__track">
        <!-- grey base line -->
        <div className="impl-timeline__line impl-timeline__line--base"></div>
        <!-- green fill line -->
        <div
          className="impl-timeline__line impl-timeline__line--fill"
          style=${{ width: fillPct + "%" }}
        ></div>

        <div className="impl-timeline__steps">
          ${steps.map((step, index) => html`
            <${ImplementationStep}
              key=${step.id}
              step=${step}
              index=${index}
              isSelected=${step.id === activeStepId}
              isCompleted=${step.status === "completed"}
              isCurrent=${step.status === "in_progress"}
              onSelect=${onStepChange}
            />
          `)}
        </div>
      </div>
    </section>
  `
}

function ImplementationTaskCard({
  task,
  isOpen,
  onToggle,
  isDragActive,
  onFileSelected,
  onFileDropped,
  onDragStateChange
}) {
  const statusMeta = getImplementationTaskStatusMeta(task.status)
  const uploadCount = task.uploads.length
  const description = task.description || implementationTaskPlaceholderDescription

  return html`
    <article
      className=${classNames(
        "overflow-hidden rounded-[16px] border bg-[linear-gradient(180deg,#FFFFFF_0%,#FCFCFD_100%)] transition-all duration-200",
        isOpen
          ? "border-[#DCE3EE] shadow-[0_1px_2px_rgba(16,24,40,0.05),0_14px_32px_rgba(16,24,40,0.06)]"
          : "border-[#E6ECF3] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_20px_rgba(16,24,40,0.04)] hover:border-[#D6DEE8] hover:shadow-[0_1px_2px_rgba(16,24,40,0.05),0_12px_28px_rgba(16,24,40,0.06)]"
      )}
    >
      <button
        type="button"
        onClick=${onToggle}
        aria-expanded=${isOpen}
        className="w-full px-6 py-5 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-semibold text-[#101828]">${task.title}</h3>
                  ${
                    task.infoTooltip
                      ? html`
                          <span className="group relative inline-flex items-center">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#DDE3EA] bg-white text-[#98A2B3]">
                              <${InfoIcon} />
                            </span>
                            <span className="pointer-events-none absolute left-0 top-[calc(100%+10px)] z-10 w-[280px] translate-y-1 rounded-[10px] border border-[#E6ECF3] bg-white px-3 py-2 text-[12px] leading-5 text-[#667085] opacity-0 shadow-[0_12px_28px_rgba(16,24,40,0.08)] transition duration-150 group-hover:translate-y-0 group-hover:opacity-100">
                              ${task.infoTooltip}
                            </span>
                          </span>
                        `
                      : null
                  }
                </div>
                <p
                  className=${classNames(
                    "mt-2 max-w-[760px] text-[13px] text-[#667085]",
                    isOpen ? "leading-6" : "overflow-hidden text-ellipsis whitespace-nowrap"
                  )}
                >
                  ${description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className=${classNames(
                    "inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-[12px] font-medium",
                    statusMeta.badgeClass
                  )}
                >
                  ${statusMeta.label}
                </span>

                <span
                  className=${classNames(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white text-[#667085] transition",
                    isOpen ? "rotate-180" : ""
                  )}
                >
                  <${ChevronDownIcon} />
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 items-center rounded-full bg-[#F8FAFC] px-3 text-[12px] font-medium text-[#667085]">
                ${uploadCount} yuklenen dosya
              </span>
            </div>
          </div>
        </div>
      </button>

      ${
        isOpen
          ? html`
              <div className="space-y-3.5 border-t border-[#EEF2F7] px-6 pb-5 pt-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold text-[#101828]">Dosya Yukleme</p>
                  </div>

                  <label
                    onDragEnter=${() => onDragStateChange(task.id)}
                    onDragOver=${(event) => {
                      event.preventDefault()
                      onDragStateChange(task.id)
                    }}
                    onDragLeave=${(event) => {
                      if (event.currentTarget.contains(event.relatedTarget)) {
                        return
                      }

                      onDragStateChange("")
                    }}
                    onDrop=${(event) => onFileDropped(task.id, event)}
                    className=${classNames(
                      "group flex min-h-[84px] cursor-pointer items-center justify-between gap-4 rounded-[12px] border border-dashed px-4 py-3 transition",
                      isDragActive
                        ? "border-[#2F6FED] bg-[#F5F8FF]"
                        : "border-[#E5E7EB] bg-white hover:border-[#CBD5E1] hover:bg-[#FCFCFD]"
                    )}
                  >
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange=${(event) => onFileSelected(task.id, event)}
                    />

                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#F5F7FB] text-[#667085]">
                        <${UploadIcon} />
                      </span>

                      <div className="min-w-0">
                        <strong className="block text-[13px] font-semibold text-[#101828]">
                          Dosyanizi birakin veya secin
                        </strong>
                        <p className="mt-1 truncate text-[12px] text-[#667085]">
                          Guncel excel dosyasini yukleyin, gerekirse yeni versiyon ekleyin.
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex h-8 shrink-0 items-center rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#344054] transition group-hover:bg-[#F9FAFB]">
                      Dosya sec
                    </span>
                  </label>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold text-[#101828]">Yuklenen Dosyalar</p>
                    <span className="text-[12px] text-[#98A2B3]">${uploadCount} dosya</span>
                  </div>

                  ${
                    task.uploads.length
                      ? html`
                          <div className="space-y-3">
                            ${task.uploads.map(
                              (file) => html`
                                <div
                                  key=${file.id}
                                  className="flex flex-col gap-2.5 rounded-[10px] bg-[#F9FAFB] px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-[13px] font-medium text-[#101828]">
                                      ${file.name}
                                    </p>
                                    <p className="mt-1 text-[12px] text-[#667085]">
                                      Yuklenme tarihi: ${file.uploadedAt}
                                    </p>
                                  </div>

                                  <a
                                    href=${file.downloadUrl}
                                    download=${file.name}
                                    className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#344054] transition hover:bg-[#FFFFFF]"
                                  >
                                    Indir
                                  </a>
                                </div>
                              `
                            )}
                          </div>
                        `
                      : html`
                          <div className="rounded-[10px] bg-[#F9FAFB] px-4 py-3 text-[12px] text-[#667085]">
                            Henuz dosya yuklenmedi. Formatlari indirip guncel dosyanizi bu gorev
                            altindan ekleyebilirsiniz.
                          </div>
                        `
                  }
                </div>
              </div>
            `
          : null
      }
    </article>
  `
}

function ImplementationStepContent({
  activeStep,
  stepUpload,
  dragDocId,
  onFileSelected,
  onFileDropped,
  onDragStateChange,
  onSubmitForApproval
}) {
  const tpl = implementationStepTemplates[activeStep.id]
  const status = stepUpload ? stepUpload.status : "waiting"
  const submitted = stepUpload ? stepUpload.submitted : false
  const docs = stepUpload ? stepUpload.docs : {}
  const statusMeta = getImplementationTaskStatusMeta(status)

  const uploadedCount = Object.values(docs).filter(Boolean).length
  const canSubmit = !submitted && uploadedCount > 0
  const canUploadDoc = status !== "approved"

  const statusDot = {
    waiting:            "bg-[#D0D5DD]",
    uploaded:           "bg-[#93C5FD]",
    pending_approval:   "bg-[#F79009]",
    reviewing:          "bg-[#2F6FED]",
    revision_requested: "bg-[#F04438]",
    approved:           "bg-[#12B76A]"
  }[status] || "bg-[#D0D5DD]"

  return html`
    <section className="space-y-4">
      <div>
        <h2 className="text-[17px] font-semibold text-[#101828]">${tpl.title}</h2>
        <p className="mt-0.5 text-[13px] text-[#667085]">${tpl.description}</p>
      </div>

      <div className=${classNames(
        "rounded-[16px] border bg-white overflow-hidden",
        status === "revision_requested" ? "border-[#FEE4E2]"
        : status === "approved"         ? "border-[#ABEFC6]"
        : status === "pending_approval" ? "border-[#FDE68A]"
        : "border-[#E4E7EC]"
      )}>

        <!-- Card header: overall status -->
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[#F2F4F7]">
          <div className="flex items-center gap-2">
            <span className=${classNames("h-2 w-2 shrink-0 rounded-full", statusDot)}></span>
            <span className="text-[13px] font-semibold text-[#344054]">${tpl.title}</span>
          </div>
          <span className=${classNames(
            "inline-flex h-[22px] items-center rounded-full border px-2.5 text-[11px] font-medium",
            statusMeta.badgeClass
          )}>${statusMeta.label}</span>
        </div>

        <!-- Document rows -->
        <div className="divide-y divide-[#F2F4F7]">
          ${tpl.documents.map((doc) => {
            const docUpload = docs[doc.id] || null
            const isDragActive = dragDocId === doc.id

            return html`
              <div key=${doc.id} className="px-5 py-3.5">
                <!-- Top row: label + actions -->
                <div className="flex items-center gap-3">
                  <span className="w-[200px] shrink-0 text-[13px] font-semibold text-[#344054]">${doc.label}</span>

                  <!-- Uploaded file chip -->
                  ${docUpload ? html`
                    <div className="flex flex-1 items-center gap-1.5 min-w-0 rounded-[7px] border border-[#E4E7EC] bg-[#F9FAFB] px-2.5 py-1.5">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#12B76A" strokeWidth="1.3"/><path d="M4 7l2 2 4-4" stroke="#12B76A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <a href=${docUpload.downloadUrl} download=${docUpload.name} className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#344054] hover:text-[#2F6FED]" title=${docUpload.name}>${docUpload.name}</a>
                      <span className="shrink-0 text-[11px] text-[#98A2B3]">${docUpload.uploadedAt}</span>
                    </div>
                  ` : html`
                    <span className="flex-1 text-[12px] text-[#98A2B3]">Henuz yuklenmedi</span>
                  `}

                  <!-- Template download -->
                  <a
                    href=${doc.templateUrl}
                    download=${doc.templateName}
                    className="shrink-0 inline-flex items-center gap-1 rounded-[7px] border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#344054] transition hover:bg-[#F9FAFB]"
                  >
                    <${DownloadIcon} />
                    Sablon
                  </a>

                  <!-- Upload -->
                  ${canUploadDoc ? html`
                    <label
                      className=${classNames(
                        "shrink-0 inline-flex cursor-pointer items-center gap-1 rounded-[7px] border px-2.5 py-1.5 text-[12px] font-medium transition",
                        isDragActive
                          ? "border-[#2F6FED] bg-[#EFF4FF] text-[#2F6FED]"
                          : "border-[#2F6FED] bg-[#2F6FED] text-white hover:bg-[#2563CC]"
                      )}
                      onDragOver=${(e) => { e.preventDefault(); onDragStateChange(doc.id) }}
                      onDragLeave=${() => onDragStateChange("")}
                      onDrop=${(e) => { onDragStateChange(""); onFileDropped(doc.id, e) }}
                    >
                      <${UploadIcon} />
                      ${docUpload ? "Guncelle" : "Yukle"}
                      <input type="file" onChange=${(e) => onFileSelected(doc.id, e)} accept=".xls,.xlsx,.csv" className="hidden" />
                    </label>
                  ` : null}
                </div>

                <!-- Description -->
                ${doc.description ? html`
                  <p className="mt-1.5 pl-[0px] max-w-[680px] text-[12px] leading-[1.65] text-[#98A2B3]">${doc.description}</p>
                ` : null}
              </div>
            `
          })}
        </div>

        <!-- Footer: submit or status -->
        <div className="flex items-center justify-between gap-3 border-t border-[#F2F4F7] px-5 py-3">
          ${status === "revision_requested" ? html`
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1a5.5 5.5 0 100 11A5.5 5.5 0 006.5 1zM6.5 4v3.5M6.5 9h.007" stroke="#F04438" strokeWidth="1.4" strokeLinecap="round"/></svg>
              <p className="text-[12px] text-[#D92D20]">Revizyon talep edildi. Guncellenen dosyalari yukleyin ve tekrar onaya gonderin.</p>
            </div>
          ` : status === "approved" ? html`
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#067647" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-[12px] font-medium text-[#067647]">Tum belgeler implementasyon ekibi tarafindan onaylandi.</span>
            </div>
          ` : status === "pending_approval" ? html`
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#F79009" strokeWidth="1.3"/><path d="M7 4.5v3l1.5 1.5" stroke="#F79009" strokeWidth="1.3" strokeLinecap="round"/></svg>
              <span className="text-[12px] text-[#B54708]">${uploadedCount} dosya onaya gonderildi, implementasyon ekibi inceliyor.</span>
            </div>
          ` : uploadedCount > 0 ? html`
            <span className="text-[12px] text-[#98A2B3]">${uploadedCount} dosya yuklendi</span>
          ` : html`<span></span>`}

          ${canSubmit ? html`
            <button
              type="button"
              onClick=${onSubmitForApproval}
              className="shrink-0 inline-flex items-center gap-2 rounded-[9px] bg-[#101828] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#1D2939]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v8M7 1.5L4 4.5M7 1.5l3 3M1.5 10.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Onaya Gonder (${uploadedCount} dosya)
            </button>
          ` : submitted ? html`
            <span className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#667085]">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Gonderildi
            </span>
          ` : null}
        </div>
      </div>
    </section>
  `
}

function UploadIcon() {
  return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`
}

function ImplementationMessageFeed({ messages, draft, onDraftChange, onSend, companyName }) {
  const threadSubject = companyName ? `Starter Kit — ${companyName}` : "Starter Kit"

  function groupMessagesByDate(msgs) {
    const groups = []
    let currentDate = null
    let currentGroup = null
    msgs.forEach((msg) => {
      const dateLabel = msg.time ? msg.time.split(",")[0].trim() : "Bugun"
      if (dateLabel !== currentDate) {
        currentDate = dateLabel
        currentGroup = { date: dateLabel, items: [] }
        groups.push(currentGroup)
      }
      currentGroup.items.push(msg)
    })
    return groups
  }

  const groups = groupMessagesByDate(messages)

  return html`
    <section id="impl-message-feed" className="overflow-hidden rounded-[20px] border border-[#E4E7EC] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06),0_4px_16px_rgba(16,24,40,0.04)]">

      <!-- Thread header -->
      <div className="flex items-center justify-between border-b border-[#F2F4F7] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#EFF4FF]">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1.5 4a1 1 0 011-1h10a1 1 0 011 1v6a1 1 0 01-1 1H5l-3.5 2V4z" stroke="#2F6FED" strokeWidth="1.4" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-[#101828]">${threadSubject}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#12B76A]"></span>
              <span className="text-[12px] text-[#667085]">Aktif · Yanitlama suresi 1 is gunu</span>
            </div>
          </div>
        </div>
        <div className="flex -space-x-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EFF4FF] text-[9px] font-bold text-[#3538CD] ring-2 ring-white">DU</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F4F3FF] text-[9px] font-bold text-[#5925DC] ring-2 ring-white">SN</span>
        </div>
      </div>

      <!-- Thread body -->
      <div className="min-h-[220px] px-6 py-4">
        ${messages.length === 0 ? html`
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F2F4F7]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 4.5a1.5 1.5 0 011.5-1.5h11a1.5 1.5 0 011.5 1.5v7a1.5 1.5 0 01-1.5 1.5H5l-3 2V4.5z" stroke="#98A2B3" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </div>
            <p className="text-[13px] font-medium text-[#344054]">Henuz mesaj yok</p>
            <p className="mt-1 text-[12px] text-[#98A2B3]">Implementasyon ekibine ilk mesajinizi gonderin.</p>
          </div>
        ` : groups.map((group) => html`
          <div key=${group.date} className="mb-4">
            <!-- Date separator -->
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#F2F4F7]"></div>
              <span className="rounded-full border border-[#E4E7EC] bg-[#F9FAFB] px-2.5 py-0.5 text-[11px] font-medium text-[#98A2B3]">${group.date}</span>
              <div className="h-px flex-1 bg-[#F2F4F7]"></div>
            </div>

            <!-- Messages in this date group -->
            <div className="space-y-1">
              ${group.items.map((message) => {
                if (message.type === "system") {
                  return html`
                    <div key=${message.id} className="flex items-center gap-2 py-1.5 pl-11">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F2F4F7]">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v4l2.5 2.5" stroke="#98A2B3" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      </div>
                      <span className="text-[12px] text-[#667085]">${message.text}</span>
                      <span className="text-[11px] text-[#C8CEDE]">${message.time}</span>
                    </div>
                  `
                }

                const isImpl = message.type === "implementation"
                return html`
                  <div key=${message.id} className="group flex gap-3 rounded-[10px] px-2 py-2.5 transition hover:bg-[#F9FAFB]">
                    <!-- Avatar -->
                    <div className="relative shrink-0 mt-0.5">
                      <span className=${classNames(
                        "flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold",
                        isImpl ? "bg-[#EFF4FF] text-[#2F6FED]" : "bg-[#F4F3FF] text-[#5925DC]"
                      )}>${message.avatar || "?"}</span>
                      ${isImpl ? html`<span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white bg-[#12B76A]"></span>` : null}
                    </div>

                    <!-- Content -->
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-[#101828]">${message.author}</span>
                        ${isImpl ? html`<span className="inline-flex h-[18px] items-center rounded-full bg-[#EFF4FF] px-2 text-[10px] font-semibold text-[#2F6FED]">Implementasyon Ekibi</span>` : null}
                        <span className="text-[11px] text-[#98A2B3]">${message.time}</span>
                      </div>
                      <p className="mt-1 text-[13px] leading-[1.6] text-[#344054]">${message.text}</p>
                      ${message.starterKit ? html`
                        <a
                          href=${starterKitDownloadHref}
                          download="Starter-Kit.xls"
                          className="mt-2 inline-flex items-center gap-1.5 rounded-[7px] border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#344054] transition hover:bg-[#F9FAFB]"
                        >
                          <${DownloadIcon} />
                          Starter Kit Sablonunu Indir
                        </a>
                      ` : null}
                    </div>
                  </div>
                `
              })}
            </div>
          </div>
        `)}
      </div>

      <!-- Compose area -->
      <div className="border-t border-[#F2F4F7] px-6 py-4">
        <div className="flex gap-3 items-start">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4F3FF] text-[11px] font-bold text-[#5925DC]">SN</span>
          <div className="flex-1 rounded-[12px] border border-[#E4E7EC] bg-[#FCFCFD] focus-within:border-[#2F6FED] focus-within:shadow-[0_0_0_3px_rgba(47,111,237,0.08)] transition-all">
            <textarea
              rows="2"
              value=${draft}
              onInput=${(e) => onDraftChange(e.target.value)}
              onKeyDown=${(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend() } }}
              placeholder="Implementasyon ekibine mesaj yazin..."
              className="w-full resize-none bg-transparent px-4 pt-3 pb-1 text-[13px] text-[#101828] placeholder-[#98A2B3] outline-none"
            ></textarea>
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <span className="text-[11px] text-[#98A2B3]">Enter ile gonder, Shift+Enter ile alt satir</span>
              <button
                type="button"
                onClick=${onSend}
                disabled=${!draft.trim()}
                className=${classNames(
                  "inline-flex items-center gap-1.5 rounded-[8px] px-3.5 py-2 text-[12px] font-semibold transition",
                  draft.trim()
                    ? "bg-[#2F6FED] text-white hover:bg-[#2563CC]"
                    : "bg-[#F2F4F7] text-[#98A2B3] cursor-not-allowed"
                )}
              >
                <${SendIcon} />
                Gonder
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
}

function ImplementationChatPanel({ messages, draft, onDraftChange, onSend, onClose }) {
  return html`
    <aside className="ticket-panel">
      <div className="ticket-panel__header">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="ticket-panel__status-dot"></span>
            <h2 className="ticket-panel__title">Implementasyon Takibi</h2>
          </div>
          <p className="ticket-panel__subtitle">Ekip notlari ve surec kayitlari</p>
        </div>
        <button
          type="button"
          onClick=${onClose}
          className="ticket-panel__close"
          aria-label="Paneli kapat"
        >
          <${MinimizeIcon} />
        </button>
      </div>

      <div className="ticket-panel__feed">
        ${messages.map((message) => {
          if (message.type === "system") {
            return html`
              <div key=${message.id} className="ticket-event">
                <span className="ticket-event__dot"></span>
                <span className="ticket-event__text">${message.text}</span>
                <span className="ticket-event__time">${message.time}</span>
              </div>
            `
          }

          const isImpl = message.type === "implementation"
          return html`
            <div
              key=${message.id}
              className=${classNames("ticket-entry", isImpl ? "ticket-entry--impl" : "ticket-entry--client")}
            >
              <div className="ticket-entry__meta">
                <span className=${classNames("ticket-entry__avatar", isImpl ? "ticket-entry__avatar--impl" : "ticket-entry__avatar--client")}>
                  ${message.avatar || "?"}
                </span>
                <span className="ticket-entry__author">${message.author}</span>
                <span className="ticket-entry__time">${message.time}</span>
                ${message.isWelcome ? html`<span className="ticket-entry__badge">Hos Geldiniz</span>` : null}
              </div>
              <div className="ticket-entry__body">
                ${message.text}
                ${message.starterKit ? html`
                  <a
                    href=${starterKitDownloadHref}
                    download="Starter-Kit.xls"
                    className="ticket-entry__download"
                  >
                    <${DownloadIcon} />
                    <span>Starter Kit Sablonunu Indir</span>
                  </a>
                ` : null}
              </div>
            </div>
          `
        })}
      </div>

      <div className="ticket-panel__compose">
        <textarea
          rows="3"
          value=${draft}
          onInput=${(event) => onDraftChange(event.target.value)}
          placeholder="Implementasyon ekibine not birakin..."
          className="ticket-compose__input"
        ></textarea>
        <div className="ticket-compose__actions">
          <button
            type="button"
            onClick=${onSend}
            disabled=${!draft.trim()}
            className=${classNames(
              "ticket-compose__send",
              !draft.trim() && "ticket-compose__send--disabled"
            )}
          >
            <${SendIcon} />
            <span>Gonder</span>
          </button>
        </div>
      </div>
    </aside>
  `
}

function ImplementationChatLauncher({ onOpen }) {
  return html`
    <button
      type="button"
      onClick=${onOpen}
      className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-3 rounded-[14px] border border-[#D0D5DD] bg-white px-4 py-3 text-left shadow-[0_10px_24px_rgba(16,24,40,0.08)] transition hover:border-[#BFCBDE] hover:bg-[#FCFCFD]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F5F7FB] text-[#2F6FED]">
        <${MessageSquareIcon} />
      </span>
      <span className="flex flex-col">
        <span className="text-[13px] font-semibold text-[#101828]">Implementasyon Takibi</span>
        <span className="text-[12px] text-[#667085]">Notlari goruntule</span>
      </span>
    </button>
  `
}

function ImplementationScreen({ companyName }) {
  const [activeStepId, setActiveStepId] = useState(implementationBaseSteps[0].id)
  // stepUploads: stepId → { status, upload: null | { id, name, uploadedAt, downloadUrl } }
  const [stepUploads, setStepUploads] = useState(implementationStepUploadSeeds)
  const [dragStepId, setDragStepId] = useState("")
  const [messages, setMessages] = useState(implementationInitialMessages)
  const [chatDraft, setChatDraft] = useState("")

  const steps = useMemo(
    () => implementationBaseSteps.map((step) => {
      const upload = stepUploads[step.id]
      const status = upload ? upload.status : "waiting"
      return { ...step, uploadStatus: status }
    }),
    [stepUploads]
  )

  const completedCount = Object.values(stepUploads).filter((u) => u.status === "approved").length
  const overallProgress = Math.round((completedCount / implementationBaseSteps.length) * 100)
  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0]

  function appendSystemMessage(text) {
    setMessages((current) => [
      ...current,
      {
        id: `system-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: "system",
        text,
        time: formatChatTime()
      }
    ])
  }

  function handleDocUpload(stepId, docId, file) {
    if (!file) return
    const uploadEntry = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      uploadedAt: formatTimestamp(),
      downloadUrl: URL.createObjectURL(file)
    }
    setStepUploads((current) => ({
      ...current,
      [stepId]: {
        ...current[stepId],
        status: current[stepId].submitted ? current[stepId].status : "uploaded",
        docs: { ...current[stepId].docs, [docId]: uploadEntry }
      }
    }))
    appendSystemMessage(`${file.name} yuklendi.`)
  }

  function handleSubmitForApproval(stepId) {
    const step = stepUploads[stepId]
    const uploadedCount = Object.values(step.docs).filter(Boolean).length
    setStepUploads((current) => ({
      ...current,
      [stepId]: { ...current[stepId], status: "pending_approval", submitted: true }
    }))
    appendSystemMessage(`${uploadedCount} dosya onaya gonderildi.`)
  }

  function handleFileSelected(stepId, docId, e) {
    const file = e.target.files && e.target.files[0]
    handleDocUpload(stepId, docId, file)
    e.target.value = ""
  }

  function handleFileDropped(stepId, docId, e) {
    e.preventDefault()
    setDragStepId("")
    const file = e.dataTransfer.files && e.dataTransfer.files[0]
    handleDocUpload(stepId, docId, file)
  }

  function handleSendMessage() {
    if (!chatDraft.trim()) return
    setMessages((current) => [
      ...current,
      {
        id: `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: "client",
        author: "Selin Nas",
        avatar: "SN",
        text: chatDraft.trim(),
        time: formatChatTime()
      }
    ])
    setChatDraft("")
  }

  return html`
    <div className="space-y-8">
      <${ImplementationTimeline}
        steps=${steps}
        activeStepId=${activeStepId}
        onStepChange=${setActiveStepId}
        progress=${overallProgress}
      />

      <${ImplementationStepContent}
        activeStep=${activeStep}
        stepUpload=${stepUploads[activeStep.id]}
        dragDocId=${dragStepId}
        onFileSelected=${(docId, e) => handleFileSelected(activeStep.id, docId, e)}
        onFileDropped=${(docId, e) => handleFileDropped(activeStep.id, docId, e)}
        onDragStateChange=${setDragStepId}
        onSubmitForApproval=${() => handleSubmitForApproval(activeStep.id)}
      />

      <${ImplementationMessageFeed}
        messages=${messages}
        draft=${chatDraft}
        onDraftChange=${setChatDraft}
        onSend=${handleSendMessage}
        companyName=${companyName}
      />
    </div>
  `
}

function BuildingIcon() {
  return html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#98A2B3] mr-2.5 flex-shrink-0" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <line x1="9" y1="22" x2="9" y2="16"></line>
      <line x1="15" y1="22" x2="15" y2="16"></line>
      <line x1="9" y1="16" x2="15" y2="16"></line>
      <path d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm0 4h2v2H8v-2zm6-8h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"></path>
    </svg>
  `
}

function BranchIcon() {
  return html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#98A2B3] mr-2.5 flex-shrink-0" aria-hidden="true">
      <circle cx="18" cy="18" r="3"></circle>
      <circle cx="6" cy="6" r="3"></circle>
      <circle cx="6" cy="18" r="3"></circle>
      <path d="M18 15V9a4 4 0 0 0-4-4H9"></path>
      <line x1="6" y1="9" x2="6" y2="15"></line>
    </svg>
  `
}

function SLAScreen({
  companies,
  selectedCompany,
  onSelectCompany,
  onNavigate,
  selectedOnboardingType,
  setSelectedOnboardingType,
  selectedStatus,
  setSelectedStatus
}) {
  const steps = [
    { id: "system-setup", title: "Sistem Kurulumu", desc: "Starter Kit doldurulması, şirket ve işyeri verilerinin sisteme işlenmesi.", isOptional: false },
    { id: "parallel-cost", title: "Bordro Analiz Çalışmaları", desc: "Geçmiş dönem bordro datalarının doğrulanması ve paralelde hesaplama yapılması.", isOptional: false },
    { id: "implementation-report", title: "Rapor Geliştirme ve Entegrasyon (G&E)", desc: "Özel rapor tasarımları ve API/dosya entegrasyonu.", isOptional: true, field: "hasGE" },
    { id: "transition-call", title: "Muhasebe Rapor Kurulumu", desc: "Muhasebe fişi entegrasyonu, şablon eşleşmeleri ve masraf merkezleri.", isOptional: true, field: "hasAccountingReport" },
    { id: "integrations", title: "Live Hazırlıkları", desc: "Son kontrol testleri, banka ödeme dosyaları ve nihai onay süreçleri.", isOptional: false },
    { id: "operations-handover", title: "Canlıya Geçiş", desc: "Datassist operasyon ekiplerine devir ve ilk resmi bordronun üretilmesi.", isOptional: false }
  ]

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const onboardingMatch = selectedOnboardingType === "all" || company.onboardingType === selectedOnboardingType
      
      const isCompleted = company.currentStepIndex >= 6
      const statusValue = isCompleted ? "tamamlandi" : "devam_ediyor"
      const statusMatch = selectedStatus === "all" || statusValue === selectedStatus
      
      return onboardingMatch && statusMatch
    })
  }, [companies, selectedOnboardingType, selectedStatus])

  const stats = useMemo(() => {
    const todayStr = "2026-06-11"
    const today = new Date(todayStr)
    
    let totalComp = filteredCompanies.length
    let compliantCount = 0
    let completedDurationsSum = 0
    let completedCount = 0
    let criticalDelayCount = 0
    let totalClientDelay = 0
    let totalDatassistDelay = 0

    filteredCompanies.forEach(company => {
      const start = new Date(company.startDate || todayStr)
      const end = company.endDate ? new Date(company.endDate) : today
      const elapsedDays = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)))
      
      let targetDays = 25
      if (company.hasGE) targetDays += 10
      if (company.hasAccountingReport) targetDays += 5

      const isCompleted = company.currentStepIndex >= 6
      const isDelayed = elapsedDays > targetDays

      if (!isDelayed) {
        compliantCount++
      }

      if (isCompleted) {
        completedCount++
        completedDurationsSum += elapsedDays
      } else if (isDelayed) {
        criticalDelayCount++
      }

      if (company.delayLogs) {
        company.delayLogs.forEach(log => {
          if (log.type === "client") {
            totalClientDelay += log.days
          } else if (log.type === "datassist") {
            totalDatassistDelay += log.days
          }
        })
      }
    })

    const successRate = totalComp > 0 ? Math.round((compliantCount / totalComp) * 100) : 100
    const avgDuration = completedCount > 0 ? Math.round(completedDurationsSum / completedCount) : 25
    const totalDelay = totalClientDelay + totalDatassistDelay

    return {
      successRate,
      avgDuration,
      criticalDelayCount,
      totalClientDelay,
      totalDatassistDelay,
      totalDelay
    }
  }, [filteredCompanies])

  // Mod 1: Tüm Şirketler Genel SLA Dashboard
  if (!selectedCompany || selectedCompany.id === "all") {
    return html`
      <div className="space-y-8 max-w-[1400px] px-4 py-2">
        <!-- SLA Analiz Paneli Kartları -->
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- SLA Başarı Oranı -->
          <div className="bg-white border border-[#EAECF0] rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">SLA Başarı Oranı</span>
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-black text-[#101828]">${stats.successRate}%</span>
                <span className="text-[10px] text-[#027A48] font-bold bg-[#ECFDF3] border border-[#ABEFC6] px-2 py-0.5 rounded-md">Zamanında</span>
              </div>
              <span className="text-[11px] text-[#98A2B3] block">Hedeflenen süre içi tamamlanma</span>
            </div>
            <div className="w-12 h-12 bg-[#EFF8FF] text-[#1570EF] rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] select-none">speed</span>
            </div>
          </div>

          <!-- Ortalama Tamamlanma Süresi -->
          <div className="bg-white border border-[#EAECF0] rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">Ortalama Süre</span>
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-black text-[#101828]">${stats.avgDuration} Gün</span>
                <span className="text-[10px] text-[#175CD3] font-bold bg-[#EFF8FF] border border-[#D5E2FF] px-2 py-0.5 rounded-md">Fiili</span>
              </div>
              <span className="text-[11px] text-[#98A2B3] block">Canlıya geçiş süresi</span>
            </div>
            <div className="w-12 h-12 bg-[#F9F5FF] text-[#6941C6] rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] select-none">timer</span>
            </div>
          </div>

          <!-- Kritik Gecikmeler -->
          <div className="bg-white border border-[#EAECF0] rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">Kritik Gecikmeler</span>
              <div className="flex items-baseline gap-2">
                <span className=${classNames(
                  "text-[28px] font-black",
                  stats.criticalDelayCount > 0 ? "text-[#D92D20]" : "text-[#101828]"
                )}>${stats.criticalDelayCount} Firma</span>
                ${stats.criticalDelayCount > 0 && html`
                  <span className="text-[10px] text-[#B42318] font-bold bg-[#FEF3F2] border border-[#FEE4E2] px-2 py-0.5 rounded-md">Müdahale</span>
                `}
              </div>
              <span className="text-[11px] text-[#98A2B3] block">SLA hedefini aşan aktifler</span>
            </div>
            <div className="w-12 h-12 bg-[#FEF3F2] text-[#D92D20] rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] select-none">warning</span>
            </div>
          </div>

          <!-- Gecikme Dağılımı -->
          <div className="bg-white border border-[#EAECF0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">Gecikme Dağılımı</span>
              <div className="flex items-baseline gap-2">
                <span className="text-[24px] font-black text-[#344054]">${stats.totalDelay} Gün</span>
                <span className="text-[9.5px] text-[#667085] font-semibold">toplam gecikme</span>
              </div>
              
              <!-- Split Progress Bar -->
              ${stats.totalDelay > 0
                ? html`
                    <div className="w-full bg-[#EAECF0] h-1.5 rounded-full overflow-hidden flex mt-2">
                      <div 
                        className="bg-[#C4320A] h-full" 
                        style=${{ width: `${(stats.totalClientDelay / stats.totalDelay) * 100}%` }}
                        title="Müşteri Gecikmesi"
                      ></div>
                      <div 
                        className="bg-[#5925DC] h-full" 
                        style=${{ width: `${(stats.totalDatassistDelay / stats.totalDelay) * 100}%` }}
                        title="Datassist Gecikmesi"
                      ></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-[#667085] font-bold mt-1.5">
                      <span className="text-[#C4320A]">Müşteri: ${stats.totalClientDelay}g</span>
                      <span className="text-[#5925DC]">Datassist: ${stats.totalDatassistDelay}g</span>
                    </div>
                  `
                : html`
                    <div className="w-full bg-[#ECFDF3] h-1.5 rounded-full mt-2"></div>
                    <span className="text-[9.5px] text-[#027A48] font-bold block mt-1 select-none">Gecikme bulunmuyor.</span>
                  `
              }
            </div>
          </div>
        </div>

        <!-- Şirket SLA Listesi -->
        <div className="bg-white border border-[#EAECF0] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#EAECF0]">
            <h3 className="text-[16px] font-bold text-[#101828]">Firma SLA Durum Listesi</h3>
            <p className="text-[12px] text-[#667085] mt-1">Tüm firmaların implementasyon süreleri ve SLA başarı analizi.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#EAECF0] text-[11px] font-bold text-[#475467] uppercase tracking-wider">
                  <th className="px-6 py-3.5">Firma Adı</th>
                  <th className="px-6 py-3.5">Durum</th>
                  <th className="px-6 py-3.5">Bölüm / Onboarding</th>
                  <th className="px-6 py-3.5">Süreç İlerleme (SLA)</th>
                  <th className="px-6 py-3.5">Gecikme Sorumlusu</th>
                  <th className="px-6 py-3.5 text-right">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0] text-[13px]">
                ${filteredCompanies.map(company => {
                  const isCompleted = company.currentStepIndex >= 6
                  const end = company.endDate ? new Date(company.endDate) : new Date("2026-06-11")
                  const start = new Date(company.startDate || "2026-06-11")
                  const elapsedDays = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)))
                  
                  let targetDays = 25
                  if (company.hasGE) targetDays += 10
                  if (company.hasAccountingReport) targetDays += 5

                  const isDelayed = !isCompleted && (elapsedDays > targetDays)
                  const delayAmount = isDelayed ? (elapsedDays - targetDays) : 0

                  let clientDelay = 0
                  let datassistDelay = 0
                  if (company.delayLogs) {
                    company.delayLogs.forEach(log => {
                      if (log.type === "client") clientDelay += log.days
                      if (log.type === "datassist") datassistDelay += log.days
                    })
                  }

                  const elapsedPercent = Math.min(100, (elapsedDays / targetDays) * 100)

                  return html`
                    <tr key=${company.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#101828]">${company.name}</td>
                      <td className="px-6 py-4">
                        <span className=${classNames(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                          isCompleted
                            ? "border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]"
                            : isDelayed
                              ? "border-[#FDA29B] bg-[#FEF3F2] text-[#D92D20]"
                              : "border-[#D5E2FF] bg-[#EFF8FF] text-[#175CD3]"
                        )}>
                          ${isCompleted ? "Tamamlandı" : isDelayed ? "Gecikme" : "Devam Ediyor"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#475467]">${getOnboardingMeta(company.onboardingType).label}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 max-w-[200px]">
                          <div className="flex justify-between text-[11px] font-semibold text-[#344054]">
                            <span>${elapsedDays} / ${targetDays} Gün</span>
                            <span>${Math.round(elapsedPercent)}%</span>
                          </div>
                          <div className="w-full bg-[#EAECF0] h-1.5 rounded-full overflow-hidden">
                            <div 
                              className=${classNames(
                                "h-full rounded-full transition-all duration-300",
                                isDelayed ? "bg-[#D92D20]" : "bg-[#1570EF]"
                              )}
                              style=${{ width: `${elapsedPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        ${clientDelay === 0 && datassistDelay === 0
                          ? html`<span className="text-[#027A48] font-semibold text-[12px]">Gecikme Yok</span>`
                          : html`
                              <div className="flex flex-col text-[11px] gap-0.5 font-bold">
                                ${clientDelay > 0 && html`<span className="text-[#C4320A]">Müşteri: ${clientDelay}g</span>`}
                                ${datassistDelay > 0 && html`<span className="text-[#5925DC]">Datassist: ${datassistDelay}g</span>`}
                              </div>
                            `
                        }
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick=${() => onSelectCompany(company.id)}
                          className="inline-flex items-center gap-1 text-[12px] font-bold text-[#1570EF] hover:text-[#175CD3]"
                        >
                          Detaylı Analiz
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  `
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `
  }

  // Mod 2: Seçilen Şirket Detay SLA Görünümü
  const company = selectedCompany
  const isCompleted = company.currentStepIndex >= 6
  const end = company.endDate ? new Date(company.endDate) : new Date("2026-06-11")
  const start = new Date(company.startDate || "2026-06-11")
  const elapsedDays = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)))
  
  let targetDays = 25
  if (company.hasGE) targetDays += 10
  if (company.hasAccountingReport) targetDays += 5

  const isDelayed = !isCompleted && (elapsedDays > targetDays)
  const delayAmount = isDelayed ? (elapsedDays - targetDays) : 0

  let clientDelay = 0
  let datassistDelay = 0
  if (company.delayLogs) {
    company.delayLogs.forEach(log => {
      if (log.type === "client") clientDelay += log.days
      if (log.type === "datassist") datassistDelay += log.days
    })
  }

  const elapsedPercent = Math.min(100, (elapsedDays / targetDays) * 100)

  return html`
    <div className="space-y-6 max-w-[1400px] px-4 py-2">
      <!-- SLA Aşım Uyarısı -->
      ${isDelayed
        ? html`
            <div className="bg-[#FEF3F2] border border-[#FEE4E2] rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
              <span className="material-symbols-outlined text-[#D92D20] text-[24px] select-none mt-0.5">warning</span>
              <div className="space-y-1">
                <h4 className="text-[14px] font-bold text-[#B42318]">Kritik SLA Aşıldı</h4>
                <p className="text-[13px] text-[#D92D20] leading-relaxed">
                  Bu şirket için planlanan ${targetDays} günlük geçiş süresi aşılmıştır. Şu ana kadar <strong>${elapsedDays} gün</strong> geçmiştir ve <strong>${delayAmount} gün</strong> gecikme yaşanmaktadır.
                </p>
              </div>
            </div>
          `
        : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Sol Panel (7/12): Süreç Takvim Özeti -->
        <div className="lg:col-span-7 space-y-6">
          
          <!-- Süreç Takvim Özeti Başlığı ve Tarih Bilgileri -->
          <div className="bg-white border border-[#EAECF0] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">Başlangıç Tarihi</span>
              <span className="text-[16px] font-black text-[#101828] flex items-center gap-1.5">
                <span>📅</span>
                <span>${formatTurkishDate(company.startDate)}</span>
              </span>
            </div>
            <div className="hidden md:block w-px h-10 bg-[#EAECF0]"></div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">Hedef Canlıya Geçiş</span>
              <span className=${classNames("text-[18px] font-black flex items-center gap-1.5", isDelayed ? "text-[#D92D20]" : "text-[#1570EF]")}>
                <span>🚀</span>
                <span>${formatTurkishDate(getPhaseDeadlineValue(company.deadlines, "operations-handover"))}</span>
              </span>
            </div>
            <div className="hidden md:block w-px h-10 bg-[#EAECF0]"></div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">Planlanan SLA</span>
              <span className="text-[16px] font-black text-[#101828]">${targetDays} Gün</span>
            </div>
          </div>

          <!-- Timeline Stepper -->
          <div className="bg-white border border-[#EAECF0] rounded-2xl shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-[16px] font-bold text-[#101828]">Adım Adım Süreç Timeline'ı</h3>
              <p className="text-[12px] text-[#667085] mt-1">İmplementasyon adımlarının hedef tarihleri ve durumları.</p>
            </div>

            <div className="relative border-l-2 border-[#EAECF0] ml-3 pl-6 space-y-8 py-2">
              ${steps.map((step, idx) => {
                const isStepEnabled = (!step.isOptional) || (step.id === "implementation-report" ? company.hasGE : company.hasAccountingReport)
                const stepIsCompleted = isStepEnabled && (idx < company.currentStepIndex || isCompleted)
                const stepIsCurrent = isStepEnabled && idx === company.currentStepIndex && !isCompleted
                const stepIsUpcoming = isStepEnabled && idx > company.currentStepIndex && !isCompleted

                // Timeline markers
                let markerBg = "bg-[#F2F4F7] border-[#D0D5DD] text-[#475467]"
                let borderStyle = "border-solid"
                let statusBadge = html`<span className="text-[10px] text-[#475467] bg-[#F2F4F7] px-2 py-0.5 rounded-md font-bold">Beklemede</span>`

                if (!isStepEnabled) {
                  markerBg = "bg-[#F2F4F7] border-[#98A2B3] text-[#98A2B3]"
                  borderStyle = "border-dashed"
                  statusBadge = html`<span className="text-[10px] text-[#98A2B3] bg-[#F9FAFB] border border-[#EAECF0] px-2 py-0.5 rounded-md font-medium border-dashed select-none">Devre Dışı</span>`
                } else if (stepIsCompleted) {
                  markerBg = "bg-[#ECFDF3] border-[#ABEFC6] text-[#027A48]"
                  statusBadge = html`<span className="text-[10px] text-[#027A48] bg-[#ECFDF3] border border-[#ABEFC6] px-2 py-0.5 rounded-md font-bold">Tamamlandı</span>`
                } else if (stepIsCurrent) {
                  markerBg = "bg-[#EFF8FF] border-[#D5E2FF] text-[#1570EF] ring-4 ring-[#EFF8FF]"
                  statusBadge = html`<span className="text-[10px] text-[#1570EF] bg-[#EFF8FF] border border-[#D5E2FF] px-2 py-0.5 rounded-md font-bold">Devam Ediyor</span>`
                }

                const deadlineVal = getPhaseDeadlineValue(company.deadlines, step.id)

                return html`
                  <div key=${step.id} className="relative group">
                    <!-- Marker Dot -->
                    <span 
                      className=${classNames(
                        "absolute -left-[35px] top-0.5 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                        markerBg,
                        borderStyle
                      )}
                    >
                      ${stepIsCompleted ? html`✓` : (idx + 1)}
                    </span>
                    
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1 max-w-[420px]">
                        <h4 className=${classNames(
                          "text-[14px] font-bold text-[#101828]",
                          !isStepEnabled && "text-[#98A2B3] line-through"
                        )}>
                          ${step.title}
                        </h4>
                        <p className="text-[12.5px] text-[#667085] leading-relaxed">${step.desc}</p>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-1 mt-1 shrink-0">
                        ${statusBadge}
                        <span className="text-[11px] font-bold text-[#344054]">
                          ${isStepEnabled && deadlineVal ? `📅 ${formatTurkishDate(deadlineVal)}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                `
              })}
            </div>
          </div>
        </div>

        <!-- Sağ Panel (5/12): SLA Analiz ve Denetim Günlüğü -->
        <div className="lg:col-span-5 space-y-6">
          
          <!-- SLA & Süre Analizi -->
          <div className="bg-white border border-[#EAECF0] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-[16px] font-bold text-[#101828]">SLA & Süre Analizi</h3>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-[12px] font-semibold text-[#475467]">
                <span>İlerleme Oranı</span>
                <span className="text-[#101828] font-bold">${elapsedDays} / ${targetDays} Gün</span>
              </div>
              <div className="w-full bg-[#EAECF0] h-2.5 rounded-full overflow-hidden">
                <div 
                  className=${classNames(
                    "h-full rounded-full transition-all duration-300",
                    isDelayed ? "bg-[#D92D20]" : "bg-[#1570EF]"
                  )}
                  style=${{ width: `${elapsedPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-[#667085] font-semibold pt-1">
                <span>Başlangıçtan beri geçen süre:</span>
                <span className=${classNames("font-bold", isDelayed ? "text-[#D92D20]" : "text-[#101828]")}>${elapsedDays} Gün</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#667085] font-semibold">
                <span>Maksimum SLA Hedefi:</span>
                <span className="text-[#101828] font-bold">${targetDays} Gün</span>
              </div>
            </div>
          </div>

          <!-- Gecikme Dağılımı -->
          <div className="bg-white border border-[#EAECF0] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-[16px] font-bold text-[#101828]">Gecikme Dağılımı</h3>
            
            ${clientDelay === 0 && datassistDelay === 0
              ? html`
                  <div className="bg-[#F6FEF9] border border-[#D1FADF] rounded-xl p-4 text-center">
                    <span className="text-[13px] font-bold text-[#027A48]">Süreç Planlandığı Gibi İlerliyor</span>
                    <p className="text-[11px] text-[#027A48] mt-1">Herhangi bir gecikme logu bulunmamaktadır.</p>
                  </div>
                `
              : html`
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[24px] font-black text-[#D92D20]">${clientDelay + datassistDelay} Gün</span>
                      <span className="text-[10px] text-[#667085] font-semibold">toplam gecikme</span>
                    </div>

                    <div className="w-full bg-[#EAECF0] h-2.5 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-[#C4320A] h-full" 
                        style=${{ width: `${(clientDelay / (clientDelay + datassistDelay)) * 100}%` }}
                        title="Müşteri Gecikmesi"
                      ></div>
                      <div 
                        className="bg-[#5925DC] h-full" 
                        style=${{ width: `${(datassistDelay / (clientDelay + datassistDelay)) * 100}%` }}
                        title="Datassist Gecikmesi"
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[12px] pt-1">
                      <div className="p-3 bg-[#FEF3F2] border border-[#FEE4E2] rounded-xl space-y-0.5">
                        <span className="text-[10px] text-[#C4320A] font-bold uppercase block">Müşteri Sorumluluğunda</span>
                        <span className="text-[16px] font-bold text-[#C4320A]">${clientDelay} Gün</span>
                      </div>
                      <div className="p-3 bg-[#F5F8FF] border border-[#D5E2FF] rounded-xl space-y-0.5">
                        <span className="text-[10px] text-[#285BD4] font-bold uppercase block">Datassist Sorumluluğunda</span>
                        <span className="text-[16px] font-bold text-[#285BD4]">${datassistDelay} Gün</span>
                      </div>
                    </div>
                  </div>
                `
            }
          </div>

          <!-- Denetim Günlüğü Özeti (Audit Log) -->
          <div className="bg-white border border-[#EAECF0] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[16px] font-bold text-[#101828]">Gecikme Denetim Günlüğü</h3>
              <span className="text-[10px] font-bold bg-[#F2F4F7] text-[#475467] px-2 py-0.5 rounded-md">Son 5 Kayıt</span>
            </div>

            <div className="space-y-3">
              ${(company.delayLogs || []).length === 0
                ? html`
                    <div className="p-8 text-center text-[#667085] text-[12.5px] bg-[#F9FAFB] rounded-xl border border-dashed border-[#EAECF0]">
                      Henüz gecikme kaydı girilmedi.
                    </div>
                  `
                : company.delayLogs.slice(-5).reverse().map(log => {
                    const stepName = steps.find(s => s.id === log.step)?.title || log.step
                    return html`
                      <div key=${log.id} className="p-3 bg-[#F9FAFB] rounded-xl border border-[#EAECF0] space-y-1.5 text-[12px]">
                        <div className="flex justify-between items-start">
                          <span className=${classNames(
                            "px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[9px]",
                            log.type === "client" ? "bg-[#FEF3F2] text-[#B42318] border border-[#FEE4E2]" : "bg-[#F5F8FF] text-[#285BD4] border border-[#D5E2FF]"
                          )}>
                            ${log.type === "client" ? "Müşteri" : "Datassist"}
                          </span>
                          <span className="text-[#98A2B3] font-semibold text-[10px]">${log.createdAt || "11 Haz 2026"}</span>
                        </div>
                        <p className="font-bold text-[#101828]">${stepName}</p>
                        <p className="text-[#475467] leading-relaxed">${log.reason}</p>
                        <div className="font-bold text-[#344054] text-right text-[11px]">+${log.days} Gün Gecikme</div>
                      </div>
                    `
                  })
              }
            </div>
          </div>

          <!-- Yönlendirme Butonu -->
          <div className="pt-2">
            <button
              type="button"
              onClick=${() => {
                onNavigate("processes")
              }}
              className="w-full flex items-center justify-center gap-2 border border-[#D0D5DD] px-4 py-3.5 rounded-xl text-[13px] font-bold text-[#344054] shadow-sm bg-white hover:bg-[#F9FAFB] transition-all duration-200"
            >
              <span>Şirket Süreç Takvimine Git</span>
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `
}

function UserIcon() {
  return html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#98A2B3] mr-2.5 flex-shrink-0" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  `
}

function DashboardScreen({
  companies,
  onSelectCompany,
  onNavigate,
  selectedOnboardingType,
  setSelectedOnboardingType,
  selectedStatus,
  setSelectedStatus
}) {
  const displayNames = ["Kurulum", "Bordro", "G&E", "Muhasebe", "Live", "Canlı"]

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const onboardingMatch = selectedOnboardingType === "all" || company.onboardingType === selectedOnboardingType
      
      const isCompleted = company.currentStepIndex >= 6
      const statusValue = isCompleted ? "tamamlandi" : "devam_ediyor"
      const statusMatch = selectedStatus === "all" || statusValue === selectedStatus
      
      return onboardingMatch && statusMatch
    })
  }, [companies, selectedOnboardingType, selectedStatus])

  return html`
    <div className="space-y-8 max-w-[1400px] px-4 py-2">
      <!-- Şirket Kartları Grid Görünümü -->
      ${filteredCompanies.length === 0
        ? html`
            <div className="flex flex-col items-center justify-center py-16 text-center bg-[#F9FAFB] rounded-2xl border border-dashed border-[#EAECF0]">
              <p className="text-[14px] font-semibold text-[#344054]">Eşleşen şirket bulunamadı</p>
              <p className="text-[12px] text-[#667085] mt-1">Filtreleri değiştirerek tekrar aramayı deneyebilirsiniz.</p>
              <button
                type="button"
                onClick=${() => { setSelectedOnboardingType("all"); setSelectedStatus("all"); }}
                className="mt-4 text-[12px] font-semibold text-[#1570EF] hover:underline"
              >
                Filtreleri Temizle
              </button>
            </div>
          `
        : html`
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${filteredCompanies.map((company) => {
                const isCompleted = company.currentStepIndex >= 6
                const currentStepName = isCompleted 
                  ? "Canliya Gecis" 
                  : (implementationBaseSteps[company.currentStepIndex]?.title || "Sistem Kurulumu")
                
                // SLA Detay Hesaplamaları
                const end = company.endDate ? new Date(company.endDate) : new Date("2026-06-11")
                const start = new Date(company.startDate || "2026-06-11")
                const elapsedDays = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)))
                
                let targetDays = 25
                if (company.hasGE) targetDays += 10
                if (company.hasAccountingReport) targetDays += 5

                const isDelayed = !isCompleted && (elapsedDays > targetDays)

                let cardBorderClass = "border-[#EAECF0] hover:border-[#D5E2FF]"
                let statusTextClass = "text-[#1570EF]"
                let statusText = "Devam Ediyor"

                if (isCompleted) {
                  cardBorderClass = "border-[#ABEFC6] hover:border-[#A3F4BE]"
                  statusTextClass = "text-[#027A48]"
                  statusText = "Tamamlandı"
                } else if (isDelayed) {
                  statusTextClass = "text-[#D92D20]"
                  statusText = "Devam Ediyor – Gecikme"
                }

                // Pipeline stepper genisliği
                const completedWidth = isCompleted ? 100 : (Math.max(0, company.currentStepIndex) / 5) * 100

                return html`
                  <div 
                    key=${company.id}
                    className=${classNames(
                      "border rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)] transition-all duration-200 flex flex-col justify-between",
                      cardBorderClass
                    )}
                  >
                    <div>
                      <!-- Top Row: Name and Status Badge -->
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-[13px] font-bold text-[#101828] tracking-tight leading-tight select-none">
                          ${company.name}
                        </h2>
                        <span className=${classNames(
                          "inline-flex h-5 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap",
                          isCompleted
                            ? "border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]"
                            : isDelayed
                              ? "border-[#FDA29B] bg-[#FEF3F2] text-[#D92D20]"
                              : "border-[#D5E2FF] bg-[#EFF8FF] text-[#175CD3]"
                        )}>
                          ${statusText}
                        </span>
                      </div>

                      <!-- Info list directly on the card: Bölüm, Geçiş Modeli, Sorumlu -->
                      <div className="mt-3 mb-3 space-y-1.5">
                        <div className="flex items-center text-[11px]">
                          <${BuildingIcon} />
                          <span className="text-[#667085] font-medium mr-1.5">BÖLÜM:</span>
                          <span className="text-[#344054] font-semibold">${getOnboardingMeta(company.onboardingType).label}</span>
                        </div>
                        <div className="flex items-center text-[11px]">
                          <${BranchIcon} />
                          <span className="text-[#667085] font-medium mr-1.5">GEÇİŞ MODELİ:</span>
                          <span className="text-[#344054] font-semibold">${getTransitionMeta(company.transitionType).label}</span>
                        </div>
                        <div className="flex items-center text-[11px]">
                          <span className="flex items-center">
                            <${UserIcon} />
                          </span>
                          <span className="text-[#667085] font-medium mr-1.5">SORUMLU:</span>
                          <span className="text-[#344054] font-semibold">${company.assignee || "Belirtilmedi"}</span>
                        </div>
                      </div>

                      <!-- Pipeline Stepper -->
                      <div className="relative mt-5 mb-2 select-none px-4">
                        <!-- Stepper Base Line -->
                        <div className="absolute top-[5px] left-[28px] right-[28px] h-[1.5px] bg-[#EAECF0] rounded-full z-0"></div>
                        <!-- Stepper Completed Line -->
                        <div
                          className="absolute top-[5px] left-[28px] h-[1.5px] bg-[#12B76A] rounded-full z-0 transition-all duration-300"
                          style=${{ width: `${isCompleted ? "calc(100% - 56px)" : `calc(${completedWidth}% - ${(completedWidth / 100) * 56}px)`}` }}
                        ></div>

                        <div className="flex justify-between items-center relative z-10">
                          ${implementationBaseSteps.map((step, idx) => {
                            const isStepEnabled = (idx === 0 || idx === 1 || idx === 4 || idx === 5) || (idx === 2 ? company.hasGE : company.hasAccountingReport)
                            const stepIsCompleted = isStepEnabled && (idx < company.currentStepIndex || isCompleted)
                            const stepIsCurrent = isStepEnabled && idx === company.currentStepIndex && !isCompleted
                            const label = displayNames[idx]

                            return html`
                              <div key=${step.id} className="flex flex-col items-center flex-1">
                                ${isStepEnabled
                                  ? html`
                                      <div className=${classNames(
                                        "w-[10px] h-[10px] rounded-full z-10 transition-colors duration-200 border-[1.5px]",
                                        stepIsCompleted 
                                          ? "bg-[#12B76A] border-[#12B76A]" 
                                          : stepIsCurrent
                                            ? "bg-white border-[#1570EF] ring-4 ring-[#EFF8FF]"
                                            : "bg-white border-[#D0D5DD]"
                                      )}></div>
                                    `
                                  : html`
                                      <div 
                                        className="w-[10px] h-[10px] rounded-full z-10 bg-[#F2F4F7] border border-dashed border-[#98A2B3] flex items-center justify-center cursor-help"
                                        title="Bu adım şirket profilinde devre dışı bırakılmış (Opsiyonel)"
                                      >
                                        <span className="w-1 h-1 rounded-full bg-[#98A2B3]"></span>
                                      </div>
                                    `
                                }
                                <span className=${classNames(
                                  "mt-1.5 text-[9.5px] font-semibold text-center transition-colors duration-200",
                                  !isStepEnabled
                                    ? "text-[#98A2B3] line-through decoration-1"
                                    : stepIsCompleted ? "text-[#344054]" : "text-[#98A2B3]"
                                )}>
                                  ${label}
                                </span>
                              </div>
                            `
                          })}
                        </div>
                      </div>
                    </div>

                    <!-- Footer Row: Current Step and Detail Action Button -->
                    <div className="flex items-center justify-between border-t border-[#F2F4F7] pt-4 mt-5">
                      <div className="text-[12px] text-[#344054]">
                        <span className="font-bold text-[#101828]">${currentStepName}</span>
                        <span className="text-[#98A2B3] mx-2">—</span>
                        <span className=${classNames("font-bold", statusTextClass)}>
                          ${statusText}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick=${() => {
                          onSelectCompany(company.id)
                          onNavigate("processes")
                        }}
                        className="inline-flex items-center gap-1 border border-[#D0D5DD] px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-[#344054] shadow-sm bg-white hover:bg-[#F9FAFB] transition-all duration-200 group"
                      >
                        <span>Detay</span>
                        <svg className="w-3.5 h-3.5 text-[#344054] transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                `
              })}
            </div>
          `
      }
    </div>
  `
}

function BandPill({ active }) {
  if (active) {
    return html`<span style=${{fontSize:"12px",fontWeight:600,padding:"3px 10px",borderRadius:"999px",background:"var(--color-success-bg)",color:"var(--color-success)",border:"1px solid var(--color-success-border)",display:"inline-block"}}>● Aktif</span>`
  }
  return html`<span style=${{fontSize:"12px",fontWeight:600,padding:"3px 10px",borderRadius:"999px",background:"var(--color-surface-3)",color:"var(--color-text-2)",border:"1px solid var(--color-border)",display:"inline-block"}}>○ Pasif</span>`
}

function BandToggle({ value, onChange }) {
  return html`
    <div style=${{display:"flex",gap:"6px"}}>
      <button type="button" onClick=${() => onChange(true)}
        style=${{fontSize:"12px",fontWeight:600,padding:"3px 10px",borderRadius:"999px",cursor:"pointer",
          background: value ? "var(--color-success-bg)" : "var(--color-surface-3)",
          color: value ? "var(--color-success)" : "var(--color-text-2)",
          border: value ? "2px solid var(--color-success)" : "1px solid var(--color-border)"}}>
        ● Aktif
      </button>
      <button type="button" onClick=${() => onChange(false)}
        style=${{fontSize:"12px",fontWeight:600,padding:"3px 10px",borderRadius:"999px",cursor:"pointer",
          background: !value ? "var(--color-surface-3)" : "transparent",
          color: !value ? "var(--color-text-2)" : "var(--color-text-3)",
          border: !value ? "2px solid var(--color-border)" : "1px solid var(--color-border)"}}>
        ○ Pasif
      </button>
    </div>
  `
}

function CompanyCalendarView({ selectedCompany, onUpdateCompany }) {
  const [isBandEditing, setIsBandEditing] = useState(false)
  const [bandDraft, setBandDraft] = useState({ hasGE: true, hasAccountingReport: true })

  function startBandEdit() {
    setBandDraft({ hasGE: selectedCompany.hasGE, hasAccountingReport: selectedCompany.hasAccountingReport })
    setIsBandEditing(true)
  }

  function saveBandEdit() {
    onUpdateCompany({ ...selectedCompany, hasGE: bandDraft.hasGE, hasAccountingReport: bandDraft.hasAccountingReport })
    setIsBandEditing(false)
  }

  function cancelBandEdit() {
    setIsBandEditing(false)
  }

  if (!selectedCompany) {
    return html`
      <div className="bg-white border border-[#EAECF0] rounded-[16px] p-8 text-center shadow-sm">
        <p className="text-[14px] text-[#667085]">Lütfen takvimini görüntülemek için bir şirket seçin.</p>
      </div>
    `
  }

  const phases = [
    {
      id: "system-setup",
      number: "01",
      title: "Sistem Kurulumu",
      description: "Starter Kit doldurulması, şirket ve işyeri verilerinin sisteme işlenmesi.",
      inputLabel: "Starter Kit Gönderim Tarihi",
      outputLabel: "Starter Kit İşlenme Tarihi"
    },
    {
      id: "parallel-cost",
      number: "02",
      title: "Bordro Analiz Çalışmaları",
      description: "Geçmiş dönem bordro datalarının doğrulanması ve paralelde hesaplama yapılması.",
      inputLabel: "Bordro Datası Gönderim Tarihi",
      outputLabel: "Analiz Tamamlanma Tarihi"
    },
    {
      id: "implementation-report",
      number: "03",
      title: "Rapor Geliştirme ve Entegrasyon",
      description: "Özel rapor tasarımları ve API/dosya entegrasyonu.",
      inputLabel: "Rapor Talepleri Gönderim Tarihi",
      outputLabel: "Entegrasyon Tamamlanma Tarihi",
      isOptional: true,
      field: "hasGE"
    },
    {
      id: "transition-call",
      number: "04",
      title: "Muhasebe Rapor Kurulumu",
      description: "Muhasebe entegrasyonu için rapor şablonlarının kurulumu.",
      inputLabel: "Muhasebe Verisi Gönderim Tarihi",
      outputLabel: "Rapor Kurulum Tamamlanma Tarihi",
      isOptional: true,
      field: "hasAccountingReport"
    },
    {
      id: "integrations",
      number: "05",
      title: "Live Hazırlıkları",
      description: "Canlıya geçiş öncesi son kontroller ve hazırlık süreçleri.",
      inputLabel: "Hazırlık Dokümanları Gönderim Tarihi",
      outputLabel: "Kontrol Tamamlanma Tarihi"
    },
    {
      id: "operations-handover",
      number: "06",
      title: "Canlıya Geçiş",
      description: "Sistemin canlı ortama alınması.",
      outputLabel: "Go-Live Tarihi",
      isSingleColumn: true
    }
  ]

  const phaseColumns = phases.flatMap((phase) => {
    const isEnabled = !phase.isOptional || selectedCompany[phase.field]

    if (phase.isSingleColumn) {
      return [{
        id: `${phase.id}-output`,
        phaseId: phase.id,
        lane: "output",
        owner: "DATASSİST",
        flow: "OUTPUT",
        fieldLabel: phase.outputLabel,
        tone: "output",
        isGroupEnd: true,
        isEnabled
      }]
    }

    return [
      {
        id: `${phase.id}-input`,
        phaseId: phase.id,
        lane: "input",
        owner: "CLIENT",
        flow: "INPUT",
        fieldLabel: phase.inputLabel,
        tone: "input",
        isGroupEnd: false,
        isEnabled
      },
      {
        id: `${phase.id}-output`,
        phaseId: phase.id,
        lane: "output",
        owner: "DATASSİST",
        flow: "OUTPUT",
        fieldLabel: phase.outputLabel,
        tone: "output",
        isGroupEnd: true,
        isEnabled
      }
    ]
  })

  function handleDeadlineChange(phaseId, lane, value) {
    const updated = {
      ...selectedCompany,
      deadlines: setPhaseDeadlineValue(selectedCompany.deadlines, phaseId, lane, value)
    }
    onUpdateCompany(updated)
  }

  return html`
    <div className="calendar-phase-list">
      <div className="calendar-phase-list__intro">
        <h3 className="calendar-phase-list__title">İmplementasyon Süreç Takvimi</h3>
        <p className="calendar-phase-list__subtitle">Aşamalara ait hedef tamamlanma tarihlerini (deadline) buradan planlayabilirsiniz.</p>
      </div>

      <div style=${{background:"var(--color-surface-2)",border:"1px solid var(--color-border)",borderRadius:"var(--radius-md)",padding:"12px 20px",display:"flex",alignItems:"center",gap:"32px",marginBottom:"16px"}}>
        <div style=${{display:"flex",flexDirection:"column",gap:"3px"}}>
          <span style=${{fontSize:"10px",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:"var(--color-text-3)"}}>BAŞLANGIÇ TARİHİ</span>
          <span style=${{fontSize:"14px",fontWeight:600,color:"var(--color-text-1)"}}>${selectedCompany.startDate ? formatDateOnly(selectedCompany.startDate) : "Girilmedi"}</span>
        </div>
        <div style=${{width:"1px",alignSelf:"stretch",background:"var(--color-border)"}}></div>
        <div style=${{display:"flex",flexDirection:"column",gap:"3px"}}>
          <span style=${{fontSize:"10px",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:"var(--color-text-3)"}}>RAPOR GELİŞTİRME VE ENTEGRASYON</span>
          ${isBandEditing
            ? html`<${BandToggle} value=${bandDraft.hasGE} onChange=${(v) => setBandDraft({...bandDraft, hasGE: v})} />`
            : html`<${BandPill} active=${selectedCompany.hasGE} />`
          }
        </div>
        <div style=${{width:"1px",alignSelf:"stretch",background:"var(--color-border)"}}></div>
        <div style=${{display:"flex",flexDirection:"column",gap:"3px"}}>
          <span style=${{fontSize:"10px",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:"var(--color-text-3)"}}>MUHASEBE RAPOR KURULUMU</span>
          ${isBandEditing
            ? html`<${BandToggle} value=${bandDraft.hasAccountingReport} onChange=${(v) => setBandDraft({...bandDraft, hasAccountingReport: v})} />`
            : html`<${BandPill} active=${selectedCompany.hasAccountingReport} />`
          }
        </div>
        <div style=${{marginLeft:"auto",display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
          ${isBandEditing
            ? html`
                <button type="button" onClick=${cancelBandEdit}
                  style=${{fontSize:"13px",fontWeight:600,color:"var(--color-text-2)",background:"transparent",border:"1px solid var(--color-border)",borderRadius:"var(--radius-md)",padding:"6px 14px",cursor:"pointer"}}>
                  İptal
                </button>
                <button type="button" onClick=${saveBandEdit}
                  style=${{fontSize:"13px",fontWeight:600,color:"#fff",background:"var(--color-primary)",border:"none",borderRadius:"var(--radius-md)",padding:"6px 14px",cursor:"pointer"}}>
                  Kaydet
                </button>
              `
            : html`
                <button type="button" onClick=${startBandEdit}
                  style=${{display:"inline-flex",alignItems:"center",gap:"6px",fontSize:"13px",fontWeight:600,color:"var(--color-primary)",background:"transparent",border:"1px solid var(--color-primary)",borderRadius:"var(--radius-md)",padding:"6px 14px",cursor:"pointer"}}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L4.667 14H2v-2.667L11.333 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Düzenle
                </button>
              `
          }
        </div>
      </div>

      <div className="calendar-grid-legend">
        <span className="calendar-grid-legend__item">
          <span className="calendar-grid-legend__dot calendar-grid-legend__dot--client"></span>
          Client input akışı
        </span>
        <span className="calendar-grid-legend__item">
          <span className="calendar-grid-legend__dot calendar-grid-legend__dot--datassist"></span>
          Datassist output akışı
        </span>
      </div>

      <div className="calendar-grid-tableWrap">
        <table className="calendar-grid-table">
          <colgroup>
            <col className="calendar-grid-table__leftCol" />
            ${phaseColumns.map((column) => html`
              <col
                key=${`${column.id}-col`}
                className=${classNames(
                  "calendar-grid-table__phaseCol",
                  column.tone === "input" ? "calendar-grid-table__phaseCol--input" : "calendar-grid-table__phaseCol--output",
                  column.isGroupEnd && "calendar-grid-table__phaseCol--groupEnd",
                  !column.isEnabled && "calendar-grid-table__phaseCol--disabled"
                )}
              />
            `)}
          </colgroup>

          <tbody>
            <tr>
              <th className="calendar-grid-table__leftCell calendar-grid-table__leftCell--company">
                <div className="calendar-grid-table__companyName">${selectedCompany.name}</div>
              </th>
              ${phases.map((phase) => {
                const isEnabled = !phase.isOptional || selectedCompany[phase.field]
                return html`
                  <td
                    key=${`${phase.id}-title`}
                    colSpan=${phase.isSingleColumn ? 1 : 2}
                    className=${classNames("calendar-grid-table__titleCell", !isEnabled && "is-disabled")}
                  >
                    <div className="calendar-grid-table__titleWrap">
                      <div className="calendar-grid-table__phaseTitle">${phase.title}</div>
                    </div>
                    <div className="calendar-grid-table__phaseDesc">${phase.description}</div>
                  </td>
                `
              })}
            </tr>

            <tr>
              <th className="calendar-grid-table__leftCell calendar-grid-table__leftCell--meta">SORUMLU</th>
              ${phaseColumns.map((column) => html`
                <td
                  key=${`${column.id}-owner`}
                  className=${classNames(
                    "calendar-grid-table__ownerCell",
                    column.tone === "input" ? "calendar-grid-table__ownerCell--input" : "calendar-grid-table__ownerCell--output",
                    column.isGroupEnd && "is-group-end",
                    !column.isEnabled && "is-disabled"
                  )}
                >
                  ${column.owner}
                </td>
              `)}
            </tr>

            <tr>
              <th className="calendar-grid-table__leftCell calendar-grid-table__leftCell--meta">AKIŞ</th>
              ${phaseColumns.map((column) => html`
                <td
                  key=${`${column.id}-flow`}
                  className=${classNames(
                    "calendar-grid-table__flowCell",
                    column.isGroupEnd && "is-group-end",
                    !column.isEnabled && "is-disabled"
                  )}
                >
                  <span className=${classNames(
                    "calendar-grid-table__flowPill",
                    column.tone === "input" ? "calendar-grid-table__flowPill--input" : "calendar-grid-table__flowPill--output"
                  )}>
                    ${column.flow}
                  </span>
                </td>
              `)}
            </tr>

            <tr className="calendar-grid-table__dateRow">
              <th className="calendar-grid-table__leftCell calendar-grid-table__leftCell--date">HEDEF TARİH</th>
              ${phaseColumns.map((column) => html`
                <td
                  key=${`${column.id}-date`}
                  className=${classNames(
                    "calendar-grid-table__dateCell",
                    column.tone === "input" ? "calendar-grid-table__dateCell--input" : "calendar-grid-table__dateCell--output",
                    column.isGroupEnd && "is-group-end",
                    !column.isEnabled && "is-disabled"
                  )}
                >
                  <input
                    type="date"
                    value=${getPhaseDeadlineValue(selectedCompany.deadlines, column.phaseId, column.lane)}
                    onInput=${(e) => handleDeadlineChange(column.phaseId, column.lane, e.target.value)}
                    onChange=${(e) => handleDeadlineChange(column.phaseId, column.lane, e.target.value)}
                    className=${classNames("calendar-grid-table__dateInput", !isBandEditing && "calendar-grid-table__dateInput--readonly")}
                    disabled=${!column.isEnabled || !isBandEditing}
                  />
                </td>
              `)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
}

function AdminScreen({
  selectedCompany,
  companyDraft,
  isCreatingCompany,
  isEditingCompany,
  companyFeedback,
  companyFeedbackTone,
  onCompanyDraftChange,
  onStartCompanyEdit,
  onCancelCompanyEdit,
  onSaveCompany,
  userFeedback,
  userFeedbackTone,
  isProvisioningUser,
  isUserModalOpen,
  userModalMode,
  userModalDraft,
  emailError,
  onOpenCreateUserModal,
  onCloseUserModal,
  onUserModalDraftChange,
  onUserModalSubmit,
  onStartEditUser,
  onDeleteUser,
  onUpdateCompany
}) {
  const [activeSubTab, setActiveSubTab] = useState("info") // 'info' or 'calendar'
  const companyUsers = selectedCompany?.users || []
  const companyName = companyDraft.name.trim() || selectedCompany?.name || "Yeni Sirket Taslagi"

  return html`
    <div className="mx-auto w-full max-w-[1560px] space-y-6">
      <!-- Page Header & Title -->
      <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[24px] font-bold text-[#101828]">Şirket Yönetimi</h1>
        </div>
      </div>

      <!-- Nested SubTabs Navigation -->
      <div className="border-b border-[#EAECF0]">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            type="button"
            onClick=${() => setActiveSubTab("info")}
            className=${classNames(
              "whitespace-nowrap border-b-2 py-4 px-1 text-[14px] font-semibold transition-all duration-200",
              activeSubTab === "info"
                ? "border-[#2F6FED] text-[#2F6FED]"
                : "border-transparent text-[#667085] hover:border-[#D0D5DD] hover:text-[#344054]"
            )}
          >
            Şirket Bilgileri
          </button>
          <button
            type="button"
            onClick=${() => setActiveSubTab("calendar")}
            className=${classNames(
              "whitespace-nowrap border-b-2 py-4 px-1 text-[14px] font-semibold transition-all duration-200",
              activeSubTab === "calendar"
                ? "border-[#2F6FED] text-[#2F6FED]"
                : "border-transparent text-[#667085] hover:border-[#D0D5DD] hover:text-[#344054]"
            )}
          >
            Takvim
          </button>
        </nav>
      </div>

      <!-- SubTab Content View -->
      ${activeSubTab === "info"
        ? html`
            <div className="space-y-5">
              <${CompanyProfileCard}
                companyDraft=${companyDraft}
                onDraftChange=${onCompanyDraftChange}
                onSaveCompany=${onSaveCompany}
                onStartEdit=${onStartCompanyEdit}
                onCancelEdit=${onCancelCompanyEdit}
                feedback=${companyFeedback}
                feedbackTone=${companyFeedbackTone}
                isCreatingCompany=${isCreatingCompany}
                isBusy=${isProvisioningUser}
                isEditing=${isEditingCompany}
              />

              <${UserProvisionCard}
                feedback=${userFeedback}
                feedbackTone=${userFeedbackTone}
                companyName=${companyName}
                users=${companyUsers}
                isBusy=${isProvisioningUser}
                isUserModalOpen=${isUserModalOpen}
                userModalMode=${userModalMode}
                userModalDraft=${userModalDraft}
                emailError=${emailError}
                onOpenCreateUserModal=${onOpenCreateUserModal}
                onCloseUserModal=${onCloseUserModal}
                onUserModalDraftChange=${onUserModalDraftChange}
                onUserModalSubmit=${onUserModalSubmit}
                onStartEditUser=${onStartEditUser}
                onDeleteUser=${onDeleteUser}
              />
            </div>
          `
        : html`
            <${CompanyCalendarView}
              selectedCompany=${selectedCompany}
              onUpdateCompany=${onUpdateCompany}
            />
          `}
    </div>
  `
}

function App() {
  const [activePage, setActivePage] = useState("dashboard")
  const [selectedOnboardingType, setSelectedOnboardingType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [companies, setCompanies] = useState(seedCompanies)
  const [selectedCompanyId, setSelectedCompanyId] = useState(seedCompanies[0].id)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem("datassist-sidebar-collapsed") === "1"
    } catch (_) {
      return false
    }
  })
  const [companyDraft, setCompanyDraft] = useState(() => createCompanyDraftFromCompany(seedCompanies[0]))
  const [isCreatingCompany, setIsCreatingCompany] = useState(false)
  const [companyFeedback, setCompanyFeedback] = useState("")
  const [companyFeedbackTone, setCompanyFeedbackTone] = useState("neutral")
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [userDraft, setUserDraft] = useState(createEmptyUserDraft())
  const [editingUserId, setEditingUserId] = useState("")
  const [editingUserDraft, setEditingUserDraft] = useState(createEmptyUserDraft())
  const [isProvisioningUser, setIsProvisioningUser] = useState(false)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [userModalMode, setUserModalMode] = useState("create")
  const [emailError, setEmailError] = useState("")
  const [userFeedback, setUserFeedback] = useState("")
  const [userFeedbackTone, setUserFeedbackTone] = useState("neutral")

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) || null,
    [selectedCompanyId, companies]
  )

  function resetUserComposer() {
    setUserDraft(createEmptyUserDraft())
    setEmailError("")
  }

  function resetEditingState() {
    setEditingUserId("")
    setEditingUserDraft(createEmptyUserDraft())
  }

  function clearUserFeedback() {
    setUserFeedback("")
    setUserFeedbackTone("neutral")
  }

  function openCreateUserModal() {
    resetEditingState()
    setUserDraft(createEmptyUserDraft())
    setUserModalMode("create")
    setIsUserModalOpen(true)
    setEmailError("")
    clearUserFeedback()
  }

  function closeUserModal() {
    setIsUserModalOpen(false)
    setUserModalMode("create")
    resetUserComposer()
    resetEditingState()
    clearUserFeedback()
  }

  function handleSelectedCompanyChange(nextCompanyId) {
    if (nextCompanyId === "all") {
      setSelectedCompanyId("all")
      setIsCreatingCompany(false)
      setIsEditingCompany(false)
      setCompanyFeedback("")
      setCompanyFeedbackTone("neutral")
      closeUserModal()
      return
    }
    const nextCompany = companies.find((company) => company.id === nextCompanyId)

    if (!nextCompany) {
      return
    }

    setSelectedCompanyId(nextCompanyId)
    setCompanyDraft(createCompanyDraftFromCompany(nextCompany))
    setIsCreatingCompany(false)
    setIsEditingCompany(false)
    setCompanyFeedback("")
    setCompanyFeedbackTone("neutral")
    closeUserModal()
  }

  function handlePageChange(newPage) {
    if ((newPage === "processes" || newPage === "management") && selectedCompanyId === "all") {
      if (companies.length > 0) {
        setSelectedCompanyId(companies[0].id)
        setCompanyDraft(createCompanyDraftFromCompany(companies[0]))
      }
    }
    setActivePage(newPage)
  }

  function handleUpdateCompany(updatedCompany) {
    setCompanies((current) =>
      current.map((company) => (company.id === updatedCompany.id ? updatedCompany : company))
    )
    if (updatedCompany.id === selectedCompanyId) {
      setCompanyDraft(createCompanyDraftFromCompany(updatedCompany))
    }
  }

  function handleCreateNewCompany() {
    setActivePage("management")
    setSelectedCompanyId("")
    setCompanyDraft(createEmptyCompanyDraft())
    setIsCreatingCompany(true)
    setIsEditingCompany(true)
    setCompanyFeedback("Yeni sirket taslagini doldurup onboarding modelini secin.")
    setCompanyFeedbackTone("neutral")
    closeUserModal()
  }

  function handleStartCompanyEdit() {
    setIsEditingCompany(true)
    setCompanyFeedback("")
    setCompanyFeedbackTone("neutral")
  }

  function handleCancelCompanyEdit() {
    if (selectedCompany) {
      setCompanyDraft(createCompanyDraftFromCompany(selectedCompany))
      setIsEditingCompany(false)
      setCompanyFeedback("")
      setCompanyFeedbackTone("neutral")
    }
  }

  function handleSidebarToggle() {
    setIsSidebarCollapsed((current) => {
      const next = !current
      try {
        window.localStorage.setItem("datassist-sidebar-collapsed", next ? "1" : "0")
      } catch (_) {}
      return next
    })
  }

  function handleCompanyDraftChange(field, value) {
    setCompanyDraft((current) => ({
      ...current,
      [field]: value
    }))

    if (companyFeedback) {
      setCompanyFeedback("")
      setCompanyFeedbackTone("neutral")
    }
  }

  function handleUserDraftChange(field, value) {
    setUserDraft((current) => ({
      ...current,
      [field]: value
    }))

    if (field === "email" && emailError) {
      setEmailError("")
    }

    if (userFeedback) {
      clearUserFeedback()
    }
  }

  function handleEditDraftChange(field, value) {
    setEditingUserDraft((current) => ({
      ...current,
      [field]: value
    }))

    if (userFeedback) {
      clearUserFeedback()
    }
  }

  function hasDuplicateEmail(company, email, ignoreUserId = "") {
    return (company?.users || []).some(
      (user) => user.id !== ignoreUserId && user.email.toLowerCase() === email.toLowerCase()
    )
  }

  function persistCompanyDraft({ announce = true } = {}) {
    const normalizedName = companyDraft.name.trim()

    if (!normalizedName) {
      if (announce) {
        setCompanyFeedback("Sirket adi girmeden devam edemezsiniz.")
        setCompanyFeedbackTone("error")
      }

      return null
    }

    const normalizedDraft = {
      name: normalizedName,
      onboardingType: companyDraft.onboardingType,
      transitionType: companyDraft.transitionType,
      assignee: companyDraft.assignee,
      hasGE: companyDraft.hasGE,
      hasAccountingReport: companyDraft.hasAccountingReport,
      startDate: companyDraft.startDate,
      deadlines: normalizePhaseDeadlines(companyDraft.deadlines)
    }

    if (isCreatingCompany || !selectedCompany) {
      const newCompany = {
        id: `company-${Date.now()}`,
        ...normalizedDraft,
        delayLogs: [],
        users: []
      }

      setCompanies((current) => [newCompany, ...current])
      setSelectedCompanyId(newCompany.id)
      setCompanyDraft(createCompanyDraftFromCompany(newCompany))
      setIsCreatingCompany(false)

      if (announce) {
        setCompanyFeedback(`"${newCompany.name}" sirketi hazirlandi.`)
        setCompanyFeedbackTone("success")
      }

      return newCompany
    }

    // Otomatik Denetim Günlüğü Mantığı (Audit Logging)
    let extraLogs = []
    
    // G&E Geçişi: Hayır -> Evet (Sonradan eklendi)
    if (selectedCompany.hasGE === false && companyDraft.hasGE === true) {
      extraLogs.push({
        id: `dl-auto-${Date.now()}-ge`,
        type: "client",
        step: "implementation-report",
        days: 10,
        reason: "Müşterinin eksik analiz bildiriminden dolayı süreç ortasında Rapor Geliştirme ve Entegrasyon (G&E) adımı eklendi.",
        createdAt: "2026-06-11"
      })
    }
    
    // Muhasebe Geçişi: Hayır -> Evet (Sonradan eklendi)
    if (selectedCompany.hasAccountingReport === false && companyDraft.hasAccountingReport === true) {
      extraLogs.push({
        id: `dl-auto-${Date.now()}-acc`,
        type: "client",
        step: "transition-call",
        days: 5,
        reason: "Müşterinin eksik analiz bildiriminden dolayı süreç ortasında Muhasebe Rapor Kurulumu adımı eklendi.",
        createdAt: "2026-06-11"
      })
    }

    // Evet -> Hayır geçişinde tarihleri temizleyelim
    if (companyDraft.hasGE === false) {
      normalizedDraft.deadlines = clearPhaseDeadlineValues(normalizedDraft.deadlines, "implementation-report")
    }
    if (companyDraft.hasAccountingReport === false) {
      normalizedDraft.deadlines = clearPhaseDeadlineValues(normalizedDraft.deadlines, "transition-call")
    }

    const updatedCompany = {
      ...selectedCompany,
      ...normalizedDraft,
      delayLogs: [...(selectedCompany.delayLogs || []), ...extraLogs]
    }

    setCompanies((current) =>
      current.map((company) => (company.id === updatedCompany.id ? updatedCompany : company))
    )
    setCompanyDraft(createCompanyDraftFromCompany(updatedCompany))

    if (announce) {
      setCompanyFeedback(`"${updatedCompany.name}" sirket bilgileri guncellendi.`)
      setCompanyFeedbackTone("success")
    }

    return updatedCompany
  }

  function handleSaveCompany() {
    const resolvedCompany = persistCompanyDraft({ announce: true })
    if (resolvedCompany) {
      setIsEditingCompany(false)
    }
  }

  async function handleProvisionUser(event) {
    event.preventDefault()

    const firstName = userDraft.firstName.trim()
    const lastName = userDraft.lastName.trim()
    const email = userDraft.email.trim()

    if (!firstName || !lastName || !email) {
      setUserFeedback("Ad, soyad ve e-posta alanlari doldurulmalidir.")
      setUserFeedbackTone("error")
      return
    }

    if (!isValidEmail(email)) {
      setEmailError("Gecerli bir e-posta adresi girin.")
      setUserFeedbackTone("error")
      return
    }

    const resolvedCompany = persistCompanyDraft({ announce: isCreatingCompany })

    if (!resolvedCompany) {
      return
    }

    setIsEditingCompany(false)

    if (hasDuplicateEmail(resolvedCompany, email)) {
      setEmailError("Bu e-posta adresi secili sirket icinde zaten bulunuyor.")
      setUserFeedbackTone("error")
      return
    }

    setIsProvisioningUser(true)
    setUserFeedback(`${firstName} ${lastName} icin Dakika tarafina hesap acma istegi gonderildi.`)
    setUserFeedbackTone("neutral")

    try {
      const credentials = await provisionUserInDakika({
        firstName,
        lastName,
        email,
        role: userDraft.role
      })

      const nextUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        firstName,
        lastName,
        email,
        role: userDraft.role,
        username: credentials.username,
        password: credentials.password,
        status: "credentials_ready",
        createdAt: formatTimestamp()
      }

      setCompanies((current) =>
        current.map((company) =>
          company.id === resolvedCompany.id
            ? { ...company, users: [nextUser, ...(company.users || [])] }
            : company
        )
      )

      setSelectedCompanyId(resolvedCompany.id)
      setCompanyDraft(createCompanyDraftFromCompany(resolvedCompany))
      resetUserComposer()
      resetEditingState()
      setIsUserModalOpen(false)
      setUserModalMode("create")
      setUserFeedback(`${firstName} ${lastName} icin kullanici adi ve sifre Dakika'dan alindi.`)
      setUserFeedbackTone("success")
    } catch (_) {
      setUserFeedback("Kullanici olusturma sirasinda bir hata olustu.")
      setUserFeedbackTone("error")
    } finally {
      setIsProvisioningUser(false)
    }
  }

  function handleStartEditUser(user) {
    setEditingUserId(user.id)
    setEditingUserDraft({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    })
    setUserModalMode("edit")
    setIsUserModalOpen(true)
    setEmailError("")
    clearUserFeedback()
  }

  function handleUserModalDraftChange(field, value) {
    if (userModalMode === "edit") {
      handleEditDraftChange(field, value)
      return
    }

    handleUserDraftChange(field, value)
  }

  function handleUserModalSubmit(event) {
    if (userModalMode === "edit") {
      event.preventDefault()
      handleSaveUserEdit(editingUserId)
      return
    }

    handleProvisionUser(event)
  }

  function handleSaveUserEdit(userId) {
    if (!selectedCompany) {
      return
    }

    const firstName = editingUserDraft.firstName.trim()
    const lastName = editingUserDraft.lastName.trim()
    const email = editingUserDraft.email.trim()

    if (!firstName || !lastName || !email) {
      setUserFeedback("Duzenleme icin ad, soyad ve e-posta alanlari doldurulmalidir.")
      setUserFeedbackTone("error")
      return
    }

    if (!isValidEmail(email)) {
      setUserFeedback("Gecerli bir e-posta adresi girin.")
      setUserFeedbackTone("error")
      return
    }

    if (hasDuplicateEmail(selectedCompany, email, userId)) {
      setUserFeedback("Bu e-posta adresi secili sirket icinde zaten bulunuyor.")
      setUserFeedbackTone("error")
      return
    }

    setCompanies((current) =>
      current.map((company) =>
        company.id === selectedCompany.id
          ? {
              ...company,
              users: (company.users || []).map((user) =>
                user.id === userId
                  ? {
                      ...user,
                      firstName,
                      lastName,
                      email,
                      role: editingUserDraft.role
                    }
                  : user
              )
            }
          : company
      )
    )

    setIsUserModalOpen(false)
    setUserModalMode("create")
    resetEditingState()
    setEmailError("")
    setUserFeedback("Kullanici bilgileri guncellendi.")
    setUserFeedbackTone("success")
  }

  function handleDeleteUser(userId) {
    if (!selectedCompany) {
      return
    }

    const user = (selectedCompany.users || []).find((item) => item.id === userId)

    if (user && !window.confirm(`${user.firstName} ${user.lastName} kullanicisini silmek istiyor musunuz?`)) {
      return
    }

    setCompanies((current) =>
      current.map((company) =>
        company.id === selectedCompany.id
          ? {
              ...company,
              users: (company.users || []).filter((item) => item.id !== userId)
            }
          : company
      )
    )

    if (editingUserId === userId) {
      setIsUserModalOpen(false)
      setUserModalMode("create")
      resetEditingState()
    }

    setUserFeedback("Kullanici kaydi silindi.")
    setUserFeedbackTone("neutral")
  }

  return html`
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#344054]">
      <div className="min-h-screen">
        <${Sidebar}
          activePage=${activePage}
          isCollapsed=${isSidebarCollapsed}
          onPageChange=${handlePageChange}
          onToggleCollapse=${handleSidebarToggle}
        />

        <main className=${classNames("app-main", isSidebarCollapsed && "is-collapsed")}>
          <${TopBar}
            companies=${companies}
            selectedCompany=${selectedCompany}
            companyDraft=${companyDraft}
            isCreatingCompany=${isCreatingCompany}
            onCreateNewCompany=${handleCreateNewCompany}
            onSelectCompany=${handleSelectedCompanyChange}
            activePage=${activePage}
            selectedOnboardingType=${selectedOnboardingType}
            setSelectedOnboardingType=${setSelectedOnboardingType}
            selectedStatus=${selectedStatus}
            setSelectedStatus=${setSelectedStatus}
          />

          <div className="app-content">
          <div
              className=${classNames(
                "mx-auto w-full px-6 py-10",
                activePage === "processes" ? "max-w-[1440px]" : "max-w-[1660px]"
              )}
            >
              ${(() => {
                if (activePage === "dashboard") {
                  return html`
                    <${DashboardScreen}
                      companies=${companies}
                      onSelectCompany=${handleSelectedCompanyChange}
                      onNavigate=${handlePageChange}
                      selectedOnboardingType=${selectedOnboardingType}
                      setSelectedOnboardingType=${setSelectedOnboardingType}
                      selectedStatus=${selectedStatus}
                      setSelectedStatus=${setSelectedStatus}
                    />
                  `
                }
                if (activePage === "sla") {
                  return html`
                    <${SLAScreen}
                      companies=${companies}
                      selectedCompany=${selectedCompany}
                      onSelectCompany=${handleSelectedCompanyChange}
                      onNavigate=${handlePageChange}
                      selectedOnboardingType=${selectedOnboardingType}
                      setSelectedOnboardingType=${setSelectedOnboardingType}
                      selectedStatus=${selectedStatus}
                      setSelectedStatus=${setSelectedStatus}
                    />
                  `
                }
                if (activePage === "processes") {
                  return html`<${ImplementationScreen} key=${selectedCompanyId} companyName=${selectedCompany?.name || ""} />`
                }
                return html`
                  <${AdminScreen}
                    selectedCompany=${selectedCompany}
                    companyDraft=${companyDraft}
                    isCreatingCompany=${isCreatingCompany}
                    isEditingCompany=${isEditingCompany}
                    companyFeedback=${companyFeedback}
                    companyFeedbackTone=${companyFeedbackTone}
                    onCompanyDraftChange=${handleCompanyDraftChange}
                    onStartCompanyEdit=${handleStartCompanyEdit}
                    onCancelCompanyEdit=${handleCancelCompanyEdit}
                    onSaveCompany=${handleSaveCompany}
                    userFeedback=${userFeedback}
                    userFeedbackTone=${userFeedbackTone}
                    isProvisioningUser=${isProvisioningUser}
                    isUserModalOpen=${isUserModalOpen}
                    userModalMode=${userModalMode}
                    userModalDraft=${userModalMode === "edit" ? editingUserDraft : userDraft}
                    emailError=${emailError}
                    onOpenCreateUserModal=${openCreateUserModal}
                    onCloseUserModal=${closeUserModal}
                    onUserModalDraftChange=${handleUserModalDraftChange}
                    onUserModalSubmit=${handleUserModalSubmit}
                    onStartEditUser=${handleStartEditUser}
                    onDeleteUser=${handleDeleteUser}
                    onUpdateCompany=${handleUpdateCompany}
                  />
                `
              })()}
            </div>
          </div>

          <${AppFooter} />
        </main>
      </div>
    </div>
  `
}

ReactDOM.createRoot(document.getElementById("app")).render(html`<${App} />`)
