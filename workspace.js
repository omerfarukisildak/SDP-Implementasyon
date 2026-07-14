const { useEffect, useMemo, useState } = React
const html = htm.bind(React.createElement)

const OPTIONAL_MODULES_STORAGE_KEY = "datassist-optional-modules-by-company"
const IMPLEMENTATION_DOCUMENT_STATE_KEY = "datassist-implementation-document-state"
const WORKSPACE_COMPANY_ID = "company-214"
const optionalModuleDefinitions = [
  {
    id: "implementation-report",
    field: "hasGE",
    name: "Rapor Geliştirme ve Entegrasyon",
    workflowStatus: "İnceleme Bekleniyor",
    workflowTone: "warning",
    slaStatus: "Risk Altında",
    slaTone: "warning",
    actionOwner: "Datassist",
    defaultTargetDate: "2026-06-15"
  },
  {
    id: "transition-call",
    field: "hasAccountingReport",
    name: "Muhasebe Rapor Kurulumu",
    workflowStatus: "Dosya Bekleniyor",
    workflowTone: "warning",
    slaStatus: "Zamanında",
    slaTone: "success",
    actionOwner: "Client",
    defaultTargetDate: "2026-06-22"
  }
]

function formatOptionalModuleDate(value) {
  const [year, month, day] = String(value || "").split("-")
  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
  const monthName = monthNames[Number(month) - 1]
  return year && monthName && day ? `${Number(day)} ${monthName} ${year}` : "Tarih Belirlenmedi"
}

function getEnabledOptionalModules(companyId = WORKSPACE_COMPANY_ID) {
  try {
    const storedModules = JSON.parse(window.localStorage.getItem(OPTIONAL_MODULES_STORAGE_KEY) || "{}")
    const companySettings = storedModules[companyId]
    return optionalModuleDefinitions
      .filter(module => !companySettings || companySettings[module.field] !== false)
      .map(module => ({
        ...module,
        targetDate: formatOptionalModuleDate(companySettings?.targetDates?.[module.id] || module.defaultTargetDate)
      }))
  } catch (_) {
    return optionalModuleDefinitions.map(module => ({
      ...module,
      targetDate: formatOptionalModuleDate(module.defaultTargetDate)
    }))
  }
}

const stages = [
  { id: 1, key: "system-setup", name: "Sistem Kurulumu", desc: "Şirket, işyeri ve temel bordro parametrelerinin sisteme tanımlanması.", state: "pending_upload", target: "01 Haz 2026", targetLong: "01 Haziran 2026", targetDate: new Date(2026, 5, 1), actual: null, delays: [] },
  { id: 2, key: "parallel-cost", name: "Bordro Analiz Çalışmaları", desc: "Mevcut bordro verilerinin ve süreç gereksinimlerinin analizi.", state: "locked", target: "07 Haz 2026", targetLong: "07 Haziran 2026", targetDate: new Date(2026, 5, 7), actual: null, delays: [] },
  { id: 3, key: "integrations", name: "Live Hazırlıkları", desc: "Son kontroller, banka dosyaları ve operasyon devir hazırlıkları.", state: "locked", target: "29 Haz 2026", targetLong: "29 Haziran 2026", targetDate: new Date(2026, 5, 29), actual: null, delays: [] },
  { id: 4, key: "operations-handover", name: "Canlıya Geçiş", desc: "İlk resmi bordronun üretimi ve operasyon ekibine devir.", state: "locked", target: "05 Tem 2026", targetLong: "05 Temmuz 2026", targetDate: new Date(2026, 6, 5), actual: null, delays: [] }
]

const fallbackRequiredDocumentsByStage = {
  "system-setup": [{ id: "doc-starter-kit", status: "missing" }],
  "parallel-cost": [
    { id: "doc-cost-report", status: "missing" },
    { id: "doc-pdf-payrolls", status: "missing" },
    { id: "doc-bank-payment-file", status: "missing" },
    { id: "doc-accounting-sample", status: "missing" }
  ],
  integrations: [
    { id: "doc-kontrol-listesi", status: "missing" },
    { id: "doc-banka-odeme", status: "missing" }
  ],
  "operations-handover": [{ id: "doc-devir-teslim", status: "missing" }]
}

const operationalTasksByStage = {
  "operations-handover": [
    { id: "company-copy", name: "Şirket kopyalama", status: "pending" },
    { id: "ogy-mt-assignment", name: "OGY / MT ataması", status: "pending" }
  ]
}

function readStageDocuments(stageKey) {
  try {
    const storedState = JSON.parse(window.localStorage.getItem(IMPLEMENTATION_DOCUMENT_STATE_KEY) || "{}")
    const storedDocuments = storedState?.stages?.[stageKey]?.documents
    return Array.isArray(storedDocuments) ? storedDocuments : fallbackRequiredDocumentsByStage[stageKey] || []
  } catch (_) {
    return fallbackRequiredDocumentsByStage[stageKey] || []
  }
}

