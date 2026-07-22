const { useEffect, useMemo, useRef, useState } = React
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

function getAttachmentTypeLabel(att = {}) {
  if (att.typeLabel) {
    return att.typeLabel
  }

  const rawValue = att.name || att.url || ""
  const match = rawValue.match(/\.([a-z0-9]+)(?:$|[?#])/i)
  return match ? match[1].toUpperCase() : "DOSYA"
}

function getAttachmentIconMeta(typeLabel = "") {
  const normalized = String(typeLabel || "").toLowerCase()

  if (["xls", "xlsx", "csv"].includes(normalized)) {
    return {
      badge: "X",
      badgeClass: "bg-[#217346] text-white",
      accentClass: "bg-[#8FD19E]"
    }
  }

  if (["pdf"].includes(normalized)) {
    return {
      badge: "P",
      badgeClass: "bg-[#D92D20] text-white",
      accentClass: "bg-[#F97066]"
    }
  }

  if (["doc", "docx"].includes(normalized)) {
    return {
      badge: "W",
      badgeClass: "bg-[#185ABD] text-white",
      accentClass: "bg-[#84CAFF]"
    }
  }

  if (["zip", "rar", "7z"].includes(normalized)) {
    return {
      badge: "ZIP",
      badgeClass: "bg-[#667085] text-white",
      accentClass: "bg-[#98A2B3]"
    }
  }

  return {
    badge: normalized ? normalized.slice(0, 1).toUpperCase() : "F",
    badgeClass: "bg-[#667085] text-white",
    accentClass: "bg-[#98A2B3]"
  }
}

function FileAttachmentIcon({ att = {}, size = "md" }) {
  const typeLabel = getAttachmentTypeLabel(att)
  const { badge, badgeClass, accentClass } = getAttachmentIconMeta(typeLabel)
  const isSmall = size === "sm"
  const wrapClass = isSmall ? "relative h-6 w-7 shrink-0" : "relative h-7 w-8 shrink-0"
  const rearSheetClass = isSmall
    ? "absolute left-[10px] top-[1px] h-[14px] w-[11px] rounded-[3px] border border-[#CCD4DF] bg-white shadow-[0_1px_1px_rgba(16,24,40,0.05)]"
    : "absolute left-[11px] top-[1px] h-[16px] w-[12px] rounded-[3px] border border-[#CCD4DF] bg-white shadow-[0_1px_1px_rgba(16,24,40,0.05)]"
  const frontSheetClass = isSmall
    ? "absolute left-[5px] top-[5px] h-[14px] w-[11px] rounded-[3px] border border-[#D7DEE8] bg-[#F8FAFC]"
    : "absolute left-[5px] top-[6px] h-[16px] w-[12px] rounded-[3px] border border-[#D7DEE8] bg-[#F8FAFC]"
  const accentDotClass = isSmall
    ? `absolute left-[13px] top-[3px] h-[4px] w-[4px] rounded-[1.5px] ${accentClass}`
    : `absolute left-[15px] top-[3px] h-[5px] w-[5px] rounded-[2px] ${accentClass}`
  const badgeBaseClass = isSmall
    ? "absolute bottom-0 left-0 inline-flex h-[12px] min-w-[12px] items-center justify-center rounded-[3px] px-[3px] text-[7px] font-bold leading-none shadow-[0_1px_2px_rgba(16,24,40,0.12)]"
    : "absolute bottom-0 left-0 inline-flex h-[14px] min-w-[14px] items-center justify-center rounded-[4px] px-[4px] text-[8px] font-bold leading-none shadow-[0_1px_2px_rgba(16,24,40,0.12)]"

  return html`
    <span className=${wrapClass} aria-hidden="true">
      <span className=${rearSheetClass}></span>
      <span className=${frontSheetClass}></span>
      <span className=${accentDotClass}></span>
      <span className=${classNames(badgeBaseClass, badgeClass)}>${badge}</span>
    </span>
  `
}

function renderInlineFormattedText(text = "") {
  const normalized = String(text || "")
  const segments = normalized.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)

  return segments.map((segment, index) => {
    if (segment.startsWith("**") && segment.endsWith("**")) {
      return html`<strong key=${`fmt-${index}`} className="font-semibold text-[#101828]">${segment.slice(2, -2)}</strong>`
    }

    return segment
  })
}

function normalizeRevisionItem(item) {
  if (item && typeof item === "object" && "text" in item) {
    return {
      type: item.type === "bullet" ? "bullet" : "paragraph",
      text: String(item.text || "").trim()
    }
  }

  const rawText = String(item || "").trim()
  if (!rawText) return null

  const bulletMatch = rawText.match(/^([•\-*])\s+(.*)$/)
  if (bulletMatch) {
    return {
      type: "bullet",
      text: bulletMatch[2].trim()
    }
  }

  return {
    type: "paragraph",
    text: rawText
  }
}

function normalizeRevisionItems(items = []) {
  return items
    .map(normalizeRevisionItem)
    .filter(Boolean)
}

function AttachmentChip({ att, variant = "default" }) {
  const typeLabel = getAttachmentTypeLabel(att)
  const isCompact = variant === "compact"
  const isRevision = variant === "revision" || variant === "revision-compact"
  const isRevisionCompact = variant === "revision-compact"
  const wrapperClass = isRevision
    ? isRevisionCompact
      ? "group/att inline-flex min-w-[210px] max-w-[260px] items-center gap-2 rounded-[10px] border border-[#E6EBF2] bg-white px-2.5 py-2 text-left transition hover:border-[#D5DDE8] hover:bg-[#FBFCFE]"
      : "group/att inline-flex min-w-[220px] max-w-[280px] items-center gap-2 rounded-[10px] border border-[#E6EBF2] bg-white px-2.5 py-2 text-left transition hover:border-[#D5DDE8] hover:bg-[#FBFCFE]"
    : isCompact
      ? "group/att inline-flex min-w-0 max-w-full items-center gap-2 rounded-[9px] border border-[#D8E2F0] bg-white px-2.5 py-2 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-[#B8C8E0] hover:bg-[#FCFDFF]"
      : "group/att inline-flex min-w-[210px] max-w-[246px] items-center gap-2.5 rounded-[12px] border border-[#D8E2F0] bg-white px-2.5 py-2 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-[#B8C8E0] hover:bg-[#FCFDFF] hover:shadow-[0_4px_12px_rgba(16,24,40,0.06)]"
  const iconWrapClass = isRevision
    ? "flex h-8 w-8 shrink-0 items-center justify-center"
    : isCompact
      ? "flex h-7 w-7 shrink-0 items-center justify-center"
      : "flex h-8 w-8 shrink-0 items-center justify-center"
  const titleClass = isRevision
    ? isRevisionCompact
      ? "block truncate text-[11.5px] font-medium text-[#344054]"
      : "block truncate text-[11.5px] font-medium text-[#344054]"
    : "block truncate text-[12px] font-semibold text-[#344054]"
  const metaClass = isRevision
    ? isRevisionCompact
      ? "mt-0.5 flex items-center gap-1.5 text-[10px] text-[#98A2B3]"
      : "mt-0.5 flex items-center gap-1.5 text-[10px] text-[#98A2B3]"
    : isCompact
      ? "mt-0.5 flex items-center gap-1.5 text-[10px] text-[#98A2B3]"
      : "mt-0.5 flex items-center gap-1.5 text-[10.5px] text-[#98A2B3]"
  const actionClass = isRevision
    ? isRevisionCompact
      ? "ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-[#98A2B3] transition group-hover/att:bg-[#F3F6FA] group-hover/att:text-[#344054]"
      : "ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-[#98A2B3] transition group-hover/att:bg-[#F3F6FA] group-hover/att:text-[#344054]"
    : isCompact
      ? "ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] border border-[#E4E7EC] bg-[#F8FAFC] text-[#667085] transition group-hover/att:border-[#C7D7EC] group-hover/att:bg-white group-hover/att:text-[#2F6FED]"
      : "ml-auto flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-[#E4E7EC] bg-[#F8FAFC] text-[#667085] transition group-hover/att:border-[#C7D7EC] group-hover/att:bg-white group-hover/att:text-[#2F6FED]"

  return html`
    <a
      href=${att.url}
      download=${att.name}
      className=${wrapperClass}
      title=${att.name}
    >
      <div className=${iconWrapClass}>
        <${FileAttachmentIcon} att=${att} size=${isCompact || isRevisionCompact ? "sm" : "md"} />
      </div>
      <div className=${classNames("min-w-0 flex-1", isRevision ? "pr-1" : "")}>
        <span className=${titleClass}>${att.name}</span>
        <span className=${metaClass}>
          <span>${att.size}</span>
          <span aria-hidden="true">•</span>
          <span>${typeLabel}</span>
        </span>
      </div>
      ${isRevision ? html`
        <span className=${actionClass} aria-hidden="true">
          <${DownloadIcon} />
        </span>
      ` : html`
        <span className=${actionClass} aria-hidden="true">
          <${DownloadIcon} />
        </span>
      `}
    </a>
  `
}

function DocumentNavigationChip({ label, stepTitle, isActive, onClick }) {
  return html`
    <button
      type="button"
      onClick=${onClick}
      className=${classNames(
        "inline-flex min-w-0 max-w-full items-center gap-2 rounded-[10px] border px-2.5 py-2 text-left transition",
        isActive
          ? "border-[#BFD3FF] bg-[#F5F8FF]"
          : "border-[#D8E2F0] bg-white hover:border-[#B8C8E0] hover:bg-[#FCFDFF]"
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] border border-[#E4E7EC] bg-[#F8FAFC] text-[#667085]">
        <svg width="13" height="15" viewBox="0 0 14 16" fill="none" aria-hidden="true">
          <path d="M8 1H2a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V6L8 1z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
          <path d="M8 1v5h5" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-semibold text-[#344054]">${label}</span>
        <span className="block truncate text-[10.5px] text-[#98A2B3]">${stepTitle}</span>
      </span>
      <span className="shrink-0 text-[#98A2B3]">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 3.5L9.5 7L5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </button>
  `
}

function getRevisionEntriesFromMessage(message) {
  const fallbackItems = Array.isArray(message?.revisionItems) && message.revisionItems.length > 0
    ? normalizeRevisionItems(message.revisionItems)
    : [{ type: "bullet", text: "Revize edilmesi gereken alanlar bulunuyor." }]
  const messageEntries = Array.isArray(message?.revisionEntries)
    ? message.revisionEntries.filter(Boolean)
    : []

  if (messageEntries.length > 0) {
    return messageEntries.map((entry, index) => ({
      id: entry.id || entry.docId || `revision-entry-${index}`,
      docId: entry.docId || "",
      docLabel: entry.docLabel || "İlgili belge",
      fileName: entry.fileName || "",
      revisionItems: Array.isArray(entry.revisionItems) && entry.revisionItems.length > 0 ? normalizeRevisionItems(entry.revisionItems) : fallbackItems,
      relatedDocument: entry.relatedDocument || null,
      attachments: Array.isArray(entry.attachments) ? entry.attachments : []
    }))
  }

  return [
    {
      id: message?.relatedDocument?.docId || `revision-entry-${message?.id || "0"}`,
      docId: message?.relatedDocument?.docId || "",
      docLabel: message?.revisionDocLabel || "İlgili belge",
      fileName: message?.revisionFileName || "",
      revisionItems: fallbackItems,
      relatedDocument: message?.relatedDocument || null,
      attachments: Array.isArray(message?.attachments) ? message.attachments : []
    }
  ]
}

function getApprovalEntriesFromMessage(message) {
  const defaultApprovalText = message?.approvalText || "Dosya kontrol edildi ve bu versiyon onaylandı."
  const messageEntries = Array.isArray(message?.approvalEntries)
    ? message.approvalEntries.filter(Boolean)
    : []

  if (messageEntries.length > 0) {
    return messageEntries.map((entry, index) => ({
      id: entry.id || entry.docId || `approval-entry-${index}`,
      docId: entry.docId || "",
      docLabel: entry.docLabel || "İlgili belge",
      fileName: entry.fileName || "",
      relatedDocument: entry.relatedDocument || null,
      approvalText: entry.approvalText || defaultApprovalText
    }))
  }

  const rawText = String(message?.text || "").trim()
  const firstLine = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)[0] || ""
  const singleDocMatch = firstLine.match(/^(.+?) belgesi onaylandı\.?$/i)

  return [
    {
      id: message?.relatedDocument?.docId || `approval-entry-${message?.id || "0"}`,
      docId: message?.relatedDocument?.docId || "",
      docLabel: message?.approvalDocLabel || message?.relatedDocument?.docLabel || (singleDocMatch ? singleDocMatch[1].trim() : "İlgili belge"),
      fileName: message?.approvalFileName || message?.relatedDocument?.fileName || "",
      relatedDocument: message?.relatedDocument || null,
      approvalText: defaultApprovalText
    }
  ]
}

function getApprovalNoticeMetaFromMessage(message) {
  const approvalEntries = getApprovalEntriesFromMessage(message)
  const rawText = String(message?.text || "").trim()
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  const firstLine = lines[0] || ""
  const secondLine = lines[1] || ""
  const singleDocMatch = firstLine.match(/^(.+?) belgesi onaylandı\.?$/i)
  const multiDocMatch = firstLine.match(/^Gönderdiğiniz (\d+) belge onaylandı\.?$/i)
  const nextStepMatch = secondLine.match(/^Sıradaki adım:\s*(.+?)[.]?$/i)

  return {
    approvalCount: typeof message?.approvalCount === "number"
      ? message.approvalCount
      : approvalEntries.length > 0
      ? approvalEntries.length
      : multiDocMatch
      ? Number(multiDocMatch[1])
      : singleDocMatch || message?.relatedDocument?.docLabel
      ? 1
      : 0,
    approvalDocLabel: message?.approvalDocLabel || approvalEntries[0]?.docLabel || message?.relatedDocument?.docLabel || (singleDocMatch ? singleDocMatch[1].trim() : ""),
    approvalFileName: message?.approvalFileName || approvalEntries[0]?.fileName || message?.relatedDocument?.fileName || "",
    nextStepTitle: message?.approvalNextStepTitle || (nextStepMatch ? nextStepMatch[1].trim() : "")
  }
}

function isApprovalNoticeMessage(message) {
  if (!message || message.type !== "implementation") return false
  if (message.messageVariant === "approval_notice") return true

  const rawText = String(message.text || "").trim()
  return /belgesi onaylandı/i.test(rawText) || /gönderdiğiniz \d+ belge onaylandı/i.test(rawText)
}

function RevisionRequestCard({ message, compact = false, activeStepId = "", onStepChange = null }) {
  const revisionEntries = getRevisionEntriesFromMessage(message)
  const hasMultipleEntries = revisionEntries.length > 1
  const [openEntryId, setOpenEntryId] = useState(() => (hasMultipleEntries ? "" : (revisionEntries[0]?.id || "")))
  const cardClass = compact
    ? "w-full max-w-[620px] overflow-hidden rounded-[14px] px-3 py-2.5 shadow-[0_4px_14px_rgba(16,24,40,0.03)] ring-1 ring-[rgba(232,226,224,0.68)]"
    : "w-full max-w-[760px] overflow-hidden rounded-[15px] px-3.5 py-3 shadow-[0_6px_16px_rgba(16,24,40,0.035)] ring-1 ring-[rgba(232,226,224,0.68)]"
  const titleClass = compact
    ? "text-[11.5px] font-medium leading-[1.5] text-[#475467]"
    : "text-[11.5px] font-medium leading-[1.5] text-[#475467]"
  const subtitleClass = compact
    ? "text-[10.5px] leading-[1.55] text-[#98A2B3]"
    : "text-[11px] leading-[1.55] text-[#98A2B3]"
  const sectionLabelClass = compact
    ? "text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]"
    : "text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]"
  const docNameClass = compact
    ? "mt-1 text-[12.5px] font-semibold text-[#101828]"
    : "mt-1 text-[12.5px] font-semibold text-[#101828]"
  const fileRowClass = compact
    ? "mt-1.5 inline-flex min-w-0 max-w-full items-center gap-2 rounded-[9px] border border-[#EEF2F6] bg-[#F8FAFC] px-2.5 py-1.5 text-[11px] text-[#667085]"
    : "mt-1.5 inline-flex min-w-0 max-w-full items-center gap-2 rounded-[9px] border border-[#EEF2F6] bg-[#F8FAFC] px-2.5 py-1.5 text-[11px] text-[#667085]"
  const listClass = compact ? "mt-1.5 space-y-1.5" : "mt-1.5 space-y-1.5"
  const itemTextClass = compact ? "text-[11.5px] leading-[1.55] text-[#475467]" : "text-[11.5px] leading-[1.55] text-[#475467]"
  const attachmentVariant = compact ? "revision-compact" : "revision"
  const exampleHeaderClass = compact
    ? "mt-3 flex items-center justify-between gap-2"
    : "mt-3 flex items-center justify-between gap-2"
  const accordionWrapClass = compact ? "mt-3 space-y-2" : "mt-3 space-y-2"
  const accordionButtonClass = compact
    ? "flex w-full items-center gap-2.5 rounded-[11px] border border-[#EEF2F6] bg-white px-3 py-2.5 text-left transition hover:border-[#DDE3EA] hover:bg-[#FCFCFD]"
    : "flex w-full items-center gap-2.5 rounded-[11px] border border-[#EEF2F6] bg-white px-3 py-2.5 text-left transition hover:border-[#DDE3EA] hover:bg-[#FCFCFD]"
  const accordionBodyClass = compact
    ? "mt-2 rounded-[11px] border border-[#EEF2F6] bg-[#FCFCFD] px-3 py-3"
    : "mt-2 rounded-[11px] border border-[#EEF2F6] bg-[#FCFCFD] px-3 py-3"
  const badgePillClass = "inline-flex h-5 items-center rounded-full border border-[#E6EAEE] bg-[#F8FAFC] px-2 text-[9.5px] font-semibold text-[#667085]"
  const noteCountPillClass = "inline-flex h-5 items-center rounded-full border border-[#F3D7D2] bg-[#FFF7F6] px-2 text-[9.5px] font-semibold text-[#C75B4A]"

  // TODO: Surface "Yeni Versiyon Yükle" and "Tekrar Onaya Gönder" actions here when upload/resubmit handlers are available to this card.

  function renderRevisionEntryDetails(entry, options = {}) {
    const { showDocumentSummary = false, showFileName = true } = options
    const shouldInlineFileName = showDocumentSummary && showFileName && entry.fileName

    return html`
      <div className="min-w-0">
        ${showDocumentSummary ? html`
          <div>
            <p className=${sectionLabelClass}>İlgili Belge</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-[12.5px] font-semibold text-[#101828]">${entry.docLabel}</p>
              ${shouldInlineFileName ? html`
                <div className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-[9px] border border-[#EEF2F6] bg-[#F8FAFC] px-2.5 py-1.5 text-[11px] text-[#667085]">
                  <${FileAttachmentIcon} att=${{ name: entry.fileName }} size="sm" />
                  <span className="truncate">${entry.fileName}</span>
                </div>
              ` : null}
            </div>
          </div>
        ` : null}

        ${showFileName && entry.fileName && !shouldInlineFileName ? html`
          <div className=${fileRowClass}>
            <${FileAttachmentIcon} att=${{ name: entry.fileName }} size="sm" />
            <span className="truncate">${entry.fileName}</span>
          </div>
        ` : null}

        <div className="mt-3">
          <p className=${sectionLabelClass}>Revize Notları</p>
          <div className=${listClass}>
            ${entry.revisionItems.map((item, index) => (
              item.type === "bullet"
                ? html`
                    <div key=${`${entry.id}-${index}-${item.text}`} className="flex items-start gap-2">
                      <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-[#F97066]"></span>
                      <p className=${itemTextClass}>${renderInlineFormattedText(item.text)}</p>
                    </div>
                  `
                : html`
                    <p key=${`${entry.id}-${index}-${item.text}`} className=${itemTextClass}>${renderInlineFormattedText(item.text)}</p>
                  `
            ))}
          </div>
        </div>

        ${entry.attachments && entry.attachments.length > 0 ? html`
          <div className="mt-3">
            <div className=${exampleHeaderClass}>
              <div className="flex items-center gap-1.5 text-[#98A2B3]">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M4.5 7.8l3.56-3.56a1.75 1.75 0 112.48 2.47L5.92 11.33a3 3 0 11-4.24-4.24l4.6-4.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className=${sectionLabelClass}>Örnek Ekler</p>
              </div>
              <span className="text-[10.5px] text-[#98A2B3]">${entry.attachments.length} ek</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              ${entry.attachments.map(att => html`
                <${AttachmentChip} key=${att.name} att=${att} variant=${attachmentVariant} />
              `)}
            </div>
          </div>
        ` : null}
      </div>
    `
  }

  return html`
    <div
      className=${cardClass}
      style=${{ background: "linear-gradient(180deg, #FFFDFC 0%, #FFFFFF 100%)" }}
    >
      <div className="min-w-0">
        <p className=${titleClass}>
          ${hasMultipleEntries ? `${revisionEntries.length} dosya için düzenleme istendi.` : "Bu belge için düzenleme istendi."}
        </p>
        <p className=${"mt-0.5 " + subtitleClass}>
          ${hasMultipleEntries
            ? "İhtiyacınız olan dosyanın detayını açarak revize notlarını inceleyin."
            : "Lütfen gerekli güncellemeleri yapıp dosyayı yeniden yükleyin."}
        </p>

        ${hasMultipleEntries ? html`
          <div className=${accordionWrapClass}>
            ${revisionEntries.map((entry) => {
              const isOpen = openEntryId === entry.id
              const fileTypeLabel = getAttachmentTypeLabel({ name: entry.fileName || entry.docLabel || "" })
              const primaryLabel = entry.fileName || entry.docLabel
              const secondaryLabel = entry.fileName && entry.docLabel ? entry.docLabel : ""
              return html`
                <div key=${entry.id} className="min-w-0">
                  <button
                    type="button"
                    onClick=${() => setOpenEntryId((current) => (current === entry.id ? "" : entry.id))}
                    className=${accordionButtonClass}
                    aria-expanded=${isOpen ? "true" : "false"}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                      <${FileAttachmentIcon} att=${{ name: entry.fileName || entry.docLabel || "" }} size="sm" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-semibold text-[#101828]">${primaryLabel}</p>
                      ${secondaryLabel ? html`<p className="mt-0.5 truncate text-[10.5px] text-[#98A2B3]">${secondaryLabel}</p>` : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className=${badgePillClass}>${fileTypeLabel}</span>
                      <span className=${noteCountPillClass}>${entry.revisionItems.length} not</span>
                      <span className=${classNames("text-[#98A2B3] transition-transform", isOpen && "rotate-180")}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M3.5 5.5L7 9l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </button>
                  ${isOpen ? html`
                    <div className=${accordionBodyClass}>
                      ${renderRevisionEntryDetails(entry, { showDocumentSummary: true, showFileName: false })}
                    </div>
                  ` : null}
                </div>
              `
            })}
          </div>
        ` : html`
          <div className=${accordionBodyClass}>
            ${renderRevisionEntryDetails(revisionEntries[0], { showDocumentSummary: true, showFileName: true })}
          </div>
        `}
      </div>
    </div>
  `
}

function ApprovalNoticeCard({ message, compact = false, activeStepId = "", onStepChange = null }) {
  const approvalEntries = getApprovalEntriesFromMessage(message)
  const approvalCount = approvalEntries.length
  const approvalTitle = approvalCount > 1 ? `${approvalCount} dosya onaylandı.` : "Bu dosya onaylandı."
  const cardClass = compact
    ? "w-full max-w-[620px] overflow-hidden rounded-[14px] px-3 py-2.5 shadow-[0_4px_14px_rgba(16,24,40,0.03)] ring-1 ring-[rgba(205,234,216,0.95)]"
    : "w-full max-w-[760px] overflow-hidden rounded-[15px] px-3.5 py-3 shadow-[0_6px_16px_rgba(16,24,40,0.035)] ring-1 ring-[rgba(205,234,216,0.95)]"
  const titleClass = compact
    ? "text-[11.5px] font-medium leading-[1.5] text-[#475467]"
    : "text-[11.5px] font-medium leading-[1.5] text-[#475467]"
  const subtitleClass = compact
    ? "text-[10.5px] leading-[1.55] text-[#98A2B3]"
    : "text-[11px] leading-[1.55] text-[#98A2B3]"
  const fileRowClass = "flex items-center gap-2.5 rounded-[11px] border border-[#E3F1E8] bg-white px-3 py-2.5"

  return html`
    <div
      className=${cardClass}
      style=${{ background: "linear-gradient(180deg, #FCFEFD 0%, #FFFFFF 100%)" }}
    >
      <div className="min-w-0">
        <p className=${titleClass}>
          ${approvalTitle}
        </p>
        <p className=${"mt-0.5 " + subtitleClass}>
          ${approvalCount > 1
            ? "Onaylanan dosyaların detayını aşağıda görüntüleyebilirsiniz."
            : "Onaylanan dosyanın detayını aşağıda görüntüleyebilirsiniz."}
        </p>

        <div className="mt-3 space-y-2">
          ${approvalEntries.map((entry) => {
            const primaryLabel = entry.fileName || entry.docLabel
            const secondaryLabel = entry.fileName && entry.docLabel ? entry.docLabel : ""
            return html`
              <div key=${entry.id} className=${fileRowClass}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                  <${FileAttachmentIcon} att=${{ name: entry.fileName || entry.docLabel || "" }} size="sm" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-[#101828]">${primaryLabel}</p>
                  ${secondaryLabel ? html`<p className="mt-0.5 truncate text-[10.5px] text-[#98A2B3]">${secondaryLabel}</p>` : null}
                </div>
              </div>
            `
          })}
        </div>
      </div>
    </div>
  `
}

const OPTIONAL_MODULES_STORAGE_KEY = "datassist-optional-modules-by-company"
const IMPLEMENTATION_DOCUMENT_STATE_KEY = "datassist-implementation-document-state"

function readStoredOptionalModules() {
  try {
    return JSON.parse(window.localStorage.getItem(OPTIONAL_MODULES_STORAGE_KEY) || "{}")
  } catch (_) {
    return {}
  }
}

function persistCompanyOptionalModules(company) {
  try {
    const storedModules = readStoredOptionalModules()
    window.localStorage.setItem(OPTIONAL_MODULES_STORAGE_KEY, JSON.stringify({
      ...storedModules,
      [company.id]: {
        hasGE: Boolean(company.hasGE),
        hasAccountingReport: Boolean(company.hasAccountingReport),
        targetDates: {
          "implementation-report": getPhaseDeadlineValue(company.deadlines, "implementation-report", "output"),
          "transition-call": getPhaseDeadlineValue(company.deadlines, "transition-call", "output")
        }
      }
    }))
    window.dispatchEvent(new CustomEvent("optional-modules-updated", { detail: { companyId: company.id } }))
  } catch (_) {
    // The in-memory update still works when browser storage is unavailable.
  }
}

const seedCompanies = [
  {
    id: "company-214",
    name: "Anadolu Lojistik Operasyon",
    onboardingType: "enterprise",
    transitionType: "fast",
    assignee: "Zerrin Altun",
    currentStepIndex: 5, // Canlıya Geçiş (0: Kurulum, 1: Bordro, 2: G&E, 3: Muhasebe, 4: Live, 5: Canlı, 6: Tamamlandı)
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
    hasGE: true,
    hasAccountingReport: true,
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
    hasAccountingReport: true,
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
    label: "Düzenleyici",
    description:
      "Şirket alanındaki verileri görüntüleyebilir, veri yükleyebilir ve dokümanları indirebilir."
  },
  {
    value: "viewer",
    label: "Görüntüleyici",
    description:
      "Yalnızca verileri görüntüleyebilir ve dokümanları indirebilir. Veri yükleme yapamaz."
  }
]

const onboardingOptions = [
  {
    value: "saas",
    label: "SaaS",
    description: "Hazır bulut kurulumuyla hızlı açılış yapısı."
  },
  {
    value: "local",
    label: "Local",
    description: "Şirket içi ortamlara uygun kontrollü kurulum akışı."
  },
  {
    value: "global",
    label: "Global",
    description: "Çoklu ülke ve ekip koordinasyonu gerektiren onboarding."
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Geniş kapsamlı yapılar için daha fazla kontrol noktası."
  }
]

const transitionOptions = [
  {
    value: "normal",
    label: "Normal Geçiş",
    description: "Standart proje planı ve normal hızda geçiş akışı."
  },
  {
    value: "fast",
    label: "Hızlı Geçiş",
    description: "Sıkıştırılmış takvimle hızlandırılmış onboarding."
  },
  {
    value: "extra_fast",
    label: "Ekstra Hızlı Geçiş",
    description: "Öncelikli destekle minimum sürede canlı hazırlık."
  },
  {
    value: "sample",
    label: "Örneklem Geçiş",
    description: "Pilot ekip veya örnek veriyle kontrollü deneme kurgusu."
  }
]

const assigneeOptions = [
  { value: "Zerrin Altun", label: "Zerrin Altun" },
  { value: "Gözde Gökdağ Tumbar", label: "Gözde Gökdağ Tumbar" },
  { value: "Engincan Büyükçolak", label: "Engincan Büyükçolak" }
]

const moduleAccessUrl = "https://sdp.datassist.com.tr"

const implementationBaseSteps = [
  { id: "system-setup",          number: "01", title: "Sistem Kurulumu",                  planned: "Haz 01", completedDate: "May 30" },
  { id: "parallel-cost",         number: "02", title: "Bordro Analiz Çalışmaları",        planned: "Haz 08", completedDate: "Haz 06" },
  { id: "implementation-report", number: "03", title: "Rapor Geliştirme ve Entegrasyon",  planned: "Haz 15", completedDate: "Haz 13" },
  { id: "transition-call",       number: "04", title: "Muhasebe Rapor Kurulumu",           planned: "Haz 22", completedDate: "Haz 20" },
  { id: "integrations",          number: "05", title: "Live Hazırlıkları",                 planned: "Haz 29", completedDate: "Haz 27" },
  { id: "operations-handover",   number: "06", title: "Canlıya Geçiş",                    planned: "Tem 05", completedDate: "Tem 03" }
]

const starterKitDownloadHref = "file:///Users/omerisildak/Downloads/1%20-%20Starter%20Kit.xls"
const puantajFormDownloadHref = encodeURI("file:///Users/omerisildak/Downloads/3 - Puantaj_Formu (1).xls")
const girisCikisNakilDownloadHref = encodeURI("file:///Users/omerisildak/Downloads/4 - Giriş Çıkış Nakil Formu (1).xls")
const exampleReportsDownloadHref = "file:///Users/omerisildak/Downloads/5%20-%20%C3%96rnek%20Raporlar.zip"

// Her adim icin belgeler (coklu belge destegi)
const implementationStepTemplates = {
  "system-setup": {
    title: "Sistem Kurulumu",
    description: "Asagidaki sablonu indirin, doldurun ve yukleyin. Dosya hazir oldugunda onaya gonderin.",
    documents: [
      {
        id: "doc-starter-kit",
        label: "Starter Kit",
        templateUrl: starterKitDownloadHref,
        templateName: "Starter-Kit.xls",
        description: "Personel ve Kurum kurulum bilgilerinden olusmakta olup, firma ve personel kartlarinin yaratilmasi icin gereklidir. Sonraki donemde bu form kullanilmayacaktir."
      }
    ]
  },
  "parallel-cost": {
    title: "Bordro Analiz Çalışmaları",
    description: "Aşağıda beklediğimiz dosyaları yukarıdaki alandan yükleyin. Tüm belgeler hazır olduğunda onaya gönderin.",
    documents: [
      { id: "doc-cost-report",       label: "Maliyet Raporu (Çarşaf İcmal)", templateUrl: createTemplateDownloadHref("Maliyet Raporu Carsaf Icmal"), templateName: "Maliyet-Raporu-Carsaf-Icmal.xlsx", description: "Personel bazlı maliyet kırılımlarını çarşaf (icmal) formatında gösterir. Bordro analiz çalışmalarının kontrolünde referans olarak kullanılır." },
      { id: "doc-pdf-payrolls",      label: "PDF Çalışan Bazlı Bordrolar",   templateUrl: createTemplateDownloadHref("PDF Calisan Bazli Bordrolar"), templateName: "PDF-Calisan-Bazli-Bordrolar.pdf", description: "Her çalışan için ayrı ayrı hazırlanmış PDF bordro çıktılarıdır. Mevcut sistemdeki bordrolarla karşılaştırma yapmak için kullanılır." },
      { id: "doc-bank-payment-file", label: "Banka Ödeme Disketi",            templateUrl: createTemplateDownloadHref("Banka Odeme Disketi"), templateName: "Banka-Odeme-Disketi.txt", description: "Bankaya gönderilen ödeme dosyasının örneğidir. Sistemde üretilecek disket formatının bankanızla uyumlu olduğunu doğrulamak için kullanılır." },
      { id: "doc-accounting-sample", label: "Muhasebe Rapor Örneği",          templateUrl: createTemplateDownloadHref("Muhasebe Rapor Ornegi"), templateName: "Muhasebe-Rapor-Ornegi.xlsx", description: "Muhasebe entegrasyonunda kullanılan mevcut rapor örneğidir. Hesap eşleştirmelerinin doğru kurulduğunu kontrol etmek için gereklidir." }
    ]
  },
  "implementation-report": {
    title: "Rapor Geliştirme ve Entegrasyon",
    description: "Raporlama ve entegrasyon belgelerini doldurup yükleyin, ardından onaya gönderin.",
    documents: [
      { id: "doc-rapor-haritasi", label: "Rapor Haritası",        templateUrl: createTemplateDownloadHref("Rapor Haritasi"),        templateName: "Rapor-Haritasi-Sablon.xlsx", description: "İhtiyaç duyulan raporların listesini ve içeriklerini tanımlar. Rapor geliştirme çalışmalarının kapsamını belirlemek için kullanılır." },
      { id: "doc-entegrasyon",    label: "Entegrasyon Tanımı",    templateUrl: createTemplateDownloadHref("Entegrasyon Tanimi"),    templateName: "Entegrasyon-Tanimi-Sablon.xlsx", description: "Sistemler arası veri akışının nasıl kurulacağını tanımlar. Entegrasyon geliştirmeleri bu belgeye göre planlanır." },
      { id: "doc-alan-esleme",    label: "Alan Eşleme Tablosu",   templateUrl: createTemplateDownloadHref("Alan Esleme"),           templateName: "Alan-Esleme-Sablon.xlsx", description: "Kaynak ve hedef sistemlerdeki alanların birbirine nasıl eşleneceğini gösterir. Entegrasyon ve rapor kurulumunda referans alınır." },
      { id: "doc-test-senaryosu", label: "Test Senaryoları",      templateUrl: createTemplateDownloadHref("Test Senaryolari"),      templateName: "Test-Senaryolari-Sablon.xlsx", description: "Geliştirilen rapor ve entegrasyonların test edileceği senaryoları listeler. Kabul testleri bu senaryolara göre yürütülür." }
    ]
  },
  "transition-call": {
    title: "Muhasebe Rapor Kurulumu",
    description: "Muhasebe rapor şablonlarını doldurun ve yükleyin.",
    documents: [
      { id: "doc-muhasebe-fis",    label: "Muhasebe Fişi Şablonu",  templateUrl: createTemplateDownloadHref("Muhasebe Fisi"),    templateName: "Muhasebe-Fisi-Sablon.xlsx", description: "Muhasebe fişlerinin hangi formatta üretileceğini gösteren şablondur. Muhasebe entegrasyon kurulumunda temel alınır." },
      { id: "doc-masraf-merkezi",  label: "Masraf Merkezi Eşleme",  templateUrl: createTemplateDownloadHref("Masraf Merkezi"),  templateName: "Masraf-Merkezi-Sablon.xlsx", description: "Departman/masraf merkezlerinin muhasebe hesap kodlarıyla eşleştirmesini içerir. Doğru raporlama için gereklidir." }
    ]
  },
  integrations: {
    title: "Live Hazırlıkları",
    description: "Live geçiş öncesi kontrol belgelerini doldurun ve yükleyin.",
    documents: [
      { id: "doc-kontrol-listesi", label: "Kontrol Listesi",     templateUrl: createTemplateDownloadHref("Kontrol Listesi"),    templateName: "Kontrol-Listesi-Sablon.xlsx", description: "Live geçiş öncesi tamamlanması gereken kontrol maddelerinin listesidir." },
      { id: "doc-banka-odeme",     label: "Banka Ödeme Dosyası", templateUrl: createTemplateDownloadHref("Banka Odeme"),        templateName: "Banka-Odeme-Sablon.xlsx", description: "Canlı ortamda kullanılacak banka ödeme dosyası formatının son örneğidir." }
    ]
  },
  "operations-handover": {
    title: "Canlıya Geçiş",
    description: "Devir teslim belgelerini doldurun ve yükleyin.",
    documents: [
      { id: "doc-devir-teslim", label: "Devir Teslim Formu", templateUrl: createTemplateDownloadHref("Devir Teslim"), templateName: "Devir-Teslim-Sablon.xlsx", description: "İmplementasyon ekibinden operasyon ekibine devir teslim sürecinde tamamlanan ve onaylanan bilgileri özetler." }
    ]
  }
}

// Her adim icin baslangic durumlari
// docs: { [docId]: null | { id, name, uploadedAt, downloadUrl } }
const implementationEmptyStepUploadSeeds = {
  "system-setup":          { status: "waiting", submitted: false, docs: {}, docStatuses: {}, docReasons: {}, pendingReviewDocIds: [], requiredRevisionDocIds: [], completedDate: "" },
  "parallel-cost":         { status: "waiting", submitted: false, docs: {}, docStatuses: {}, docReasons: {}, pendingReviewDocIds: [], requiredRevisionDocIds: [], completedDate: "" },
  "implementation-report": { status: "waiting", submitted: false, docs: {}, docStatuses: {}, docReasons: {}, pendingReviewDocIds: [], requiredRevisionDocIds: [], completedDate: "" },
  "transition-call":       { status: "waiting", submitted: false, docs: {}, docStatuses: {}, docReasons: {}, pendingReviewDocIds: [], requiredRevisionDocIds: [], completedDate: "" },
  "integrations":          { status: "waiting", submitted: false, docs: {}, docStatuses: {}, docReasons: {}, pendingReviewDocIds: [], requiredRevisionDocIds: [], completedDate: "" },
  "operations-handover":   { status: "waiting", submitted: false, docs: {}, docStatuses: {}, docReasons: {}, pendingReviewDocIds: [], requiredRevisionDocIds: [], completedDate: "" }
}

function getDocUploads(uploadValue) {
  if (!uploadValue) return []
  return Array.isArray(uploadValue) ? uploadValue.filter(Boolean) : [uploadValue]
}

function updateLatestUploadedFile(uploadValue, patch = {}) {
  const uploads = getDocUploads(uploadValue)
  if (uploads.length === 0) return uploads
  return uploads.map((upload, index) =>
    index === uploads.length - 1 ? { ...upload, ...patch } : upload
  )
}

function updateUnreviewedUploadedFiles(uploadValue, patch = {}) {
  return getDocUploads(uploadValue).map((upload) =>
    upload.reviewStatus ? upload : { ...upload, ...patch }
  )
}

function resetLatestReviewedUploadBatch(uploadValue) {
  const uploads = getDocUploads(uploadValue)
  const latestReviewedUpload = [...uploads].reverse().find((upload) => upload.reviewedAt)
  if (!latestReviewedUpload) return uploads
  const latestBatchId = latestReviewedUpload.reviewBatchId || null
  return uploads.map((upload) =>
    (latestBatchId ? upload.reviewBatchId === latestBatchId : upload.reviewedAt === latestReviewedUpload.reviewedAt)
      && upload.reviewStatus === latestReviewedUpload.reviewStatus
      ? { ...upload, reviewStatus: null, reviewReason: "", reviewedAt: "", reviewBatchId: null }
      : upload
  )
}

function getDocUploadStateKey(stepId, docId) {
  return `${stepId}:${docId}`
}

function getImplementationDocumentAccept(doc) {
  return ""
}

function createDemoUploadedFile({
  id,
  name,
  uploadedAt,
  downloadUrl,
  reviewStatus = null,
  reviewReason = "",
  reviewedAt = ""
}) {
  return {
    id,
    name,
    uploadedAt,
    downloadUrl,
    reviewStatus,
    reviewReason,
    reviewedAt
  }
}

const implementationDemoInitialStepId = "system-setup"

function createImplementationDemoStepUploads() {
  return { ...implementationEmptyStepUploadSeeds }
}

const implementationInitialMessages = [
  {
    id: "impl-welcome-1",
    type: "implementation",
    stepId: "system-setup",
    author: "Defne Uzun",
    avatar: "DU",
    text: "Merhabalar,\n\nİmplementasyon sürecimizi buradan birlikte yürüteceğiz. Her adımda sizden talep edilen belgeler şablonlarıyla birlikte karşınıza çıkacak; indirip doldurduktan sonra yükleyebilir, incelememize gönderebilirsiniz.\n\nStarter Kit yüklemesini yukarıdaki Sistem Kurulumu alanından yapmanız gerekmektedir.\n\nPuantaj Formu, paralel maliyet ve aktif bordro hizmeti dönemlerinde kullanılmak üzere; Giriş Çıkış Nakil Formu ise Starter Kit sonrası işe giriş, çıkış ve nakil bildirimleri için ekte yer almaktadır.\n\nAyrıca örnek raporlar dosyasına da ekte ulaşabilirsiniz. Süreçle ilgili her türlü sorunuzu buradan iletebilirsiniz.",
    time: "1 Haz 2026, 09:00",
    isWelcome: true,
    attachments: [
      { name: "Puantaj Formu.xls", size: "93 KB", url: puantajFormDownloadHref, typeLabel: "XLS" },
      { name: "Giriş Çıkış Nakil Formu.xls", size: "56 KB", url: girisCikisNakilDownloadHref, typeLabel: "XLS" },
      { name: "Örnek Raporlar.zip", size: "2.4 MB", url: exampleReportsDownloadHref, typeLabel: "ZIP" }
    ]
  }
]

const implementationStepIntroMessages = {
  "parallel-cost": {
    text: "Merhaba, iyi çalışmalar.\n\nBordro Analiz Çalışmaları aşamasında aşağıdaki dosyaları yukarıdaki alandan yüklemenizi rica ederiz:\n- Maliyet raporu (çarşaf icmal)\n- PDF çalışan bazlı bordrolar\n- Banka ödeme disketi\n- Muhasebe rapor örneği\n\nTüm dosyaları yukarıdan yükledikten sonra onaya gönderebilirsiniz. Süreçle ilgili sorularınızı buradan iletebilirsiniz.\n\nSaygılarımla."
  },
  "integrations": {
    text: "Merhabalar,\n\nLive geçişinize hazırlık sürecini başlatıyoruz. Yukarıdaki maddeleri sırasıyla tamamlamanızı rica ederiz — her adım için gerekli açıklama ve dosyalar ilgili satırda yer almaktadır.\n\nSüreçle ilgili sorularınızı buradan iletebilirsiniz.\n\nSaygılarımla."
  },
  "operations-handover": {
    text: "Merhabalar,\n\nLive hazırlıkları tamamlandı. Canlıya geçiş aşamasına başlıyoruz; devir teslim formunu yukarıdaki alandan paylaşabilirsiniz.\n\nİlk canlı bordro sürecine geçiş için son kontrolleri buradan takip edeceğiz.\n\nSaygılarımla."
  }
}

const implementationRejectReasonTemplates = {
  "parallel-cost": {
    "doc-cost-report": [
      "Merhaba, iyi çalışmalar.\n\n• Çarşaf icmal dosyasında beklediğimiz maliyet kırılımları eksik görünüyor.\n• Toplamlar ile alt kırılımların tekrar kontrol edilip güncel versiyonun yüklenmesini rica ederiz.\n\nTeşekkürler.",
      "Merhaba,\n\n• Maliyet raporundaki dağılım yapısı beklediğimiz formatla tam uyuşmuyor.\n• Kalem bazlı kırılımları netleştirip dosyayı tekrar paylaşmanızı rica ederiz.\n\nİyi çalışmalar."
    ],
    "doc-pdf-payrolls": [
      "Merhaba, iyi çalışmalar.\n\n• Çalışan bazlı bordrolarda eksik sayfalar bulunuyor.\n• Tüm personel bordrolarının okunaklı ve tam olacak şekilde tekrar yüklenmesini rica ederiz.\n\nTeşekkürler.",
      "Merhaba,\n\n• PDF bordro setinde bazı çalışanlara ait çıktılar görünmüyor.\n• Eksik bordroları tamamlayıp güncel dosyayı yeniden paylaşabilir misiniz?\n\nİyi çalışmalar."
    ],
    "doc-bank-payment-file": [
      "Merhaba, iyi çalışmalar.\n\n• Banka ödeme disketi beklenen banka formatı ile uyumlu görünmüyor.\n• Kolon yapısı ve kayıt düzeni kontrol edilerek güncel dosyanın tekrar yüklenmesini rica ederiz.\n\nTeşekkürler.",
      "Merhaba,\n\n• Banka ödeme dosyasında format kontrolü gerektiren alanlar bulunuyor.\n• Dosyayı banka şablonuna uygun hale getirip yeniden paylaşmanızı rica ederiz.\n\nİyi çalışmalar."
    ],
    "doc-accounting-sample": [
      "Merhaba, iyi çalışmalar.\n\n• Muhasebe rapor örneğinde beklediğimiz hesap eşleşmeleri eksik görünüyor.\n• Rapor yapısını gözden geçirip güncel versiyonu tekrar yüklemenizi rica ederiz.\n\nTeşekkürler.",
      "Merhaba,\n\n• Muhasebe rapor örneği içerik ve çıktı yapısı açısından tekrar kontrol gerektiriyor.\n• Düzenlemeleri tamamlayıp dosyayı yeniden paylaşabilir misiniz?\n\nİyi çalışmalar."
    ]
  }
}

const implementationRejectReasonFallbackTemplates = [
  "Merhaba, iyi çalışmalar.\n\n• {{docLabel}} dosyasında kontrol edilmesi gereken alanlar bulunuyor.\n• Gerekli düzeltmeleri yapıp güncel versiyonu tekrar yüklemenizi rica ederiz.\n\nTeşekkürler.",
  "Merhaba,\n\n• {{docLabel}} dosyası beklenen kontrol kriterlerini şu an karşılamıyor.\n• Revize edip yeniden yükledikten sonra tekrar inceleyebiliriz.\n\nİyi çalışmalar."
]

function getImplementationRejectReasonSuggestion(stepId, docId, docLabel, variantIndex = 0) {
  const scopedTemplates = implementationRejectReasonTemplates[stepId]?.[docId]
  const templates = Array.isArray(scopedTemplates) && scopedTemplates.length > 0
    ? scopedTemplates
    : implementationRejectReasonFallbackTemplates.map((template) =>
        template.replace(/\{\{docLabel\}\}/g, docLabel || "İlgili belge")
      )

  return templates[variantIndex % templates.length]
}

function buildImplementationDemoMessages(assignee = "Implementasyon Ekibi", companyUsers = []) {
  const implAvatar = assignee.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "IE"
  const clientUser = companyUsers[0] || null
  const clientName = clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : "Müşteri Kullanıcısı"
  const clientAvatar = clientUser
    ? `${clientUser.firstName?.[0] || ""}${clientUser.lastName?.[0] || ""}`.toUpperCase() || "MK"
    : "MK"
  const implActor = { name: assignee, initials: implAvatar, color: "bg-[#EFF4FF] text-[#2F6FED]" }
  const clientActor = { name: clientName, initials: clientAvatar, color: "bg-[#F4F3FF] text-[#5925DC]" }

  return [
    ...implementationInitialMessages.map((message) => ({
      ...message,
      author: assignee,
      avatar: implAvatar
    }))
  ]
  // legacy seed kept for reference, not used:
  /*
    {
      id: "seed-system-upload-1",
      type: "system",
      stepId: "system-setup",
      subtype: "upload",
      text: "Starter Kit Rev1.xls",
      fileDate: "29 May 2026 10:20",
      actor: clientActor,
      time: "10:20"
    },
    {
      id: "seed-system-submit-1",
      type: "system",
      stepId: "system-setup",
      subtype: "submit",
      text: "1 dosya onaya gönderildi",
      actor: clientActor,
      time: "10:21"
    },
    {
      id: "seed-client-message-1",
      type: "client",
      stepId: "system-setup",
      author: clientName,
      avatar: clientAvatar,
      text: "Starter Kit dosyasını yükleyip onaya gönderiyorum.",
      time: "29 May 2026, 10:21"
    },
    {
      id: "seed-revision-system-1",
      type: "system",
      stepId: "system-setup",
      subtype: "revision",
      text: "Karar gönderildi: ✗ Starter Kit — Belgede kontrol edilmesi gereken alanlar eksik.",
      actor: implActor,
      time: "11:05"
    },
    {
      id: "seed-revision-message-1",
      type: "implementation",
      stepId: "system-setup",
      author: assignee,
      avatar: implAvatar,
      text: "Starter Kit için revizyon talebi oluşturuldu.",
      time: "29 May 2026, 11:05",
      messageVariant: "revision_request",
      revisionEntries: [
        {
          id: "seed-revision-entry-starter-kit",
          docId: "doc-starter-kit",
          docLabel: "Starter Kit",
          fileName: "Starter Kit Rev1.xls",
          revisionItems: [
            { type: "bullet", text: "Belgede kontrol edilmesi gereken alanlar eksik." }
          ],
          relatedDocument: { stepId: "system-setup", docId: "doc-starter-kit", docLabel: "Starter Kit" },
          attachments: []
        }
      ],
      revisionDocLabel: "Starter Kit",
      revisionFileName: "Starter Kit Rev1.xls",
      revisionItems: [
        { type: "bullet", text: "Belgede kontrol edilmesi gereken alanlar eksik." }
      ],
      relatedDocument: { stepId: "system-setup", docId: "doc-starter-kit", docLabel: "Starter Kit" },
      attachments: []
    },
    {
      id: "seed-system-upload-2",
      type: "system",
      stepId: "system-setup",
      subtype: "upload",
      text: "Starter Kit Final.xls",
      fileDate: "30 May 2026 09:40",
      actor: clientActor,
      time: "09:40"
    },
    {
      id: "seed-system-submit-2",
      type: "system",
      stepId: "system-setup",
      subtype: "submit",
      text: "1 dosya onaya gönderildi",
      actor: clientActor,
      time: "09:41"
    },
    {
      id: "seed-client-message-2",
      type: "client",
      stepId: "system-setup",
      author: clientName,
      avatar: clientAvatar,
      text: "Revize edilen Starter Kit dosyasını tekrar yükledim, kontrol edebilir misiniz?",
      time: "30 May 2026, 09:41"
    },
    {
      id: "seed-approval-system-1",
      type: "system",
      stepId: "system-setup",
      subtype: "approve",
      text: "1 belge onaylandı",
      actor: implActor,
      time: "10:10"
    },
    {
      id: "seed-approval-message-1",
      type: "implementation",
      stepId: "system-setup",
      author: assignee,
      avatar: implAvatar,
      text: "Starter Kit belgesi onaylandı.",
      time: "30 May 2026, 10:10",
      messageVariant: "approval_notice",
      approvalCount: 1,
      approvalDocLabel: "Starter Kit",
      approvalFileName: "Starter Kit Final.xls",
      relatedDocument: {
        stepId: "system-setup",
        docId: "doc-starter-kit",
        docLabel: "Starter Kit",
        fileName: "Starter Kit Final.xls"
      }
    },
    {
      id: "seed-stage-complete-system-1",
      type: "system",
      stepId: "system-setup",
      subtype: "approve",
      text: "Sistem Kurulumu tamamlandı",
      actor: implActor,
      time: "10:12"
    },
    {
      id: "seed-stage-complete-message-1",
      type: "implementation",
      stepId: "system-setup",
      author: assignee,
      avatar: implAvatar,
      text: "Sistem Kurulumu tamamlandı.\nBordro Analiz Çalışmaları aşamasına geçiyoruz. Bu alan artık yalnızca görüntülenebilir.",
      time: "30 May 2026, 10:12"
    },
    {
      id: "seed-parallel-intro-1",
      type: "implementation",
      stepId: "parallel-cost",
      author: assignee,
      avatar: implAvatar,
      text: implementationStepIntroMessages["parallel-cost"].text,
      time: "18 Haz 2026, 18:35",
      messageVariant: "step_intro",
      stepIntroId: "parallel-cost",
      attachments: []
    },
    {
      id: "seed-parallel-submit-system-1",
      type: "system",
      stepId: "parallel-cost",
      subtype: "submit",
      text: "4 dosya onaya gönderildi",
      actor: clientActor,
      time: "18:40"
    },
    {
      id: "seed-parallel-client-message-1",
      type: "client",
      stepId: "parallel-cost",
      author: clientName,
      avatar: clientAvatar,
      text: "Bordro Analiz Çalışmaları için tüm dosyaları yükleyip onaya gönderdim.",
      time: "18 Haz 2026, 18:40"
    }
  ]
  */
}

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
    onboardingType: "",
    transitionType: "",
    assignee: "",
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
  return onboardingOptions.find((option) => option.value === value) || { label: "Seçilmedi" }
}

function getTransitionMeta(value) {
  return transitionOptions.find((option) => option.value === value) || { label: "Seçilmedi" }
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
  const subject = "SDP Implementasyon Modülü Kullanıcı Bilgileri"
  const body = [
    `Merhaba ${user.firstName},`,
    "",
    "Implementasyon sureclerinizi yoneteceginiz module ait giris bilgileriniz asagidadadir.",
    "",
    `Şirket: ${companyName}`,
    `Kullanıcı Adı: ${user.username}`,
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

function splitTimestampParts(timestamp = "") {
  const value = String(timestamp || "").trim()
  if (!value) {
    return { date: "", time: "" }
  }

  const parts = value.split(" ")
  if (parts.length <= 1) {
    return { date: value, time: "" }
  }

  return {
    date: parts.slice(0, -1).join(" "),
    time: parts[parts.length - 1]
  }
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
      label: "Yanıt Hazır",
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
    docs_approved: {
      label: "Onaylandı",
      badgeClass: "border-[#D4E8DC] bg-[#F8FCF9] text-[#2D6A4F]",
      progress: 0.85
    },
    completed: {
      label: "Tamamlandı",
      badgeClass: "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]",
      progress: 1
    },
    approved: {
      label: "Tamamlandı",
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  `
}

function InfoTooltip({ text }) {
  if (!text) return null
  return html`
    <span className="group relative inline-flex items-center">
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#D8DEE8] bg-white text-[#98A2B3] transition-all duration-150 group-hover:border-[#C5CFDC] group-hover:text-[#667085] group-hover:shadow-[0_2px_8px_rgba(16,24,40,0.06)]"><${HelpCircleIcon} /></span>
      <span className="pointer-events-none absolute left-0 top-[calc(100%+8px)] z-10 w-[220px] max-w-[calc(100vw-48px)] translate-y-1 rounded-[9px] border border-[#E8EDF4] bg-white/98 px-2.5 py-2 text-[11px] leading-[1.45] text-[#667085] opacity-0 shadow-[0_10px_24px_rgba(16,24,40,0.08)] backdrop-blur-[6px] transition duration-150 group-hover:translate-y-0 group-hover:opacity-100">${text}</span>
    </span>
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
      label: "İmplementasyon Süreçleri",
      icon: html`<${LayersIcon} />`
    },
    {
      id: "sla",
      label: "SLA Çalışma Alanı",
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
      label: "Tüm Uygulamalar",
      icon: html`<${GridIcon} />`
    },
    {
      id: "help",
      label: "Yardım Merkezi",
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
    ? companyDraft.name.trim() || "Yeni Şirket"
    : selectedCompany?.name || (activePage === "sla" ? "Tüm Şirketler" : "Şirket Seçin")

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
                    <span className="kurum-select__eyebrow">Şirket</span>
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
                            <span className="topbar-dropdown__label">Yeni Şirket Hazırla</span>
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
        <span className="topbar__user-pill">Implementasyon Kullanıcısı</span>

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

function EditActionButton({ label, onClick, icon = PencilIcon, disabled = false, tooltip = "" }) {
  const button = html`
    <button
      type="button"
      onClick=${disabled ? undefined : onClick}
      disabled=${disabled}
      className=${classNames(
        "inline-flex h-11 items-center justify-center rounded-[12px] border text-[14px] font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition",
        label ? "gap-2 px-4" : "w-11",
        disabled
          ? "cursor-not-allowed border-[#EAECF0] bg-[#F8FAFC] text-[#98A2B3]"
          : "border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"
      )}
      aria-label=${label || "Düzenle"}
      aria-disabled=${disabled ? "true" : "false"}
    >
      <${icon} />
      ${label ? html`<span>${label}</span>` : null}
    </button>
  `

  if (disabled && tooltip) {
    return html`<span className="inline-flex" title=${tooltip}>${button}</span>`
  }

  return button
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
  const isPlaceholderSelected = selectedOption?.value === ""

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
        className="flex h-12 w-full items-center justify-between rounded-[14px] border border-[#D0D5DD] bg-[#FCFCFD] px-4 text-left text-[14px] font-medium outline-none transition hover:bg-white focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#DCE8FF]"
      >
        <span className=${classNames(isPlaceholderSelected ? "text-[#98A2B3]" : "text-[#101828]")}>
          ${selectedOption?.label || ""}
        </span>
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
              ${isEditMode ? "Kullanıcı Bilgilerini Düzenle" : "Kullanıcı Ekle"}
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
                onInput=${isEditMode ? undefined : (event) => onDraftChange("firstName", event.target.value)}
                readOnly=${isEditMode}
                disabled=${isEditMode}
                placeholder="Ad"
                className=${classNames(
                  "h-11 w-full rounded-[13px] border px-4 text-[14px] text-[#101828] outline-none transition placeholder:text-[#98A2B3]",
                  isEditMode
                    ? "cursor-not-allowed border-[#EAECF0] bg-[#F8FAFC] text-[#667085]"
                    : "border-[#D5DBE5] bg-white focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
                )}
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
                onInput=${isEditMode ? undefined : (event) => onDraftChange("lastName", event.target.value)}
                readOnly=${isEditMode}
                disabled=${isEditMode}
                placeholder="Soyad"
                className=${classNames(
                  "h-11 w-full rounded-[13px] border px-4 text-[14px] text-[#101828] outline-none transition placeholder:text-[#98A2B3]",
                  isEditMode
                    ? "cursor-not-allowed border-[#EAECF0] bg-[#F8FAFC] text-[#667085]"
                    : "border-[#D5DBE5] bg-white focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
                )}
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
                onInput=${isEditMode ? undefined : (event) => onDraftChange("email", event.target.value)}
                readOnly=${isEditMode}
                disabled=${isEditMode}
                placeholder="ornek@sirket.com"
                aria-invalid=${Boolean(emailError)}
                className=${classNames(
                  "h-11 w-full rounded-[13px] border px-4 text-[14px] outline-none transition placeholder:text-[#98A2B3]",
                  isEditMode
                    ? "cursor-not-allowed border-[#EAECF0] bg-[#F8FAFC] text-[#667085]"
                    : emailError
                    ? "border-[#F04438] focus:border-[#F04438] focus:ring-4 focus:ring-[#FEE4E2]"
                    : "border-[#D5DBE5] bg-white text-[#101828] focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
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
              Vazgeç
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
              ${isBusy ? "Kaydediliyor..." : isEditMode ? "Değişiklikleri Kaydet" : "Kullanıcıyı Oluştur"}
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
            Şirket ve Kullanıcı Onboarding
          </span>

          <span className="inline-flex h-9 items-center rounded-full border border-white/80 bg-white/85 px-3.5 text-[12px] font-semibold text-[#344054]">
            ${isCreatingCompany ? "Yeni şirket taslağı" : "Aktif şirket kaydı"}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-[#101828]">
            ${companyName}
          </h1>
          <p className="max-w-[720px] text-[13px] leading-6 text-[#526071]">
            Şirket adını, onboarding modelini ve geçiş hızını aynı akışta netleştirin. Kullanıcı
            hesapları da tek listede oluşsun, erişim bilgileri aynı yerden yönetilsin.
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
  const companyOnboardingOptions = [{ value: "", label: "Seçiniz" }, ...onboardingOptions]
  const companyTransitionOptions = [{ value: "", label: "Seçiniz" }, ...transitionOptions]
  const companyAssigneeOptions = [{ value: "", label: "Seçiniz" }, ...assigneeOptions]
  const hasCreatedProfile = !isCreatingCompany && Boolean(companyDraft.name.trim())
  const profileDescription = hasCreatedProfile
    ? "Implementasyona ait temel bilgiler."
    : "Önce implementasyon bilgilerini girin - kullanıcı oluşturma akışı bu bilgiye göre şekillenecek."

  return html`
    <section className="rounded-[22px] border border-[#F2F4F7] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-[18px] font-semibold text-[#101828]">Implementasyon Bilgileri</h2>
            <p className="text-[13px] text-[#667085]">
              ${profileDescription}
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
                              Vazgeç
                            </button>
                          `
                    }
                    <button
                      type="button"
                      onClick=${onSaveCompany}
                      disabled=${isBusy}
                      className=${classNames(
                        "inline-flex h-11 items-center justify-center rounded-[12px] border text-[13px] font-semibold transition",
                        isCreatingCompany
                          ? (isBusy
                              ? "cursor-not-allowed border-[#D0D5DD] bg-[#F2F4F7] px-5 text-[#98A2B3]"
                              : "border-[#D0D5DD] bg-white px-5 text-[#344054] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-[#F9FAFB]")
                          : (isBusy
                              ? "cursor-not-allowed border-transparent bg-[#B8CCFF] px-5 text-white"
                              : "border-transparent bg-[#2F6FED] px-5 text-white hover:bg-[#285FD0]")
                      )}
                    >
                      ${isCreatingCompany ? "Şirketi Oluştur" : "Kaydet"}
                    </button>
                  </div>
                `
              : null
          }
        </div>

        <div className="overflow-visible">
          ${
            isEditing
              ? html`
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 py-3">
                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Şirket
                      </span>
                      <input
                        type="text"
                        name="companyName"
                        autoComplete="organization"
                        value=${companyDraft.name}
                        onInput=${(event) => onDraftChange("name", event.target.value)}
                        placeholder="Örnek: Ege Perakende Bordro Ekibi"
                        className="h-11 w-full rounded-[13px] border border-[#D5DBE5] bg-[#FCFCFD] px-4 text-[14px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#DCE8FF] placeholder:text-[#98A2B3]"
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Bölüm
                      </span>
                      <${MinimalSelectField}
                        name="onboardingType"
                        options=${companyOnboardingOptions}
                        value=${companyDraft.onboardingType}
                        onChange=${(nextValue) => onDraftChange("onboardingType", nextValue)}
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Geçiş Modeli
                      </span>
                      <${MinimalSelectField}
                        name="transitionType"
                        options=${companyTransitionOptions}
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
                        options=${companyAssigneeOptions}
                        value=${companyDraft.assignee}
                        onChange=${(nextValue) => onDraftChange("assignee", nextValue)}
                      />
                    </label>
                  </div>

                `
              : html`
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 py-4 px-2">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Şirket
                      </span>
                      <p className="text-[15px] font-medium text-[#101828]">
                        ${companyDraft.name || "Şirket adı girilmedi"}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Bölüm
                      </span>
                      <p className="text-[15px] font-medium text-[#101828]">
                        ${onboardingMeta.label}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Geçiş Modeli
                      </span>
                      <p className="text-[15px] font-medium text-[#101828]">
                        ${transitionMeta.label}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Hedef Canlıya Geçiş
                      </span>
                      <p className="text-[15px] font-medium text-[#101828]">
                        05 Temmuz 2026
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                        Implementasyon Uzmanı
                      </span>
                      <p className="text-[15px] font-medium text-[#101828]">
                        Elif Kaya
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
  canCreateUsers,
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
  return html`
    <section className="rounded-[22px] border border-[#F2F4F7] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
      <div className="space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#101828]">
            Kullanıcı Yönetimi
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <${EditActionButton}
              label="Ekle"
              icon=${PlusIcon}
              onClick=${onOpenCreateUserModal}
              disabled=${!canCreateUsers}
              tooltip="Önce şirket profilini oluşturun"
            />
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

                            <div className="flex items-center gap-1 md:justify-end">
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
                                title="Düzenle"
                                aria-label="Düzenle"
                                onClick=${() => onStartEditUser(user)}
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
                    <h3 className="text-[15px] font-semibold text-[#101828]">Henüz kullanıcı yok</h3>
                    <p className="mt-2 max-w-[420px] text-[13px] leading-6 text-[#667085]">
                      Henüz kullanıcı eklenmedi. + Ekle ile kullanıcı oluşturduğunuzda; erişim
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
              <h3 className="text-[17px] font-semibold text-[#101828]">Kullanıcıyı Düzenle</h3>
              <p className="text-[13px] text-[#667085]">
                Kullanıcı adı ve şifre korunur; ad, soyad, e-posta ve rol güncellenir.
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
              Vazgeç
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
            Düzenle
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
            Kullanıcı Adı
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
            <h2 className="text-[19px] font-semibold text-[#101828]">Oluşan Kullanıcı Hesapları</h2>
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
                  <h3 className="text-[16px] font-semibold text-[#101828]">Henüz kullanıcı yok</h3>
                  <p className="mt-2 max-w-[520px] text-[14px] leading-6 text-[#667085]">
                    Şirket profilini hazırlayıp yukarıdaki formdan ilk kullanıcıyı oluşturduğunuzda
                    kullanıcı adı, şifre ve mail aksiyonları burada listelenecek.
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
            SDP Implementasyon Modülü Kullanıcı Bilgileri
          </p>

          <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">Icerik</p>
          <div className="mt-2 whitespace-pre-wrap rounded-[14px] bg-white p-4 text-[13px] leading-6 text-[#475467]">
${`Merhaba ${previewUser.firstName},

Implementasyon sureclerinizi yoneteceginiz module ait giris bilgileriniz asagidadir.

Şirket: ${companyName}
Kullanıcı Adı: ${previewUser.username}
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

function ImplementationStep({ step, index, isSelected, isCompleted, isCurrent, isSelectable, onSelect }) {
  const isPending = !isCompleted && !isCurrent

  return html`
    <button
      type="button"
      onClick=${() => isSelectable && onSelect(step.id)}
      disabled=${!isSelectable}
      className=${classNames("impl-step", !isSelectable && "cursor-not-allowed opacity-50")}
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

      ${isCompleted && step.completedDate
        ? html`<p className="impl-step__completed">Completed: ${step.completedDate}</p>`
        : !isCompleted && step.pendingLabel
          ? html`<p className="impl-step__pending-label">${step.pendingLabel}</p>`
          : null
      }

      ${step.planned ? html`<p className="impl-step__planned">Planned: ${step.planned}</p>` : null}
    </button>
  `
}

function ImplementationTimeline({ steps, activeStepId, onStepChange, progress }) {
  const visibleSteps = steps.filter((s) => s.status !== "disabled")
  const completedCount = visibleSteps.filter((s) => s.status === "completed").length
  const n = visibleSteps.length
  // fill from center of first dot to center of last completed dot
  const fillPct = completedCount === 0 ? 0 : (completedCount - 1) / n * 100

  const halfCol = (100 / n / 2) + "%"
  const baseWidth = "calc(100% - " + (100 / n) + "%)"

  return html`
    <section className="impl-timeline">
      <div className="impl-timeline__track">
        <!-- grey base line -->
        <div className="impl-timeline__line impl-timeline__line--base" style=${{ left: halfCol, width: baseWidth }}></div>
        <!-- green fill line -->
        <div
          className="impl-timeline__line impl-timeline__line--fill"
          style=${{ left: halfCol, width: fillPct + "%" }}
        ></div>

        <div className="impl-timeline__steps" style=${{ gridTemplateColumns: "repeat(" + n + ", 1fr)" }}>
          ${visibleSteps.map((step, index) => html`
            <${ImplementationStep}
              key=${step.id}
              step=${step}
              index=${index}
              isSelected=${step.id === activeStepId}
              isCompleted=${step.status === "completed"}
              isCurrent=${step.status === "in_progress"}
              isSelectable=${step.isSelectable !== false}
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
                          Dosyanızı bırakın veya seçin
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
                            Henüz dosya yüklenmedi. Formatları indirip güncel dosyanızı bu görev
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
  rejectComposer,
  expandedUploadDocIds,
  onFileSelected,
  onFileDropped,
  onDragStateChange,
  onSubmitForApproval,
  onApprove,
  onRequestRevision,
  onApproveDoc,
  onRejectDoc,
  onToggleUploadList,
  onResetDoc,
  onCompleteStep,
  onSendDecisions,
  userRole,
  customDocuments,
  removedDocIds,
  onTextResponse,
  onAddCustomDocument,
  onRemoveDocument
}) {
  const tpl = implementationStepTemplates[activeStep.id]
  const allDocuments = useMemo(
    () => [...tpl.documents, ...(customDocuments || [])].filter((doc) => !(removedDocIds || []).includes(doc.id)),
    [tpl, customDocuments, removedDocIds]
  )
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditingCustomDocs, setIsEditingCustomDocs] = useState(false)
  const [openMenuDocId, setOpenMenuDocId] = useState(null)
  const [menuDirection, setMenuDirection] = useState("down")

  useEffect(() => {
    setIsAddModalOpen(false)
    setIsEditingCustomDocs(false)
  }, [activeStep.id])

  useEffect(() => {
    if (!openMenuDocId) return
    function handleClickOutside(e) {
      if (!e.target.closest("[data-doc-actions-menu]")) setOpenMenuDocId(null)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [openMenuDocId])

  function toggleDocMenu(e, docId) {
    if (openMenuDocId === docId) { setOpenMenuDocId(null); return }
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuDirection(window.innerHeight - rect.bottom < 220 ? "up" : "down")
    setOpenMenuDocId(docId)
  }

  const [customTemplates, setCustomTemplates] = useState({})
  const [removedTemplateDocIds, setRemovedTemplateDocIds] = useState([])
  const [templateChangeNotices, setTemplateChangeNotices] = useState({})

  function handleTemplateFileSelected(docId, e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCustomTemplates((prev) => ({ ...prev, [docId]: { file, name: file.name } }))
    setRemovedTemplateDocIds((prev) => prev.filter((id) => id !== docId))
    if (getDocUploads(docs[docId]).length > 0) {
      setTemplateChangeNotices((prev) => ({ ...prev, [docId]: "changed" }))
    }
    e.target.value = ""
  }

  function handleRemoveTemplate(docId) {
    setCustomTemplates((prev) => {
      const next = { ...prev }
      delete next[docId]
      return next
    })
    setRemovedTemplateDocIds((prev) => [...prev, docId])
    if (getDocUploads(docs[docId]).length > 0) {
      setTemplateChangeNotices((prev) => ({ ...prev, [docId]: "removed" }))
    }
  }

  function downloadTemplateFile(doc) {
    const custom = customTemplates[doc.id]
    const link = document.createElement("a")
    if (custom) {
      const url = URL.createObjectURL(custom.file)
      link.href = url
      link.download = custom.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } else if (doc.templateUrl) {
      link.href = doc.templateUrl
      link.download = doc.templateName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  function handleAddTemplateSubmit(entries) {
    entries.forEach(({ label, responseType, file, description }) => onAddCustomDocument({ label, responseType, file, description }))
    setIsAddModalOpen(false)
  }
  const status = stepUpload ? stepUpload.status : "waiting"
  const submitted = stepUpload ? stepUpload.submitted : false
  const docs = stepUpload ? stepUpload.docs : {}
  const docStatuses = stepUpload ? (stepUpload.docStatuses || {}) : {}
  const docReasons = stepUpload ? (stepUpload.docReasons || {}) : {}
  const requiredRevisionDocIds = status === "revision_requested"
    ? (
        Array.isArray(stepUpload?.requiredRevisionDocIds) && stepUpload.requiredRevisionDocIds.length > 0
          ? stepUpload.requiredRevisionDocIds
          : Object.keys(docStatuses).filter((docId) => docStatuses[docId] === "rejected")
      )
    : []
  const pendingReviewDocIds = status === "pending_approval"
    ? (
        Array.isArray(stepUpload?.pendingReviewDocIds) && stepUpload.pendingReviewDocIds.length > 0
          ? stepUpload.pendingReviewDocIds.filter((docId) => getDocUploads(docs[docId]).length > 0)
          : Object.keys(docs).filter((docId) => getDocUploads(docs[docId]).length > 0 && !docStatuses[docId])
      )
    : []
  const statusMeta = getImplementationTaskStatusMeta(status)

  const uploadedDocIds = Object.keys(docs).filter((id) => getDocUploads(docs[id]).length > 0)
  const uploadedCount = uploadedDocIds.length
  const currentReviewCount = pendingReviewDocIds.length
  const pendingRevisionUploadCount = requiredRevisionDocIds.filter((docId) => {
    const uploads = getDocUploads(docs[docId])
    const latestUpload = uploads[uploads.length - 1] || null
    return !latestUpload || latestUpload.reviewStatus === "rejected"
  }).length
  const submittableDocCount = status === "revision_requested"
    ? requiredRevisionDocIds.length
    : uploadedCount
  const isImpEkibi = userRole === "imp_ekibi" || !userRole
  const canReviewDocs = isImpEkibi && status === "pending_approval"
  const allDocsApproved = currentReviewCount > 0 && pendingReviewDocIds.every((id) => docStatuses[id] === "approved")
  const allDocsReviewed = currentReviewCount > 0 && pendingReviewDocIds.every((id) => docStatuses[id] === "approved" || docStatuses[id] === "rejected")
  const hasRejectedDocs = Object.values(docStatuses).some(s => s === "rejected")
  const rejectedDocCount = Object.values(docStatuses).filter((statusValue) => statusValue === "rejected").length
  const missingInitialResponseCount = allDocuments.filter((doc) => getDocUploads(docs[doc.id]).length === 0).length
  const hasAllRequiredResponses = status === "revision_requested"
    ? requiredRevisionDocIds.length > 0 && pendingRevisionUploadCount === 0
    : allDocuments.length > 0 && missingInitialResponseCount === 0
  const canSubmit = !submitted && hasAllRequiredResponses && !isImpEkibi
  const submitEnabled = canSubmit
  const isDocsApproved = status === "docs_approved"
  const isStageCompleted = status === "completed" || status === "approved"
  const hasApprovedResponses = Object.values(docStatuses).some((statusValue) => statusValue === "approved")
  const canManageTemplate = isImpEkibi
    && !submitted
    && !isDocsApproved
    && !isStageCompleted
    && (status === "revision_requested" || !hasApprovedResponses)
  const canUploadDoc = !submitted && !isDocsApproved && !isStageCompleted && userRole !== "imp_ekibi"
  const visibleDocuments = canReviewDocs && currentReviewCount > 0
    ? allDocuments.filter((doc) => {
        const hasUploads = getDocUploads(docs[doc.id]).length > 0
        return hasUploads && (pendingReviewDocIds.includes(doc.id) || docStatuses[doc.id] === "approved")
      })
    : allDocuments

  const statusDot = {
    waiting:            "bg-[#D0D5DD]",
    uploaded:           "bg-[#93C5FD]",
    pending_approval:   "bg-[#F79009]",
    reviewing:          "bg-[#2F6FED]",
    revision_requested: "bg-[#F04438]",
    docs_approved:      "bg-[#12B76A]",
    completed:          "bg-[#12B76A]",
    approved:           "bg-[#12B76A]"
  }[status] || "bg-[#D0D5DD]"

  useEffect(() => {
    if (canManageTemplate) return
    setIsEditingCustomDocs(false)
    setIsAddModalOpen(false)
    setOpenMenuDocId(null)
  }, [canManageTemplate])

  return html`
    <section className="space-y-4">
      <div>
        <h2 className="text-[17px] font-semibold text-[#101828]">${tpl.title}</h2>
        <p className="mt-0.5 text-[13px] text-[#667085]">${tpl.description}</p>
      </div>

      <div className=${classNames(
        "rounded-[16px] border bg-white",
        status === "revision_requested"       ? "border-[#FEE4E2]"
        : isEditingCustomDocs                 ? "border-[#D5E2FF]"
        : isStageCompleted                    ? "border-[#ABEFC6]"
        : isDocsApproved                       ? "border-[#D4E8DC]"
        : status === "pending_approval"        ? "border-[#FDE68A]"
        : "border-[#E4E7EC]"
      )}>

        <!-- Card header: overall status -->
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[#F2F4F7]">
          <div className="flex items-center gap-2">
            <span className=${classNames("h-2 w-2 shrink-0 rounded-full", statusDot)}></span>
            <span className="text-[13px] font-semibold text-[#344054]">${tpl.title}</span>
          </div>
          <div className="flex items-center gap-2">
            ${canManageTemplate ? html`
              <button
                type="button"
                onClick=${() => setIsEditingCustomDocs((current) => !current)}
                className=${classNames(
                  "inline-flex h-[26px] items-center gap-1 rounded-[7px] border px-2 text-[11px] font-medium transition",
                  isEditingCustomDocs
                    ? "border-[#2F6FED] bg-[#2F6FED] text-white hover:bg-[#2563CC]"
                    : "border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"
                )}
              >
                ${isEditingCustomDocs ? null : html`<${PencilIcon} />`}${isEditingCustomDocs ? "Tamam" : "Şablon Düzenle"}
              </button>
            ` : isImpEkibi && (submitted || isDocsApproved || isStageCompleted || hasApprovedResponses) ? html`
              <span
                title=${submitted ? "Müşteri yanıtları incelenirken alan yapısı değiştirilemez." : "Onaylanan alan yapısı değiştirilemez."}
                className="inline-flex h-[26px] items-center gap-1 rounded-[7px] border border-[#E4E7EC] bg-[#F9FAFB] px-2 text-[11px] font-medium text-[#98A2B3]"
              >
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><rect x="2.5" y="6" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Şablon Kilitli
              </span>
            ` : null}
            <span className=${classNames(
              "inline-flex h-[22px] items-center rounded-full border px-2.5 text-[11px] font-medium",
              statusMeta.badgeClass
            )}>${statusMeta.label}</span>
          </div>
        </div>

        <!-- Document rows -->
        <div className="divide-y divide-[#F2F4F7]">
          ${visibleDocuments.map((doc) => {
            const docUploads = getDocUploads(docs[doc.id])
            const latestUpload = docUploads[docUploads.length - 1] || null
            const historicalUploads = docUploads.slice(0, -1).reverse()
            const hasUploads = docUploads.length > 0
            const isDragActive = dragDocId === doc.id
            const docStatus = docStatuses[doc.id] || null
            const docReason = docReasons[doc.id] || ""
            const isRejectTarget = rejectComposer?.stepId === activeStep.id && rejectComposer?.docId === doc.id
            const uploadListKey = getDocUploadStateKey(activeStep.id, doc.id)
            const isUploadListExpanded = Boolean(expandedUploadDocIds?.[uploadListKey])
            const latestUploadParts = latestUpload ? splitTimestampParts(latestUpload.uploadedAt) : { date: "", time: "" }
            const isTextResponse = doc.responseType === "text"
            const textResponse = isTextResponse ? (latestUpload?.text || "") : ""
            const canUploadThisDoc = !isTextResponse && canUploadDoc && docStatus !== "approved"
            const documentAccept = getImplementationDocumentAccept(doc)
            const fileInputId = `step-upload-${activeStep.id}-${doc.id}`
            const templateInputId = `template-upload-${activeStep.id}-${doc.id}`
            const isPendingReviewDoc = pendingReviewDocIds.includes(doc.id)
            const customTemplate = customTemplates[doc.id]
            const isTemplateRemoved = removedTemplateDocIds.includes(doc.id) && !customTemplate
            const hasTemplate = !isTextResponse && Boolean(customTemplate || (doc.templateUrl && !isTemplateRemoved))
            const templateName = customTemplate ? customTemplate.name : doc.templateName
            const templateChangeNotice = templateChangeNotices[doc.id] || null

            const fileChip = hasUploads ? isTextResponse ? html`
              <div className=${classNames(
                "rounded-[9px] border px-3 py-2.5 text-[12px] leading-5",
                docStatus === "approved" ? "border-[#ABEFC6] bg-[#ECFDF3] text-[#065F46]" : docStatus === "rejected" ? "border-[#FDA29B] bg-[#FEF3F2] text-[#991B1B]" : "border-[#E4E7EC] bg-[#F9FAFB] text-[#344054]"
              )}>
                <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                  Metin yanıtı
                </div>
                <div className="whitespace-pre-wrap break-words">${textResponse}</div>
              </div>
            ` : html`
              <div className=${classNames(
                "flex min-w-0 items-center gap-2 rounded-[7px] border px-2.5 py-2",
                docStatus === "approved" ? "border-[#ABEFC6] bg-[#ECFDF3]" : docStatus === "rejected" ? "border-[#FDA29B] bg-[#FEF3F2]" : "border-[#E4E7EC] bg-[#F9FAFB]"
              )}>
                ${docStatus === "approved"
                  ? html`<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#067647" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>`
                  : docStatus === "rejected"
                  ? html`<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="#D92D20" strokeWidth="1.5" strokeLinecap="round"/></svg>`
                  : html`<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#12B76A" strokeWidth="1.3"/><path d="M4 7l2 2 4-4" stroke="#12B76A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>`
                }
                <div className="min-w-0 flex-1">
                  <a href=${latestUpload.downloadUrl} download=${latestUpload.name} className="block truncate text-[12px] font-medium text-[#344054] hover:text-[#2F6FED]" title=${latestUpload.name}>
                    ${latestUpload.name}
                  </a>
                </div>
                ${latestUploadParts.date || latestUploadParts.time ? html`
                  <div className="shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap pl-2 text-right">
                    ${latestUploadParts.date ? html`<span className="text-[10px] font-medium leading-none text-[#98A2B3]">${latestUploadParts.date}</span>` : null}
                    ${latestUploadParts.time ? html`<span className="text-[10px] leading-none text-[#B0B8C5]">${latestUploadParts.time}</span>` : null}
                  </div>
                ` : null}
                ${latestUpload.reviewStatus === "rejected" ? html`
                  <span className="shrink-0 inline-flex items-center rounded-full bg-[#FEF3F2] px-2 py-0.5 text-[10px] font-semibold text-[#D92D20]">Reddedildi</span>
                ` : latestUpload.reviewStatus === "approved" ? html`
                  <span className="shrink-0 inline-flex items-center rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[10px] font-semibold text-[#067647]">Onaylandı</span>
                ` : null}
                ${historicalUploads.length > 0 ? html`
                  <button type="button" onClick=${() => onToggleUploadList(doc.id)} className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[#D0D5DD] bg-white px-2 py-1 text-[11px] font-medium text-[#475467] transition hover:bg-[#F9FAFB]">
                    ${docUploads.length} dosya
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className=${classNames("transition", isUploadListExpanded && "rotate-180")}><path d="M3.5 5.5L7 9l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                ` : null}
              </div>
            ` : null

            const expandedList = isUploadListExpanded ? html`
              <div className="space-y-2 rounded-[9px] border border-[#EAECF0] bg-[#FCFCFD] p-2.5">
                ${historicalUploads.map((file) => {
                  const uploadParts = splitTimestampParts(file.uploadedAt)
                  const fileReviewStatus = file.reviewStatus || null
                  const fileIsRejected = fileReviewStatus === "rejected"
                  const fileIsApproved = fileReviewStatus === "approved"
                  return html`
                  <div
                    key=${file.id}
                    className=${classNames(
                      "flex min-w-0 items-center gap-2 rounded-[7px] border px-2.5 py-2",
                      fileIsRejected
                        ? "border-[#FECACA] bg-[#FFF5F5]"
                        : fileIsApproved
                        ? "border-[#C7E9D4] bg-[#F4FFF8]"
                        : "border-[#F2F4F7] bg-white"
                    )}
                  >
                    ${fileIsRejected
                      ? html`<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="#D92D20" strokeWidth="1.5" strokeLinecap="round"/></svg>`
                      : fileIsApproved
                      ? html`<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#067647" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>`
                      : html`<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#D0D5DD" strokeWidth="1.3"/><path d="M4 7l2 2 4-4" stroke="#98A2B3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>`
                    }
                    <div className="min-w-0 flex-1">
                      <a href=${file.downloadUrl} download=${file.name} className="block truncate text-[12px] font-medium text-[#344054] hover:text-[#2F6FED]" title=${file.name}>${file.name}</a>
                    </div>
                    ${uploadParts.date || uploadParts.time ? html`
                      <div className="shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap pl-2 text-right">
                        ${uploadParts.date ? html`<span className="text-[10px] font-medium leading-none text-[#98A2B3]">${uploadParts.date}</span>` : null}
                        ${uploadParts.time ? html`<span className="text-[10px] leading-none text-[#B0B8C5]">${uploadParts.time}</span>` : null}
                      </div>
                    ` : null}
                    ${fileIsRejected ? html`
                      <span className="shrink-0 inline-flex items-center rounded-full bg-[#FEF3F2] px-2 py-0.5 text-[10px] font-semibold text-[#D92D20]">
                        Reddedildi
                      </span>
                    ` : fileIsApproved ? html`
                      <span className="shrink-0 inline-flex items-center rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[10px] font-semibold text-[#067647]">
                        Onaylandı
                      </span>
                    ` : null}
                  </div>
                `})}
              </div>
            ` : null

            const actionButtons = html`
              <div className="flex w-full shrink-0 flex-wrap items-center justify-start gap-1.5 xl:w-auto xl:justify-end xl:self-center">
                ${canReviewDocs && hasUploads ? html`
                  ${docStatus === "approved" ? html`
                    <span className="inline-flex items-center gap-1 rounded-[7px] border border-[#ABEFC6] bg-[#ECFDF3] px-2.5 py-1.5 text-[12px] font-medium text-[#067647]">
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#067647" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>Onaylandı
                    </span>
                  ` : docStatus === "rejected" ? html`
                    <span className="inline-flex items-center gap-1 rounded-[7px] border border-[#FDA29B] bg-[#FEF3F2] px-2.5 py-1.5 text-[12px] font-medium text-[#D92D20]">
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="#D92D20" strokeWidth="1.5" strokeLinecap="round"/></svg>Reddedildi
                    </span>
                    <button type="button" onClick=${() => onResetDoc(doc.id)} className="shrink-0 inline-flex items-center gap-1 rounded-[7px] border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#667085] hover:bg-[#F9FAFB] transition">Geri Al</button>
                  ` : isPendingReviewDoc ? html`
                    <button type="button" onClick=${() => onRejectDoc(doc.id, doc.label)} className="shrink-0 inline-flex items-center gap-1 rounded-[7px] border border-[#FDA29B] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#D92D20] hover:bg-[#FEF3F2] transition">
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="#D92D20" strokeWidth="1.5" strokeLinecap="round"/></svg>Reddet
                    </button>
                    <button type="button" onClick=${() => onApproveDoc(doc.id)} className="shrink-0 inline-flex items-center gap-1 rounded-[7px] border border-[#ABEFC6] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#067647] hover:bg-[#ECFDF3] transition">
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#067647" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>Onayla
                    </button>
                  ` : null}
                ` : null}
                ${isImpEkibi && !isTextResponse && (hasTemplate || isEditingCustomDocs) ? html`
                  <div className="relative shrink-0" data-doc-actions-menu>
                    <button
                      type="button"
                      title="İşlemler"
                      aria-haspopup="menu"
                      aria-expanded=${String(openMenuDocId === doc.id)}
                      onClick=${(e) => toggleDocMenu(e, doc.id)}
                      className=${classNames(
                        "relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                        openMenuDocId === doc.id ? "bg-[#F2F4F7] text-[#101828]" : "text-[#475467] hover:bg-[#F2F4F7] hover:text-[#101828]"
                      )}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="8" cy="13" r="1.4"/></svg>
                    </button>
                    ${openMenuDocId === doc.id ? html`
                      <div className=${classNames(
                        "absolute right-0 z-20 w-48 rounded-[12px] border border-[#E4E7EC] bg-white p-1.5 shadow-[0_14px_32px_rgba(16,24,40,0.14)]",
                        menuDirection === "up" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"
                      )}>
                        ${hasTemplate ? html`
                          <button type="button" onClick=${() => { downloadTemplateFile({ ...doc, templateName }); setOpenMenuDocId(null) }}
                            className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F8FAFC]">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#2F6FED]"><${DownloadIcon} /></span>
                            Şablon İndir
                          </button>
                          ${isEditingCustomDocs ? html`
                            <button type="button" onClick=${() => { setOpenMenuDocId(null); document.getElementById(templateInputId)?.click() }}
                              className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F8FAFC]">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#475467]"><${PencilIcon} /></span>
                              Şablon Değiştir
                            </button>
                            <button type="button" onClick=${() => { handleRemoveTemplate(doc.id); setOpenMenuDocId(null) }}
                              className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#D92D20] transition hover:bg-[#FEF3F2]">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#D92D20]"><${TrashIcon} /></span>
                              Şablonu Kaldır
                            </button>
                          ` : null}
                        ` : html`
                          <button type="button" onClick=${() => { setOpenMenuDocId(null); document.getElementById(templateInputId)?.click() }}
                            className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F8FAFC]">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#475467]"><${UploadIcon} /></span>
                            Şablon Yükle
                          </button>
                        `}
                      </div>
                    ` : null}
                    <input
                      id=${templateInputId}
                      type="file"
                      onChange=${(e) => handleTemplateFileSelected(doc.id, e)}
                      tabIndex="-1"
                      className="hidden"
                    />
                  </div>
                ` : !isImpEkibi && !isTextResponse && (hasTemplate || canUploadThisDoc) ? html`
                  <div
                    className="relative shrink-0"
                    data-doc-actions-menu
                    onDragOver=${canUploadThisDoc ? (e) => { e.preventDefault(); onDragStateChange(doc.id) } : undefined}
                    onDragLeave=${canUploadThisDoc ? () => onDragStateChange("") : undefined}
                    onDrop=${canUploadThisDoc ? (e) => {
                      onDragStateChange("")
                      onFileDropped(doc.id, e)
                      setTemplateChangeNotices((prev) => ({ ...prev, [doc.id]: null }))
                    } : undefined}
                  >
                    <button
                      type="button"
                      title="İşlemler"
                      aria-haspopup="menu"
                      aria-expanded=${String(openMenuDocId === doc.id)}
                      onClick=${(e) => toggleDocMenu(e, doc.id)}
                      className=${classNames(
                        "relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                        isDragActive ? "bg-[#EFF4FF] text-[#2F6FED]"
                          : openMenuDocId === doc.id ? "bg-[#F2F4F7] text-[#101828]"
                          : "text-[#475467] hover:bg-[#F2F4F7] hover:text-[#101828]"
                      )}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="8" cy="13" r="1.4"/></svg>
                    </button>
                    ${openMenuDocId === doc.id ? html`
                      <div className=${classNames(
                        "absolute right-0 z-20 w-56 rounded-[12px] border border-[#E4E7EC] bg-white p-1.5 shadow-[0_14px_32px_rgba(16,24,40,0.14)]",
                        menuDirection === "up" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"
                      )}>
                        ${hasTemplate ? html`
                          <button type="button" onClick=${() => { downloadTemplateFile({ ...doc, templateName }); setOpenMenuDocId(null) }}
                            className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F8FAFC]">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#2F6FED]"><${DownloadIcon} /></span>
                            Şablonu İndir
                          </button>
                        ` : null}
                        ${canUploadThisDoc ? html`
                          <button type="button" onClick=${() => { setOpenMenuDocId(null); document.getElementById(fileInputId)?.click() }}
                            className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F8FAFC]">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#475467]"><${UploadIcon} /></span>
                            ${hasUploads ? (status === "revision_requested" ? "Yeni Versiyon Ekle" : "Dosya Ekle") : "Dosya Yükle"}
                          </button>
                        ` : null}
                      </div>
                    ` : null}
                    ${canUploadThisDoc ? html`
                      <input
                        id=${fileInputId}
                        type="file"
                        multiple
                        onChange=${(e) => {
                          onFileSelected(doc.id, e)
                          setTemplateChangeNotices((prev) => ({ ...prev, [doc.id]: null }))
                        }}
                        accept=${documentAccept}
                        tabIndex="-1"
                        className="hidden"
                      />
                    ` : null}
                  </div>
                ` : null}
                ${isImpEkibi && isEditingCustomDocs ? html`
                  <button
                    type="button"
                    title="Sil"
                    aria-label="Alanı sil"
                    onClick=${() => {
                      if (window.confirm("Bu alanı silmek istediğinize emin misiniz?")) onRemoveDocument(doc)
                    }}
                    className="relative z-10 shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#475467] hover:text-[#D92D20] hover:bg-[#FEF3F2] transition-all duration-200"
                  >
                    <${TrashIcon} />
                  </button>
                ` : null}
              </div>
            `

            return html`
              <div key=${doc.id} className=${classNames("px-5 py-2.5 transition", isRejectTarget && "bg-[#FFF9F5]")}>
                <div className="flex flex-col gap-2.5 xl:grid xl:grid-cols-[220px_minmax(0,540px)_auto] xl:items-center xl:gap-3">
                  <div className="w-full xl:min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#344054]">${doc.label}</span>
                      <${InfoTooltip} text=${doc.description} />
                    </div>
                  </div>
                  <div className="min-w-0 space-y-2 xl:max-w-[540px]">
                    ${isTextResponse && !isImpEkibi && canUploadDoc && docStatus !== "approved" && status !== "pending_approval" ? html`
                      <textarea
                        rows="2"
                        value=${textResponse}
                        onInput=${(event) => onTextResponse(doc.id, event.target.value)}
                        placeholder="Yanıtınızı buraya yazın…"
                        className="w-full resize-none rounded-[9px] border border-[#D5DBE5] bg-white px-3 py-2 text-[12.5px] leading-5 text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
                      />
                    ` : fileChip}
                    ${hasUploads && templateChangeNotice ? html`
                      <div className="flex items-start gap-2 rounded-[8px] border border-[#FDE68A] bg-[#FFFAEB] px-2.5 py-2 text-[11px] leading-4 text-[#B54708]">
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0"><path d="M7 1.5l5.5 10H1.5L7 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M7 5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="10" r=".7" fill="currentColor"/></svg>
                        ${templateChangeNotice === "removed"
                          ? "Şablon kaldırıldı. Daha önce yüklediğiniz yanıt korunuyor."
                          : "Şablon güncellendi. Daha önce yüklediğiniz dosyanın güncel şablona uygunluğunu kontrol edin."}
                      </div>
                    ` : null}
                    ${!hasUploads && !isTextResponse ? html`<div className="flex items-center gap-2 px-1 py-1 text-[12px] text-[#98A2B3]"><span className="font-medium">Henüz yüklenmedi</span></div>` : null}
                    ${!hasUploads && isTextResponse && (isImpEkibi || !canUploadDoc) ? html`<div className="flex items-center gap-2 px-1 py-1 text-[12px] text-[#98A2B3]"><span className="font-medium">Henüz yanıtlanmadı</span></div>` : null}
                    ${!isTextResponse ? expandedList : null}
                  </div>
                  ${actionButtons}
                </div>
              </div>
            `
          })}
          ${isImpEkibi && isEditingCustomDocs ? html`
            <div className="px-5 py-2">
              <button
                type="button"
                onClick=${() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1 py-0.5 text-[12px] font-medium text-[#2F6FED] transition hover:text-[#2563CC]"
              >
                <${PlusIcon} />Ekle
              </button>
            </div>
          ` : null}
        </div>


        <!-- Footer: submit or status -->
        <div className="flex items-center justify-between gap-3 border-t border-[#F2F4F7] px-5 py-3">
          ${status === "revision_requested" ? html`
            <span className="text-[12px] text-[#667085]">
              ${requiredRevisionDocIds.length > 0
                ? pendingRevisionUploadCount > 0
                  ? `${pendingRevisionUploadCount} revize veya yeni alanın yanıtlanması gerekiyor. Tüm gerekli yanıtlar tamamlanmadan Onaya Gönder aktif olmaz.`
                  : `${requiredRevisionDocIds.length} gerekli yanıt hazır. Onaya Gönder ile tekrar incelemeye gönderebilirsiniz.`
                : "Revizyon notu mesajlar alanında paylaşıldı. Revize istenen yanıtları güncelleyip yeniden gönderin."}
            </span>
          ` : isStageCompleted ? html`
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#067647" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-[12px] font-medium text-[#067647]">Stage tamamlandı. Bu alan artık yalnızca görüntülenebilir.</span>
            </div>
          ` : isDocsApproved ? html`
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#2D6A4F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-[12px] font-medium text-[#2D6A4F]">Belgeler onaylandı. Stage tamamlanmayı bekliyor.</span>
            </div>
          ` : status === "pending_approval" ? html`
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#F79009" strokeWidth="1.3"/><path d="M7 4.5v3l1.5 1.5" stroke="#F79009" strokeWidth="1.3" strokeLinecap="round"/></svg>
              <span className="text-[12px] text-[#B54708]">${currentReviewCount || uploadedCount} yanıt onaya gönderildi, implementasyon ekibi inceliyor.</span>
            </div>
          ` : uploadedCount > 0 ? html`
            <span className="text-[12px] text-[#98A2B3]">${uploadedCount} yanıt hazır${missingInitialResponseCount > 0 ? ` · ${missingInitialResponseCount} yanıt bekleniyor` : ""}</span>
          ` : html`<span></span>`}

          ${isImpEkibi && status === "pending_approval" ? html`
            <button
              type="button"
              onClick=${allDocsReviewed ? onSendDecisions : undefined}
              disabled=${!allDocsReviewed}
              className=${!allDocsReviewed
                ? "shrink-0 inline-flex cursor-not-allowed items-center gap-2 rounded-[9px] bg-[#F2F4F7] px-4 py-2 text-[13px] font-semibold text-[#98A2B3]"
                : allDocsApproved
                  ? "shrink-0 inline-flex items-center gap-2 rounded-[9px] bg-[#067647] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#05603A]"
                  : "shrink-0 inline-flex items-center gap-2 rounded-[9px] bg-[#2F6FED] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#2563CC]"
              }
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v8M7 1.5L4 4.5M7 1.5l3 3M1.5 10.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Kararları Gönder
            </button>
          ` : isImpEkibi && isDocsApproved ? html`
            <button
              type="button"
              onClick=${onCompleteStep}
              className="shrink-0 inline-flex items-center gap-2 rounded-[9px] bg-[#067647] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#05603A]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Stage Tamamla
            </button>
          ` : canSubmit && !isDocsApproved && !isStageCompleted ? html`
            <button
              type="button"
              onClick=${submitEnabled ? onSubmitForApproval : undefined}
              disabled=${!submitEnabled}
              className=${submitEnabled
                ? "shrink-0 inline-flex items-center gap-1.5 rounded-[7px] border border-[#2F6FED] bg-[#2F6FED] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:border-[#2563CC] hover:bg-[#2563CC]"
                : "shrink-0 inline-flex cursor-not-allowed items-center gap-1.5 rounded-[7px] border border-[#E4E7EC] bg-[#F2F4F7] px-3 py-1.5 text-[12px] font-semibold text-[#98A2B3]"
              }
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v8M7 1.5L4 4.5M7 1.5l3 3M1.5 10.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Onaya Gönder</span>
              <span className=${submitEnabled
                ? "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] bg-[#EAF2FF] px-1 text-[10px] font-semibold text-[#2F6FED]"
                : "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] bg-[#E4E7EC] px-1 text-[10px] font-semibold text-[#98A2B3]"
              }>
                ${submittableDocCount}
              </span>
            </button>
          ` : submitted ? html`
            <span className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#667085]">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Gönderildi
            </span>
          ` : null}
        </div>
      </div>

      <${AddCustomDocumentModal}
        isOpen=${isAddModalOpen}
        stepTitle=${tpl.title}
        onClose=${() => setIsAddModalOpen(false)}
        onSubmit=${handleAddTemplateSubmit}
      />
    </section>
  `
}

function GoLiveTransitionContent({ stepUpload, userRole, onCompleteStep, companyName }) {
  const [copyDone, setCopyDone] = useState(false)
  const [ogyMtDone, setOgyMtDone] = useState(false)
  const [isOperationsModalOpen, setIsOperationsModalOpen] = useState(false)
  const [isOgyMtModalOpen, setIsOgyMtModalOpen] = useState(false)

  const isImpEkibi = userRole === "imp_ekibi" || !userRole
  const isStageCompleted = stepUpload?.status === "completed" || stepUpload?.status === "approved"
  const allDone = copyDone && ogyMtDone
  const completedCount = [copyDone, ogyMtDone].filter(Boolean).length
  const statusMeta = isStageCompleted
    ? { dot: "bg-[#12B76A]", badgeClass: "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]", label: "Tamamlandı" }
    : allDone
      ? { dot: "bg-[#12B76A]", badgeClass: "border-[#D4E8DC] bg-[#F8FCF9] text-[#2D6A4F]", label: "Tamamlanmaya Hazır" }
      : { dot: "bg-[#2F6FED]", badgeClass: "border-[#D5E2FF] bg-[#EFF4FF] text-[#175CD3]", label: "Devam Ediyor" }

  const checkIcon = html`<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>`

  const rows = [
    {
      id: "copy",
      number: "01",
      title: "Firmayı Canlıya Geçir",
      desc: "Hedef bölüm seçimi ve kopyalama ayarlarını belirle.",
      done: copyDone,
      action: html`
        <button
          type="button"
          disabled=${!isImpEkibi || isStageCompleted || copyDone}
          onClick=${copyDone ? undefined : () => setIsOperationsModalOpen(true)}
          className=${copyDone
            ? "shrink-0 inline-flex cursor-default items-center gap-1.5 rounded-[8px] border border-[#ABEFC6] bg-[#ECFDF3] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#067647] whitespace-nowrap"
            : (!isImpEkibi || isStageCompleted)
              ? "shrink-0 inline-flex cursor-not-allowed items-center gap-1 rounded-[8px] border border-[#E4E7EC] bg-[#F2F4F7] px-3.5 py-1.5 text-[12.5px] font-medium text-[#98A2B3] whitespace-nowrap"
              : "shrink-0 inline-flex items-center gap-1 rounded-[8px] border border-[#D5E2FF] bg-[#EFF4FF] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#175CD3] transition hover:bg-[#E0EBFF] whitespace-nowrap"
          }
        >
          ${copyDone ? html`<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>` : null}
          ${copyDone ? "Kopyalandı" : "Firmayı Kopyala"}
        </button>
      `
    },
    {
      id: "ogy-mt",
      number: "02",
      title: "OGY ve MT Ataması",
      desc: copyDone ? "Canlı operasyon sorumlularını ata." : "Bu adım için önce firmanın kopyalanması tamamlanmalı.",
      done: ogyMtDone,
      action: html`
        <button
          type="button"
          disabled=${!isImpEkibi || isStageCompleted || !copyDone || ogyMtDone}
          onClick=${(!copyDone || ogyMtDone) ? undefined : () => setIsOgyMtModalOpen(true)}
          className=${ogyMtDone
            ? "shrink-0 inline-flex cursor-default items-center gap-1.5 rounded-[8px] border border-[#ABEFC6] bg-[#ECFDF3] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#067647] whitespace-nowrap"
            : (!isImpEkibi || isStageCompleted || !copyDone)
              ? "shrink-0 inline-flex cursor-not-allowed items-center gap-1 rounded-[8px] border border-[#E4E7EC] bg-[#F2F4F7] px-3.5 py-1.5 text-[12.5px] font-medium text-[#98A2B3] whitespace-nowrap"
              : "shrink-0 inline-flex items-center gap-1 rounded-[8px] border border-[#D5E2FF] bg-[#EFF4FF] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#175CD3] transition hover:bg-[#E0EBFF] whitespace-nowrap"
          }
        >
          ${ogyMtDone ? html`<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>` : null}
          ${ogyMtDone ? "Atandı" : "Sorumluları Ata"}
        </button>
      `
    }
  ]

  return html`
    <section className="space-y-4">
      <div>
        <h2 className="text-[17px] font-semibold text-[#101828]">Canlıya Geçiş</h2>
        <p className="mt-0.5 text-[13px] text-[#667085]">
          Operasyon atamasını tamamlayın ve firma kopyalama/arşivleme için Dakika tarafına istek oluşturun.
        </p>
      </div>

      <div className="rounded-[16px] border border-[#D5E2FF] bg-white overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[#F2F4F7] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className=${classNames("h-2 w-2 shrink-0 rounded-full", statusMeta.dot)}></span>
            <span className="text-[13px] font-semibold text-[#344054]">Canlıya Geçiş</span>
          </div>
          <span className=${classNames("inline-flex h-[22px] items-center rounded-full border px-2.5 text-[11px] font-medium", statusMeta.badgeClass)}>
            ${statusMeta.label}
          </span>
        </div>

        <div className="divide-y divide-[#F2F4F7]">
          ${rows.map((row) => html`
            <div key=${row.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className=${classNames(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  row.done ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#F2F4F7] text-[#667085]"
                )}>
                  ${row.done ? checkIcon : row.number}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold text-[#101828]">${row.title}</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-[#667085]">${row.desc}</p>
                </div>
              </div>
              ${row.action}
            </div>
          `)}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#F2F4F7] px-5 py-3">
          ${isStageCompleted ? html`
            <span className="text-[12px] font-medium text-[#067647]">Stage tamamlandı. Bu alan artık yalnızca görüntülenebilir.</span>
          ` : html`
            <span className="text-[12px] text-[#667085]">${completedCount} / 2 adım tamamlandı</span>
          `}
          ${isImpEkibi && !isStageCompleted ? html`
            <button
              type="button"
              disabled=${!allDone}
              onClick=${allDone ? onCompleteStep : undefined}
              className=${allDone
                ? "shrink-0 inline-flex items-center gap-2 rounded-[9px] bg-[#067647] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#05603A]"
                : "shrink-0 inline-flex cursor-not-allowed items-center gap-2 rounded-[9px] bg-[#F2F4F7] px-4 py-2 text-[13px] font-semibold text-[#98A2B3]"
              }
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Stage Tamamla
            </button>
          ` : null}
        </div>
      </div>

      <${GoLiveOperationsModal}
        isOpen=${isOperationsModalOpen}
        onClose=${() => setIsOperationsModalOpen(false)}
        onComplete=${() => {
          setCopyDone(true)
          setIsOperationsModalOpen(false)
        }}
        companyName=${companyName}
      />

      <${GoLiveOgyMtModal}
        isOpen=${isOgyMtModalOpen}
        onClose=${() => setIsOgyMtModalOpen(false)}
        onComplete=${() => {
          setOgyMtDone(true)
          setIsOgyMtModalOpen(false)
        }}
      />
    </section>
  `
}

const GO_LIVE_COPY_TYPES = [
  { value: "enterprise", label: "Enterprise" },
  { value: "local", label: "Local" },
  { value: "saas", label: "SaaS" }
]

const GO_LIVE_GLOBAL_SUBTYPES = [
  { value: "active_payroll", label: "Active Payroll" },
  { value: "adp_celergo", label: "ADP Celergo" },
  { value: "adp_streamline", label: "ADP Streamline" },
  { value: "bipo", label: "BIPO" },
  { value: "cloudpay", label: "Cloudpay" },
  { value: "partnersiz", label: "Partnersiz" },
  { value: "payasia", label: "PayAsia" },
  { value: "sd_worx", label: "SD Worx" }
]

function getGoLiveCopyTypeLabel(value) {
  if (!value) return ""
  if (value.startsWith("global:")) {
    const match = GO_LIVE_GLOBAL_SUBTYPES.find((opt) => opt.value === value.slice("global:".length))
    return match ? `Global - ${match.label}` : "Global"
  }
  const match = GO_LIVE_COPY_TYPES.find((opt) => opt.value === value)
  return match ? match.label : ""
}

const GO_LIVE_COPY_MENU_WIDTH = 220
const GO_LIVE_COPY_SUBMENU_WIDTH = 200

function GoLiveCopyTypeSelect({ value, onChange }) {
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isGlobalOpen, setIsGlobalOpen] = useState(false)
  const [menuPos, setMenuPos] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setIsOpen(false)
    }
    function handleReposition() {
      setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("resize", handleReposition)
    window.addEventListener("scroll", handleReposition, true)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("resize", handleReposition)
      window.removeEventListener("scroll", handleReposition, true)
    }
  }, [isOpen])

  function openMenu() {
    const rect = buttonRef.current.getBoundingClientRect()
    const left = Math.min(Math.max(8, rect.right - GO_LIVE_COPY_MENU_WIDTH), window.innerWidth - GO_LIVE_COPY_MENU_WIDTH - 8)
    setMenuPos({ top: rect.bottom + 4, left })
    setIsGlobalOpen(false)
    setIsOpen(true)
  }

  function select(nextValue) {
    onChange(nextValue)
    setIsOpen(false)
    setIsGlobalOpen(false)
  }

  const label = getGoLiveCopyTypeLabel(value)
  const submenuOnLeft = menuPos ? menuPos.left - GO_LIVE_COPY_SUBMENU_WIDTH - 4 >= 8 : true
  const submenuLeft = menuPos
    ? submenuOnLeft
      ? menuPos.left - GO_LIVE_COPY_SUBMENU_WIDTH - 4
      : Math.min(menuPos.left + GO_LIVE_COPY_MENU_WIDTH + 4, window.innerWidth - GO_LIVE_COPY_SUBMENU_WIDTH - 8)
    : 0

  return html`
    <div className="relative" ref=${wrapRef}>
      <button
        ref=${buttonRef}
        type="button"
        onClick=${() => (isOpen ? setIsOpen(false) : openMenu())}
        className="flex h-9 w-[200px] items-center justify-between rounded-[8px] border border-[#D5DBE5] bg-white px-3 text-[12px] font-medium text-[#101828] outline-none transition focus:border-[#2F6FED]"
      >
        <span className=${classNames("truncate", !label && "text-[#98A2B3]")}>${label || "Seçiniz"}</span>
        <${ChevronDownIcon} />
      </button>
      ${isOpen && menuPos ? html`
        <div
          className="fixed z-[70] w-[220px] rounded-[12px] border border-[#E4E7EC] bg-white p-1.5 shadow-[0_14px_32px_rgba(16,24,40,0.14)]"
          style=${{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
        >
          <div
            className="relative"
            onMouseEnter=${() => setIsGlobalOpen(true)}
            onMouseLeave=${() => setIsGlobalOpen(false)}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F8FAFC]"
            >
              Global
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            ${isGlobalOpen ? html`
              <div
                className="fixed z-[70] w-[200px] rounded-[12px] border border-[#E4E7EC] bg-white p-1.5 shadow-[0_14px_32px_rgba(16,24,40,0.14)]"
                style=${{ top: `${menuPos.top}px`, left: `${submenuLeft}px` }}
              >
                ${GO_LIVE_GLOBAL_SUBTYPES.map((opt) => html`
                  <button
                    key=${opt.value}
                    type="button"
                    onClick=${() => select(`global:${opt.value}`)}
                    className="flex w-full items-center rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F8FAFC]"
                  >${opt.label}</button>
                `)}
              </div>
            ` : null}
          </div>
          ${GO_LIVE_COPY_TYPES.map((opt) => html`
            <button
              key=${opt.value}
              type="button"
              onClick=${() => select(opt.value)}
              className="flex w-full items-center rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F8FAFC]"
            >${opt.label}</button>
          `)}
        </div>
      ` : null}
    </div>
  `
}

function GoLiveSimpleSelect({ value, options, onChange, placeholder = "Seçiniz" }) {
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [menuPos, setMenuPos] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setIsOpen(false)
    }
    function handleReposition() {
      setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("resize", handleReposition)
    window.addEventListener("scroll", handleReposition, true)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("resize", handleReposition)
      window.removeEventListener("scroll", handleReposition, true)
    }
  }, [isOpen])

  function openMenu() {
    const rect = buttonRef.current.getBoundingClientRect()
    const left = Math.min(Math.max(8, rect.right - GO_LIVE_COPY_MENU_WIDTH), window.innerWidth - GO_LIVE_COPY_MENU_WIDTH - 8)
    setMenuPos({ top: rect.bottom + 4, left })
    setIsOpen(true)
  }

  function select(nextValue) {
    onChange(nextValue)
    setIsOpen(false)
  }

  const selected = options.find((opt) => opt.value === value)

  return html`
    <div className="relative" ref=${wrapRef}>
      <button
        ref=${buttonRef}
        type="button"
        onClick=${() => (isOpen ? setIsOpen(false) : openMenu())}
        className="flex h-9 w-[200px] items-center justify-between rounded-[8px] border border-[#D5DBE5] bg-white px-3 text-[12px] font-medium text-[#101828] outline-none transition focus:border-[#2F6FED]"
      >
        <span className=${classNames("truncate", !selected && "text-[#98A2B3]")}>${selected ? selected.label : placeholder}</span>
        <${ChevronDownIcon} />
      </button>
      ${isOpen && menuPos ? html`
        <div
          className="fixed z-[70] w-[220px] rounded-[12px] border border-[#E4E7EC] bg-white p-1.5 shadow-[0_14px_32px_rgba(16,24,40,0.14)]"
          style=${{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
        >
          ${options.map((opt) => html`
            <button
              key=${opt.value}
              type="button"
              onClick=${() => select(opt.value)}
              className=${classNames(
                "flex w-full items-center justify-between rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium transition hover:bg-[#F8FAFC]",
                opt.value === value ? "text-[#2F6FED]" : "text-[#344054]"
              )}
            >
              <span>${opt.label}</span>
              ${opt.value === value ? html`<svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M2 5.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>` : null}
            </button>
          `)}
        </div>
      ` : null}
    </div>
  `
}

const GO_LIVE_WEEKDAY_LABELS = ["P", "S", "Ç", "P", "C", "C", "P"]
const GO_LIVE_MONTH_LABELS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]

function buildGoLiveCalendarCells(year, month) {
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inMonth: false })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, inMonth: true })
  }
  let nextDay = 1
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, inMonth: false })
  }
  return cells
}

function GoLiveDateSelect({ value, onChange, placeholder = "Tarih seçin" }) {
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [menuPos, setMenuPos] = useState(null)
  const selectedDate = value ? new Date(value) : null
  const [viewDate, setViewDate] = useState(() => {
    const base = selectedDate || new Date()
    return { year: base.getFullYear(), month: base.getMonth() }
  })

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setIsOpen(false)
    }
    function handleReposition() {
      setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("resize", handleReposition)
    window.addEventListener("scroll", handleReposition, true)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("resize", handleReposition)
      window.removeEventListener("scroll", handleReposition, true)
    }
  }, [isOpen])

  function openMenu() {
    const rect = buttonRef.current.getBoundingClientRect()
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - 216 - 8)
    setMenuPos({ top: rect.bottom + 4, left })
    const base = selectedDate || new Date()
    setViewDate({ year: base.getFullYear(), month: base.getMonth() })
    setIsOpen(true)
  }

  function shiftMonth(delta) {
    setViewDate((current) => {
      let month = current.month + delta
      let year = current.year
      if (month < 0) { month = 11; year -= 1 }
      if (month > 11) { month = 0; year += 1 }
      return { year, month }
    })
  }

  function selectDay(day) {
    const iso = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    onChange(iso)
    setIsOpen(false)
  }

  function isSelected(cell) {
    if (!cell.inMonth || !selectedDate) return false
    return selectedDate.getFullYear() === viewDate.year && selectedDate.getMonth() === viewDate.month && selectedDate.getDate() === cell.day
  }

  function isToday(cell) {
    if (!cell.inMonth) return false
    const now = new Date()
    return now.getFullYear() === viewDate.year && now.getMonth() === viewDate.month && now.getDate() === cell.day
  }

  const displayLabel = selectedDate
    ? `${String(selectedDate.getDate()).padStart(2, "0")}.${String(selectedDate.getMonth() + 1).padStart(2, "0")}.${selectedDate.getFullYear()}`
    : placeholder
  const cells = buildGoLiveCalendarCells(viewDate.year, viewDate.month)

  return html`
    <div className="relative" ref=${wrapRef}>
      <button
        ref=${buttonRef}
        type="button"
        onClick=${() => (isOpen ? setIsOpen(false) : openMenu())}
        className="flex h-9 w-[200px] items-center justify-between rounded-[8px] border border-[#D5DBE5] bg-white px-3 text-[12px] font-medium text-[#101828] outline-none transition focus:border-[#2F6FED]"
      >
        <span className=${classNames("truncate", !selectedDate && "text-[#98A2B3]")}>${displayLabel}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#98A2B3]"><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg>
      </button>
      ${isOpen && menuPos ? html`
        <div
          className="fixed z-[70] w-[216px] rounded-[14px] border border-[#E4E7EC] bg-white p-2 shadow-[0_14px_32px_rgba(16,24,40,0.14)]"
          style=${{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
        >
          <div className="mb-1.5 flex items-center justify-between">
            <button
              type="button"
              onClick=${() => shiftMonth(-1)}
              className="flex h-5 w-5 items-center justify-center rounded-[6px] text-[#667085] transition hover:bg-[#F2F4F7]"
            >
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="text-[11px] font-semibold text-[#101828]">${GO_LIVE_MONTH_LABELS[viewDate.month]} ${viewDate.year}</span>
            <button
              type="button"
              onClick=${() => shiftMonth(1)}
              className="flex h-5 w-5 items-center justify-center rounded-[6px] text-[#667085] transition hover:bg-[#F2F4F7]"
            >
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-y-0.5 text-center">
            ${GO_LIVE_WEEKDAY_LABELS.map((label, i) => html`<span key=${i} className="text-[9px] font-semibold text-[#98A2B3]">${label}</span>`)}
            ${cells.map((cell, i) => html`
              <button
                key=${i}
                type="button"
                disabled=${!cell.inMonth}
                onClick=${() => cell.inMonth && selectDay(cell.day)}
                className=${classNames(
                  "mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[10.5px]",
                  !cell.inMonth
                    ? "cursor-default text-[#D0D5DD]"
                    : isSelected(cell)
                      ? "bg-[#2F6FED] font-semibold text-white"
                      : isToday(cell)
                        ? "border border-[#2F6FED] font-semibold text-[#2F6FED]"
                        : "text-[#344054] hover:bg-[#F2F4F7]"
                )}
              >${cell.day}</button>
            `)}
          </div>
        </div>
      ` : null}
    </div>
  `
}

const GO_LIVE_BORDRO_OPTIONS = [
  { value: "bordrolari_kopyala", label: "Bordroları Kopyala" },
  { value: "devreden_kumulatif", label: "Devreden ve Kümülatif Kopyala" },
  { value: "kopyalama", label: "Kopyalama" }
]

const GO_LIVE_PUANTAJ_OPTIONS = [
  { value: "kopyala", label: "Kopyala" },
  { value: "kopyalama", label: "Kopyalama" }
]

const GO_LIVE_ICRA_OPTIONS = [
  { value: "kopyalansin", label: "Kopyalansın" },
  { value: "kopyalama", label: "Kopyalama" }
]

function GoLiveConfirmModal({ isOpen, title, description, confirmLabel = "Evet, Onayla", onCancel, onConfirm }) {
  if (!isOpen) return null

  return html`
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,23,42,0.55)] px-4"
      onClick=${(event) => { event.stopPropagation(); onCancel() }}
    >
      <div
        className="w-full max-w-[380px] rounded-[18px] border border-[#E4E7EC] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
        onClick=${(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF4FF] text-[#2F6FED]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <p className="text-[15px] font-semibold text-[#101828]">${title}</p>
        <p className="mt-1.5 text-[13px] leading-5 text-[#667085]">${description}</p>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick=${onCancel}
            className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#D0D5DD] bg-white px-3.5 text-[12.5px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick=${onConfirm}
            className="inline-flex h-9 items-center justify-center rounded-[10px] bg-[#2F6FED] px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-[#2563CC]"
          >
            ${confirmLabel}
          </button>
        </div>
      </div>
    </div>
  `
}

function GoLiveOperationsModal({ isOpen, onClose, onComplete, companyName }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [copyType, setCopyType] = useState("")
  const [newName, setNewName] = useState(companyName || "")
  const [startDate, setStartDate] = useState("")
  const [bordroOption, setBordroOption] = useState("kopyalama")
  const [puantajOption, setPuantajOption] = useState("kopyalama")
  const [icraOption, setIcraOption] = useState("kopyalama")

  if (!isOpen) return null

  const fieldRows = [
    { label: "Kopyalanacak Kurum ID", control: html`
      <input
        value="482910576"
        disabled
        readOnly
        className="h-9 w-[200px] cursor-not-allowed rounded-[8px] border border-[#E4E7EC] bg-[#F9FAFB] px-3 text-[12px] font-medium text-[#667085] outline-none"
      />
    `},
    { label: "Başlangıç Tarihi", control: html`
      <${GoLiveDateSelect} value=${startDate} onChange=${setStartDate} />
    `},
    { label: "Yeni Adı", control: html`
      <input
        value=${newName}
        onInput=${(event) => setNewName(event.target.value)}
        placeholder="Örn. Şirket Adı_270226"
        className="h-9 w-[200px] rounded-[8px] border border-[#D5DBE5] bg-white px-3 text-[12px] font-medium text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#2F6FED]"
      />
    `},
    { label: "Kopyalama Tipi", control: html`
      <${GoLiveCopyTypeSelect} value=${copyType} onChange=${setCopyType} />
    `},
    { label: "Bordro Kopyalama", control: html`
      <${GoLiveSimpleSelect} value=${bordroOption} options=${GO_LIVE_BORDRO_OPTIONS} onChange=${setBordroOption} />
    `},
    { label: "Puantaj Kopyalama", control: html`
      <${GoLiveSimpleSelect} value=${puantajOption} options=${GO_LIVE_PUANTAJ_OPTIONS} onChange=${setPuantajOption} />
    `},
    { label: "İcra Kesintisi Kopyalama", control: html`
      <${GoLiveSimpleSelect} value=${icraOption} options=${GO_LIVE_ICRA_OPTIONS} onChange=${setIcraOption} />
    `}
  ]

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.42)] px-4 py-6 backdrop-blur-[2px] lg:pl-[220px]" onClick=${onClose}>
      <div
        className="w-full max-w-[520px] rounded-[22px] border border-[#D7E0EC] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        onClick=${(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F7] px-5 py-4">
          <div className="space-y-1">
            <p className="text-[18px] font-semibold text-[#101828]">Firmayı Canlıya Geçir</p>
            <p className="text-[12px] text-[#667085]">Hedef bölümü ve kopyalama ayarlarını belirleyin.</p>
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

        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-5 py-5">
          <div className="space-y-3.5 rounded-[14px] border border-[#E4E7EC] bg-[#F8F9FA] p-4">
            <div className="divide-y divide-[#E4E7EC]">
              ${fieldRows.map((row) => html`
                <div key=${row.label} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-[12px] font-medium text-[#344054]">${row.label}</span>
                  ${row.control}
                </div>
              `)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#EEF2F7] px-5 py-4">
          <button
            type="button"
            onClick=${onClose}
            className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#D0D5DD] bg-white px-4 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
          >
            Kapat
          </button>
          <button
            type="button"
            onClick=${() => setIsConfirmOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[12px] bg-[#067647] px-4 text-[13px] font-semibold text-white transition hover:bg-[#05603A]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Tamamla
          </button>
        </div>
      </div>

      <${GoLiveConfirmModal}
        isOpen=${isConfirmOpen}
        title="Firmayı kopyalamak istediğinize emin misiniz?"
        description="Bu işlem, girilen bilgilerle firmayı seçilen hedef bölüme kopyalayacak. Onayladıktan sonra bu adımı geri alamazsınız."
        confirmLabel="Evet, Kopyala"
        onCancel=${() => setIsConfirmOpen(false)}
        onConfirm=${() => {
          setIsConfirmOpen(false)
          onComplete()
        }}
      />
    </div>
  `
}

const GO_LIVE_OGY_MT_ROLES = [
  { value: "ogy", label: "OGY" },
  { value: "mt_full", label: "MT Full" },
  { value: "mt_sinirli", label: "MT Sınırlı" }
]

function GoLiveOgyMtModal({ isOpen, onClose, onComplete }) {
  const rowIdRef = useRef(1)
  const [rows, setRows] = useState(() => [{ id: 1, employeeId: "", role: "" }])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  if (!isOpen) return null

  function updateRow(id, patch) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function addRow() {
    rowIdRef.current += 1
    setRows((current) => [...current, { id: rowIdRef.current, employeeId: "", role: "" }])
  }

  function removeRow(id) {
    setRows((current) => current.filter((row) => row.id !== id))
  }

  const canComplete = rows.some((row) => row.employeeId.trim().length > 0 && !!row.role)

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.42)] px-4 py-6 backdrop-blur-[2px] lg:pl-[220px]" onClick=${onClose}>
      <div
        className="w-full max-w-[520px] rounded-[22px] border border-[#D7E0EC] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        onClick=${(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F7] px-5 py-4">
          <div className="space-y-1">
            <p className="text-[18px] font-semibold text-[#101828]">OGY ve MT Ataması</p>
            <p className="text-[12px] text-[#667085]">Canlı operasyon sorumlularını belirleyin.</p>
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

        <div className="space-y-3 px-5 py-5">
          <div className="grid grid-cols-[minmax(0,1fr)_200px_28px] gap-2">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#667085]">Çalışan ID</span>
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#667085]">Rol</span>
            <span></span>
          </div>

          <div className="max-h-[320px] space-y-2 overflow-y-auto pb-1">
            ${rows.map((row, index) => html`
              <div key=${row.id} className="grid grid-cols-[minmax(0,1fr)_200px_28px] items-center gap-2">
                <input
                  autoFocus=${index === 0}
                  value=${row.employeeId}
                  onInput=${(event) => updateRow(row.id, { employeeId: event.target.value })}
                  placeholder="Örn. 123456"
                  className="h-9 w-full rounded-[8px] border border-[#D5DBE5] bg-white px-3 text-[12px] font-medium text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#2F6FED]"
                />
                <${GoLiveSimpleSelect}
                  value=${row.role}
                  options=${GO_LIVE_OGY_MT_ROLES}
                  onChange=${(value) => updateRow(row.id, { role: value })}
                  placeholder="Rol seçin"
                />
                ${rows.length > 1 ? html`
                  <button
                    type="button"
                    onClick=${() => removeRow(row.id)}
                    aria-label="Satırı kaldır"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-[#98A2B3] transition hover:bg-[#F2F4F7] hover:text-[#667085]"
                  >
                    <${CloseIcon} />
                  </button>
                ` : html`<span></span>`}
              </div>
            `)}
          </div>

          <button
            type="button"
            onClick=${addRow}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2F6FED] transition hover:text-[#2563CC]"
          >
            <${PlusIcon} />Çalışan Ekle
          </button>

          <div className="flex items-center justify-end gap-3 border-t border-[#EEF2F7] pt-4">
            <button
              type="button"
              onClick=${onClose}
              className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#D0D5DD] bg-white px-4 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
            >
              Kapat
            </button>
            <button
              type="button"
              disabled=${!canComplete}
              onClick=${canComplete ? () => setIsConfirmOpen(true) : undefined}
              className=${canComplete
                ? "inline-flex h-10 items-center justify-center gap-1.5 rounded-[12px] bg-[#067647] px-4 text-[13px] font-semibold text-white transition hover:bg-[#05603A]"
                : "inline-flex h-10 cursor-not-allowed items-center justify-center gap-1.5 rounded-[12px] bg-[#F2F4F7] px-4 text-[13px] font-semibold text-[#98A2B3]"
              }
            >
              Tamamla
            </button>
          </div>
        </div>
      </div>

      <${GoLiveConfirmModal}
        isOpen=${isConfirmOpen}
        title="Sorumluları atamak istediğinize emin misiniz?"
        description="Girilen çalışan ID ve rol bilgileriyle canlı operasyon sorumluluğu atanacak. Onayladıktan sonra bu adımı geri alamazsınız."
        confirmLabel="Evet, Ata"
        onCancel=${() => setIsConfirmOpen(false)}
        onConfirm=${() => {
          setIsConfirmOpen(false)
          onComplete()
        }}
      />
    </div>
  `
}

function AddCustomDocumentModal({ isOpen, stepTitle, onClose, onSubmit }) {
  const rowIdRef = useRef(0)
  const [rows, setRows] = useState([])

  function createRow() {
    rowIdRef.current += 1
    return { id: rowIdRef.current, label: "", responseType: "file", file: null, description: "" }
  }

  useEffect(() => {
    if (isOpen) {
      rowIdRef.current = 0
      setRows([createRow()])
    }
  }, [isOpen])

  if (!isOpen) return null

  const canSubmit = rows.some((row) => row.label.trim().length > 0)

  function updateRow(id, patch) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function addRow() {
    setRows((current) => [...current, createRow()])
  }

  function removeRow(id) {
    setRows((current) => current.filter((row) => row.id !== id))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const entries = rows
      .map((row) => ({
        label: row.label.trim(),
        responseType: row.responseType,
        file: row.responseType === "file" ? row.file : null,
        description: row.description.trim()
      }))
      .filter((entry) => entry.label.length > 0)
    if (entries.length === 0) return
    onSubmit(entries)
  }

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.42)] px-4 py-6 backdrop-blur-[2px] lg:pl-[220px]" onClick=${onClose}>
      <div
        className="w-full max-w-[640px] rounded-[22px] border border-[#D7E0EC] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        onClick=${(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F7] px-5 py-4">
          <div className="space-y-1">
            <p className="text-[18px] font-semibold text-[#101828]">Alan Ekle</p>
            <p className="text-[12px] text-[#667085]">${stepTitle}</p>
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

        <form onSubmit=${handleSubmit} className="space-y-3 px-5 py-5">
          <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1 pb-1">
            ${rows.map((row, index) => html`
              <div key=${row.id} className="space-y-2.5 rounded-[14px] border border-[#E4E7EC] bg-[#F8F9FA] p-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <div className="grid grid-cols-[1fr_1fr_28px] items-start gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">Alan Adı</label>
                    <input
                      type="text"
                      name=${`custom-doc-label-${row.id}`}
                      autoComplete="off"
                      autoFocus=${index === 0}
                      value=${row.label}
                      onInput=${(event) => updateRow(row.id, { label: event.target.value })}
                      placeholder="Örnek: İşyeri Bilgi Formu"
                      className="h-9 w-full rounded-[10px] border border-[#D5DBE5] bg-white px-3 text-[13px] text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">Yanıt Türü</label>
                    <div className="grid h-9 grid-cols-2 rounded-[10px] border border-[#D5DBE5] bg-white p-1">
                      <button
                        type="button"
                        onClick=${() => updateRow(row.id, { responseType: "text", file: null })}
                        className=${classNames(
                          "rounded-[7px] text-[11.5px] font-semibold transition",
                          row.responseType === "text" ? "bg-[#EFF4FF] text-[#2F6FED] shadow-sm" : "text-[#667085] hover:bg-[#F9FAFB]"
                        )}
                      >Metin</button>
                      <button
                        type="button"
                        onClick=${() => updateRow(row.id, { responseType: "file" })}
                        className=${classNames(
                          "rounded-[7px] text-[11.5px] font-semibold transition",
                          row.responseType === "file" ? "bg-[#EFF4FF] text-[#2F6FED] shadow-sm" : "text-[#667085] hover:bg-[#F9FAFB]"
                        )}
                      >Dosya yükleme</button>
                    </div>
                  </div>

                  ${rows.length > 1 ? html`
                    <button
                      type="button"
                      onClick=${() => removeRow(row.id)}
                      aria-label="Satırı kaldır"
                      className="mt-[22px] flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-[#98A2B3] transition hover:bg-[#F2F4F7] hover:text-[#667085]"
                    >
                      <${CloseIcon} />
                    </button>
                  ` : html`<span></span>`}
                </div>

                ${row.responseType === "file" ? html`
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">Şablon Dosyası (opsiyonel)</label>
                    <div className="relative flex h-10 items-center gap-2 rounded-[10px] border border-dashed border-[#C9D2E3] bg-white px-3 transition hover:border-[#9CB6EE] hover:bg-[#F5F8FF]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#98A2B3]"><${UploadIcon} /></span>
                      <span className="min-w-0 flex-1 truncate text-[12px] text-[#344054]">${row.file ? row.file.name : "Şablon dosyası seçin"}</span>
                      ${row.file ? html`
                        <button type="button" onClick=${() => updateRow(row.id, { file: null })} aria-label="Dosyayı kaldır" className="relative z-20 shrink-0 text-[#98A2B3] transition hover:text-[#667085]"><${CloseIcon} /></button>
                      ` : html`<span className="text-[11px] font-medium text-[#2F6FED]">Gözat</span>`}
                      <input type="file" onChange=${(event) => updateRow(row.id, { file: event.target.files?.[0] || null })} className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
                    </div>
                  </div>
                ` : html`
                  <div className="flex items-center gap-2 rounded-[10px] border border-[#DCE8FF] bg-[#F5F8FF] px-3 py-2 text-[11.5px] text-[#475467]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2F6FED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                    Müşteri bu alana doğrudan metin yazarak yanıt verecek.
                  </div>
                `}

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    Açıklama (opsiyonel)
                  </label>
                  <textarea
                    rows="2"
                    value=${row.description}
                    onInput=${(event) => updateRow(row.id, { description: event.target.value })}
                    placeholder="Bu alanın ne için kullanıldığını kısaca açıklayın. Alan adının yanında ? simgesiyle gösterilir."
                    className="w-full resize-none rounded-[10px] border border-[#D5DBE5] bg-white px-3 py-2 text-[12.5px] leading-5 text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
                  />
                </div>
              </div>
            `)}
          </div>

          <button
            type="button"
            onClick=${addRow}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2F6FED] transition hover:text-[#2563CC]"
          >
            <${PlusIcon} />Başka alan ekle
          </button>

          <div className="flex items-center justify-end gap-3 border-t border-[#EEF2F7] pt-4">
            <button
              type="button"
              onClick=${onClose}
              className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#D0D5DD] bg-white px-4 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled=${!canSubmit}
              className=${classNames(
                "inline-flex h-10 items-center justify-center rounded-[12px] px-5 text-[13px] font-semibold text-white transition",
                canSubmit
                  ? "bg-[linear-gradient(135deg,#2F6FED_0%,#1747B8_100%)] shadow-[0_10px_20px_rgba(47,111,237,0.22)] hover:translate-y-[-1px] hover:shadow-[0_14px_24px_rgba(47,111,237,0.24)]"
                  : "cursor-not-allowed bg-[#B8CCFF]"
              )}
            >
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  `
}

function AddAuthorizedPersonModal({ isOpen, onClose, onSubmit }) {
  const rowIdRef = useRef(0)
  const [rows, setRows] = useState([])

  function createRow() {
    rowIdRef.current += 1
    return { id: rowIdRef.current, ad: "", soyad: "", tcNo: "" }
  }

  useEffect(() => {
    if (isOpen) {
      rowIdRef.current = 0
      setRows([createRow()])
    }
  }, [isOpen])

  if (!isOpen) return null

  const validRows = rows.filter((row) => row.ad.trim() && row.soyad.trim() && row.tcNo.trim())
  const canSubmit = validRows.length > 0

  function updateRow(id, patch) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function addRow() {
    setRows((current) => [...current, createRow()])
  }

  function removeRow(id) {
    setRows((current) => current.filter((row) => row.id !== id))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(validRows.map((row) => ({
      ad: row.ad.trim(),
      soyad: row.soyad.trim(),
      tcNo: row.tcNo.trim()
    })))
  }

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.42)] px-4 py-6 backdrop-blur-[2px] lg:pl-[220px]" onClick=${onClose}>
      <div
        className="w-full max-w-[640px] rounded-[22px] border border-[#D7E0EC] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        onClick=${(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F7] px-5 py-4">
          <div className="space-y-1">
            <p className="text-[18px] font-semibold text-[#101828]">Kişi Ekle</p>
            <p className="text-[12px] text-[#667085]">Yetkilendirme Bilgisi</p>
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

        <form onSubmit=${handleSubmit} className="space-y-3 px-5 py-5">
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1 pb-1">
            ${rows.map((row, index) => html`
              <div key=${row.id} className="rounded-[14px] border border-[#E4E7EC] bg-[#F8F9FA] p-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_150px_28px] sm:items-start">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">Ad</label>
                    <input
                      type="text"
                      autoComplete="off"
                      autoFocus=${index === 0}
                      value=${row.ad}
                      onInput=${(event) => updateRow(row.id, { ad: event.target.value })}
                      placeholder="Ad"
                      className="h-9 w-full rounded-[10px] border border-[#D5DBE5] bg-white px-3 text-[13px] text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">Soyad</label>
                    <input
                      type="text"
                      autoComplete="off"
                      value=${row.soyad}
                      onInput=${(event) => updateRow(row.id, { soyad: event.target.value })}
                      placeholder="Soyad"
                      className="h-9 w-full rounded-[10px] border border-[#D5DBE5] bg-white px-3 text-[13px] text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">T.C. No</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="11"
                      value=${row.tcNo}
                      onInput=${(event) => {
                        const value = event.target.value.replace(/\D/g, "").slice(0, 11)
                        updateRow(row.id, { tcNo: value })
                      }}
                      placeholder="T.C. No"
                      className="h-9 w-full rounded-[10px] border border-[#D5DBE5] bg-white px-3 text-[13px] text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
                    />
                  </div>

                  ${rows.length > 1 ? html`
                    <button
                      type="button"
                      onClick=${() => removeRow(row.id)}
                      aria-label="Satırı kaldır"
                      className="mt-[22px] flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-[#98A2B3] transition hover:bg-[#F2F4F7] hover:text-[#667085]"
                    >
                      <${CloseIcon} />
                    </button>
                  ` : html`<span></span>`}
                </div>
              </div>
            `)}
          </div>

          <button
            type="button"
            onClick=${addRow}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2F6FED] transition hover:text-[#2563CC]"
          >
            <${PlusIcon} />Başka kişi ekle
          </button>

          <div className="flex items-center justify-end gap-3 border-t border-[#EEF2F7] pt-4">
            <button
              type="button"
              onClick=${onClose}
              className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#D0D5DD] bg-white px-4 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled=${!canSubmit}
              className=${classNames(
                "inline-flex h-10 items-center justify-center rounded-[12px] px-5 text-[13px] font-semibold text-white transition",
                canSubmit
                  ? "bg-[linear-gradient(135deg,#2F6FED_0%,#1747B8_100%)] shadow-[0_10px_20px_rgba(47,111,237,0.22)] hover:translate-y-[-1px] hover:shadow-[0_14px_24px_rgba(47,111,237,0.24)]"
                  : "cursor-not-allowed bg-[#B8CCFF]"
              )}
            >
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  `
}

function UploadIcon() {
  return html`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`
}

// Microsoft Teams / Graph API entegrasyonu
const MSAL_CONFIG = {
  clientId: "90b9772f-a476-4773-a1be-42afc674b7cc",
  tenantId: "ffe13356-3fee-48e2-b5b2-efcac45dc3e0",
}

let _msalInstance = null
function getMsalInstance() {
  if (!_msalInstance && window.msal) {
    _msalInstance = new window.msal.PublicClientApplication({
      auth: {
        clientId: MSAL_CONFIG.clientId,
        authority: `https://login.microsoftonline.com/${MSAL_CONFIG.tenantId}`,
        redirectUri: window.location.origin + window.location.pathname,
      },
      cache: { cacheLocation: "sessionStorage" }
    })
  }
  return _msalInstance
}

async function getTeamsToken() {
  const msalInstance = getMsalInstance()
  if (!msalInstance) throw new Error("MSAL yüklenemedi")
  const scopes = ["Calendars.ReadWrite"]
  const accounts = msalInstance.getAllAccounts()
  if (accounts.length > 0) {
    try {
      const result = await msalInstance.acquireTokenSilent({ scopes, account: accounts[0] })
      return result.accessToken
    } catch(e) {}
  }
  const result = await msalInstance.loginPopup({ scopes, prompt: "consent" })
  return result.accessToken
}

async function createTeamsMeeting({ title, date, time, duration }) {
  const token = await getTeamsToken()
  const startDt = new Date(`${date}T${time}:00`)
  const endDt = new Date(startDt.getTime() + parseInt(duration) * 60000)
  const toIso = d => d.toISOString().replace(/\.\d{3}Z$/, "")
  const body = {
    subject: title,
    start: { dateTime: toIso(startDt), timeZone: "Europe/Istanbul" },
    end: { dateTime: toIso(endDt), timeZone: "Europe/Istanbul" },
    isOnlineMeeting: true,
    onlineMeetingProvider: "teamsForBusiness"
  }
  const res = await fetch("https://graph.microsoft.com/v1.0/me/events", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error("Toplantı oluşturulamadı: " + res.status)
  return await res.json()
}

function TeamsIcon() {
  return html`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="1" width="5" height="5" rx="2.5" fill="#5059C9"/>
    <circle cx="3" cy="3.5" r="2" fill="#7B83EB"/>
    <rect x="1" y="6" width="7" height="6" rx="1.5" fill="#7B83EB"/>
    <rect x="6" y="6" width="6" height="5" rx="1.5" fill="#5059C9"/>
  </svg>`
}

function RejectComposerModal({ rejectComposer, onRejectReasonChange, onRejectExampleFilesChange, onCancelReject, onConfirmReject }) {
  const isOpen = Boolean(rejectComposer?.docId)
  const rejectDraft = rejectComposer?.reason || ""
  const attachedFiles = rejectComposer?.exampleFiles || []
  const textareaRef = useRef(null)
  const bulletPrefix = "• "

  if (!isOpen) return null

  const handleAttach = (e) => {
    const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size, url: URL.createObjectURL(f) }))
    onRejectExampleFilesChange([...attachedFiles, ...newFiles])
    e.target.value = ""
  }

  const removeAttached = (idx) => onRejectExampleFilesChange(attachedFiles.filter((_, i) => i !== idx))

  const updateEditorValue = (value, selectionStart, selectionEnd = selectionStart) => {
    onRejectReasonChange(value)
    requestAnimationFrame(() => {
      const element = textareaRef.current
      if (!element) return
      element.focus()
      element.setSelectionRange(selectionStart, selectionEnd)
    })
  }

  const applyEditorTransform = (transform) => {
    const element = textareaRef.current
    const start = element?.selectionStart ?? rejectDraft.length
    const end = element?.selectionEnd ?? rejectDraft.length
    const nextState = transform(rejectDraft, start, end)
    updateEditorValue(nextState.value, nextState.selectionStart, nextState.selectionEnd)
  }

  const handleBoldFormat = () => {
    applyEditorTransform((value, start, end) => {
      if (start !== end) {
        const selectedText = value.slice(start, end)
        const wrapped = `**${selectedText}**`
        return {
          value: value.slice(0, start) + wrapped + value.slice(end),
          selectionStart: start + 2,
          selectionEnd: start + 2 + selectedText.length
        }
      }

      return {
        value: value.slice(0, start) + "****" + value.slice(end),
        selectionStart: start + 2,
        selectionEnd: start + 2
      }
    })
  }

  const handleBulletFormat = () => {
    applyEditorTransform((value, start, end) => {
      const blockStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1
      const lineBreakIndex = value.indexOf("\n", end)
      const blockEnd = lineBreakIndex === -1 ? value.length : lineBreakIndex
      const selectedBlock = value.slice(blockStart, blockEnd)
      const nextLines = (selectedBlock.length > 0 ? selectedBlock.split("\n") : [""]).map((line) => {
        if (!line.trim()) return bulletPrefix
        return /^[•\-*]\s/.test(line.trimStart()) ? line : `${bulletPrefix}${line}`
      })
      const nextBlock = nextLines.join("\n")

      return {
        value: value.slice(0, blockStart) + nextBlock + value.slice(blockEnd),
        selectionStart: blockStart,
        selectionEnd: blockStart + nextBlock.length
      }
    })
  }

  const handleEditorKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
      e.preventDefault()
      handleBoldFormat()
      return
    }

    if (e.key === "Enter" && !e.shiftKey) {
      const element = textareaRef.current
      const start = element?.selectionStart ?? 0
      const end = element?.selectionEnd ?? start
      const lineStart = rejectDraft.lastIndexOf("\n", Math.max(0, start - 1)) + 1
      const rawLineEnd = rejectDraft.indexOf("\n", start)
      const lineEnd = rawLineEnd === -1 ? rejectDraft.length : rawLineEnd
      const currentLine = rejectDraft.slice(lineStart, lineEnd)
      const bulletMatch = currentLine.match(/^([•\-*])\s?(.*)$/)

      if (bulletMatch) {
        e.preventDefault()
        const marker = `${bulletMatch[1]} `
        const content = bulletMatch[2] || ""

        if (!content.trim()) {
          updateEditorValue(
            rejectDraft.slice(0, lineStart) + rejectDraft.slice(lineEnd),
            lineStart,
            lineStart
          )
          return
        }

        updateEditorValue(
          rejectDraft.slice(0, start) + `\n${marker}` + rejectDraft.slice(end),
          start + marker.length + 1,
          start + marker.length + 1
        )
      }
    }
  }

  return html`
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.42)] px-4 backdrop-blur-[2px] lg:pl-[220px]"
      onClick=${(e) => { if (e.target === e.currentTarget) onCancelReject() }}
    >
      <div className="w-full max-w-[520px] rounded-[14px] border border-[#E4E7EC] bg-white shadow-xl" onClick=${(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-[#F2F4F7] px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[14px] font-semibold text-[#101828]">${rejectComposer.docLabel} için revizyon notu</p>
          </div>
          <button
            type="button"
            onClick=${onCancelReject}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-[#98A2B3] transition hover:bg-[#F2F4F7] hover:text-[#344054]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="overflow-hidden rounded-[12px] border border-[#D0D5DD] bg-white transition focus-within:border-[#2F6FED] focus-within:shadow-[0_0_0_3px_rgba(47,111,237,0.1)]">
            <div className="flex items-center gap-1 border-b border-[#F2F4F7] px-3 py-2">
              <button
                type="button"
                onClick=${handleBoldFormat}
                className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-[8px] border border-transparent px-2 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
                title="Kalın yaz"
              >
                B
              </button>
              <button
                type="button"
                onClick=${handleBulletFormat}
                className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-[8px] border border-transparent px-2 text-[#344054] transition hover:bg-[#F9FAFB]"
                title="Madde işareti ekle"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="3" cy="4" r="1" fill="currentColor"></circle>
                  <circle cx="3" cy="10" r="1" fill="currentColor"></circle>
                  <path d="M6 4h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"></path>
                  <path d="M6 10h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"></path>
                </svg>
              </button>
              <span className="ml-auto text-[10.5px] text-[#98A2B3]">Kalın yazı ve madde işareti kullanabilirsiniz</span>
            </div>

            <textarea
              ref=${textareaRef}
              rows="6"
              value=${rejectDraft}
              onInput=${(e) => onRejectReasonChange(e.target.value)}
              onKeyDown=${handleEditorKeyDown}
              placeholder="Revizyon notunu buraya yazın. Metni seçip kalın yapabilir veya madde işaretli liste oluşturabilirsiniz…"
              className="min-h-[150px] w-full resize-none bg-white px-4 py-3 text-[13px] leading-[1.65] text-[#101828] outline-none placeholder:text-[#98A2B3]"
            ></textarea>
          </div>

          ${attachedFiles.length > 0 ? html`
            <div className="mt-3 flex flex-col gap-1.5">
              ${attachedFiles.map((f, i) => html`
                <div key=${i} className="flex items-center justify-between gap-2 rounded-[8px] border border-[#E4E7EC] bg-[#F9FAFB] px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8 1H3a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V5L8 1z" stroke="#667085" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 1v4h4" stroke="#667085" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="truncate text-[12px] text-[#344054]">${f.name}</span>
                  </div>
                  <button type="button" onClick=${() => removeAttached(i)} className="shrink-0 text-[#98A2B3] transition hover:text-[#D92D20]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              `)}
            </div>
          ` : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[#F2F4F7] px-5 py-3">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#E4E7EC] bg-white px-3 py-2 text-[12px] font-medium text-[#344054] transition hover:bg-[#F9FAFB]">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v8M7 1.5L4 4.5M7 1.5l3 3M1.5 10.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Örnek dosya ekle
            <input type="file" multiple onChange=${handleAttach} className="hidden" />
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick=${onCancelReject}
              className="inline-flex items-center gap-1 rounded-[8px] border border-[#E4E7EC] bg-white px-4 py-2 text-[13px] font-medium text-[#344054] transition hover:bg-[#F9FAFB]"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick=${onConfirmReject}
              disabled=${!rejectDraft.trim()}
              className=${classNames(
                "inline-flex items-center gap-1.5 rounded-[8px] px-4 py-2 text-[13px] font-semibold transition",
                rejectDraft.trim()
                  ? "bg-[#D92D20] text-white hover:bg-[#B42318]"
                  : "cursor-not-allowed bg-[#F2F4F7] text-[#98A2B3]"
              )}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Reddet
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}

function MeetingModal({ isOpen, onClose, onConfirm, assignee, companyName, companyUsers }) {
  const [title, setTitle] = useState("Implementasyon Toplantısı")
  const [date, setDate] = useState("2026-06-16")
  const [time, setTime] = useState("10:00")
  const [duration, setDuration] = useState("30")

  if (!isOpen) return null

  function handleConfirm() {
    const startMins = parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1])
    const endMins = startMins + parseInt(duration)
    const endH = String(Math.floor(endMins / 60) % 24).padStart(2, "0")
    const endM = String(endMins % 60).padStart(2, "0")

    // Outlook'un beklediği ISO format: 2026-06-16T10:00:00
    const startDt = `${date}T${time}:00`
    const endDt = `${date}T${endH}:${endM}:00`

    // Katılımcı e-postaları: şirketteki kullanıcılar + assignee
    const emails = (companyUsers || []).map(u => u.email).filter(Boolean)

    const outlookUrl = `https://outlook.office.com/calendar/action/compose?` +
      `subject=${encodeURIComponent(title)}` +
      `&startdt=${encodeURIComponent(startDt)}` +
      `&enddt=${encodeURIComponent(endDt)}` +
      `&to=${encodeURIComponent(emails.join(";"))}` +
      `&body=${encodeURIComponent("Merhaba,\n\nImplementasyon sürecimiz kapsamında aşağıdaki toplantıya davet edildiniz.\n\nSDP Implementasyon Portalı üzerinden sürecin takibini yapabilirsiniz.")}` +
      `&online=1`

    window.open(outlookUrl, "_blank")

    const now = new Date()
    const months = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"]
    const timeLabel = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`
    onConfirm({ title, date, time, duration, joinUrl: outlookUrl, timeLabel })
    onClose()
  }

  const inputClass = "w-full rounded-[8px] border border-[#E4E7EC] bg-[#FCFCFD] px-3 py-2 text-[13px] text-[#101828] outline-none focus:border-[#2F6FED] focus:shadow-[0_0_0_3px_rgba(47,111,237,0.08)] transition-all"
  const labelClass = "block text-[11.5px] font-medium text-[#344054] mb-1"

  return html`
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style=${{background:"rgba(16,24,40,0.35)"}}
      onClick=${(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-[400px] rounded-[16px] bg-white shadow-[0_8px_32px_rgba(16,24,40,0.18)] overflow-hidden">
        <!-- Modal header -->
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F2F4F7]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#EEF0FC]">
              <${TeamsIcon} />
            </div>
            <span className="text-[14px] font-semibold text-[#101828]">Teams Toplantısı Planla</span>
          </div>
          <button type="button" onClick=${onClose} className="flex h-6 w-6 items-center justify-center rounded-full text-[#98A2B3] hover:bg-[#F2F4F7] transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <!-- Form -->
        <div className="px-5 py-4 space-y-3.5">
          <div>
            <label className=${labelClass}>Toplantı Başlığı</label>
            <input
              type="text"
              value=${title}
              onInput=${e => setTitle(e.target.value)}
              className=${inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className=${labelClass}>Tarih</label>
              <input
                type="date"
                value=${date}
                onInput=${e => setDate(e.target.value)}
                className=${inputClass}
              />
            </div>
            <div>
              <label className=${labelClass}>Saat</label>
              <input
                type="time"
                value=${time}
                onInput=${e => setTime(e.target.value)}
                className=${inputClass}
              />
            </div>
          </div>

          <div>
            <label className=${labelClass}>Süre</label>
            <select
              value=${duration}
              onChange=${e => setDuration(e.target.value)}
              className=${inputClass}
            >
              <option value="15">15 dakika</option>
              <option value="30">30 dakika</option>
              <option value="45">45 dakika</option>
              <option value="60">1 saat</option>
              <option value="90">1.5 saat</option>
            </select>
          </div>

          <!-- Katılımcılar -->
          <div>
            <label className=${labelClass}>Katılımcılar</label>
            <div className="rounded-[8px] border border-[#E4E7EC] bg-[#F9FAFB] px-3 py-2 space-y-1">
              ${(companyUsers || []).length === 0
                ? html`<span className="text-[12px] text-[#98A2B3]">Kullanıcı bulunamadı</span>`
                : (companyUsers || []).map(u => html`
                  <div key=${u.id} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F4F3FF] text-[8px] font-bold text-[#5925DC]">
                      ${(u.firstName?.[0] || "") + (u.lastName?.[0] || "")}
                    </span>
                    <span className="text-[12px] text-[#344054] font-medium">${u.firstName} ${u.lastName}</span>
                    <span className="text-[11px] text-[#98A2B3]">${u.email}</span>
                  </div>
                `)
              }
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div className="px-5 py-4 border-t border-[#F2F4F7] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick=${onClose}
            className="rounded-[8px] border border-[#E4E7EC] bg-white px-4 py-2 text-[13px] font-medium text-[#344054] hover:bg-[#F9FAFB] transition-colors"
          >İptal</button>
          <button
            type="button"
            onClick=${handleConfirm}
            className="flex items-center gap-2 rounded-[8px] bg-[#5059C9] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#3D44A8] transition-colors"
          >
            <${TeamsIcon} />
            Outlook'ta Aç
          </button>
        </div>
      </div>
    </div>
  `
}

function ImplementationMessageFeed({ messages, draft, onDraftChange, onSend, onMeetingCreated, companyName, assignee, companyUsers, userRole, steps, stepUploads, activeStepId, onStepChange }) {
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [showFileHistory, setShowFileHistory] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState([])
  const attachFileInputRef = useRef(null)
  const threadBodyRef = useRef(null)

  const assigneeInitials = assignee
    ? assignee.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "IE"

  const isViewer   = userRole === "viewer"
  const isImpEkibi = userRole === "imp_ekibi" || !userRole
  const currentAvatar = isImpEkibi ? assigneeInitials : userRole === "editor" ? "DZ" : "GR"
  const currentAvatarColor = isImpEkibi ? "bg-[#EFF4FF] text-[#2F6FED]" : userRole === "editor" ? "bg-[#F4F3FF] text-[#5925DC]" : "bg-[#F0FDF4] text-[#16A34A]"

  function formatMeetingDate(dateStr, timeStr) {
    const months = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"]
    const days = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"]
    const d = new Date(dateStr + "T" + timeStr)
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${timeStr}`
  }

  function handleMeetingConfirm({ title, date, time, duration, joinUrl, timeLabel }) {
    const meetingUrl = joinUrl || ""
    const endMinutes = parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]) + parseInt(duration)
    const endH = String(Math.floor(endMinutes / 60) % 24).padStart(2, "0")
    const endM = String(endMinutes % 60).padStart(2, "0")

    const meetingMsg = {
      id: `meeting-${Date.now()}`,
      type: "meeting",
      stepId: activeStepId,
      author: assignee || "Implementasyon Ekibi",
      avatar: assigneeInitials,
      time: timeLabel,
      meeting: {
        title,
        date: formatMeetingDate(date, time),
        endTime: endH + ":" + endM,
        duration,
        url: meetingUrl,
        joinCode
      }
    }
    onMeetingCreated && onMeetingCreated(meetingMsg)
  }

  function groupMessagesByDate(msgs) {
    const groups = []
    let currentDate = null
    let currentGroup = null
    msgs.forEach((msg) => {
      const dateLabel = msg.time ? msg.time.split(",")[0].trim() : "Bugün"
      if (dateLabel !== currentDate) {
        currentDate = dateLabel
        currentGroup = { date: dateLabel, items: [] }
        groups.push(currentGroup)
      }
      currentGroup.items.push(msg)
    })
    return groups
  }

  function getMessageStepId(message) {
    if (message?.stepId) return message.stepId
    if (message?.stepIntroId) return message.stepIntroId
    if (message?.relatedDocument?.stepId) return message.relatedDocument.stepId
    if (message?.isWelcome) return "system-setup"
    return null
  }

  const scopedMessages = messages.filter((message) => {
    const messageStepId = getMessageStepId(message)
    if (!messageStepId) return activeStepId === "system-setup"
    return messageStepId === activeStepId
  })
  const chatMessages = scopedMessages.filter(m => m.type !== "system")
  const systemMessages = scopedMessages.filter(m => m.type === "system")
  const groups = groupMessagesByDate(chatMessages)
  const activeStepStatus = activeStepId && stepUploads && stepUploads[activeStepId]
    ? stepUploads[activeStepId].status
    : "waiting"
  const isStageReadOnly = activeStepStatus === "completed" || activeStepStatus === "approved"

  useEffect(() => {
    const threadBody = threadBodyRef.current
    if (!threadBody) return
    requestAnimationFrame(() => {
      threadBody.scrollTop = threadBody.scrollHeight
    })
  }, [activeStepId, scopedMessages.length])

  const composeArea = isViewer
    ? html`<div className="flex items-center justify-center gap-2 py-1">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="5" width="11" height="7" rx="1.5" stroke="#98A2B3" strokeWidth="1.2"/><path d="M4 5V3.5a2.5 2.5 0 015 0V5" stroke="#98A2B3" strokeWidth="1.2" strokeLinecap="round"/></svg>
        <span className="text-[12px] text-[#98A2B3]">Görüntüleyici modunda mesaj gönderilemez</span>
      </div>`
    : isStageReadOnly
    ? html`<div className="flex items-center justify-center gap-2 py-1">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="5" width="11" height="7" rx="1.5" stroke="#98A2B3" strokeWidth="1.2"/><path d="M4 5V3.5a2.5 2.5 0 015 0V5" stroke="#98A2B3" strokeWidth="1.2" strokeLinecap="round"/></svg>
        <span className="text-[12px] text-[#98A2B3]">Bu stage tamamlandı. Mesajlar yalnızca görüntülenebilir.</span>
      </div>`
    : html`<div>
        ${pendingAttachments.length > 0 ? html`
          <div className="mb-2 pl-[38px] flex flex-wrap gap-1.5">
            ${pendingAttachments.map((att, i) => html`
              <div key=${i} className="inline-flex items-center gap-1.5 rounded-[7px] border border-[#D0D5DD] bg-[#F9FAFB] px-2 py-1">
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M8 1H3a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L8 1z" stroke="#667085" strokeWidth="1.3"/><path d="M8 1v5h4" stroke="#667085" strokeWidth="1.3" strokeLinecap="round"/></svg>
                <span className="text-[11px] text-[#344054] truncate max-w-[120px]">${att.name}</span>
                <button type="button" onClick=${() => setPendingAttachments(prev => prev.filter((_, j) => j !== i))} className="text-[#98A2B3] hover:text-[#667085]">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
            `)}
          </div>
        ` : null}
        <div className="flex gap-2.5 items-center">
          <span className=${classNames("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", currentAvatarColor)}>${currentAvatar}</span>
          <div className="flex-1 flex items-start gap-2 rounded-[10px] border border-[#E4E7EC] bg-[#FCFCFD] px-3 py-2 focus-within:border-[#2F6FED] focus-within:shadow-[0_0_0_3px_rgba(47,111,237,0.08)] transition-all">
            <textarea
              rows="1"
              value=${draft}
              onInput=${(e) => { onDraftChange(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight, 90)+"px" }}
              onKeyDown=${(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(pendingAttachments); setPendingAttachments([]) } }}
              placeholder="Mesaj yazin..."
              style=${{resize:"none",overflow:"hidden",minHeight:"22px",maxHeight:"90px",lineHeight:"1.6"}}
              className="flex-1 bg-transparent text-[13px] text-[#101828] placeholder-[#98A2B3] outline-none"
            ></textarea>
            <div className="relative shrink-0">
              <button type="button" className="flex h-7 w-7 items-center justify-center rounded-[7px] text-[#98A2B3] hover:text-[#667085] hover:bg-[#F2F4F7] transition cursor-pointer">
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M17.5 11.667v3.333A2.5 2.5 0 0115 17.5H5a2.5 2.5 0 01-2.5-2.5v-3.333M10 2.5v10M6.667 5.833L10 2.5l3.333 3.333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <input
                ref=${attachFileInputRef}
                type="file"
                multiple
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                onChange=${(e) => {
                  const files = Array.from(e.target.files || [])
                  if (files.length) setPendingAttachments(prev => [...prev, ...files.map(f => ({ name: f.name, url: "#", size: f.size }))])
                  e.target.value = ""
                }}
              />
            </div>
            <button
              type="button"
              onClick=${() => { onSend(pendingAttachments); setPendingAttachments([]) }}
              disabled=${!draft.trim() && pendingAttachments.length === 0}
              className=${classNames(
                "shrink-0 flex h-7 w-7 items-center justify-center rounded-[7px] transition",
                (draft.trim() || pendingAttachments.length > 0) ? "bg-[#2F6FED] text-white hover:bg-[#2563CC]" : "bg-[#F2F4F7] text-[#C8CEDE] cursor-not-allowed"
              )}
            ><${SendIcon} /></button>
          </div>
        </div>
        <div className="mt-2 pl-[38px]">
          <p className="text-[11px] text-[#C8CEDE]">Enter ile gonderin · Shift+Enter ile alt satir</p>
        </div>
      </div>`

  return html`
    <section id="impl-message-feed" className="overflow-hidden rounded-[20px] border border-[#E4E7EC] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06),0_4px_16px_rgba(16,24,40,0.04)] flex" style=${{height:"620px"}}>

      <!-- Sol: Adımlar sidebar -->
      ${steps && steps.length > 0 ? html`
        <div className="w-[210px] shrink-0 border-r border-[#F2F4F7] flex flex-col">
          <!-- Firma adı -->
          <div className="border-b border-[#F2F4F7] px-4 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#98A2B3]">Firma</p>
            <p className="mt-0.5 text-[13px] font-semibold text-[#101828] leading-snug">${companyName || "—"}</p>
          </div>
          <!-- Adımlar -->
          <div className="flex-1 overflow-y-auto py-1.5">
            ${steps.filter((step) => step.status !== "disabled").map((step, idx, visibleSteps) => {
              const status = stepUploads && stepUploads[step.id] ? stepUploads[step.id].status : "waiting"
              const isCompleted = status === "completed" || status === "approved"
              const isDocsApproved = status === "docs_approved"
              const isPending  = status === "pending_approval"
              const isUploaded = status === "uploaded"
              const isActive   = step.id === activeStepId
              const prevStep   = visibleSteps[idx - 1]
              const isUnlocked = idx === 0 || (stepUploads && ["completed", "approved"].includes(stepUploads[prevStep?.id]?.status))
              const isLocked   = !isUnlocked
              return html`
                <button
                  key=${step.id}
                  type="button"
                  disabled=${isLocked}
                  onClick=${() => !isLocked && onStepChange && onStepChange(step.id)}
                  className=${classNames(
                    "w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors",
                    isActive  ? "bg-[#F5F8FF]" : "",
                    isLocked  ? "cursor-not-allowed opacity-35" : "hover:bg-[#F9FAFB] cursor-pointer"
                  )}
                >
                  <span className=${classNames(
                    "mt-0.5 shrink-0 flex h-[18px] w-[18px] items-center justify-center rounded-full",
                    isCompleted ? "bg-[#ECFDF3] text-[#12B76A]" :
                    isDocsApproved ? "bg-[#F8FCF9] text-[#2D6A4F] ring-1 ring-[#D4E8DC]" :
                    isPending  ? "bg-[#FFFAEB] text-[#B54708]" :
                    isUploaded ? "bg-[#EFF4FF] text-[#2F6FED]" :
                    isActive   ? "bg-[#2F6FED] text-white" :
                                 "bg-[#F2F4F7] text-[#98A2B3]"
                  )}>
                    ${isCompleted
                      ? html`<svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2L7.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>`
                      : isLocked
                      ? html`<svg width="7" height="9" viewBox="0 0 7 9" fill="none"><rect x="0.5" y="3.5" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M2 3.5V2.5a1.5 1.5 0 013 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>`
                      : html`<span style=${{fontSize:"8px",fontWeight:700}}>${step.number}</span>`
                    }
                  </span>
                  <span className="min-w-0">
                    <span className=${classNames(
                      "block text-[11.5px] font-medium leading-tight",
                      isActive    ? "text-[#2F6FED]" :
                      isCompleted ? "text-[#12B76A]" :
                      isDocsApproved ? "text-[#2D6A4F]" :
                      isLocked    ? "text-[#98A2B3]" : "text-[#344054]"
                    )}>${step.title}</span>
                    <span className=${classNames(
                      "block text-[10px] mt-0.5",
                      isCompleted ? "text-[#12B76A]" :
                      isDocsApproved ? "text-[#2D6A4F]" :
                      isPending  ? "text-[#B54708]" :
                      isActive   ? "text-[#667085]" : "text-[#C8CEDE]"
                    )}>
                      ${isCompleted ? "Tamamlandı" : isDocsApproved ? "Onaylandı" : isPending ? "Onayda Bekliyor" : isUploaded ? "Yanıt Hazır" : isActive ? "Devam Ediyor" : "Bekliyor"}
                    </span>
                  </span>
                </button>
              `
            })}
          </div>
          <!-- Katılımcılar -->
          <div className="border-t border-[#F2F4F7] px-3.5 py-3 flex items-center gap-2">
            <div className="flex -space-x-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EFF4FF] text-[8px] font-bold text-[#2F6FED] ring-1 ring-white">${assigneeInitials}</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F4F3FF] text-[8px] font-bold text-[#5925DC] ring-1 ring-white">SN</span>
            </div>
            <span className="text-[10px] text-[#98A2B3]">2 katilimci</span>
          </div>
        </div>
      ` : null}

      <!-- Sag: Mesajlar -->
      <div className="flex flex-col flex-1 min-w-0 relative overflow-hidden">

      <!-- Thread header -->
      <div className="flex items-center justify-between border-b border-[#F2F4F7] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#12B76A]"></span>
          <span className="text-[12px] font-semibold text-[#101828]">Mesajlar</span>
        </div>
        <div className="flex items-center gap-3">
          ${isImpEkibi ? html`
            <button
              type="button"
              onClick=${() => setShowMeetingModal(true)}
              className="flex items-center gap-1.5 rounded-[7px] border border-[#E4E7EC] bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-[#344054] hover:bg-[#F9FAFB] hover:border-[#C8D0DC] transition-colors"
            >
              <${TeamsIcon} />
              Toplantı Planla
            </button>
          ` : null}
          <button
            type="button"
            onClick=${() => setShowFileHistory(v => !v)}
            className=${classNames(
              "flex items-center gap-1.5 rounded-[7px] border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors",
              showFileHistory
                ? "border-[#2F6FED] bg-[#EFF4FF] text-[#2F6FED]"
                : "border-[#E4E7EC] bg-white text-[#344054] hover:bg-[#F9FAFB] hover:border-[#C8D0DC]"
            )}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 9.5h8M2 7h10M2 4.5h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11.5 9.5l1.5 1.5-1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Dosya Geçmişi
            ${systemMessages.length > 0 ? html`
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#2F6FED] px-1 text-[9px] font-bold text-white">${systemMessages.length}</span>
            ` : null}
          </button>
        </div>
      </div>

      <!-- Dosya Geçmişi Sağ Panel -->
      <div
        className="absolute top-0 right-0 bottom-0 z-20 flex flex-col bg-white border-l border-[#F2F4F7] shadow-[-4px_0_16px_rgba(16,24,40,0.06)] transition-transform duration-300"
        style=${{width:"320px", transform: showFileHistory ? "translateX(0)" : "translateX(100%)"}}
      >
        <div className="flex items-center justify-between border-b border-[#F2F4F7] px-4 py-3 shrink-0">
          <span className="text-[12px] font-semibold text-[#101828]">Dosya Geçmişi</span>
          <button type="button" onClick=${() => setShowFileHistory(false)} className="flex h-6 w-6 items-center justify-center rounded-md text-[#667085] hover:bg-[#F2F4F7] transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          ${systemMessages.length === 0 ? html`
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F4F7]">
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M2 9.5h8M2 7h10M2 4.5h6" stroke="#98A2B3" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
              <p className="text-[12px] font-medium text-[#344054]">Henüz kayıt yok</p>
              <p className="mt-1 text-[11px] text-[#98A2B3]">Dosya hareketleri burada görünecek.</p>
            </div>
          ` : html`<div className="relative">
            <!-- timeline line -->
            <div className="absolute left-[15px] top-3 bottom-3 w-px bg-[#F2F4F7]"></div>
            <div className="space-y-4">
              ${systemMessages.map((message) => {
                const sub = message.subtype || "upload"
                const actor = message.actor || { name: "Sistem", initials: "S", color: "bg-[#F2F4F7] text-[#667085]" }
                const dotBg   = sub === "submit"   ? "bg-[#F79009]"
                              : sub === "approve"  ? "bg-[#12B76A]"
                              : sub === "revision" ? "bg-[#F04438]"
                              : "bg-[#98A2B3]"
                const labelText = sub === "submit"   ? "Onaya Gönderildi"
                                : sub === "approve"  ? "Onaylandı"
                                : sub === "revision" ? "Revizyon İstendi"
                                : "Dosya Yüklendi"
                const labelColor = sub === "submit"   ? "text-[#B54708] bg-[#FFFAEB]"
                                 : sub === "approve"  ? "text-[#067647] bg-[#ECFDF3]"
                                 : sub === "revision" ? "text-[#D92D20] bg-[#FEF3F2]"
                                 : "text-[#344054] bg-[#F9FAFB]"
                return html`
                  <div key=${message.id} className="relative flex gap-3 pl-[32px]">
                    <!-- dot -->
                    <div className=${"absolute left-[10px] top-[5px] h-[11px] w-[11px] rounded-full border-2 border-white ring-1 ring-[#E4E7EC] " + dotBg}></div>
                    <!-- card -->
                    <div className="flex-1 min-w-0 rounded-[10px] border border-[#F2F4F7] bg-[#FAFAFA] px-3 py-2.5">
                      <!-- actor row -->
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className=${`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${actor.color}`}>${actor.initials}</span>
                        <span className="text-[11.5px] font-semibold text-[#101828] truncate">${actor.name}</span>
                        <span className="ml-auto text-[10px] text-[#C8CEDE] shrink-0">${message.time}</span>
                      </div>
                      <!-- action label -->
                      <span className=${"inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold " + labelColor}>${labelText}</span>
                      <!-- file name / description -->
                      <p className="mt-1.5 text-[11px] text-[#344054] leading-relaxed break-words">${message.text}</p>
                      ${message.fileDate ? html`<p className="mt-1 text-[10px] text-[#98A2B3]">${message.fileDate}</p>` : null}
                    </div>
                  </div>
                `
              })}
            </div>
          </div>`}
        </div>
      </div>

      <!-- Thread body -->
      <div ref=${threadBodyRef} className="flex-1 overflow-y-auto px-5 py-4">
        ${chatMessages.length === 0 ? html`
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F2F4F7]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 4.5a1.5 1.5 0 011.5-1.5h11a1.5 1.5 0 011.5 1.5v7a1.5 1.5 0 01-1.5 1.5H5l-3 2V4.5z" stroke="#98A2B3" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </div>
            <p className="text-[13px] font-medium text-[#344054]">Henüz mesaj yok</p>
            <p className="mt-1 text-[12px] text-[#98A2B3]">İmplementasyon ekibine ilk mesajınızı gönderin.</p>
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
            <div className="divide-y divide-[#F2F4F7]">
              ${group.items.map((message) => {
                if (message.type === "system") {
                  const sub = message.subtype || "upload"
                  const actor = message.actor || { name: "Sistem", initials: "S", color: "bg-[#F2F4F7] text-[#667085]" }
                  const pillStyle = sub === "submit"   ? "border-[#FEF0C7] bg-[#FFFAEB]"
                                  : sub === "approve"  ? "border-[#ABEFC6] bg-[#ECFDF3]"
                                  : sub === "revision" ? "border-[#FDA29B] bg-[#FEF3F2]"
                                  : "border-[#E4E7EC] bg-[#F9FAFB]"
                  const textStyle = sub === "submit"   ? "text-[#B54708]"
                                  : sub === "approve"  ? "text-[#067647]"
                                  : sub === "revision" ? "text-[#D92D20]"
                                  : "text-[#667085]"
                  const icon = sub === "submit"   ? html`<svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v8M7 1.5L4 4.5M7 1.5l3 3M1.5 10.5h11" stroke="#B54708" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>`
                             : sub === "approve"  ? html`<svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#067647" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>`
                             : sub === "revision" ? html`<svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="#D92D20" strokeWidth="1.5" strokeLinecap="round"/></svg>`
                             : html`<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 9.5h8M6 2v6M6 2L3.5 4.5M6 2l2.5 2.5" stroke="#667085" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>`
                  return html`
                    <div key=${message.id} className="flex items-center justify-center py-2">
                      <div className=${"inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-[14px] border px-3 py-1 " + pillStyle}>
                        <span className=${`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${actor.color}`}>${actor.initials}</span>
                        <span className="text-[11px] font-medium text-[#344054]">${actor.name}</span>
                        ${icon}
                        <span className=${"text-[11px] break-words " + textStyle}>${message.text}</span>
                        ${message.fileDate ? html`<span className="text-[10px] text-[#98A2B3]">${message.fileDate}</span>` : null}
                        <span className="text-[10px] text-[#C8CEDE]">${message.time}</span>
                      </div>
                    </div>
                  `
                }

                if (message.type === "meeting") {
                  const m = message.meeting
                  return html`
                    <div key=${message.id} className="group flex gap-3 rounded-[10px] px-2 py-2.5 transition hover:bg-[#F9FAFB]">
                      <div className="relative shrink-0 mt-0.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF4FF] text-[11px] font-bold text-[#2F6FED]">${message.avatar || "IE"}</span>
                        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white bg-[#12B76A]"></span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-[13px] font-semibold text-[#101828]">${message.author}</span>
                          <span className="inline-flex h-[18px] items-center rounded-full bg-[#EFF4FF] px-2 text-[10px] font-semibold text-[#2F6FED]">İmplementasyon Ekibi</span>
                          <span className="text-[11px] text-[#98A2B3]">${message.time}</span>
                        </div>
                        <p className="mt-1 text-[13px] text-[#344054]">Bir Teams toplantısı oluşturuldu.</p>
                        <!-- Meeting card -->
                        <div className="mt-2.5 rounded-[10px] border border-[#E4E7EC] overflow-hidden" style=${{maxWidth:"320px"}}>
                          <div className="bg-[#EEF0FC] px-4 py-2.5 flex items-center gap-2">
                            <${TeamsIcon} />
                            <span className="text-[12px] font-semibold text-[#3D44A8]">Microsoft Teams Toplantısı</span>
                          </div>
                          <div className="px-4 py-3 bg-white space-y-1.5">
                            <p className="text-[13px] font-semibold text-[#101828]">${m.title}</p>
                            <div className="flex items-center gap-1.5 text-[12px] text-[#667085]">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                              ${m.date}
                            </div>
                            <div className="flex items-center gap-1.5 text-[12px] text-[#667085]">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3v3l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                              ${m.duration} dakika
                            </div>
                          </div>
                          <div className="px-4 py-2.5 border-t border-[#F2F4F7] bg-[#FCFCFD]">
                            <a
                              href=${m.url}
                              target="_blank"
                              className="inline-flex items-center gap-1.5 rounded-[7px] bg-[#5059C9] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#3D44A8] transition-colors"
                            >
                              <${TeamsIcon} />
                              Toplantıya Katıl
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  `
                }

                const isImpl = message.type === "implementation"
                const isRevisionRequest = isImpl && message.messageVariant === "revision_request"
                const isApprovalNotice = isImpl && isApprovalNoticeMessage(message)
                const relatedDocument = message.relatedDocument || null
                const relatedStepTitle = relatedDocument ? (implementationStepTemplates[relatedDocument.stepId]?.title || "İlgili belge") : ""
                const isRelatedStepActive = relatedDocument ? relatedDocument.stepId === activeStepId : false
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
                        ${isImpl ? html`<span className="inline-flex h-[18px] items-center rounded-full bg-[#EFF4FF] px-2 text-[10px] font-semibold text-[#2F6FED]">İmplementasyon Ekibi</span>` : null}
                        ${isRevisionRequest ? html`
                          <span className="inline-flex h-[19px] items-center rounded-full border border-[#F3D7D2] bg-[#FFF7F6] px-2.5 text-[10px] font-semibold text-[#C75B4A] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                            Revizyon Talebi
                          </span>
                        ` : isApprovalNotice ? html`
                          <span className="inline-flex h-[19px] items-center rounded-full border border-[#D4E8DC] bg-[#F8FCF9] px-2.5 text-[10px] font-semibold text-[#2D6A4F] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                            Onaylandı
                          </span>
                        ` : null}
                        <span className="text-[11px] text-[#98A2B3]">${message.time}</span>
                      </div>
                      ${isRevisionRequest ? html`
                        <div className="mt-2.5">
                          <${RevisionRequestCard}
                            message=${message}
                            activeStepId=${activeStepId}
                            onStepChange=${onStepChange}
                          />
                        </div>
                      ` : isApprovalNotice ? html`
                        <div className="mt-2.5">
                          <${ApprovalNoticeCard}
                            message=${message}
                            activeStepId=${activeStepId}
                            onStepChange=${onStepChange}
                          />
                        </div>
                      ` : html`
                        <p className="mt-1 text-[13px] leading-[1.6] text-[#344054] whitespace-pre-line">${message.text}</p>
                        ${relatedDocument ? html`
                          <div className="mt-2.5">
                            <${DocumentNavigationChip}
                              label=${relatedDocument.docLabel}
                              stepTitle=${relatedStepTitle}
                              isActive=${isRelatedStepActive}
                              onClick=${() => onStepChange && onStepChange(relatedDocument.stepId)}
                            />
                          </div>
                        ` : null}
                        ${message.attachments && message.attachments.length > 0 ? html`
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            ${message.attachments.map(att => html`
                              <${AttachmentChip} key=${att.name} att=${att} />
                            `)}
                          </div>
                        ` : null}
                      `}
                    </div>
                  </div>
                `
              })}
            </div>
          </div>
        `)}
      </div>

      <!-- Compose area -->
      <div className="shrink-0 border-t border-[#F2F4F7] px-5 py-3">
        ${composeArea}
      </div>
      </div><!-- /sag panel -->
    </section>

    <${MeetingModal}
      isOpen=${showMeetingModal}
      onClose=${() => setShowMeetingModal(false)}
      onConfirm=${handleMeetingConfirm}
      assignee=${assignee}
      companyName=${companyName}
      companyUsers=${companyUsers}
    />
  `
}

function ImplementationChatPanel({ messages, draft, onDraftChange, onSend, onClose }) {
  const feedRef = useRef(null)

  useEffect(() => {
    const feed = feedRef.current
    if (!feed) return
    requestAnimationFrame(() => {
      feed.scrollTop = feed.scrollHeight
    })
  }, [messages.length])

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

      <div ref=${feedRef} className="ticket-panel__feed">
        ${messages.map((message) => {
          if (message.type === "system") {
            const subtype = message.subtype || "upload"
            const actor = message.actor || { name: "Sistem", initials: "S", color: "bg-[#F2F4F7] text-[#667085]" }
            const eventClass = subtype === "submit"
              ? "inline-flex items-center gap-1.5 rounded-full border border-[#FEF0C7] bg-[#FFFAEB] px-2.5 py-0.5"
              : subtype === "approve"
                ? "inline-flex items-center gap-1.5 rounded-full border border-[#ABEFC6] bg-[#ECFDF3] px-2.5 py-0.5"
                : subtype === "revision"
                  ? "inline-flex items-center gap-1.5 rounded-full border border-[#FDA29B] bg-[#FEF3F2] px-2.5 py-0.5"
                  : "inline-flex items-center gap-1.5 rounded-full border border-[#E4E7EC] bg-[#F9FAFB] px-2.5 py-0.5"
            const textClass = subtype === "submit"
              ? "text-[11px] text-[#B54708]"
              : subtype === "approve"
                ? "text-[11px] text-[#067647]"
                : subtype === "revision"
                  ? "text-[11px] text-[#D92D20]"
                  : "text-[11px] text-[#667085]"
            return html`
              <div key=${message.id} className="flex items-center justify-center py-1.5">
                <div className=${eventClass}>
                  <span className=${`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${actor.color}`}>${actor.initials}</span>
                  <span className="text-[11px] font-medium text-[#344054]">${actor.name}</span>
                  <span className=${textClass}>${message.text}</span>
                  <span className="text-[10px] text-[#C8CEDE]">${message.time}</span>
                </div>
              </div>
            `
          }

          const isImpl = message.type === "implementation"
          const isRevisionRequest = isImpl && message.messageVariant === "revision_request"
          const isApprovalNotice = isImpl && isApprovalNoticeMessage(message)
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
                ${isImpl ? html`<span className="ticket-entry__badge">Implementasyon Ekibi</span>` : null}
                ${isRevisionRequest ? html`
                  <span className="inline-flex items-center rounded-full border border-[#F3D7D2] bg-[#FFF7F6] px-2.5 py-[2px] text-[10.5px] font-semibold text-[#C75B4A] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                    Revizyon Talebi
                  </span>
                ` : isApprovalNotice ? html`
                  <span className="inline-flex items-center rounded-full border border-[#D4E8DC] bg-[#F8FCF9] px-2.5 py-[2px] text-[10.5px] font-semibold text-[#2D6A4F] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                    Onaylandı
                  </span>
                ` : null}
                ${message.isWelcome ? html`<span className="ticket-entry__badge">Hos Geldiniz</span>` : null}
                <span className="ticket-entry__time">${message.time}</span>
              </div>
              <div className="ticket-entry__body">
                ${isRevisionRequest ? html`
                  <${RevisionRequestCard} message=${message} compact=${true} />
                ` : isApprovalNotice ? html`
                  <${ApprovalNoticeCard} message=${message} compact=${true} />
                ` : html`
                  <span style=${{whiteSpace:"pre-line"}}>${message.text}</span>
                  ${message.attachments && message.attachments.length > 0 ? html`
                    <div style=${{marginTop:"10px",display:"flex",flexWrap:"wrap",gap:"6px"}}>
                      ${message.attachments.map(att => html`
                        <${AttachmentChip} key=${att.name} att=${att} variant="compact" />
                      `)}
                    </div>
                  ` : null}
                `}
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

// ─── Live Hazırlıkları ───────────────────────────────────────────────────────

const liveHazirlikItems = [
  // şablon ekle + dismiss
  { id: "gce-formu",          number: "02", title: "Giriş Çıkış Nakil Formu",      desc: "Bu dönem giriş, çıkış veya nakil olan personel varsa şablonu indirip doldurun ve yükleyin.",                                                               type: "imp_file_conditional",     dismissLabel: "Değişiklik yok", templateLabel: "Giriş - Çıkış" },
  { id: "guncel-liste",       number: "03", title: "Güncel Personel Listesi",       desc: "Personel listesi şablonunu indirin; değişiklik varsa renklendirip geri yükleyin.",                                                                                  type: "imp_file_optional_upload", dismissLabel: "Değişiklik yok", templateLabel: "Personel Listesi" },
  { id: "bordro-takvimi",     number: "04", title: "Bordro Takvimi 2026",           desc: "Bordro takvimi şablonunu indirin; değişiklik varsa renklendirip geri yükleyin.",                                                                                     type: "imp_file_optional_upload", dismissLabel: "Değişiklik yok", templateLabel: "Bordro Takvimi" },
  { id: "icra-takip",         number: "05", title: "İcra Takip Dosyası",            desc: "Bu dönem icra kesintisi olan personel varsa şablonu indirip doldurun ve icra yazılarıyla birlikte yükleyin.",                                                        type: "imp_file_conditional",     dismissLabel: "İcra yok",       templateLabel: "İcra Takip" },
  // şablon ekle (sadece Yükle)
  { id: "kgvm-sgk",           number: "06", title: "KGVM ve SGK Devreden",          desc: "Şablonu indirip doldurun ve yükleyin. Mayıs ayı bordrolarınız tamamlandıktan sonra paylaşabilirsiniz.",                                                              type: "imp_file_required",        dismissLabel: null,             templateLabel: "KGVM - SGK" },
  { id: "muhasebe-mapping",   number: "07", title: "Muhasebe Raporu Mapping",       desc: "Muhasebe rapor mapping şablonunu indirip doldurun ve yükleyin.",                                                                                                     type: "imp_file_optional_upload", dismissLabel: "Değişiklik yok", templateLabel: "Muhasebe Mapping" },
  { id: "bos-puantaj",        number: "13", title: "Boş Puantaj Raporu",            desc: "Boş puantaj şablonu kalemlerinize göre hazırlanıp gönderilecektir. Şablonu doldurup geri yükleyebilirsiniz.",                                                        type: "imp_file_optional_upload", dismissLabel: "Puantaj yok",    templateLabel: "Boş Puantaj",          level: 1, parentId: "muhasebe-mapping" },
  { id: "duzenli-odemeler",   number: "14", title: "Düzenli Ödemeler / Kesintiler", desc: "Düzenli ödenen veya kesilen kalemleriniz (avans, özel prim, icra dışı kesinti vb.) için şablonu doldurup paylaşabilirsiniz.",                                      type: "imp_file_optional_upload", dismissLabel: "Kesinti yok",    templateLabel: "Düzenli Ödemeler",     level: 2, parentId: "bos-puantaj" },
  // metin / toplantı / bilgi
  { id: "bordro-tipi",        number: "01", title: "Bordro Tipi Seçimi",            desc: "Aşağıdaki bordro tipi seçeneklerinden birini seçin.",                                                                                                                    type: "text_only",                dismissLabel: null,             options: ["Net - Brüt", "Brüt Bordro", "Bordro Z"] },
  // şablon yok
  { id: "logo",               number: "08", title: "Şirket Logosu",                 desc: "Logo paylaşırsanız bordrolarınıza eklenecektir. İsteğe bağlıdır.",                                                                                                   type: "customer_file_optional",   dismissLabel: "Logo yok",       templateLabel: null, noTemplate: true },
  { id: "engelli-calisanlar", number: "09", title: "Engelli Çalışanlar",            desc: "Engelli çalışanınız varsa GİB'den alınan indirim yazılarını paylaşın.",                                                                                              type: "customer_file_conditional",dismissLabel: "Engelli yok",    templateLabel: null, noTemplate: true },
  { id: "banka-disketi",      number: "10", title: "Banka Disketi Örneği",          desc: "Mevcut banka ödeme disket örneğinizi yükleyin; sistemdeki örnekle karşılaştırılacaktır.",                                                                            type: "customer_file_required",   dismissLabel: null,             templateLabel: null, noTemplate: true },
  { id: "yetkilendirme",      number: "12", title: "Yetkilendirme Bilgisi",         desc: "Sisteme erişim yetkisi verilecek kişilerin adı, soyadı ve T.C. kimlik numarasını ekleyin.",                                                                          type: "person_list",              dismissLabel: null },
]

function createLiveHazirlikInitialData() {
  const data = {}
  liveHazirlikItems.forEach((item) => {
    const shouldPrefillTemplate = !item.noTemplate && !!item.templateLabel && (item.type.startsWith("imp_file") || item.type.startsWith("customer_file"))
    data[item.id] = {
      impFileSent: false,
      impFileName: null,
      impTemplates: shouldPrefillTemplate
        ? [{ id: `tmpl-${item.id}-initial`, name: `${item.templateLabel}.xlsx` }]
        : [],
      customerUploads: [],
      authorizedPersons: [],
      messageReply: "",
      dismissed: false,
      completedByImp: false,
      proposedDate: "",
      proposalSent: false,
      approvalStatus: null,
      lockedApproval: false
    }
  })
  return data
}

function LiveHazirlikItem({ item, displayNumber, data, isImpRole, isStageCompleted, isSubmitted, isRevisionRequested, canEdit, onRemoveItem, onCustomerFileUpload, onRemoveCustomerUpload, onAddImpTemplate, onRemoveImpTemplate, onAddPersons, onRemovePerson, onMessageReply, onDismiss, onUndismiss, onMarkComplete, onUnmarkComplete, onMeetingRequest, onApproveItem, onRequestRevisionItem, onOpenRejectModal }) {
  const customerFileInputRef = useRef(null)
  const impTemplateInputRef = useRef(null)
  const actionsMenuRef = useRef(null)
  const actionsButtonRef = useRef(null)
  const [replyDraft, setReplyDraft] = useState(data.messageReply || "")
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false)
  const [actionsMenuDirection, setActionsMenuDirection] = useState("down")
  const [isUploadListExpanded, setIsUploadListExpanded] = useState(false)
  const [isPersonListExpanded, setIsPersonListExpanded] = useState(false)
  const [isAddingPerson, setIsAddingPerson] = useState(false)
  const isImpFile      = item.type.startsWith("imp_file")
  const isTextOnly     = item.type === "text_only"
  const isMeeting      = item.type === "meeting"
  const isInfoOnly     = item.type === "info_only"
  const isCustomerFile = item.type.startsWith("customer_file")
  const isPersonList   = item.type === "person_list"
  const isDismissable  = !!item.dismissLabel
  const isFileItem     = isImpFile || isCustomerFile

  const isCompleted = data.completedByImp
  const isDismissed = data.dismissed
  const hasCustomerUploads = data.customerUploads && data.customerUploads.length > 0
  const hasImpTemplates = data.impTemplates && data.impTemplates.length > 0
  const hasTextReply = (data.messageReply || "").trim().length > 0
  const hasSelectionOptions = Array.isArray(item.options) && item.options.length > 0
  const canAnswer = !isImpRole && !isStageCompleted && !isSubmitted && !data.lockedApproval
  const authorizedPersons = data.authorizedPersons || []
  const hasAuthorizedPersons = authorizedPersons.length > 0

  // customer-facing "İşlemler" menu: merges şablon indirme, dosya yükleme, seçim ve "değişiklik yok" gibi tüm aksiyonları tek butona toplar
  const canDownloadTemplate = isFileItem && !item.noTemplate && hasImpTemplates
  const canUploadCustomerFile = isFileItem && !isDismissed && canAnswer
  const hasSelectionMenu = isTextOnly && hasSelectionOptions && canAnswer && !hasTextReply
  const hasDismissMenu = isFileItem && isDismissable && !hasCustomerUploads && canAnswer
  const hasPersonListMenu = isPersonList && canAnswer
  const hasCustomerMenuActions = canDownloadTemplate || canUploadCustomerFile || hasSelectionMenu || hasDismissMenu || hasPersonListMenu

  useEffect(() => {
    if (!actionsMenuOpen) return
    function handleClickOutside(e) {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target)) setActionsMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [actionsMenuOpen])

  function toggleActionsMenu() {
    if (!actionsMenuOpen && actionsButtonRef.current) {
      const rect = actionsButtonRef.current.getBoundingClientRect()
      setActionsMenuDirection(window.innerHeight - rect.bottom < 160 ? "up" : "down")
    }
    setActionsMenuOpen((current) => !current)
  }

  function downloadTemplate() {
    const tmpl = data.impTemplates && data.impTemplates[0]
    if (!tmpl || !tmpl.file) return
    const url = URL.createObjectURL(tmpl.file)
    const link = document.createElement("a")
    link.href = url
    link.download = tmpl.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function handleAddPersonSubmit(persons) {
    onAddPersons(persons)
    setIsAddingPerson(false)
  }

  const numBg = isCompleted
    ? "bg-[#DCFCE7] text-[#15803D]"
    : isDismissed
    ? "bg-[#ECFDF5] text-[#059669]"
    : isInfoOnly
    ? "bg-[#EFF6FF] text-[#3B82F6]"
    : isMeeting
    ? "bg-[#F0FDF4] text-[#166534]"
    : "bg-[#F2F4F7] text-[#667085]"

  const checkIcon = html`<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>`
  const removeIcon = html`<svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>`
  const doneIcon = html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="M22 4L12 14.01l-3-3"></path></svg>`
  const menuDotsIcon = html`<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="8" cy="13" r="1.4"/></svg>`

  // durum badge styles (nötr = gray, tamamlanan = green, bekleyen = amber, revizyon = red)
  const badgeBase = "inline-flex h-[22px] items-center gap-1 rounded-full border px-2.5 text-[11px] font-medium whitespace-nowrap max-w-full"
  const badgeGrayDashed = classNames(badgeBase, "border-dashed border-[#E4E7EC] bg-white text-[#98A2B3]")
  const badgeGreen = classNames(badgeBase, "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647] truncate")
  const badgeAmber = classNames(badgeBase, "border-[#FEC84B] bg-[#FFFAEB] text-[#B54708]")
  const badgeRed = classNames(badgeBase, "border-[#FEE4E2] bg-[#FEF3F2] text-[#D92D20]")

  const iconBtnBase = "relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200"
  const iconBtnActive = classNames(iconBtnBase, "text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7]")
  const iconBtnDone = classNames(iconBtnBase, "text-[#12B76A]")
  const iconBtnDash = "flex h-8 w-8 shrink-0 items-center justify-center text-[13px] text-[#D0D5DD] select-none"

  // durum: what to show in the DURUM column for this item
  let durumBadge = null
  if (isMeeting || isInfoOnly) {
    durumBadge = html`<span className=${badgeGrayDashed}>Henüz tamamlanmadı</span>`
  } else if (isDismissed) {
    durumBadge = html`
      <div className="inline-flex max-w-full min-w-0 items-center gap-2 rounded-[7px] border border-[#E4E7EC] bg-[#F9FAFB] px-2.5 py-2">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="flex-shrink-0"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#98A2B3" strokeWidth="1.3"/><path d="M4 7l2 2 4-4" stroke="#98A2B3" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span className="min-w-0 max-w-[180px] truncate text-[12px] font-medium text-[#344054]">${item.dismissLabel}</span>
        ${canAnswer ? html`
          <button type="button" onClick=${onUndismiss} className="flex-shrink-0 text-[10.5px] font-medium text-[#2F6FED] hover:text-[#2563CC]">Geri al</button>
        ` : null}
      </div>
    `
  } else if (isPersonList) {
    if (!hasAuthorizedPersons) {
      durumBadge = html`<span className=${badgeGrayDashed}>Henüz tamamlanmadı</span>`
    } else {
      const latestPerson = authorizedPersons[authorizedPersons.length - 1]
      const olderPersons = authorizedPersons.slice(0, -1).reverse()
      const latestInitials = `${latestPerson.ad?.[0] || ""}${latestPerson.soyad?.[0] || ""}`.toUpperCase()
      durumBadge = html`
        <div className="w-full max-w-[420px] min-w-0 space-y-1">
          <div className="flex h-[35px] min-w-0 max-w-full items-center gap-2 rounded-[7px] border border-[#E4E7EC] bg-[#F9FAFB] px-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EFF4FF] text-[8.5px] font-bold text-[#2F6FED]">
              ${latestInitials || "K"}
            </span>
            <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[#101828]">
              ${latestPerson.ad} ${latestPerson.soyad}
              <span className="mx-1.5 text-[#C8CEDE]">|</span>
              ${latestPerson.tcNo}
            </span>
            ${olderPersons.length > 0 ? html`
              <button type="button" onClick=${() => setIsPersonListExpanded((c) => !c)} className="shrink-0 inline-flex h-6 items-center gap-1 rounded-full border border-[#D0D5DD] bg-white px-2 text-[10.5px] font-semibold text-[#475467] transition hover:bg-[#F2F4F7]">
                ${authorizedPersons.length} kişi
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className=${classNames("transition", isPersonListExpanded && "rotate-180")}><path d="M3.5 5.5L7 9l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            ` : html`
              <span className="shrink-0 inline-flex h-6 items-center rounded-full border border-[#D0D5DD] bg-white px-2 text-[10.5px] font-semibold text-[#475467]">1 kişi</span>
            `}
            ${canAnswer ? html`
              <button type="button" onClick=${() => onRemovePerson(latestPerson.id)} className="flex-shrink-0 rounded-[6px] p-1 text-[#98A2B3] transition-colors hover:bg-white hover:text-[#667085]">${removeIcon}</button>
            ` : null}
          </div>
          ${isPersonListExpanded ? html`
            <div className="space-y-1 rounded-[8px] border border-[#EAECF0] bg-[#FCFCFD] p-1.5">
              ${olderPersons.map((p) => {
                const initials = `${p.ad?.[0] || ""}${p.soyad?.[0] || ""}`.toUpperCase()
                return html`
                <div key=${p.id} className="flex h-8 min-w-0 items-center gap-2 rounded-[7px] bg-white px-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F2F4F7] text-[8.5px] font-bold text-[#667085]">
                    ${initials || "K"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[#344054]">
                    ${p.ad} ${p.soyad}
                    <span className="mx-1.5 text-[#C8CEDE]">|</span>
                    ${p.tcNo}
                  </span>
                  ${canAnswer ? html`
                    <button type="button" onClick=${() => onRemovePerson(p.id)} className="flex-shrink-0 rounded-[6px] p-1 text-[#C8CEDE] transition-colors hover:bg-[#F9FAFB] hover:text-[#667085]">${removeIcon}</button>
                  ` : null}
                </div>
              `})}
            </div>
          ` : null}
        </div>
      `
    }
  } else if (isTextOnly && hasTextReply) {
    durumBadge = html`
      <div className="inline-flex max-w-full min-w-0 items-center gap-2 rounded-[7px] border border-[#E4E7EC] bg-[#F9FAFB] px-2.5 py-2">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="flex-shrink-0"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#12B76A" strokeWidth="1.3"/><path d="M4 7l2 2 4-4" stroke="#12B76A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span className="min-w-0 max-w-[180px] truncate text-[12px] font-medium text-[#344054]">${hasSelectionOptions ? data.messageReply : "Yanıt girildi"}</span>
        ${canAnswer ? html`
          <button type="button" onClick=${() => { onMessageReply(""); setReplyDraft("") }} className="flex-shrink-0 text-[10.5px] font-medium text-[#2F6FED] hover:text-[#2563CC]">Değiştir</button>
        ` : null}
      </div>
    `
  } else if (isFileItem && hasCustomerUploads) {
    const uploads = data.customerUploads
    const latestUpload = uploads[uploads.length - 1]
    const historicalUploads = uploads.slice(0, -1).reverse()
    const latestParts = splitTimestampParts(latestUpload.uploadedAt || "")
    durumBadge = html`
      <div className="w-full max-w-[420px] min-w-0 space-y-1.5">
        <div className="flex min-w-0 max-w-full items-center gap-2 rounded-[7px] border border-[#E4E7EC] bg-[#F9FAFB] px-2.5 py-2">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="flex-shrink-0"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#12B76A" strokeWidth="1.3"/><path d="M4 7l2 2 4-4" stroke="#12B76A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#344054]" title=${latestUpload.name}>${latestUpload.name}</span>
          ${latestParts.date || latestParts.time ? html`
            <div className="shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap text-right">
              ${latestParts.date ? html`<span className="text-[10px] font-medium leading-none text-[#98A2B3]">${latestParts.date}</span>` : null}
              ${latestParts.time ? html`<span className="text-[10px] leading-none text-[#B0B8C5]">${latestParts.time}</span>` : null}
            </div>
          ` : null}
          ${historicalUploads.length > 0 ? html`
            <button type="button" onClick=${() => setIsUploadListExpanded((c) => !c)} className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[#D0D5DD] bg-white px-2 py-1 text-[11px] font-medium text-[#475467] transition hover:bg-[#F9FAFB]">
              ${uploads.length} dosya
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className=${classNames("transition", isUploadListExpanded && "rotate-180")}><path d="M3.5 5.5L7 9l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ` : null}
          ${canAnswer ? html`
            <button type="button" onClick=${() => onRemoveCustomerUpload(latestUpload.id)} className="flex-shrink-0 text-[#98A2B3] hover:text-[#667085] transition-colors">${removeIcon}</button>
          ` : null}
        </div>
        ${isUploadListExpanded ? html`
          <div className="space-y-1.5 rounded-[9px] border border-[#EAECF0] bg-[#FCFCFD] p-2">
            ${historicalUploads.map((f) => {
              const parts = splitTimestampParts(f.uploadedAt || "")
              return html`
                <div key=${f.id} className="flex min-w-0 items-center gap-2 rounded-[7px] border border-[#F2F4F7] bg-white px-2 py-1.5">
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#D0D5DD" strokeWidth="1.3"/><path d="M4 7l2 2 4-4" stroke="#98A2B3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#344054]" title=${f.name}>${f.name}</span>
                  ${parts.date || parts.time ? html`
                    <div className="shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap text-right">
                      ${parts.date ? html`<span className="text-[10px] font-medium leading-none text-[#98A2B3]">${parts.date}</span>` : null}
                      ${parts.time ? html`<span className="text-[10px] leading-none text-[#B0B8C5]">${parts.time}</span>` : null}
                    </div>
                  ` : null}
                </div>
              `
            })}
          </div>
        ` : null}
        ${data.templateNotice ? html`
          <div className="flex items-start gap-2 rounded-[8px] border border-[#FDE68A] bg-[#FFFAEB] px-2.5 py-2 text-[10.5px] leading-4 text-[#B54708]">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0"><path d="M7 1.5l5.5 10H1.5L7 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M7 5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="10" r=".7" fill="currentColor"/></svg>
            ${data.templateNotice === "removed"
              ? "Şablon kaldırıldı; mevcut müşteri yanıtı korunuyor."
              : "Şablon güncellendi; mevcut müşteri dosyası yeniden kontrol edilmeli."}
          </div>
        ` : null}
      </div>
    `
  } else {
    durumBadge = html`<span className=${badgeGrayDashed}>Henüz tamamlanmadı</span>`
  }

  // customer-facing review overlay: surfaces imp team's per-item decision once submitted
  let reviewTag = null
  if (!isImpRole && !isMeeting && !isInfoOnly) {
    if (data.approvalStatus === "revision_requested") {
      reviewTag = html`<span className=${badgeRed}>Revizyon Gerekiyor</span>`
    } else if (isSubmitted && !data.approvalStatus) {
      reviewTag = html`<span className=${badgeAmber}>Onayda Bekliyor</span>`
    }
  }

  return html`
    <div className=${classNames("transition-colors", isCompleted && "bg-[#F0FDF4]")}>

      <!-- main row -->
      <div className="grid grid-cols-1 gap-2 px-5 py-3 md:items-center md:gap-3 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)_56px_56px_auto]">

        <!-- ALAN ADI -->
        <div className="flex items-center gap-2 min-w-0">
          <div className=${classNames("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 select-none", numBg)}>
            ${isCompleted ? checkIcon : displayNumber}
          </div>
          <span className=${classNames("truncate text-[12.5px] font-medium leading-snug", isCompleted ? "text-[#15803D]" : "text-[#101828]")} title=${item.title}>${item.title}</span>
          <${InfoTooltip} text=${item.desc} />
        </div>

        <!-- DURUM -->
        <div className="min-w-0 flex flex-wrap items-center gap-1.5">
          ${durumBadge}
          ${reviewTag}
        </div>

        <!-- İŞLEMLER -->
        ${isImpRole ? html`
        <div className="flex md:justify-end md:col-span-2">
          ${isFileItem && !item.noTemplate && (hasImpTemplates || canEdit) ? html`
            <div className="relative" ref=${actionsMenuRef}>
              <button
                ref=${actionsButtonRef}
                type="button"
                title="İşlemler"
                aria-haspopup="menu"
                aria-expanded=${String(actionsMenuOpen)}
                onClick=${toggleActionsMenu}
                className=${classNames(iconBtnActive, "cursor-pointer", actionsMenuOpen && "bg-[#F2F4F7] text-[#101828]")}
              >
                ${menuDotsIcon}
              </button>
              ${actionsMenuOpen ? html`
                <div className=${classNames(
                  "absolute right-0 z-20 w-48 rounded-[12px] border border-[#E4E7EC] bg-white p-1.5 shadow-[0_14px_32px_rgba(16,24,40,0.14)]",
                  actionsMenuDirection === "up" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"
                )}>
                  ${hasImpTemplates ? html`
                    <button type="button" onClick=${() => { downloadTemplate(); setActionsMenuOpen(false) }}
                      className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F8FAFC]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#2F6FED]"><${DownloadIcon} /></span>
                      Şablon İndir
                    </button>
                    ${canEdit ? html`
                      <button type="button" onClick=${() => { setActionsMenuOpen(false); impTemplateInputRef.current?.click() }}
                        className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F8FAFC]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#475467]"><${PencilIcon} /></span>
                        Şablon Değiştir
                      </button>
                      <button type="button" onClick=${() => { onRemoveImpTemplate(); setActionsMenuOpen(false) }}
                        className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#D92D20] transition hover:bg-[#FEF3F2]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#D92D20]"><${TrashIcon} /></span>
                        Şablonu Kaldır
                      </button>
                    ` : null}
                  ` : html`
                    <button type="button" onClick=${() => { setActionsMenuOpen(false); impTemplateInputRef.current?.click() }}
                      className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F8FAFC]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#475467]"><${UploadIcon} /></span>
                      Şablon Yükle
                    </button>
                  `}
                </div>
              ` : null}
              ${canEdit ? html`
                <input ref=${impTemplateInputRef} type="file" title="Şablon Yükle" className="hidden"
                  onChange=${(e) => { onAddImpTemplate(Array.from(e.target.files || [])); e.target.value = "" }} />
              ` : null}
            </div>
          ` : html`<span title="İşlem yok" className=${iconBtnDash}>—</span>`}
        </div>
        ` : html`
        <div className="flex md:justify-end md:col-span-2">
          ${hasCustomerMenuActions ? html`
            <div className="relative" ref=${actionsMenuRef}>
              <button
                ref=${actionsButtonRef}
                type="button"
                title="İşlemler"
                aria-haspopup="menu"
                aria-expanded=${String(actionsMenuOpen)}
                onClick=${toggleActionsMenu}
                className=${classNames(iconBtnActive, "cursor-pointer", actionsMenuOpen && "bg-[#F2F4F7] text-[#101828]")}
              >
                ${menuDotsIcon}
              </button>
              ${actionsMenuOpen ? html`
                <div className=${classNames(
                  "absolute right-0 z-20 w-56 rounded-[12px] border border-[#E4E7EC] bg-white p-1.5 shadow-[0_14px_32px_rgba(16,24,40,0.14)]",
                  actionsMenuDirection === "up" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"
                )}>
                  ${hasSelectionMenu ? item.options.map((option) => html`
                    <button
                      key=${option}
                      type="button"
                      onClick=${() => { onMessageReply(option); setActionsMenuOpen(false) }}
                      className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F8FAFC]"
                    >
                      ${option}
                    </button>
                  `) : null}
                  ${canDownloadTemplate ? html`
                    <button
                      type="button"
                      onClick=${() => { downloadTemplate(); setActionsMenuOpen(false) }}
                      className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F8FAFC]"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#2F6FED]"><${DownloadIcon} /></span>
                      Şablonu İndir
                    </button>
                  ` : null}
                  ${canUploadCustomerFile ? html`
                    <button
                      type="button"
                      onClick=${() => { customerFileInputRef.current?.click(); setActionsMenuOpen(false) }}
                      className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F8FAFC]"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#475467]"><${UploadIcon} /></span>
                      ${hasCustomerUploads ? "Dosya Ekle" : "Dosya Yükle"}
                    </button>
                  ` : null}
                  ${hasDismissMenu ? html`
                    <button
                      type="button"
                      onClick=${() => { onDismiss(); setActionsMenuOpen(false) }}
                      className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#667085] transition hover:bg-[#F8FAFC]"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#98A2B3]">${removeIcon}</span>
                      ${item.dismissLabel}
                    </button>
                  ` : null}
                  ${hasPersonListMenu ? html`
                    <button
                      type="button"
                      onClick=${() => { setActionsMenuOpen(false); setIsAddingPerson(true) }}
                      className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F8FAFC]"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#475467]"><${PlusIcon} /></span>
                      Kişi Ekle
                    </button>
                  ` : null}
                </div>
              ` : null}
              ${isFileItem ? html`
                <input ref=${customerFileInputRef} type="file" multiple title="Dosya Yükle" className="hidden"
                  onChange=${(e) => { onCustomerFileUpload(Array.from(e.target.files || [])); e.target.value = "" }} />
              ` : null}
            </div>
          ` : isFileItem && hasCustomerUploads ? html`
            <span title=${data.customerUploads.map((f) => f.name).join(", ")} className=${iconBtnDone}>${doneIcon}</span>
          ` : html`<span title="İşlem yok" className=${iconBtnDash}>—</span>`}
        </div>
        `}

        <!-- AKSİYON: imp inceleme / düzenleme -->
        <div className="flex items-center justify-end gap-1.5">
          ${isImpRole && !isStageCompleted ? html`
            ${isSubmitted && !isInfoOnly && !isMeeting ? html`
              ${data.approvalStatus === "approved" ? html`
                <span className="inline-flex items-center gap-1 text-[11px] text-[#067647] bg-[#ECFDF3] border border-[#ABEFC6] px-2.5 py-1.5 rounded-[7px] font-medium whitespace-nowrap">
                  ${checkIcon} Onaylandı
                </span>
                ${!data.lockedApproval ? html`<button onClick=${() => onApproveItem(null)} className="shrink-0 inline-flex items-center gap-1 rounded-[7px] border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#667085] hover:bg-[#F9FAFB] transition whitespace-nowrap">Geri Al</button>` : null}
              ` : html`
                <button onClick=${() => onOpenRejectModal(item.id, item.title)}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 border border-[#FDA29B] rounded-[7px] text-[#D92D20] bg-white hover:bg-[#FEF3F2] transition whitespace-nowrap">
                  ${removeIcon} Revizyon
                </button>
                <button onClick=${() => onApproveItem("approved")}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 border border-[#ABEFC6] rounded-[7px] text-[#067647] bg-white hover:bg-[#ECFDF3] transition whitespace-nowrap">
                  ${checkIcon} Onayla
                </button>
              `}
            ` : isRevisionRequested && !isInfoOnly && !isMeeting ? html`
              ${data.approvalStatus === "approved" ? html`
                <span className="inline-flex items-center gap-1 text-[11px] text-[#067647] bg-[#ECFDF3] border border-[#ABEFC6] px-2.5 py-1.5 rounded-[7px] font-medium whitespace-nowrap">
                  ${checkIcon} Onaylandı
                </span>
              ` : data.approvalStatus === "revision_requested" ? html`
                <span className="inline-flex items-center gap-1 text-[11px] text-[#D92D20] bg-[#FEF3F2] border border-[#FEE4E2] px-2.5 py-1.5 rounded-[7px] font-medium whitespace-nowrap">
                  Revizyon Bekleniyor
                </span>
              ` : null}
            ` : null}
          ` : isImpRole && isStageCompleted && data.approvalStatus === "approved" ? html`
            <span className="inline-flex items-center gap-1 text-[11px] text-[#067647] bg-[#ECFDF3] border border-[#ABEFC6] px-2.5 py-1.5 rounded-[7px] font-medium whitespace-nowrap">
              ${checkIcon} Onaylandı
            </span>
          ` : null}
          ${canEdit ? html`
            <button
              type="button"
              title="Sil"
              aria-label="Maddeyi sil"
              onClick=${onRemoveItem}
              className="relative z-10 shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#475467] hover:text-[#D92D20] hover:bg-[#FEF3F2] transition-all duration-200"
            >
              <${TrashIcon} />
            </button>
          ` : null}
        </div>
      </div>

      <!-- sub-row: free-text reply (no selection options) -->
      ${isTextOnly && !hasSelectionOptions && !hasTextReply && canAnswer ? html`
        <div className="grid grid-cols-1 gap-2 px-5 pb-2.5 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)_56px_56px_auto]">
        <div className="hidden md:block"></div>
        <div className="flex flex-col gap-1.5 max-w-[420px] md:col-span-3">
          <textarea
            value=${replyDraft}
            onInput=${(e) => setReplyDraft(e.target.value)}
            placeholder="Yanıtınızı buraya yazın…"
            rows="2"
            className="w-full text-[12px] bg-white border border-[#E4E7EC] rounded-[7px] px-3 py-2 resize-none text-[#101828] placeholder-[#D0D5DD] focus:outline-none focus:border-[#2F6FED]"
          />
          ${replyDraft.trim() ? html`
            <div className="flex justify-end">
              <button
                type="button"
                onClick=${() => onMessageReply(replyDraft)}
                className="shrink-0 inline-flex items-center rounded-[7px] bg-[#2F6FED] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#2563CC] transition"
              >Kaydet</button>
            </div>
          ` : null}
        </div>
        </div>
      ` : null}

      ${isPersonList ? html`
        <${AddAuthorizedPersonModal}
          isOpen=${isAddingPerson && canAnswer}
          onClose=${() => setIsAddingPerson(false)}
          onSubmit=${handleAddPersonSubmit}
        />
      ` : null}
    </div>
  `
}

function LiveHazirliklarContent({ stepUpload, onSubmitForApproval, onSendDecisions, onCompleteStep, userRole, assignee, onSendMessage, onMeetingRequest }) {
  const [itemData, setItemData] = useState(() => createLiveHazirlikInitialData())
  const [customLiveItems, setCustomLiveItems] = useState([])
  const [removedLiveItemIds, setRemovedLiveItemIds] = useState([])
  const [isEditingLiveItems, setIsEditingLiveItems] = useState(false)
  const [isAddLiveItemModalOpen, setIsAddLiveItemModalOpen] = useState(false)
  const assigneeLabel = assignee || "Zerrin Altun"
  const assigneeInitials = assigneeLabel.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

  const isImpRole = !userRole || userRole === "imp_ekibi"
  const isStageCompleted = stepUpload?.status === "completed" || stepUpload?.status === "approved"
  const isSubmitted = stepUpload?.status === "pending_approval"
  const isApproved = stepUpload?.status === "docs_approved"
  const isRevisionRequested = stepUpload?.status === "revision_requested"
  const canManageLiveTemplate = isImpRole && !isSubmitted && !isApproved && !isStageCompleted

  const allLiveItems = useMemo(
    () => [...liveHazirlikItems, ...customLiveItems].filter((item) => !removedLiveItemIds.includes(item.id)),
    [customLiveItems, removedLiveItemIds]
  )

  const canEditLiveItems = canManageLiveTemplate && isEditingLiveItems

  useEffect(() => {
    if (canManageLiveTemplate) return
    setIsEditingLiveItems(false)
    setIsAddLiveItemModalOpen(false)
  }, [canManageLiveTemplate])

  function handleAddLiveItemsSubmit(entries) {
    const newItems = []
    const newItemData = {}
    entries.forEach(({ label, responseType, file, description }, i) => {
      const id = `custom-live-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`
      const isTextResponse = responseType === "text"
      newItems.push({
        id,
        title: label,
        desc: description || "",
        type: isTextResponse ? "text_only" : "customer_file_optional",
        dismissLabel: null,
        templateLabel: !isTextResponse && file ? label : null,
        noTemplate: isTextResponse,
        addedDuringRevision: isRevisionRequested,
        isCustom: true
      })
      newItemData[id] = {
        impFileSent: false, impFileName: null,
        impTemplates: file ? [{ id: `tmpl-${id}-0`, name: file.name, file }] : [],
        customerUploads: [], messageReply: "", dismissed: false, completedByImp: false,
        proposedDate: "", proposalSent: false,
        approvalStatus: isRevisionRequested ? "revision_requested" : null,
        revisionReason: isRevisionRequested ? "Ek bilgi talebi" : "",
        lockedApproval: false
      }
    })
    setCustomLiveItems((current) => [...current, ...newItems])
    setItemData((current) => ({ ...current, ...newItemData }))
    setIsAddLiveItemModalOpen(false)
  }

  function handleRemoveLiveItem(item) {
    if (!window.confirm("Bu maddeyi kaldırmak istediğinize emin misiniz?")) return
    if (item.isCustom) {
      setCustomLiveItems((current) => current.filter((i) => i.id !== item.id))
    } else {
      setRemovedLiveItemIds((current) => [...current, item.id])
    }
  }

  const emptyLiveRejectComposer = { itemId: "", itemTitle: "", reason: "", exampleFiles: [] }
  const [liveRejectComposer, setLiveRejectComposer] = useState(emptyLiveRejectComposer)

  const openLiveRejectComposer = (itemId, itemTitle) => {
    setLiveRejectComposer({ itemId, itemTitle, reason: "", exampleFiles: [] })
  }
  const closeLiveRejectComposer = () => setLiveRejectComposer(emptyLiveRejectComposer)
  const confirmLiveRejectComposer = () => {
    if (liveRejectComposer.itemId === "__all__") {
      setItemData((prev) => {
        const next = { ...prev }
        allLiveItems.forEach((item) => { next[item.id] = { ...next[item.id], approvalStatus: "revision_requested", revisionReason: liveRejectComposer.reason } })
        return next
      })
    } else {
      updateItem(liveRejectComposer.itemId, { approvalStatus: "revision_requested", revisionReason: liveRejectComposer.reason })
    }
    closeLiveRejectComposer()
  }

  const updateItem = (id, patch) => setItemData((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))

  const handleCustomerFileUpload = (id, files) => {
    if (!files || files.length === 0) return
    const uploads = files.map((f, i) => ({ id: `live-${id}-${Date.now()}-${i}`, name: f.name, uploadedAt: formatTimestamp() }))
    updateItem(id, {
      customerUploads: [...(itemData[id].customerUploads || []), ...uploads],
      templateNotice: null
    })
  }

  const handleRemoveCustomerUpload = (id, fileId) => {
    updateItem(id, { customerUploads: (itemData[id].customerUploads || []).filter((f) => f.id !== fileId) })
  }

  const handleAddImpTemplate = (id, files) => {
    if (!files || files.length === 0) return
    const templates = files.map((f, i) => ({ id: `tmpl-${id}-${Date.now()}-${i}`, name: f.name, file: f }))
    updateItem(id, {
      impTemplates: templates,
      templateNotice: (itemData[id].customerUploads || []).length > 0 ? "changed" : null
    })
  }

  const handleRemoveImpTemplate = (id) => {
    updateItem(id, {
      impTemplates: [],
      templateNotice: (itemData[id].customerUploads || []).length > 0 ? "removed" : null
    })
  }

  const handleAddAuthorizedPersons = (id, persons) => {
    const newPersons = persons.map((person, index) => ({
      id: `person-${id}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      ...person
    }))
    updateItem(id, { authorizedPersons: [...(itemData[id].authorizedPersons || []), ...newPersons] })
  }

  const handleRemoveAuthorizedPerson = (id, personId) => {
    updateItem(id, { authorizedPersons: (itemData[id].authorizedPersons || []).filter((person) => person.id !== personId) })
  }

  const isItemDone = (item) => {
    if (item.type === "info_only") return true
    return itemData[item.id].completedByImp
  }

  const doneCount = allLiveItems.filter(isItemDone).length
  const totalCount = allLiveItems.length
  const allDone = doneCount === totalCount
  const reviewableItems = allLiveItems.filter((item) => item.type !== "info_only" && item.type !== "meeting")
  const autoApprovedItems = allLiveItems.filter((item) => item.type === "info_only" || item.type === "meeting")
  const approvedCount = isSubmitted ? reviewableItems.filter((item) => itemData[item.id].approvalStatus === "approved").length : 0
  const revisionCount = isSubmitted ? reviewableItems.filter((item) => itemData[item.id].approvalStatus === "revision_requested").length : 0
  const allItemsReviewed = isSubmitted && (approvedCount + revisionCount) === reviewableItems.length
  const allItemsApproved = isSubmitted && approvedCount === reviewableItems.length

  function hasCustomerAnswer(item) {
    const data = itemData[item.id] || {}
    if (item.type === "info_only" || item.type === "meeting") return true
    if (data.dismissed) return true
    if (item.type === "person_list") return (data.authorizedPersons || []).length > 0
    if (item.type === "text_only") return Boolean((data.messageReply || "").trim())
    if (item.type.startsWith("imp_file") || item.type.startsWith("customer_file")) {
      return (data.customerUploads || []).length > 0
    }
    return false
  }

  const customerRequiredItems = isRevisionRequested
    ? reviewableItems.filter((item) => !itemData[item.id].lockedApproval)
    : reviewableItems
  const missingCustomerAnswerCount = customerRequiredItems.filter((item) => !hasCustomerAnswer(item)).length
  const canSubmitCustomerResponses = customerRequiredItems.length > 0 && missingCustomerAnswerCount === 0

  function handleCustomerSubmitResponses() {
    if (!canSubmitCustomerResponses) return
    setItemData((current) => {
      const next = { ...current }
      reviewableItems.forEach((item) => {
        if (!current[item.id].lockedApproval) {
          next[item.id] = { ...current[item.id], approvalStatus: null }
        }
      })
      return next
    })
    onSubmitForApproval()
  }

  const statusMeta = isStageCompleted
    ? { dot: "bg-[#12B76A]", border: "border-[#ABEFC6]", badgeClass: "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]", label: "Tamamlandı" }
    : isApproved
    ? { dot: "bg-[#12B76A]", border: "border-[#ABEFC6]", badgeClass: "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]", label: "Onaylandı" }
    : isRevisionRequested
    ? { dot: "bg-[#F04438]", border: "border-[#FEE4E2]", badgeClass: "border-[#FEE4E2] bg-[#FEF3F2] text-[#D92D20]", label: "Revizyon Gerekiyor" }
    : isSubmitted
    ? { dot: "bg-[#F79009]", border: "border-[#FDE68A]", badgeClass: "border-[#FEC84B] bg-[#FFFAEB] text-[#B54708]", label: "Onayda Bekliyor" }
    : { dot: "bg-[#D0D5DD]", border: "border-[#E4E7EC]", badgeClass: "border-[#EAECF0] bg-[#F9FAFB] text-[#475467]", label: "Bekliyor" }

  return html`
    <section className="space-y-4">
      <${RejectComposerModal}
        rejectComposer=${{ docId: liveRejectComposer.itemId, docLabel: liveRejectComposer.itemTitle, reason: liveRejectComposer.reason, exampleFiles: liveRejectComposer.exampleFiles }}
        onRejectReasonChange=${(reason) => setLiveRejectComposer((c) => ({ ...c, reason }))}
        onRejectExampleFilesChange=${(files) => setLiveRejectComposer((c) => ({ ...c, exampleFiles: files }))}
        onCancelReject=${closeLiveRejectComposer}
        onConfirmReject=${confirmLiveRejectComposer}
      />
      <div>
        <h2 className="text-[17px] font-semibold text-[#101828]">Live Hazırlıkları</h2>
        <p className="mt-0.5 text-[13px] text-[#667085]">
          ${isImpRole
            ? "Müşteriden beklenen belgeleri mesaj alanından paylaşın, yanıtları takip edin ve tamamlanan maddeleri işaretleyin."
            : "Aşağıdaki maddeleri yanıtlayın ve gerekli dosyaları mesaj alanından yükleyin. Sorularınız için mesaj yazabilirsiniz."}
        </p>
      </div>

      <div className=${classNames(
        "rounded-[16px] border bg-white overflow-hidden",
        isEditingLiveItems ? "border-[#D5E2FF]" : statusMeta.border
      )}>

        <!-- card header -->
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[#F2F4F7]">
          <div className="flex items-center gap-2">
            <span className=${classNames("h-2 w-2 shrink-0 rounded-full", statusMeta.dot)}></span>
            <span className="text-[13px] font-semibold text-[#344054]">Live Hazırlıkları</span>
          </div>
          <div className="flex items-center gap-2">
            ${canManageLiveTemplate ? html`
              <button
                type="button"
                onClick=${() => setIsEditingLiveItems((current) => !current)}
                className=${classNames(
                  "inline-flex h-[26px] items-center gap-1 rounded-[7px] border px-2 text-[11px] font-medium transition",
                  isEditingLiveItems
                    ? "border-[#2F6FED] bg-[#2F6FED] text-white hover:bg-[#2563CC]"
                    : "border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"
                )}
              >
                ${isEditingLiveItems ? null : html`<${PencilIcon} />`}${isEditingLiveItems ? "Tamam" : "Şablon Düzenle"}
              </button>
            ` : isImpRole ? html`
              <span
                title=${isSubmitted ? "Müşteri yanıtları incelenirken alan yapısı değiştirilemez." : "Onaylanan alan yapısı değiştirilemez."}
                className="inline-flex h-[26px] items-center gap-1 rounded-[7px] border border-[#E4E7EC] bg-[#F9FAFB] px-2 text-[11px] font-medium text-[#98A2B3]"
              >
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><rect x="2.5" y="6" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Şablon Kilitli
              </span>
            ` : null}
            <span className=${classNames("inline-flex h-[22px] items-center rounded-full border px-2.5 text-[11px] font-medium", statusMeta.badgeClass)}>
              ${statusMeta.label}
            </span>
          </div>
        </div>

        <!-- column header -->
        <div className="hidden grid-cols-[minmax(0,320px)_minmax(0,1fr)_56px_56px_auto] gap-3 border-b border-[#F2F4F7] bg-[#FAFBFC] px-5 py-2.5 md:grid">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#98A2B3]">Alan Adı</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#98A2B3]">Durum</span>
          <span className="md:col-span-2 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-[#98A2B3]">İşlemler</span>
          <span></span>
        </div>

        <!-- items -->
        <div className="divide-y divide-[#F2F4F7]">
          ${allLiveItems.map((item, index) => html`
            <${LiveHazirlikItem}
              key=${item.id}
              item=${item}
              displayNumber=${String(index + 1).padStart(2, "0")}
              data=${itemData[item.id]}
              isImpRole=${isImpRole}
              isStageCompleted=${isStageCompleted}
              isSubmitted=${isSubmitted}
              isRevisionRequested=${isRevisionRequested}
              canEdit=${canEditLiveItems}
              onRemoveItem=${() => handleRemoveLiveItem(item)}
              onCustomerFileUpload=${(files) => handleCustomerFileUpload(item.id, files)}
              onRemoveCustomerUpload=${(fileId) => handleRemoveCustomerUpload(item.id, fileId)}
              onAddImpTemplate=${(files) => handleAddImpTemplate(item.id, files)}
              onRemoveImpTemplate=${() => handleRemoveImpTemplate(item.id)}
              onAddPersons=${(persons) => handleAddAuthorizedPersons(item.id, persons)}
              onRemovePerson=${(personId) => handleRemoveAuthorizedPerson(item.id, personId)}
              onMessageReply=${(v) => updateItem(item.id, { messageReply: v })}
              onDismiss=${() => updateItem(item.id, { dismissed: true })}
              onUndismiss=${() => updateItem(item.id, { dismissed: false })}
              onMarkComplete=${() => updateItem(item.id, { completedByImp: true })}
              onUnmarkComplete=${() => updateItem(item.id, { completedByImp: false })}
              onMeetingRequest=${onMeetingRequest}
              onApproveItem=${(status) => updateItem(item.id, { approvalStatus: status })}
              onRequestRevisionItem=${(status) => updateItem(item.id, { approvalStatus: status })}
              onOpenRejectModal=${openLiveRejectComposer}
            />
          `)}
          ${canEditLiveItems ? html`
            <div className="px-5 py-2">
              <button
                type="button"
                onClick=${() => setIsAddLiveItemModalOpen(true)}
                className="inline-flex items-center gap-1 py-0.5 text-[12px] font-medium text-[#2F6FED] transition hover:text-[#2563CC]"
              >
                <${PlusIcon} />Ekle
              </button>
            </div>
          ` : null}
        </div>

        <!-- card footer -->
        <div className="flex items-center justify-between gap-3 border-t border-[#F2F4F7] px-5 py-3">
          <span className="text-[12px] text-[#667085]">
            ${isSubmitted ? `${approvedCount + revisionCount} / ${reviewableItems.length} incelendi` : `${doneCount} / ${totalCount} madde`}
          </span>
          ${isStageCompleted ? html`
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#067647]">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Stage tamamlandı. Bu alan artık yalnızca görüntülenebilir.
            </span>
          ` : isImpRole && isApproved ? html`
            <button onClick=${onCompleteStep}
              className="shrink-0 inline-flex items-center gap-2 rounded-[9px] bg-[#067647] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#05603A]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Stage Tamamla
            </button>
          ` : isImpRole && isSubmitted ? html`
            <button
              type="button"
              onClick=${allItemsReviewed ? () => {
                const approvedItems = [
                  ...reviewableItems.filter((item) => itemData[item.id].approvalStatus === "approved").map((item) => ({ id: item.id, title: item.title })),
                  ...autoApprovedItems.map((item) => ({ id: item.id, title: item.title }))
                ]
                const revisionItems = reviewableItems.filter((item) => itemData[item.id].approvalStatus === "revision_requested").map((item) => ({ id: item.id, title: item.title, reason: itemData[item.id].revisionReason || "" }))
                setItemData((prev) => {
                  const next = { ...prev }
                  reviewableItems.forEach((item) => {
                    if (prev[item.id].approvalStatus === "approved") {
                      next[item.id] = { ...prev[item.id], lockedApproval: true }
                    }
                  })
                  return next
                })
                onSendDecisions({ approvedItems, revisionItems })
              } : undefined}
              disabled=${!allItemsReviewed}
              className=${!allItemsReviewed
                ? "shrink-0 inline-flex cursor-not-allowed items-center gap-2 rounded-[9px] bg-[#F2F4F7] px-4 py-2 text-[13px] font-semibold text-[#98A2B3]"
                : allItemsApproved
                  ? "shrink-0 inline-flex items-center gap-2 rounded-[9px] bg-[#067647] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#05603A]"
                  : "shrink-0 inline-flex items-center gap-2 rounded-[9px] bg-[#2F6FED] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#2563CC]"
              }
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v8M7 1.5L4 4.5M7 1.5l3 3M1.5 10.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Kararları Gönder
            </button>
          ` : isImpRole ? html`
            <span className="text-[12px] text-[#98A2B3]">Müşteri yanıtları gönderdiğinde inceleme aktif olur.</span>
          ` : isRevisionRequested ? html`
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-[#D92D20]">
                ${missingCustomerAnswerCount > 0 ? `${missingCustomerAnswerCount} yeni veya eksik yanıt bekleniyor.` : "Gerekli yanıtlar güncellendi, yeniden gönderebilirsiniz."}
              </span>
              <button
                onClick=${canSubmitCustomerResponses ? handleCustomerSubmitResponses : undefined}
                disabled=${!canSubmitCustomerResponses}
                className=${canSubmitCustomerResponses
                  ? "shrink-0 inline-flex items-center gap-1 rounded-[8px] border border-[#2F6FED] bg-[#2F6FED] px-3.5 py-1.5 text-[12.5px] font-medium text-white transition hover:bg-[#2563CC]"
                  : "shrink-0 inline-flex cursor-not-allowed items-center gap-1 rounded-[8px] border border-[#E4E7EC] bg-[#F2F4F7] px-3.5 py-1.5 text-[12.5px] font-medium text-[#98A2B3]"
                }
              >
                Yeniden Gönder
              </button>
            </div>
          ` : isSubmitted ? html`
            <span className="text-[12px] text-[#B54708]">Yanıtlar iletildi, implementasyon ekibi inceliyor.</span>
          ` : html`
            <div className="flex items-center gap-3">
              ${missingCustomerAnswerCount > 0 ? html`<span className="text-[12px] text-[#98A2B3]">${missingCustomerAnswerCount} yanıt bekleniyor.</span>` : null}
              <button
                onClick=${canSubmitCustomerResponses ? handleCustomerSubmitResponses : undefined}
                disabled=${!canSubmitCustomerResponses}
                className=${canSubmitCustomerResponses
                  ? "shrink-0 inline-flex items-center gap-1 rounded-[8px] border border-[#2F6FED] bg-[#2F6FED] px-3.5 py-1.5 text-[12.5px] font-medium text-white transition hover:bg-[#2563CC]"
                  : "shrink-0 inline-flex cursor-not-allowed items-center gap-1 rounded-[8px] border border-[#E4E7EC] bg-[#F2F4F7] px-3.5 py-1.5 text-[12.5px] font-medium text-[#98A2B3]"
                }
              >
                Yanıtları Gönder
              </button>
            </div>
          `}
        </div>
      </div>

      <${AddCustomDocumentModal}
        isOpen=${isAddLiveItemModalOpen}
        stepTitle="Live Hazırlıkları"
        onClose=${() => setIsAddLiveItemModalOpen(false)}
        onSubmit=${handleAddLiveItemsSubmit}
      />
    </section>
  `
}

