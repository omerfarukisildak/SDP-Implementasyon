const { useMemo, useState } = React
const html = htm.bind(React.createElement)

const seedWorkgroups = [
  {
    id: "wg-214",
    name: "Anadolu Lojistik Operasyon",
    users: [
      { id: "u-214-1", firstName: "Bora", lastName: "Demir", email: "b.demir@anadolu.com", role: "editor" },
      { id: "u-214-2", firstName: "Selin", lastName: "Acar", email: "selin.acar@datassist.com", role: "viewer" }
    ]
  },
  {
    id: "wg-208",
    name: "Marmara Grup Bordro",
    users: [
      { id: "u-208-1", firstName: "Okan", lastName: "Tuna", email: "okan.tuna@marmara.com", role: "viewer" }
    ]
  },
  {
    id: "wg-197",
    name: "Nova Retail HR",
    users: [
      { id: "u-197-1", firstName: "Dilan", lastName: "Demir", email: "dilan.demir@datassist.com", role: "editor" },
      { id: "u-197-2", firstName: "Ece", lastName: "Akin", email: "ece.akin@novaretail.com", role: "viewer" }
    ]
  }
]

const roleOptions = [
  {
    value: "editor",
    label: "Duzenleyici",
    description:
      "Workgroup icindeki verileri goruntuleyebilir, veri yukleyebilir ve dokumanlari indirebilir."
  },
  {
    value: "viewer",
    label: "Goruntuleyici",
    description:
      "Yalnizca verileri goruntuleyebilir ve dokumanlari indirebilir. Veri yukleme yapamaz."
  }
]

const implementationBaseSteps = [
  { id: "system-setup", number: "01", title: "Sistem Kurulumu" },
  { id: "parallel-cost", number: "02", title: "Bordro Analiz Calismalari" },
  { id: "implementation-report", number: "03", title: "Rapor Gelistirme ve Entegrasyon" },
  { id: "transition-call", number: "04", title: "Muhasebe Rapor Kurulumu" },
  { id: "integrations", number: "05", title: "Live Hazirliklari" },
  { id: "operations-handover", number: "06", title: "Canliya Gecis" }
]

const implementationTaskPlaceholderDescription = "Aciklama yazilari guncellenecektir."

