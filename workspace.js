const { useMemo, useState } = React
const html = htm.bind(React.createElement)

const stages = [
  { id: 1, name: "Sistem Kurulumu", desc: "Şirket, işyeri ve temel bordro parametrelerinin sisteme tanımlanması.", state: "completed", target: "01 Haz 2026", actual: "30 May 2026" },
  { id: 2, name: "Bordro Analiz Çalışmaları", desc: "Mevcut bordro verilerinin analizi ve paralel hesaplama hazırlıkları.", state: "completed", target: "08 Haz 2026", actual: "08 Haz 2026" },
  { id: 3, name: "Veri ve Doküman Doğrulama", desc: "Personel ana verisi, yan haklar ve yasal parametrelerin doğrulanması.", state: "pending_review", target: "18 Haz 2026", actual: null },
  { id: 4, name: "Paralel Bordro Testi", desc: "Müşteri bordrosu ile Datassist sonuçlarının karşılaştırılması.", state: "locked", target: "24 Haz 2026", actual: null },
  { id: 5, name: "Live Hazırlıkları", desc: "Son kontroller, banka dosyaları ve operasyon devir hazırlıkları.", state: "locked", target: "29 Haz 2026", actual: null },
  { id: 6, name: "Canlıya Geçiş", desc: "İlk resmi bordronun üretimi ve operasyon ekibine devir.", state: "locked", target: "05 Tem 2026", actual: null }
]

const stateMeta = {
  locked: { label: "Kilitli", tone: "neutral" },
  pending_upload: { label: "Dosya Bekleniyor", tone: "warning" },
  file_uploaded: { label: "Dosya Yüklendi", tone: "info" },
  pending_review: { label: "İnceleme Bekleniyor", tone: "warning" },
  pending_client_approval: { label: "Müşteri Onayı Bekleniyor", tone: "warning" },
  approved_pending_completion: { label: "Tamamlanmayı Bekliyor", tone: "success" },
  completed: { label: "Tamamlandı", tone: "success" }
}

const BUSINESS_MINUTES_PER_DAY = 8 * 60