const STARTER_KIT_ISSUE_TYPE_META = {
  hata: {
    label: "Hata",
    listLabel: "Hata",
    dot: "bg-[#F04438]",
    chipClass: "border-[#FDA29B] bg-[#FEF3F2] text-[#D92D20]",
    cardClass: "border-[#FDA29B] bg-[#FFFBFA]",
    hint: "Kesinlikle düzeltilmesi gerekir"
  },
  uyari: {
    label: "Uyarı",
    listLabel: "Uyarı",
    dot: "bg-[#F79009]",
    chipClass: "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]",
    cardClass: "border-[#FEDF89] bg-[#FFFCF5]",
    hint: "Format olarak düzeltilmesi iyi olur"
  },
  guncelleme: {
    label: "Güncelleme",
    listLabel: "Otomatik Güncelleme",
    dot: "bg-[#2F6FED]",
    chipClass: "border-[#D5E2FF] bg-[#EFF4FF] text-[#2F6FED]",
    cardClass: "border-[#D5E2FF] bg-[#F8FAFF]",
    hint: "Sistem tarafından otomatik yapılan değişiklik"
  }
}

function generateStarterKitValidationIssues() {
  return [
    { id: "tc-1", fieldId: "tc-kimlik-no", fieldLabel: "T.C. Kimlik No", column: "B", type: "hata", row: 2, originalValue: "Kimlik Bilgileri", message: `T.C. Kimlik No: "Kimlik Bilgileri" geçersiz — 11 haneli ve doğrulama hanesi tutarlı olmalı. Doğru değeri girin ya da bize iletin.` },
    { id: "tc-2", fieldId: "tc-kimlik-no", fieldLabel: "T.C. Kimlik No", column: "B", type: "hata", row: 3, originalValue: "T.C. Kimlik No", message: `T.C. Kimlik No: "T.C. Kimlik No" geçersiz — sütun başlığı veri satırına kopyalanmış olabilir. Doğru değeri girin ya da bize iletin.` },
    { id: "iban-1", fieldId: "iban", fieldLabel: "IBAN", column: "H", type: "hata", row: 5, originalValue: "1234567890", message: `IBAN: "1234567890" geçersiz — "TR" ile başlamalı ve 26 haneli olmalı.` },
    { id: "iban-2", fieldId: "iban", fieldLabel: "IBAN", column: "H", type: "hata", row: 12, originalValue: "TR12 34", message: `IBAN: "TR12 34" eksik haneli — 26 haneli olmalı.` },
    { id: "iban-3", fieldId: "iban", fieldLabel: "IBAN", column: "H", type: "hata", row: 30, originalValue: "FR76 3000 6000 0110 6091 2000 073", message: `IBAN: "TR" ile başlamalı — farklı bir ülke IBAN'ı girilmiş.` },
    { id: "belge-1", fieldId: "belge-turu", fieldLabel: "Belge Türü", column: "I", type: "hata", row: 8, originalValue: "Pasaport Fotokopisi", message: `Belge Türü: "Pasaport Fotokopisi" tanımlı belge türlerinden biri değil.` },
    { id: "belge-2", fieldId: "belge-turu", fieldLabel: "Belge Türü", column: "I", type: "hata", row: 19, originalValue: "", message: `Belge Türü boş bırakılamaz.` },
    { id: "cinsiyet-1", fieldId: "cinsiyet", fieldLabel: "Cinsiyet", column: "C", type: "uyari", row: 6, originalValue: "E", suggestedValue: "Erkek", message: `Cinsiyet: "E" değeri "Erkek" olarak eşleşti. Onaylarsanız formatı düzeltebiliriz, düzeltmezseniz aynen işlenir.` },
    { id: "cinsiyet-2", fieldId: "cinsiyet", fieldLabel: "Cinsiyet", column: "C", type: "uyari", row: 14, originalValue: "K", suggestedValue: "Kadın", message: `Cinsiyet: "K" değeri "Kadın" olarak eşleşti. Onaylarsanız formatı düzeltebiliriz, düzeltmezseniz aynen işlenir.` },
    { id: "kan-1", fieldId: "kan-grubu", fieldLabel: "Kan Grubu", column: "D", type: "uyari", row: 9, originalValue: "0RH+", suggestedValue: "0 Rh+", message: `Kan Grubu: "0RH+" formatı tutarsız — "0 Rh+" olarak yazılması önerilir.` },
    { id: "sgk-1", fieldId: "sgk-isyeri-no", fieldLabel: "SGK İşyeri No", column: "F", type: "uyari", row: 4, originalValue: "1234567-8", message: `SGK İşyeri No: "1234567-8" tire (-) karakteri içeriyor — yalnızca rakamlardan oluşması önerilir.` },
    { id: "sgk-2", fieldId: "sgk-isyeri-no", fieldLabel: "SGK İşyeri No", column: "F", type: "uyari", row: 22, originalValue: " 7654321", message: `SGK İşyeri No: değerin başında boşluk karakteri tespit edildi.` },
    { id: "kanun-1", fieldId: "kanun-no", fieldLabel: "Kanun No", column: "G", type: "guncelleme", row: 7, originalValue: "(boş)", newValue: "5510", message: `Kanun No boş bırakılmış, sistem varsayılan değer olan "5510"u otomatik uyguladı.` },
    { id: "kanun-2", fieldId: "kanun-no", fieldLabel: "Kanun No", column: "G", type: "guncelleme", row: 15, originalValue: "(boş)", newValue: "5510", message: `Kanun No boş bırakılmış, sistem varsayılan değer olan "5510"u otomatik uyguladı.` },
    { id: "kanun-3", fieldId: "kanun-no", fieldLabel: "Kanun No", column: "G", type: "guncelleme", row: 27, originalValue: "(boş)", newValue: "5510", message: `Kanun No boş bırakılmış, sistem varsayılan değer olan "5510"u otomatik uyguladı.` },
    { id: "uyruk-1", fieldId: "uyruk", fieldLabel: "Uyruğu", column: "E", type: "guncelleme", row: 10, originalValue: "(boş)", newValue: "TC", message: `Uyruğu boş bırakılmış, sistem varsayılan olarak "TC" atadı.` },
    { id: "uyruk-2", fieldId: "uyruk", fieldLabel: "Uyruğu", column: "E", type: "guncelleme", row: 16, originalValue: "(boş)", newValue: "TC", message: `Uyruğu boş bırakılmış, sistem varsayılan olarak "TC" atadı.` },
    { id: "uyruk-3", fieldId: "uyruk", fieldLabel: "Uyruğu", column: "E", type: "guncelleme", row: 21, originalValue: "(boş)", newValue: "TC", message: `Uyruğu boş bırakılmış, sistem varsayılan olarak "TC" atadı.` },
    { id: "uyruk-4", fieldId: "uyruk", fieldLabel: "Uyruğu", column: "E", type: "guncelleme", row: 33, originalValue: "(boş)", newValue: "TC", message: `Uyruğu boş bırakılmış, sistem varsayılan olarak "TC" atadı.` },
    { id: "ad-1", fieldId: "ad-soyad", fieldLabel: "Ad Soyad", column: "A", type: "guncelleme", row: 11, originalValue: " Mehmet  Demir ", newValue: "Mehmet Demir", message: `Ad Soyad alanındaki fazla boşluklar sistem tarafından otomatik temizlendi.` },
    { id: "ad-2", fieldId: "ad-soyad", fieldLabel: "Ad Soyad", column: "A", type: "guncelleme", row: 18, originalValue: " Ayşe Kara ", newValue: "Ayşe Kara", message: `Ad Soyad alanındaki fazla boşluklar sistem tarafından otomatik temizlendi.` }
  ]
}