const implementationTaskSeeds = [
  {
    id: "task-company-workplace",
    title: "1.1 Sirket ve Isyeri Bilgileri",
    infoTooltip:
      "Bu alan, sistem kurulumunda sirket ve isyeri tanimlarinin dogru sekilde aktarilabilmesi icin istenen temel excel formatlarini kapsar.",
    status: "revision_requested",
    templates: [
      { id: "template-company", label: "Sirket Bilgileri Formati" },
      { id: "template-workplace", label: "Isyeri Bilgileri Formati" }
    ],
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
    templates: [{ id: "template-operational", label: "Operasyonel Bilgiler Formati" }],
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
    templates: [{ id: "template-personnel", label: "Personel Info Formati" }],
    uploads: []
  },
  {
    id: "task-cost-mapping",
    title: "1.4 Masraf Merkezi Cost Mapping",
    status: "approved",
    templates: [{ id: "template-cost-mapping", label: "Cost Mapping Formati" }],
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
    templates: [{ id: "template-carried-over", label: "Carried Over Formati" }],
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

const implementationInitialMessages = [
  {
    id: "msg-1",
    type: "implementation",
    author: "Implementasyon Ekibi",
    text: "Sistem kurulumu altindaki formatlari sirayla tamamlayip yuklediginizde inceleme surecini hizlandirabiliriz.",
    time: "09:12"
  },
  {
    id: "msg-2",
    type: "system",
    text: "Masraf Merkezi Cost Mapping dosyasi onaylandi.",
    time: "10:08"
  },
  {
    id: "msg-3",
    type: "client",
    author: "Musteri",
    text: "Operasyonel bilgiler dosyasini guncelleyip tekrar yukledik, revize notlarini dikkate aldik.",
    time: "10:26"
  },
  {
    id: "msg-4",
    type: "implementation",
    author: "Implementasyon Ekibi",
    text: "Tesekkurler, sirket ve isyeri bilgileri dosyasinda isyeri kod alanini revize etmeniz gerekiyor. Notu kart icinde gorebilirsiniz.",
    time: "10:41"
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

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function classNames(...values) {
  return values.filter(Boolean).join(" ")
}

function getRoleMeta(role) {
  return roleOptions.find((option) => option.value === role) || roleOptions[1]
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

function getInitials(value) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) {
    return "WG"
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

function Sidebar({
  activePage,
  mode,
  workgroups,
  selectedWorkgroup,
  onCreateNewWorkgroup,
  onSelectWorkgroup,
  onPageChange
}) {
  const [isWorkgroupMenuOpen, setIsWorkgroupMenuOpen] = useState(false)
  const displayedWorkgroupName =
    activePage === "users" && mode === "create"
      ? "Yeni Workgroup"
      : selectedWorkgroup?.name || "Workgroup Secin"
  const displayedInitials = getInitials(displayedWorkgroupName)

  return html`
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 overflow-y-auto border-r border-[#EAECF0] bg-white lg:flex lg:flex-col">
      <div className="px-6 py-6">
        <img src="Assets/datassist-logo.png" alt="Datassist" className="h-auto w-[132px]" />
      </div>

      <div className="space-y-4 px-4">
        <div className="relative">
          <button
            type="button"
            onClick=${() => setIsWorkgroupMenuOpen((current) => !current)}
            className="w-full text-left"
          >
            <div className="flex items-center gap-3 rounded-[18px] border border-[#EEF2F7] bg-white px-4 py-3 shadow-subtle transition hover:border-[#D8E0EC]">
              <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[16px] bg-[#F2F4F7] text-[22px] font-semibold tracking-[-0.02em] text-[#101828]">
                ${displayedInitials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-[#667085]">Workgroup</p>
                <p className="mt-1 truncate text-[15px] font-semibold tracking-[-0.02em] text-[#101828]">
                  ${displayedWorkgroupName}
                </p>
              </div>

              <span className="shrink-0 text-[#98A2B3]">
                <${SelectorIcon} />
              </span>
            </div>
          </button>

          ${
            isWorkgroupMenuOpen
              ? html`
                  <div className="absolute inset-x-0 top-[calc(100%+10px)] z-30 rounded-[18px] border border-[#EEF2F7] bg-white p-2 shadow-[0_16px_32px_rgba(16,24,40,0.10)]">
                    <button
                      type="button"
                      onClick=${() => {
                        onCreateNewWorkgroup()
                        setIsWorkgroupMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-[#101828] transition hover:bg-[#F8FAFC]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#F5F7FB] text-[#2F6FED]">
                        <${PlusIcon} />
                      </span>
                      <span>Yeni Workgroup Olustur</span>
                    </button>

                    <div className="my-2 h-px bg-[#F2F4F7]"></div>

                    <div className="space-y-1">
                      ${workgroups.map(
                        (workgroup) => html`
                          <button
                            key=${workgroup.id}
                            type="button"
                            onClick=${() => {
                              onSelectWorkgroup(workgroup.id)
                              setIsWorkgroupMenuOpen(false)
                            }}
                            className=${classNames(
                              "flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition",
                              mode === "existing" && selectedWorkgroup?.id === workgroup.id
                                ? "bg-[#F5F7FB]"
                                : "hover:bg-[#F8FAFC]"
                            )}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F2F4F7] text-[12px] font-semibold text-[#344054]">
                              ${getInitials(workgroup.name)}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-medium text-[#101828]">
                                ${workgroup.name}
                              </span>
                              <span className="mt-0.5 block text-[12px] text-[#667085]">
                                ${(workgroup.users || []).length} kullanici
                              </span>
                            </span>
                          </button>
                        `
                      )}
                    </div>
                  </div>
                `
              : null
          }
        </div>

        <div className="rounded-[18px] border border-[#EEF2F7] bg-white px-4 py-3 shadow-subtle">
          <div className="flex items-center gap-3">
            <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[16px] bg-[#F2F4F7] text-[22px] font-semibold tracking-[-0.02em] text-[#101828]">
              IG
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-[#667085]">Calisma Alani</p>
              <p className="mt-1 truncate text-[15px] font-semibold tracking-[-0.02em] text-[#101828]">
                Implementasyon
              </p>
            </div>

            <span className="shrink-0 text-[#98A2B3]">
              <${SelectorIcon} />
            </span>
          </div>
        </div>
      </div>

      <nav className="mt-8 space-y-6 px-4">
        <div>
          <p className="mb-2 px-3 text-[12px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
            Genel
          </p>
          <button
            type="button"
            onClick=${() => onPageChange("processes")}
            className=${classNames(
              "flex w-full items-center rounded-[10px] px-3 py-2.5 text-left text-[14px] transition",
              activePage === "processes"
                ? "bg-[#F5F7FB] font-semibold text-[#101828]"
                : "font-medium text-[#667085] hover:bg-[#F8FAFC]"
            )}
          >
            Implementasyon Surecleri
          </button>
        </div>

        <div>
          <p className="mb-2 px-3 text-[12px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
            Admin
          </p>
          <button
            type="button"
            onClick=${() => onPageChange("users")}
            className=${classNames(
              "flex w-full items-center rounded-[10px] px-3 py-2.5 text-left text-[14px] transition",
              activePage === "users"
                ? "bg-[#F5F7FB] font-semibold text-[#101828]"
                : "font-medium text-[#667085] hover:bg-[#F8FAFC]"
            )}
          >
            Kullanici Yonetimi
          </button>
        </div>
      </nav>

      <div className="mt-auto px-4 py-6">
        <button
          type="button"
          className="w-full rounded-[10px] border border-[#D0D5DD] bg-white px-4 py-2.5 text-[14px] font-medium text-[#344054] shadow-subtle"
        >
          Tum uygulamalar
        </button>
      </div>
    </aside>
  `
}

function TopBar({ activePage, mode }) {
  const breadcrumb =
    activePage === "processes"
      ? "Genel / Implementasyon Surecleri"
      : mode === "create"
        ? "Admin / Yeni Workgroup Olustur"
        : "Admin / Kullanici Yonetimi"
  const maxWidthClass = activePage === "processes" ? "max-w-[1440px]" : "max-w-[1120px]"

  return html`
    <div className="border-b border-[#EAECF0] bg-white/90 px-6 py-4 backdrop-blur">
      <div className=${classNames("mx-auto flex w-full items-center justify-between", maxWidthClass)}>
        <div>
          <p className="text-[13px] font-medium text-[#667085]">${breadcrumb}</p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-9 items-center rounded-full border border-[#E4E7EC] bg-white px-3 text-[12px] font-medium text-[#344054]"
          >
            Implementasyon Kullanicisi
          </span>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F4F7] text-[12px] font-semibold text-[#101828]"
          >
            DD
          </div>
        </div>
      </div>
    </div>
  `
}

function WorkgroupHeader({ mode, selectedWorkgroup }) {
  const title = mode === "create" ? "Yeni Workgroup Olustur" : "Workgroup Kullanicilari"
  const description =
    mode === "create"
      ? "Yeni bir workgroup tanimlayin ve ilk kullanicilarini hazirlayin."
      : `Secili workgroup: ${selectedWorkgroup?.name || "Workgroup Secin"}`

  return html`
    <header className="space-y-4">
      <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#101828]">
        ${title}
      </h1>
      <p className="text-[14px] text-[#667085]">${description}</p>
    </header>
  `
}

function WorkgroupInfoCard({
  mode,
  workgroupName,
  onWorkgroupNameChange,
  selectedWorkgroup
}) {
  const isCreateMode = mode === "create"

  return html`
    <section className="rounded-[14px] border border-[#EEF2F7] bg-white p-6">
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-[16px] font-semibold text-[#101828]">
            ${isCreateMode ? "Workgroup Bilgileri" : "Mevcut Workgroup"}
          </h2>
        </div>

        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-[#101828]">
            ${isCreateMode ? "Workgroup Adi" : "Secili Workgroup"}
          </span>

          ${
            isCreateMode
              ? html`
                  <input
                    type="text"
                    value=${workgroupName}
                    onInput=${(event) => onWorkgroupNameChange(event.target.value)}
                    placeholder="Ornek: Ege Perakende Bordro Ekibi"
                    className="h-11 w-full rounded-[10px] border border-[#E4E7EC] px-[14px] text-[14px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF] placeholder:text-[#98A2B3]"
                  />
                `
              : html`
                  <div className="flex min-h-11 items-center rounded-[10px] border border-[#E4E7EC] bg-[#FCFCFD] px-[14px] text-[14px] font-medium text-[#101828]">
                    ${selectedWorkgroup?.name || "Workgroup secilmedi"}
                  </div>
                `
          }

          <span className="mt-2 block text-[12px] text-[#667085]">
            ${
              isCreateMode
                ? "Bu workgroup icerisinde implementasyon ekibinde yer alan kullanicilar birlikte calisacaktir."
                : "Bu alanda yalnizca secili workgroup'un kullanicilari listelenir ve yeni kullanici eklenir."
            }
          </span>
        </label>
      </div>
    </section>
  `
}

function AddUserRow({ draft, onChange, onSubmit, emailError }) {
  const selectedRole = getRoleMeta(draft.role)

  return html`
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-[16px] font-semibold text-[#101828]">Workgroup Kullanicilari</h2>
      </div>

      <form
        onSubmit=${onSubmit}
        className="grid grid-cols-1 gap-4 md:grid-cols-[20%_20%_30%_20%_10%] md:items-start"
      >
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-[#101828]">Ad</span>
          <input
            type="text"
            value=${draft.firstName}
            onInput=${(event) => onChange("firstName", event.target.value)}
            placeholder="Ad"
            className="h-10 w-full rounded-[10px] border border-[#E4E7EC] px-[14px] text-[14px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF] placeholder:text-[#98A2B3]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-[#101828]">Soyad</span>
          <input
            type="text"
            value=${draft.lastName}
            onInput=${(event) => onChange("lastName", event.target.value)}
            placeholder="Soyad"
            className="h-10 w-full rounded-[10px] border border-[#E4E7EC] px-[14px] text-[14px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF] placeholder:text-[#98A2B3]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-[#101828]">E-posta</span>
          <input
            type="email"
            value=${draft.email}
            onInput=${(event) => onChange("email", event.target.value)}
            placeholder="ornek@sirket.com"
            aria-invalid=${Boolean(emailError)}
            className=${classNames(
              "h-10 w-full rounded-[10px] border px-[14px] text-[14px] text-[#101828] outline-none transition placeholder:text-[#98A2B3]",
              emailError
                ? "border-[#F04438] focus:border-[#F04438] focus:ring-4 focus:ring-[#FEE4E2]"
                : "border-[#E4E7EC] focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
            )}
          />
          ${
            emailError
              ? html`<span className="mt-2 block text-[12px] text-[#F04438]">${emailError}</span>`
              : null
          }
        </label>

        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-[#101828]">Rol</span>
          <select
            value=${draft.role}
            onChange=${(event) => onChange("role", event.target.value)}
            className="h-10 w-full rounded-[8px] border border-[#E4E7EC] bg-white px-3 text-[14px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
          >
            ${roleOptions.map(
              (option) => html`
                <option key=${option.value} value=${option.value}>${option.label}</option>
              `
            )}
          </select>
          <span className="mt-2 block text-[12px] text-[#667085]">${selectedRole.description}</span>
        </label>

        <div className="md:pt-[29px]">
          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-[8px] bg-[#2F6FED] px-3 text-[12px] font-semibold text-white transition hover:bg-[#285FD0]"
          >
            Kullaniciyi Ekle
          </button>
        </div>
      </form>
    </div>
  `
}

function UsersDraftTable({ users, onRemoveUser }) {
  return html`
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-[#101828]">Eklenecek Kullanicilar</h3>
        <span className="text-[13px] font-medium text-[#667085]">${users.length} kullanici</span>
      </div>

      ${
        users.length
          ? html`
              <div className="overflow-hidden rounded-[12px] border border-[#EEF2F7]">
                <table className="w-full table-fixed border-collapse">
                  <thead className="bg-[#FCFCFD]">
                    <tr className="h-12 text-left text-[12px] font-medium uppercase tracking-[0.04em] text-[#667085]">
                      <th className="px-4">Ad</th>
                      <th className="px-4">Soyad</th>
                      <th className="px-4">E-posta</th>
                      <th className="px-4">Rol</th>
                      <th className="w-[72px] px-4 text-right">Kaldir</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${users.map(
                      (user) => html`
                        <tr
                          key=${user.id}
                          className="h-12 border-t border-[#F1F3F5] text-[14px] text-[#344054]"
                        >
                          <td className="px-4">${user.firstName}</td>
                          <td className="px-4">${user.lastName}</td>
                          <td className="truncate px-4">${user.email}</td>
                          <td className="px-4">
                            <${RoleBadge} role=${user.role} />
                          </td>
                          <td className="px-4">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick=${() => onRemoveUser(user.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#667085] transition hover:bg-[#F9FAFB]"
                                aria-label="Kullaniciyi kaldir"
                              >
                                <${TrashIcon} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      `
                    )}
                  </tbody>
                </table>
              </div>
            `
          : html`
              <div
                className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-[#E4E7EC] bg-[#FCFCFD] px-6 py-12 text-center"
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F7FB] text-[#98A2B3]"
                >
                  <${UsersIcon} />
                </div>
                <h3 className="text-[14px] font-semibold text-[#101828]">
                  Henuz kullanici eklenmedi
                </h3>
                <p className="mt-2 max-w-[420px] text-[14px] text-[#667085]">
                  Workgroup olustururken eklemek istediginiz kullanicilari yukaridaki alani
                  kullanarak listeye ekleyebilirsiniz.
                </p>
              </div>
            `
      }
    </div>
  `
}

function InlineAddUserTableRow({ draft, onChange, emailError }) {
  return html`
    <tr className="border-t border-[#F1F3F5] bg-[#FCFCFD]">
      <td className="px-4 py-3">
        <input
          type="text"
          value=${draft.firstName}
          onInput=${(event) => onChange("firstName", event.target.value)}
          placeholder="Ad"
          className="h-10 w-full rounded-[8px] border border-[#E4E7EC] bg-white px-3 text-[13px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF] placeholder:text-[#98A2B3]"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          value=${draft.lastName}
          onInput=${(event) => onChange("lastName", event.target.value)}
          placeholder="Soyad"
          className="h-10 w-full rounded-[8px] border border-[#E4E7EC] bg-white px-3 text-[13px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF] placeholder:text-[#98A2B3]"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="email"
          value=${draft.email}
          onInput=${(event) => onChange("email", event.target.value)}
          placeholder="ornek@sirket.com"
          aria-invalid=${Boolean(emailError)}
          className=${classNames(
            "h-10 w-full rounded-[8px] border bg-white px-3 text-[13px] text-[#101828] outline-none transition placeholder:text-[#98A2B3]",
            emailError
              ? "border-[#F04438] focus:border-[#F04438] focus:ring-4 focus:ring-[#FEE4E2]"
              : "border-[#E4E7EC] focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
          )}
        />
      </td>
      <td className="px-4 py-3">
        <select
          value=${draft.role}
          onChange=${(event) => onChange("role", event.target.value)}
          className="h-10 w-full rounded-[8px] border border-[#E4E7EC] bg-white px-3 text-[13px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
        >
          ${roleOptions.map(
            (option) => html`
              <option key=${option.value} value=${option.value}>${option.label}</option>
            `
          )}
        </select>
      </td>
      <td className="px-4 py-3">
        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-[8px] bg-[#2F6FED] px-3 text-[12px] font-semibold text-white transition hover:bg-[#285FD0]"
        >
          Ekle
        </button>
      </td>
    </tr>
  `
}

function CurrentUsersTable({
  users,
  pendingUsers,
  showAddForm,
  draft,
  onChange,
  onSubmit,
  onStartAdd,
  emailError,
  feedback,
  feedbackTone
}) {
  const visibleUsers = [
    ...users.map((user) => ({ ...user, pending: false })),
    ...pendingUsers.map((user) => ({ ...user, pending: true }))
  ]

  const feedbackClass =
    feedbackTone === "error"
      ? "text-[#D92D20]"
      : feedbackTone === "success"
        ? "text-[#067647]"
        : "text-[#667085]"

  return html`
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-[#101828]">Mevcut Kullanicilar</h3>
        <span className="text-[13px] font-medium text-[#667085]">
          ${visibleUsers.length} kullanici
        </span>
      </div>

      ${
        visibleUsers.length || showAddForm
          ? html`
              <form onSubmit=${onSubmit} noValidate>
                <div className="overflow-hidden rounded-[12px] border border-[#EEF2F7]">
                  <table className="w-full table-fixed border-collapse">
                    <thead className="bg-[#FCFCFD]">
                      <tr className="h-12 text-left text-[12px] font-medium uppercase tracking-[0.04em] text-[#667085]">
                        <th className="px-4">Ad</th>
                        <th className="px-4">Soyad</th>
                        <th className="px-4">E-posta</th>
                        <th className="px-4">Rol</th>
                        <th className="w-[132px] px-4 text-right">Islem</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${visibleUsers.map(
                        (user) => html`
                          <tr
                            key=${user.id}
                            className=${classNames(
                              "h-12 border-t border-[#F1F3F5] text-[14px]",
                              user.pending ? "bg-[#FFFCF5] text-[#694100]" : "text-[#344054]"
                            )}
                          >
                            <td className="px-4">${user.firstName}</td>
                            <td className="px-4">${user.lastName}</td>
                            <td className="truncate px-4">${user.email}</td>
                            <td className="px-4">
                              <${RoleBadge} role=${user.role} />
                            </td>
                            <td className="px-4">
                              ${
                                user.pending
                                  ? html`
                                      <div className="flex justify-end">
                                        <span className="inline-flex h-7 items-center rounded-full border border-[#F7D79A] bg-[#FFFAEB] px-2.5 text-[11px] font-semibold text-[#B54708]">
                                          Kaydedilmedi
                                        </span>
                                      </div>
                                    `
                                  : null
                              }
                            </td>
                          </tr>
                        `
                      )}
                      ${
                        showAddForm
                          ? html`
                              <${InlineAddUserTableRow}
                                draft=${draft}
                                onChange=${onChange}
                                emailError=${emailError}
                              />
                            `
                          : null
                      }
                    </tbody>
                  </table>
                </div>
              </form>
            `
          : html`
              <div
                className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-[#E4E7EC] bg-[#FCFCFD] px-6 py-10 text-center"
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F7FB] text-[#98A2B3]"
                >
                  <${UsersIcon} />
                </div>
                <h3 className="text-[14px] font-semibold text-[#101828]">
                  Henuz kullanici bulunmuyor
                </h3>
                <p className="mt-2 max-w-[420px] text-[14px] text-[#667085]">
                  Bu workgroup icine henuz kullanici eklenmedi. Ilk kullaniciyi eklemek icin
                  asagidaki aksiyonu kullanin.
                </p>
              </div>
            `
      }

      <div className="space-y-4">
        <div className="min-h-[20px]">
          ${
            feedback
              ? html`<p className=${classNames("text-[13px]", feedbackClass)}>${feedback}</p>`
              : null
          }
        </div>

        <div className="flex items-center justify-between gap-4">
          ${
            !showAddForm
              ? html`
                  <button
                    type="button"
                    onClick=${onStartAdd}
                    className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#D0D5DD] bg-white px-4 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
                  >
                    Yeni Kullanici Ekle
                  </button>
                `
              : html`<div></div>`
          }
        </div>
      </div>
    </div>
  `
}

function ExistingUsersSection({
  workgroup,
  pendingUsers,
  showAddForm,
  draft,
  onDraftChange,
  onAddUser,
  onStartAdd,
  onDiscardChanges,
  onSaveChanges,
  emailError,
  feedback,
  feedbackTone,
  hasPendingChanges
}) {
  return html`
    <section className="rounded-[14px] border border-[#EEF2F7] bg-white p-6">
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-[16px] font-semibold text-[#101828]">${workgroup.name}</h2>
          <p className="text-[14px] text-[#667085]">
            Workgroup icindeki mevcut kullanicilari listeleyin ve ihtiyac halinde ayni listenin
            sonuna yeni kullanici ekleyin.
          </p>
        </div>

        <${CurrentUsersTable}
          users=${workgroup.users || []}
          pendingUsers=${pendingUsers}
          showAddForm=${showAddForm}
          draft=${draft}
          onChange=${onDraftChange}
          onSubmit=${onAddUser}
          onStartAdd=${onStartAdd}
          emailError=${emailError}
          feedback=${feedback}
          feedbackTone=${feedbackTone}
        />

        <div className="flex flex-col gap-4 border-t border-[#F2F4F7] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-[40px]">
            ${
              hasPendingChanges
                ? html`
                    <div className="inline-flex items-center gap-2 rounded-[10px] border border-[#F7D79A] bg-[#FFFAEB] px-3 py-2 text-[12px] font-medium text-[#B54708]">
                      <span className="inline-flex h-2 w-2 rounded-full bg-[#F79009]"></span>
                      ${pendingUsers.length} kullanici kaydedilmeyi bekliyor. Kaydetmeden once bu
                      kullanicilar workgroup icinde aktif olmaz.
                    </div>
                  `
                : html`
                    <p className="text-[12px] text-[#98A2B3]">
                      Yeni eklenen kullanicilar kaydet adimindan sonra workgroup'a eklenir.
                    </p>
                  `
            }
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick=${onDiscardChanges}
              disabled=${!hasPendingChanges}
              className=${classNames(
                "inline-flex h-10 items-center justify-center rounded-[8px] border px-4 text-[13px] font-semibold transition",
                hasPendingChanges
                  ? "border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"
                  : "cursor-not-allowed border-[#EAECF0] bg-[#FCFCFD] text-[#98A2B3]"
              )}
            >
              Vazgec
            </button>

            <button
              type="button"
              onClick=${onSaveChanges}
              disabled=${!hasPendingChanges}
              className=${classNames(
                "inline-flex h-10 items-center justify-center rounded-[8px] px-4 text-[13px] font-semibold text-white transition",
                hasPendingChanges
                  ? "bg-[#2F6FED] hover:bg-[#285FD0]"
                  : "cursor-not-allowed bg-[#B8CCFF]"
              )}
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </section>
  `
}

function ActionFooter({ mode, canSubmit, onCancel, onPrimaryAction, feedback, feedbackTone }) {
  const feedbackClass =
    feedbackTone === "error"
      ? "text-[#D92D20]"
      : feedbackTone === "success"
        ? "text-[#067647]"
        : "text-[#667085]"

  return html`
    <footer className="rounded-[14px] border border-[#EEF2F7] bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className=${classNames("text-[14px]", feedbackClass)}>
          ${feedback || "Devam etmek icin en az bir kullanici ekleyin."}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick=${onCancel}
            className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#D0D5DD] bg-white px-[22px] text-[14px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
          >
            Iptal
          </button>
          <button
            type="button"
            onClick=${onPrimaryAction}
            disabled=${!canSubmit}
            className=${classNames(
              "inline-flex h-11 items-center justify-center rounded-[10px] px-[22px] text-[14px] font-semibold text-white transition",
              canSubmit
                ? "bg-[#2F6FED] hover:bg-[#285FD0]"
                : "cursor-not-allowed bg-[#B8CCFF]"
            )}
          >
            ${mode === "create" ? "Workgroup Olustur" : "Kullanicilari Kaydet"}
          </button>
        </div>
      </div>
    </footer>
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

function ImplementationStep({ step, index, isSelected, isCompleted, isCurrent, onSelect }) {
  const dotClass = isCompleted
    ? "h-[18px] w-[18px] bg-[#16A34A] text-white"
    : isCurrent
      ? "h-[22px] w-[22px] bg-[#2563EB] text-white shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
      : "h-[18px] w-[18px] bg-[#E5E7EB] text-[#98A2B3]"

  return html`
    <button
      type="button"
      onClick=${() => onSelect(step.id)}
      className="relative flex flex-col items-center text-center"
    >
      <div
        className=${classNames(
          "relative z-10 flex items-center justify-center rounded-full transition",
          dotClass
        )}
      >
        ${
          isCompleted
            ? html`<${CheckSmallIcon} />`
            : null
        }
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#98A2B3]">
          ${step.number}
        </p>
        <p
          className=${classNames(
            "text-[14px] font-semibold leading-5 transition",
            isSelected || isCurrent ? "text-[#101828]" : "text-[#667085]"
          )}
        >
          ${step.title}
        </p>
      </div>
    </button>
  `
}

function ImplementationTimeline({ steps, activeStepId, onStepChange }) {
  const completedCount = steps.filter((step) => step.status === "completed").length
  const fillPercent =
    completedCount > 1
      ? (completedCount - 1) / (steps.length - 1) * 100
      : completedCount === 1
        ? 100 / (steps.length - 1) / 2
        : 0

  return html`
    <section className="rounded-[16px] border border-[#EEF2F7] bg-white px-6 py-8">
      <div className="relative">
        <div className="absolute left-[calc(100%/12)] right-[calc(100%/12)] top-[9px] h-[2px] bg-[#E5E7EB]"></div>
        <div
          className="absolute left-[calc(100%/12)] top-[9px] h-[2px] bg-[#16A34A] transition-all"
          style=${{
            width: `calc((100% - (100% / 6)) * ${fillPercent / 100})`
          }}
        ></div>

        <div className="relative grid grid-cols-6 gap-3">
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
  const templateCount = task.templates.length
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
              <span className="inline-flex h-7 items-center rounded-full bg-[#F5F7FB] px-3 text-[12px] font-medium text-[#475467]">
                ${templateCount} format
              </span>
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
                  <p className="text-[13px] font-semibold text-[#101828]">Formatlar</p>
                  <div className="flex flex-wrap gap-3">
                    ${task.templates.map(
                      (template) => html`
                        <a
                          key=${template.id}
                          href=${createTemplateDownloadHref(template.label)}
                          download=${`${template.label}.csv`}
                          className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#344054] shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition hover:border-[#D0D5DD] hover:bg-[#F9FAFB]"
                        >
                          <span className="text-[#667085]"><${DownloadIcon} /></span>
                          <span className="truncate">${template.label}</span>
                        </a>
                      `
                    )}
                  </div>
                </div>

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
    <section className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-[18px] font-semibold text-[#101828]">Sistem Kurulumu</h2>
        <p className="max-w-[820px] text-[14px] leading-6 text-[#667085]">
          Bu asamada implementasyon ekibinin paylastigi excel formatlari indirilmeli, gerekli
          bilgiler doldurulmali ve tekrar sisteme yuklenmelidir.
        </p>
      </div>

      <div className="space-y-4">
        ${tasks.map(
          (task) => html`
            <${ImplementationTaskCard}
              key=${task.id}
              task=${task}
              isOpen=${expandedTaskIds.includes(task.id)}
              onToggle=${() => onToggleTask(task.id)}
              isDragActive=${dragTaskId === task.id}
              onFileSelected=${onFileSelected}
              onFileDropped=${onFileDropped}
              onDragStateChange=${onDragStateChange}
            />
          `
        )}
      </div>
    </section>
  `
}

function ImplementationChatPanel({ messages, draft, onDraftChange, onSend, onClose }) {
  return html`
    <aside className="sticky top-6 flex max-h-[calc(100vh-96px)] flex-col overflow-hidden rounded-[16px] border border-[#EEF2F7] bg-white">
      <div className="border-b border-[#F2F4F7] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[#101828]">Mesajlar</h2>
            <p className="mt-1 text-[13px] text-[#667085]">
              Implementasyon ekibi ile surece ait notlasma ve hizli aksiyon alani
            </p>
          </div>

          <button
            type="button"
            onClick=${onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[#D0D5DD] bg-white text-[#344054] transition hover:bg-[#F9FAFB]"
            aria-label="Mesaj panelini daralt"
          >
            <${MinimizeIcon} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        ${messages.map((message) => {
          if (message.type === "system") {
            return html`
              <div key=${message.id} className="flex justify-center">
                <span className="inline-flex rounded-full bg-[#F5F7FB] px-3 py-1.5 text-[12px] font-medium text-[#667085]">
                  ${message.text}
                </span>
              </div>
            `
          }

          const isImplementation = message.type === "implementation"
          return html`
            <div
              key=${message.id}
              className=${classNames("flex", isImplementation ? "justify-end" : "justify-start")}
            >
              <div className=${classNames("max-w-[88%] space-y-2", isImplementation ? "items-end" : "")}>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-[#101828]">${message.author}</span>
                  <span className="text-[12px] text-[#98A2B3]">${message.time}</span>
                </div>
                <div
                  className=${classNames(
                    "rounded-[14px] px-4 py-3 text-[14px] leading-6",
                    isImplementation
                      ? "bg-[#2F6FED] text-white"
                      : "border border-[#EEF2F7] bg-[#F8FAFC] text-[#344054]"
                  )}
                >
                  ${message.text}
                </div>
              </div>
            </div>
          `
        })}
      </div>

      <div className="border-t border-[#F2F4F7] p-4">
        <div className="space-y-3">
          <textarea
            rows="3"
            value=${draft}
            onInput=${(event) => onDraftChange(event.target.value)}
            placeholder="Implementasyon ekibi ile mesajlasin..."
            className="w-full resize-none rounded-[12px] border border-[#E4E7EC] px-4 py-3 text-[14px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF] placeholder:text-[#98A2B3]"
          ></textarea>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick=${onSend}
              disabled=${!draft.trim()}
              className=${classNames(
                "inline-flex h-10 items-center justify-center gap-2 rounded-[8px] px-4 text-[13px] font-semibold text-white transition",
                draft.trim()
                  ? "bg-[#2F6FED] hover:bg-[#285FD0]"
                  : "cursor-not-allowed bg-[#B8CCFF]"
              )}
            >
              <${SendIcon} />
              <span>Gonder</span>
            </button>
          </div>
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
        <span className="text-[13px] font-semibold text-[#101828]">Mesajlar</span>
        <span className="text-[12px] text-[#667085]">Sohbeti tekrar ac</span>
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
      implementationBaseSteps.map((step) =>
        step.id === "system-setup" ? { ...step, status: systemSetupStatus } : { ...step, status: "not_started" }
      ),
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
    <div
      className=${classNames(
        "grid gap-8",
        isChatOpen ? "xl:grid-cols-[minmax(0,1fr)_360px]" : "grid-cols-1"
      )}
    >
      <div className="min-w-0 space-y-8">
        <${ImplementationHeader} progress=${overallProgress} />

        <${ImplementationTimeline}
          steps=${steps}
          activeStepId=${activeStepId}
          onStepChange=${setActiveStepId}
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
      </div>

      ${
        isChatOpen
          ? html`
              <${ImplementationChatPanel}
                messages=${messages}
                draft=${chatDraft}
                onDraftChange=${setChatDraft}
                onSend=${handleSendMessage}
                onClose=${() => setIsChatOpen(false)}
              />
            `
          : html`<${ImplementationChatLauncher} onOpen=${() => setIsChatOpen(true)} />`
      }
    </div>
  `
}

function AdminScreen({
  mode,
  selectedWorkgroup,
  workgroupName,
  userDraft,
  stagedUsers,
  showExistingUserForm,
  emailError,
  feedback,
  feedbackTone,
  canSubmit,
  onWorkgroupNameChange,
  onDraftChange,
  onAddUser,
  onRemoveUser,
  onStartAddUser,
  onDiscardExistingChanges,
  onSaveExistingChanges,
  onCancel,
  onPrimaryAction
}) {
  return html`
    <div className="space-y-8">
      <${WorkgroupHeader} mode=${mode} selectedWorkgroup=${selectedWorkgroup} />

      <div className="space-y-8">
        <${WorkgroupInfoCard}
          mode=${mode}
          workgroupName=${workgroupName}
          onWorkgroupNameChange=${onWorkgroupNameChange}
          selectedWorkgroup=${selectedWorkgroup}
        />

        ${
          mode === "create"
            ? html`
                <section className="rounded-[14px] border border-[#EEF2F7] bg-white p-6">
                  <${AddUserRow}
                    draft=${userDraft}
                    onChange=${onDraftChange}
                    onSubmit=${onAddUser}
                    emailError=${emailError}
                  />

                  <div className="mt-8 border-t border-[#F2F4F7] pt-6">
                    <${UsersDraftTable} users=${stagedUsers} onRemoveUser=${onRemoveUser} />
                  </div>
                </section>

                <${ActionFooter}
                  mode=${mode}
                  canSubmit=${canSubmit}
                  onCancel=${onCancel}
                  onPrimaryAction=${onPrimaryAction}
                  feedback=${feedback}
                  feedbackTone=${feedbackTone}
                />
              `
            : selectedWorkgroup
              ? html`
                  <${ExistingUsersSection}
                    workgroup=${selectedWorkgroup}
                    pendingUsers=${stagedUsers}
                    showAddForm=${showExistingUserForm}
                    draft=${userDraft}
                    onDraftChange=${onDraftChange}
                    onAddUser=${onAddUser}
                    onStartAdd=${onStartAddUser}
                    onDiscardChanges=${onDiscardExistingChanges}
                    onSaveChanges=${onSaveExistingChanges}
                    emailError=${emailError}
                    feedback=${feedback}
                    feedbackTone=${feedbackTone}
                    hasPendingChanges=${Boolean(stagedUsers.length)}
                  />
                `
              : null
        }
      </div>
    </div>
  `
}

function App() {
  const [activePage, setActivePage] = useState("processes")
  const [mode, setMode] = useState("existing")
  const [workgroups, setWorkgroups] = useState(seedWorkgroups)
  const [selectedWorkgroupId, setSelectedWorkgroupId] = useState(seedWorkgroups[0].id)
  const [workgroupName, setWorkgroupName] = useState("")
  const [userDraft, setUserDraft] = useState(createEmptyUserDraft())
  const [stagedUsers, setStagedUsers] = useState([])
  const [showExistingUserForm, setShowExistingUserForm] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [feedback, setFeedback] = useState("")
  const [feedbackTone, setFeedbackTone] = useState("neutral")

  const selectedWorkgroup = useMemo(
    () => workgroups.find((workgroup) => workgroup.id === selectedWorkgroupId) || workgroups[0],
    [selectedWorkgroupId, workgroups]
  )

  const canSubmit = mode === "create"
    ? Boolean(workgroupName.trim() && stagedUsers.length)
    : Boolean(selectedWorkgroup && stagedUsers.length)

  function resetTransientState() {
    setUserDraft(createEmptyUserDraft())
    setStagedUsers([])
    setShowExistingUserForm(false)
    setEmailError("")
    setFeedback("")
    setFeedbackTone("neutral")
  }

  function handleSelectedWorkgroupChange(nextWorkgroupId) {
    setSelectedWorkgroupId(nextWorkgroupId)
    setMode("existing")
    setWorkgroupName("")
    resetTransientState()
  }

  function handleCreateNewWorkgroup() {
    setActivePage("users")
    setMode("create")
    setWorkgroupName("")
    resetTransientState()
  }

  function handleDraftChange(field, value) {
    setUserDraft((current) => ({
      ...current,
      [field]: value
    }))

    if (field === "email" && emailError) {
      setEmailError("")
    }

    if (feedback) {
      setFeedback("")
      setFeedbackTone("neutral")
    }
  }

  function handleAddUser(event) {
    event.preventDefault()

    const firstName = userDraft.firstName.trim()
    const lastName = userDraft.lastName.trim()
    const email = userDraft.email.trim()

    if (!firstName || !lastName || !email) {
      setFeedback("Ad, soyad ve e-posta alanlari doldurulmalidir.")
      setFeedbackTone("error")
      return
    }

    if (!isValidEmail(email)) {
      setEmailError("Gecerli bir e-posta adresi girin.")
      setFeedbackTone("error")
      return
    }

    if (stagedUsers.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      setEmailError("Bu e-posta adresi bekleyen listede zaten bulunuyor.")
      setFeedbackTone("error")
      return
    }

    if (
      mode === "existing" &&
      selectedWorkgroup &&
      (selectedWorkgroup.users || []).some((user) => user.email.toLowerCase() === email.toLowerCase())
    ) {
      setEmailError("Bu e-posta adresi secili workgroup icinde zaten bulunuyor.")
      setFeedbackTone("error")
      return
    }

    const nextUser = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      firstName,
      lastName,
      email,
      role: userDraft.role
    }

    if (mode === "existing" && selectedWorkgroup) {
      setStagedUsers((current) => [...current, nextUser])
      setUserDraft(createEmptyUserDraft())
      setEmailError("")
      setFeedback("Kullanici bekleyen listeye eklendi. Degisiklikleri kaydetmeyi unutmayin.")
      setFeedbackTone("success")
      return
    }

    setStagedUsers((current) => [...current, nextUser])
    setUserDraft(createEmptyUserDraft())
    setEmailError("")
    setFeedback("Kullanici taslak listeye eklendi.")
    setFeedbackTone("success")
  }

  function handleRemoveUser(userId) {
    setStagedUsers((current) => current.filter((user) => user.id !== userId))
    setFeedback("")
    setFeedbackTone("neutral")
  }

  function handleStartAddUser() {
    setShowExistingUserForm(true)
    setFeedback("")
    setFeedbackTone("neutral")
  }

  function handleDiscardExistingChanges() {
    setStagedUsers([])
    setUserDraft(createEmptyUserDraft())
    setShowExistingUserForm(false)
    setEmailError("")
    setFeedback("Bekleyen kullanici degisiklikleri kaldirildi.")
    setFeedbackTone("neutral")
  }

  function handleSaveExistingChanges() {
    if (!selectedWorkgroup) {
      setFeedback("Kullanici kaydetmek icin once bir workgroup secin.")
      setFeedbackTone("error")
      return
    }

    if (!stagedUsers.length) {
      setFeedback("Kaydedilecek bekleyen kullanici bulunmuyor.")
      setFeedbackTone("neutral")
      return
    }

    setWorkgroups((current) =>
      current.map((workgroup) =>
        workgroup.id === selectedWorkgroup.id
          ? { ...workgroup, users: [...(workgroup.users || []), ...stagedUsers] }
          : workgroup
      )
    )

    setFeedback(`"${selectedWorkgroup.name}" workgroup'una ${stagedUsers.length} kullanici kaydedildi.`)
    setFeedbackTone("success")
    setStagedUsers([])
    setUserDraft(createEmptyUserDraft())
    setShowExistingUserForm(false)
    setEmailError("")
  }

  function handleCancel() {
    setWorkgroupName("")
    resetTransientState()
  }

  function handlePrimaryAction() {
    if (mode === "create") {
      if (!workgroupName.trim()) {
        setFeedback("Workgroup adi girmeden devam edemezsiniz.")
        setFeedbackTone("error")
        return
      }

      if (!stagedUsers.length) {
        setFeedback("Workgroup olusturmadan once en az bir kullanici ekleyin.")
        setFeedbackTone("error")
        return
      }

      const normalizedName = workgroupName.trim()
      const newWorkgroup = {
        id: `wg-${Date.now()}`,
        name: normalizedName,
        users: stagedUsers
      }

      setWorkgroups((current) => [newWorkgroup, ...current])
      setSelectedWorkgroupId(newWorkgroup.id)
      setMode("existing")
      setWorkgroupName("")
      setUserDraft(createEmptyUserDraft())
      setStagedUsers([])
      setShowExistingUserForm(false)
      setEmailError("")
      setFeedback("")
      setFeedbackTone("neutral")
    }
  }

  return html`
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#344054]">
      <div className="min-h-screen">
        <${Sidebar}
          activePage=${activePage}
          mode=${mode}
          workgroups=${workgroups}
          selectedWorkgroup=${selectedWorkgroup}
          onCreateNewWorkgroup=${handleCreateNewWorkgroup}
          onSelectWorkgroup=${handleSelectedWorkgroupChange}
          onPageChange=${setActivePage}
        />

        <main className="min-w-0 lg:ml-64">
          <${TopBar} activePage=${activePage} mode=${mode} />

          <div
            className=${classNames(
              "mx-auto w-full px-6 py-10",
              activePage === "processes" ? "max-w-[1440px]" : "max-w-[1120px]"
            )}
          >
            <div className=${classNames(activePage === "users" ? "mx-auto max-w-[960px]" : "")}>
              ${
                activePage === "processes"
                  ? html`<${ImplementationScreen} />`
                  : html`
                      <${AdminScreen}
                        mode=${mode}
                        selectedWorkgroup=${selectedWorkgroup}
                        workgroupName=${workgroupName}
                        userDraft=${userDraft}
                        stagedUsers=${stagedUsers}
                        showExistingUserForm=${showExistingUserForm}
                        emailError=${emailError}
                        feedback=${feedback}
                        feedbackTone=${feedbackTone}
                        canSubmit=${canSubmit}
                        onWorkgroupNameChange=${setWorkgroupName}
                        onDraftChange=${handleDraftChange}
                        onAddUser=${handleAddUser}
                        onRemoveUser=${handleRemoveUser}
                        onStartAddUser=${handleStartAddUser}
                        onDiscardExistingChanges=${handleDiscardExistingChanges}
                        onSaveExistingChanges=${handleSaveExistingChanges}
                        onCancel=${handleCancel}
                        onPrimaryAction=${handlePrimaryAction}
                      />
                    `
              }
            </div>
          </div>
        </main>
      </div>
    </div>
  `
}

ReactDOM.createRoot(document.getElementById("app")).render(html`<${App} />`)
