const { useMemo, useState } = React
const html = htm.bind(React.createElement)

const seedCompanies = [
  {
    id: "company-214",
    name: "Anadolu Lojistik Operasyon",
    onboardingType: "enterprise",
    transitionType: "fast",
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

const moduleAccessUrl = "https://sdp.datassist.com.tr"

const implementationBaseSteps = [
  { id: "system-setup",          number: "01", title: "Sistem Kurulumu",                  planned: "Haz 01", completedDate: "Haz 01" },
  { id: "parallel-cost",         number: "02", title: "Bordro Analiz Calismalari",         planned: "Haz 08", completedDate: "Haz 08" },
  { id: "implementation-report", number: "03", title: "Rapor Gelistirme ve Entegrasyon",   planned: "Haz 15", completedDate: "Haz 15" },
  { id: "transition-call",       number: "04", title: "Muhasebe Rapor Kurulumu",           planned: "Haz 22", completedDate: "Haz 22" },
  { id: "integrations",          number: "05", title: "Live Hazirliklari",                 planned: "Haz 29", completedDate: "Haz 29" },
  { id: "operations-handover",   number: "06", title: "Canliya Gecis",                     planned: "Tem 05", completedDate: "Tem 05" }
]

const implementationTaskPlaceholderDescription = "Aciklama yazilari guncellenecektir."

const starterKitDownloadHref = "file:///Users/omerisildak/Downloads/1%20-%20Starter%20Kit.xls"

const implementationTaskSeeds = [
  {
    id: "task-company-workplace",
    title: "1.1 Sirket ve Isyeri Bilgileri",
    infoTooltip:
      "Starter Kit icindeki Sirket ve Isyeri sekmesini doldurup buraya yukleyin.",
    status: "revision_requested",
    uploads: [
      {
        id: "upload-company-1",
        name: "sirket-ve-isyeri-bilgileri-v2.xlsx",
        uploadedAt: "27 Mar 2026, 10:40",
        downloadUrl: createTemplateDownloadHref("Sirket ve Isyeri Bilgileri")
      }
    ]
  },
  {
    id: "task-operational",
    title: "1.2 Operasyonel Bilgiler",
    status: "reviewing",
    uploads: [
      {
        id: "upload-operational-1",
        name: "operasyonel-bilgiler.xlsx",
        uploadedAt: "27 Mar 2026, 11:12",
        downloadUrl: createTemplateDownloadHref("Operasyonel Bilgiler")
      }
    ]
  },
  {
    id: "task-personnel",
    title: "1.3 Kisisel Bilgi - Personel Info",
    status: "waiting",
    uploads: []
  },
  {
    id: "task-cost-mapping",
    title: "1.4 Masraf Merkezi Cost Mapping",
    status: "approved",
    uploads: [
      {
        id: "upload-cost-1",
        name: "masraf-merkezi-cost-mapping.xlsx",
        uploadedAt: "26 Mar 2026, 16:05",
        downloadUrl: createTemplateDownloadHref("Masraf Merkezi Cost Mapping")
      }
    ]
  },
  {
    id: "task-carried-over",
    title: "1.5 Devreden Carried Over",
    status: "approved",
    uploads: [
      {
        id: "upload-carried-over-1",
        name: "devreden-carried-over.xlsx",
        uploadedAt: "26 Mar 2026, 14:48",
        downloadUrl: createTemplateDownloadHref("Devreden Carried Over")
      }
    ]
  }
]

const implementationPlaceholderContent = {
  "parallel-cost": {
    title: "Bordro Analiz Calismalari",
    description:
      "Bu adimda bordro analiz ciktilari degerlendirilir, karsilastirmalar yapilir ve kritik farklar operasyonel bakisla netlestirilir."
  },
  "implementation-report": {
    title: "Rapor Gelistirme ve Entegrasyon",
    description:
      "Bu adimda raporlama yapisi olgunlastirilir, entegrasyon ihtiyaclari planlanir ve akislarin calisma modeli netlestirilir."
  },
  "transition-call": {
    title: "Muhasebe Rapor Kurulumu",
    description:
      "Muhasebe rapor setleri bu adimda kurulur, alan eslesmeleri kontrol edilir ve rapor ciktilarinin dogrulugu teyit edilir."
  },
  integrations: {
    title: "Live Hazirliklari",
    description:
      "Canliya gecis oncesi son hazirliklar bu adimda tamamlanir, kontroller yapilir ve operasyon icin gerekli son adimlar planlanir."
  },
  "operations-handover": {
    title: "Canliya Gecis",
    description:
      "Surec sahipligi operasyon ekibine devredilir, son kontrol listeleri tamamlanir ve surekli destek modeli kesinlestirilir."
  }
}

const implementationInitialMessages = []

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
    transitionType: "normal"
  }
}