const STARTER_KIT_SEVERITY_RANK = { hata: 0, uyari: 1, guncelleme: 2 }

function buildStarterKitFieldGroups(issues) {
  const order = []
  const map = new Map()
  issues.forEach((issue) => {
    if (!map.has(issue.fieldId)) {
      map.set(issue.fieldId, { fieldId: issue.fieldId, label: issue.fieldLabel, issues: [] })
      order.push(issue.fieldId)
    }
    map.get(issue.fieldId).issues.push(issue)
  })
  return order.map((fieldId) => {
    const group = map.get(fieldId)
    const worst = group.issues.reduce(
      (acc, issue) => (STARTER_KIT_SEVERITY_RANK[issue.type] < STARTER_KIT_SEVERITY_RANK[acc] ? issue.type : acc),
      "guncelleme"
    )
    return { ...group, severity: worst }
  })
}

function StarterKitValidationModal({ isOpen, file, onClose, onReupload, onSubmit }) {
  const [issues, setIssues] = useState([])
  const [activeFieldId, setActiveFieldId] = useState("")
  const [activeTypeFilter, setActiveTypeFilter] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    const nextIssues = generateStarterKitValidationIssues()
    setIssues(nextIssues)
    setActiveFieldId(nextIssues[0]?.fieldId || "")
    setActiveTypeFilter(null)
  }, [isOpen, file])

  if (!isOpen) return null

  const visibleIssues = activeTypeFilter ? issues.filter((issue) => issue.type === activeTypeFilter) : issues
  const groups = buildStarterKitFieldGroups(visibleIssues)
  const activeGroup = groups.find((group) => group.fieldId === activeFieldId) || groups[0] || null

  const totalsByType = { hata: 0, uyari: 0, guncelleme: 0 }
  issues.forEach((issue) => {
    totalsByType[issue.type] += 1
  })
  const totalIssues = issues.length
  const canSubmit = totalsByType.hata === 0

  function toggleTypeFilter(type) {
    setActiveTypeFilter((current) => (current === type ? null : type))
  }

  function handleReupload(e) {
    const nextFile = e.target.files?.[0]
    if (nextFile) onReupload(nextFile)
    e.target.value = ""
  }

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] px-4 py-6 backdrop-blur-[2px] lg:pl-[220px]">
      <div className="flex h-[88vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-[20px] border border-[#D7E0EC] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.2)]" onClick=${(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F7] px-6 py-4">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-[#98A2B3]">Dosya Yükle · İmplementasyon · Starter Kit Yükle</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick=${() => setActiveTypeFilter(null)}
                className=${classNames(
                  "inline-flex h-7 items-center rounded-full px-2.5 text-[12.5px] font-semibold transition",
                  !activeTypeFilter ? "bg-[#101828] text-white" : "text-[#101828] hover:bg-[#F2F4F7]"
                )}
              >
                Tümü (${totalIssues})
              </button>
              ${["hata", "uyari", "guncelleme"].map((type) => html`
                <button
                  key=${type}
                  type="button"
                  onClick=${() => toggleTypeFilter(type)}
                  title=${activeTypeFilter === type ? `${STARTER_KIT_ISSUE_TYPE_META[type].listLabel} filtresini kaldır` : `Yalnızca ${STARTER_KIT_ISSUE_TYPE_META[type].listLabel} göster`}
                  className=${classNames(
                    "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12.5px] font-medium transition",
                    activeTypeFilter === type
                      ? STARTER_KIT_ISSUE_TYPE_META[type].chipClass
                      : "border-[#D0D5DD] text-[#475467] hover:bg-[#F9FAFB]"
                  )}
                >
                  <span className=${classNames("h-2 w-2 rounded-full", STARTER_KIT_ISSUE_TYPE_META[type].dot)}></span>
                  ${STARTER_KIT_ISSUE_TYPE_META[type].listLabel} (${totalsByType[type]})
                </button>
              `)}
            </div>
            ${file?.name ? html`<p className="mt-1 truncate text-[12px] text-[#98A2B3]">${file.name}</p>` : null}
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <label className="inline-flex h-9 cursor-pointer items-center rounded-[9px] border border-[#D0D5DD] bg-white px-3 text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F9FAFB]">
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange=${handleReupload} />
              Yeniden Yükle
            </label>
            <button
              type="button"
              onClick=${onClose}
              aria-label="Modal kapat"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#D0D5DD] bg-white text-[#344054] transition hover:bg-[#F9FAFB]"
            >
              <${CloseIcon} />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="w-[280px] shrink-0 overflow-y-auto border-r border-[#EEF2F7] p-3">
            ${groups.length === 0 ? html`
              <p className="px-2 py-3 text-[12.5px] text-[#98A2B3]">Bu filtreye uygun kayıt yok.</p>
            ` : null}
            ${groups.map((group) => {
              const meta = STARTER_KIT_ISSUE_TYPE_META[group.severity]
              const groupResolved = group.issues.filter((issue) => issue.type === "guncelleme").length
              const isActive = activeGroup?.fieldId === group.fieldId
              return html`
                <button
                  key=${group.fieldId}
                  type="button"
                  onClick=${() => setActiveFieldId(group.fieldId)}
                  className=${classNames(
                    "mb-1.5 flex w-full flex-col items-start gap-1 rounded-[12px] border px-3.5 py-2.5 text-left transition",
                    isActive ? "border-[#2F6FED] bg-[#F5F8FF]" : "border-transparent hover:bg-[#F9FAFB]"
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-[13px] font-semibold text-[#101828]">
                      <span className=${classNames("h-2 w-2 shrink-0 rounded-full", meta.dot)}></span>
                      <span className="truncate">${group.label}</span>
                    </span>
                    <span className="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#F2F4F7] px-1.5 text-[11px] font-semibold text-[#475467]">${group.issues.length}</span>
                  </div>
                  <span className="text-[11.5px] text-[#98A2B3]">${groupResolved} / ${group.issues.length} · ${meta.label}</span>
                </button>
              `
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            ${activeGroup ? html`
              <div className="mb-4 flex items-center gap-2">
                <span className=${classNames("h-2.5 w-2.5 rounded-full", STARTER_KIT_ISSUE_TYPE_META[activeGroup.severity].dot)}></span>
                <h3 className="text-[16px] font-semibold text-[#101828]">${activeGroup.label}</h3>
                <span className="text-[13px] text-[#98A2B3]">${activeGroup.issues.length} kayıt</span>
              </div>
              <div className="space-y-3">
                ${activeGroup.issues.map((issue) => {
                  const meta = STARTER_KIT_ISSUE_TYPE_META[issue.type]
                  const isAuto = issue.type === "guncelleme"
                  return html`
                    <div key=${issue.id} className=${classNames("rounded-[14px] border px-4 py-3.5", meta.cardClass)}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-6 items-center rounded-full bg-[#101828] px-2.5 text-[11px] font-semibold text-white">Satır ${issue.row}</span>
                        ${!isAuto && issue.column ? html`<span className="inline-flex h-6 items-center rounded-full border border-[#D0D5DD] bg-white px-2.5 text-[11px] font-semibold text-[#344054]">Sütun ${issue.column}</span>` : null}
                        ${issue.originalValue ? html`<span className="text-[12px] font-medium text-[#B42318] line-through">${issue.originalValue}</span>` : null}
                        ${isAuto ? html`<span className="text-[12px] font-semibold text-[#2F6FED]">→ ${issue.newValue}</span>` : null}
                        <span className=${classNames("ml-auto inline-flex h-5 items-center rounded-full border px-2 text-[10.5px] font-semibold", meta.chipClass)}>${meta.label}</span>
                      </div>
                      <p className="mt-2 text-[13px] leading-5 text-[#475467]">${issue.message}</p>
                    </div>
                  `
                })}
              </div>
            ` : html`
              <p className="text-[12.5px] text-[#98A2B3]">Bu filtreye uygun kayıt yok.</p>
            `}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#EEF2F7] px-6 py-4">
          <span className=${classNames("text-[12.5px] font-medium", canSubmit ? "text-[#12B76A]" : "text-[#98A2B3]")}>
            ${canSubmit ? "Gönderime hazır." : `Dosyada ${totalsByType.hata} hata tespit edildi. Dosyanızı düzeltip "Yeniden Yükle" ile tekrar yükleyin.`}
          </span>
          <button
            type="button"
            disabled=${!canSubmit}
            onClick=${() => canSubmit && onSubmit()}
            className=${canSubmit
              ? "inline-flex h-10 items-center justify-center rounded-[12px] bg-[#2F6FED] px-4 text-[13px] font-semibold text-white transition hover:bg-[#2563CC]"
              : "inline-flex h-10 cursor-not-allowed items-center justify-center rounded-[12px] bg-[#F2F4F7] px-4 text-[13px] font-semibold text-[#98A2B3]"}
          >
            Gözden geçir ve gönder
          </button>
        </div>
      </div>
    </div>
  `
}

function ImplementationScreen({ companyName, assignee, companyUsers, userRole, hasGE, hasAccountingReport }) {
  const [activeStepId, setActiveStepId] = useState(implementationDemoInitialStepId)
  // stepUploads: stepId → { status, docs: { [docId]: upload[] }, docStatuses, docReasons }
  const [stepUploads, setStepUploads] = useState(() => createImplementationDemoStepUploads())
  // customDocuments: stepId → [{ id, label, responseType, templateUrl, templateName, description }] — sonradan eklenen yanıt alanları
  const [customDocuments, setCustomDocuments] = useState({})
  // removedDefaultDocIds: stepId → [docId, ...] — şablonda varsayılan olarak gelen ama kaldırılan alanlar
  const [removedDefaultDocIds, setRemovedDefaultDocIds] = useState({})
  const rejectReasonSuggestionUsageRef = useRef({})
  const [dragStepId, setDragStepId] = useState("")
  const [expandedUploadDocIds, setExpandedUploadDocIds] = useState({})
  const [rejectComposer, setRejectComposer] = useState({
    stepId: "",
    docId: "",
    docLabel: "",
    reason: "",
    exampleFiles: []
  })
  const [messages, setMessages] = useState(() => {
    return buildImplementationDemoMessages(assignee || "Implementasyon Ekibi", companyUsers || [])
  })
  const [chatDraft, setChatDraft] = useState("")
  // pendingStarterKitUpload: Starter Kit dosyası seçildiğinde asıl yüklemeden önce validasyon ekranında bekletilir
  const [pendingStarterKitUpload, setPendingStarterKitUpload] = useState(null)

  useEffect(() => {
    try {
      const stagesSnapshot = Object.fromEntries(Object.entries(implementationStepTemplates).map(([stepId, template]) => {
        const uploadState = stepUploads[stepId] || implementationEmptyStepUploadSeeds[stepId] || {}
        const removedIds = removedDefaultDocIds[stepId] || []
        const documents = [...template.documents, ...(customDocuments[stepId] || [])]
          .filter(documentItem => !removedIds.includes(documentItem.id))
          .map(documentItem => {
            const uploads = getDocUploads(uploadState.docs?.[documentItem.id])
            const latestUpload = uploads[uploads.length - 1] || null
            const reviewStatus = uploadState.docStatuses?.[documentItem.id] || latestUpload?.reviewStatus
            let status = "missing"

            if (reviewStatus === "approved") status = "approved"
            else if (reviewStatus === "rejected") status = "rejected"
            else if (uploads.length > 1 && uploadState.pendingReviewDocIds?.includes(documentItem.id)) status = "revised"
            else if (uploadState.status === "pending_approval" && uploadState.pendingReviewDocIds?.includes(documentItem.id)) status = "submitted"
            else if (uploads.length > 0) status = "uploaded"

            return { id: documentItem.id, required: true, status }
          })

        return [stepId, { documents }]
      }))

      window.localStorage.setItem(IMPLEMENTATION_DOCUMENT_STATE_KEY, JSON.stringify({ stages: stagesSnapshot }))
      window.dispatchEvent(new CustomEvent("implementation-document-state-updated"))
    } catch (_) {
      // Doküman ekranı, tarayıcı depolaması kapalı olsa da kendi state'iyle çalışmaya devam eder.
    }
  }, [stepUploads, customDocuments, removedDefaultDocIds])

  const isStepEnabled = (step) => {
    if (step.id === "implementation-report") return hasGE !== false
    if (step.id === "transition-call") return hasAccountingReport !== false
    return true
  }

  const steps = useMemo(
    () => implementationBaseSteps.map((step, index) => {
      const enabled = isStepEnabled(step)
      const upload = stepUploads[step.id]
      const uploadStatus = upload ? upload.status : "waiting"
      const isCompleted = enabled && (uploadStatus === "completed" || uploadStatus === "approved")
      const prevEnabledStep = implementationBaseSteps.slice(0, index).reverse().find((s) => isStepEnabled(s))
      const isSelectable = enabled && (
        index === 0 ||
        isCompleted ||
        !prevEnabledStep ||
        ["completed", "approved"].includes(stepUploads[prevEnabledStep.id]?.status)
      )
      const displayStatus = !enabled
        ? "disabled"
        : isCompleted
        ? "completed"
        : step.id === activeStepId
        ? "in_progress"
        : "not_started"
      return {
        ...step,
        status: displayStatus,
        isSelectable,
        uploadStatus,
        completedDate: upload?.completedDate || step.completedDate
      }
    }),
    [activeStepId, stepUploads, hasGE, hasAccountingReport]
  )

  const completedCount = Object.values(stepUploads).filter((u) => u.status === "completed" || u.status === "approved").length
  const overallProgress = Math.round((completedCount / implementationBaseSteps.length) * 100)
  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0]

  function currentActor() {
    if (userRole === "editor") {
      const u = companyUsers[0]
      return u ? { name: `${u.firstName} ${u.lastName}`, initials: `${u.firstName[0]}${u.lastName[0]}`, color: "bg-[#F4F3FF] text-[#5925DC]" } : { name: "Düzenleyici", initials: "DZ", color: "bg-[#F4F3FF] text-[#5925DC]" }
    }
    if (userRole === "viewer") {
      const u = companyUsers[1]
      return u ? { name: `${u.firstName} ${u.lastName}`, initials: `${u.firstName[0]}${u.lastName[0]}`, color: "bg-[#F0FDF4] text-[#16A34A]" } : { name: "Görüntüleyici", initials: "GR", color: "bg-[#F0FDF4] text-[#16A34A]" }
    }
    const name = assignee || "Implementasyon Ekibi"
    return { name, initials: name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(), color: "bg-[#EFF4FF] text-[#2F6FED]" }
  }

  function appendSystemMessage(text, subtype) {
    const actor = currentActor()
    setMessages((current) => [
      ...current,
      {
        id: `system-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: "system",
        stepId: activeStepId,
        subtype: subtype || "upload",
        text,
        actor,
        time: formatChatTime()
      }
    ])
  }

  function createImplementationNote(text, extra = {}) {
    const author = assignee || "Implementasyon Ekibi"
    const avatar = author.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    return {
      id: `implementation-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: "implementation",
      stepId: extra.stepId || activeStepId,
      author,
      avatar,
      text,
      time: formatChatTime(),
      ...extra
    }
  }

  useEffect(() => {
    const stepIntro = implementationStepIntroMessages[activeStepId]
    if (!stepIntro) return

    setMessages((current) => {
      const alreadyExists = current.some(
        (message) => message.messageVariant === "step_intro" && message.stepIntroId === activeStepId
      )

      if (alreadyExists) return current

      return [
        ...current,
        createImplementationNote(stepIntro.text, {
          stepId: activeStepId,
          messageVariant: "step_intro",
          stepIntroId: activeStepId,
          attachments: Array.isArray(stepIntro.attachments) ? stepIntro.attachments : []
        })
      ]
    })
  }, [activeStepId])

  function getRevisionReasonItems(reason) {
    const lines = String(reason || "")
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)

    if (lines.length === 0) {
      return [{ type: "bullet", text: "Revize edilmesi gereken alanlar bulunuyor." }]
    }

    return normalizeRevisionItems(lines)
  }

  function getReasonSummaryText(reason) {
    return String(reason || "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/^[-*•]\s*/gm, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  function createRevisionEntry(stepId, docId, docLabel, reason, uploadedFileName, exampleFiles) {
    return {
      id: `${stepId}-${docId}`,
      docId,
      docLabel,
      fileName: uploadedFileName || "",
      revisionItems: getRevisionReasonItems(reason),
      relatedDocument: exampleFiles && exampleFiles.length > 0 ? null : { stepId, docId, docLabel },
      attachments: Array.isArray(exampleFiles) ? exampleFiles : []
    }
  }

  function createRevisionChatMessage(revisionEntries) {
    const entries = Array.isArray(revisionEntries) ? revisionEntries.filter(Boolean) : []
    const firstEntry = entries[0] || createRevisionEntry("", "", "İlgili belge", "", "", [])
    const messageStepId = firstEntry.relatedDocument?.stepId || activeStepId
    return createImplementationNote(
      entries.length > 1
        ? `${entries.length} dosya için revizyon talebi oluşturuldu.`
        : `${firstEntry.docLabel} için revizyon talebi oluşturuldu.`,
      {
        stepId: messageStepId,
        messageVariant: "revision_request",
        revisionEntries: entries.length > 0 ? entries : [firstEntry],
        revisionDocLabel: firstEntry.docLabel,
        revisionFileName: firstEntry.fileName || "",
        revisionItems: firstEntry.revisionItems,
        revisionActionText: "Güncellenen dosyayı tekrar yükleyip onaya gönderebilirsiniz.",
        relatedDocument: firstEntry.relatedDocument || null,
        attachments: firstEntry.attachments || []
      }
    )
  }

  function createApprovalChatMessage(stepId, approvedDocs = [], stepDocs = {}) {
    const docsToMention = Array.isArray(approvedDocs) ? approvedDocs.filter(Boolean) : []
    const firstDoc = docsToMention[0] || null
    const firstDocUploads = firstDoc ? getDocUploads(stepDocs[firstDoc.id]) : []
    const firstDocFileName = firstDocUploads.length > 0 ? firstDocUploads[firstDocUploads.length - 1].name : ""
    const approvalEntries = docsToMention.map((doc, index) => {
      const uploads = getDocUploads(stepDocs[doc.id])
      const latestUpload = uploads.length > 0 ? uploads[uploads.length - 1] : null
      return {
        id: `${stepId}-${doc.id}-approval-${index}`,
        docId: doc.id,
        docLabel: doc.label,
        fileName: latestUpload?.name || "",
        relatedDocument: { stepId, docId: doc.id, docLabel: doc.label, fileName: latestUpload?.name || "" },
        approvalText: "Dosya kontrol edildi ve bu versiyon onaylandı."
      }
    })
    const text = firstDoc && docsToMention.length === 1
      ? `${firstDoc.label} belgesi onaylandı.`
      : `Gönderdiğiniz ${docsToMention.length} belge onaylandı.`

    return createImplementationNote(text, {
      stepId,
      messageVariant: "approval_notice",
      approvalCount: docsToMention.length,
      approvalEntries,
      approvalDocLabel: firstDoc?.label || "",
      approvalFileName: firstDocFileName,
      relatedDocument: firstDoc && docsToMention.length === 1
        ? { stepId, docId: firstDoc.id, docLabel: firstDoc.label, fileName: firstDocFileName }
        : null
    })
  }

  function createStageTransitionMessage(stepId) {
    const stepIndex = implementationBaseSteps.findIndex((step) => step.id === stepId)
    const currentStep = stepIndex >= 0 ? implementationBaseSteps[stepIndex] : null
    const nextStep = stepIndex >= 0 ? implementationBaseSteps[stepIndex + 1] || null : null

    if (!nextStep) {
      return createImplementationNote(`${currentStep?.title || "Bu stage"} tamamlandı.`, { stepId })
    }

    return createImplementationNote(
      `${currentStep?.title || "Bu stage"} tamamlandı.\n${nextStep.title} aşamasına geçiyoruz. Bu alan artık yalnızca görüntülenebilir.`,
      { stepId }
    )
  }

  function handleDocUpload(stepId, docId, files) {
    const nextFiles = Array.isArray(files) ? files.filter(Boolean) : []
    if (nextFiles.length === 0) return
    if (stepUploads[stepId]?.docStatuses?.[docId] === "approved") return
    const uploadEntries = nextFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      uploadedAt: formatTimestamp(),
      downloadUrl: URL.createObjectURL(file),
      reviewStatus: null,
      reviewReason: "",
      reviewedAt: ""
    }))
    setStepUploads((current) => {
      if (current[stepId]?.docStatuses?.[docId] === "approved") return current
      const currentStep = current[stepId]
      return {
        ...current,
        [stepId]: {
          ...currentStep,
          status: currentStep.status === "revision_requested"
            ? "revision_requested"
            : currentStep.submitted
              ? currentStep.status
              : "uploaded",
          docs: {
            ...currentStep.docs,
            [docId]: [...getDocUploads(currentStep.docs?.[docId]), ...uploadEntries]
          },
          docStatuses: Object.fromEntries(Object.entries(currentStep.docStatuses || {}).filter(([key]) => key !== docId)),
          docReasons: Object.fromEntries(Object.entries(currentStep.docReasons || {}).filter(([key]) => key !== docId))
        }
      }
    })
    if (rejectComposer.stepId === stepId && rejectComposer.docId === docId) {
      closeRejectComposer()
    }
    // feed'e bireysel yükleme logu gönderilmez; sadece onaya gönderince özet gider
  }

  function handleSubmitForApproval(stepId) {
    if (stepId === "integrations") {
      setStepUploads((current) => ({
        ...current,
        integrations: { ...current.integrations, status: "pending_approval", submitted: true }
      }))
      return
    }
    const step = stepUploads[stepId]
    const tpl = implementationStepTemplates[stepId]
    const allStepDocuments = [...tpl.documents, ...(customDocuments[stepId] || [])]
      .filter((doc) => !(removedDefaultDocIds[stepId] || []).includes(doc.id))
    const requiredRevisionDocIds = step?.status === "revision_requested"
      ? (
          Array.isArray(step?.requiredRevisionDocIds) && step.requiredRevisionDocIds.length > 0
            ? step.requiredRevisionDocIds
            : Object.keys(step?.docStatuses || {}).filter((docId) => step.docStatuses?.[docId] === "rejected")
        )
      : []
    const pendingRevisionUploadCount = requiredRevisionDocIds.filter((docId) => {
      const uploads = getDocUploads(step.docs?.[docId])
      const latestUpload = uploads[uploads.length - 1] || null
      return !latestUpload || latestUpload.reviewStatus === "rejected"
    }).length
    if (step?.status === "revision_requested" && pendingRevisionUploadCount > 0) return
    const docsToSubmit = step?.status === "revision_requested"
      ? allStepDocuments.filter((doc) => requiredRevisionDocIds.includes(doc.id))
      : allStepDocuments.filter((doc) => getDocUploads(step.docs?.[doc.id]).length > 0)
    const docIdsToSubmit = docsToSubmit.map((doc) => doc.id)
    const uploadedFiles = docsToSubmit.flatMap((doc) =>
      getDocUploads(step.docs?.[doc.id]).filter((upload) => !upload.reviewStatus)
    )
    if (uploadedFiles.length === 0) return
    const actor = currentActor()
    const now = formatChatTime()
    setStepUploads((current) => {
      const currentStep = current[stepId]
      const preservedApprovedStatuses = Object.fromEntries(
        Object.entries(currentStep.docStatuses || {}).filter(([, statusValue]) => statusValue === "approved")
      )
      return {
        ...current,
        [stepId]: {
          ...currentStep,
          status: "pending_approval",
          submitted: true,
          pendingReviewDocIds: docIdsToSubmit,
          requiredRevisionDocIds: [],
          docStatuses: preservedApprovedStatuses,
          docReasons: {}
        }
      }
    })
    if (rejectComposer.stepId === stepId) {
      closeRejectComposer()
    }
    // Her dosya için ayrı satır + özet pill
    const fileEntries = uploadedFiles.map((f, i) => ({
      id: `system-file-${Date.now()}-${i}`,
      type: "system",
      stepId,
      subtype: "upload",
      text: f.name,
      fileDate: f.uploadedAt,
      actor,
      time: now
    }))
    const summaryEntry = {
      id: `system-submit-${Date.now()}`,
      type: "system",
      stepId,
      subtype: "submit",
      text: `${uploadedFiles.length} dosya onaya gönderildi`,
      actor,
      time: now
    }
    setMessages((current) => [...current, ...fileEntries, summaryEntry])
  }

  function handleApproveDoc(stepId, docId) {
    const reviewedAt = formatTimestamp()
    const reviewBatchId = `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setStepUploads((current) => ({
      ...current,
      [stepId]: {
        ...current[stepId],
        docs: {
          ...current[stepId].docs,
          [docId]: updateUnreviewedUploadedFiles(current[stepId].docs?.[docId], {
            reviewStatus: "approved",
            reviewReason: "",
            reviewedAt,
            reviewBatchId
          })
        },
        docStatuses: { ...(current[stepId].docStatuses || {}), [docId]: "approved" },
        docReasons: Object.fromEntries(Object.entries(current[stepId].docReasons || {}).filter(([key]) => key !== docId))
      }
    }))
  }

  function handleAddCustomDocument(stepId, { label, responseType = "file", file, description }) {
    const id = `custom-${stepId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const isFileResponse = responseType === "file"
    const templateUrl = isFileResponse && file ? URL.createObjectURL(file) : null
    setCustomDocuments((current) => ({
      ...current,
      [stepId]: [...(current[stepId] || []), {
        id,
        label,
        responseType,
        templateUrl,
        templateName: isFileResponse && file ? file.name : null,
        description: description || "",
        isCustom: true
      }]
    }))
    if (stepUploads[stepId]?.status === "revision_requested") {
      setStepUploads((current) => ({
        ...current,
        [stepId]: {
          ...current[stepId],
          requiredRevisionDocIds: [...new Set([...(current[stepId].requiredRevisionDocIds || []), id])]
        }
      }))
    }
  }

  function handleDocTextResponse(stepId, docId, value) {
    const textValue = String(value || "")
    setStepUploads((current) => {
      const currentStep = current[stepId]
      const nextDocs = { ...currentStep.docs }
      if (!textValue.trim()) {
        delete nextDocs[docId]
      } else {
        nextDocs[docId] = [{
          id: `text-${docId}`,
          name: "Metin yanıtı",
          kind: "text",
          text: textValue,
          uploadedAt: formatTimestamp(),
          reviewStatus: null,
          reviewReason: "",
          reviewedAt: ""
        }]
      }
      return {
        ...current,
        [stepId]: {
          ...currentStep,
          status: currentStep.submitted ? currentStep.status : Object.keys(nextDocs).length > 0 ? "uploaded" : "waiting",
          docs: nextDocs,
          docStatuses: Object.fromEntries(Object.entries(currentStep.docStatuses || {}).filter(([key]) => key !== docId)),
          docReasons: Object.fromEntries(Object.entries(currentStep.docReasons || {}).filter(([key]) => key !== docId))
        }
      }
    })
  }

  function handleRemoveCustomDocument(stepId, docId) {
    setCustomDocuments((current) => ({
      ...current,
      [stepId]: (current[stepId] || []).filter((doc) => doc.id !== docId)
    }))
    setStepUploads((current) => {
      const currentStep = current[stepId]
      const nextDocs = { ...currentStep.docs }
      delete nextDocs[docId]
      return {
        ...current,
        [stepId]: {
          ...currentStep,
          docs: nextDocs,
          requiredRevisionDocIds: (currentStep.requiredRevisionDocIds || []).filter((id) => id !== docId),
          pendingReviewDocIds: (currentStep.pendingReviewDocIds || []).filter((id) => id !== docId),
          docStatuses: Object.fromEntries(Object.entries(currentStep.docStatuses || {}).filter(([id]) => id !== docId)),
          docReasons: Object.fromEntries(Object.entries(currentStep.docReasons || {}).filter(([id]) => id !== docId))
        }
      }
    })
  }

  function handleRemoveDocument(stepId, doc) {
    if (doc.isCustom) {
      handleRemoveCustomDocument(stepId, doc.id)
    } else {
      setRemovedDefaultDocIds((current) => ({
        ...current,
        [stepId]: [...(current[stepId] || []), doc.id]
      }))
    }
  }

  function handleResetDoc(stepId, docId) {
    setStepUploads((current) => {
      const updated = { ...(current[stepId].docStatuses || {}) }
      const updatedReasons = { ...(current[stepId].docReasons || {}) }
      delete updated[docId]
      delete updatedReasons[docId]
      return {
        ...current,
        [stepId]: {
          ...current[stepId],
          docs: {
            ...current[stepId].docs,
            [docId]: resetLatestReviewedUploadBatch(current[stepId].docs?.[docId])
          },
          docStatuses: updated,
          docReasons: updatedReasons
        }
      }
    })
  }

  function handleRejectDoc(stepId, docId, reason, exampleFiles) {
    const reviewedAt = formatTimestamp()
    const reviewBatchId = `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setStepUploads((current) => ({
      ...current,
      [stepId]: {
        ...current[stepId],
        docs: {
          ...current[stepId].docs,
          [docId]: updateUnreviewedUploadedFiles(current[stepId].docs?.[docId], {
            reviewStatus: "rejected",
            reviewReason: reason,
            reviewedAt,
            reviewBatchId
          })
        },
        docStatuses: { ...(current[stepId].docStatuses || {}), [docId]: "rejected" },
        docReasons: { ...(current[stepId].docReasons || {}), [docId]: reason },
        docExampleFiles: { ...(current[stepId].docExampleFiles || {}), [docId]: exampleFiles || [] }
      }
    }))
  }

  function openRejectComposer(stepId, docId, docLabel) {
    const usageKey = getDocUploadStateKey(stepId, docId)
    const nextVariantIndex = rejectReasonSuggestionUsageRef.current[usageKey] || 0
    const suggestedReason = getImplementationRejectReasonSuggestion(stepId, docId, docLabel, nextVariantIndex)

    rejectReasonSuggestionUsageRef.current[usageKey] = nextVariantIndex + 1

    setRejectComposer({
      stepId,
      docId,
      docLabel,
      reason: suggestedReason,
      exampleFiles: []
    })
  }

  function closeRejectComposer() {
    setRejectComposer({
      stepId: "",
      docId: "",
      docLabel: "",
      reason: "",
      exampleFiles: []
    })
  }

  function confirmRejectComposer() {
    if (!rejectComposer.reason.trim()) return
    handleRejectDoc(rejectComposer.stepId, rejectComposer.docId, rejectComposer.reason.trim(), rejectComposer.exampleFiles || [])
    closeRejectComposer()
  }

  function setRejectComposerReason(reason) {
    setRejectComposer((current) => ({ ...current, reason }))
  }

  function setRejectComposerExampleFiles(files) {
    setRejectComposer((current) => ({ ...current, exampleFiles: files }))
  }

  function handleSendDecisions(stepId) {
    const step = stepUploads[stepId]
    const tpl = implementationStepTemplates[stepId]
    const docStatuses = step.docStatuses || {}
    const docReasons = step.docReasons || {}
    const docs = step.docs || {}
    const allStepDocuments = [...tpl.documents, ...(customDocuments[stepId] || [])]
      .filter((doc) => !(removedDefaultDocIds[stepId] || []).includes(doc.id))
    const reviewDocIds = Array.isArray(step.pendingReviewDocIds) && step.pendingReviewDocIds.length > 0
      ? step.pendingReviewDocIds.filter((docId) => getDocUploads(docs[docId]).length > 0)
      : allStepDocuments
          .filter((doc) => getDocUploads(docs[doc.id]).length > 0 && !docStatuses[doc.id])
          .map((doc) => doc.id)
    const reviewDocs = allStepDocuments.filter((doc) => reviewDocIds.includes(doc.id))
    const approvedDocs = reviewDocs.filter((doc) => docStatuses[doc.id] === "approved")
    const rejectedDocs = reviewDocs.filter((doc) => docStatuses[doc.id] === "rejected")
    const allApproved = rejectedDocs.length === 0 && approvedDocs.length === reviewDocIds.length && reviewDocIds.length > 0
    const allStepDocsApproved = allStepDocuments.every((doc) => {
      const uploads = getDocUploads(docs[doc.id])
      return uploads.length > 0 && docStatuses[doc.id] === "approved"
    })

    if (allApproved) {
      setStepUploads((current) => ({
        ...current,
        [stepId]: {
          ...current[stepId],
          status: allStepDocsApproved ? "docs_approved" : "uploaded",
          submitted: false,
          pendingReviewDocIds: [],
          requiredRevisionDocIds: [],
          docReasons: {}
        }
      }))
      appendSystemMessage(`${approvedDocs.length} belge onaylandı`, "approve")
      setMessages((current) => [...current, createApprovalChatMessage(stepId, approvedDocs, docs)])
    } else {
      setStepUploads((current) => ({
        ...current,
        [stepId]: {
          ...current[stepId],
          status: "revision_requested",
          submitted: false,
          pendingReviewDocIds: [],
          requiredRevisionDocIds: rejectedDocs.map((doc) => doc.id)
        }
      }))
      const lines = [
        ...approvedDocs.map(d => `✓ ${d.label}`),
        ...rejectedDocs.map(d => `✗ ${d.label}${docReasons[d.id] ? ` — ${getReasonSummaryText(docReasons[d.id])}` : ""}`)
      ].join(", ")
      appendSystemMessage(`Karar gönderildi: ${lines}`, rejectedDocs.length > 0 ? "revision" : "approve")
      const nextDecisionMessages = []
      if (approvedDocs.length > 0) {
        nextDecisionMessages.push(createApprovalChatMessage(stepId, approvedDocs, docs))
      }
      if (rejectedDocs.length > 0) {
        const docExampleFiles = step.docExampleFiles || {}
        const revisionEntries = rejectedDocs.map((doc) => {
          const uploads = getDocUploads(docs[doc.id])
          const uploadedFileName = uploads.length > 0 ? uploads[uploads.length - 1].name : null
          return createRevisionEntry(stepId, doc.id, doc.label, docReasons[doc.id], uploadedFileName, docExampleFiles[doc.id])
        })
        nextDecisionMessages.push(createRevisionChatMessage(revisionEntries))
      }
      if (nextDecisionMessages.length > 0) {
        setMessages((current) => [...current, ...nextDecisionMessages])
      }
    }
  }

  function handleCompleteStep(stepId) {
    const stepIndex = implementationBaseSteps.findIndex((step) => step.id === stepId)
    const nextStep = stepIndex >= 0
      ? implementationBaseSteps.slice(stepIndex + 1).find((s) => isStepEnabled(s)) || null
      : null

    setStepUploads((current) => ({
      ...current,
      [stepId]: {
        ...current[stepId],
        status: "completed",
        completedDate: implementationBaseSteps[stepIndex]?.completedDate || current[stepId]?.completedDate || ""
      }
    }))
    appendSystemMessage(`${implementationBaseSteps[stepIndex]?.title || "Stage"} tamamlandı`, "approve")
    setMessages((current) => [...current, createStageTransitionMessage(stepId)])
    if (nextStep) {
      setActiveStepId(nextStep.id)
    }
  }

  function handleApprove(stepId) {
    setStepUploads((current) => ({
      ...current,
      [stepId]: { ...current[stepId], status: "docs_approved", submitted: false }
    }))
    appendSystemMessage("Belgeler onaylandı", "approve")
  }

  function handleRequestRevision(stepId) {
    setStepUploads((current) => ({
      ...current,
      [stepId]: { ...current[stepId], status: "revision_requested", submitted: false }
    }))
    appendSystemMessage("Revizyon talep edildi", "revision")
  }

  function handleLiveHazirliklarSendDecisions({ approvedItems, revisionItems }) {
    const allApproved = revisionItems.length === 0
    setStepUploads((current) => ({
      ...current,
      integrations: { ...current.integrations, status: allApproved ? "docs_approved" : "revision_requested", submitted: false }
    }))
    const nextMessages = []
    if (approvedItems.length > 0) {
      const approvedDocs = approvedItems.map((item) => ({ id: item.id, label: item.title }))
      nextMessages.push(createApprovalChatMessage("integrations", approvedDocs, {}))
    }
    if (revisionItems.length > 0) {
      const revisionEntries = revisionItems.map((item) =>
        createRevisionEntry("integrations", item.id, item.title, item.reason || "", null, [])
      )
      nextMessages.push(createRevisionChatMessage(revisionEntries))
    }
    if (nextMessages.length > 0) {
      setMessages((current) => [...current, ...nextMessages])
    }
    const lines = [
      ...approvedItems.map((i) => `✓ ${i.title}`),
      ...revisionItems.map((i) => `✗ ${i.title}`)
    ].join(", ")
    appendSystemMessage(`Karar gönderildi: ${lines}`, revisionItems.length > 0 ? "revision" : "approve")
  }

  function handleFileSelected(stepId, docId, e) {
    const files = Array.from(e.target.files || [])
    if (docId === "doc-starter-kit" && files[0]) {
      setPendingStarterKitUpload({ stepId, docId, file: files[0] })
      e.target.value = ""
      return
    }
    handleDocUpload(stepId, docId, files)
    e.target.value = ""
  }

  function handleFileDropped(stepId, docId, e) {
    e.preventDefault()
    setDragStepId("")
    const files = Array.from(e.dataTransfer.files || [])
    if (docId === "doc-starter-kit" && files[0]) {
      setPendingStarterKitUpload({ stepId, docId, file: files[0] })
      return
    }
    handleDocUpload(stepId, docId, files)
  }

  function toggleUploadList(stepId, docId) {
    const key = getDocUploadStateKey(stepId, docId)
    setExpandedUploadDocIds((current) => ({
      ...current,
      [key]: !current[key]
    }))
  }

  function handleSendMessage(attachments = []) {
    if (!chatDraft.trim() && attachments.length === 0) return
    let author, avatar
    if (userRole === "imp_ekibi" || !userRole) {
      author = assignee || "Implementasyon Ekibi"
      avatar = author.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    } else if (userRole === "editor") {
      const u = companyUsers[0]
      author = u ? `${u.firstName} ${u.lastName}` : "Düzenleyici"
      avatar = u ? `${u.firstName[0]}${u.lastName[0]}` : "DZ"
    } else {
      const u = companyUsers[1]
      author = u ? `${u.firstName} ${u.lastName}` : "Görüntüleyici"
      avatar = u ? `${u.firstName[0]}${u.lastName[0]}` : "GR"
    }
    setMessages((current) => [
      ...current,
      {
        id: `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: userRole === "imp_ekibi" ? "implementation" : "client",
        stepId: activeStepId,
        author,
        avatar,
        text: chatDraft.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
        time: formatChatTime()
      }
    ])
    setChatDraft("")
  }

  return html`
    <div className="space-y-8">
      <${RejectComposerModal}
        rejectComposer=${rejectComposer}
        onRejectReasonChange=${setRejectComposerReason}
        onRejectExampleFilesChange=${setRejectComposerExampleFiles}
        onCancelReject=${closeRejectComposer}
        onConfirmReject=${confirmRejectComposer}
      />

      <${StarterKitValidationModal}
        isOpen=${Boolean(pendingStarterKitUpload)}
        file=${pendingStarterKitUpload?.file || null}
        onClose=${() => setPendingStarterKitUpload(null)}
        onReupload=${(file) => setPendingStarterKitUpload((current) => current ? { ...current, file } : current)}
        onSubmit=${() => {
          if (!pendingStarterKitUpload) return
          handleDocUpload(pendingStarterKitUpload.stepId, pendingStarterKitUpload.docId, [pendingStarterKitUpload.file])
          setPendingStarterKitUpload(null)
        }}
      />

      <${ImplementationTimeline}
        steps=${steps}
        activeStepId=${activeStepId}
        onStepChange=${setActiveStepId}
        progress=${overallProgress}
      />

      ${activeStep?.id === "integrations"
        ? html`<${LiveHazirliklarContent}
            stepUpload=${stepUploads["integrations"]}
            userRole=${userRole}
            assignee=${assignee}
            onSubmitForApproval=${() => handleSubmitForApproval(activeStep.id)}
            onSendDecisions=${handleLiveHazirliklarSendDecisions}
            onCompleteStep=${() => handleCompleteStep(activeStep.id)}
            onSendMessage=${(text) => setMessages((prev) => [...prev, createImplementationNote(text, { stepId: "integrations" })])}
          />`
        : activeStep?.id === "operations-handover"
        ? html`<${GoLiveTransitionContent}
            stepUpload=${stepUploads["operations-handover"]}
            userRole=${userRole}
            onCompleteStep=${() => handleCompleteStep(activeStep.id)}
            companyName=${companyName}
          />`
        : html`<${ImplementationStepContent}
            activeStep=${activeStep}
            stepUpload=${stepUploads[activeStep.id]}
            dragDocId=${dragStepId}
            rejectComposer=${rejectComposer}
            expandedUploadDocIds=${expandedUploadDocIds}
            onFileSelected=${(docId, e) => handleFileSelected(activeStep.id, docId, e)}
            onFileDropped=${(docId, e) => handleFileDropped(activeStep.id, docId, e)}
            onDragStateChange=${setDragStepId}
            onSubmitForApproval=${() => handleSubmitForApproval(activeStep.id)}
            onApprove=${() => handleApprove(activeStep.id)}
            onRequestRevision=${() => handleRequestRevision(activeStep.id)}
            onApproveDoc=${(docId) => handleApproveDoc(activeStep.id, docId)}
            onRejectDoc=${(docId, docLabel) => openRejectComposer(activeStep.id, docId, docLabel)}
            onToggleUploadList=${(docId) => toggleUploadList(activeStep.id, docId)}
            onResetDoc=${(docId) => handleResetDoc(activeStep.id, docId)}
            onCompleteStep=${() => handleCompleteStep(activeStep.id)}
            onSendDecisions=${() => handleSendDecisions(activeStep.id)}
            userRole=${userRole}
            customDocuments=${customDocuments[activeStep.id] || []}
            removedDocIds=${removedDefaultDocIds[activeStep.id] || []}
            onTextResponse=${(docId, value) => handleDocTextResponse(activeStep.id, docId, value)}
            onAddCustomDocument=${(payload) => handleAddCustomDocument(activeStep.id, payload)}
            onRemoveDocument=${(doc) => handleRemoveDocument(activeStep.id, doc)}
          />`
      }

      <${ImplementationMessageFeed}
        messages=${messages}
        draft=${chatDraft}
        onDraftChange=${setChatDraft}
        onSend=${handleSendMessage}
        companyName=${companyName}
        assignee=${assignee}
        steps=${steps}
        stepUploads=${stepUploads}
        activeStepId=${activeStepId}
        onStepChange=${setActiveStepId}
        onMeetingCreated=${(msg) => setMessages(prev => [...prev, msg])}
        companyUsers=${companyUsers}
        userRole=${userRole}
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
                  ? "Canlıya Geçiş"
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

                const visiblePipelineSteps = implementationBaseSteps
                  .map((step, idx) => ({ step, idx, label: displayNames[idx] }))
                  .filter(({ idx }) => (idx === 0 || idx === 1 || idx === 4 || idx === 5) || (idx === 2 ? company.hasGE : company.hasAccountingReport))
                const currentVisibleIndex = Math.max(0, visiblePipelineSteps.findIndex(({ idx }) => idx === company.currentStepIndex))
                const completedWidth = isCompleted
                  ? 100
                  : visiblePipelineSteps.length > 1
                    ? (currentVisibleIndex / (visiblePipelineSteps.length - 1)) * 100
                    : 0

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
                          ${visiblePipelineSteps.map(({ step, idx, label }) => {
                            const stepIsCompleted = idx < company.currentStepIndex || isCompleted
                            const stepIsCurrent = idx === company.currentStepIndex && !isCompleted

                            return html`
                              <div key=${step.id} className="flex flex-col items-center flex-1">
                                <div className=${classNames(
                                  "w-[10px] h-[10px] rounded-full z-10 transition-colors duration-200 border-[1.5px]",
                                  stepIsCompleted
                                    ? "bg-[#12B76A] border-[#12B76A]"
                                    : stepIsCurrent
                                      ? "bg-white border-[#1570EF] ring-4 ring-[#EFF8FF]"
                                      : "bg-white border-[#D0D5DD]"
                                )}></div>
                                <span className=${classNames(
                                  "mt-1.5 text-[9.5px] font-semibold text-center transition-colors duration-200",
                                  stepIsCompleted ? "text-[#344054]" : "text-[#98A2B3]"
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
          border: value ? "1px solid var(--color-success-border)" : "1px solid var(--color-border)"}}>
        ● Aktif
      </button>
      <button type="button" onClick=${() => onChange(false)}
        style=${{fontSize:"12px",fontWeight:600,padding:"3px 10px",borderRadius:"999px",cursor:"pointer",
          background: !value ? "var(--color-surface-3)" : "transparent",
          color: !value ? "var(--color-text-2)" : "var(--color-text-3)",
          border: "1px solid var(--color-border)"}}>
        ○ Pasif
      </button>
    </div>
  `
}

function CalendarDateField({ value, placeholder = "", disabled = false, onChange, className = "" }) {
  const { useEffect } = React
  const [inputType, setInputType] = useState(value ? "date" : "text")

  useEffect(() => {
    setInputType(value ? "date" : "text")
  }, [value])

  return html`
    <input
      type=${inputType}
      value=${value || ""}
      placeholder=${inputType === "text" ? placeholder : ""}
      onFocus=${(event) => {
        if (disabled) return
        setInputType("date")
        if (typeof event.target.showPicker === "function") {
          requestAnimationFrame(() => event.target.showPicker())
        }
      }}
      onBlur=${() => {
        if (!value) {
          setInputType("text")
        }
      }}
      onInput=${(event) => onChange(event.target.value)}
      onChange=${(event) => onChange(event.target.value)}
      className=${className}
      disabled=${disabled}
    />
  `
}

function OptionalModuleCard({ module, deadlines, isBandEditing, isImplementationOwner, onDeadlineChange }) {
  const inputValue = getPhaseDeadlineValue(deadlines, module.id, "input")
  const outputValue = getPhaseDeadlineValue(deadlines, module.id, "output")
  const isClientDateEditable = isBandEditing && isImplementationOwner

  return html`
    <div className="calendar-optional-card" style=${{ borderLeftColor: module.accentColor }}>
      <div className="calendar-optional-card__icon" style=${{ background: module.accentColor }}></div>
      <div className="calendar-optional-card__body">
        <div className="calendar-optional-card__title">${module.title}</div>
        <div className="calendar-optional-card__desc">${module.description}</div>
      </div>
      <div className="calendar-optional-card__lane">
        <span className="calendar-grid-table__flowPill calendar-grid-table__flowPill--input">INPUT</span>
        <span className="calendar-optional-card__owner calendar-grid-table__ownerCell--input">CLIENT</span>
        <${CalendarDateField}
          value=${inputValue}
          placeholder="Tarih Seçiniz"
          onChange=${(nextValue) => onDeadlineChange(module.id, "input", nextValue)}
          className=${classNames("calendar-grid-table__dateInput calendar-optional-card__dateInput", !isClientDateEditable && "calendar-grid-table__dateInput--readonly")}
          disabled=${!isClientDateEditable}
        />
      </div>
      <div className="calendar-optional-card__lane">
        <span className="calendar-grid-table__flowPill calendar-grid-table__flowPill--output">OUTPUT</span>
        <span className="calendar-optional-card__owner calendar-grid-table__ownerCell--output">DATASSIST</span>
        <${CalendarDateField}
          value=${outputValue}
          placeholder="Tarih Seçiniz"
          onChange=${(nextValue) => onDeadlineChange(module.id, "output", nextValue)}
          className=${classNames("calendar-grid-table__dateInput calendar-optional-card__dateInput", !isBandEditing && "calendar-grid-table__dateInput--readonly")}
          disabled=${!isBandEditing}
        />
      </div>
    </div>
  `
}

function CompanyCalendarView({ selectedCompany, onUpdateCompany, userRole }) {
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

  const activeBandState = {
    hasGE: isBandEditing ? bandDraft.hasGE : selectedCompany.hasGE,
    hasAccountingReport: isBandEditing ? bandDraft.hasAccountingReport : selectedCompany.hasAccountingReport
  }
  const isImplementationOwner = userRole === "imp_ekibi" || !userRole

  // Core omurga: sıra, kolon yapısı ve hücreler hiçbir toggle durumunda değişmez.
  const coreSteps = [
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
      id: "integrations",
      number: "03",
      title: "Live Hazırlıkları",
      description: "Canlıya geçiş öncesi son kontroller ve hazırlık süreçleri.",
      inputLabel: "Hazırlık Dokümanları Gönderim Tarihi",
      outputLabel: "Kontrol Tamamlanma Tarihi"
    },
    {
      id: "operations-handover",
      number: "04",
      title: "Canlıya Geçiş",
      description: "Sistemin canlı ortama alınması.",
      outputLabel: "Go-Live Tarihi",
      isSingleColumn: true
    }
  ]

  // Opsiyonel modüller: yalnızca ilgili toggle "Aktif" olduğunda ana tablonun altında ayrı kart olarak render edilir.
  // Yeni bir opsiyonel modül eklemek için sadece bu diziye kayıt eklemek yeterlidir.
  const optionalModules = [
    {
      id: "implementation-report",
      title: "Rapor Geliştirme ve Entegrasyon",
      description: "Özel rapor tasarımları ve API/dosya entegrasyonu.",
      inputLabel: "Rapor Talepleri Gönderim Tarihi",
      outputLabel: "Entegrasyon Tamamlanma Tarihi",
      field: "hasGE",
      accentColor: "#8b5cf6"
    },
    {
      id: "transition-call",
      title: "Muhasebe Rapor Kurulumu",
      description: "Muhasebe entegrasyonu için rapor şablonlarının kurulumu.",
      inputLabel: "Muhasebe Verisi Gönderim Tarihi",
      outputLabel: "Rapor Kurulum Tamamlanma Tarihi",
      field: "hasAccountingReport",
      accentColor: "var(--color-primary)"
    }
  ]

  // Ekleniş sırasından bağımsız olarak, kullanıcı her zaman en yakın hedef tarihli modülü üstte görür.
  const activeOptionalModules = optionalModules
    .filter((module) => activeBandState[module.field])
    .map((module) => ({
      ...module,
      targetDate: getPhaseDeadlineValue(selectedCompany.deadlines, module.id, "output")
    }))
    .sort((a, b) => {
      if (!a.targetDate && !b.targetDate) return 0
      if (!a.targetDate) return 1
      if (!b.targetDate) return -1
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    })

  const phaseColumns = coreSteps.flatMap((phase) => {
    const isEnabled = true

    if (phase.isSingleColumn) {
      return [
        {
          id: `${phase.id}-output-left`,
          phaseId: phase.id,
          lane: "output",
          owner: "DATASSIST",
          flow: "OUTPUT",
          fieldLabel: phase.outputLabel,
          tone: "output",
          isGroupEnd: false,
          isEnabled,
          isSpacer: true
        },
        {
          id: `${phase.id}-output-right`,
          phaseId: phase.id,
          lane: "output",
          owner: "DATASSIST",
          flow: "OUTPUT",
          fieldLabel: phase.outputLabel,
          tone: "output",
          isGroupEnd: true,
          isEnabled,
          isMerged: true
        }
      ]
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
        owner: "DATASSIST",
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
      <div className="calendar-phase-list__core">
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
              ${coreSteps.map((phase) => html`
                <td
                  key=${`${phase.id}-title`}
                  colSpan=${2}
                  className=${classNames(
                    "calendar-grid-table__titleCell",
                    phase.isSingleColumn && "is-single-phase"
                  )}
                >
                  <div className="calendar-grid-table__titleWrap">
                    <div className="calendar-grid-table__phaseTitle">${phase.title}</div>
                  </div>
                  <div className="calendar-grid-table__phaseDesc">${phase.description}</div>
                </td>
              `)}
            </tr>

            <tr>
              <th className="calendar-grid-table__leftCell calendar-grid-table__leftCell--meta">SORUMLU</th>
              ${coreSteps.map((phase) => {
                if (phase.isSingleColumn) {
                  return html`
                    <td
                      key=${`${phase.id}-owner`}
                      colSpan=${2}
                      className="calendar-grid-table__ownerCell calendar-grid-table__ownerCell--output is-group-end is-single-phase"
                    >
                      DATASSIST
                    </td>
                  `
                }

                return [
                  html`
                    <td key=${`${phase.id}-input-owner`} className="calendar-grid-table__ownerCell calendar-grid-table__ownerCell--input">
                      CLIENT
                    </td>
                  `,
                  html`
                    <td key=${`${phase.id}-output-owner`} className="calendar-grid-table__ownerCell calendar-grid-table__ownerCell--output is-group-end">
                      DATASSIST
                    </td>
                  `
                ]
              })}
            </tr>

            <tr>
              <th className="calendar-grid-table__leftCell calendar-grid-table__leftCell--meta">AKIŞ</th>
              ${coreSteps.map((phase) => {
                if (phase.isSingleColumn) {
                  return html`
                    <td
                      key=${`${phase.id}-flow`}
                      colSpan=${2}
                      className="calendar-grid-table__flowCell is-group-end is-single-phase"
                    >
                      <span className="calendar-grid-table__flowPill calendar-grid-table__flowPill--output">
                        OUTPUT
                      </span>
                    </td>
                  `
                }

                return [
                  html`
                    <td key=${`${phase.id}-input-flow`} className="calendar-grid-table__flowCell">
                      <span className="calendar-grid-table__flowPill calendar-grid-table__flowPill--input">INPUT</span>
                    </td>
                  `,
                  html`
                    <td key=${`${phase.id}-output-flow`} className="calendar-grid-table__flowCell is-group-end">
                      <span className="calendar-grid-table__flowPill calendar-grid-table__flowPill--output">OUTPUT</span>
                    </td>
                  `
                ]
              })}
            </tr>

            <tr className="calendar-grid-table__dateRow">
              <th className="calendar-grid-table__leftCell calendar-grid-table__leftCell--date">HEDEF TARİH</th>
              ${coreSteps.map((phase) => {
                if (phase.isSingleColumn) {
                  const outputValue = getPhaseDeadlineValue(selectedCompany.deadlines, phase.id, "output")
                  return html`
                    <td
                      key=${`${phase.id}-date`}
                      colSpan=${2}
                      className="calendar-grid-table__dateCell calendar-grid-table__dateCell--output is-group-end is-single-phase"
                    >
                      <${CalendarDateField}
                        value=${outputValue}
                        onChange=${(nextValue) => handleDeadlineChange(phase.id, "output", nextValue)}
                        className=${classNames("calendar-grid-table__dateInput", !isBandEditing && "calendar-grid-table__dateInput--readonly")}
                        disabled=${!isBandEditing}
                      />
                    </td>
                  `
                }

                const inputValue = getPhaseDeadlineValue(selectedCompany.deadlines, phase.id, "input")
                const outputValue = getPhaseDeadlineValue(selectedCompany.deadlines, phase.id, "output")
                const isClientDateEditable = isBandEditing && isImplementationOwner

                return [
                  html`
                    <td key=${`${phase.id}-input-date`} className="calendar-grid-table__dateCell calendar-grid-table__dateCell--input">
                      <${CalendarDateField}
                        value=${inputValue}
                        placeholder="Tarih Seçiniz"
                        onChange=${(nextValue) => handleDeadlineChange(phase.id, "input", nextValue)}
                        className=${classNames("calendar-grid-table__dateInput", !isClientDateEditable && "calendar-grid-table__dateInput--readonly")}
                        disabled=${!isClientDateEditable}
                      />
                    </td>
                  `,
                  html`
                    <td key=${`${phase.id}-output-date`} className="calendar-grid-table__dateCell calendar-grid-table__dateCell--output is-group-end">
                      <${CalendarDateField}
                        value=${outputValue}
                        onChange=${(nextValue) => handleDeadlineChange(phase.id, "output", nextValue)}
                        className=${classNames("calendar-grid-table__dateInput", !isBandEditing && "calendar-grid-table__dateInput--readonly")}
                        disabled=${!isBandEditing}
                      />
                    </td>
                  `
                ]
              })}
            </tr>
          </tbody>
        </table>
      </div>
      </div>

      ${activeOptionalModules.length > 0 && html`
        <div className="calendar-optional-list">
          ${activeOptionalModules.map((module) => html`
            <${OptionalModuleCard}
              key=${module.id}
              module=${module}
              deadlines=${selectedCompany.deadlines}
              isBandEditing=${isBandEditing}
              isImplementationOwner=${isImplementationOwner}
              onDeadlineChange=${handleDeadlineChange}
            />
          `)}
        </div>
      `}
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
  onUpdateCompany,
  userRole
}) {
  const [activeSubTab, setActiveSubTab] = useState("info") // 'info' or 'calendar'
  const companyUsers = selectedCompany?.users || []
  const companyName = companyDraft.name.trim() || selectedCompany?.name || "Yeni Şirket Taslağı"
  const canCreateUsers = Boolean(selectedCompany?.id) && !isCreatingCompany

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
                canCreateUsers=${canCreateUsers}
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
              userRole=${userRole}
            />
          `}
    </div>
  `
}

function RoleSwitcher({ userRole, setUserRole, selectedCompany }) {
  const [open, setOpen] = useState(false)

  const users = selectedCompany?.users || []
  const editorUser  = users[0]
  const viewerUser  = users[1]

  function initials(u) {
    if (!u) return "?"
    return ((u.firstName?.[0] || "") + (u.lastName?.[0] || "")).toUpperCase()
  }
  function fullName(u) {
    if (!u) return "—"
    return `${u.firstName} ${u.lastName}`
  }

  const roles = [
    {
      id: "imp_ekibi",
      label: "İmplementasyon Ekibi",
      desc: selectedCompany?.assignee || "Implementasyon Ekibi",
      avatar: selectedCompany?.assignee
        ? selectedCompany.assignee.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()
        : "IE",
      color: "bg-[#EFF4FF] text-[#2F6FED]"
    },
    {
      id: "editor",
      label: "Düzenleyici",
      desc: fullName(editorUser),
      avatar: initials(editorUser),
      color: "bg-[#F4F3FF] text-[#5925DC]"
    },
    {
      id: "viewer",
      label: "Görüntüleyici",
      desc: fullName(viewerUser),
      avatar: initials(viewerUser),
      color: "bg-[#F0FDF4] text-[#16A34A]"
    }
  ]

  const active = roles.find(r => r.id === userRole) || roles[0]

  return html`
    <div className="fixed bottom-6 right-6 z-40">
      ${open ? html`
        <div
          className="absolute bottom-[calc(100%+8px)] right-0 w-[240px] rounded-[14px] border border-[#E4E7EC] bg-white shadow-[0_8px_32px_rgba(16,24,40,0.14)] overflow-hidden"
        >
          ${roles.map(role => html`
            <button
              key=${role.id}
              type="button"
              onClick=${() => { setUserRole(role.id); setOpen(false) }}
              className=${classNames(
                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                role.id === userRole ? "bg-[#F5F8FF]" : "hover:bg-[#F9FAFB]"
              )}
            >
              <span className=${classNames("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", role.color)}>
                ${role.avatar}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-[#101828]">${role.label}</span>
                <span className="block text-[11px] text-[#98A2B3] truncate">${role.desc}</span>
              </span>
              ${role.id === userRole ? html`
                <svg className="ml-auto shrink-0 text-[#2F6FED]" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ` : null}
            </button>
          `)}
        </div>
        <div className="fixed inset-0 z-[-1]" onClick=${() => setOpen(false)}></div>
      ` : null}

      <button
        type="button"
        onClick=${() => setOpen(o => !o)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2F6FED] text-white shadow-[0_4px_16px_rgba(47,111,237,0.35)] hover:bg-[#2563CC] transition-colors"
        title="Rol değiştir: ${active.label}"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3.5" stroke="white" strokeWidth="1.6"/>
          <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  `
}

function App() {
  const [activePage, setActivePage] = useState(() => {
    const requestedPage = new URLSearchParams(window.location.search).get("page")
    return ["dashboard", "processes", "management"].includes(requestedPage)
      ? requestedPage
      : "dashboard"
  })
  const [userRole, setUserRole] = useState("imp_ekibi")
  const [selectedOnboardingType, setSelectedOnboardingType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [companies, setCompanies] = useState(() => {
    const storedModules = readStoredOptionalModules()
    return seedCompanies.map((company) => {
      const moduleSettings = storedModules[company.id]
      return moduleSettings
        ? {
            ...company,
            hasGE: Boolean(moduleSettings.hasGE),
            hasAccountingReport: Boolean(moduleSettings.hasAccountingReport)
          }
        : company
    })
  })
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
    if (newPage === "sla") {
      window.location.href = "index.html"
      return
    }

    if ((newPage === "processes" || newPage === "management") && selectedCompanyId === "all") {
      if (companies.length > 0) {
        setSelectedCompanyId(companies[0].id)
        setCompanyDraft(createCompanyDraftFromCompany(companies[0]))
      }
    }
    setActivePage(newPage)
  }

  function handleUpdateCompany(updatedCompany) {
    persistCompanyOptionalModules(updatedCompany)
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
    setCompanyFeedback("Şirket bilgilerini doldurup Geçiş Modeli'ni seçin, ardından Şirketi Oluştur'a tıklayın.")
    setCompanyFeedbackTone("neutral")
    closeUserModal()
  }

  function handleStartCompanyEdit() {
    if (selectedCompany) {
      setCompanyDraft(createCompanyDraftFromCompany(selectedCompany))
    }
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
        setCompanyFeedback("Şirket adı girmeden devam edemezsiniz.")
        setCompanyFeedbackTone("error")
      }

      return null
    }

    if (!companyDraft.onboardingType || !companyDraft.transitionType || !companyDraft.assignee) {
      if (announce) {
        setCompanyFeedback("Bölüm, geçiş modeli ve sorumlu alanlarını seçmeden devam edemezsiniz.")
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
        setCompanyFeedback(`"${newCompany.name}" şirketi hazırlandı.`)
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
      setCompanyFeedback(`"${updatedCompany.name}" şirket bilgileri güncellendi.`)
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
      setUserFeedback("Ad, soyad ve e-posta alanları doldurulmalıdır.")
      setUserFeedbackTone("error")
      return
    }

    if (!isValidEmail(email)) {
      setEmailError("Geçerli bir e-posta adresi girin.")
      setUserFeedbackTone("error")
      return
    }

    const resolvedCompany = persistCompanyDraft({ announce: isCreatingCompany })

    if (!resolvedCompany) {
      return
    }

    setIsEditingCompany(false)

    if (hasDuplicateEmail(resolvedCompany, email)) {
      setEmailError("Bu e-posta adresi seçili şirket içinde zaten bulunuyor.")
      setUserFeedbackTone("error")
      return
    }

    setIsProvisioningUser(true)
    setUserFeedback(`${firstName} ${lastName} için Dakika tarafına hesap açma isteği gönderildi.`)
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
      setUserFeedback(`${firstName} ${lastName} için kullanıcı adı ve şifre Dakika'dan alındı.`)
      setUserFeedbackTone("success")
    } catch (_) {
      setUserFeedback("Kullanıcı oluşturma sırasında bir hata oluştu.")
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
      setUserFeedback("Düzenleme için ad, soyad ve e-posta alanları doldurulmalıdır.")
      setUserFeedbackTone("error")
      return
    }

    if (!isValidEmail(email)) {
      setUserFeedback("Geçerli bir e-posta adresi girin.")
      setUserFeedbackTone("error")
      return
    }

    if (hasDuplicateEmail(selectedCompany, email, userId)) {
      setUserFeedback("Bu e-posta adresi seçili şirket içinde zaten bulunuyor.")
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
    setUserFeedback("Kullanıcı bilgileri güncellendi.")
    setUserFeedbackTone("success")
  }

  function handleDeleteUser(userId) {
    if (!selectedCompany) {
      return
    }

    const user = (selectedCompany.users || []).find((item) => item.id === userId)

    if (user && !window.confirm(`${user.firstName} ${user.lastName} kullanıcısını silmek istiyor musunuz?`)) {
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

    setUserFeedback("Kullanıcı kaydı silindi.")
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
                  return html`<${ImplementationScreen} key=${selectedCompanyId} companyName=${selectedCompany?.name || ""} assignee=${selectedCompany?.assignee || "Implementasyon Ekibi"} companyUsers=${selectedCompany?.users || []} userRole=${userRole} hasGE=${selectedCompany?.hasGE} hasAccountingReport=${selectedCompany?.hasAccountingReport} />`
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
                    userRole=${userRole}
                  />
                `
              })()}
            </div>
          </div>

          <${AppFooter} />
        </main>
      </div>
    </div>
    <${RoleSwitcher} userRole=${userRole} setUserRole=${setUserRole} selectedCompany=${selectedCompany} />
  `
}

ReactDOM.createRoot(document.getElementById("app")).render(html`<${App} />`)