function calculateOwnerSlaContext(documents = [], stageKey) {
  const operationalTasks = operationalTasksByStage[stageKey] || []
  const pendingOperationalTasks = operationalTasks.filter(task => task.status !== "completed")

  if (stageKey === "operations-handover") {
    return pendingOperationalTasks.length > 0
      ? {
          owner: "Datassist",
          workflowState: "pending_operation",
          actionType: "stage_completion",
          actionItems: pendingOperationalTasks.map(task => task.name),
          canCompleteStage: false,
          expectedAction: `${pendingOperationalTasks.map(task => task.name).join(" ve ")} bekleniyor.`
        }
      : {
          owner: "Datassist",
          workflowState: "approved_pending_completion",
          actionType: "stage_completion",
          actionItems: [],
          canCompleteStage: true,
          expectedAction: "Canlıya geçiş onayının verilmesi bekleniyor."
        }
  }

  const requiredDocuments = documents.filter(documentItem => documentItem.required !== false)
  const rejectedCount = requiredDocuments.filter(documentItem => documentItem.status === "rejected").length
  const missingCount = requiredDocuments.filter(documentItem => ["missing", "not_uploaded"].includes(documentItem.status)).length
  const revisedCount = requiredDocuments.filter(documentItem => documentItem.status === "revised").length
  const decisionPendingCount = requiredDocuments.filter(documentItem => documentItem.status === "decision_pending").length
  const approvedCount = requiredDocuments.filter(documentItem => documentItem.status === "approved").length

  if (rejectedCount > 0) {
    return {
      owner: "Client",
      workflowState: "pending_upload",
      actionType: "document_upload",
      actionItems: [],
      expectedAction: `${rejectedCount} dokümanın revize edilerek yeniden yüklenmesi bekleniyor.`
    }
  }

  if (missingCount > 0) {
    return {
      owner: "Client",
      workflowState: "pending_upload",
      actionType: "document_upload",
      actionItems: [],
      expectedAction: `${missingCount} dokümanın yüklenmesi bekleniyor.`
    }
  }

  if (requiredDocuments.length > 0 && approvedCount === requiredDocuments.length) {
    return {
      owner: "Datassist",
      workflowState: "approved_pending_completion",
      actionType: "stage_completion",
      actionItems: [],
      expectedAction: "Adımın tamamlanması bekleniyor."
    }
  }

  if (decisionPendingCount > 0) {
    return {
      owner: "Datassist",
      workflowState: "pending_review",
      actionType: "document_review",
      actionItems: [],
      expectedAction: "Onay kararının verilmesi bekleniyor."
    }
  }

  return {
    owner: "Datassist",
    workflowState: "pending_review",
    actionType: "document_review",
    actionItems: [],
    expectedAction: revisedCount > 0
      ? "Revize dokümanların incelenmesi bekleniyor."
      : "Gönderilen dokümanların incelenmesi bekleniyor."
  }
}

const stateMeta = {
  locked: { label: "Kilitli", tone: "neutral" },
  pending_upload: { label: "Dosya Bekleniyor", tone: "warning" },
  file_uploaded: { label: "Dosya Yüklendi", tone: "info" },
  pending_review: { label: "İnceleme Bekleniyor", tone: "warning" },
  pending_client_approval: { label: "Müşteri Onayı Bekleniyor", tone: "warning" },
  approved_pending_completion: { label: "Tamamlanmayı Bekliyor", tone: "success" },
  completed: { label: "Tamamlandı", tone: "success" }
}

const actionOwnerByWorkflowState = {
  pending_upload: "Client",
  file_uploaded: "Client",
  pending_review: "Datassist",
  pending_client_approval: "Client",
  approved_pending_completion: "Datassist",
  completed: "Datassist"
}

function getActionOwner(workflowState) {
  return actionOwnerByWorkflowState[workflowState] || "Datassist"
}

const BUSINESS_MINUTES_PER_DAY = 8 * 60
const BUSINESS_HOLIDAYS_2026 = new Set([
  "2026-01-01",
  "2026-03-20", "2026-03-21", "2026-03-22",
  "2026-04-23", "2026-05-01", "2026-05-19",
  "2026-05-27", "2026-05-28", "2026-05-29", "2026-05-30",
  "2026-07-15", "2026-08-30", "2026-10-29"
])
const reviewSubmissionAt = new Date(2026, 4, 29, 14, 32)

function getDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function isBusinessDay(date, holidays = BUSINESS_HOLIDAYS_2026) {
  const weekday = date.getDay()
  return weekday !== 0 && weekday !== 6 && !holidays.has(getDateKey(date))
}

function getNextBusinessDayDeadline(submissionAt, holidays = BUSINESS_HOLIDAYS_2026) {
  const deadline = new Date(submissionAt)
  deadline.setHours(0, 0, 0, 0)
  do deadline.setDate(deadline.getDate() + 1)
  while (!isBusinessDay(deadline, holidays))
  deadline.setHours(18, 0, 0, 0)
  return deadline
}