function createCompanyDraftFromCompany(company) {
  return {
    name: company?.name || "",
    onboardingType: company?.onboardingType || "saas",
    transitionType: company?.transitionType || "normal"
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
      progress: 0.55
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
      id: "processes",
      label: "Implementasyon Surecleri",
      icon: html`<${LayersIcon} />`
    },
    {
      id: "users",
      label: "Sirket ve Kullanicilar",
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
  onSelectCompany
}) {
  const { useEffect, useRef } = React
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const displayedCompanyName = isCreatingCompany
    ? companyDraft.name.trim() || "Yeni Sirket"
    : selectedCompany?.name || "Sirket Secin"

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return html`
    <header className="topbar">
      <div className="topbar__kurum">
        <span className="topbar__rule" aria-hidden="true"></span>
        <div className="kurum-block">
          <div className="relative" ref=${dropdownRef}>
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

function EditActionButton({ label = "Duzenle", onClick, icon = PencilIcon }) {
  return html`
    <button
      type="button"
      onClick=${onClick}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#D0D5DD] bg-white px-4 text-[14px] font-semibold text-[#344054] shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:bg-[#F9FAFB]"
    >
      <${icon} />
      <span>${label}</span>
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
    <section className="rounded-[22px] border border-[#E4EAF3] bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
      <div className="space-y-5">
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

        <div className="overflow-visible rounded-[18px] border border-[#EAECF0] bg-white px-4">
          ${
            isEditing
              ? html`
                  <${ProfileInputRow}
                    label="Sirket"
                    name="companyName"
                    autoComplete="organization"
                    value=${companyDraft.name}
                    onChange=${(nextValue) => onDraftChange("name", nextValue)}
                    placeholder="Ornek: Ege Perakende Bordro Ekibi"
                    hasDivider=${false}
                  />

                  <${ProfileSelectRow}
                    label="Bolum"
                    name="onboardingType"
                    options=${onboardingOptions}
                    value=${companyDraft.onboardingType}
                    onChange=${(nextValue) => onDraftChange("onboardingType", nextValue)}
                  />

                  <${ProfileSelectRow}
                    label="Gecis Modeli"
                    name="transitionType"
                    options=${transitionOptions}
                    value=${companyDraft.transitionType}
                    onChange=${(nextValue) => onDraftChange("transitionType", nextValue)}
                  />
                `
              : html`
                  <${ProfileValueRow}
                    label="Sirket"
                    value=${companyDraft.name || "Sirket adi girilmedi"}
                    hasDivider=${false}
                  />
                  <${ProfileValueRow}
                    label="Bolum"
                    value=${onboardingMeta.label}
                  />
                  <${ProfileValueRow}
                    label="Gecis Modeli"
                    value=${transitionMeta.label}
                  />
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
    <section className="rounded-[22px] border border-[#DDE5F0] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFCFE_100%)] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
      <div className="space-y-4">
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

        <div className="overflow-visible rounded-[18px] border border-[#E7ECF3] bg-white">
          <div className="hidden grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_auto] gap-4 border-b border-[#EEF2F7] bg-[#F8FAFC] px-5 py-3 md:grid">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#667085]">
              Ad Soyad
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#667085]">
              Rol
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#667085]">
              E-posta
            </span>
            <span className="text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#667085]">
              Aksiyonlar
            </span>
          </div>

          ${
            users.length
              ? html`
                  <div className="divide-y divide-[#EEF2F7]">
                    ${users.map((user) => {
                      const roleMeta = getRoleMeta(user.role)
                      const isCredentialsOpen = openCredentialsUserId === user.id

                      return html`
                        <div key=${user.id} className="bg-white">
                          <div className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_auto] md:items-center md:px-5">
                            <div className="min-w-0">
                              <p className="truncate text-[14px] font-medium text-[#101828]">
                                ${user.firstName} ${user.lastName}
                              </p>
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-[14px] font-medium text-[#344054]">
                                ${roleMeta.label}
                              </p>
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-[14px] font-medium text-[#344054]">
                                ${user.email}
                              </p>
                            </div>

                            <div className="relative flex items-center gap-1.5 md:justify-end">
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
                                  "relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-[9px] border transition",
                                  isCredentialsOpen
                                    ? "border-[#B7CCFF] bg-[#EEF4FF] text-[#285BD4]"
                                    : "border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"
                                )}
                              >
                                <${EyeIcon} />
                              </button>

                              <a
                                href=${buildCredentialMailTo(user, companyName)}
                                title="Mail gonder"
                                aria-label="Mail gonder"
                                className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-[9px] border border-[#D0D5DD] bg-white text-[#344054] transition hover:bg-[#F9FAFB]"
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
                                className="relative z-10 inline-flex h-8 items-center justify-center gap-1 rounded-[9px] border border-[#D0D5DD] bg-white px-2.5 text-[12px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
                              >
                                <${PencilIcon} />
                                <span>Duzenle</span>
                              </button>

                              <button
                                type="button"
                                title="Sil"
                                aria-label="Sil"
                                onClick=${() => onDeleteUser(user.id)}
                                className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-[9px] border border-[#F1C0BC] bg-white text-[#D92D20] transition hover:bg-[#FFF5F5]"
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
  tasks,
  expandedTaskIds,
  onToggleTask,
  dragTaskId,
  onFileSelected,
  onFileDropped,
  onDragStateChange
}) {
  if (activeStep.id !== "system-setup") {
    const content = implementationPlaceholderContent[activeStep.id]

    return html`
      <section className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-[18px] font-semibold text-[#101828]">${content.title}</h2>
          <p className="max-w-[780px] text-[14px] leading-6 text-[#667085]">
            ${content.description}
          </p>
        </div>

        <div className="rounded-[14px] border border-[#EEF2F7] bg-white p-6">
          <div className="space-y-3">
            <span className="inline-flex h-8 items-center rounded-full border border-[#D5E2FF] bg-[#F5F8FF] px-3 text-[12px] font-medium text-[#285BD4]">
              Hazirlaniyor
            </span>
            <h3 className="text-[16px] font-semibold text-[#101828]">
              Bu adim icin detay gorev panosu sonraki iterasyonda acilacak
            </h3>
            <p className="max-w-[720px] text-[14px] leading-6 text-[#667085]">
              Bu ekran surumunde once sistem kurulumu asamasi detaylandirildi. Diger adimlar ayni
              bilgi mimarisi ile gorev, yukleme, onay ve iletisim akislariyla ilerleyecek.
            </p>
          </div>
        </div>
      </section>
    `
  }

  return html`
    <section id="step-content-area" className="step-content-card">
      <div className="step-content-card__header">
        <h2 className="step-content-card__title">Sistem Kurulumu</h2>
        <p className="step-content-card__desc">
          Starter Kit sablonunu indirip doldurun, ardindan sisteme yukleyin. Dosyanizi yuklemek icin once indirmeniz gerekmektedir.
        </p>
      </div>
      <div className="step-content-card__actions">
        <a
          href=${starterKitDownloadHref}
          download="Starter-Kit.xls"
          className="step-action-btn step-action-btn--primary"
        >
          <${DownloadIcon} />
          <span>Starter Kit Indir</span>
        </a>
        <button type="button" className="step-action-btn step-action-btn--disabled" disabled>
          <${UploadIcon} />
          <span>Dosya Yukle</span>
        </button>
      </div>
    </section>
  `
}

function UploadIcon() {
  return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`
}

function ImplementationMessageFeed({ messages, draft, onDraftChange, onSend, onUploadClick }) {
  return html`
    <section className="msg-feed">
      <div className="msg-feed__header">
        <div className="msg-feed__header-left">
          <span className="msg-feed__dot"></span>
          <h2 className="msg-feed__title">Implementasyon Ekibi ile Iletisim</h2>
        </div>
      </div>

      <div className="msg-feed__list">
        ${messages.length === 0 ? html`
          <div className="msg-feed__empty">
            <span className="msg-feed__empty-icon">💬</span>
            <p className="msg-feed__empty-text">Henuz mesaj yok. Implementasyon ekibine ilk mesajinizi gonderin.</p>
          </div>
        ` : null}
        ${messages.map((message) => {
          if (message.type === "system") {
            return html`
              <div key=${message.id} className="msg-event">
                <span className="msg-event__line"></span>
                <span className="msg-event__text">${message.text}</span>
                <span className="msg-event__time">${message.time}</span>
                <span className="msg-event__line"></span>
              </div>
            `
          }

          if (message.type === "implementation") {
            return html`
              <div key=${message.id} className="msg-impl-entry">
                <div className="msg-impl-entry__card">
                  <div className="msg-impl-entry__header">
                    <div className="msg-impl-entry__avatar-wrap">
                      <span className="msg-impl-entry__avatar">DU</span>
                      <span className="msg-impl-entry__online-dot"></span>
                    </div>
                    <div className="msg-impl-entry__meta">
                      <div className="msg-impl-entry__name-row">
                        <span className="msg-impl-entry__author">${message.author}</span>
                        <span className="msg-impl-entry__badge">Implementasyon Ekibi</span>
                      </div>
                      <span className="msg-impl-entry__time">${message.time}</span>
                    </div>
                    ${message.isWelcome ? html`<span className="msg-impl-entry__emoji" aria-hidden="true">👋</span>` : null}
                  </div>
                  <p className="msg-impl-entry__text">${message.text}</p>
                  ${message.starterKit ? html`
                    <div className="msg-impl-entry__actions">
                      <a
                        href=${starterKitDownloadHref}
                        download="Starter-Kit.xls"
                        className="msg-impl-entry__download"
                      >
                        <${DownloadIcon} />
                        <span>Starter Kit Sablonunu Indir</span>
                      </a>
                    </div>
                  ` : null}
                </div>
              </div>
            `
          }

          return html`
            <div key=${message.id} className="msg-client-entry">
              <div className="msg-client-entry__inner">
                <div className="msg-client-entry__meta">
                  <span className="msg-client-entry__time">${message.time}</span>
                  <span className="msg-client-entry__author">${message.author}</span>
                </div>
                <div className="msg-client-entry__row">
                  <div className="msg-client-entry__bubble">${message.text}</div>
                  <div className="msg-client-entry__avatar">${message.avatar || "?"}</div>
                </div>
              </div>
            </div>
          `
        })}
      </div>

      <div className="msg-compose">
        <div className="msg-compose__avatar">SN</div>
        <div className="msg-compose__field">
          <textarea
            rows="2"
            value=${draft}
            onInput=${(e) => onDraftChange(e.target.value)}
            onKeyDown=${(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend() } }}
            placeholder="Implementasyon ekibine mesaj yazin..."
            className="msg-compose__input"
          ></textarea>
          <div className="msg-compose__actions">
            <button
              type="button"
              onClick=${onSend}
              disabled=${!draft.trim()}
              className=${classNames("msg-compose__send", !draft.trim() && "msg-compose__send--disabled")}
            >
              <${SendIcon} />
              <span>Gonder</span>
            </button>
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

function ImplementationScreen() {
  const [activeStepId, setActiveStepId] = useState(implementationBaseSteps[0].id)
  const [systemSetupTasks, setSystemSetupTasks] = useState(implementationTaskSeeds)
  const [expandedTaskIds, setExpandedTaskIds] = useState([])
  const [dragTaskId, setDragTaskId] = useState("")
  const [messages, setMessages] = useState(implementationInitialMessages)
  const [chatDraft, setChatDraft] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(true)

  const systemSetupStatus = deriveSystemSetupStepStatus(systemSetupTasks)
  const steps = useMemo(
    () =>
      implementationBaseSteps.map((step) => ({ ...step, status: "completed" })),
    [systemSetupStatus]
  )

  const overallProgress = Math.round(
    systemSetupTasks.reduce(
      (total, task) => total + getImplementationTaskStatusMeta(task.status).progress,
      0
    ) /
      systemSetupTasks.length *
      40
  )
  const activeStep = steps.find((step) => step.id === activeStepId) || steps[0]

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

  function registerUpload(taskId, file) {
    if (!file) {
      return
    }

    const uploadEntry = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      uploadedAt: formatTimestamp(),
      downloadUrl: URL.createObjectURL(file)
    }

    setSystemSetupTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "uploaded",
              uploads: [uploadEntry, ...task.uploads]
            }
          : task
      )
    )

    appendSystemMessage(`${file.name} dosyasi ilgili goreve yuklendi.`)
  }

  function handleFileSelected(taskId, event) {
    const file = event.target.files && event.target.files[0]
    registerUpload(taskId, file)
    event.target.value = ""
  }

  function handleFileDropped(taskId, event) {
    event.preventDefault()
    setDragTaskId("")

    const file = event.dataTransfer.files && event.dataTransfer.files[0]
    registerUpload(taskId, file)
  }

  function handleSendMessage() {
    if (!chatDraft.trim()) {
      return
    }

    setMessages((current) => [
      ...current,
      {
        id: `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: "client",
        author: "Musteri",
        text: chatDraft.trim(),
        time: formatChatTime()
      }
    ])
    setChatDraft("")
  }

  function handleToggleTask(taskId) {
    setExpandedTaskIds((current) =>
      current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId]
    )
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
        tasks=${systemSetupTasks}
        expandedTaskIds=${expandedTaskIds}
        onToggleTask=${handleToggleTask}
        dragTaskId=${dragTaskId}
        onFileSelected=${handleFileSelected}
        onFileDropped=${handleFileDropped}
        onDragStateChange=${setDragTaskId}
      />

      <${ImplementationMessageFeed}
        messages=${messages}
        draft=${chatDraft}
        onDraftChange=${setChatDraft}
        onSend=${handleSendMessage}
        onUploadClick=${() => {
          setActiveStepId(implementationBaseSteps[0].id)
          setTimeout(() => {
            const el = document.getElementById("step-content-area")
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
          }, 80)
        }}
      />
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
  onDeleteUser
}) {
  const companyUsers = selectedCompany?.users || []
  const companyName = companyDraft.name.trim() || selectedCompany?.name || "Yeni Sirket Taslagi"

  return html`
    <div className="mx-auto w-full max-w-[1560px] space-y-5">
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
}

function App() {
  const [activePage, setActivePage] = useState("users")
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

  function handleCreateNewCompany() {
    setActivePage("users")
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
      transitionType: companyDraft.transitionType
    }

    if (isCreatingCompany || !selectedCompany) {
      const newCompany = {
        id: `company-${Date.now()}`,
        ...normalizedDraft,
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

    const updatedCompany = {
      ...selectedCompany,
      ...normalizedDraft
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
          onPageChange=${setActivePage}
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
          />

          <div className="app-content">
          <div
              className=${classNames(
                "mx-auto w-full px-6 py-10",
                activePage === "processes" ? "max-w-[1440px]" : "max-w-[1660px]"
              )}
            >
              ${
                activePage === "processes"
                  ? html`<${ImplementationScreen} />`
                  : html`
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
                      />
                    `
              }
            </div>
          </div>

          <${AppFooter} />
        </main>
      </div>
    </div>
  `
}

ReactDOM.createRoot(document.getElementById("app")).render(html`<${App} />`)