const slaDefinitions = {
  client: {
    title: "Müşteri SLA",
    start: "27 May",
    deadline: "05 Tem",
    totalBusinessMinutes: 31 * BUSINESS_MINUTES_PER_DAY,
    remainingBusinessMinutes: 16 * BUSINESS_MINUTES_PER_DAY,
    remainingDisplay: "days",
    remainingLabel: "KALAN İŞ GÜNÜ",
    elapsed: "15"
  },
  stage: {
    title: "Adım Tamamlama SLA",
    start: "09 Haz",
    deadline: "18 Haz",
    totalBusinessMinutes: 7 * BUSINESS_MINUTES_PER_DAY,
    remainingBusinessMinutes: BUSINESS_MINUTES_PER_DAY,
    remainingDisplay: "days",
    remainingLabel: "KALAN İŞ GÜNÜ",
    elapsed: "6"
  },
  review: {
    title: "İnceleme Yanıt SLA",
    start: "13 Haz, 14:32",
    deadline: "16 Haz, 14:32",
    totalBusinessMinutes: BUSINESS_MINUTES_PER_DAY,
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

function getSlaMessage(key, status) {
  const messages = {
    client: {
      success: "Müşteri SLA'sı zamanında ilerliyor.",
      warning: "Müşteri SLA'sı kritik eşiğe ulaştı.",
      danger: "Müşteri SLA süresi aşıldı."
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
  { time: "Bugün, 14:32", user: "Elif Kaya", initials: "EK", event: "İncelemeye gönderildi", desc: "Personel_Ana_Veri_v2.xlsx inceleme için gönderildi.", tone: "blue" },
  { time: "Bugün, 14:18", user: "Mehmet Yılmaz", initials: "MY", event: "Dosya yüklendi", desc: "Personel_Ana_Veri_v2.xlsx · Versiyon 2", tone: "blue" },
  { time: "12 Haz, 16:44", user: "Elif Kaya", initials: "EK", event: "İnceleme reddedildi", desc: "Eksik banka IBAN bilgileri için revizyon istendi.", tone: "red" },
  { time: "12 Haz, 11:05", user: "Sistem", initials: "S", event: "Hedef tarih güncellendi", desc: "Hedef tarih 17 Haz'dan 18 Haz'a alındı. Cascade uygulandı (+1 iş günü).", tone: "orange" },
  { time: "09 Haz, 09:12", user: "Sistem", initials: "S", event: "Adım aktive edildi", desc: "Veri ve Doküman Doğrulama adımı başlatıldı.", tone: "green" }
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

function PageHeader({ workflowState, slas }) {
  const workflowHeaderMeta = {
    locked: {
      nextAction: "Önceki adımın tamamlanması bekleniyor.",
      expectedOwner: "Platform Admin"
    },
    pending_upload: {
      nextAction: "Client dosyasının yüklenmesi bekleniyor.",
      expectedOwner: "Client"
    },
    file_uploaded: {
      nextAction: "Dosyanın incelemeye gönderilmesi bekleniyor.",
      expectedOwner: "Client"
    },
    pending_review: {
      nextAction: "Datassist incelemesinin tamamlanması bekleniyor.",
      expectedOwner: "Datassist"
    },
    pending_client_approval: {
      nextAction: "Client onayının verilmesi bekleniyor.",
      expectedOwner: "Client"
    },
    approved_pending_completion: {
      nextAction: "Adımın tamamlanması bekleniyor.",
      expectedOwner: "Datassist"
    },
    completed: {
      nextAction: "Sonraki adımın aktive edilmesi bekleniyor.",
      expectedOwner: "Platform Admin"
    }
  }
  const workflowMeta = workflowHeaderMeta[workflowState] || {
    nextAction: "İş akışı durumunun doğrulanması bekleniyor.",
    expectedOwner: "Platform Admin"
  }
  const friendlyState = stateMeta[workflowState]?.label || "Durum Belirsiz"
  const nextAction = workflowMeta.nextAction
  const expectedOwner = workflowMeta.expectedOwner
  const activeStepSla = workflowState === "completed"
    ? { label: "Zamanında", tone: "success" }
    : slas.stage
  const overallSla = getOverallSlaStatus(Object.values(slas))
  const goLiveSla = slas.client

  return html`
    <section className="page-header">
      <div className="page-title-row">
        <div className="title-context">
          <h1>Anadolu Lojistik Operasyon</h1>
          <div className="project-meta" aria-label="Implementasyon bilgileri">
            <span><b>Bölüm:</b> Enterprise</span>
            <span><b>Geçiş Modeli:</b> Hızlı Geçiş</span>
          </div>
        </div>
        <div className="title-actions">
          <div className=${`status-center status-center--${overallSla.tone}`} aria-label="Durum Merkezi" aria-live="polite">
            <span className="status-center__title">Durum Merkezi</span>
            <div className="status-center__body">
              <div className="status-center__health">
                <span className=${`health-badge health-badge--${overallSla.tone}`}><i></i> ${overallSla.label}</span>
                <small>${overallSla.message}</small>
              </div>
              <div className="status-center__action">
                <span>Bekleyen İşlem</span>
                <strong>${nextAction}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="header-metrics">
        <div className="metric metric--stage"><span>Aktif Adım</span><strong>Veri ve Doküman Doğrulama</strong><div className="metric-inline"><small>Adım 3 / 6</small><b>${friendlyState}</b></div><div className="stage-operations"><div className="metric-target"><span>Hedef Tarih</span><div className="metric-target__value"><strong>18 Haziran 2026</strong><span className=${`active-sla-badge active-sla-badge--${activeStepSla.tone}`}><i></i>${activeStepSla.label}</span></div></div><div className="metric-responsible"><span>Aksiyon Beklenen Taraf</span><strong>${expectedOwner}</strong></div></div></div>
        <div className=${`metric metric--health-summary metric--health-summary--${overallSla.tone}`}><span>SLA Özeti</span><strong><i></i> ${overallSla.label}</strong><div className="health-counts"><div className="sla-stat"><b>4</b><small>Adım Zamanında</small></div><div className="sla-stat"><b>1</b><small>Adım Risk Altında</small></div><div className="sla-stat"><b>0</b><small>Adım Gecikti</small></div></div></div>
        <div className="metric metric--progress"><span>Genel İlerleme</span><div className="metric-progress-row"><strong>2 / 6 Tamamlandı</strong><small>4 Adım Kaldı</small></div><div className="progress"><i style=${{width:"33%"}}></i></div></div>
        <div className="metric metric--golive"><span>Hedef Canlıya Geçiş</span><div className="golive-value"><strong>05 Temmuz 2026</strong></div><div className="golive-meta"><small>${goLiveSla.remaining} İş Günü Kaldı</small><span className=${`golive-badge golive-badge--${goLiveSla.tone}`}><i></i> ${goLiveSla.label}</span></div></div>
        <div className="metric metric--owner"><span>İmplementasyon Uzmanı</span><div className="person"><span className="avatar avatar--soft">EK</span><div><strong>Elif Kaya</strong><small>İmplementasyon Uzmanı</small></div></div></div>
      </div>
    </section>`
}

function TimelineStage({ stage, active, onOpen }) {
  const meta = stateMeta[stage.state]
  return html`
    <button className=${`timeline-stage ${active ? "timeline-stage--active" : ""} timeline-stage--${stage.state}`} onClick=${() => onOpen(stage.id)}>
      <span className="timeline-node">${stage.state === "completed" ? html`<${Icon} name="check" size=${14}/>` : stage.state === "locked" ? html`<${Icon} name="lock" size=${13}/>` : stage.id}</span>
      <span className="stage-copy"><strong>${stage.name}</strong><small>${stage.desc}</small></span>
      <span className="stage-dates"><${Badge} tone=${meta.tone}>${meta.label}</${Badge}><small>Hedef <b>${stage.target}</b></small>${stage.actual ? html`<small>Tamamlandı <b>${stage.actual}</b></small>` : null}</span>
      <span className=${`stage-chevron ${active ? "is-open" : ""}`}><${Icon} name="down" size=${16}/></span>
    </button>`
}

function SectionCard({ title, subtitle, action, children, className = "" }) {
  const [open, setOpen] = useState(true)
  return html`<section className=${`card ${className}`}><div className="card__header"><button className="card__title" onClick=${() => setOpen(!open)}><span><strong>${title}</strong>${subtitle ? html`<small>${subtitle}</small>` : null}</span><span className=${open ? "open" : ""}><${Icon} name="down" size=${17}/></span></button>${action}</div>${open ? html`<div className="card__body">${children}</div>` : null}</section>`
}

function Timeline({ activeStage, setActiveStage }) {
  const [optionalOpen, setOptionalOpen] = useState(false)
  return html`
    <${SectionCard} title="İmplementasyon Zaman Çizelgesi" subtitle="Temel adımlar ve mevcut iş akışı durumu">
      <div className="timeline">${stages.map(s => html`<${TimelineStage} key=${s.id} stage=${s} active=${activeStage === s.id} onOpen=${setActiveStage}/>` )}</div>
      <div className="optional-block"><button onClick=${() => setOptionalOpen(!optionalOpen)}><span><strong>Opsiyonel Modüller</strong><small>Bu implementasyon için etkinleştirilmedi</small></span><span><${Badge}>Devre Dışı</${Badge}><${Icon} name="down" size=${16}/></span></button>${optionalOpen ? html`<div className="optional-list"><span>Rapor Geliştirme ve Entegrasyon</span><span>Muhasebe Rapor Kurulumu</span></div>` : null}</div>
    </${SectionCard}>`
}

function CurrentStage({ workflowState }) {
  const meta = stateMeta[workflowState]
  return html`
    <${SectionCard} title="Aktif Adım Çalışma Alanı" subtitle="Adım 3 · Veri ve Doküman Doğrulama" className="active-workspace">
      <div className="stage-summary">
        <div className="stage-summary__lead"><span className="stage-index">03</span><div><strong>Veri ve Doküman Doğrulama</strong><p>Personel ana verisi, yan haklar, banka bilgileri ve yasal parametrelerin eksiksiz ve doğru olduğunun kontrol edilmesi.</p></div></div>
        <${Badge} tone=${meta.tone}>${meta.label}</${Badge}>
      </div>
      <div className="detail-grid">
        <div><span>ATANAN KULLANICI</span><div className="person person--compact"><span className="avatar avatar--soft">MY</span><strong>Mehmet Yılmaz</strong></div></div>
        <div><span>MEVCUT DURUM</span><strong>${meta.label}</strong></div>
        <div><span>PLANLANAN HEDEF</span><strong>18 Haziran 2026</strong></div>
        <div><span>GERÇEKLEŞEN TARİH</span><strong>—</strong></div>
        <div><span>GECİKME</span><strong className="text-orange">1 iş günü</strong></div>
      </div>
      <div className="cascade"><span className="cascade__icon"><${Icon} name="alert" size=${17}/></span><div><strong>Cascade uygulandı</strong><p>Adım 4–6 hedefleri müşteri kaynaklı gecikme nedeniyle <b>1 iş günü</b> ileri alındı.</p></div><${Badge} tone="warning">3 adım etkilendi</${Badge}></div>
    </${SectionCard}>`
}

function Documents({ workflowState, setWorkflowState, addAudit }) {
  const [version, setVersion] = useState(2)
  const upload = () => { setVersion(v => v + 1); setWorkflowState("file_uploaded"); addAudit("Dosya yüklendi", `Personel_Ana_Veri_v${version + 1}.xlsx · Versiyon ${version + 1}`, "blue") }
  const canUpload = ["pending_upload", "file_uploaded"].includes(workflowState)
  return html`
    <${SectionCard} title="Dokümanlar" subtitle="1 zorunlu dosya · ${version} versiyon" action=${canUpload ? html`<button className="btn btn--secondary" onClick=${upload}><${Icon} name="upload" size=${15}/> ${version > 1 ? "Yeni Versiyon Yükle" : "Dosya Yükle"}</button>` : null}>
      <div className="file-table"><div className="file-table__head"><span>DOSYA</span><span>YÜKLEYEN</span><span>YÜKLEME TARİHİ</span><span>DURUM</span><span></span></div>
        <div className="file-row"><span className="file-name"><i>X</i><span><strong>Personel_Ana_Veri_v${version}.xlsx</strong><small>4.8 MB · Excel · Versiyon ${version}</small></span></span><span className="uploader"><span className="avatar avatar--tiny">MY</span>Mehmet Yılmaz</span><span>13 Haz 2026<br/><small>14:18</small></span><span><${Badge} tone=${workflowState === "pending_review" ? "warning" : "info"}>${workflowState === "pending_review" ? "İncelemede" : "Yüklendi"}</${Badge}></span><span className="row-actions"><button title="Önizle"><${Icon} name="eye" size=${16}/></button><button title="İndir"><${Icon} name="download" size=${16}/></button></span></div>
        ${version > 1 ? html`<details className="versions"><summary><span>Önceki versiyonlar</span><span>Versiyon ${version - 1} <${Icon} name="down" size=${14}/></span></summary><div><span className="file-name"><i>X</i><span><strong>Personel_Ana_Veri_v${version - 1}.xlsx</strong><small>4.7 MB · 12 Haz 2026, 10:42</small></span></span><${Badge} tone="danger">Reddedildi</${Badge}><button title="İndir"><${Icon} name="download" size=${16}/></button></div></details>` : null}
      </div>
    </${SectionCard}>`
}

function Review({ workflowState, setWorkflowState, addAudit }) {
  const approve = () => { setWorkflowState("approved_pending_completion"); addAudit("İnceleme onaylandı", "Versiyon 2 onaylandı; adım tamamlanmayı bekliyor.", "green") }
  const reject = () => { setWorkflowState("pending_upload"); addAudit("İnceleme reddedildi", "Yeni versiyon yüklenmesi istendi.", "red") }
  return html`
    <${SectionCard} title="İnceleme Süreci" subtitle="2 inceleme denemesi">
      <div className="review-status"><div><span>GÜNCEL İNCELEME DURUMU</span><strong>${stateMeta[workflowState].label}</strong><small>Gönderim: 13 Haz 2026, 14:32 · Elif Kaya</small></div>${workflowState === "pending_review" ? html`<div className="review-actions"><button className="btn btn--danger" onClick=${reject}><${Icon} name="x" size=${15}/> Reddet</button><button className="btn btn--success" onClick=${approve}><${Icon} name="check" size=${15}/> Onayla</button></div>` : html`<${Badge} tone=${stateMeta[workflowState].tone}>${stateMeta[workflowState].label}</${Badge}>`}</div>
      <div className="review-history"><div className="review-attempt review-attempt--current"><div className="attempt-head"><span><b>Versiyon 2</b><small>13 Haz 2026 · Güncel</small></span><${Badge} tone=${workflowState === "approved_pending_completion" ? "success" : workflowState === "pending_upload" ? "danger" : "warning"}>${workflowState === "approved_pending_completion" ? "Onaylandı" : workflowState === "pending_upload" ? "Reddedildi" : "İnceleniyor"}</${Badge}></div><p>${workflowState === "approved_pending_completion" ? "Dosya kontrol edildi; tüm zorunlu alanlar eksiksiz." : "Güncellenen personel ana veri dosyası incelemeye alındı."}</p></div><div className="review-attempt"><div className="attempt-head"><span><b>Versiyon 1</b><small>12 Haz 2026 · Elif Kaya</small></span><${Badge} tone="danger">Reddedildi</${Badge}></div><blockquote>“17 çalışanın banka IBAN bilgisi eksik. Eksik alanları tamamlayıp yeni versiyon yükleyin.”</blockquote><small>Karar: 12 Haz 2026, 16:44 · 5 sa 39 dk içinde</small></div></div>
    </${SectionCard}>`
}

function Audit({ items }) {
  return html`<${SectionCard} title="Audit Geçmişi" subtitle="Tüm aktiviteler kronolojik olarak kaydedilir"><div className="audit-list">${items.map((a,i)=>html`<div className="audit-item" key=${i}><span className=${`audit-dot audit-dot--${a.tone}`}></span><span className="avatar avatar--tiny">${a.initials}</span><div><div><strong>${a.event}</strong><span>${a.time}</span></div><p>${a.desc}</p><small>${a.user}</small></div></div>`)}</div><button className="show-more">Tüm geçmişi göster</button></${SectionCard}>`
}

function SlaCard({ sla }) {
  const [open, setOpen] = useState(true)
  return html`<section className="side-card sla-card"><button className="side-card__header" onClick=${() => setOpen(!open)}><strong>${sla.title}</strong><span><${Badge} tone=${sla.tone}>${sla.label}</${Badge}><span className=${open ? "open" : ""}><${Icon} name="down" size=${15}/></span></span></button>${open ? html`<div className="sla-body"><div className="sla-primary"><span>${sla.remainingLabel}</span><strong>${sla.remaining}</strong><small>${sla.deadline} tarihine kadar</small></div><div className="sla-progress"><i className=${`sla-progress--${sla.tone}`} style=${{width:`${sla.progress}%`}}></i></div><div className="sla-grid"><span>Başlangıç <b>${sla.start}</b></span><span>Son Tarih <b>${sla.deadline}</b></span><span>Geçen İş Süresi <b>${sla.elapsed}</b></span><span>Durum <b>${sla.label}</b></span></div></div>` : null}</section>`
}

function Alerts({ slas }) {
  const warningCount = Object.values(slas).filter(sla => sla.tone === "warning" || sla.tone === "danger").length
  return html`<section className="side-card"><div className="side-title"><strong>SLA Uyarıları</strong><span className="count">${warningCount}</span></div><div className="alerts"><div className="alert alert--red"><${Icon} name="alert" size=${16}/><span><strong>Adım hedefi yaklaşıyor</strong><small>1 iş günü kaldı</small></span></div><div className="alert alert--blue"><${Icon} name="clock" size=${16}/><span><strong>İnceleme süresi devam ediyor</strong><small>Zamanında</small></span></div><div className="alert alert--blue"><${Icon} name="layers" size=${16}/><span><strong>Cascade uygulandı</strong><small>3 adım · +1 iş günü</small></span></div></div></section>`
}

function QuickActions({ state, setState, addAudit }) {
  const action = (next,event,desc) => { setState(next); addAudit(event,desc,"blue") }
  return html`<section className="side-card quick-card"><div className="side-title"><strong>Hızlı İşlemler</strong></div><div className="quick-actions">
    ${state === "pending_upload" ? html`<button className="btn btn--primary" onClick=${() => action("file_uploaded","Dosya yüklendi","Yeni dosya versiyonu yüklendi.")}><${Icon} name="upload"/> Dosya Yükle</button>` : null}
    ${state === "file_uploaded" ? html`<${React.Fragment}><button className="btn btn--primary" onClick=${() => action("pending_review","İncelemeye gönderildi","Güncel dosya incelemeye gönderildi.")}><${Icon} name="send"/> İncelemeye Gönder</button><button className="btn btn--secondary"><${Icon} name="upload"/> Dosyayı Değiştir</button></${React.Fragment}>` : null}
    ${state === "pending_review" ? html`<${React.Fragment}><button className="btn btn--success" onClick=${() => action("approved_pending_completion","İnceleme onaylandı","Versiyon 2 onaylandı.")}><${Icon} name="check"/> Onayla</button><button className="btn btn--danger" onClick=${() => action("pending_upload","İnceleme reddedildi","Yeni versiyon istendi.")}><${Icon} name="x"/> Reddet</button></${React.Fragment}>` : null}
    ${state === "approved_pending_completion" ? html`<button className="btn btn--success btn--solid" onClick=${() => action("completed","Adım tamamlandı","Veri ve Doküman Doğrulama tamamlandı.")}><${Icon} name="check"/> Adımı Tamamla</button>` : null}
    ${state === "completed" ? html`<div className="completed-note"><${Icon} name="check"/><span><strong>Adım tamamlandı</strong><small>İşlem yapılmasına gerek yok</small></span></div>` : null}
    <button className="btn btn--secondary"><${Icon} name="calendar"/> Takvimi Görüntüle</button>
  </div></section>`
}

function App() {
  const [activeStage, setActiveStage] = useState(3)
  const [workflowState, setWorkflowState] = useState("pending_review")
  const [audit, setAudit] = useState(initialAudit)
  const slas = useMemo(() => Object.fromEntries(Object.entries(slaDefinitions).map(([key, sla]) => [key, enrichSla(key, sla)])), [])
  const addAudit = (event, desc, tone) => setAudit(items => [{time:"Şimdi",user:"Elif Kaya",initials:"EK",event,desc,tone}, ...items])
  return html`<div className="app"><${Sidebar}/><main><${Topbar}/><div className="content"><${PageHeader} workflowState=${workflowState} slas=${slas}/><div className="workspace-grid"><div className="workspace-main"><${Timeline} activeStage=${activeStage} setActiveStage=${setActiveStage}/><${CurrentStage} workflowState=${workflowState}/><${Documents} workflowState=${workflowState} setWorkflowState=${setWorkflowState} addAudit=${addAudit}/><${Review} workflowState=${workflowState} setWorkflowState=${setWorkflowState} addAudit=${addAudit}/><${Audit} items=${audit}/></div><aside className="right-rail"><${SlaCard} sla=${slas.client}/><${SlaCard} sla=${slas.stage}/><${SlaCard} sla=${slas.review}/><${Alerts} slas=${slas}/><${QuickActions} state=${workflowState} setState=${setWorkflowState} addAudit=${addAudit}/></aside></div></div></main></div>`
}

ReactDOM.createRoot(document.getElementById("app")).render(html`<${App}/>`)