function formatTurkishDate(date, includeTime = false) {
  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
  const datePart = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
  if (!includeTime) return datePart
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${datePart} ${hours}:${minutes}`
}

function addBusinessDays(date, days, holidays = BUSINESS_HOLIDAYS_2026) {
  const result = new Date(date)
  let remaining = Math.max(0, Math.round(Number(days) || 0))
  while (remaining > 0) {
    result.setDate(result.getDate() + 1)
    if (isBusinessDay(result, holidays)) remaining--
  }
  return result
}

function calculateStageEstimate(stagesList, stageKey) {
  const targetStage = stagesList.find(stage => stage.key === stageKey)
  const delayDays = (targetStage.delays || []).reduce((total, delayItem) => total + Math.max(0, Number(delayItem.businessDays) || 0), 0)
  const estimatedDate = delayDays > 0 ? addBusinessDays(targetStage.targetDate, delayDays) : targetStage.targetDate
  return {
    estimatedDateLabel: formatTurkishDate(estimatedDate),
    delayDays,
    tone: delayDays > 0 ? "warning" : "success",
    statusLabel: delayDays > 0 ? `+${delayDays} İş Günü Gecikmeli` : "Planlandığı Gibi"
  }
}

const reviewDeadlineAt = getNextBusinessDayDeadline(reviewSubmissionAt)
const reviewTotalSlaMinutes = Math.max(0, Math.round((reviewDeadlineAt.getTime() - reviewSubmissionAt.getTime()) / 60000))

const slaDefinitions = {
  client: {
    title: "Client SLA",
    start: "28 Mayıs 2026",
    deadline: "01 Haziran 2026 18:00",
    displayStart: "28 Mayıs 2026",
    displayDeadline: "01 Haziran 2026 18:00",
    totalBusinessMinutes: 3 * BUSINESS_MINUTES_PER_DAY,
    remainingBusinessMinutes: 2 * BUSINESS_MINUTES_PER_DAY,
    remainingDisplay: "days",
    remainingLabel: "KALAN İŞ GÜNÜ",
    elapsed: "2 İş Günü"
  },
  datassist: {
    title: "Datassist SLA",
    start: "29 Mayıs 2026",
    deadline: "01 Haziran 2026",
    displayStart: "29 Mayıs 2026",
    displayDeadline: "01 Haziran 2026",
    totalBusinessMinutes: 3 * BUSINESS_MINUTES_PER_DAY,
    remainingBusinessMinutes: 2 * BUSINESS_MINUTES_PER_DAY,
    remainingDisplay: "days",
    remainingLabel: "KALAN İŞ GÜNÜ",
    elapsed: "2 İş Günü"
  },
  stage: {
    start: "01 Temmuz 2026",
    deadline: "05 Temmuz 2026",
    displayStart: "01 Temmuz 2026",
    displayDeadline: "05 Temmuz 2026",
    totalBusinessMinutes: 3 * BUSINESS_MINUTES_PER_DAY,
    remainingBusinessMinutes: 2 * BUSINESS_MINUTES_PER_DAY,
    remainingDisplay: "days",
    remainingLabel: "KALAN SÜRE",
    elapsed: "13"
  },
  review: {
    start: formatTurkishDate(reviewSubmissionAt),
    deadline: formatTurkishDate(reviewDeadlineAt, true),
    displayStart: formatTurkishDate(reviewSubmissionAt),
    displayDeadline: formatTurkishDate(reviewDeadlineAt, true),
    completedAt: "01 Haziran 2026 15:30",
    pendingDocuments: 1,
    reviewedDocuments: 1,
    totalBusinessMinutes: reviewTotalSlaMinutes,
    remainingBusinessMinutes: 6 * 60,
    remainingDisplay: "duration",
    remainingLabel: "KALAN SÜRE",
    elapsed: "2 Saat"
  }
}

function calculateSlaStatus({ totalBusinessMinutes, remainingBusinessMinutes, deadlinePassed = false }) {
  const total = Math.max(Number(totalBusinessMinutes) || 0, 0)
  const remaining = Number(remainingBusinessMinutes) || 0
  const remainingPercentage = total > 0 ? (remaining / total) * 100 : 0
  const progress = Math.min(100, Math.max(0, 100 - remainingPercentage))

  if (deadlinePassed || remaining < 0) {
    return { label: "Gecikti", tone: "danger", remainingPercentage: 0, progress: 100 }
  }

  if (remainingPercentage <= 25) {
    return { label: "Risk Altında", tone: "warning", remainingPercentage, progress }
  }

  return { label: "Zamanında", tone: "success", remainingPercentage, progress }
}

function formatBusinessDuration(minutes) {
  const safeMinutes = Math.max(0, Math.round(Number(minutes) || 0))
  const hours = Math.floor(safeMinutes / 60)
  const remainingMinutes = safeMinutes % 60
  const parts = []

  if (hours) parts.push(`${hours} Saat`)
  if (remainingMinutes) parts.push(`${remainingMinutes} Dakika`)

  return `${parts.length ? parts.join(" ") : "0 Dakika"} Kaldı`
}

function formatRemainingBusinessTime(minutes) {
  const safeMinutes = Math.max(0, Math.round(Number(minutes) || 0))

  if (safeMinutes >= BUSINESS_MINUTES_PER_DAY) {
    return `${Math.ceil(safeMinutes / BUSINESS_MINUTES_PER_DAY)} İş Günü`
  }

  if (safeMinutes >= 60) {
    const hours = Math.floor(safeMinutes / 60)
    const minutesLeft = safeMinutes % 60
    return minutesLeft ? `${hours} Saat ${minutesLeft} Dakika` : `${hours} Saat`
  }

  return `${safeMinutes} Dakika`
}

function getSlaMessage(key, status) {
  const messages = {
    client: {
      success: "Müşteri SLA'sı zamanında ilerliyor.",
      warning: "Müşteri SLA'sı kritik eşiğe ulaştı.",
      danger: "Müşteri SLA süresi aşıldı."
    },
    datassist: {
      success: "Datassist SLA'sı zamanında ilerliyor.",
      warning: "Datassist SLA'sı kritik eşiğe ulaştı.",
      danger: "Datassist SLA süresi aşıldı."
    },
    stage: {
      success: "Aktif adım zamanında ilerliyor.",
      warning: "Aktif adımın SLA hedef tarihine ulaşmasına son 1 iş günü kaldı.",
      danger: "Aktif adımın hedef tarihi aşıldı."
    },
    review: {
      success: "İnceleme yanıt süresi zamanında ilerliyor.",
      warning: "İnceleme yanıt süresi kritik eşiğe ulaştı.",
      danger: "İnceleme yanıt süresi aşıldı."
    }
  }

  return messages[key]?.[status.tone] || "Aktif SLA durumu güncellenemedi."
}

function enrichSla(key, sla) {
  const status = calculateSlaStatus(sla)
  const remaining = sla.remainingDisplay === "duration"
    ? formatBusinessDuration(sla.remainingBusinessMinutes)
    : String(Math.max(0, Math.ceil(sla.remainingBusinessMinutes / BUSINESS_MINUTES_PER_DAY)))

  return { ...sla, remaining, message: getSlaMessage(key, status), ...status }
}

function getOverallSlaStatus(slas) {
  const priority = { danger: 4, warning: 3, success: 2, undefined: 1 }
  const undefinedSla = {
    label: "Tanımsız",
    tone: "undefined",
    message: "Aktif SLA bilgisi bulunmuyor."
  }

  return slas
    .filter(Boolean)
    .reduce((worst, sla) => (priority[sla.tone] || 0) > priority[worst.tone] ? sla : worst, undefinedSla)
}

const initialAudit = [
  { time: "26 May, 09:00", user: "Sistem", initials: "", event: "Adım Aktif Edildi", desc: "Sistem Kurulumu adımı aktif edildi.", tone: "gray" }
]

function Icon({ name, size = 18 }) {
  const paths = {
    grid: html`<g><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></g>`,
    layers: html`<g><path d="m12 3-9 5 9 5 9-5-9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/></g>`,
    clock: html`<g><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></g>`,
    users: html`<g><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></g>`,
    settings: html`<g><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3V9.6h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.2.37.6.73 1 .9.35.14.72.2 1.1.2h.1v4h-.1c-.38 0-.75.06-1.1.2-.4.17-.8.53-1 .9Z"/></g>`,
    chevron: html`<path d="m9 18 6-6-6-6"/>`,
    down: html`<path d="m6 9 6 6 6-6"/>`,
    upload: html`<g><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 15v5h16v-5"/></g>`,
    send: html`<g><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></g>`,
    check: html`<path d="m5 12 4 4L19 6"/>`,
    x: html`<g><path d="M18 6 6 18M6 6l12 12"/></g>`,
    download: html`<g><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/></g>`,
    eye: html`<g><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></g>`,
    file: html`<g><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 13h6M9 17h5"/></g>`,
    calendar: html`<g><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></g>`,
    alert: html`<g><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v4M12 17h.01"/></g>`,
    lock: html`<g><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></g>`,
    info: html`<g><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></g>`
  }
  return html`<svg className="icon" width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">${paths[name]}</svg>`
}

function Badge({ tone = "neutral", children }) { return html`<span className=${`badge badge--${tone}`}>${children}</span>` }

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  return html`
    <aside className=${`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      <div className="sidebar__brand"><img className="brand-full" src="Assets/datassist-logo.png"/><img className="brand-compact" src="Assets/logo-2.png"/><span className="product-pill">SDP</span></div>
      <button className="collapse-btn" onClick=${() => setCollapsed(!collapsed)} aria-label="Menüyü daralt"><${Icon} name="chevron" size=${14}/></button>
      <div className="nav-label">İMPLEMENTASYON</div>
      <nav>
        <a className="nav-item" href="legacy.html?page=dashboard"><${Icon} name="grid"/><span>Dashboard</span></a>
        <a className="nav-item" href="legacy.html?page=processes"><${Icon} name="layers"/><span>İmplementasyon Süreçleri</span></a>
        <a className="nav-item nav-item--active" href="index.html" aria-current="page"><${Icon} name="clock"/><span>SLA Çalışma Alanı</span></a>
        <a className="nav-item" href="legacy.html?page=management"><${Icon} name="users"/><span>Şirket Yönetimi</span></a>
      </nav>
      <nav className="nav-bottom"><a className="nav-item"><${Icon} name="settings"/><span>Ayarlar</span></a><a className="nav-item"><${Icon} name="grid"/><span>Tüm Uygulamalar</span></a><a className="nav-item"><${Icon} name="info"/><span>Yardım Merkezi</span></a></nav>
    </aside>`
}

function Topbar() {
  return html`<header className="topbar"><div><span className="eyebrow">ŞİRKET</span><button className="company-select">Anadolu Lojistik Operasyon <${Icon} name="down" size=${14}/></button></div><div className="topbar__actions"><span className="role-pill">İmplementasyon Uzmanı</span><button className="lang">🇹🇷</button><button className="avatar avatar--blue">EK</button></div></header>`
}

function PageHeader({ activeStageName, actionOwner, actionType, expectedAction, actionItems = [], actionDeadline }) {
  const [enabledOptionalModules, setEnabledOptionalModules] = useState(() => getEnabledOptionalModules())
  useEffect(() => {
    const refreshOptionalModuleProgress = () => setEnabledOptionalModules(getEnabledOptionalModules())
    window.addEventListener("storage", refreshOptionalModuleProgress)
    window.addEventListener("focus", refreshOptionalModuleProgress)
    window.addEventListener("optional-modules-updated", refreshOptionalModuleProgress)
    return () => {
      window.removeEventListener("storage", refreshOptionalModuleProgress)
      window.removeEventListener("focus", refreshOptionalModuleProgress)
      window.removeEventListener("optional-modules-updated", refreshOptionalModuleProgress)
    }
  }, [])
  const completedStages = stages.filter(stage => stage.state === "completed").length
  const completedOptionalModules = enabledOptionalModules.filter(module => module.workflowStatus === "Tamamlandı").length
  const totalWorkItems = stages.length + enabledOptionalModules.length
  const completedWorkItems = completedStages + completedOptionalModules
  const remainingStages = totalWorkItems - completedWorkItems
  const progressPercentage = totalWorkItems > 0 ? Math.round((completedWorkItems / totalWorkItems) * 100) : 0
  const delay = stages.reduce((totals, stage) => {
    const stageDelays = Array.isArray(stage.delays) ? stage.delays : []
    stageDelays.forEach(delayItem => {
      const delayDays = Math.max(0, Number(delayItem.businessDays) || 0)
      if (delayItem.owner === "Client") totals.client += delayDays
      if (delayItem.owner === "Datassist") totals.datassist += delayDays
    })
    return totals
  }, { client: 0, datassist: 0 })
  const totalDelay = delay.client + delay.datassist
  const clientDelayPercentage = totalDelay > 0 ? (delay.client / totalDelay) * 100 : 0
  const datassistDelayPercentage = totalDelay > 0 ? (delay.datassist / totalDelay) * 100 : 0
  const goLiveRemainingBusinessDays = 2
  const actionDeadlineValue = actionType === "document_review"
    ? String(actionDeadline || "—").replace(/\s(\d{2}:\d{2})$/, ", $1")
    : String(actionDeadline || "—").replace(/\s\d{2}:\d{2}$/, "")
  return html`
    <section className="dashboard-header">
      <div className="dashboard-intro">
        <div className="title-context">
          <h1>Anadolu Lojistik Operasyon</h1>
          <div className="project-meta" aria-label="Implementasyon bilgileri">
            <span><b>Bölüm:</b> Enterprise</span>
            <span><b>Geçiş Modeli:</b> Hızlı Geçiş</span>
          </div>
        </div>
      </div>
      <div className="header-metrics executive-summary">
        <article className=${`metric executive-metric summary-widget executive-metric--active-status active-status--${actionOwner.toLowerCase()}`}><span>Aktif Durum</span><strong className="active-stage-name">${activeStageName}</strong><dl className="active-status-list"><div><dt>Bekleyen Taraf</dt><dd>${actionOwner}</dd></div><div><dt>Bekleyen İşlem</dt><dd className=${actionItems.length ? "active-operation-items" : ""}>${actionItems.length ? actionItems.map(item => html`<span key=${item}>${item}</span>`) : expectedAction}</dd></div><div><dt>Son Tarih</dt><dd>${actionDeadlineValue}</dd></div></dl></article>
        <article className="metric executive-metric summary-widget executive-metric--progress"><span>Genel İlerleme</span><strong>${completedWorkItems} / ${totalWorkItems} Tamamlandı</strong><small>%${progressPercentage} Tamamlandı</small><div className="progress"><i style=${{width:`${progressPercentage}%`}}></i></div><small className="progress-remaining">${remainingStages} Adım Kaldı</small></article>
        <article className=${`metric executive-metric summary-widget executive-metric--delay ${totalDelay > 0 ? "has-delay" : ""}`}><span>Gecikme Özeti</span><div className="delay-content"><div className="delay-total-value"><strong>${totalDelay > 0 ? "+" : ""}${totalDelay} İş Günü</strong></div><div className="delay-visual"><span className="delay-donut" role="img" aria-label=${`Gecikme dağılımı: Client ${delay.client} iş günü, Datassist ${delay.datassist} iş günü`}><svg viewBox="0 0 36 36" aria-hidden="true"><circle className="delay-donut__track" cx="18" cy="18" r="14" pathLength="100"/><circle className="delay-donut__segment delay-donut__segment--client" cx="18" cy="18" r="14" pathLength="100" strokeDasharray=${`${clientDelayPercentage} ${100 - clientDelayPercentage}`}/><circle className="delay-donut__segment delay-donut__segment--datassist" cx="18" cy="18" r="14" pathLength="100" strokeDasharray=${`${datassistDelayPercentage} ${100 - datassistDelayPercentage}`} strokeDashoffset=${-clientDelayPercentage}/></svg></span><span className="delay-legend" aria-hidden="true"><span className="delay-legend__item delay-legend__item--client"><i></i>Client</span><span className="delay-legend__item delay-legend__item--datassist"><i></i>Datassist</span></span></div></div></article>
        <article className="metric executive-metric summary-widget executive-metric--golive"><span>Hedef Canlıya Geçiş</span><div className="golive-content"><strong>05 Temmuz 2026</strong><div className="executive-support"><b>${goLiveRemainingBusinessDays} İş Günü Kaldı</b></div></div></article>
      </div>
    </section>`
}

function TimelineStage({ stage }) {
  if (stage.state === "completed") {
    return html`
      <div className="timeline-stage timeline-stage--completed">
        <span className="timeline-node"><${Icon} name="check" size=${14}/></span>
        <span className="stage-copy"><strong>${stage.name}</strong><small>${stage.desc}</small></span>
        <span className="timeline-date-column"><small>TAMAMLANMA</small><strong>${stage.actualLong || stage.actual}</strong>${(stage.delays || []).map((delayItem, index) => html`<span className=${`timeline-delay timeline-delay--${delayItem.owner.toLowerCase()}`} title=${`Orijinal hedef: ${stage.targetLong || stage.target}`} key=${`${stage.id}-${delayItem.owner}-${index}`}><i></i>${delayItem.owner === "Client" ? "Client" : "İmplementasyon ekibi"} kaynaklı · +${delayItem.businessDays} İş Günü</span>`)}</span>
      </div>`
  }

  if (stage.state === "locked") {
    return html`
      <div className="timeline-stage timeline-stage--locked">
        <span className="timeline-node"><${Icon} name="lock" size=${13}/></span>
        <span className="stage-copy"><strong>${stage.name}</strong><small>${stage.desc}</small></span>
        <span className="timeline-date-column"><small>HEDEF</small><strong>${stage.targetLong || stage.target}</strong></span>
      </div>`
  }

  return html`
    <div className=${`timeline-stage timeline-stage--active timeline-stage--${stage.state}`}>
      <span className="timeline-node">${stage.id}</span>
      <span className="stage-copy"><strong>${stage.name}</strong><small>${stage.desc}</small></span>
      <span className="timeline-date-column timeline-date-column--active"><small>HEDEF</small><strong>${stage.targetLong || stage.target}</strong></span>
    </div>`
}

function SectionCard({ title, subtitle, action, children, className = "" }) {
  return html`<section className=${`card ${className}`}><div className="card__header"><div className="card__title"><span><strong>${title}</strong>${subtitle ? html`<small>${subtitle}</small>` : null}</span></div>${action}</div><div className="card__body">${children}</div></section>`
}

function Timeline() {
  return html`
    <${SectionCard} title="İmplementasyon Zaman Çizelgesi" subtitle="Temel adımlar ve mevcut iş akışı durumu">
      <div className="timeline">${stages.map(stage => html`<${TimelineStage} key=${stage.id} stage=${stage}/>` )}</div>
    </${SectionCard}>`
}

function OptionalModules() {
  const [optionalModules, setOptionalModules] = useState(() => getEnabledOptionalModules())
  const [selectedOptionalModuleId, setSelectedOptionalModuleId] = useState(() => optionalModules[0]?.id || null)

  useEffect(() => {
    const refreshOptionalModules = () => {
      const nextModules = getEnabledOptionalModules()
      setOptionalModules(nextModules)
      setSelectedOptionalModuleId(currentId => nextModules.some(module => module.id === currentId) ? currentId : nextModules[0]?.id || null)
    }
    window.addEventListener("storage", refreshOptionalModules)
    window.addEventListener("focus", refreshOptionalModules)
    window.addEventListener("optional-modules-updated", refreshOptionalModules)
    return () => {
      window.removeEventListener("storage", refreshOptionalModules)
      window.removeEventListener("focus", refreshOptionalModules)
      window.removeEventListener("optional-modules-updated", refreshOptionalModules)
    }
  }, [])

  const summary = optionalModules.length
    ? html`<${Badge} tone="info">${optionalModules.length} Aktif Modül</${Badge}>`
    : html`<${Badge}>Etkin Modül Yok</${Badge}>`

  return html`
    <${SectionCard}
      title="Opsiyonel Modüller"
      subtitle="Ana implementasyon sürecinden bağımsız yürütülen ek çalışmalar."
      action=${summary}
      className="optional-modules-card"
    >
      ${optionalModules.length ? html`
        <div className="optional-modules-table-wrap">
          <table className="optional-modules-table">
            <colgroup><col/><col className="optional-col--status"/><col className="optional-col--owner"/><col className="optional-col--target"/></colgroup>
            <thead><tr><th>Modül</th><th>Durum</th><th>Aksiyon Bekleyen</th><th>Hedef Tarih</th></tr></thead>
            <tbody>
              ${optionalModules.map(module => {
                const isSelected = selectedOptionalModuleId === module.id
                const selectModule = () => setSelectedOptionalModuleId(module.id)
                return html`
                <tr
                  className=${isSelected ? "is-selected" : ""}
                  key=${module.id}
                  tabIndex="0"
                  aria-selected=${isSelected}
                  onClick=${selectModule}
                  onKeyDown=${event => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      selectModule()
                    }
                  }}
                >
                  <td><strong>${module.name}</strong></td>
                  <td><${Badge} tone=${module.workflowTone}>${module.workflowStatus}</${Badge}></td>
                  <td>${module.actionOwner}</td>
                  <td>${module.targetDate}</td>
                </tr>`})}
            </tbody>
          </table>
        </div>` : html`<p className="optional-modules-empty">Bu implementasyonda aktif opsiyonel modül bulunmamaktadır.</p>`}
    </${SectionCard}>`
}

function AuditItem({ item, index }) {
  return html`
    <div className="audit-item" key=${`${item.time}-${item.event}-${index}`}>
      <span className=${`audit-dot audit-dot--${item.tone}`}></span>
      ${item.user === "Sistem"
        ? html`<span className="audit-system-marker" aria-label="Sistem aktivitesi"><${Icon} name="settings" size=${14}/></span>`
        : html`<span className="avatar avatar--tiny">${item.initials}</span>`}
      <div className="audit-content">
        <div className="audit-heading">
          <strong>${item.event}</strong>
          <time>${item.time}</time>
        </div>
        <small className="audit-user">${item.user}</small>
        <p>${item.desc}</p>
      </div>
    </div>`
}

function Audit({ items }) {
  const [modalOpen, setModalOpen] = useState(false)
  const visibleItems = items.slice(0, 5)

  useEffect(() => {
    if (!modalOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = event => {
      if (event.key === "Escape") setModalOpen(false)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [modalOpen])

  const modal = modalOpen ? ReactDOM.createPortal(html`
    <div className="audit-modal-overlay" onMouseDown=${event => {
      if (event.target === event.currentTarget) setModalOpen(false)
    }}>
      <section className="audit-modal" role="dialog" aria-modal="true" aria-labelledby="audit-modal-title" aria-describedby="audit-modal-description">
        <header className="audit-modal__header">
          <div>
            <h2 id="audit-modal-title">Tüm Aktivite Geçmişi</h2>
            <p id="audit-modal-description">İmplementasyon sürecinde gerçekleşen tüm kullanıcı ve sistem aktiviteleri.</p>
          </div>
          <button className="audit-modal__close" onClick=${() => setModalOpen(false)} aria-label="Aktivite geçmişini kapat"><${Icon} name="x" size=${18}/></button>
        </header>
        <div className="audit-modal__content">
          <div className="audit-list audit-list--modal">
            ${items.map((item, index) => html`<${AuditItem} item=${item} index=${index} key=${`${item.time}-${item.event}-${index}`}/>`)}
          </div>
        </div>
      </section>
    </div>`, document.body) : null

  return html`
    <${React.Fragment}>
      <${SectionCard} title="Audit Geçmişi" subtitle="Önemli aktiviteler kronolojik olarak kaydedilir">
        <div className="audit-list">
          ${visibleItems.map((item, index) => html`<${AuditItem} item=${item} index=${index} key=${`${item.time}-${item.event}-${index}`}/>`)}
        </div>
        ${items.length > 5 ? html`<button className="show-more" onClick=${() => setModalOpen(true)}>Tüm Aktivite Geçmişi →</button>` : null}
      </${SectionCard}>
      ${modal}
    </${React.Fragment}>`
}

function getReviewSlaState(workflowState) {
  if (["pending_upload", "file_uploaded", "pending_operation"].includes(workflowState)) return "not_started"
  if (["pending_client_approval", "approved_pending_completion", "completed"].includes(workflowState)) return "completed"
  return "in_progress"
}

function ReviewSlaBody({ sla, state }) {
  if (state === "not_started") {
    return html`
      <div className="sla-body sla-body--review">
        <div className="review-sla-state"><strong>Başlamadı</strong><p>Müşteri dokümanı onaya gönderdiğinde inceleme SLA'sı başlayacaktır.</p></div>
        <div className="sla-progress sla-progress--inactive"><i style=${{width:"0%"}}></i></div>
        <div className="sla-grid sla-grid--review"><span>İnceleme Başlangıcı <b>—</b></span><span>SLA Sonu <b>—</b></span><span>Bekleyen Doküman <b>0</b></span><span>Durum <b>Başlamadı</b></span></div>
      </div>`
  }

  if (state === "completed") {
    return html`
      <div className="sla-body sla-body--review">
        <div className="review-sla-state review-sla-state--success"><strong>İnceleme tamamlandı</strong><p>Tüm bekleyen dokümanlar incelendi.</p></div>
        <div className="sla-progress"><i className="sla-progress--success" style=${{width:"100%"}}></i></div>
        <div className="sla-grid sla-grid--review"><span>İnceleme Başlangıcı <b>${sla.displayStart}</b></span><span>Tamamlanma Tarihi <b>${sla.completedAt}</b></span><span>İncelenen Doküman <b>${sla.reviewedDocuments}</b></span><span>Durum <b>Tamamlandı</b></span></div>
      </div>`
  }

  const remainingText = sla.remaining.replace(" Kaldı", "")
  return html`
    <div className="sla-body sla-body--review">
      <div className="sla-primary"><span>KALAN SÜRE</span><strong>${remainingText}</strong><small>${sla.displayDeadline} tarihine kadar</small></div>
      <div className="sla-progress"><i className=${`sla-progress--${sla.tone}`} style=${{width:`${sla.progress}%`}}></i></div>
      <div className="sla-grid sla-grid--review"><span>İnceleme Başlangıcı <b>${sla.displayStart}</b></span><span>SLA Sonu <b>${sla.displayDeadline}</b></span><span>Bekleyen Doküman <b>${sla.pendingDocuments}</b></span><span>Durum <b>${sla.label}</b></span></div>
    </div>`
}

function SlaCard({ sla, variant, subjectName, stageKey, expectedAction, reviewState = "in_progress", workflowState, owner }) {
  const isReview = variant === "review"
  const isStage = variant === "stage"
  const isCompletionPending = variant === "owner" && workflowState === "approved_pending_completion"
  const heading = isReview ? "İnceleme SLA" : subjectName || "Aktif Adım"
  const reviewStatus = reviewState === "not_started"
    ? { label: "Başlamadı", tone: "neutral" }
    : reviewState === "completed"
      ? { label: "Tamamlandı", tone: "success" }
      : sla
  const ownerRemainingLabel = sla.remainingDisplay === "days" ? "KALAN İŞ GÜNÜ" : "KALAN SÜRE"
  const ownerRemaining = sla.remainingDisplay === "days" ? sla.remaining : sla.remaining.replace(" Kaldı", "")
  const goLive = isStage ? calculateStageEstimate(stages, stageKey) : null
  const body = isReview
    ? html`<${ReviewSlaBody} sla=${sla} state=${reviewState}/>`
    : isStage
      ? html`
        <div className="sla-body sla-golive">
          <div className="sla-golive__date"><strong>${goLive.estimatedDateLabel}</strong></div>
          <div className="sla-golive__remaining"><span>KALAN SÜRE</span><b>${sla.remaining} İş Günü</b></div>
          <div className="sla-golive__status"><span>TAHMİNİ DURUM</span><span><${Badge} tone=${goLive.tone}>${goLive.statusLabel}</${Badge}></span></div>
        </div>`
      : isCompletionPending
        ? html`<div className="sla-body sla-body--completion">
            <div className="sla-next-action"><strong>Stage'i Tamamla</strong><span>Bir Sonraki Aksiyon</span></div>
            <div className="sla-responsible"><strong>${owner}</strong><span>Sorumlu Taraf</span></div>
            <div className="sla-grid sla-grid--owner"><span>Son Tarih <b>${sla.displayDeadline}</b></span><span>Durum <b><i className=${`status-dot status-dot--${sla.tone}`}></i>${sla.label}</b></span></div>
          </div>`
        : html`<div className="sla-body"><div className="sla-primary"><span>${ownerRemainingLabel}</span><strong>${ownerRemaining}</strong><small>${sla.displayDeadline} tarihine kadar</small></div><div className="sla-progress"><i className=${`sla-progress--${sla.tone}`} style=${{width:`${sla.progress}%`}}></i></div><div className="sla-grid sla-grid--owner"><span>SLA Başlangıcı <b>${sla.displayStart}</b></span><span>SLA Sonu <b>${sla.displayDeadline}</b></span><span className="sla-grid__action">Beklenen İşlem <b>${expectedAction}</b></span><span>Durum <b>${sla.label}</b></span></div></div>`
  return html`<section className=${`side-card sla-card sla-card--${variant}`}>${isCompletionPending ? null : html`<div className="side-card__header"><span className="sla-card__heading"><strong>${heading}</strong></span>${isReview ? html`<span><${Badge} tone=${reviewStatus.tone}>${reviewStatus.label}</${Badge}></span>` : null}</div>`}${body}</section>`
}

function Alerts({ workflowState, reviewState, activeStageName, expectedAction }) {
  const ownerAlert = workflowState === "pending_upload"
    ? { icon: "file", title: "Client dosyası bekleniyor", desc: `${activeStageName} için dosya yükleme aksiyonu bekleniyor.` }
    : workflowState === "pending_operation"
      ? { icon: "clock", title: "Datassist operasyonu bekleniyor", desc: `${activeStageName}: ${expectedAction}` }
      : { icon: "clock", title: "Aktif adım tamamlanmak üzere", desc: `${activeStageName} için 1 iş günü kaldı.` }
  const alerts = [
    ownerAlert,
    ...(reviewState === "in_progress" ? [{ icon: "file", title: "İnceleme SLA'sı sona yaklaşıyor", desc: "Banka Ödeme Dosyası için 6 saat kaldı." }] : []),
    { icon: "alert", title: "Opsiyonel modülde aksiyon bekleniyor", desc: "Muhasebe Rapor Kurulumu hedef tarihine yaklaştı." }
  ]
  return html`<section className="side-card"><div className="side-title"><strong>SLA Uyarıları</strong><span className="count">${alerts.length}</span></div><div className="alerts">${alerts.map((alert, index) => html`<div className="alert alert--orange" key=${`${alert.title}-${index}`}><${Icon} name=${alert.icon} size=${16}/><span><strong>${alert.title}</strong><small>${alert.desc}</small></span></div>`)}</div></section>`
}

function App() {
  const audit = initialAudit
  const activeStage = stages.find(stage => !["completed", "locked"].includes(stage.state))
  const [activeStageDocuments, setActiveStageDocuments] = useState(() => readStageDocuments(activeStage?.key))
  useEffect(() => {
    const refreshDocuments = () => setActiveStageDocuments(readStageDocuments(activeStage?.key))
    window.addEventListener("storage", refreshDocuments)
    window.addEventListener("focus", refreshDocuments)
    window.addEventListener("implementation-document-state-updated", refreshDocuments)
    return () => {
      window.removeEventListener("storage", refreshDocuments)
      window.removeEventListener("focus", refreshDocuments)
      window.removeEventListener("implementation-document-state-updated", refreshDocuments)
    }
  }, [activeStage?.key])
  const ownerContext = useMemo(() => calculateOwnerSlaContext(activeStageDocuments, activeStage?.key), [activeStageDocuments, activeStage?.key])
  const workflowState = ownerContext.workflowState
  const reviewState = getReviewSlaState(workflowState)
  const slas = useMemo(() => Object.fromEntries(Object.entries(slaDefinitions).map(([key, sla]) => [key, enrichSla(key, sla)])), [])
  const activeOwner = ownerContext.owner
  const activeOwnerSla = ownerContext.actionType === "document_review" ? slas.review : activeOwner === "Client" ? slas.client : slas.datassist
  return html`<div className="app"><${Sidebar}/><main><${Topbar}/><div className="content"><${PageHeader} activeStageName=${activeStage?.name} actionOwner=${activeOwner} actionType=${ownerContext.actionType} expectedAction=${ownerContext.expectedAction} actionItems=${ownerContext.actionItems} actionDeadline=${activeOwnerSla.displayDeadline}/><div className="workspace-grid"><div className="workspace-main"><${Timeline}/><${OptionalModules}/><${Audit} items=${audit}/></div><aside className="right-rail"><${SlaCard} sla=${slas.stage} variant="stage" subjectName=${activeStage?.name} stageKey=${activeStage?.key}/><${SlaCard} sla=${activeOwnerSla} variant="owner" subjectName=${`${activeOwner} SLA`} expectedAction=${ownerContext.expectedAction} workflowState=${workflowState} owner=${activeOwner}/><${Alerts} workflowState=${workflowState} reviewState=${reviewState} activeStageName=${activeStage?.name} expectedAction=${ownerContext.expectedAction}/></aside></div></div></main></div>`
}

ReactDOM.createRoot(document.getElementById("app")).render(html`<${App}/>`)
