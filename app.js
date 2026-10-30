const { useEffect, useMemo, useRef, useState } = React
const html = htm.bind(React.createElement)
const specialistAvatarUrl = "Assets/specialist-avatar.png"

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

function sanitizeRichTextHtml(rawHtml) {
  if (!rawHtml || typeof document === "undefined") return ""
  const template = document.createElement("template")
  template.innerHTML = String(rawHtml)
  const allowedTags = new Set([
    "B", "STRONG", "I", "EM", "U", "S", "P", "DIV", "BR",
    "UL", "OL", "LI", "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TD", "TH", "A"
  ])
  const discardedTags = new Set([
    "STYLE", "SCRIPT", "META", "LINK", "TITLE", "HEAD", "XML", "NOSCRIPT", "OBJECT"
  ])

  function cleanNode(node) {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove()
        return
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return
      if (discardedTags.has(child.tagName)) {
        child.remove()
        return
      }
      if (!allowedTags.has(child.tagName)) {
        cleanNode(child)
        child.replaceWith(...Array.from(child.childNodes))
        return
      }

      Array.from(child.attributes).forEach((attribute) => {
        const attributeName = attribute.name.toLowerCase()
        const isTableSpan = ["TD", "TH"].includes(child.tagName) && ["colspan", "rowspan"].includes(attributeName)
        const isSafeLink = child.tagName === "A" && attributeName === "href" && /^(https?:|mailto:)/i.test(attribute.value)
        if (!isTableSpan && !isSafeLink) child.removeAttribute(attribute.name)
      })
      if (child.tagName === "A") {
        child.setAttribute("target", "_blank")
        child.setAttribute("rel", "noreferrer")
      }
      cleanNode(child)
    })
  }

  cleanNode(template.content)
  return template.innerHTML
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
const TEMPORARILY_DISABLED_OPTIONAL_MODULE_COMPANY_IDS = new Set(["company-214"])

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
        hasIntegration: Boolean(company.hasIntegration),
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
    name: "İMAS Klima",
    onboardingType: "enterprise",
    transitionType: "fast",
    assignee: "Zerrin Altun",
    currentStepIndex: 0, // Sistem Kurulumu (0: Kurulum, 1: Bordro, 2: G&E, 3: Muhasebe, 4: Live, 5: Canlı, 6: Tamamlandı)
    hasGE: false,
    hasAccountingReport: false,
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
        email: "b.demir@imasklima.com.tr",
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
    name: "Başkaya Holding",
    onboardingType: "local",
    transitionType: "parallel",
    assignee: "Gözde Gökdağ Tumbar",
    currentStepIndex: 5, // Canlıya Geçiş
    hasGE: true,
    hasIntegration: true,
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
        email: "okan.tuna@baskaya.com.tr",
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

// Geçiş planları "Implementasyon Planları 2026" dokümanına göre tanımlıdır. Ekstra Hızlı Geçiş kaldırıldı;
// Enterprise ve partner kaynaklı global müşteriler için takvim müşteriyle birlikte belirlenir (Özel Takvim).
const transitionOptions = [
  {
    value: "fast",
    label: "Hızlı Geçiş",
    description: "15 iş günü · Kurulum, analiz, muhasebe ve canlıya geçiş."
  },
  {
    value: "sample",
    label: "Örneklem Geçiş",
    description: "17 iş günü · Analize ek 2 iş günü örneklem çalışması."
  },
  {
    value: "parallel",
    label: "Paralel Geçiş",
    description: "20 iş günü · Analize ek 5 iş günü paralel çalışma."
  },
  {
    value: "custom",
    label: "Özel Takvim",
    description: "Enterprise / global müşteriler · Tarihler müşteriyle birlikte manuel belirlenir."
  }
]

// Eski kayıtlardaki geçiş tipleri yeni plan adlarına taşınır.
const LEGACY_TRANSITION_TYPES = { normal: "parallel", extra_fast: "custom" }

function normalizeTransitionType(value) {
  return LEGACY_TRANSITION_TYPES[value] || value || ""
}

const assigneeOptions = [
  { value: "Zerrin Altun", label: "Zerrin Altun" },
  { value: "Gözde Gökdağ Tumbar", label: "Gözde Gökdağ Tumbar" },
  { value: "Engincan Büyükçolak", label: "Engincan Büyükçolak" }
]

const moduleAccessUrl = "https://sdp.datassist.com.tr"

const implementationBaseSteps = [
  { id: "system-setup",          number: "01", title: "Sistem Kurulumu",                  planned: "Haz 01", completedDate: "May 30" },
  { id: "parallel-cost",         number: "02", title: "Bordro Analiz Çalışmaları",        planned: "Haz 08", completedDate: "Haz 06" },
  { id: "implementation-report", number: "03", title: "Rapor Geliştirme",                 planned: "Haz 15", completedDate: "Haz 13" },
  { id: "transition-call",       number: "04", title: "Muhasebe Rapor Kurulumu",           planned: "Haz 22", completedDate: "Haz 20" },
  { id: "integrations",          number: "05", title: "Canlıya Geçiş Hazırlıkları",        planned: "Haz 29", completedDate: "Haz 27" },
  { id: "operations-handover",   number: "06", title: "Canlıya Geçiş",                    planned: "Tem 05", completedDate: "Tem 03" }
]

// Prototipte kalan süre hesapları bu sabit "bugün" üzerinden yapılır (demo şirketin başlangıç tarihi).
const IMPLEMENTATION_DEMO_TODAY = "2026-05-27"
const SHORT_TURKISH_MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]

function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""))
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null
}

function formatShortTurkishDate(isoDate) {
  const date = parseIsoDate(isoDate)
  return date ? `${date.getDate()} ${SHORT_TURKISH_MONTHS[date.getMonth()]}` : ""
}

// Bugünden teslim tarihine kalan iş günü (hafta sonu ve tatiller hariç). 0: bugün, negatif: gecikme, null: tarih yok.
function countBusinessDaysUntil(dueIso, todayIso = IMPLEMENTATION_DEMO_TODAY) {
  const due = parseIsoDate(dueIso)
  const today = parseIsoDate(todayIso)
  if (!due || !today) return null
  const direction = due >= today ? 1 : -1
  const cursor = new Date(today)
  let count = 0
  while (direction > 0 ? cursor < due : cursor > due) {
    cursor.setDate(cursor.getDate() + direction)
    if (isWorkingDay(cursor)) count += 1
  }
  return direction * count
}

// Resmi tatiller ve Datassist tatilleri izin servisinden gelir; prototipte servis yanıtı bu listeyle temsil edilir.
// type: "official" | "datassist". Yarım gün (arife) kayıtları iş günü sayılır.
const leaveServiceHolidays = [
  { date: "2026-01-01", name: "Yılbaşı", type: "official" },
  { date: "2026-03-19", name: "Ramazan Bayramı Arifesi", type: "official", halfDay: true },
  { date: "2026-03-20", name: "Ramazan Bayramı 1. Gün", type: "official" },
  { date: "2026-03-21", name: "Ramazan Bayramı 2. Gün", type: "official" },
  { date: "2026-03-22", name: "Ramazan Bayramı 3. Gün", type: "official" },
  { date: "2026-04-23", name: "Ulusal Egemenlik ve Çocuk Bayramı", type: "official" },
  { date: "2026-05-01", name: "Emek ve Dayanışma Günü", type: "official" },
  { date: "2026-05-19", name: "Atatürk'ü Anma, Gençlik ve Spor Bayramı", type: "official" },
  { date: "2026-05-26", name: "Kurban Bayramı Arifesi", type: "official", halfDay: true },
  { date: "2026-05-27", name: "Kurban Bayramı 1. Gün", type: "official" },
  { date: "2026-05-28", name: "Kurban Bayramı 2. Gün", type: "official" },
  { date: "2026-05-29", name: "Kurban Bayramı 3. Gün", type: "official" },
  { date: "2026-05-30", name: "Kurban Bayramı 4. Gün", type: "official" },
  { date: "2026-07-15", name: "Demokrasi ve Milli Birlik Günü", type: "official" },
  { date: "2026-08-30", name: "Zafer Bayramı", type: "official" },
  { date: "2026-10-28", name: "Cumhuriyet Bayramı Arifesi", type: "official", halfDay: true },
  { date: "2026-10-29", name: "Cumhuriyet Bayramı", type: "official" }
]

const NON_WORKING_HOLIDAY_DATES = new Set(
  leaveServiceHolidays.filter((holiday) => !holiday.halfDay).map((holiday) => holiday.date)
)

function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function isWorkingDay(date) {
  const day = date.getDay()
  return day !== 0 && day !== 6 && !NON_WORKING_HOLIDAY_DATES.has(toIsoDate(date))
}

// Verilen gün çalışma günü değilse ilk çalışma gününe ilerler.
function rollToWorkingDay(date) {
  const cursor = new Date(date)
  while (!isWorkingDay(cursor)) cursor.setDate(cursor.getDate() + 1)
  return cursor
}

// Aşama süreleri (iş günü). 02 Bordro Analiz = analiz 5 + örneklem 2 / paralel 5; Canlıya geçiş 3 = hazırlık 2 + go-live 1.
// Rapor Geliştirme ve Entegrasyon standart takvim dışındadır, tarihleri manuel girilir.
const TRANSITION_PLAN_DURATIONS = {
  fast:     { "system-setup": 2, "parallel-cost": 5,  "transition-call": 5, integrations: 2, "operations-handover": 1 },
  sample:   { "system-setup": 2, "parallel-cost": 7,  "transition-call": 5, integrations: 2, "operations-handover": 1 },
  parallel: { "system-setup": 2, "parallel-cost": 10, "transition-call": 5, integrations: 2, "operations-handover": 1 }
}

const AUTO_SCHEDULE_PHASE_ORDER = ["system-setup", "parallel-cost", "transition-call", "integrations", "operations-handover"]

function getTransitionPlanDurations(transitionType) {
  return TRANSITION_PLAN_DURATIONS[normalizeTransitionType(transitionType)] || null
}

function getTransitionPlanTotalDays(transitionType, hasAccountingReport = true) {
  const durations = getTransitionPlanDurations(transitionType)
  if (!durations) return null
  return AUTO_SCHEDULE_PHASE_ORDER
    .filter((phaseId) => phaseId !== "transition-call" || hasAccountingReport)
    .reduce((total, phaseId) => total + durations[phaseId], 0)
}

// Müşteri payı (iş günü), aşama süresinin dışındadır: müşteri verisini bir önceki teslimden (ilk aşamada kick-off'tan)
// bu kadar gün sonra gönderir; aşama süresi (TRANSITION_PLAN_DURATIONS) yalnız Datassist'in doğru veriye ulaştıktan
// sonraki çalışmasıdır. Kick-off → go-live = Datassist süresi + müşteri payları. Go-live'ın müşteri input'u yoktur.
const CUSTOMER_INPUT_LEAD_DAYS = {
  "system-setup": 2,
  "parallel-cost": 2,
  "transition-call": 2,
  integrations: 2,
  "operations-handover": 0
}

// Plandaki müşteri paylarının toplamı (iş günü).
function getTransitionPlanCustomerDays(transitionType, hasAccountingReport = true) {
  if (!getTransitionPlanDurations(transitionType)) return null
  return AUTO_SCHEDULE_PHASE_ORDER
    .filter((phaseId) => phaseId !== "transition-call" || hasAccountingReport)
    .reduce((total, phaseId) => total + CUSTOMER_INPUT_LEAD_DAYS[phaseId], 0)
}

function addWorkingDays(date, count) {
  const cursor = new Date(date)
  for (let day = 0; day < count; day += 1) {
    cursor.setDate(cursor.getDate() + 1)
    while (!isWorkingDay(cursor)) cursor.setDate(cursor.getDate() + 1)
  }
  return cursor
}

// implementationBaseSteps sırası; company.currentStepIndex bu indeksleri kullanır.
const PHASE_STEP_INDEX = {
  "system-setup": 0,
  "parallel-cost": 1,
  "implementation-report": 2,
  "transition-call": 3,
  integrations: 4,
  "operations-handover": 5
}

// Başlangıç (kick-off) tarihinden aşama tarihlerini üretir:
// INPUT = önceki teslim + müşteri payı (2 iş günü), OUTPUT = INPUT + aşamanın Datassist süresi (N iş günü).
// Tamamlanmış aşamaların (currentStepIndex öncesi) tarihleri korunur; kalan aşamalar son teslimden itibaren dizilir.
// Özel takvimde veya başlangıç tarihi yokken null döner.
function generatePhaseDeadlines({ startDate, transitionType, hasAccountingReport = true, deadlines, currentStepIndex = 0 }) {
  const durations = getTransitionPlanDurations(transitionType)
  const start = parseIsoDate(startDate)
  if (!durations || !start) return null

  let next = normalizePhaseDeadlines(deadlines)
  let cursor = rollToWorkingDay(start)

  AUTO_SCHEDULE_PHASE_ORDER.forEach((phaseId) => {
    if (phaseId === "transition-call" && !hasAccountingReport) {
      next = clearPhaseDeadlineValues(next, phaseId)
      return
    }

    const completedOutput = parseIsoDate(getPhaseDeadlineValue(next, phaseId, "output"))
    if (PHASE_STEP_INDEX[phaseId] < currentStepIndex && completedOutput) {
      cursor = completedOutput
      return
    }

    const phaseInput = addWorkingDays(cursor, CUSTOMER_INPUT_LEAD_DAYS[phaseId])
    const phaseOutput = addWorkingDays(phaseInput, durations[phaseId])
    next = setPhaseDeadlineValue(next, phaseId, "input", toIsoDate(phaseInput))
    next = setPhaseDeadlineValue(next, phaseId, "output", toIsoDate(phaseOutput))
    cursor = phaseOutput
  })

  return next
}

const DOC_STATUS_TONES = {
  amber: { text: "text-[#B54708]", dot: "bg-[#F79009]" },
  amberStrong: { text: "text-[#93370D] font-semibold", dot: "bg-[#DC6803]" },
  red: { text: "text-[#B42318]", dot: "bg-[#F04438]" },
  blue: { text: "text-[#175CD3]", dot: "bg-[#2F6FED]" },
  green: { text: "text-[#067647]", dot: "bg-[#12B76A]" },
  gray: { text: "text-[#667085]", dot: "bg-[#D0D5DD]" }
}

// Müşteriden yanıt beklenen satırın durum metni. Müşteri ve operasyon aynı durumu kendi bakış açısından görür.
function getCustomerPendingStatus({ plannedDate, isClient, responseKind = "file", dismissLabel = "" }) {
  const daysLeft = countBusinessDaysUntil(plannedDate)
  const hasDate = daysLeft !== null

  if (!isClient) {
    const subject = responseKind === "file" ? "Müşteri yüklemesi" : "Müşteri yanıtı"
    if (!hasDate) return { text: `${subject} bekleniyor · Planlanan tarih girilmedi`, tone: "amber" }
    if (daysLeft < 0) return { text: `${subject} ${Math.abs(daysLeft)} iş günü gecikti`, tone: "red" }
    if (daysLeft === 0) return { text: `${subject} bekleniyor · Bugün son gün`, tone: "amberStrong" }
    return { text: `${subject} bekleniyor · ${daysLeft} iş günü kaldı`, tone: "amber" }
  }

  const base = dismissLabel
    ? `Dosya yükleyin veya "${dismissLabel}" seçin`
    : responseKind === "file" ? "Dosyanızı yüklemeniz bekleniyor" : "Yanıtınız bekleniyor"
  if (!hasDate) return { text: base, tone: "amber" }
  if (daysLeft < 0) {
    return dismissLabel
      ? { text: `${base} · Teslim tarihi ${Math.abs(daysLeft)} iş günü geçti`, tone: "red" }
      : { text: `${responseKind === "file" ? "Dosya" : "Yanıt"} teslim tarihi ${Math.abs(daysLeft)} iş günü geçti`, tone: "red" }
  }
  if (daysLeft === 0) {
    return dismissLabel
      ? { text: `${base} · Bugün son gün`, tone: "amberStrong" }
      : { text: responseKind === "file" ? "Dosyanızı bugün yüklemeniz bekleniyor" : "Yanıtınız bugün bekleniyor", tone: "amberStrong" }
  }
  return { text: `${base} · ${daysLeft} iş günü kaldı`, tone: "amber" }
}

function DocStatusLine({ status }) {
  if (!status) return null
  const tone = DOC_STATUS_TONES[status.tone] || DOC_STATUS_TONES.gray
  return html`
    <p className=${classNames("mt-1 flex items-start gap-1.5 text-[10.5px] font-medium leading-4", tone.text)}>
      <span className=${classNames("mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full", tone.dot)}></span>
      <span>${status.text}</span>
    </p>
  `
}

// Aşama rozetinin role göre etiketi; müşteri kendi sırasını, operasyon ise kimi beklediğini görür.
function getStageStatusMeta(status, isClient) {
  const blue = "border-[#D5E2FF] bg-[#EFF4FF] text-[#175CD3]"
  const amber = "border-[#FEC84B] bg-[#FFFAEB] text-[#B54708]"
  const neutral = "border-[#EAECF0] bg-[#F9FAFB] text-[#475467]"
  if (status === "waiting") return { label: "Devam Ediyor", badgeClass: blue, dot: "bg-[#2F6FED]" }
  if (status === "uploaded") {
    return isClient
      ? { label: "Gönderime Hazır", badgeClass: blue, dot: "bg-[#2F6FED]" }
      : { label: "Gönderim Bekleniyor", badgeClass: neutral, dot: "bg-[#93C5FD]" }
  }
  if (status === "pending_approval") {
    return isClient
      ? { label: "İncelemede", badgeClass: blue, dot: "bg-[#2F6FED]" }
      : { label: "İnceleme Bekliyor", badgeClass: amber, dot: "bg-[#F79009]" }
  }
  return null
}

const starterKitDownloadHref = encodeURI("file:///Users/datassist/Downloads/1 - Starter Kit.xls")
const puantajFormDownloadHref = encodeURI("file:///Users/omerisildak/Downloads/3 - Puantaj_Formu (1).xls")
const girisCikisNakilDownloadHref = encodeURI("file:///Users/omerisildak/Downloads/4 - Giriş Çıkış Nakil Formu (1).xls")
const exampleReportsDownloadHref = "file:///Users/omerisildak/Downloads/5%20-%20%C3%96rnek%20Raporlar.zip"

// Her adim icin belgeler (coklu belge destegi)
const implementationStepTemplates = {
  "system-setup": {
    title: "Sistem Kurulumu",
    description: "Starter Kit dosyalarını tarafına göre yükleyin. Datassist alanını yalnız Datassist, Müşteri alanını ise müşteri veya Datassist ekibi güncelleyebilir.",
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
    title: "Canlıya Geçiş Hazırlıkları",
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

// Aşama açıklaması role ve aşamanın gerçek yapısına göre yazılır; şablon yoksa şablondan söz edilmez.
function getImplementationStepDescription(stepId, { isClient, hasTemplates }) {
  if (stepId === "system-setup") {
    return isClient
      ? "Şirket ve personel bilgileriniz Starter Kit ile sisteme aktarılır. Şablonu indirin, doldurun ve yükleyin; ekibimiz kontrol edip onaylayacaktır."
      : "Müşteri, şirket ve personel bilgilerini Starter Kit ile iletir. Dosya incelemenize gönderildiğinde onaylayın veya revizyon isteyin."
  }
  if (stepId === "parallel-cost") {
    if (!isClient) return "Müşteri, mevcut bordro sisteminden alınan çıktıları yükler. Belgeler incelemenize gönderildiğinde onaylayın veya revizyon isteyin."
    return hasTemplates
      ? "Mevcut bordro sisteminizden son kapanan aya ait aşağıdaki çıktıları yükleyin. Beklenen format için ilgili şablonları inceleyebilirsiniz."
      : "Mevcut bordro sisteminizden son kapanan aya ait aşağıdaki çıktıları yükleyin. Şablon gerekmez; kendi sisteminizdeki formatıyla yükleyebilirsiniz."
  }
  if (stepId === "integrations") {
    return isClient
      ? "Canlıya geçiş öncesi güncel bilgilerinizi paylaşın. Değişiklik olmayan maddeler için ilgili seçeneği işaretlemeniz yeterlidir."
      : "Müşteri, canlıya geçiş öncesi güncel bilgilerini paylaşır. Yanıtlar incelemenize gönderildiğinde onaylayın veya revizyon isteyin."
  }
  return implementationStepTemplates[stepId]?.description || ""
}

// Her adim icin baslangic durumlari
// docs: { [docId]: null | { id, name, uploadedAt, downloadUrl } }
const implementationEmptyStepUploadSeeds = {
  "system-setup":          { status: "waiting", submitted: false, docs: {}, datassistDocs: {}, docStatuses: {}, docReasons: {}, pendingReviewDocIds: [], requiredRevisionDocIds: [], completedDate: "" },
  "parallel-cost":         { status: "waiting", submitted: false, docs: {}, datassistDocs: {}, docStatuses: {}, docReasons: {}, pendingReviewDocIds: [], requiredRevisionDocIds: [], completedDate: "" },
  "implementation-report": { status: "waiting", submitted: false, docs: {}, datassistDocs: {}, docStatuses: {}, docReasons: {}, pendingReviewDocIds: [], requiredRevisionDocIds: [], completedDate: "" },
  "transition-call":       { status: "waiting", submitted: false, docs: {}, datassistDocs: {}, docStatuses: {}, docReasons: {}, pendingReviewDocIds: [], requiredRevisionDocIds: [], completedDate: "" },
  "integrations":          { status: "waiting", submitted: false, docs: {}, datassistDocs: {}, docStatuses: {}, docReasons: {}, pendingReviewDocIds: [], requiredRevisionDocIds: [], completedDate: "" },
  "operations-handover":   { status: "waiting", submitted: false, docs: {}, datassistDocs: {}, docStatuses: {}, docReasons: {}, pendingReviewDocIds: [], requiredRevisionDocIds: [], completedDate: "" }
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
      ? { ...upload, reviewStatus: null, reviewReason: "", reviewAttachments: [], reviewedAt: "", reviewBatchId: null }
      : upload
  )
}

// "May 30" / "Haz 06" → "30 May" / "6 Haz" (stepper'daki tamamlanma tarihi).
function formatStepCompletedDate(value) {
  const match = String(value || "").match(/^(\S+) (\d{1,2})$/)
  return match ? `${Number(match[2])} ${match[1]}` : String(value || "")
}

// "15 Eki 2026 08:50" → "15 Eki 08:50" (satır durumlarında kısa tarih).
function formatShortSubmittedAt(value) {
  return String(value || "").replace(/^(\d{1,2} \S+) \d{4}/, "$1")
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
  reviewAttachments = [],
  reviewedAt = ""
}) {
  return {
    id,
    name,
    uploadedAt,
    downloadUrl,
    reviewStatus,
    reviewReason,
    reviewAttachments,
    reviewedAt
  }
}

// Demo adres parametreleri (ekran görüntüleri ve inceleme için):
// ?step=<aşama id> başlangıç aşaması (öncekiler tamamlanmış sayılır), ?role=client|uzman, ?demo=rejected|approved.
const implementationDemoParams = new URLSearchParams(window.location.search)
const implementationDemoInitialStepId = implementationBaseSteps.some((step) => step.id === implementationDemoParams.get("step"))
  ? implementationDemoParams.get("step")
  : "system-setup"

function isImplementationRejectedDemo() {
  return implementationDemoParams.get("demo") === "rejected"
}

function getImplementationDemoInitialRole() {
  const role = implementationDemoParams.get("role")
  if (role === "client") return "editor"
  if (role === "uzman") return "imp_ekibi"
  return isImplementationRejectedDemo() ? "editor" : "imp_ekibi"
}

function getImplementationInitialStepId(currentStepIndex) {
  if (implementationDemoParams.get("step")) return implementationDemoInitialStepId
  const step = currentStepIndex > 0 && currentStepIndex < implementationBaseSteps.length ? implementationBaseSteps[currentStepIndex] : null
  return step ? step.id : implementationDemoInitialStepId
}

function createImplementationDemoStepUploads(initialStepId = implementationDemoInitialStepId) {
  if (new URLSearchParams(window.location.search).get("validationPreview") === "1") {
    const file = { id: "validation-preview", name: "Starter Kit-İMAS KLİMA VE İMAS İZMİR MAK 31052026.xls", uploadedAt: "21 Eyl 2026 15:33", validation: { issues: generateStarterKitValidationIssues().filter(issue => issue.type !== "hata"), checkedAt: "21 Eyl 2026 15:33", demo: true } }
    return { ...implementationEmptyStepUploadSeeds, "system-setup": { ...implementationEmptyStepUploadSeeds["system-setup"], status: "pending_approval", submitted: true, submittedAt: "15 Eki 2026 08:50", docs: { "doc-starter-kit": [file] }, pendingReviewDocIds: ["doc-starter-kit"] } }
  }
  // Demo: ?demo=approved → Starter Kit onaylanmış, aşama henüz tamamlanmamış.
  if (implementationDemoParams.get("demo") === "approved") {
    const file = {
      ...createDemoUploadedFile({ id: "demo-approved-starter-kit", name: "Starter Kit-İMAS KLİMA VE İMAS İZMİR MAK 31052026.xls", uploadedAt: "15 Eki 2026 08:50", reviewStatus: "approved", reviewedAt: "15 Eki 2026 08:59" }),
      validation: { issues: generateStarterKitValidationIssues().filter(issue => issue.type !== "hata"), checkedAt: "15 Eki 2026 08:50", demo: true }
    }
    return { ...implementationEmptyStepUploadSeeds, "system-setup": { ...implementationEmptyStepUploadSeeds["system-setup"], status: "docs_approved", submitted: false, docs: { "doc-starter-kit": [file] }, docStatuses: { "doc-starter-kit": "approved" } } }
  }
  // Demo: ?demo=rejected → müşteri rolünde, Starter Kit reddedilmiş halde açılır (dosya yüklemeden red ekranını görmek için).
  if (isImplementationRejectedDemo()) {
    const reason = "Merhaba, iyi çalışmalar.\n\n• Starter Kit dosyasında kontrol edilmesi gereken alanlar bulunuyor.\n• Gerekli düzeltmeleri yapıp güncel versiyonu tekrar yüklemenizi rica ederiz.\n\nTeşekkürler."
    const file = {
      ...createDemoUploadedFile({ id: "demo-rejected-starter-kit", name: "Starter Kit-İMAS KLİMA VE İMAS İZMİR MAK 31052026.xls", uploadedAt: "14 Eki 2026 10:52", reviewStatus: "rejected", reviewReason: reason, reviewedAt: "14 Eki 2026 10:52" }),
      validation: { issues: generateStarterKitValidationIssues().filter(issue => issue.type !== "hata"), checkedAt: "14 Eki 2026 10:40", demo: true }
    }
    return { ...implementationEmptyStepUploadSeeds, "system-setup": { ...implementationEmptyStepUploadSeeds["system-setup"], status: "revision_requested", submitted: false, docs: { "doc-starter-kit": [file] }, docStatuses: { "doc-starter-kit": "rejected" }, docReasons: { "doc-starter-kit": reason }, requiredRevisionDocIds: ["doc-starter-kit"] } }
  }
  const initialStepIndex = implementationBaseSteps.findIndex((step) => step.id === initialStepId)
  const completedStepIds = new Set(
    implementationBaseSteps.slice(0, Math.max(0, initialStepIndex)).map((step) => step.id)
  )

  return Object.fromEntries(implementationBaseSteps.map((step) => {
    const seed = implementationEmptyStepUploadSeeds[step.id]
    if (!completedStepIds.has(step.id)) {
      return [step.id, {
        ...seed,
        docs: { ...seed.docs },
        datassistDocs: { ...seed.datassistDocs },
        docStatuses: { ...seed.docStatuses },
        docReasons: { ...seed.docReasons },
        pendingReviewDocIds: [...seed.pendingReviewDocIds],
        requiredRevisionDocIds: [...seed.requiredRevisionDocIds]
      }]
    }

    const completedAt = `${formatStepCompletedDate(step.completedDate)} 2026`
    const documents = implementationStepTemplates[step.id]?.documents || []
    const docs = Object.fromEntries(documents.map((documentItem) => [
      documentItem.id,
      createDemoUploadedFile({
        id: `demo-${step.id}-${documentItem.id}`,
        name: documentItem.templateName || documentItem.label,
        uploadedAt: completedAt,
        downloadUrl: documentItem.templateUrl || "#",
        reviewStatus: "approved",
        reviewedAt: completedAt
      })
    ]))

    return [step.id, {
      ...seed,
      status: "completed",
      submitted: true,
      docs,
      datassistDocs: {},
      docStatuses: Object.fromEntries(documents.map((documentItem) => [documentItem.id, "approved"])),
      docReasons: {},
      pendingReviewDocIds: [],
      requiredRevisionDocIds: [],
      completedDate: step.completedDate
    }]
  }))
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
    text: "Merhabalar,\n\nFirmanız için canlıya geçiş aşamasına geçilmiştir.\n\nFirmanızın canlı ortama kopyalanması ile Operasyon Grup Yöneticisi ve Müşteri Temsilcisi atamalarının tamamlanmasının ardından canlıya geçiş süreci tamamlanacaktır.\n\nSüreçle ilgili bilgi almak veya sorularınızı iletmek için buradan bize yazabilirsiniz.\n\nSaygılarımla."
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
  const implActor = { name: assignee, initials: implAvatar, avatarUrl: specialistAvatarUrl, color: "bg-[#EFF4FF] text-[#2F6FED]" }
  const clientActor = { name: clientName, initials: clientAvatar, color: "bg-[#F4F3FF] text-[#5925DC]" }

  return [
    ...implementationInitialMessages.map((message) => ({
      ...message,
      author: assignee,
      avatar: implAvatar,
      avatarUrl: specialistAvatarUrl
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
    startDate: "",
    deadlines: createEmptyPhaseDeadlines(),
    delayLogs: []
  }
}

function createCompanyDraftFromCompany(company) {
  return {
    name: company?.name || "",
    onboardingType: company?.onboardingType || "saas",
    transitionType: normalizeTransitionType(company?.transitionType) || "parallel",
    assignee: company?.assignee || "Zerrin Altun",
    hasGE: company?.hasGE !== undefined ? company.hasGE : true,
    hasIntegration: Boolean(company?.hasIntegration),
    hasAccountingReport: company?.hasAccountingReport !== undefined ? company.hasAccountingReport : true,
    startDate: company?.startDate || "",
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
  const normalized = normalizeTransitionType(value)
  return transitionOptions.find((option) => option.value === normalized) || { label: "Seçilmedi" }
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

function OrgTreeIcon() {
  return html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <rect x="9" y="3" width="6" height="5" rx="1.2"></rect>
      <rect x="3" y="16" width="6" height="5" rx="1.2"></rect>
      <rect x="15" y="16" width="6" height="5" rx="1.2"></rect>
      <path d="M12 8v4M6 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"></path>
    </svg>
  `
}

function BookIcon() {
  return html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z"></path>
      <path d="M4 19.5A2 2 0 0 1 6 18h13M9 7h6M9 11h4"></path>
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
      id: "organization",
      label: "Organizasyon Yapısı",
      icon: html`<${OrgTreeIcon} />`
    },
    {
      id: "knowhow",
      label: "Know-How",
      icon: html`<${BookIcon} />`
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
          <div className="grid gap-3 lg:grid-cols-2">
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
              : html`
                  <${EditActionButton}
                    label="Düzenle"
                    onClick=${onStartEdit}
                  />
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
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 py-4 px-2">
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

function ImplementationStep({ step, index, isSelected, isCompleted, isCurrent, isSelectable, isClient, onSelect }) {
  const isPending = !isCompleted && !isCurrent
  const plannedLabel = step.plannedDate
    ? `Planlanan: ${formatShortTurkishDate(step.plannedDate)}`
    : isClient ? "" : "Planlanan tarih girilmedi"

  return html`
    <button
      type="button"
      onClick=${() => isSelectable && onSelect(step.id)}
      disabled=${!isSelectable}
      className=${classNames("impl-step", !isSelectable && "cursor-not-allowed opacity-50")}
    >
      <div className=${classNames(
        "impl-step__circle",
        isCompleted ? "impl-step__circle--done" : isCurrent ? "impl-step__circle--current" : "impl-step__circle--pending"
      )}>
        ${isCompleted ? html`<${CheckCircleIcon} />` : isCurrent ? html`<span className="impl-step__current-dot"></span>` : null}
      </div>

      <p className=${classNames("impl-step__title", isCurrent && "impl-step__title--blue")}>
        ${step.title}
      </p>

      ${isCompleted && step.completedDate
        ? html`<p className="impl-step__completed">Tamamlandı: ${formatStepCompletedDate(step.completedDate)}</p>`
        : !isCompleted && step.pendingLabel
          ? html`<p className="impl-step__pending-label">${step.pendingLabel}</p>`
          : null
      }

      ${plannedLabel ? html`<p className=${classNames("impl-step__planned", !step.plannedDate && "impl-step__planned--missing")}>${plannedLabel}</p>` : null}
    </button>
  `
}

function ImplementationTimeline({ steps, activeStepId, onStepChange, progress, isClient }) {
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
              isClient=${isClient}
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

function getAttachmentFileMeta(fileName = "") {
  const extension = String(fileName).split(".").pop()?.toLowerCase() || ""

  if (["xls", "xlsx", "xlsm", "csv"].includes(extension)) {
    return { kind: "excel", extension }
  }
  if (extension === "pdf") {
    return { kind: "pdf", extension }
  }
  if (["zip", "rar", "7z"].includes(extension)) {
    return { kind: "archive", extension }
  }
  if (["doc", "docx"].includes(extension)) {
    return { kind: "word", extension }
  }
  if (["ppt", "pptx"].includes(extension)) {
    return { kind: "powerpoint", extension }
  }
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(extension)) {
    return { kind: "image", extension }
  }

  return { kind: "file", extension }
}

function AttachmentTypeIcon({ fileName, className = "h-7 w-7" }) {
  const { kind } = getAttachmentFileMeta(fileName)
  const sharedClass = classNames("flex shrink-0 items-center justify-center", className)

  if (kind === "excel") {
    return html`
      <span className=${sharedClass} aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M8 2.75h8l4 4V21H8z" fill="white" stroke="#A9D6BB" strokeWidth="1.1"/><path d="M16 2.75v4h4" stroke="#A9D6BB" strokeWidth="1.1"/>
          <rect x="2" y="7" width="11" height="12" rx="2" fill="#168A45"/><path d="m5 10 5 6m0-6-5 6" stroke="white" strokeWidth="1.35" strokeLinecap="round"/>
        </svg>
      </span>
    `
  }
  if (kind === "pdf") {
    return html`
      <span className=${sharedClass} aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 2.75h9l5 5V21.25H5z" fill="#FFF5F4" stroke="#F2B8B3" strokeWidth="1.1"/><path d="M14 2.75v5h5" stroke="#F2B8B3" strokeWidth="1.1"/>
          <path d="M8.2 16.8c1.9-3 3.05-5.45 3.15-7.4.35 2.1 1.1 4.1 2.3 5.85-2.15-.25-4.15.1-5.45 1.55Z" stroke="#D92D20" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    `
  }
  if (kind === "archive") {
    return html`
      <span className=${sharedClass} aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M2.5 7.5h7l1.7 2H21v9.75a1.75 1.75 0 0 1-1.75 1.75h-15.5A1.75 1.75 0 0 1 2 19.25V9.2c0-.6.2-1.2.5-1.7Z" fill="#F6B84A" stroke="#D89516" strokeWidth="1"/>
          <path d="M5 5h7l1.5 2.5H2.5L3.4 5.8A1.8 1.8 0 0 1 5 5Z" fill="#FFD982" stroke="#D89516" strokeWidth="1"/>
          <path d="M12.5 9.5v2h-1v2h1v2h-1v2" stroke="#7A4B00" strokeWidth="1.1"/><rect x="10.5" y="17.5" width="3" height="2" rx=".5" fill="#7A4B00"/>
        </svg>
      </span>
    `
  }

  const appTone = kind === "word" ? "#2F6FED" : kind === "powerpoint" ? "#D85818" : kind === "image" ? "#6941C6" : "#667085"
  const appLetter = kind === "word" ? "W" : kind === "powerpoint" ? "P" : kind === "image" ? "IMG" : ""
  return html`
    <span className=${sharedClass} aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M6 2.75h9l4 4V21.25H6z" fill="white" stroke="#C9D2DF" strokeWidth="1.1"/><path d="M15 2.75v4h4" stroke="#C9D2DF" strokeWidth="1.1"/>
        ${appLetter ? html`<rect x="2" y="8" width="12" height="11" rx="2" fill=${appTone}/><text x="8" y="15.2" fill="white" fontSize=${appLetter.length > 1 ? "4.5" : "7"} fontWeight="700" textAnchor="middle">${appLetter}</text>` : html`<path d="M9 11h7M9 14h7M9 17h5" stroke=${appTone} strokeWidth="1.2" strokeLinecap="round"/>`}
      </svg>
    </span>
  `
}

function RejectionReasonDetailModal({ detail, stepTitle = "", isClient = true, onClose, onUpload }) {
  useEffect(() => {
    if (!detail) return undefined
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose()
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [detail, onClose])

  if (!detail) return null

  const timestampParts = splitTimestampParts(detail.reviewedAt || detail.uploadedAt || "")
  const authorName = detail.authorName || "İmplementasyon Uzmanı"
  const docLabel = detail.docLabel || "Dosya"
  const headerSubtitle = [stepTitle, detail.docLabel].filter(Boolean).join(" · ")
  const attachments = Array.isArray(detail.attachments) ? detail.attachments.filter(Boolean) : []
  const isLongMessage = String(detail.reason || "").length > 700

  return ReactDOM.createPortal(html`
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(15,23,42,0.42)] px-4 py-6 backdrop-blur-[2px]"
      onMouseDown=${(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="flex max-h-[calc(100vh-48px)] w-full max-w-[820px] flex-col overflow-hidden rounded-[18px] border border-[#DDE3EA] bg-white shadow-[0_28px_72px_rgba(15,23,42,0.22)]"
        style=${isLongMessage ? { height: "min(900px, calc(100vh - 48px))" } : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-detail-title"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E7ECF2] bg-[#F8FAFC] px-5 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#FEDF89] bg-[#FFFAEB] text-[#DC6803]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7.5v5.5"></path><path d="M12 16.5h.01"></path></svg>
            </span>
            <div className="min-w-0">
              <h3 id="reject-detail-title" className="text-[14px] font-semibold text-[#101828]">Revize Talebi</h3>
              ${headerSubtitle ? html`<p className="mt-0.5 truncate text-[11px] text-[#667085]">${headerSubtitle}</p>` : null}
            </div>
          </div>
          <button type="button" onClick=${onClose} aria-label="Red nedeni penceresini kapat" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E4E7EC] bg-white text-[#475467] transition hover:bg-[#F9FAFB]"><${CloseIcon} /></button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 pb-4 pt-4 sm:px-7">
          <div className="border-b border-[#EEF2F6] pb-3">
            <p className="text-[13px] leading-5 text-[#475467] [&_strong]:text-[#101828]">${isClient
              ? html`<strong className="font-semibold">${docLabel} dosyanız onaylanmadı.</strong> Aşağıdaki nota göre düzeltilen dosyanın yeniden yüklenmesi gerekmektedir.`
              : html`<strong className="font-semibold">${docLabel} dosyası onaylanmadı.</strong> Müşterinin aşağıdaki nota göre düzeltilen dosyayı yeniden yüklemesi bekleniyor.`}</p>
          </div>

          <div className="flex items-center gap-2.5 py-2.5">
            <img src=${detail.authorAvatarUrl || specialistAvatarUrl} alt=${authorName} className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-[#DCE3EC]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <strong className="text-[13px] font-semibold text-[#101828]">${authorName}</strong>
                    <span className="rounded-full bg-[#F2F4F7] px-2 py-0.5 text-[10px] font-medium text-[#667085]">İmplementasyon Uzmanı</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 pt-0.5 text-[11px] text-[#98A2B3]">
                  ${timestampParts.date ? html`<span>${timestampParts.date}</span>` : null}
                  ${timestampParts.date && timestampParts.time ? html`<span aria-hidden="true">·</span>` : null}
                  ${timestampParts.time ? html`<span>${timestampParts.time}</span>` : null}
                </div>
              </div>
            </div>
          </div>

          ${attachments.length > 0 ? html`
            <div className="border-t border-[#EEF2F6] pt-2">
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] text-[#98A2B3]">
                <span className="font-semibold uppercase tracking-[0.08em]">Ekler</span>
                <span aria-hidden="true">·</span>
                <span>${attachments.length} dosya</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                ${attachments.map((attachment, index) => {
                  return html`
                    <a
                      key=${`${attachment.name || "ek"}-${index}`}
                      href=${attachment.url || attachment.downloadUrl || undefined}
                      download=${attachment.name || ""}
                      className="flex h-[42px] w-[225px] shrink-0 items-center gap-2 rounded-[8px] border border-[#E1E6ED] bg-white px-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition hover:border-[#B9C9DF] hover:bg-[#FCFDFF]"
                    >
                      <${AttachmentTypeIcon} fileName=${attachment.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11.5px] font-medium text-[#344054]" title=${attachment.name}>${attachment.name || "Ek dosya"}</p>
                        ${attachment.size ? html`<p className="text-[9.5px] leading-3 text-[#98A2B3]">${Math.max(1, Math.round(attachment.size / 1024))} KB</p>` : null}
                      </div>
                      <svg className="shrink-0 text-[#98A2B3]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>
                    </a>
                  `
                })}
              </div>
            </div>
          ` : null}

          <div
            data-testid="reject-message-body"
            tabIndex="0"
            style=${{ scrollbarGutter: "stable" }}
            className=${classNames(
              "overflow-y-auto overscroll-contain rounded-[12px] border border-[#E1E7EF] bg-white px-5 py-4 outline-none shadow-[0_1px_2px_rgba(16,24,40,0.04)] focus:border-[#C8D4E3]",
              isLongMessage ? "min-h-0 flex-1" : "min-h-[180px] max-h-[52vh]",
              attachments.length > 0 ? "mt-2" : "mt-0"
            )}
          >
            <p className="whitespace-pre-wrap break-words text-[13px] leading-[1.75] text-[#344054]">${detail.reason || "Bu dosya için inceleme açıklaması bulunmuyor."}</p>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-[#E7ECF2] bg-white px-5 py-3">
          <img src="Assets/datassist-logo.png" alt="Datassist" className="h-[18px] w-auto max-w-[112px] object-contain opacity-80" />
          <div className="flex items-center gap-2">
            ${onUpload ? html`<button type="button" onClick=${onUpload} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[11px] bg-[#2F6FED] px-4 text-[13px] font-semibold text-white transition hover:bg-[#2563CC]"><${UploadIcon} />Dosya Yükle</button>` : null}
            <button type="button" onClick=${onClose} className="inline-flex h-10 items-center justify-center rounded-[11px] border border-[#D0D5DD] bg-white px-4 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]">Kapat</button>
          </div>
        </footer>
      </section>
    </div>
  `, document.body)
}

function ImplementationStepContent({
  activeStep,
  nextStepTitle = "",
  plannedDate,
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
  onOpenFileHistory,
  onResetDoc,
  onRemoveUploadedFile,
  onCompleteStep,
  onSendDecisions,
  userRole,
  assignee,
  customDocuments,
  removedDocIds,
  onTextResponse,
  onAddCustomDocument,
  onRemoveDocument,
  companyName = ""
}) {
  const tpl = implementationStepTemplates[activeStep.id]
  const allDocuments = useMemo(
    () => [...tpl.documents, ...(customDocuments || [])].filter((doc) => !(removedDocIds || []).includes(doc.id)),
    [tpl, customDocuments, removedDocIds]
  )
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditingCustomDocs, setIsEditingCustomDocs] = useState(false)
  const [openMenuDocId, setOpenMenuDocId] = useState(null)
  const [rejectDetail, setRejectDetail] = useState(null)
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false)
  const rejectDetailStepIdRef = useRef(activeStep.id)
  const autoShownRejectKeysRef = useRef(new Set())
  const [menuDirection, setMenuDirection] = useState("down")

  useEffect(() => {
    setIsAddModalOpen(false)
    setIsEditingCustomDocs(false)
    if (rejectDetailStepIdRef.current !== activeStep.id) {
      rejectDetailStepIdRef.current = activeStep.id
      setRejectDetail(null)
    }
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
    entries.forEach(({ label, responseType, file, description, required }) => onAddCustomDocument({ label, responseType, file, description, required }))
    setIsAddModalOpen(false)
  }
  const status = stepUpload ? stepUpload.status : "waiting"
  const submitted = stepUpload ? stepUpload.submitted : false
  const docs = stepUpload ? stepUpload.docs : {}
  const datassistDocs = stepUpload ? (stepUpload.datassistDocs || {}) : {}
  const docStatuses = stepUpload ? (stepUpload.docStatuses || {}) : {}
    const docReasons = stepUpload ? (stepUpload.docReasons || {}) : {}
    const docExampleFiles = stepUpload ? (stepUpload.docExampleFiles || {}) : {}
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
  const isClient = userRole === "editor" || userRole === "viewer"
  const statusMeta = getStageStatusMeta(status, isClient) || getImplementationTaskStatusMeta(status)
  const stepDescription = getImplementationStepDescription(activeStep.id, {
    isClient,
    hasTemplates: allDocuments.some((doc) => doc.responseType !== "text" && doc.templateUrl)
  })
  // Müşteri reddedilen bir dosyayı ilk gördüğünde red nedeni modalı kendiliğinden açılır (her red için bir kez).
  useEffect(() => {
    if (!isClient || rejectDetail) return
    const doc = allDocuments.find((item) => docStatuses[item.id] === "rejected" && getDocUploads(docs[item.id]).length > 0)
    if (!doc) return
    const uploads = getDocUploads(docs[doc.id])
    const latest = uploads[uploads.length - 1]
    const key = `${getDocUploadStateKey(activeStep.id, doc.id)}:${latest.id}`
    if (autoShownRejectKeysRef.current.has(key)) return
    autoShownRejectKeysRef.current.add(key)
    setRejectDetail({
      key,
      docId: doc.id,
      docLabel: doc.label,
      authorName: assignee,
      reason: latest.reviewReason || docReasons[doc.id] || "",
      attachments: latest.reviewAttachments || docExampleFiles[doc.id] || [],
      reviewedAt: latest.reviewedAt,
      uploadedAt: latest.uploadedAt
    })
  }, [isClient, activeStep.id, docs, docStatuses])

  const approvedDocLabels = allDocuments.filter((doc) => docStatuses[doc.id] === "approved").map((doc) => doc.label)
  const approvedDocLabelText = approvedDocLabels.length === 1 ? approvedDocLabels[0] : "Belgeleriniz"
  // Datassist hiç dosya eklemediyse müşteri bu sütunu görmez; operasyon her zaman görür.
  const showDatassistColumn = !isClient || allDocuments.some((doc) => getDocUploads(datassistDocs[doc.id]).length > 0)

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
  const requiredDocuments = allDocuments.filter((doc) => doc.required !== false)
  const missingInitialResponseCount = requiredDocuments.filter((doc) => getDocUploads(docs[doc.id]).length === 0).length
  const hasAllRequiredResponses = status === "revision_requested"
    ? requiredRevisionDocIds.length > 0 && pendingRevisionUploadCount === 0
    : requiredDocuments.length > 0 && missingInitialResponseCount === 0
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
  const canUploadClientDoc = !submitted && !isDocsApproved && !isStageCompleted && userRole !== "viewer"
  // Datassist dosyası müşterinin incelemeye gönderdiği yanıtın parçası değildir; uzman her aşamada dosya ekleyebilir.
  const canUploadDatassistDoc = isImpEkibi
  // Kararlar gönderilip Starter Kit onaylandığında onay sütunu "Aktarım" olarak kalır ve Sisteme Aktar butonunu taşır.
  const hasSetupAction = isImpEkibi && !isClient && status !== "pending_approval" && docStatuses["doc-starter-kit"] === "approved"
    && Boolean(window.StarterKitSetupLauncher) && allDocuments.some((doc) => doc.id === "doc-starter-kit")
  const showActionColumn = canReviewDocs || hasSetupAction
  const canUploadDoc = canUploadClientDoc
  const visibleDocuments = canReviewDocs && currentReviewCount > 0
    ? allDocuments.filter((doc) => {
        const hasUploads = getDocUploads(docs[doc.id]).length > 0
        return hasUploads && (pendingReviewDocIds.includes(doc.id) || docStatuses[doc.id] === "approved")
      })
    : allDocuments

  const statusDot = getStageStatusMeta(status, isClient)?.dot || {
    waiting:            "bg-[#D0D5DD]",
    uploaded:           "bg-[#93C5FD]",
    pending_approval:   "bg-[#F79009]",
    reviewing:          "bg-[#2F6FED]",
    revision_requested: "bg-[#F79009]",
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
      <${RejectionReasonDetailModal}
        detail=${rejectDetail}
        stepTitle=${tpl.title}
        isClient=${isClient}
        onClose=${() => setRejectDetail(null)}
        onUpload=${rejectDetail?.docId && canUploadClientDoc && docStatuses[rejectDetail.docId] !== "approved"
          ? () => {
              document.getElementById(`step-upload-${activeStep.id}-${rejectDetail.docId}`)?.click()
              setRejectDetail(null)
            }
          : null}
      />
      <div>
        <h2 className="text-[17px] font-semibold text-[#101828]">${tpl.title}</h2>
        <p className="mt-0.5 text-[13px] text-[#667085]">${stepDescription}</p>
      </div>

      <div className=${classNames(
        "rounded-[16px] border bg-white",
        status === "revision_requested"       ? "border-[#FEF0C7]"
        : isEditingCustomDocs                 ? "border-[#D5E2FF]"
        : isStageCompleted                    ? "border-[#ABEFC6]"
        : isDocsApproved                       ? "border-[#D4E8DC]"
        : status === "pending_approval"        ? (isClient ? "border-[#D5E2FF]" : "border-[#FDE68A]")
        : "border-[#E4E7EC]"
      )}>

        <!-- Card header: overall status -->
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[#F2F4F7]">
          <div className="flex items-center gap-2">
            <span className=${classNames("h-2 w-2 shrink-0 rounded-full", statusDot)}></span>
            <span className="text-[13px] font-semibold text-[#344054]">${tpl.title}</span>
            <span className=${classNames(
              "inline-flex h-[22px] items-center rounded-full border px-2.5 text-[11px] font-medium",
              statusMeta.badgeClass
            )}>${statusMeta.label}</span>
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
          </div>
        </div>

        <!-- Document rows -->
        <div className=${classNames("hidden items-center gap-0 border-b border-[#E4E7EC] bg-[#F8FAFC] px-5", showActionColumn ? "xl:grid xl:grid-cols-[minmax(150px,190px)_180px_minmax(200px,1fr)_minmax(240px,1.2fr)_180px]" : showDatassistColumn ? "xl:grid xl:grid-cols-[minmax(190px,250px)_180px_minmax(220px,1fr)_minmax(220px,1fr)]" : "xl:grid xl:grid-cols-[minmax(190px,300px)_180px_minmax(260px,1fr)]")}>
          <div className="py-2.5 pr-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#667085]">Dosya / Belge</div>
          <div className="border-l border-[#E4E7EC] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#667085]">Şablon</div>
          ${showDatassistColumn ? html`
            <div className="flex items-center gap-2 border-l border-[#E4E7EC] px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-[#2F6FED]"></span>
              <span className="text-[11px] font-semibold text-[#344054]">Datassist</span>
            </div>
          ` : null}
          <div className="flex items-center gap-2 border-l border-[#E4E7EC] px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-[#7F56D9]"></span>
            <span className="text-[11px] font-semibold text-[#344054]">Müşteri</span>
          </div>
          ${showActionColumn ? html`<div className="border-l border-[#E4E7EC] py-2.5 pl-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#667085]">${canReviewDocs ? "Onay" : "Aktarım"}</div>` : null}
        </div>
        <div className="divide-y divide-[#F2F4F7]">
          ${visibleDocuments.map((doc) => {
            const docUploads = getDocUploads(docs[doc.id])
            const datassistDocUploads = getDocUploads(datassistDocs[doc.id])
            const latestUpload = docUploads[docUploads.length - 1] || null
            const latestDatassistUpload = datassistDocUploads[datassistDocUploads.length - 1] || null
            const historicalUploads = docUploads.slice(0, -1).reverse()
            const hasUploads = docUploads.length > 0
            const isDragActive = dragDocId === `${doc.id}:client`
            const isDatassistDragActive = dragDocId === `${doc.id}:datassist`
            const docStatus = docStatuses[doc.id] || null
            const docReason = docReasons[doc.id] || ""
            const isRejectTarget = rejectComposer?.stepId === activeStep.id && rejectComposer?.docId === doc.id
            const uploadListKey = getDocUploadStateKey(activeStep.id, doc.id)
            const isUploadListExpanded = Boolean(expandedUploadDocIds?.[uploadListKey])
            const latestUploadParts = latestUpload ? splitTimestampParts(latestUpload.uploadedAt) : { date: "", time: "" }
            const latestRejectDetailKey = `${uploadListKey}:${latestUpload?.id || "latest"}`
            const latestRejectReason = latestUpload?.reviewReason || docReason
            const isTextResponse = doc.responseType === "text"
            const textResponse = isTextResponse ? (latestUpload?.text || "") : ""
            const canUploadThisDoc = !isTextResponse && canUploadDoc && docStatus !== "approved"
            const documentAccept = getImplementationDocumentAccept(doc)
            const fileInputId = `step-upload-${activeStep.id}-${doc.id}`
            const datassistFileInputId = `step-upload-${activeStep.id}-${doc.id}-datassist`
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
                docStatus === "approved" ? "border-[#ABEFC6] bg-[#ECFDF3] text-[#065F46]" : docStatus === "rejected" ? "border-[#FEC84B] bg-white text-[#344054]" : "border-[#E4E7EC] bg-[#F9FAFB] text-[#344054]"
              )}>
                <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                  Metin yanıtı
                </div>
                <div className="whitespace-pre-wrap break-words">${textResponse}</div>
              </div>
            ` : html`
              <div className="space-y-1.5">
                <div className=${classNames(
                  "flex min-w-0 items-center gap-2 rounded-[7px] border px-2.5 py-2",
                  docStatus === "approved" ? "border-[#ABEFC6] bg-[#ECFDF3]" : docStatus === "rejected" ? "border-[#FEC84B] bg-white" : "border-[#E4E7EC] bg-[#F9FAFB]"
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
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick=${() => setRejectDetail({
                      key: latestRejectDetailKey,
                      docId: doc.id,
                      docLabel: doc.label,
                      authorName: assignee,
                      reason: latestRejectReason,
                      attachments: latestUpload.reviewAttachments || docExampleFiles[doc.id] || [],
                      reviewedAt: latestUpload.reviewedAt,
                      uploadedAt: latestUpload.uploadedAt
                    })}
                    className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[#FDA29B] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#D92D20] transition hover:bg-[#FEF3F2]"
                  >
                    Red Nedeni
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M4 10L10 4M5 4h5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
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
              </div>
            ` : null

            const expandedList = isUploadListExpanded ? html`
              <div id=${`upload-history-${activeStep.id}-${doc.id}`} className="space-y-2 rounded-[9px] border border-[#EAECF0] bg-[#FCFCFD] p-2.5">
                ${historicalUploads.map((file) => {
                  const uploadParts = splitTimestampParts(file.uploadedAt)
                  const fileReviewStatus = file.reviewStatus || null
                  const fileIsRejected = fileReviewStatus === "rejected"
                  const fileIsApproved = fileReviewStatus === "approved"
                  const rejectDetailKey = `${uploadListKey}:${file.id}`
                  return html`
                  <div key=${file.id} className="space-y-1.5">
                    <div className=${classNames(
                        "flex min-w-0 items-center gap-2 rounded-[7px] border px-2.5 py-2",
                        fileIsRejected
                          ? "border-[#FECACA] bg-[#FFF5F5]"
                          : fileIsApproved
                          ? "border-[#C7E9D4] bg-[#F4FFF8]"
                          : "border-[#F2F4F7] bg-white"
                      )}>
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
                      <button
                        type="button"
                        aria-haspopup="dialog"
                        onClick=${() => setRejectDetail({
                          key: rejectDetailKey,
                          docId: doc.id,
                          docLabel: doc.label,
                          authorName: assignee,
                          reason: file.reviewReason,
                          attachments: file.reviewAttachments || [],
                          reviewedAt: file.reviewedAt,
                          uploadedAt: file.uploadedAt
                        })}
                        className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[#FDA29B] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#D92D20] transition hover:bg-[#FEF3F2]"
                      >
                        Red Nedeni
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M4 10L10 4M5 4h5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    ` : fileIsApproved ? html`
                      <span className="shrink-0 inline-flex items-center rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[10px] font-semibold text-[#067647]">
                        Onaylandı
                      </span>
                    ` : null}
                    ${canUploadClientDoc && docStatus !== "approved" && !fileReviewStatus ? html`
                      <button type="button" aria-label="${file.name} dosyasını sil" title="Dosyayı sil" onClick=${() => onRemoveUploadedFile(doc.id, file.id, "client")} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] border border-[#FEE4E2] bg-white text-[#D92D20] hover:bg-[#FEF3F2]"><${TrashIcon} /></button>
                    ` : null}
                    </div>
                  </div>
                `})}
              </div>
            ` : null

            const renderPartyFileCell = ({ owner, uploads, latest, canUpload, inputId, dragActive }) => {
              const isDatassistOwner = owner === "datassist"
              const isRejectedClientFile = !isDatassistOwner && docStatus === "rejected"
              const openLatestRejectDetail = () => setRejectDetail({
                key: latestRejectDetailKey,
                docId: doc.id,
                docLabel: doc.label,
                authorName: assignee,
                reason: latestRejectReason,
                attachments: latest?.reviewAttachments || docExampleFiles[doc.id] || [],
                reviewedAt: latest?.reviewedAt,
                uploadedAt: latest?.uploadedAt
              })
              const isApprovedClientFile = !isDatassistOwner && docStatus === "approved"
              const timestamp = latest ? splitTimestampParts(latest.uploadedAt) : { date: "", time: "" }
              const ownerLabel = isDatassistOwner ? "Datassist" : "Müşteri"
              const ownerTone = isDatassistOwner
                ? { dot: "bg-[#2F6FED]", icon: "text-[#2F6FED]", hover: "hover:border-[#B2CCFF] hover:bg-[#F5F8FF]" }
                : { dot: "bg-[#7F56D9]", icon: "text-[#7F56D9]", hover: "hover:border-[#D6BBFB] hover:bg-[#F9F5FF]" }

              return html`
                <div
                  className=${classNames(
                    "group/cell min-w-0 rounded-[9px] border px-2.5 py-2 transition",
                    dragActive
                      ? (isDatassistOwner ? "border-[#84ADFF] bg-[#EFF4FF]" : "border-[#B692F6] bg-[#F9F5FF]")
                      : isRejectedClientFile ? "border-[#FEC84B] bg-white"
                      : isApprovedClientFile ? "border-[#ABEFC6] bg-[#ECFDF3]"
                      : latest ? "border-[#E4E7EC] bg-white"
                      : isDatassistOwner ? "border-transparent px-0"
                      : "border-dashed border-[#D8DEE8] bg-[#FCFCFD]",
                    canUpload && ownerTone.hover
                  )}
                  onDragOver=${canUpload ? (event) => { event.preventDefault(); onDragStateChange(`${doc.id}:${owner}`) } : undefined}
                  onDragLeave=${canUpload ? () => onDragStateChange("") : undefined}
                  onDrop=${canUpload ? (event) => {
                    onDragStateChange("")
                    onFileDropped(doc.id, event, owner)
                  } : undefined}
                >
                  ${latest ? html`
                    <div className="flex min-w-0 items-center gap-2">
                      <span className=${classNames("flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-white/80", ownerTone.icon)}>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6.5 2.5h5l3 3v10.25a1.75 1.75 0 0 1-1.75 1.75h-6.5a1.75 1.75 0 0 1-1.75-1.75V4.25A1.75 1.75 0 0 1 6.25 2.5h.25Z" stroke="currentColor" strokeWidth="1.35"/><path d="M11.5 2.75V6h3.25M7.5 10h5M7.5 13h3.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <a
                          href=${latest.downloadUrl}
                          download=${latest.name}
                          className="block break-all text-[10.5px] font-semibold leading-[14px] text-[#344054] hover:text-[#2F6FED]"
                          title=${latest.name}
                        >${latest.name}</a>
                        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[9px] leading-3 text-[#98A2B3]">
                          <span>${ownerLabel}</span>
                          ${timestamp.date ? html`<span>·</span><span>${timestamp.date}</span>` : null}
                          ${timestamp.time ? html`<span>${timestamp.time}</span>` : null}
                          ${uploads.length > 1 ? html`<span>· ${uploads.length} sürüm</span>` : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        ${!isDatassistOwner && uploads.length > 1 ? html`
                          <button
                            type="button"
                            aria-label="Dosya geçmişini aç (${uploads.length} sürüm)"
                            title="Dosya geçmişi (${uploads.length} sürüm)"
                            onClick=${onOpenFileHistory}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[#D0D5DD] bg-white text-[#475467] transition hover:bg-[#F9FAFB]"
                          ><svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.2 6.1A6 6 0 1 1 2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M2.2 2.8v3.5h3.5M8 4.7v3.5l2.3 1.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                        ` : null}
                        ${isRejectedClientFile && doc.id !== "doc-starter-kit" ? html`
                          <button
                            type="button"
                            aria-haspopup="dialog"
                            aria-label="Red nedenini görüntüle"
                            title="Red nedenini görüntüle"
                            onClick=${() => setRejectDetail({
                              key: latestRejectDetailKey,
                              docId: doc.id,
                              docLabel: doc.label,
                              authorName: assignee,
                              reason: latestRejectReason,
                              attachments: latest.reviewAttachments || docExampleFiles[doc.id] || [],
                              reviewedAt: latest.reviewedAt,
                              uploadedAt: latest.uploadedAt
                            })}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[#FEC84B] bg-white text-[#B54708] transition hover:bg-[#FFFAEB]"
                          ><svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.25"/><path d="M7 4.1v3.2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/><circle cx="7" cy="9.7" r=".7" fill="currentColor"/></svg></button>
                        ` : null}
                        ${canUpload ? html`
                          <button
                            type="button"
                            aria-label="Dosya Yükle"
                            title="Dosya Yükle"
                            onClick=${() => document.getElementById(inputId)?.click()}
                            className=${classNames(
                              "inline-flex h-7 shrink-0 items-center gap-1 rounded-[7px] border bg-white px-2 text-[10px] font-semibold transition",
                              isDatassistOwner ? "border-[#B2CCFF] text-[#175CD3] hover:bg-[#EFF4FF]" : "border-[#D6BBFB] text-[#6941C6] hover:bg-[#F9F5FF]"
                            )}
                          ><${UploadIcon} />Dosya Yükle</button>
                        ` : null}
                        ${canUpload && (isDatassistOwner || (latest.reviewStatus !== "rejected" && docStatus !== "rejected")) ? html`
                          <button
                            type="button"
                            aria-label="${latest.name} dosyasını sil"
                            title="Dosyayı sil"
                            onClick=${() => onRemoveUploadedFile(doc.id, latest.id, owner)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[#FEE4E2] bg-white text-[#D92D20] transition hover:bg-[#FEF3F2]"
                          ><${TrashIcon} /></button>
                        ` : null}
                      </div>
                    </div>
                  ` : isDatassistOwner ? (canUpload ? html`
                    <button
                      type="button"
                      onClick=${() => document.getElementById(inputId)?.click()}
                      title="Datassist dosyası eklemek isteğe bağlıdır"
                      className="inline-flex h-7 shrink-0 items-center gap-1 rounded-[7px] border border-[#B2CCFF] bg-white px-2 text-[10.5px] font-semibold text-[#175CD3] transition hover:bg-[#EFF4FF]"
                    ><${UploadIcon} />Yükle</button>
                  ` : null) : html`
                    <div className="flex min-w-0 items-center gap-2">
                      <span className=${classNames("h-2 w-2 shrink-0 rounded-full", ownerTone.dot, "opacity-45")}></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11.5px] font-medium text-[#667085]">Henüz dosya yüklenmedi</p>
                        ${canUpload ? html`<p className="mt-0.5 text-[9.5px] text-[#98A2B3]">Dosya seçin veya buraya sürükleyin</p>` : null}
                      </div>
                      ${canUpload ? html`
                        <button
                          type="button"
                          onClick=${() => document.getElementById(inputId)?.click()}
                          className=${classNames(
                            "inline-flex h-7 shrink-0 items-center gap-1 rounded-[7px] border bg-white px-2 text-[10.5px] font-semibold transition",
                            isDatassistOwner ? "border-[#B2CCFF] text-[#175CD3] hover:bg-[#EFF4FF]" : "border-[#D6BBFB] text-[#6941C6] hover:bg-[#F9F5FF]"
                          )}
                        ><${UploadIcon} />Yükle</button>
                      ` : null}
                    </div>
                  `}
                  ${latest && !isDatassistOwner && doc.id === "doc-starter-kit" ? html`<${StarterKitReview}
                    file=${latest}
                    isClient=${isClient}
                    canReview=${canReviewDocs && isPendingReviewDoc && !docStatus}
                    onApprove=${() => onApproveDoc(doc.id)}
                    onReject=${() => onRejectDoc(doc.id, doc.label)}
                    onShowRejectReason=${isRejectedClientFile ? openLatestRejectDetail : undefined}
                  />` : null}
                  ${canUpload ? html`
                    <input id=${inputId} type="file" multiple onChange=${(event) => onFileSelected(doc.id, event, owner)} accept=${documentAccept} tabIndex="-1" className="hidden" />
                  ` : null}
                </div>
              `
            }

            const datassistFileCell = !isTextResponse
              ? renderPartyFileCell({
                  owner: "datassist",
                  uploads: datassistDocUploads,
                  latest: latestDatassistUpload,
                  canUpload: canUploadDatassistDoc,
                  inputId: datassistFileInputId,
                  dragActive: isDatassistDragActive
                })
              : html`<div className="rounded-[10px] border border-dashed border-[#E4E7EC] bg-[#FCFCFD] px-3 py-3 text-[11px] text-[#98A2B3]">Bu alan metin yanıtı kabul eder.</div>`

            const clientFileCell = !isTextResponse
              ? renderPartyFileCell({
                  owner: "client",
                  uploads: docUploads,
                  latest: latestUpload,
                  canUpload: canUploadClientDoc && docStatus !== "approved",
                  inputId: fileInputId,
                  dragActive: isDragActive
                })
              : null

            const actionButtons = html`
              <div className="flex w-full min-w-0 items-center gap-1.5">
                ${canReviewDocs && hasUploads ? html`
                  ${docStatus === "approved" ? html`
                    <span className="inline-flex items-center gap-1 rounded-[7px] border border-[#ABEFC6] bg-[#ECFDF3] px-2.5 py-1.5 text-[12px] font-medium text-[#067647]">
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#067647" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>Onaylandı
                    </span>
                    <button type="button" onClick=${() => onResetDoc(doc.id)} className="shrink-0 inline-flex items-center gap-1 rounded-[7px] border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#667085] hover:bg-[#F9FAFB] transition">
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M3.25 4.25H8a3 3 0 1 1 0 6H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M3.5 1.75L1 4.25l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>Geri Al
                    </button>
                  ` : docStatus === "rejected" ? html`
                    <span className="inline-flex items-center gap-1 rounded-[7px] border border-[#FDA29B] bg-[#FEF3F2] px-2.5 py-1.5 text-[12px] font-medium text-[#D92D20]">
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="#D92D20" strokeWidth="1.5" strokeLinecap="round"/></svg>Reddedildi
                    </span>
                    <button type="button" onClick=${() => onResetDoc(doc.id)} className="shrink-0 inline-flex items-center gap-1 rounded-[7px] border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#667085] hover:bg-[#F9FAFB] transition">Geri Al</button>
                  ` : isPendingReviewDoc ? html`
                    <button type="button" onClick=${() => onRejectDoc(doc.id, doc.label)} className="inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-[8px] border border-[#FDA29B] bg-[#FEF3F2] px-2 text-[11.5px] font-semibold text-[#B42318] transition hover:border-[#F97066] hover:bg-[#FEE4E2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D92D20]">
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>Reddet
                    </button>
                    <button type="button" onClick=${() => onApproveDoc(doc.id)} className="inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-[8px] border border-[#ABEFC6] bg-[#ECFDF3] px-2 text-[11.5px] font-semibold text-[#067647] transition hover:border-[#75E0A7] hover:bg-[#D1FADF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#067647]">
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>Onayla
                    </button>
                  ` : null}
                ` : null}
              </div>
            `

            const approvedAt = docStatus === "approved" ? (latestUpload?.reviewedAt || stepUpload?.reviewedAt || "") : ""
            const rowStatus = docStatus === "approved" && hasUploads && status !== "pending_approval"
              ? { text: `Onaylandı${approvedAt ? ` · ${formatShortSubmittedAt(approvedAt)}` : ""}`, tone: "green" }
              : isStageCompleted || docStatus === "rejected"
              ? null
              : !hasUploads
                ? (doc.required === false
                    ? { text: "İsteğe bağlı", tone: "gray" }
                    : status === "pending_approval" || isDocsApproved
                      ? null
                      : getCustomerPendingStatus({ plannedDate, isClient, responseKind: isTextResponse ? "text" : "file" }))
                : status === "pending_approval" && isPendingReviewDoc
                  ? (isClient
                      ? { text: "Datassist ekibi tarafından inceleniyor", tone: "blue" }
                      : { text: "İncelemenizi bekliyor", tone: "amber" })
                  : !submitted && status !== "revision_requested"
                    ? (isClient
                        ? { text: "Yüklendi · Onaya gönderilmedi", tone: "blue" }
                        : { text: "Müşteri yükledi · Onaya gönderilmedi", tone: "gray" })
                    : null

            return html`
              <div key=${doc.id} className=${classNames("px-5 py-3 transition", isRejectTarget && "bg-[#FFF9F5]")}>
                <div className=${classNames("grid grid-cols-1 gap-3", showActionColumn ? "xl:items-center xl:gap-0 xl:grid-cols-[minmax(150px,190px)_180px_minmax(200px,1fr)_minmax(240px,1.2fr)_180px]" : showDatassistColumn ? "xl:items-center xl:gap-0 xl:grid-cols-[minmax(190px,250px)_180px_minmax(220px,1fr)_minmax(220px,1fr)]" : "xl:items-center xl:gap-0 xl:grid-cols-[minmax(190px,300px)_180px_minmax(260px,1fr)]")}>
                  <div className=${classNames("min-w-0", canReviewDocs ? "xl:pr-4" : "xl:pr-4")}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-[#344054]">${doc.label}</span>
                      <${InfoTooltip} text=${doc.description} />
                    </div>
                    <${DocStatusLine} status=${rowStatus} />
                  </div>

                  <div className=${classNames("flex min-w-0 items-center gap-1", canReviewDocs ? "xl:border-l xl:border-[#EEF2F6] xl:px-4" : "xl:border-l xl:border-[#EEF2F6] xl:px-4")}>
                    <span className=${classNames("text-[10px] font-semibold uppercase tracking-[0.06em] text-[#667085]", canReviewDocs ? "xl:hidden" : "xl:hidden")}>Şablon</span>
                    ${!isTextResponse && isEditingCustomDocs && isImpEkibi ? html`
                      <button type="button" onClick=${() => document.getElementById(templateInputId)?.click()} className="inline-flex h-[26px] items-center gap-1 whitespace-nowrap rounded-[7px] border border-[#D0D5DD] bg-white px-2 text-[11px] font-medium text-[#344054] transition hover:bg-[#F9FAFB]"><${UploadIcon} />${hasTemplate ? "Şablon Değiştir" : "Şablon Yükle"}</button>
                    ` : !isTextResponse && hasTemplate ? html`
                      <button
                        type="button"
                        onClick=${() => downloadTemplateFile({ ...doc, templateName })}
                        aria-label="${doc.label} şablonunu indir"
                        className="inline-flex h-8 min-w-[130px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] border border-[#B2CCFF] bg-[#EFF4FF] px-2.5 text-[11px] font-semibold text-[#175CD3] transition hover:border-[#84ADFF] hover:bg-[#DCE8FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6FED]"
                      ><${DownloadIcon} />Şablon İndir</button>
                    ` : html`<span className="text-[11px] text-[#98A2B3]">—</span>`}
                    ${isImpEkibi && isEditingCustomDocs ? html`
                      <button type="button" title="Alanı sil" aria-label="Alanı sil" onClick=${() => { if (window.confirm("Bu alanı silmek istediğinize emin misiniz?")) onRemoveDocument(doc) }} className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[7px] text-[#667085] hover:bg-[#FEF3F2] hover:text-[#D92D20]"><${TrashIcon} /></button>
                    ` : null}
                    ${!isTextResponse && isEditingCustomDocs && isImpEkibi ? html`<input id=${templateInputId} type="file" onChange=${(e) => handleTemplateFileSelected(doc.id, e)} tabIndex="-1" className="hidden" />` : null}
                  </div>

                  ${showDatassistColumn ? html`
                    <div className=${classNames("min-w-0", canReviewDocs ? "xl:border-l xl:border-[#EEF2F6] xl:px-4" : "xl:border-l xl:border-[#EEF2F6] xl:px-4")}>
                      <div className=${classNames("mb-1.5 flex items-center gap-1.5", canReviewDocs ? "xl:hidden" : "xl:hidden")}>
                        <span className="h-2 w-2 rounded-full bg-[#2F6FED]"></span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#667085]">Datassist</span>
                      </div>
                      ${datassistFileCell}
                    </div>
                  ` : null}

                  <div className=${classNames("min-w-0 space-y-2", canReviewDocs ? "xl:border-l xl:border-[#EEF2F6] xl:px-4" : "xl:border-l xl:border-[#EEF2F6] xl:px-4")}>
                    <div className=${classNames("mb-1.5 flex items-center gap-1.5", canReviewDocs ? "xl:hidden" : "xl:hidden")}>
                      <span className="h-2 w-2 rounded-full bg-[#7F56D9]"></span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#667085]">Müşteri</span>
                    </div>
                    ${isTextResponse && !isImpEkibi && canUploadDoc && docStatus !== "approved" && status !== "pending_approval" ? html`
                      <textarea
                        rows="2"
                        value=${textResponse}
                        onInput=${(event) => onTextResponse(doc.id, event.target.value)}
                        placeholder="Yanıtınızı buraya yazın…"
                        className="w-full resize-none rounded-[9px] border border-[#D5DBE5] bg-white px-3 py-2 text-[12.5px] leading-5 text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
                      />
                    ` : isTextResponse ? fileChip : clientFileCell}
                    ${hasUploads && templateChangeNotice ? html`
                      <div className="flex items-start gap-2 rounded-[8px] border border-[#FDE68A] bg-[#FFFAEB] px-2.5 py-2 text-[11px] leading-4 text-[#B54708]">
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0"><path d="M7 1.5l5.5 10H1.5L7 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M7 5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="10" r=".7" fill="currentColor"/></svg>
                        ${templateChangeNotice === "removed"
                          ? "Şablon kaldırıldı. Daha önce yüklediğiniz yanıt korunuyor."
                          : "Şablon güncellendi. Daha önce yüklediğiniz dosyanın güncel şablona uygunluğunu kontrol edin."}
                      </div>
                    ` : null}
                    ${!hasUploads && isTextResponse && (isImpEkibi || !canUploadDoc) ? html`
                      <div className="px-1 py-1 text-[12px] text-[#98A2B3]">Henüz yanıtlanmadı</div>
                    ` : null}
                  </div>

                  ${showActionColumn ? html`<div className="flex min-w-0 items-center xl:border-l xl:border-[#EEF2F6] xl:pl-4">
                    ${canReviewDocs
                      ? actionButtons
                      : doc.id === "doc-starter-kit" && latestUpload ? html`<${window.StarterKitSetupLauncher} compact=${true} file=${latestUpload} groupName=${companyName} />` : null}
                  </div>` : null}
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
                  ? isClient
                    ? requiredRevisionDocIds.length === 1
                      ? `${allDocuments.find((doc) => doc.id === requiredRevisionDocIds[0])?.label || "Belge"} için revize talep edildi. Düzeltilen dosyanın yeniden yüklenip onaya gönderilmesi gerekmektedir.`
                      : `${requiredRevisionDocIds.length} belge için revize talep edildi. Düzeltilen dosyaların yeniden yüklenip onaya gönderilmesi gerekmektedir.`
                    : `Revize talep edildi · Müşterinin düzeltilen ${requiredRevisionDocIds.length === 1 ? "dosyayı" : "dosyaları"} yeniden yüklemesi bekleniyor.`
                  : isClient
                    ? "Düzeltilen dosya yüklendi. Yeniden incelemeye iletilmesi için onaya gönderilmesi gerekmektedir."
                    : "Müşteri düzeltilen dosyayı yükledi; onaya gönderilmesi bekleniyor."
                : "Revizyon notu mesajlar alanında paylaşıldı. Revize istenen yanıtları güncelleyip yeniden gönderin."}
            </span>
          ` : isStageCompleted ? html`
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#067647" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-[12px] font-medium text-[#067647]">Aşama tamamlandı. Bu alan artık yalnızca görüntülenebilir.</span>
            </div>
          ` : isDocsApproved ? html`
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#2D6A4F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-[12px] font-medium text-[#2D6A4F]">${isClient
                ? `${approvedDocLabelText} onaylandı.${nextStepTitle ? ` ${tpl.title} tamamlandığında ${nextStepTitle} aşaması açılacak ve size bildirim gönderilecek.` : ` ${tpl.title} tamamlandığında size bildirim gönderilecek.`}`
                : "Tüm belgeler onaylandı. Bir sonraki aşamanın açılması için aşamanın tamamlanması gerekmektedir."}</span>
            </div>
          ` : status === "pending_approval" ? isClient ? html`
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#2F6FED" strokeWidth="1.3"/><path d="M7 4.5v3l1.5 1.5" stroke="#2F6FED" strokeWidth="1.3" strokeLinecap="round"/></svg>
              <span className="text-[12px] text-[#175CD3]">${currentReviewCount || uploadedCount} belge Datassist ekibi tarafından inceleniyor. İnceleme tamamlandığında bildirim gönderilecek.</span>
            </div>
          ` : html`
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#F79009" strokeWidth="1.3"/><path d="M7 4.5v3l1.5 1.5" stroke="#F79009" strokeWidth="1.3" strokeLinecap="round"/></svg>
                <span className="text-[12px] font-medium text-[#B54708]">${currentReviewCount || uploadedCount} belge incelemenizi bekliyor${stepUpload?.submittedAt ? ` · Gönderim: ${stepUpload.submittedAt}` : ""}</span>
              </div>
              <p className="mt-0.5 pl-[19px] text-[11px] text-[#98A2B3]">Kararlar gönderilene kadar müşteriye iletilmez.</p>
            </div>
          ` : uploadedCount > 0 ? html`
            <span className="text-[12px] text-[#667085]">
              ${isClient
                ? missingInitialResponseCount > 0
                  ? `${uploadedCount} belge yüklendi · ${missingInitialResponseCount} zorunlu belge daha bekleniyor.`
                  : `${uploadedCount} belge yüklendi. Belgelerin Datassist incelemesine iletilmesi için onaya gönderilmesi gerekmektedir.`
                : `Müşteri ${uploadedCount} belge yükledi; henüz onaya gönderilmedi.`}
            </span>
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
              Kararları Gönder (${pendingReviewDocIds.filter((id) => docStatuses[id] === "approved" || docStatuses[id] === "rejected").length}/${currentReviewCount})
            </button>
          ` : isImpEkibi && isDocsApproved ? html`
            <button
              type="button"
              onClick=${onCompleteStep}
              className="shrink-0 inline-flex items-center gap-2 rounded-[9px] bg-[#067647] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#05603A]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Aşamayı Tamamla
            </button>
          ` : canSubmit && !isDocsApproved && !isStageCompleted ? html`
            <button
              type="button"
              onClick=${submitEnabled ? () => setIsSubmitConfirmOpen(true) : undefined}
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
          ` : null}
        </div>
      </div>

      <${SubmitForApprovalConfirmModal}
        isOpen=${isSubmitConfirmOpen}
        items=${allDocuments
          .filter((doc) => status === "revision_requested" ? requiredRevisionDocIds.includes(doc.id) : getDocUploads(docs[doc.id]).length > 0)
          .map((doc) => ({ id: doc.id, label: doc.label, latest: getDocUploads(docs[doc.id]).at(-1) || null }))}
        onCancel=${() => setIsSubmitConfirmOpen(false)}
        onConfirm=${() => { setIsSubmitConfirmOpen(false); onSubmitForApproval() }}
      />

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
  const [dasiExport, setDasiExport] = useState(() => window.KnowHowStore?.getLastExport(companyName) || null)
  const [isDasiModalOpen, setIsDasiModalOpen] = useState(false)
  const [isDasiRedirectOpen, setIsDasiRedirectOpen] = useState(false)
  const KnowHowDasiModal = window.KnowHowDasiModal
  const KnowHowDasiRedirect = window.KnowHowDasiRedirect
  const knowHowProgress = window.KnowHowStore?.getProgress(companyName)
  const dasiStale = Boolean(dasiExport) && Boolean(window.KnowHowStore?.isStale(companyName))

  const isImpEkibi = userRole === "imp_ekibi" || !userRole
  const isStageCompleted = stepUpload?.status === "completed" || stepUpload?.status === "approved"
  const dasiDone = Boolean(dasiExport)
  const allDone = copyDone && ogyMtDone && dasiDone
  const completedCount = [copyDone, ogyMtDone, dasiDone].filter(Boolean).length
  const statusMeta = isStageCompleted
    ? { dot: "bg-[#12B76A]", badgeClass: "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]", label: "Tamamlandı" }
    : allDone
      ? { dot: "bg-[#12B76A]", badgeClass: "border-[#D4E8DC] bg-[#F8FCF9] text-[#2D6A4F]", label: "Tamamlanmaya Hazır" }
      : { dot: "bg-[#2F6FED]", badgeClass: "border-[#D5E2FF] bg-[#EFF4FF] text-[#175CD3]", label: "Devam Ediyor" }

  const checkIcon = html`<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>`
  const copyIcon = html`<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4.5" y="2.5" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 11.5H4A1.5 1.5 0 0 1 2.5 10V4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>`
  const assignIcon = html`<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5.25" cy="4.25" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M1.75 11c.35-2 1.55-3 3.5-3 1.1 0 1.95.3 2.55.9M10.5 6.5v4M8.5 8.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>`
  const lockIcon = html`<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="2.75" y="6" width="8.5" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>`
  const completedIcon = html`<span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white/70">${checkIcon}</span>`

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
            ? "shrink-0 inline-flex h-9 min-w-[146px] cursor-default items-center justify-center gap-2 rounded-[10px] border border-[#ABEFC6] bg-[#ECFDF3] px-3.5 text-[12px] font-semibold text-[#067647] whitespace-nowrap"
            : (!isImpEkibi || isStageCompleted)
              ? "shrink-0 inline-flex h-9 min-w-[146px] cursor-not-allowed items-center justify-center gap-2 rounded-[10px] border border-[#EAECF0] bg-[#F8F9FB] px-3.5 text-[12px] font-semibold text-[#98A2B3] whitespace-nowrap"
              : "shrink-0 inline-flex h-9 min-w-[146px] items-center justify-center gap-2 rounded-[10px] border border-[#2F6FED] bg-[#2F6FED] px-3.5 text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(16,24,40,0.08),0_4px_10px_rgba(47,111,237,0.18)] transition-all duration-150 hover:-translate-y-px hover:border-[#2563CC] hover:bg-[#2563CC] hover:shadow-[0_2px_4px_rgba(16,24,40,0.10),0_6px_14px_rgba(47,111,237,0.22)] active:translate-y-0 whitespace-nowrap"
          }
        >
          ${copyDone ? completedIcon : copyIcon}
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
            ? "shrink-0 inline-flex h-9 min-w-[146px] cursor-default items-center justify-center gap-2 rounded-[10px] border border-[#ABEFC6] bg-[#ECFDF3] px-3.5 text-[12px] font-semibold text-[#067647] whitespace-nowrap"
            : (!isImpEkibi || isStageCompleted || !copyDone)
              ? "shrink-0 inline-flex h-9 min-w-[146px] cursor-not-allowed items-center justify-center gap-2 rounded-[10px] border border-[#EAECF0] bg-[#F8F9FB] px-3.5 text-[12px] font-semibold text-[#98A2B3] whitespace-nowrap"
              : "shrink-0 inline-flex h-9 min-w-[146px] items-center justify-center gap-2 rounded-[10px] border border-[#2F6FED] bg-[#2F6FED] px-3.5 text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(16,24,40,0.08),0_4px_10px_rgba(47,111,237,0.18)] transition-all duration-150 hover:-translate-y-px hover:border-[#2563CC] hover:bg-[#2563CC] hover:shadow-[0_2px_4px_rgba(16,24,40,0.10),0_6px_14px_rgba(47,111,237,0.22)] active:translate-y-0 whitespace-nowrap"
          }
        >
          ${ogyMtDone ? completedIcon : !copyDone ? lockIcon : assignIcon}
          ${ogyMtDone ? "Atandı" : "Sorumluları Ata"}
        </button>
      `
    },
    {
      id: "dasi",
      number: "03",
      title: "Know-How'ı Dasi'ye Aktar",
      desc: dasiStale
        ? `Know-How, v${dasiExport.version} aktarımından sonra güncellendi; Dasi'deki bilgi eski.`
        : dasiDone
        ? `Dasi, workgroup için ${dasiExport.docCount} doküman aldı (v${dasiExport.version}).`
        : `Teknik dokümantasyon workgroup bazında Dasi'ye gönderilir${knowHowProgress ? ` · Know-How %${knowHowProgress.pct} dolu` : ""}.`,
      done: dasiDone,
      action: html`
        <div className="flex shrink-0 items-center gap-2">
        ${dasiDone && KnowHowDasiRedirect ? html`
          <button
            type="button"
            onClick=${() => setIsDasiRedirectOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-[linear-gradient(135deg,#2563EB_0%,#6D4AE8_100%)] pl-1.5 pr-3.5 text-[12px] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(79,70,229,0.6)] transition-all duration-150 hover:-translate-y-px hover:brightness-110 whitespace-nowrap"
          >
            <img src="Assets/dasi/dasi-avatar.png" alt="" className="h-6 w-6 rounded-full bg-white" />
            Dasi'de Aç
          </button>
        ` : null}
        <button
          type="button"
          disabled=${!isImpEkibi || (dasiDone && !dasiStale) || !KnowHowDasiModal}
          onClick=${dasiDone && !dasiStale ? undefined : () => setIsDasiModalOpen(true)}
          className=${dasiDone && !dasiStale
            ? "shrink-0 inline-flex h-9 min-w-[146px] cursor-default items-center justify-center gap-2 rounded-[10px] border border-[#ABEFC6] bg-[#ECFDF3] px-3.5 text-[12px] font-semibold text-[#067647] whitespace-nowrap"
            : !isImpEkibi
              ? "shrink-0 inline-flex h-9 min-w-[146px] cursor-not-allowed items-center justify-center gap-2 rounded-[10px] border border-[#EAECF0] bg-[#F8F9FB] px-3.5 text-[12px] font-semibold text-[#98A2B3] whitespace-nowrap"
              : "shrink-0 inline-flex h-9 min-w-[146px] items-center justify-center gap-2 rounded-[10px] border border-[#6D4AE8] bg-[#6D4AE8] px-3.5 text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(16,24,40,0.08),0_4px_10px_rgba(109,74,232,0.2)] transition-all duration-150 hover:-translate-y-px hover:border-[#5B3BD0] hover:bg-[#5B3BD0] active:translate-y-0 whitespace-nowrap"
          }
        >
          ${dasiDone && !dasiStale ? completedIcon : html`<img src="Assets/dasi/dasi-avatar.png" alt="" className="-ml-1.5 h-6 w-6 rounded-full bg-white" />`}
          ${dasiStale ? "Dasi'yi Güncelle" : dasiDone ? "Aktarıldı" : "Dasi'ye Aktar"}
        </button>
        </div>
      `
    }
  ]

  return html`
    <section className="space-y-4">
      <div>
        <h2 className="text-[17px] font-semibold text-[#101828]">Canlıya Geçiş</h2>
        <p className="mt-0.5 text-[13px] text-[#667085]">
          ${isImpEkibi
            ? "Operasyon atamasını tamamlayın ve firma kopyalama/arşivleme için Dakika tarafına istek oluşturun."
            : "Bu aşamadaki işlemler Datassist ekibi tarafından yürütülür."}
        </p>
      </div>

      ${!isImpEkibi ? html`
        <div className=${classNames("flex items-start gap-3 rounded-[16px] border bg-white px-5 py-4", isStageCompleted ? "border-[#ABEFC6]" : "border-[#D5E2FF]")}>
          <span className=${classNames("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", isStageCompleted ? "bg-[#ECFDF3] text-[#067647]" : "bg-[#EFF4FF] text-[#2F6FED]")}>
            ${isStageCompleted ? checkIcon : html`<${InfoIcon} />`}
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[#101828]">${isStageCompleted ? "Firmanız canlı ortama aktarıldı." : "Bu aşamada sizden bir işlem beklenmiyor."}</p>
            <p className="mt-1 text-[13px] leading-5 text-[#667085]">
              ${isStageCompleted
                ? "Canlıya geçiş tamamlandı; süreçlerinizi sistem üzerinden yürütebilirsiniz."
                : "Ekibimiz firmanızı canlı ortama aktarıyor; tamamlandığında size bildirim gönderilecek."}
            </p>
          </div>
        </div>
      ` : null}

      <div className=${classNames("rounded-[16px] border border-[#D5E2FF] bg-white overflow-hidden", !isImpEkibi && "hidden")}>
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
            <span className="text-[12px] text-[#667085]">${completedCount} / 3 adım tamamlandı</span>
          `}
          ${isImpEkibi && !isStageCompleted ? html`
            <button
              type="button"
              disabled=${!allDone}
              onClick=${allDone ? onCompleteStep : undefined}
              className=${allDone
                ? "shrink-0 inline-flex h-10 min-w-[154px] items-center justify-center gap-2 rounded-[10px] border border-[#067647] bg-[#067647] px-4 text-[12.5px] font-semibold text-white shadow-[0_1px_2px_rgba(16,24,40,0.08),0_4px_10px_rgba(6,118,71,0.16)] transition-all duration-150 hover:-translate-y-px hover:border-[#05603A] hover:bg-[#05603A] active:translate-y-0"
                : "shrink-0 inline-flex h-10 min-w-[154px] cursor-not-allowed items-center justify-center gap-2 rounded-[10px] border border-[#E4E7EC] bg-[#F8F9FB] px-4 text-[12.5px] font-semibold text-[#98A2B3]"
              }
            >
              <span className=${classNames("flex h-[18px] w-[18px] items-center justify-center rounded-full", allDone ? "bg-white/15" : "bg-[#EAECF0]")}>${checkIcon}</span>
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

      ${KnowHowDasiRedirect && isDasiRedirectOpen ? html`
        <${KnowHowDasiRedirect}
          groupName=${companyName}
          docCount=${dasiExport?.docCount || 0}
          onClose=${() => setIsDasiRedirectOpen(false)}
        />
      ` : null}
      ${KnowHowDasiModal ? html`
        <${KnowHowDasiModal}
          isOpen=${isDasiModalOpen}
          companyName=${companyName}
          onClose=${() => setIsDasiModalOpen(false)}
          onComplete=${() => setDasiExport(window.KnowHowStore.getLastExport(companyName))}
        />
      ` : null}
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

function createGoLivePeriod() {
  const now = new Date()
  return { year: String(now.getFullYear()), month: String(now.getMonth() + 1) }
}

const GO_LIVE_YEAR_OPTIONS = Array.from({ length: 101 }, (_, index) => String(2000 + index))

function GoLivePeriodSelect({ label, value, onChange, disabled = false }) {
  const monthOptions = GO_LIVE_MONTH_LABELS.map((label, index) => ({
    value: String(index + 1),
    label
  }))

  return html`
    <div className=${classNames("min-w-0 flex-1", disabled && "opacity-55")}>
      <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.04em] text-[#667085]">${label}</span>
      <div className="flex gap-1.5">
        <div className="relative w-[76px] shrink-0">
          <select
            value=${value.year}
            disabled=${disabled}
            aria-label=${`${label} yılı`}
            onChange=${(event) => onChange({ ...value, year: event.target.value })}
            className="h-9 w-full appearance-none rounded-[8px] border border-[#D5DBE5] bg-white py-0 pl-2.5 pr-7 text-[12px] font-semibold text-[#344054] outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#D5E2FF] disabled:cursor-not-allowed disabled:bg-[#F2F4F7]"
          >
            ${GO_LIVE_YEAR_OPTIONS.map((year) => html`<option key=${year} value=${year}>${year}</option>`)}
          </select>
          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#98A2B3]" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3.5 4.75L6 7.25l2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="relative min-w-0 flex-1">
          <select
            value=${value.month}
            disabled=${disabled}
            aria-label=${`${label} ayı`}
            onChange=${(event) => onChange({ ...value, month: event.target.value })}
            className="h-9 w-full appearance-none rounded-[8px] border border-[#D5DBE5] bg-white py-0 pl-2.5 pr-7 text-[12px] font-semibold text-[#344054] outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#D5E2FF] disabled:cursor-not-allowed disabled:bg-[#F2F4F7]"
          >
            ${monthOptions.map((option) => html`<option key=${option.value} value=${option.value}>${option.label}</option>`)}
          </select>
          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#98A2B3]" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3.5 4.75L6 7.25l2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
    </div>
  `
}

function GoLivePayrollParameters({
  panelRef,
  mode,
  copyAllPayrolls,
  onCopyAllPayrollsChange,
  startPeriod,
  onStartPeriodChange,
  endPeriod,
  onEndPeriodChange,
  carryoverPeriod,
  onCarryoverPeriodChange
}) {
  const isPayrollRange = mode === "bordrolari_kopyala"
  const title = isPayrollRange ? "Bordro dönemi" : "Devreden ve kümülatif dönemi"
  const description = isPayrollRange
    ? "Kopyalanacak bordroların tarih aralığını belirleyin."
    : "Devreden ve kümülatif bilgilerin alınacağı dönemi seçin."

  return html`
    <div ref=${panelRef} className="rounded-[12px] border border-[#D8E3F2] bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[#EFF4FF] text-[#2F6FED]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-[#101828]">${title}</p>
          <p className="mt-0.5 text-[10.5px] leading-4 text-[#667085]">${description}</p>
        </div>
      </div>

      ${isPayrollRange ? html`
        <button
          type="button"
          role="switch"
          aria-checked=${copyAllPayrolls}
          onClick=${() => onCopyAllPayrollsChange(!copyAllPayrolls)}
          className="mt-3 flex w-full items-center justify-between rounded-[9px] border border-[#EAECF0] bg-[#F9FAFB] px-3 py-2 text-left transition hover:border-[#D5DBE5] hover:bg-[#F6F8FB]"
        >
          <span>
            <span className="block text-[11.5px] font-semibold text-[#344054]">Tüm bordroları kopyala</span>
            <span className="mt-0.5 block text-[10px] text-[#667085]">Dönem sınırı olmadan tüm bordrolar dahil edilir.</span>
          </span>
          <span className=${classNames(
            "relative ml-3 h-5 w-9 shrink-0 rounded-full transition",
            copyAllPayrolls ? "bg-[#2F6FED]" : "bg-[#D0D5DD]"
          )}>
            <span className=${classNames(
              "absolute top-[2px] h-4 w-4 rounded-full bg-white shadow-sm transition-all",
              copyAllPayrolls ? "left-[18px]" : "left-[2px]"
            )}></span>
          </span>
        </button>

        ${copyAllPayrolls ? html`
          <div className="mt-2.5 flex items-center gap-2 rounded-[9px] bg-[#F0F7FF] px-3 py-2 text-[10.5px] font-medium text-[#175CD3]">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Tüm bordro dönemleri kopyalamaya dahil edilecek.
          </div>
        ` : html`
          <div className="mt-3 flex items-end gap-2">
            <${GoLivePeriodSelect} label="Başlangıç" value=${startPeriod} onChange=${onStartPeriodChange} />
            <span className="mb-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F2F4F7] text-[#98A2B3]">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M7 3.5L9.5 6 7 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <${GoLivePeriodSelect} label="Bitiş" value=${endPeriod} onChange=${onEndPeriodChange} />
          </div>
        `}
      ` : html`
        <div className="mt-3 max-w-[205px]">
          <${GoLivePeriodSelect} label="Dönem" value=${carryoverPeriod} onChange=${onCarryoverPeriodChange} />
        </div>
      `}
    </div>
  `
}

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

function SubmitForApprovalConfirmModal({ isOpen, items, onCancel, onConfirm }) {
  if (!isOpen) return null
  const count = items.length

  return html`
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,23,42,0.55)] px-4"
      onClick=${(event) => { event.stopPropagation(); onCancel() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-confirm-title"
        className="w-full max-w-[460px] rounded-[18px] border border-[#E4E7EC] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
        onClick=${(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF4FF] text-[#2F6FED]">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1.5v8M7 1.5L4 4.5M7 1.5l3 3M1.5 10.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <div className="min-w-0">
            <p id="submit-confirm-title" className="text-[15px] font-semibold text-[#101828]">Belgeler incelemeye gönderilsin mi?</p>
            <p className="mt-1 text-[13px] leading-5 text-[#667085]">
              ${count} belge Datassist ekibinin incelemesine iletilecektir. İnceleme tamamlanana kadar belgede değişiklik yapılamaz.
            </p>
          </div>
        </div>

        <div className="mt-4 max-h-[260px] space-y-2 overflow-y-auto">
          ${items.map((item) => {
            const summary = summarizeStarterKitValidation(item.latest?.validation)
            return html`
              <div key=${item.id} className="flex items-center gap-3 rounded-[12px] border border-[#EAECF0] bg-[#FCFCFD] px-3 py-2.5">
                <${AttachmentTypeIcon} fileName=${item.latest?.name || ""} className="h-7 w-7" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[#101828]">${item.label}</p>
                  <p className="truncate text-[11.5px] text-[#667085]" title=${item.latest?.name || ""}>${item.latest?.name || "Metin yanıtı"}</p>
                </div>
                ${summary && summary.uyari > 0 ? html`
                  <span className="shrink-0 rounded-full border border-[#FEDF89] bg-[#FFFAEB] px-2 py-0.5 text-[11px] font-semibold text-[#B54708]">${summary.uyari} uyarı</span>
                ` : null}
              </div>
            `
          })}
        </div>

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
            autoFocus
            onClick=${onConfirm}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] bg-[#2F6FED] px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-[#2563CC]"
          >
            Onaya Gönder
          </button>
        </div>
      </div>
    </div>
  `
}

function GoLiveOperationsModal({ isOpen, onClose, onComplete, companyName }) {
  const payrollParametersRef = useRef(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [copyType, setCopyType] = useState("")
  const [newName, setNewName] = useState(companyName || "")
  const [startDate, setStartDate] = useState("")
  const [bordroOption, setBordroOption] = useState("kopyalama")
  const [puantajOption, setPuantajOption] = useState("kopyalama")
  const [icraOption, setIcraOption] = useState("kopyalama")
  const [copyAllPayrolls, setCopyAllPayrolls] = useState(false)
  const [payrollStartPeriod, setPayrollStartPeriod] = useState(createGoLivePeriod)
  const [payrollEndPeriod, setPayrollEndPeriod] = useState(createGoLivePeriod)
  const [carryoverPeriod, setCarryoverPeriod] = useState(createGoLivePeriod)

  useEffect(() => {
    if (!["bordrolari_kopyala", "devreden_kumulatif"].includes(bordroOption)) return
    const frameId = window.requestAnimationFrame(() => {
      payrollParametersRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [bordroOption])

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
    ...(["bordrolari_kopyala", "devreden_kumulatif"].includes(bordroOption) ? [{
      type: "full",
      label: `${bordroOption}-parameters`,
      control: html`
        <${GoLivePayrollParameters}
          panelRef=${payrollParametersRef}
          mode=${bordroOption}
          copyAllPayrolls=${copyAllPayrolls}
          onCopyAllPayrollsChange=${setCopyAllPayrolls}
          startPeriod=${payrollStartPeriod}
          onStartPeriodChange=${setPayrollStartPeriod}
          endPeriod=${payrollEndPeriod}
          onEndPeriodChange=${setPayrollEndPeriod}
          carryoverPeriod=${carryoverPeriod}
          onCarryoverPeriodChange=${setCarryoverPeriod}
        />
      `
    }] : []),
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

        <div className="max-h-[68vh] space-y-4 overflow-y-auto px-5 py-5">
          <div className="space-y-3.5 rounded-[14px] border border-[#E4E7EC] bg-[#F8F9FA] p-4">
            <div className="divide-y divide-[#E4E7EC]">
              ${fieldRows.map((row) => row.type === "full" ? html`
                <div key=${row.label} className="py-3">${row.control}</div>
              ` : html`
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
          onComplete({
            copyType,
            newName,
            startDate,
            bordroOption,
            puantajOption,
            icraOption,
            payrollParameters: bordroOption === "bordrolari_kopyala"
              ? { copyAllPayrolls, start: payrollStartPeriod, end: payrollEndPeriod }
              : bordroOption === "devreden_kumulatif"
                ? { carryover: carryoverPeriod }
                : null
          })
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

function AddCustomDocumentModal({ isOpen, stepTitle, onClose, onSubmit, allowTemplate = true }) {
  const [task, setTask] = useState({
    label: "",
    responseType: "file",
    description: "",
    required: false,
    file: null
  })

  useEffect(() => {
    if (isOpen) {
      setTask({
        label: "",
        responseType: "file",
        description: "",
        required: false,
        file: null
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  const canSubmit = task.label.trim().length > 0
  const updateTask = (patch) => setTask((current) => ({ ...current, ...patch }))

  function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit([{
      label: task.label.trim(),
      responseType: task.responseType,
      file: task.responseType === "file" ? task.file : null,
      description: task.description.trim(),
      required: task.required
    }])
  }

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.42)] px-4 py-6 backdrop-blur-[2px] lg:pl-[220px]" onClick=${onClose}>
      <div
        className="w-full max-w-[640px] rounded-[22px] border border-[#D7E0EC] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        onClick=${(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F7] px-5 py-4">
          <div>
            <p className="text-[18px] font-semibold text-[#101828]">Görev Ekle</p>
            <p className="sr-only">${stepTitle}</p>
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

        <form onSubmit=${handleSubmit} className="space-y-4 px-5 py-5">
          <div className="space-y-4 rounded-[14px] border border-[#E4E7EC] bg-[#F8F9FA] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#344054]">Başlık</label>
              <input
                type="text"
                name="custom-task-title"
                autoComplete="off"
                autoFocus=${true}
                value=${task.label}
                onInput=${(event) => updateTask({ label: event.target.value })}
                className="h-10 w-full rounded-[10px] border border-[#D5DBE5] bg-white px-3 text-[13px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#344054]">Tür</label>
              <div className="relative">
                <select
                  value=${task.responseType}
                  onChange=${(event) => updateTask({ responseType: event.target.value, file: event.target.value === "text" ? null : task.file })}
                  className="h-10 w-full appearance-none rounded-[10px] border border-[#D5DBE5] bg-white px-3 pr-10 text-[13px] text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
                >
                  <option value="file">Dosya Yükleme</option>
                  <option value="text">Metin</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#344054]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 7.5 5 5 5-5"></path></svg>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#344054]">Açıklama</label>
              <textarea
                rows="4"
                value=${task.description}
                onInput=${(event) => updateTask({ description: event.target.value })}
                className="w-full resize-none rounded-[10px] border border-[#D5DBE5] bg-white px-3 py-2 text-[13px] leading-5 text-[#101828] outline-none transition focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]"
              />
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked=${task.required}
                onChange=${(event) => updateTask({ required: event.target.checked })}
                className="peer sr-only"
              />
              <span className="relative h-5 w-9 rounded-full bg-[#98A2B3] transition peer-checked:bg-[#2F6FED] peer-focus-visible:ring-4 peer-focus-visible:ring-[#DCE8FF] after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:after:translate-x-4"></span>
              <span className="text-[13px] font-semibold text-[#344054]">Zorunlu</span>
            </label>

            ${allowTemplate && task.responseType === "file" ? html`
              <div className="flex min-w-0 items-center gap-3 pt-1">
                <label className="relative inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[#2F6FED] bg-white px-3 text-[12.5px] font-semibold text-[#2F6FED] transition hover:bg-[#F5F8FF]">
                  Şablon seç
                  <input type="file" onChange=${(event) => updateTask({ file: event.target.files?.[0] || null })} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                </label>
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-[#98A2B3]">${task.file ? task.file.name : "Şablon seçilmedi"}</span>
                ${task.file ? html`
                  <button type="button" onClick=${() => updateTask({ file: null })} aria-label="Şablonu kaldır" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-[#98A2B3] transition hover:bg-[#F2F4F7] hover:text-[#667085]"><${CloseIcon} /></button>
                ` : null}
              </div>
            ` : null}
          </div>

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
            <div className="mt-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] text-[#98A2B3]">
                <span className="font-semibold uppercase tracking-[0.08em]">Ekler</span>
                <span aria-hidden="true">·</span>
                <span>${attachedFiles.length} dosya</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                ${attachedFiles.map((f, i) => html`
                  <div key=${i} className="flex h-[50px] min-w-0 items-center gap-2 rounded-[8px] border border-[#E1E6ED] bg-white px-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                    <${AttachmentTypeIcon} fileName=${f.name} className="h-7 w-7" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11.5px] font-medium text-[#344054]" title=${f.name}>${f.name}</p>
                      ${f.size ? html`<p className="text-[9.5px] leading-3 text-[#98A2B3]">${Math.max(1, Math.round(f.size / 1024))} KB</p>` : null}
                    </div>
                    <button type="button" aria-label="${f.name} ekini kaldır" onClick=${() => removeAttached(i)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-[#98A2B3] transition hover:bg-[#FEF3F2] hover:text-[#D92D20]">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                `)}
              </div>
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

// headerActions verilirse başlıktaki Dosya Geçmişi butonunun yerine geçer (ör. Entegrasyon Süreçleri'nde Görev Ekle).
function ImplementationMessageFeed({ messages, draft, onDraftChange, onSend, onMeetingCreated, companyName, assignee, companyUsers, userRole, steps, stepUploads, activeStepId, onStepChange, fileHistoryRequestId, headerActions }) {
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [showFileHistory, setShowFileHistory] = useState(false)
  useEffect(() => {
    if (fileHistoryRequestId > 0) setShowFileHistory(true)
  }, [fileHistoryRequestId])
  const [pendingAttachments, setPendingAttachments] = useState([])
  const [isComposeExpanded, setIsComposeExpanded] = useState(false)
  const [activeComposerFormats, setActiveComposerFormats] = useState({ bold: false, list: false })
  const attachFileInputRef = useRef(null)
  const composeTextareaRef = useRef(null)
  const composeOuterScrollRef = useRef(null)
  const threadBodyRef = useRef(null)

  const assigneeInitials = assignee
    ? assignee.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "IE"

  const isViewer   = userRole === "viewer"
  const isImpEkibi = userRole === "imp_ekibi" || !userRole
  const isIntegrationTeam = userRole === "entegrasyon_ekibi"
  const currentAvatar = isImpEkibi ? assigneeInitials : isIntegrationTeam ? "EE" : userRole === "editor" ? "DZ" : "GR"
  const currentAvatarColor = isImpEkibi ? "bg-[#EFF4FF] text-[#2F6FED]" : isIntegrationTeam ? "bg-[#F0FDFA] text-[#0E7C73]" : userRole === "editor" ? "bg-[#F4F3FF] text-[#5925DC]" : "bg-[#F0FDF4] text-[#16A34A]"

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
      avatarUrl: specialistAvatarUrl,
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
  const recordedSystemMessages = scopedMessages.filter(m => m.type === "system")
  const stageUploads = stepUploads?.[activeStepId] || {}
  const uploadedHistoryMessages = [
    ...Object.values(stageUploads.docs || {}).flatMap((value) => getDocUploads(value).map((file) => ({ file, owner: "Müşteri" }))),
    ...Object.values(stageUploads.datassistDocs || {}).flatMap((value) => getDocUploads(value).map((file) => ({ file, owner: "Datassist" })))
  ].filter(({ file }) => file.kind !== "text").map(({ file, owner }) => ({
    id: `history-${file.id}`,
    type: "system",
    subtype: "upload",
    text: file.name,
    fileDate: file.uploadedAt,
    time: splitTimestampParts(file.uploadedAt).time,
    actor: { name: owner, initials: owner === "Datassist" ? "DA" : "M", color: "bg-[#EFF4FF] text-[#2F6FED]" }
  }))
  const systemMessages = [
    ...recordedSystemMessages,
    ...uploadedHistoryMessages.filter((upload) => !recordedSystemMessages.some((entry) =>
      entry.subtype === "upload" && entry.text === upload.text && entry.fileDate === upload.fileDate
    ))
  ]
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

  useEffect(() => {
    if (!isComposeExpanded) return
    const scrollContainer = document.getElementById("impl-message-feed")?.closest(".app-content")
    if (!scrollContainer) return
    const previousOverflowY = scrollContainer.style.overflowY
    composeOuterScrollRef.current = scrollContainer.scrollTop
    scrollContainer.style.overflowY = "hidden"
    return () => {
      scrollContainer.style.overflowY = previousOverflowY
      const preservedScrollTop = composeOuterScrollRef.current
      requestAnimationFrame(() => {
        if (typeof preservedScrollTop === "number") scrollContainer.scrollTop = preservedScrollTop
        composeOuterScrollRef.current = null
      })
    }
  }, [isComposeExpanded])

  function applyComposerFormat(type) {
    const editor = composeTextareaRef.current
    if (!editor) return
    editor.focus()
    document.execCommand(type === "bold" ? "bold" : "insertUnorderedList", false, null)
    updateComposerFormatState()
    requestAnimationFrame(() => {
      syncComposerDraft()
      updateComposerFormatState()
    })
  }

  function updateComposerFormatState() {
    setActiveComposerFormats({
      bold: document.queryCommandState("bold"),
      list: document.queryCommandState("insertUnorderedList")
    })
  }

  function syncComposerDraft() {
    const editor = composeTextareaRef.current
    if (!editor) return
    onDraftChange(String(editor.innerText || "").replace(/\u200B/g, ""))
  }

  function handleComposerPaste(event) {
    const clipboard = event.clipboardData
    if (!clipboard) return
    const htmlData = clipboard.getData("text/html")
    const textData = clipboard.getData("text/plain")
    let insertHtml = ""

    if (htmlData) {
      insertHtml = sanitizeRichTextHtml(htmlData)
    } else if (textData.includes("\t")) {
      const rows = textData.replace(/\r/g, "").split("\n").filter((row, index, allRows) => row || index < allRows.length - 1)
      insertHtml = `<table><tbody>${rows.map((row) => {
        const cells = row.split("\t")
        return `<tr>${cells.map((cell) => {
          const holder = document.createElement("span")
          holder.textContent = cell
          return `<td>${holder.innerHTML}</td>`
        }).join("")}</tr>`
      }).join("")}</tbody></table><div><br></div>`
    }

    if (!insertHtml) return
    event.preventDefault()
    document.execCommand("insertHTML", false, insertHtml)
    requestAnimationFrame(syncComposerDraft)
  }

  function sendComposeMessage() {
    if (!draft.trim() && pendingAttachments.length === 0) return
    const richTextHtml = sanitizeRichTextHtml(composeTextareaRef.current?.innerHTML || "")
    onSend(pendingAttachments, richTextHtml)
    if (composeTextareaRef.current) composeTextareaRef.current.innerHTML = ""
    onDraftChange("")
    setActiveComposerFormats({ bold: false, list: false })
    setPendingAttachments([])
    setIsComposeExpanded(false)
  }

  function openComposeEditor() {
    setIsComposeExpanded(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => composeTextareaRef.current?.focus())
    })
  }

  const isComposeIdle = !isComposeExpanded && !draft.trim() && pendingAttachments.length === 0

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
    : isComposeIdle
    ? html`
      <button
        type="button"
        onClick=${openComposeEditor}
        className="group flex h-12 w-full items-center gap-2.5 rounded-[11px] border border-[#D8E0EB] bg-white px-3.5 text-left shadow-[0_1px_3px_rgba(16,24,40,0.03)] transition hover:border-[#B8C8E0] hover:bg-[#FCFDFF] hover:shadow-[0_3px_10px_rgba(16,24,40,0.05)]"
      >
        ${isImpEkibi
          ? html`<img src=${specialistAvatarUrl} alt=${assignee || "İmplementasyon Uzmanı"} className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-[#DCE3EC]" />`
          : html`<span className=${classNames("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold", currentAvatarColor)}>${currentAvatar}</span>`}
        <span className="flex-1 text-[12.5px] text-[#98A2B3] transition group-hover:text-[#667085]">Yeni mesaj yaz...</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-[7px] text-[#98A2B3] transition group-hover:bg-[#EFF4FF] group-hover:text-[#2F6FED]">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 3.5h10v7H7l-3.5 2V4A.5.5 0 014 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 6.5h5M5.5 8.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
        </span>
      </button>`
    : html`
      <div className=${classNames(
        "overflow-hidden bg-white transition",
        isComposeExpanded
          ? "flex h-full min-h-0 flex-1 flex-col"
          : "rounded-[13px] border border-[#D8E0EB] shadow-[0_2px_8px_rgba(16,24,40,0.04)] focus-within:border-[#9DBAF8] focus-within:shadow-[0_0_0_3px_rgba(47,111,237,0.08),0_6px_18px_rgba(16,24,40,0.06)]"
      )}>
        <div className="flex h-10 items-center justify-between border-b border-[#EEF2F6] px-3.5">
          <div className="flex items-center gap-2">
            ${isImpEkibi
              ? html`<img src=${specialistAvatarUrl} alt=${assignee || "İmplementasyon Uzmanı"} className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-[#DCE3EC]" />`
              : html`<span className=${classNames("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold", currentAvatarColor)}>${currentAvatar}</span>`}
            <span className="text-[12px] font-semibold text-[#344054]">Yeni mesaj</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] text-[#98A2B3]">${implementationStepTemplates[activeStepId]?.title || "Proje iletişimi"}</span>
            ${isComposeExpanded ? html`
              <button
                type="button"
                title="Mesaj alanını küçült"
                aria-label="Mesaj alanını küçült"
                onClick=${() => setIsComposeExpanded(false)}
                className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#667085] transition hover:bg-[#F2F4F7] hover:text-[#344054]"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5h8M5 8h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </button>
            ` : null}
          </div>
        </div>

        <div className="flex h-9 items-center gap-1 border-b border-[#F2F4F7] px-3">
          <button
            type="button"
            title="Kalın"
            aria-pressed=${String(activeComposerFormats.bold)}
            onMouseDown=${(event) => event.preventDefault()}
            onClick=${() => applyComposerFormat("bold")}
            className=${classNames(
              "flex h-7 w-7 items-center justify-center rounded-[6px] border text-[13px] font-bold transition",
              activeComposerFormats.bold
                ? "border-[#B2CCFF] bg-[#EFF4FF] text-[#2F6FED] shadow-[inset_0_0_0_1px_rgba(47,111,237,0.04)]"
                : "border-transparent text-[#475467] hover:bg-[#F2F4F7]"
            )}
          >B</button>
          <button type="button" title="Madde işaretli liste" aria-pressed=${String(activeComposerFormats.list)} onMouseDown=${(event) => event.preventDefault()} onClick=${() => applyComposerFormat("list")} className=${classNames(
            "flex h-7 w-7 items-center justify-center rounded-[6px] border transition",
            activeComposerFormats.list ? "border-[#B2CCFF] bg-[#EFF4FF] text-[#2F6FED]" : "border-transparent text-[#475467] hover:bg-[#F2F4F7]"
          )}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="2.5" cy="4" r=".8" fill="currentColor"/><circle cx="2.5" cy="10" r=".8" fill="currentColor"/><path d="M5 4h6.5M5 10h6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className=${classNames("relative bg-white", isComposeExpanded && "flex min-h-0 flex-1")}>
          ${!draft.trim() ? html`
            <div className="pointer-events-none absolute left-4 top-3 whitespace-pre-line text-[13px] leading-[1.65] text-[#B0B8C5]">Merhaba,\n\nMesajınızı buraya yazın...</div>
          ` : null}
          <div
            ref=${composeTextareaRef}
            role="textbox"
            aria-label="Mesajınızı buraya yazın"
            aria-multiline="true"
            contentEditable="true"
            suppressContentEditableWarning=${true}
            onInput=${() => { syncComposerDraft(); updateComposerFormatState() }}
            onPaste=${handleComposerPaste}
            onFocus=${() => { setIsComposeExpanded(true); updateComposerFormatState() }}
            onKeyUp=${updateComposerFormatState}
            onMouseUp=${updateComposerFormatState}
            onKeyDown=${(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                sendComposeMessage()
              }
            }}
          style=${{minHeight:isComposeExpanded ? "220px" : "72px",maxHeight:isComposeExpanded ? "none" : "110px",lineHeight:"1.65",overscrollBehavior:"contain"}}
            className=${classNames(
              "rich-message-editor block w-full overflow-y-auto bg-white px-4 py-3 text-[13px] text-[#101828] outline-none",
              "[&_p]:mb-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
              "[&_table]:my-2 [&_table]:border-collapse [&_td]:min-w-[88px] [&_td]:border [&_td]:border-[#D0D5DD] [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-[#D0D5DD] [&_th]:bg-[#F9FAFB] [&_th]:px-2 [&_th]:py-1",
              isComposeExpanded && "min-h-0 flex-1 text-[14px]"
            )}
          ></div>
        </div>

        ${pendingAttachments.length > 0 ? html`
          <div className="flex flex-wrap gap-1.5 border-t border-[#F2F4F7] bg-[#FCFCFD] px-3.5 py-2">
            ${pendingAttachments.map((att, i) => html`
              <div key=${i} className="inline-flex max-w-[220px] items-center gap-1.5 rounded-[7px] border border-[#D8E0EB] bg-white px-2 py-1.5">
                <${FileAttachmentIcon} att=${att} size="sm" />
                <span className="truncate text-[11px] font-medium text-[#344054]">${att.name}</span>
                <button type="button" aria-label="Eki kaldır" onClick=${() => setPendingAttachments(prev => prev.filter((_, j) => j !== i))} className="ml-0.5 text-[#98A2B3] hover:text-[#667085]">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
            `)}
          </div>
        ` : null}

        <div className="flex items-center justify-between border-t border-[#EEF2F6] bg-[#FCFCFD] px-3.5 py-2.5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-[#D0D5DD] bg-white px-2.5 text-[11.5px] font-medium text-[#475467] transition hover:bg-[#F9FAFB]">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M17.5 11.667v3.333A2.5 2.5 0 0115 17.5H5a2.5 2.5 0 01-2.5-2.5v-3.333M10 2.5v10M6.667 5.833L10 2.5l3.333 3.333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Dosya ekle
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
          </div>
          <button
            type="button"
            onClick=${sendComposeMessage}
            disabled=${!draft.trim() && pendingAttachments.length === 0}
            className=${classNames(
              "inline-flex h-8 items-center gap-1.5 rounded-[7px] px-3.5 text-[11.5px] font-semibold transition",
              (draft.trim() || pendingAttachments.length > 0) ? "bg-[#2F6FED] text-white shadow-sm hover:bg-[#2563CC]" : "bg-[#EAECF0] text-[#98A2B3] cursor-not-allowed"
            )}
          >
            <${SendIcon} />Gönder
          </button>
        </div>
      </div>`

  return html`
    <section id="impl-message-feed" className="overflow-hidden rounded-[20px] border border-[#E4E7EC] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06),0_4px_16px_rgba(16,24,40,0.04)] flex" style=${{height:"min(580px, calc(100vh - 149px))"}}>

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
              const isClientViewer = userRole === "editor" || userRole === "viewer"
              const statusLabel = isCompleted ? "Tamamlandı"
                : isDocsApproved ? "Onaylandı"
                : isPending ? (isClientViewer ? "İncelemede" : "İnceleme Bekliyor")
                : isUploaded ? (isClientViewer ? "Gönderime Hazır" : "Gönderim Bekleniyor")
                : isActive ? "Devam Ediyor"
                : isLocked && prevStep ? `${prevStep.title} sonrası açılır`
                : "Bekliyor"
              return html`
                <button
                  key=${step.id}
                  type="button"
                  disabled=${isLocked}
                  title=${isLocked && prevStep ? `Bu aşama, ${prevStep.title} tamamlandığında açılacak.` : undefined}
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
                    isPending  ? (userRole === "editor" || userRole === "viewer" ? "bg-[#EFF4FF] text-[#2F6FED]" : "bg-[#FFFAEB] text-[#B54708]") :
                    isUploaded ? "bg-[#EFF4FF] text-[#2F6FED]" :
                    isActive   ? "bg-[#2F6FED] text-white" :
                                 "bg-[#F2F4F7] text-[#98A2B3]"
                  )}>
                    ${isCompleted
                      ? html`<svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2L7.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>`
                      : isLocked
                      ? html`<svg width="7" height="9" viewBox="0 0 7 9" fill="none"><rect x="0.5" y="3.5" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M2 3.5V2.5a1.5 1.5 0 013 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>`
                      : html`<span style=${{fontSize:"8px",fontWeight:700}}>${String(idx + 1).padStart(2, "0")}</span>`
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
                      isPending  ? (isClientViewer ? "text-[#175CD3]" : "text-[#B54708]") :
                      isActive   ? "text-[#667085]" : "text-[#C8CEDE]"
                    )}>
                      ${statusLabel}
                    </span>
                  </span>
                </button>
              `
            })}
          </div>
          <!-- Katılımcılar -->
          <div className="border-t border-[#F2F4F7] px-3.5 py-3 flex items-center gap-2">
            <div className="flex -space-x-1">
              <img src=${specialistAvatarUrl} alt=${assignee || "İmplementasyon Uzmanı"} className="h-5 w-5 rounded-full object-cover ring-1 ring-white" />
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
          ${headerActions !== undefined ? headerActions : html`<button
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
          </button>`}
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
                        ${actor.avatarUrl
                          ? html`<img src=${actor.avatarUrl} alt=${actor.name} className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-white" />`
                          : html`<span className=${`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${actor.color}`}>${actor.initials}</span>`}
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
      <div ref=${threadBodyRef} className=${classNames("flex-1 overflow-y-auto overscroll-contain px-5 py-4", isComposeExpanded && "hidden")}>
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
                        ${actor.avatarUrl
                          ? html`<img src=${actor.avatarUrl} alt=${actor.name} className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-white" />`
                          : html`<span className=${`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${actor.color}`}>${actor.initials}</span>`}
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
                        <img src=${message.avatarUrl || specialistAvatarUrl} alt=${message.author || "İmplementasyon Uzmanı"} className="h-8 w-8 rounded-full object-cover ring-1 ring-[#DCE3EC]" />
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
                      ${isImpl
                        ? html`<img src=${message.avatarUrl || specialistAvatarUrl} alt=${message.author || "İmplementasyon Uzmanı"} className="h-8 w-8 rounded-full object-cover ring-1 ring-[#DCE3EC]" />`
                        : html`<span className=${message.type === "integration" ? "flex h-8 w-8 items-center justify-center rounded-full bg-[#F0FDFA] text-[11px] font-bold text-[#0E7C73]" : "flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F3FF] text-[11px] font-bold text-[#5925DC]"}>${message.avatar || "?"}</span>`}
                      ${isImpl ? html`<span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white bg-[#12B76A]"></span>` : null}
                    </div>

                    <!-- Content -->
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-[#101828]">${message.author}</span>
                        ${isImpl ? html`<span className="inline-flex h-[18px] items-center rounded-full bg-[#EFF4FF] px-2 text-[10px] font-semibold text-[#2F6FED]">İmplementasyon Ekibi</span>` : null}
                        ${message.type === "integration" ? html`<span className="inline-flex h-[18px] items-center rounded-full bg-[#F0FDFA] px-2 text-[10px] font-semibold text-[#0E7C73]">Entegrasyon Ekibi</span>` : null}
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
                        ${message.richTextHtml ? html`
                          <div
                            className="rich-message-content mt-1 text-[13px] leading-[1.6] text-[#344054] [&_strong]:font-semibold [&_b]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2 [&_table]:my-2 [&_table]:border-collapse [&_td]:border [&_td]:border-[#D0D5DD] [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-[#D0D5DD] [&_th]:bg-[#F9FAFB] [&_th]:px-2 [&_th]:py-1"
                            dangerouslySetInnerHTML=${{ __html: sanitizeRichTextHtml(message.richTextHtml) }}
                          ></div>
                        ` : html`
                          <p className="mt-1 text-[13px] leading-[1.6] text-[#344054] whitespace-pre-line">${message.text}</p>
                        `}
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
      <div className=${classNames(
        "border-t border-[#F2F4F7]",
        isComposeExpanded
          ? "flex min-h-0 flex-1 bg-white p-0"
          : isComposeIdle
          ? "shrink-0 bg-[#FAFBFC] px-5 py-2.5"
          : "shrink-0 bg-[#FAFBFC] px-5 py-4"
      )}>
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
                  ${actor.avatarUrl
                    ? html`<img src=${actor.avatarUrl} alt=${actor.name} className="h-4 w-4 shrink-0 rounded-full object-cover ring-1 ring-white" />`
                    : html`<span className=${`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${actor.color}`}>${actor.initials}</span>`}
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
                ${isImpl
                  ? html`<img src=${message.avatarUrl || specialistAvatarUrl} alt=${message.author || "İmplementasyon Uzmanı"} className="ticket-entry__avatar object-cover ring-1 ring-[#DCE3EC]" />`
                  : html`<span className="ticket-entry__avatar ticket-entry__avatar--client">${message.avatar || "?"}</span>`}
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
  { id: "gce-formu",          number: "02", title: "Giriş Çıkış Nakil Formu",      desc: "Bu dönem giriş, çıkış veya nakil olan personel varsa ilgili formu yükleyin.",                                                               type: "imp_file_conditional",     dismissLabel: "Giriş / çıkış yok" },
  { id: "guncel-liste",       number: "03", title: "Güncel Personel Listesi",       desc: "Güncel personel listenizi yükleyin; değişen bilgileri renklendirerek belirtin.",                                                                                  type: "imp_file_optional_upload", dismissLabel: "Değişiklik yok" },
  { id: "bordro-takvimi",     number: "04", title: "Bordro Takvimi 2026",           desc: "Güncel bordro takviminizi yükleyin; değişen bilgileri renklendirerek belirtin.",                                                                                     type: "imp_file_optional_upload", dismissLabel: "Değişiklik yok" },
  { id: "icra-takip",         number: "05", title: "İcra Takip Dosyası",            desc: "Bu dönem icra kesintisi olan personel varsa icra takip dosyasını icra yazılarıyla birlikte yükleyin.",                                                        type: "imp_file_conditional",     dismissLabel: "İcra yok" },
  { id: "muhasebe-mapping",   number: "07", title: "Muhasebe Raporu Mapping",       desc: "Muhasebe raporu eşleştirme dosyanızı yükleyin.",                                                                                                     type: "imp_file_optional_upload", dismissLabel: "Değişiklik yok" },
  { id: "bos-puantaj",        number: "13", title: "Boş Puantaj Raporu",            desc: "Puantaj raporunuzu ilgili kalemleri doldurarak yükleyin.",                                                        type: "imp_file_optional_upload", dismissLabel: "Puantaj yok",          level: 1, parentId: "muhasebe-mapping" },
  { id: "duzenli-odemeler",   number: "14", title: "Düzenli Ödemeler / Kesintiler", desc: "Düzenli ödenen veya kesilen kalemlerinizi (avans, özel prim, icra dışı kesinti vb.) içeren dosyayı yükleyin.",                                      type: "imp_file_optional_upload", dismissLabel: "Kesinti yok",     level: 2, parentId: "bos-puantaj" },
  { id: "logo",               number: "08", title: "Şirket Logosu",                 desc: "Logo paylaşırsanız bordrolarınıza eklenecektir. İsteğe bağlıdır.",                                                                                                   type: "customer_file_optional",   dismissLabel: "Logo yok" },
  { id: "engelli-calisanlar", number: "09", title: "Engelli Çalışanlar",            desc: "Engelli çalışanınız varsa GİB'den alınan indirim yazılarını paylaşın.",                                                                                              type: "customer_file_conditional",dismissLabel: "Engelli yok" },
  { id: "kgvm-sgk",           number: "06", title: "KGVM ve SGK Devreden",          desc: "KGVM ve SGK devreden bilgilerini içeren dosyanızı Mayıs ayı bordrolarınız tamamlandıktan sonra yükleyin.",                                                              type: "imp_file_required",        dismissLabel: null },
  { id: "banka-disketi",      number: "10", title: "Banka Disketi Örneği",          desc: "Mevcut banka ödeme disket örneğinizi yükleyin; sistemdeki örnekle karşılaştırılacaktır.",                                                                            type: "customer_file_required",   dismissLabel: null },
  { id: "yetkilendirme",      number: "12", title: "Yetkilendirme Bilgisi",         desc: "Sisteme erişim yetkisi verilecek kişilerin adı, soyadı ve T.C. kimlik numarasını ekleyin.",                                                                          type: "person_list",              dismissLabel: null },
  { id: "bordro-tipi",        number: "01", title: "Bordro Tipi Seçimi",            desc: "Aşağıdaki bordro tipi seçeneklerinden birini seçin.",                                                                                                                    type: "text_only",                dismissLabel: null,             options: ["Net - Brüt", "Brüt Bordro", "Bordro Z", "Net / Brüt Yok"] },
]

function createLiveHazirlikInitialData() {
  const data = {}
  liveHazirlikItems.forEach((item) => {
    data[item.id] = {
      impFileSent: false,
      impFileName: null,
      datassistUploads: [],
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

function LiveResponseSelect({ item, onSelect }) {
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [position, setPosition] = useState(null)
  const menuId = `live-response-${item.id}`

  function closeMenu(restoreFocus = false) {
    setPosition(null)
    if (restoreFocus) triggerRef.current?.focus()
  }

  function openMenu(last = false) {
    const rect = triggerRef.current.getBoundingClientRect()
    setPosition({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - Math.max(rect.width, 220) - 8)),
      top: rect.bottom + 6,
      width: Math.min(Math.max(rect.width, 220), window.innerWidth - 16),
      last
    })
  }

  useEffect(() => {
    if (!position) return
    const options = menuRef.current?.querySelectorAll('[role="menuitem"]')
    options?.[position.last ? options.length - 1 : 0]?.focus()
    function outside(event) {
      if (!triggerRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) closeMenu()
    }
    function dismissOnMove(event) {
      if (!menuRef.current?.contains(event.target)) closeMenu()
    }
    document.addEventListener("pointerdown", outside)
    window.addEventListener("resize", dismissOnMove)
    window.addEventListener("scroll", dismissOnMove, true)
    return () => {
      document.removeEventListener("pointerdown", outside)
      window.removeEventListener("resize", dismissOnMove)
      window.removeEventListener("scroll", dismissOnMove, true)
    }
  }, [position])

  function handleMenuKey(event) {
    const options = Array.from(menuRef.current.querySelectorAll('[role="menuitem"]'))
    const current = options.indexOf(document.activeElement)
    let next = null
    if (event.key === "ArrowDown") next = (current + 1) % options.length
    if (event.key === "ArrowUp") next = (current - 1 + options.length) % options.length
    if (event.key === "Home") next = 0
    if (event.key === "End") next = options.length - 1
    if (next !== null) { event.preventDefault(); options[next].focus() }
    if (event.key === "Escape") { event.preventDefault(); closeMenu(true) }
    if (event.key === "Tab") { closeMenu(true) }
  }

  return html`
    <div className="live-response-select">
      <svg className="live-response-select-icon" width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="4" y="2.5" width="12" height="15" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M7 6h6M7 10h6M7 14h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
      <button ref=${triggerRef} type="button" className="live-response-select-input" aria-label=${item.title}
        aria-haspopup="menu" aria-expanded=${Boolean(position)} aria-controls=${position ? menuId : undefined}
        onClick=${() => position ? closeMenu() : openMenu()}
        onKeyDown=${(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); openMenu(event.key === "ArrowUp")
          }
        }}>${item.id === "bordro-tipi" ? "Bordro tipi seçin" : "Seçim yapın"}</button>
      <svg className="live-response-select-chevron" style=${{ transform: position ? "rotate(180deg)" : undefined }} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ${position ? ReactDOM.createPortal(html`
        <div ref=${menuRef} id=${menuId} role="menu" aria-label=${item.title} className="live-response-menu"
          style=${{ left: position.left, top: position.top, width: position.width }} onKeyDown=${handleMenuKey}>
          ${item.options.map((option) => html`
            <button key=${option} type="button" role="menuitem" tabIndex="-1" className="live-response-option"
              onClick=${() => { closeMenu(true); onSelect(option) }}>
              <span className="live-response-option-dot" aria-hidden="true"></span>${option}
            </button>
          `)}
        </div>
      `, document.body) : null}
    </div>
  `
}

function LiveHazirlikItem({ item, displayNumber, data, plannedDate, isImpRole, isStageCompleted, isSubmitted, isRevisionRequested, canEdit, onRemoveItem, onDatassistFileUpload, onRemoveDatassistUpload, onCustomerFileUpload, onRemoveCustomerUpload, onAddPersons, onRemovePerson, onMessageReply, onDismiss, onUndismiss, onMarkComplete, onUnmarkComplete, onMeetingRequest, onApproveItem, onRequestRevisionItem, onOpenRejectModal }) {
  const datassistFileInputRef = useRef(null)
  const customerFileInputRef = useRef(null)
  const [replyDraft, setReplyDraft] = useState(data.messageReply || "")
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
  const datassistUploads = data.datassistUploads || []
  const hasDatassistUploads = datassistUploads.length > 0
  const latestDatassistUpload = hasDatassistUploads ? datassistUploads[datassistUploads.length - 1] : null
  const latestDatassistUploadParts = latestDatassistUpload ? splitTimestampParts(latestDatassistUpload.uploadedAt || "") : { date: "", time: "" }
  const hasCustomerUploads = data.customerUploads && data.customerUploads.length > 0
  const hasTextReply = (data.messageReply || "").trim().length > 0
  const isNegativeTextResponse = hasTextReply && /\byok\b/i.test(data.messageReply || "")
  const hasSelectionOptions = Array.isArray(item.options) && item.options.length > 0
  const canAnswer = !isImpRole && !isStageCompleted && !isSubmitted && !data.lockedApproval
  const canUploadDatassistFile = isImpRole && isFileItem && !isStageCompleted && !isSubmitted
  const authorizedPersons = data.authorizedPersons || []
  const hasAuthorizedPersons = authorizedPersons.length > 0

  // Keep customer upload and no-change responses directly accessible.
  const canUploadCustomerFile = isFileItem && !isDismissed && canAnswer
  const canSelectResponse = isTextOnly && hasSelectionOptions && canAnswer && !hasTextReply
  const canDismissFile = isFileItem && isDismissable && !hasCustomerUploads && canAnswer
  const canAddPerson = isPersonList && canAnswer
  const isOptionalItem = item.type.endsWith("_optional")
  const isAwaitingCustomer = !isStageCompleted && !isSubmitted && !isCompleted && (
    (isFileItem && !hasCustomerUploads && !isDismissed) ||
    (isTextOnly && !hasTextReply) ||
    (isPersonList && !hasAuthorizedPersons)
  )
  const pendingStatus = !isAwaitingCustomer
    ? null
    : isOptionalItem
      ? { text: "İsteğe bağlı", tone: "gray" }
      : getCustomerPendingStatus({
          plannedDate,
          isClient: !isImpRole,
          responseKind: isFileItem ? "file" : "text",
          dismissLabel: isFileItem && isDismissable ? item.dismissLabel : ""
        })

  function downloadCustomerUpload(event, upload) {
    if (upload.downloadUrl) return
    event.preventDefault()
    if (!upload.file) return
    const url = URL.createObjectURL(upload.file)
    const link = document.createElement("a")
    link.href = url
    link.download = upload.name
    document.body.appendChild(link)
    link.click()
    link.remove()
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

  // durum badge styles (nötr = gray, tamamlanan = green, bekleyen = amber, revizyon = red)
  const badgeBase = "inline-flex h-[22px] items-center gap-1 rounded-full border px-2.5 text-[11px] font-medium whitespace-nowrap max-w-full"
  const badgeGrayDashed = classNames(badgeBase, "border-dashed border-[#E4E7EC] bg-white text-[#98A2B3]")
  const badgeGreen = classNames(badgeBase, "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647] truncate")
  const badgeAmber = classNames(badgeBase, "border-[#FEC84B] bg-[#FFFAEB] text-[#B54708]")
  const badgeRed = classNames(badgeBase, "border-[#FEE4E2] bg-[#FEF3F2] text-[#D92D20]")


  // durum: what to show in the DURUM column for this item
  let durumBadge = null
  if (isMeeting || isInfoOnly) {
    durumBadge = html`<span className=${badgeGrayDashed}>Henüz tamamlanmadı</span>`
  } else if (isDismissed) {
    durumBadge = html`
      <div className="live-no-change">
        <span className="live-no-change-status" role="status">
          <span className="live-no-change-icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 8l2.5 2.5L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span>${item.dismissLabel}</span>
        </span>
        ${canAnswer ? html`
          <button type="button" onClick=${onUndismiss} className="live-no-change-undo" aria-label=${`${item.dismissLabel} seçimini geri al`}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5.5 3L2.5 6l3 3M3 6h6a4 4 0 0 1 0 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Geri al
          </button>
        ` : null}
      </div>
    `
  } else if (isPersonList) {
    if (!hasAuthorizedPersons) {
      durumBadge = html`<span className=${badgeGrayDashed}>Henüz kişi eklenmedi</span>`
    } else {
      const latestPerson = authorizedPersons[authorizedPersons.length - 1]
      const olderPersons = authorizedPersons.slice(0, -1).reverse()
      const latestInitials = `${latestPerson.ad?.[0] || ""}${latestPerson.soyad?.[0] || ""}`.toUpperCase()
      durumBadge = html`
        <div className="w-full max-w-[420px] min-w-0 space-y-1">
          <div className=${classNames(
            "flex h-[35px] min-w-0 max-w-full items-center gap-2 rounded-[7px] border px-2.5",
            isCompleted ? "border-[#ABEFC6] bg-[#ECFDF3]" : "border-[#E4E7EC] bg-[#F9FAFB]"
          )}>
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
      <div className=${classNames(
        "inline-flex max-w-full min-w-0 items-center gap-2 rounded-[7px] border px-2.5 py-2",
        isNegativeTextResponse
          ? "border-[#D0D5DD] bg-[#F9FAFB]"
          : isCompleted ? "border-[#ABEFC6] bg-[#ECFDF3]" : "border-[#E4E7EC] bg-[#F9FAFB]"
      )}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="flex-shrink-0"><rect x="1" y="1" width="12" height="12" rx="2" stroke=${isNegativeTextResponse ? "#98A2B3" : "#12B76A"} strokeWidth="1.3"/><path d=${isNegativeTextResponse ? "M4 7h6" : "M4 7l2 2 4-4"} stroke=${isNegativeTextResponse ? "#667085" : "#12B76A"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
      <div className="w-full min-w-0 space-y-1.5">
        <div className=${classNames(
          "group/cell min-w-0 rounded-[9px] border px-2.5 py-2 transition",
          data.approvalStatus === "revision_requested" ? "border-[#FDA29B] bg-[#FEF3F2]"
            : data.approvalStatus === "approved" ? "border-[#ABEFC6] bg-[#ECFDF3]" : "border-[#E4E7EC] bg-white",
          canAnswer && "hover:border-[#D6BBFB] hover:bg-[#F9F5FF]"
        )}>
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-white/80 text-[#7F56D9]">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6.5 2.5h5l3 3v10.25a1.75 1.75 0 0 1-1.75 1.75h-6.5a1.75 1.75 0 0 1-1.75-1.75V4.25A1.75 1.75 0 0 1 6.25 2.5h.25Z" stroke="currentColor" strokeWidth="1.35"/><path d="M11.5 2.75V6h3.25M7.5 10h5M7.5 13h3.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <div className="min-w-0 flex-1">
              <a href=${latestUpload.downloadUrl || "#"} download=${latestUpload.name}
                onClick=${(event) => downloadCustomerUpload(event, latestUpload)}
                className="block break-all text-[10.5px] font-semibold leading-[14px] text-[#344054] hover:text-[#2F6FED]" title=${latestUpload.name}>${latestUpload.name}</a>
              <div className="mt-0.5 flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[9px] leading-3 text-[#98A2B3]">
                <span>Müşteri</span>
                ${latestParts.date ? html`<span>·</span><span>${latestParts.date}</span>` : null}
                ${latestParts.time ? html`<span>${latestParts.time}</span>` : null}
                ${uploads.length > 1 ? html`<span>· ${uploads.length} sürüm</span>` : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              ${historicalUploads.length > 0 ? html`
                <button type="button" onClick=${() => setIsUploadListExpanded((c) => !c)}
                  aria-expanded=${isUploadListExpanded} aria-label=${`Dosya geçmişini aç (${uploads.length} sürüm)`} title=${`Dosya geçmişi (${uploads.length} sürüm)`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[#D0D5DD] bg-white text-[#475467] transition hover:bg-[#F9FAFB]">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.2 6.1A6 6 0 1 1 2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M2.2 2.8v3.5h3.5M8 4.7v3.5l2.3 1.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              ` : null}
              ${canAnswer ? html`
                <button type="button" onClick=${() => customerFileInputRef.current?.click()} title="Dosya Yükle"
                  className="inline-flex h-7 shrink-0 items-center gap-1 rounded-[7px] border border-[#D6BBFB] bg-white px-2 text-[10px] font-semibold text-[#6941C6] transition hover:bg-[#F9F5FF]"><${UploadIcon} />Dosya Yükle</button>
                <button type="button" onClick=${() => onRemoveCustomerUpload(latestUpload.id)} aria-label=${`${latestUpload.name} dosyasını sil`} title="Dosyayı sil"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border border-[#FEE4E2] bg-white text-[#D92D20] transition hover:bg-[#FEF3F2]"><${TrashIcon} /></button>
              ` : null}
            </div>
          </div>
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
      </div>
    `
  } else {
    durumBadge = html`<span className=${badgeGrayDashed}>${isFileItem ? "Henüz dosya yüklenmedi" : "Henüz yanıt verilmedi"}</span>`
  }

  // customer-facing review overlay: surfaces imp team's per-item decision once submitted
  let reviewTag = null
  if (!isImpRole && !isMeeting && !isInfoOnly) {
    if (data.approvalStatus === "revision_requested") {
      reviewTag = html`<span className=${badgeRed}>Revizyon Gerekiyor</span>`
    } else if (isSubmitted && !data.approvalStatus) {
      reviewTag = html`<span className=${classNames(badgeBase, "border-[#D5E2FF] bg-[#EFF4FF] text-[#175CD3]")}>İncelemede</span>`
    }
  }

  return html`
    <div className="transition-colors">

      <!-- main row -->
      <div className="live-prep-row grid grid-cols-1 gap-3 px-5 py-4 md:items-center md:gap-0 md:grid-cols-[minmax(180px,1.1fr)_minmax(180px,1fr)_minmax(180px,1fr)_180px]">

        <!-- ALAN ADI -->
        <div className="flex items-center gap-2 min-w-0">
          <div className=${classNames("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 select-none", numBg)}>
            ${isCompleted ? checkIcon : displayNumber}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className=${classNames("text-[12.5px] font-medium leading-5", isCompleted ? "text-[#15803D]" : "text-[#101828]")} title=${item.title}>${item.title}</span>
              <${InfoTooltip} text=${item.desc} />
            </div>
            <${DocStatusLine} status=${pendingStatus} />
          </div>
        </div>

        <!-- DATASSIST DOSYASI -->
        <div className="live-prep-owner min-w-0 border-[#E4E7EC] md:border-l md:px-4" data-label="Datassist">
          ${isFileItem ? hasDatassistUploads ? html`
            <div className="flex min-w-0 items-center gap-2 rounded-[7px] border border-[#D5E2FF] bg-[#F8FAFF] px-2.5 py-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-white text-[#2F6FED]"><${UploadIcon} /></span>
              <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#344054]" title=${latestDatassistUpload.name}>${latestDatassistUpload.name}</span>
              ${latestDatassistUploadParts.date ? html`<span className="shrink-0 text-[9.5px] text-[#98A2B3]">${latestDatassistUploadParts.date}</span>` : null}
              ${canUploadDatassistFile ? html`
                <button type="button" onClick=${() => onRemoveDatassistUpload(latestDatassistUpload.id)} className="shrink-0 text-[#98A2B3] transition hover:text-[#D92D20]" aria-label="Datassist dosyasını kaldır">${removeIcon}</button>
              ` : null}
            </div>
          ` : canUploadDatassistFile ? html`
            <button
              type="button"
              onClick=${() => datassistFileInputRef.current?.click()}
              className="flex w-full min-w-0 items-center gap-2 rounded-[7px] border border-dashed border-[#B8CDF8] bg-[#F8FAFF] px-2.5 py-2 text-left text-[#2F6FED] transition hover:border-[#7EA2EF] hover:bg-[#EFF4FF]"
            >
              <${UploadIcon} />
              <span className="truncate text-[12px] font-medium">Dosya yükle</span>
            </button>
          ` : html`
            <span className=${badgeGrayDashed}>Henüz dosya yüklenmedi</span>
          ` : html`
            <span className=${badgeGrayDashed}>Dosya gerekmiyor</span>
          `}
          ${isFileItem ? html`
            <input ref=${datassistFileInputRef} type="file" multiple title="Datassist dosyası yükle" className="hidden"
              onChange=${(event) => { onDatassistFileUpload(Array.from(event.target.files || [])); event.target.value = "" }} />
          ` : null}
        </div>

        <!-- MÜŞTERİ YANITI -->
        <div className="live-prep-owner min-w-0 flex flex-wrap items-center gap-1.5 border-[#E4E7EC] md:border-l md:px-4" data-label="Müşteri">
          ${!isImpRole && isFileItem && canAnswer && !isDismissed && !hasCustomerUploads ? html`
            <div className="w-full min-w-0 space-y-2">
              <div className="live-customer-upload">
                <div className="live-customer-upload-actions">
                  <button type="button" disabled=${!canUploadCustomerFile}
                    onClick=${() => customerFileInputRef.current?.click()}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[7px] border border-[#D9D6FE] bg-white px-2.5 text-[12px] font-medium text-[#6941C6] transition hover:bg-[#F4F3FF] disabled:cursor-not-allowed disabled:opacity-40">
                    <${UploadIcon} />Dosya Yükle
                  </button>
                  ${canDismissFile ? html`
                    <label className="live-customer-no-file">
                      <input type="checkbox" checked=${Boolean(isDismissed)}
                        aria-label=${`${item.title}: ${item.dismissLabel}`}
                        onChange=${(event) => event.target.checked ? onDismiss() : onUndismiss()}
                        className="h-4 w-4 cursor-pointer accent-[#7F56D9]" />
                      ${item.dismissLabel}
                    </label>
                  ` : null}
                </div>
              </div>

            </div>
          ` : canSelectResponse || (canAddPerson && !hasAuthorizedPersons) ? null : durumBadge}
          ${canUploadCustomerFile ? html`
            <input ref=${customerFileInputRef} type="file" multiple title="Müşteri dosyası yükle" className="hidden"
              onChange=${(event) => { onCustomerFileUpload(Array.from(event.target.files || [])); event.target.value = "" }} />
          ` : null}
          ${reviewTag}
          ${!isImpRole && (canSelectResponse || canAddPerson) ? html`<div className="w-full min-w-0">          ${canSelectResponse ? html`
            <${LiveResponseSelect} item=${item} onSelect=${onMessageReply} />
          ` : canAddPerson ? html`
            <button type="button" onClick=${() => setIsAddingPerson(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-[#D9D6FE] bg-white px-3 text-[12px] font-medium text-[#6941C6] hover:bg-[#F4F3FF]">
              <${PencilIcon} />Formu Doldur
            </button>
          ` : null}</div>` : null}
        </div>

        <!-- İŞLEMLER -->
        ${isImpRole && canEdit ? html`
        <div className=${classNames(
          "items-center gap-1 md:col-start-4 md:justify-end md:border-l md:border-[#E4E7EC] md:pl-4",
          isSubmitted || isRevisionRequested ? "hidden" : "flex"
        )}>
          ${canEdit ? html`
            <button
              type="button"
              title="Maddeyi sil"
              aria-label="Maddeyi sil"
              onClick=${onRemoveItem}
              className="relative z-10 shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#475467] transition-all duration-200 hover:bg-[#FEF3F2] hover:text-[#D92D20]"
            >
              <${TrashIcon} />
            </button>
          ` : null}
        </div>
        ` : null}

        <!-- AKSİYON: imp inceleme / düzenleme -->
        ${isImpRole && !isStageCompleted && (isSubmitted || isRevisionRequested) ? html`
        <div className="flex flex-wrap items-center justify-end gap-1.5 md:col-start-4 md:row-start-1 md:border-l md:border-[#E4E7EC] md:pl-4">
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
          ` : null}
        </div>
        ` : null}
      </div>

      <!-- sub-row: free-text reply (no selection options) -->
      ${isTextOnly && !hasSelectionOptions && !hasTextReply && canAnswer ? html`
        <div className="live-prep-reply grid grid-cols-1 gap-2 px-5 pb-2.5 md:grid-cols-[minmax(180px,1.1fr)_minmax(180px,1fr)_minmax(180px,1fr)_180px]">
        <div className="hidden md:block"></div>
        <div className="flex max-w-[420px] flex-col gap-1.5 md:col-start-3">
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

function LiveHazirliklarContent({ stepUpload, plannedDate, onSubmitForApproval, onSendDecisions, onCompleteStep, userRole, assignee, onSendMessage, onMeetingRequest }) {
  const isImpRole = !userRole || userRole === "imp_ekibi"
  const isStageCompleted = stepUpload?.status === "completed" || stepUpload?.status === "approved"
  const isSubmitted = stepUpload?.status === "pending_approval"
  const isApproved = stepUpload?.status === "docs_approved"
  const isRevisionRequested = stepUpload?.status === "revision_requested"
  const [itemData, setItemData] = useState(() => createLiveHazirlikInitialData())
  const [customLiveItems, setCustomLiveItems] = useState([])
  const [removedLiveItemIds, setRemovedLiveItemIds] = useState([])
  const [isEditingLiveItems, setIsEditingLiveItems] = useState(false)
  const [isAddLiveItemModalOpen, setIsAddLiveItemModalOpen] = useState(false)
  const assigneeLabel = assignee || "Zerrin Altun"
  const assigneeInitials = assigneeLabel.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

  const canManageLiveTemplate = isImpRole && !isSubmitted && !isApproved && !isStageCompleted

  const allLiveItems = useMemo(
    () => [...liveHazirlikItems, ...customLiveItems].filter((item) => !removedLiveItemIds.includes(item.id)),
    [customLiveItems, removedLiveItemIds]
  )

  const canEditLiveItems = canManageLiveTemplate && isEditingLiveItems
  const showLiveActions = isImpRole && (canEditLiveItems || (!isStageCompleted && (isSubmitted || isRevisionRequested)))

  useEffect(() => {
    if (canManageLiveTemplate) return
    setIsEditingLiveItems(false)
    setIsAddLiveItemModalOpen(false)
  }, [canManageLiveTemplate])

  function handleAddLiveItemsSubmit(entries) {
    const newItems = []
    const newItemData = {}
    entries.forEach(({ label, responseType, description, required }, i) => {
      const id = `custom-live-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`
      const isTextResponse = responseType === "text"
      newItems.push({
        id,
        title: label,
        desc: description || "",
        type: isTextResponse ? "text_only" : "customer_file_optional",
        dismissLabel: null,
        required: Boolean(required),
        addedDuringRevision: isRevisionRequested,
        isCustom: true
      })
      newItemData[id] = {
        impFileSent: false, impFileName: null,
        datassistUploads: [],
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

  const handleDatassistFileUpload = (id, files) => {
    if (!files || files.length === 0) return
    const uploads = files.map((file, index) => ({
      id: `live-datassist-${id}-${Date.now()}-${index}`,
      name: file.name,
      uploadedAt: formatTimestamp(),
      file
    }))
    updateItem(id, { datassistUploads: [...(itemData[id].datassistUploads || []), ...uploads] })
  }

  const handleRemoveDatassistUpload = (id, fileId) => {
    updateItem(id, { datassistUploads: (itemData[id].datassistUploads || []).filter((file) => file.id !== fileId) })
  }

  const handleCustomerFileUpload = (id, files) => {
    if (!files || files.length === 0) return
    const uploads = files.map((f, i) => ({ id: `live-${id}-${Date.now()}-${i}`, name: f.name, uploadedAt: formatTimestamp(), file: f }))
    updateItem(id, {
      customerUploads: [...(itemData[id].customerUploads || []), ...uploads]
    })
  }

  const handleRemoveCustomerUpload = (id, fileId) => {
    updateItem(id, { customerUploads: (itemData[id].customerUploads || []).filter((f) => f.id !== fileId) })
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
    ? reviewableItems.filter((item) => item.required !== false && !itemData[item.id].lockedApproval)
    : reviewableItems.filter((item) => item.required !== false)
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
    ? (isImpRole
        ? { dot: "bg-[#F79009]", border: "border-[#FDE68A]", badgeClass: "border-[#FEC84B] bg-[#FFFAEB] text-[#B54708]", label: "İnceleme Bekliyor" }
        : { dot: "bg-[#2F6FED]", border: "border-[#D5E2FF]", badgeClass: "border-[#D5E2FF] bg-[#EFF4FF] text-[#175CD3]", label: "İncelemede" })
    : { dot: "bg-[#2F6FED]", border: "border-[#E4E7EC]", badgeClass: "border-[#D5E2FF] bg-[#EFF4FF] text-[#175CD3]", label: "Devam Ediyor" }
  const hideDatassistColumn = !isImpRole && !Object.values(itemData).some((entry) => (entry?.datassistUploads || []).length > 0)

  return html`
    <section className=${classNames("space-y-4", !isImpRole && "live-prep-client", !showLiveActions && "live-prep-no-actions", hideDatassistColumn && "live-prep-no-datassist")}>
      <${RejectComposerModal}
        rejectComposer=${{ docId: liveRejectComposer.itemId, docLabel: liveRejectComposer.itemTitle, reason: liveRejectComposer.reason, exampleFiles: liveRejectComposer.exampleFiles }}
        onRejectReasonChange=${(reason) => setLiveRejectComposer((c) => ({ ...c, reason }))}
        onRejectExampleFilesChange=${(files) => setLiveRejectComposer((c) => ({ ...c, exampleFiles: files }))}
        onCancelReject=${closeLiveRejectComposer}
        onConfirmReject=${confirmLiveRejectComposer}
      />
      <div>
        <h2 className="text-[17px] font-semibold text-[#101828]">Canlıya Geçiş Hazırlıkları</h2>
        <p className="mt-1 max-w-[1100px] text-[13px] leading-5 text-[#667085]">
          ${getImplementationStepDescription("integrations", { isClient: !isImpRole })}
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
            <span className="text-[13px] font-semibold text-[#344054]">Canlıya Geçiş Hazırlıkları</span>
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
                ${isEditingLiveItems ? null : html`<${PencilIcon} />`}${isEditingLiveItems ? "Tamam" : "Listeyi Düzenle"}
              </button>
            ` : isImpRole ? html`
              <span
                title=${isSubmitted ? "Müşteri yanıtları incelenirken alan yapısı değiştirilemez." : "Onaylanan alan yapısı değiştirilemez."}
                className="inline-flex h-[26px] items-center gap-1 rounded-[7px] border border-[#E4E7EC] bg-[#F9FAFB] px-2 text-[11px] font-medium text-[#98A2B3]"
              >
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><rect x="2.5" y="6" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Liste Kilitli
              </span>
            ` : null}
            <span className=${classNames("inline-flex h-[22px] items-center rounded-full border px-2.5 text-[11px] font-medium", statusMeta.badgeClass)}>
              ${statusMeta.label}
            </span>
          </div>
        </div>

        <!-- column header -->
        <div className="live-prep-columns hidden grid-cols-[minmax(180px,1.1fr)_minmax(180px,1fr)_minmax(180px,1fr)_180px] items-center gap-0 border-b border-[#E4E7EC] bg-[#F8FAFC] px-5 md:grid">
          <div className="py-2.5 pr-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#667085]">Dosya / Belge</div>
          <div className="live-prep-col-datassist flex items-center gap-2 border-l border-[#E4E7EC] px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-[#2F6FED]"></span>
            <span className="text-[11px] font-semibold text-[#344054]">Datassist</span>
          </div>
          <div className="flex items-center gap-2 border-l border-[#E4E7EC] px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-[#7F56D9]"></span>
            <span className="text-[11px] font-semibold text-[#344054]">Müşteri</span>
          </div>
          ${showLiveActions ? html`<div className="border-l border-[#E4E7EC] py-2.5 pl-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#667085]">İşlemler</div>` : null}
        </div>

        <!-- items -->
        <div className="divide-y divide-[#F2F4F7]">
          ${allLiveItems.map((item, index) => html`
            <${LiveHazirlikItem}
              key=${item.id}
              item=${item}
              displayNumber=${String(index + 1).padStart(2, "0")}
              data=${itemData[item.id]}
              plannedDate=${plannedDate}
              isImpRole=${isImpRole}
              isStageCompleted=${isStageCompleted}
              isSubmitted=${isSubmitted}
              isRevisionRequested=${isRevisionRequested}
              canEdit=${canEditLiveItems}
              onRemoveItem=${() => handleRemoveLiveItem(item)}
              onDatassistFileUpload=${(files) => handleDatassistFileUpload(item.id, files)}
              onRemoveDatassistUpload=${(fileId) => handleRemoveDatassistUpload(item.id, fileId)}
              onCustomerFileUpload=${(files) => handleCustomerFileUpload(item.id, files)}
              onRemoveCustomerUpload=${(fileId) => handleRemoveCustomerUpload(item.id, fileId)}
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
            ${isStageCompleted && doneCount === 0
              ? "Bu aşamada yüklenmiş dosya veya kayıt bulunmuyor."
              : isSubmitted ? `${approvedCount + revisionCount} / ${reviewableItems.length} incelendi` : `${doneCount} / ${totalCount} madde`}
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
        stepTitle="Canlıya Geçiş Hazırlıkları"
        allowTemplate=${false}
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
    countLabel: "hata",
    dot: "bg-[#F04438]",
    chipClass: "border-[#FDA29B] bg-[#FEF3F2] text-[#D92D20]",
    cardClass: "border-[#FDA29B] bg-[#FFFBFA]",
    hint: "Düzeltilmesi zorunludur. Hatalar giderilmeden dosya yüklenemez."
  },
  uyari: {
    label: "Uyarı",
    listLabel: "Uyarı",
    countLabel: "uyarı",
    dot: "bg-[#F79009]",
    chipClass: "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]",
    cardClass: "border-[#FEDF89] bg-[#FFFCF5]",
    hint: "Gönderimi engellemez. Bilgilerin doğruluğu açısından dikkatle kontrol edilmesi gerekmektedir."
  },
  guncelleme: {
    label: "Otomatik Güncelleme",
    listLabel: "Otomatik Güncelleme",
    countLabel: "otomatik güncelleme",
    dot: "bg-[#2F6FED]",
    chipClass: "border-[#D5E2FF] bg-[#EFF4FF] text-[#2F6FED]",
    cardClass: "border-[#D5E2FF] bg-[#F8FAFF]",
    hint: "Sistem tarafından düzeltilen alanlardır. Kontrol edilmesi önerilir."
  },
  yeni: {
    label: "Yeni Alan",
    listLabel: "Yeni Eklenen Alan",
    countLabel: "yeni alan",
    dot: "bg-[#7A5AF8]",
    chipClass: "border-[#D9D6FE] bg-[#F4F3FF] text-[#5925DC]",
    cardClass: "border-[#D9D6FE] bg-[#FBFAFF]",
    hint: "Şablonda tanımlı olmayan, sonradan eklenmiş alanlardır."
  }
}

const STARTER_KIT_TYPE_ORDER = ["hata", "uyari", "guncelleme", "yeni"]

function generateStarterKitValidationIssues() {
  const demoNamesByRow = {
    2: "Ahmet Yılmaz", 5: "Zeynep Demir", 10: "Ece Koç", 11: "Mehmet Demir", 12: "Can Öztürk",
    13: "Derya Aksoy", 14: "Onur Kılıç", 15: "İrem Polat", 25: "Seda Acar", 47: "Kerem Yalçın",
    67: "Buse Taş", 85: "Murat Çelik", 86: "Elif Kaya", 87: "Burak Arslan", 88: "Deniz Aydın"
  }
  const rows = (fieldId, fieldLabel, column, type, message, entries) => entries.map(([row, originalValue, nextValue], index) => ({
    id: `${fieldId}-${index + 1}`,
    fieldId,
    fieldLabel,
    column,
    type,
    row,
    originalValue,
    ...(type === "guncelleme" ? { newValue: nextValue } : nextValue ? { suggestedValue: nextValue } : {}),
    message
  }))

  return [
    ...rows("dogum-tarihi", "Doğum Tarihi", "M", "hata",
      "Doğum tarihi zorunlu bir alandır; girilen değer geçerli bir tarih değildir. Dosyanın yüklenebilmesi için doğum tarihinin GG.AA.YYYY formatında doldurulması gerekmektedir.",
      [[85, "00.00.0000"], [86, "00.00.0000"], [87, "00.00.0000"], [88, "00.00.0000"]]),
    ...rows("medeni-hali", "Medeni Hali", "N", "guncelleme",
      "Kısaltma olarak girilen medeni hal bilgisi sistemdeki karşılığına dönüştürüldü.",
      [[10, "E", "Evli"], [11, "E", "Evli"], [12, "B", "Bekar"], [13, "E", "Evli"], [14, "B", "Bekar"]]),
    ...rows("ogrenim-durumu", "Öğrenim Durumu", "P", "uyari",
      "Girilen değer tanımlı öğrenim durumları arasında bulunmamaktadır. Alanın listedeki değerlerden biriyle (İlkokul, Ortaokul, Lise, Önlisans, Lisans, Yüksek Lisans, Doktora) güncellenmesi veya bilgi yoksa boş bırakılması gerekmektedir. Bu haliyle gönderilirse alan boş olarak aktarılacaktır.",
      [[67, "- Yok"]]),
    ...rows("sgk-sicil-no", "SGK Sicil No", "R", "uyari",
      "SGK sicil numarası boş bırakılmıştır. T.C. Kimlik No ile doldurulması önerilir; değer otomatik olarak uygulanmamıştır.",
      [[86, "", "26225062432"], [87, "", "41794532476"], [88, "", "26216062724"]]),
    ...rows("meslek-kodu", "Meslek Kodu", "W", "guncelleme",
      "Meslek kodu, sisteme aktarım için zorunlu bir alandır. Boş bırakıldığı için 0000.00 olarak dolduruldu. Doğru meslek kodunun girilmesi önerilir.",
      [[86, "", "0000.00"], [87, "", "0000.00"], [88, "", "0000.00"]]),
    ...rows("kidem-tarihi", "Kıdem Tarihi", "AH", "uyari",
      "Kıdem tarihi boş bırakılmıştır. İşe giriş tarihi ile doldurulması önerilir; değer otomatik olarak uygulanmamıştır.",
      [[10, "", "03.04.2023"], [11, "", "01.11.2024"], [12, "", "21.03.2023"]]),
    ...rows("ssk-tabi", "Çalışan SSK'ya Tabi", "AO", "uyari",
      "Çalışan SSK'ya tabi değil olarak belirtilmiştir. Bu durum istisnai olduğundan bilginin kontrol edilmesi önerilir.",
      [[86, "Hayır"], [87, "Hayır"]]),
    ...rows("kanun-no", "Kanun No", "AR", "guncelleme",
      "Çalışan emekli olarak belirtildiği için Kanun No 5510 yerine 0000 olarak güncellendi.",
      [[10, "5510", "0000"], [12, "5510", "0000"], [14, "5510", "0000"], [15, "5510", "0000"], [25, "5510", "0000"]]),
    ...rows("asgari-ucret-istisnasi", "Asgari Ücret İstisnasına Tabi Mi?", "AT", "uyari",
      "Çalışan asgari ücret istisnasına tabi değil olarak belirtilmiştir. Bu bilgi bordro hesaplamasını etkileyeceğinden kontrol edilmesi önerilir.",
      [[86, "Hayır"], [87, "Hayır"], [88, "Hayır"]]),
    ...rows("maas", "Maaş", "AU", "uyari",
      "Çalışan asgari ücret istisnasına tabi olarak belirtilmiş; ancak girilen maaş güncel asgari ücretin altındadır. Maaş tutarının kontrol edilmesi gerekmektedir.",
      [[47, "3.475 TL"]]),
    ...rows("iban", "IBAN", "BD", "uyari",
      "IBAN alanı boş bırakılmıştır. Dosya bu haliyle gönderilebilir; ancak maaş ödemelerinin yapılabilmesi için IBAN bilgisinin canlıya geçişten önce tamamlanması gerekmektedir.",
      [[10, ""], [11, ""], [12, ""], [13, ""], [14, ""], [15, ""]]),
    ...rows("departman", "Departman", "BH", "yeni",
      "Bu alan standart Starter Kit şablonunda yer almamaktadır; dosyaya sonradan eklenmiş yeni bir alan olarak tespit edildi.",
      [[2, "İnsan Kaynakları"], [5, "Muhasebe"]]),
    // Görünen anlamı değiştirmeyen kod eşleştirmeleri arka planda uygulanır; listede ve raporda yer almaz.
    ...rows("maas-turu", "Maaş Türü", "AV", "guncelleme", "Kod eşleştirmesi.", [[10, "Brüt", "Brut"], [11, "Brüt", "Brut"]])
      .map((issue) => ({ ...issue, codeMapping: true }))
  ].map((issue) => ({ ...issue, fullName: demoNamesByRow[issue.row] || "" }))
}

const STARTER_KIT_SEVERITY_RANK = { hata: 0, uyari: 1, guncelleme: 2, yeni: 3 }

function starterKitColumnIndex(column = "") {
  return [...String(column).toUpperCase()].reduce((total, char) => total * 26 + (char.charCodeAt(0) - 64), 0)
}

function getVisibleStarterKitIssues(issues = []) {
  return issues.filter((issue) => !issue.codeMapping)
}

// Önce hatalar, ardından Starter Kit'teki sütun sırası.
function sortStarterKitIssues(issues = []) {
  return [...issues].sort((a, b) => {
    const errorOrder = (a.type === "hata" ? 0 : 1) - (b.type === "hata" ? 0 : 1)
    if (errorOrder !== 0) return errorOrder
    return starterKitColumnIndex(a.column) - starterKitColumnIndex(b.column) || a.row - b.row
  })
}

function summarizeStarterKitValidation(validation) {
  if (!validation) return null
  const totals = { hata: 0, uyari: 0, guncelleme: 0, yeni: 0 }
  getVisibleStarterKitIssues(validation.issues).forEach((issue) => { totals[issue.type] += 1 })
  return totals
}

const STARTER_KIT_EXCEL_STYLE_BY_TYPE = {
  hata: { fill: "FEF3F2", font: "D92D20", border: "FDA29B" },
  uyari: { fill: "FFFAEB", font: "B54708", border: "FEDF89" },
  guncelleme: { fill: "EFF4FF", font: "2F6FED", border: "D5E2FF" },
  yeni: { fill: "F4F3FF", font: "5925DC", border: "D9D6FE" }
}

function getStarterKitExcelColumns(issues) {
  const columns = [{ column: "A", label: "Ad Soyad" }]
  const seen = new Set(["A"])
  sortStarterKitIssues(issues)
    .sort((a, b) => starterKitColumnIndex(a.column) - starterKitColumnIndex(b.column))
    .forEach((issue) => {
      if (seen.has(issue.column)) return
      seen.add(issue.column)
      columns.push({ column: issue.column, label: issue.fieldLabel })
    })
  return columns
}

function buildStarterKitExcelCellStyle({ fill, font, border }, { bold } = {}) {
  return {
    fill: { fgColor: { rgb: fill } },
    font: { color: { rgb: font }, bold: Boolean(bold) },
    border: {
      top: { style: "thin", color: { rgb: border } },
      bottom: { style: "thin", color: { rgb: border } },
      left: { style: "thin", color: { rgb: border } },
      right: { style: "thin", color: { rgb: border } }
    },
    alignment: { vertical: "center", wrapText: true }
  }
}

// Yüklenen dosya yoksa (demo kayıtları) bulgulardaki satır/sütunlardan sade bir sayfa kurulur.
function buildStarterKitReconstructedSheet(issues) {
  const columns = getStarterKitExcelColumns(issues)
  const maxRow = issues.reduce((max, issue) => Math.max(max, issue.row), 1)
  const aoa = Array.from({ length: maxRow }, () => new Array(columns.length).fill(""))
  aoa[0] = columns.map((col) => col.label)

  issues.forEach((issue) => {
    const colIndex = columns.findIndex((col) => col.column === issue.column)
    if (colIndex === -1 || issue.row < 2 || issue.row > maxRow) return
    aoa[issue.row - 1][0] = issue.fullName || ""
    aoa[issue.row - 1][colIndex] = (issue.type === "guncelleme" ? issue.newValue : issue.originalValue) || ""
  })

  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws["!cols"] = columns.map((col) => ({ wch: Math.max(14, col.label.length + 4) }))

  const headerStyle = buildStarterKitExcelCellStyle({ fill: "F2F4F7", font: "101828", border: "D0D5DD" }, { bold: true })
  columns.forEach((_, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex })
    if (ws[cellRef]) ws[cellRef].s = headerStyle
  })

  getVisibleStarterKitIssues(issues).forEach((issue) => {
    const colIndex = columns.findIndex((col) => col.column === issue.column)
    if (colIndex === -1 || issue.row < 2 || issue.row > maxRow) return
    const cellRef = XLSX.utils.encode_cell({ r: issue.row - 1, c: colIndex })
    if (!ws[cellRef]) ws[cellRef] = { t: "s", v: "" }
    ws[cellRef].s = buildStarterKitExcelCellStyle(STARTER_KIT_EXCEL_STYLE_BY_TYPE[issue.type])
  })
  return ws
}

function downloadStarterKitEditedExcel(issues, file) {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, buildStarterKitReconstructedSheet(issues), "Starter Kit")

  const baseName = (file?.name || "Starter-Kit").replace(/\.[^/.]+$/, "")
  XLSX.writeFile(wb, `${baseName}_Duzenlenmis.xlsx`)
}

function starterKitIssueComment(issue) {
  const meta = STARTER_KIT_ISSUE_TYPE_META[issue.type]
  const lines = [`${meta.label}: ${issue.message}`]
  if (issue.type === "guncelleme") lines.push(`Önceki değer: ${issue.originalValue || "Boş"}`)
  if (issue.suggestedValue) lines.push(`Önerilen değer: ${issue.suggestedValue}`)
  return lines.join("\n")
}

// Uzman için: yüklenen Starter Kit, validasyon ekranındaki renklerle işaretlenmiş halde indirilir.
// Her işaretli hücrede bulgunun açıklaması not olarak durur; renk açıklaması ayrı sayfadadır.
async function downloadStarterKitColoredExcel(file) {
  if (!window.XLSX) { window.alert("Excel bileşeni yüklenemedi. Lütfen tekrar deneyin."); return }
  const issues = getVisibleStarterKitIssues(file.validation?.issues || [])
  let wb = null
  if (file.downloadUrl) {
    try {
      const buffer = await fetch(file.downloadUrl).then((res) => res.arrayBuffer())
      wb = XLSX.read(buffer, { type: "array", cellStyles: true })
    } catch (_) { wb = null }
  }

  if (wb) {
    const personalSheet = wb.SheetNames.find((name) => name.toLocaleLowerCase("tr-TR").includes("kişisel")) || wb.SheetNames[0]
    issues.forEach((issue) => {
      const ws = wb.Sheets[wb.SheetNames.includes(issue.sheet) ? issue.sheet : personalSheet]
      const r = issue.row - 1
      const c = starterKitColumnIndex(issue.column) - 1
      if (!ws || r < 0 || c < 0) return
      const ref = XLSX.utils.encode_cell({ r, c })
      if (!ws[ref]) ws[ref] = { t: "s", v: "" }
      ws[ref].s = buildStarterKitExcelCellStyle(STARTER_KIT_EXCEL_STYLE_BY_TYPE[issue.type], { bold: true })
      ws[ref].c = [{ a: "Datassist", t: starterKitIssueComment(issue) }]
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1")
      ws["!ref"] = XLSX.utils.encode_range({ s: range.s, e: { r: Math.max(range.e.r, r), c: Math.max(range.e.c, c) } })
    })
  } else {
    wb = XLSX.utils.book_new()
    const ws = buildStarterKitReconstructedSheet(issues)
    const columns = getStarterKitExcelColumns(issues)
    issues.forEach((issue) => {
      const c = columns.findIndex((col) => col.column === issue.column)
      const ref = XLSX.utils.encode_cell({ r: issue.row - 1, c })
      if (c > 0 && ws[ref]) ws[ref].c = [{ a: "Datassist", t: starterKitIssueComment(issue) }]
    })
    XLSX.utils.book_append_sheet(wb, ws, "Starter Kit")
  }

  const totals = summarizeStarterKitValidation(file.validation) || { hata: 0, uyari: 0, guncelleme: 0, yeni: 0 }
  const legendRows = [
    ["Renk Açıklaması", "Kayıt", "Anlamı"],
    ...STARTER_KIT_TYPE_ORDER.map((type) => [STARTER_KIT_ISSUE_TYPE_META[type].listLabel, totals[type], STARTER_KIT_ISSUE_TYPE_META[type].hint]),
    [],
    ["Dosya", file.name],
    ["Kontrol tarihi", file.validation?.checkedAt || ""],
    ["Not", "Renkli hücrelerin üzerine gelince bulgunun açıklaması görünür."]
  ]
  const legend = XLSX.utils.aoa_to_sheet(legendRows)
  legend["!cols"] = [{ wch: 24 }, { wch: 8 }, { wch: 80 }]
  const headerStyle = buildStarterKitExcelCellStyle({ fill: "1D2939", font: "FFFFFF", border: "1D2939" }, { bold: true })
  ;[0, 1, 2].forEach((c) => { legend[XLSX.utils.encode_cell({ r: 0, c })].s = headerStyle })
  STARTER_KIT_TYPE_ORDER.forEach((type, i) => {
    const ref = XLSX.utils.encode_cell({ r: i + 1, c: 0 })
    legend[ref].s = buildStarterKitExcelCellStyle(STARTER_KIT_EXCEL_STYLE_BY_TYPE[type], { bold: true })
  })
  XLSX.utils.book_append_sheet(wb, legend, "Renk Açıklaması")

  XLSX.writeFile(wb, `${file.name.replace(/\.[^.]+$/, "")}_Validasyon_Renkli.xlsx`)
}

function buildStarterKitFieldGroups(issues) {
  const map = new Map()
  sortStarterKitIssues(issues).forEach((issue) => {
    if (!map.has(issue.fieldId)) {
      map.set(issue.fieldId, { fieldId: issue.fieldId, label: issue.fieldLabel, column: issue.column, issues: [] })
    }
    map.get(issue.fieldId).issues.push(issue)
  })
  return [...map.values()]
    .map((group) => ({
      ...group,
      severity: group.issues.reduce(
        (acc, issue) => (STARTER_KIT_SEVERITY_RANK[issue.type] < STARTER_KIT_SEVERITY_RANK[acc] ? issue.type : acc),
        "yeni"
      )
    }))
    .sort((a, b) => ((a.severity === "hata" ? 0 : 1) - (b.severity === "hata" ? 0 : 1)) || starterKitColumnIndex(a.column) - starterKitColumnIndex(b.column))
}

// Aynı türde ve aynı mesaja sahip kayıtlar tek açıklama altında toplanır.
function clusterStarterKitIssues(issues) {
  const map = new Map()
  issues.forEach((issue) => {
    const key = `${issue.type}::${issue.message}`
    if (!map.has(key)) map.set(key, { key, type: issue.type, message: issue.message, issues: [] })
    map.get(key).issues.push(issue)
  })
  return [...map.values()]
}

function StarterKitValue({ value }) {
  return value
    ? html`<span className="skc-value">${value}</span>`
    : html`<span className="skc-empty">Boş</span>`
}

function StarterKitValueChange({ issue }) {
  if (issue.type === "guncelleme") {
    return html`<span className="skc-change"><${StarterKitValue} value=${issue.originalValue} /><span className="skc-arrow" aria-hidden="true">→</span><strong className="skc-applied">${issue.newValue}</strong></span>`
  }
  if (issue.suggestedValue) {
    return html`<span className="skc-change"><${StarterKitValue} value=${issue.originalValue} /><span className="skc-arrow" aria-hidden="true">→</span><span className="skc-suggested">Öneri: ${issue.suggestedValue}</span></span>`
  }
  return html`<${StarterKitValue} value=${issue.originalValue} />`
}

function StarterKitIssueCluster({ cluster }) {
  const meta = STARTER_KIT_ISSUE_TYPE_META[cluster.type]
  const hasSuggestion = cluster.issues.some((issue) => issue.suggestedValue)
  const tagLabel = cluster.type === "guncelleme" ? "Otomatik uygulandı" : hasSuggestion ? "Öneri · Uygulanmadı" : meta.label
  const transformations = cluster.type === "guncelleme"
    ? [...cluster.issues.reduce((map, issue) => {
        const key = `${issue.originalValue}→${issue.newValue}`
        if (!map.has(key)) map.set(key, { key, originalValue: issue.originalValue, newValue: issue.newValue, issues: [] })
        map.get(key).issues.push(issue)
        return map
      }, new Map()).values()]
    : []

  return html`
    <article className=${`skc-card ${cluster.type}`}>
      <div className="skc-card-head">
        <p>${cluster.message}</p>
        <span className=${`skc-tag ${cluster.type}`}>${tagLabel}</span>
      </div>
      ${cluster.type === "guncelleme" ? html`
        <div className="skc-table" role="table" aria-label="Uygulanan dönüşümler">
          <div className="skc-tr skc-th skc-tr-transform" role="row"><span role="columnheader">Mevcut</span><span role="columnheader">Uygulanan</span><span role="columnheader">Kayıt</span></div>
          ${transformations.map((item) => html`
            <details key=${item.key} className="skc-transform">
              <summary className="skc-tr skc-tr-transform" role="row">
                <span role="cell"><${StarterKitValue} value=${item.originalValue} /></span>
                <span role="cell"><strong className="skc-applied">${item.newValue}</strong></span>
                <span role="cell" className="skc-count">${item.issues.length} kayıt <span className="skc-caret" aria-hidden="true">▾</span></span>
              </summary>
              <div className="skc-transform-rows">
                ${item.issues.map((issue) => html`<span key=${issue.id}>Satır ${issue.row} · ${issue.fullName || "Belirtilmemiş"} · Sütun ${issue.column}</span>`)}
              </div>
            </details>
          `)}
        </div>
      ` : html`
        <div className="skc-table" role="table" aria-label="Etkilenen kayıtlar">
          <div className="skc-tr skc-th" role="row"><span role="columnheader">Satır</span><span role="columnheader">Çalışan</span><span role="columnheader">Değer</span></div>
          ${cluster.issues.map((issue) => html`
            <div key=${issue.id} className="skc-tr" role="row">
              <span role="cell" className="skc-row">${issue.row}<small>${issue.column}</small></span>
              <span role="cell" className="skc-name">${issue.fullName || "Belirtilmemiş"}</span>
              <span role="cell"><${StarterKitValueChange} issue=${issue} /></span>
            </div>
          `)}
        </div>
      `}
    </article>
  `
}

function downloadStarterKitValidationReport(file) {
  if (!window.XLSX) { window.alert("Excel bileşeni yüklenemedi. Lütfen tekrar deneyin."); return }
  const issues = sortStarterKitIssues(getVisibleStarterKitIssues(file.validation.issues))
  const wb = XLSX.utils.book_new()
  const headerStyle = buildStarterKitExcelCellStyle({ fill: "1D2939", font: "FFFFFF", border: "1D2939" }, { bold: true })

  function addSheet(name, rows, { header = true } = {}) {
    const sheet = XLSX.utils.aoa_to_sheet(rows)
    const widths = rows[0].map((_, columnIndex) => Math.min(70, Math.max(10, ...rows.map((row) => String(row[columnIndex] ?? "").length + 2))))
    sheet["!cols"] = widths.map((wch) => ({ wch }))
    if (header) {
      rows[0].forEach((_, columnIndex) => {
        const ref = XLSX.utils.encode_cell({ r: 0, c: columnIndex })
        if (sheet[ref]) sheet[ref].s = headerStyle
      })
      sheet["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(rows.length - 1, 1), c: rows[0].length - 1 } }) }
      sheet["!views"] = [{ state: "frozen", ySplit: 1 }]
    }
    XLSX.utils.book_append_sheet(wb, sheet, name)
  }

  const totals = summarizeStarterKitValidation(file.validation)
  addSheet("Özet", [
    ["Starter Kit Validasyon Raporu", ""],
    ["Dosya", file.name],
    ["Kontrol tarihi", file.validation.checkedAt],
    ["", ""],
    ["Tür", "Kayıt sayısı"],
    ...STARTER_KIT_TYPE_ORDER.map((type) => [STARTER_KIT_ISSUE_TYPE_META[type].listLabel, totals[type]])
  ], { header: false })

  const sheets = [
    ["hata", "Hatalar", "Beklenen Değer"],
    ["uyari", "Uyarılar", "Önerilen Değer"],
    ["guncelleme", "Otomatik Güncellemeler", "Uygulanan Değer"],
    ["yeni", "Yeni Eklenen Alanlar", ""]
  ]
  sheets.forEach(([type, name, valueHeader]) => {
    const typeIssues = issues.filter((issue) => issue.type === type)
    if (typeIssues.length === 0 && (type === "hata" || type === "yeni")) return
    const header = ["Satır", "Çalışan", "Sütun", "Alan", "Mevcut Değer", ...(valueHeader ? [valueHeader] : []), "Açıklama"]
    addSheet(name, [header, ...typeIssues.map((issue) => [
      issue.row,
      issue.fullName || "",
      issue.column,
      issue.fieldLabel,
      issue.originalValue || "Boş",
      ...(valueHeader ? [type === "guncelleme" ? issue.newValue : issue.suggestedValue || ""] : []),
      issue.message
    ])])
  })

  XLSX.writeFile(wb, `${file.name.replace(/\.[^.]+$/, "")}_Validasyon_Raporu.xlsx`)
}

// Demo kayıtlarında yüklenmiş dosya bulunmadığından, müşteri görünümü için bulgulardan şablona uygun
// örnek bir Kişisel Bilgi sayfası üretilir. Bulgu olmayan hücreler geçerli örnek değerlerle doldurulur.
function buildStarterKitDemoFile(file) {
  const issues = file.validation?.issues || []
  const layout = [
    ["A", "Personel Sicil Numarası"], ["B", "Adı"], ["C", "Soyadı"], ["D", "Cinsiyet"], ["E", "T.C. Kimlik No"],
    ["M", "Doğum Tarihi"], ["N", "Medeni Hali"], ["P", "Öğrenim Durumu"], ["R", "SGK Sicil No"], ["W", "Meslek Kodu"],
    ["AG", "İşe Giriş Tarihi"], ["AH", "Kıdem Tarihi"], ["AO", "Çalışan SSK'ya Tabi"], ["AQ", "Emekli"], ["AR", "Kanun No"],
    ["AT", "Asgari Ücret İstisnasına Tabi Mi?"], ["AU", "Maaş"], ["BD", "IBAN"]
  ]
  issues.filter((issue) => issue.type === "yeni" && !layout.some(([col]) => col === issue.column)).forEach((issue) => layout.push([issue.column, issue.fieldLabel]))
  const col = (letter) => starterKitColumnIndex(letter) - 1
  const lastRow = Math.max(30, ...issues.map((issue) => issue.row))
  const width = Math.max(...layout.map(([letter]) => col(letter))) + 1
  const aoa = Array.from({ length: lastRow }, () => new Array(width).fill(""))
  layout.forEach(([letter, label]) => { aoa[0][col(letter)] = label })

  let seed = 7
  const rand = (n) => { seed = (seed * 9301 + 49297) % 233280; return Math.floor((seed / 233280) * n) }
  const tc = () => {
    const n = [1 + rand(9), ...Array.from({ length: 8 }, () => rand(10))]
    const d10 = (((n[0] + n[2] + n[4] + n[6] + n[8]) * 7 - (n[1] + n[3] + n[5] + n[7])) % 10 + 10) % 10
    const d11 = (n.reduce((a, b) => a + b, 0) + d10) % 10
    return [...n, d10, d11].join("")
  }
  const iban = () => {
    const bban = Array.from({ length: 22 }, () => rand(10)).join("")
    let rem = 0
    for (const ch of `${bban}292700`) rem = (rem * 10 + Number(ch)) % 97
    return `TR${String(98 - rem).padStart(2, "0")}${bban}`
  }
  const pad = (n) => String(n).padStart(2, "0")
  const date = (from, span) => `${pad(1 + rand(28))}.${pad(1 + rand(12))}.${from + rand(span)}`
  const firstNames = ["Ali", "Ayşe", "Mehmet", "Fatma", "Emre", "Selin", "Burak", "Esra", "Oğuz", "Gizem", "Kaan", "Nur"]
  const lastNames = ["Yıldız", "Şahin", "Çelik", "Aydın", "Öztürk", "Arslan", "Doğan", "Kurt", "Koç", "Özdemir"]
  const names = Object.fromEntries(issues.filter((issue) => issue.fullName).map((issue) => [issue.row, issue.fullName]))
  const retired = new Set(issues.filter((issue) => issue.fieldId === "kanun-no").map((issue) => issue.row))

  for (let r = 2; r <= lastRow; r++) {
    const row = aoa[r - 1]
    const [first, ...rest] = (names[r] || `${firstNames[rand(firstNames.length)]} ${lastNames[rand(lastNames.length)]}`).split(" ")
    const id = tc()
    const start = date(2015, 9)
    const values = {
      A: String(1000 + r), B: first, C: rest.join(" "), D: rand(2) ? "E" : "K", E: id, M: date(1965, 35), N: rand(2) ? "Evli" : "Bekar",
      P: ["Lise", "Önlisans", "Lisans", "Yüksek Lisans"][rand(4)], R: id, W: "7233.05", AG: start, AH: start, AO: "Evet",
      AQ: retired.has(r) ? "Evet" : "Hayır", AR: retired.has(r) ? "0000" : "5510", AT: "Evet", AU: String(40000 + rand(60) * 1000), BD: iban()
    }
    Object.entries(values).forEach(([letter, value]) => { row[col(letter)] = value })
  }
  issues.forEach((issue) => {
    const c = col(issue.column)
    if (issue.row < 2 || c < 0 || c >= width) return
    aoa[issue.row - 1][c] = (issue.type === "guncelleme" ? issue.newValue : issue.originalValue) || ""
  })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "Kişisel Bilgi")
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" })
  return new File([out], file.name.replace(/\.[^.]+$/, ".xlsx"), { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
}

async function loadStarterKitSheetFile(file) {
  if (file.downloadUrl) {
    try {
      const blob = await fetch(file.downloadUrl).then((res) => res.blob())
      return new File([blob], file.name, { type: blob.type })
    } catch (_) { /* demo dosyasına düşülür */ }
  }
  return buildStarterKitDemoFile(file)
}

// Uzmanın dosya satırından açtığı validasyon sonucu: müşterinin gördüğü Excel ekranı, tüm çalışanlarla ve
// dört türle (hata varsa, uyarı, otomatik güncelleme, yeni alan) salt okunur açılır; karar bu ekrandan verilir.
function StarterKitReview({ file, isClient = false, canReview = false, onApprove, onReject, onShowRejectReason }) {
  const [open, setOpen] = useState(false)
  const [sheetFile, setSheetFile] = useState(null)
  const validation = file.validation

  async function openWith() {
    if (isClient) { setOpen(true); return }
    if (!window.XLSX || !window.StarterKitSheetEditor) { window.alert("Excel bileşeni yüklenemedi. Lütfen tekrar deneyin."); return }
    setSheetFile(await loadStarterKitSheetFile(file))
  }

  function decide(action) {
    setSheetFile(null)
    action?.()
  }

  if (!validation) return html`<p className="sk-unavailable">Bu sürüm için validasyon sonucu bulunmuyor.</p>`
  const clientModal = isClient && open ? ReactDOM.createPortal(html`
    <${StarterKitValidationModal}
      isOpen=${true}
      readOnly=${true}
      isClient=${true}
      file=${file}
      onClose=${() => setOpen(false)}
    />
  `, document.body) : null

  const footerActions = html`
    <button type="button" className="sks-btn" title="Bulgu hücreleri bu ekrandaki renklerle işaretlenmiş Excel dosyası" onClick=${() => downloadStarterKitColoredExcel(file)}>Excel'i İndir</button>
    <button type="button" className="sks-btn" onClick=${() => downloadStarterKitValidationReport(file)}>Raporu İndir</button>
    ${canReview ? html`
      <button type="button" className="sks-btn sk-decide-reject" onClick=${() => decide(onReject)}>Reddet</button>
      <button type="button" className="sks-btn sk-decide-approve" onClick=${() => decide(onApprove)}>Onayla</button>
    ` : null}
  `
  const footerNote = canReview
    ? html`<b>Kararınızı bu ekrandan verebilirsiniz.</b> Kararlar gönderilene kadar müşteriye iletilmez.`
    : "Yalnızca görüntüleme · Bu dosya için karar verilmiş veya inceleme beklenmiyor."

  return html`
    <div className="sk-summary">
      <div className="sk-links">
        <button className="sk-open" type="button" onClick=${() => openWith()}>Validasyon Sonuçlarını Gör <span>↗</span></button>
        ${onShowRejectReason ? html`<button className="sk-open reject" type="button" aria-haspopup="dialog" onClick=${onShowRejectReason}>Red Nedenini Gör <span>↗</span></button>` : null}
      </div>
    </div>
    ${clientModal}
    ${sheetFile && window.StarterKitSheetEditor ? html`
      <${window.StarterKitSheetEditor}
        file=${sheetFile}
        readOnly=${true}
        expert=${{ issues: validation.issues, checkedAt: validation.checkedAt, footerNote, footerActions }}
        onClose=${() => setSheetFile(null)}
      />
    ` : null}
  `
}

// Müşteri validasyon modalı: yalnızca hata (kırmızı) ve uyarı (mor).
const STARTER_KIT_CLIENT_TYPES = ["hata", "uyari"]
const STARTER_KIT_CLIENT_TYPE_META = {
  ...STARTER_KIT_ISSUE_TYPE_META,
  uyari: {
    ...STARTER_KIT_ISSUE_TYPE_META.uyari,
    dot: "bg-[#7A5AF8]",
    chipClass: "border-[#D9D6FE] bg-[#F4F3FF] text-[#5925DC]",
    cardClass: "border-[#D9D6FE] bg-[#FAFAFF]"
  }
}

function StarterKitValidationModal({ isOpen, file, onClose, onReupload, onSubmit, isClient = false, readOnly = false, initialTypeFilter = null }) {
  const [issues, setIssues] = useState([])
  const [activeFieldId, setActiveFieldId] = useState("")
  const [activeTypeFilter, setActiveTypeFilter] = useState(null)
  // uploadAttemptRef: modal acildiktan sonraki ilk dosya tum hata/uyarilari gosterir,
  // 1. "Yeniden Yukle" ile secilen dosya duzeltilmis kabul edilip yalnizca otomatik
  // guncellemeleri ve uyarilari gosterir, 2. "Yeniden Yukle" ise tamamen dogru kabul edilip hicbir
  // kayit gostermez (boylece gonderim akisinin tum adimlari test edilebilir).
  const uploadAttemptRef = useRef(0)

  useEffect(() => {
    if (!isOpen) {
      uploadAttemptRef.current = 0
      return
    }
    // Salt okunur modda yüklenen dosyanın kayıtlı validasyon sonucu gösterilir.
    if (readOnly) {
      const savedIssues = file?.validation?.issues || []
      const visibleSaved = getVisibleStarterKitIssues(savedIssues)
      setIssues(savedIssues)
      setActiveTypeFilter(initialTypeFilter)
      setActiveFieldId(buildStarterKitFieldGroups(initialTypeFilter ? visibleSaved.filter((issue) => issue.type === initialTypeFilter) : visibleSaved)[0]?.fieldId || "")
      return
    }
    const allIssues = generateStarterKitValidationIssues()
    const attempt = uploadAttemptRef.current
    const nextIssues = attempt === 0 ? allIssues : attempt === 1 ? allIssues.filter((issue) => issue.type !== "hata") : []
    uploadAttemptRef.current = attempt + 1
    setIssues(nextIssues)
    setActiveFieldId(buildStarterKitFieldGroups(getVisibleStarterKitIssues(nextIssues))[0]?.fieldId || "")
    setActiveTypeFilter(null)
  }, [isOpen, file, readOnly, initialTypeFilter])

  if (!isOpen) return null

  // Müşteri yalnızca hata ve uyarıları görür (uyarı mor); otomatik güncelleme ve yeni alanlar uzman ekranında listelenir.
  const displayIssues = getVisibleStarterKitIssues(issues).filter((issue) => STARTER_KIT_CLIENT_TYPES.includes(issue.type))
  const totalsByType = { hata: 0, uyari: 0, guncelleme: 0, yeni: 0 }
  displayIssues.forEach((issue) => { totalsByType[issue.type] += 1 })
  const issueTypes = STARTER_KIT_TYPE_ORDER.filter((type) => type !== "hata" && totalsByType[type] > 0)
  const visibleIssues = activeTypeFilter ? displayIssues.filter((issue) => issue.type === activeTypeFilter) : displayIssues
  const groups = buildStarterKitFieldGroups(visibleIssues)
  const activeGroup = groups.find((group) => group.fieldId === activeFieldId) || groups[0] || null
  const totalIssues = displayIssues.length
  const canSubmit = totalsByType.hata === 0
  const isFullyValid = totalIssues === 0
  const reviewCount = totalsByType.uyari
  const hasAutoFixes = issues.some((issue) => issue.type === "guncelleme")

  function toggleTypeFilter(type) {
    setActiveTypeFilter((current) => (current === type ? null : type))
  }

  function handleReupload(e) {
    const nextFile = e.target.files?.[0]
    if (nextFile) onReupload(nextFile)
    e.target.value = ""
  }

  const footerText = !canSubmit
    ? `${totalsByType.hata} hata giderilmeden dosya yüklenemez. Hataların Excel dosyasında düzeltilip dosyanın yeniden yüklenmesi gerekmektedir.${reviewCount > 0 ? ` Ayrıca ${reviewCount} uyarının kontrol edilmesi önerilir.` : ""}`
    : `Dosya yüklenmeye hazırdır.${reviewCount > 0 ? ` ${reviewCount} uyarının kontrol edilmesi önerilir.` : ""}${hasAutoFixes ? " Dosya, otomatik düzeltmeler uygulanmış haliyle yüklenecektir." : ""} Yükleme sonrası dosyanın incelemeye iletilmesi için "Onaya Gönder" adımının tamamlanması gerekmektedir.`

  return html`
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.5)] px-4 py-6 backdrop-blur-[2px] lg:pl-[220px]">
      <div role="dialog" aria-modal="true" aria-label="Starter Kit validasyon sonuçları" className="sk-client flex h-[88vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-[20px] border border-[#D7E0EC] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.2)]" onClick=${(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-[#EEF2F7] px-6 py-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[12px] font-medium text-[#98A2B3]">
              ${readOnly ? "Sistem Kurulumu · Starter Kit · Validasyon Sonuçları" : "Dosya Yükle · İmplementasyon · Starter Kit Yükle"}
              ${readOnly ? html`<span className="rounded-[5px] border border-[#E4E7EC] bg-[#F2F4F7] px-1.5 py-0.5 text-[10px] font-medium text-[#667085]">Salt okunur</span>` : null}
            </p>
            ${!isFullyValid ? html`
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
                ${totalsByType.hata > 0 ? html`
                  <button
                    type="button"
                    onClick=${() => toggleTypeFilter("hata")}
                    title=${STARTER_KIT_CLIENT_TYPE_META.hata.hint}
                    className=${classNames(
                      "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12.5px] font-medium transition",
                      activeTypeFilter === "hata" ? STARTER_KIT_CLIENT_TYPE_META.hata.chipClass : "border-[#D0D5DD] text-[#475467] hover:bg-[#F9FAFB]"
                    )}
                  >
                    <span className=${classNames("h-2 w-2 rounded-full", STARTER_KIT_CLIENT_TYPE_META.hata.dot)}></span>
                    Hata (${totalsByType.hata})
                  </button>
                ` : html`
                  <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#ABEFC6] bg-[#ECFDF3] px-2.5 text-[12.5px] font-semibold text-[#067647]">✓ Hata yok</span>
                `}
                ${issueTypes.map((type) => html`
                  <button
                    key=${type}
                    type="button"
                    onClick=${() => toggleTypeFilter(type)}
                    title=${STARTER_KIT_CLIENT_TYPE_META[type].hint}
                    className=${classNames(
                      "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12.5px] font-medium transition",
                      activeTypeFilter === type ? STARTER_KIT_CLIENT_TYPE_META[type].chipClass : "border-[#D0D5DD] text-[#475467] hover:bg-[#F9FAFB]"
                    )}
                  >
                    <span className=${classNames("h-2 w-2 rounded-full", STARTER_KIT_CLIENT_TYPE_META[type].dot)}></span>
                    ${STARTER_KIT_CLIENT_TYPE_META[type].listLabel} (${totalsByType[type]})
                  </button>
                `)}
              </div>
            ` : null}
            ${file?.name ? html`<p className="mt-1 truncate text-[12px] text-[#98A2B3]">${file.name}</p>` : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            ${!isFullyValid ? html`
              <button
                type="button"
                onClick=${() => downloadStarterKitEditedExcel(issues, file)}
                title="Otomatik düzeltmelerin uygulandığı ve hata/uyarı hücrelerinin renklendirildiği dosyadır. Düzeltmelerin bu dosya üzerinden yapılması önerilir."
                className="inline-flex h-9 items-center rounded-[9px] px-3 text-[12.5px] font-medium text-[#475467] transition hover:bg-[#F2F4F7]"
              >
                Düzenlenmiş Excel'i İndir
              </button>
            ` : null}
            ${!readOnly ? html`
              <label className="inline-flex h-9 cursor-pointer items-center rounded-[9px] border border-[#D0D5DD] bg-white px-3 text-[12.5px] font-medium text-[#344054] transition hover:bg-[#F9FAFB]">
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange=${handleReupload} />
                Yeniden Yükle
              </label>
            ` : null}
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

        ${!canSubmit ? html`
          <div className="grid gap-1.5 border-b border-[#EEF2F7] bg-[#F8FAFF] px-6 py-3 text-[12.5px] leading-5 text-[#475467]">
            ${STARTER_KIT_CLIENT_TYPES.filter((type) => type === "hata" || totalsByType[type] > 0).map((type) => html`
              <p key=${type} className="flex items-start gap-2">
                <span className=${classNames("mt-[7px] h-2 w-2 shrink-0 rounded-full", STARTER_KIT_CLIENT_TYPE_META[type].dot)}></span>
                <span><strong className="font-semibold text-[#101828]">${STARTER_KIT_CLIENT_TYPE_META[type].label}:</strong> ${STARTER_KIT_CLIENT_TYPE_META[type].hint}</span>
              </p>
            `)}
          </div>
        ` : html`
          <div className="flex items-start gap-2.5 border-b border-[#EEF2F7] bg-[#F0FDF4] px-6 py-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#12B76A]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <path d="M22 4L12 14.01l-3-3"></path>
              </svg>
            </span>
            <p className="text-[12.5px] leading-5 text-[#166534]">
              ${isFullyValid
                ? html`<strong className="font-semibold">Tüm veriler doğrulandı.</strong> Dosyada hata veya uyarı bulunmamaktadır${readOnly ? "." : "; dosya yüklenmeye hazırdır."}`
                : html`<strong className="font-semibold">${readOnly ? "Dosyada hata bulunmamaktadır." : "Dosyada yüklemeyi engelleyen bir hata bulunmamaktadır."}</strong> ${reviewCount} uyarı aşağıda listelenmiştir; dikkatle kontrol edilmesi önerilir.`}
            </p>
          </div>
        `}

        <div className="flex min-h-0 flex-1">
          ${!isFullyValid ? html`
            <div className="w-[280px] shrink-0 overflow-y-auto border-r border-[#EEF2F7] p-3">
              ${groups.length === 0 ? html`<p className="px-2 py-3 text-[12.5px] text-[#98A2B3]">Bu filtreye uygun kayıt yok.</p>` : null}
              ${groups.map((group) => {
                const meta = STARTER_KIT_CLIENT_TYPE_META[group.severity]
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
                    <span className=${classNames("text-[11.5px]", group.severity === "hata" ? "font-medium text-[#B42318]" : "text-[#98A2B3]")}>
                      ${group.issues.length} ${meta.countLabel}${group.severity === "hata" ? " · düzeltilmesi zorunlu" : ""} · Sütun ${group.column}
                    </span>
                  </button>
                `
              })}
            </div>
          ` : null}

          <div className="flex-1 overflow-y-auto bg-[#FCFCFD] p-6">
            ${isFullyValid ? html`
              <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ECFDF3] text-[#12B76A]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <path d="M22 4L12 14.01l-3-3"></path>
                  </svg>
                </span>
                <h3 className="text-[16px] font-semibold text-[#101828]">Tüm veriler doğrulandı</h3>
                <p className="max-w-[380px] text-[13px] leading-5 text-[#667085]">Starter Kit dosyasında hata veya uyarı tespit edilmedi.</p>
              </div>
            ` : activeGroup ? html`
              <div className="mb-4 flex items-center gap-2">
                <span className=${classNames("h-2.5 w-2.5 rounded-full", STARTER_KIT_CLIENT_TYPE_META[activeGroup.severity].dot)}></span>
                <h3 className="text-[16px] font-semibold text-[#101828]">${activeGroup.label}</h3>
                <span className="text-[13px] text-[#98A2B3]">Sütun ${activeGroup.column} · ${activeGroup.issues.length} kayıt</span>
              </div>
              <div className="space-y-3">
                ${clusterStarterKitIssues(activeGroup.issues).map((cluster) => html`<${StarterKitIssueCluster} key=${cluster.key} cluster=${cluster} />`)}
              </div>
            ` : html`
              <p className="text-[12.5px] text-[#98A2B3]">Bu filtreye uygun kayıt yok.</p>
            `}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[#EEF2F7] px-6 py-4">
          ${readOnly ? html`
            <p className="text-[12.5px] leading-5 text-[#475467]">Sonuçlar, ${file?.validation?.checkedAt ? `${file.validation.checkedAt} tarihinde ` : ""}dosya yüklenirken yapılan kontrole aittir.</p>
            <button type="button" onClick=${onClose} className="inline-flex h-10 shrink-0 items-center justify-center rounded-[12px] border border-[#D0D5DD] bg-white px-4 text-[13px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]">Kapat</button>
          ` : html`
          <p className=${classNames("text-[12.5px] leading-5", canSubmit ? "text-[#475467]" : "font-medium text-[#B42318]")}>${footerText}</p>
          <span title=${canSubmit ? "" : "Hatalar giderilmeden yüklenemez."} className="shrink-0">
            <button
              type="button"
              disabled=${!canSubmit}
              onClick=${() => canSubmit && onSubmit({ issues, checkedAt: formatTimestamp(), demo: true })}
              className=${canSubmit
                ? "inline-flex h-10 items-center justify-center rounded-[12px] bg-[#2F6FED] px-4 text-[13px] font-semibold text-white transition hover:bg-[#2563CC]"
                : "pointer-events-none inline-flex h-10 cursor-not-allowed items-center justify-center rounded-[12px] bg-[#F2F4F7] px-4 text-[13px] font-semibold text-[#98A2B3]"}
            >
              Yüklemeyi Tamamla
            </button>
          </span>
          `}
        </div>
      </div>
    </div>
  `
}

function ImplementationScreen({ companyName, assignee, companyUsers, userRole, hasGE, hasAccountingReport, deadlines, currentStepIndex = 0 }) {
  const [activeStepId, setActiveStepId] = useState(() => getImplementationInitialStepId(currentStepIndex))
  const isClientView = userRole === "editor" || userRole === "viewer"
  const [toastMessage, setToastMessage] = useState("")

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(""), 3500)
    return () => clearTimeout(timer)
  }, [toastMessage])
  // stepUploads: stepId → { status, docs: { [docId]: upload[] }, docStatuses, docReasons }
  const [stepUploads, setStepUploads] = useState(() => createImplementationDemoStepUploads(getImplementationInitialStepId(currentStepIndex)))
  // customDocuments: stepId → [{ id, label, responseType, templateUrl, templateName, description }] — sonradan eklenen yanıt alanları
  const [customDocuments, setCustomDocuments] = useState({})
  // removedDefaultDocIds: stepId → [docId, ...] — şablonda varsayılan olarak gelen ama kaldırılan alanlar
  const [removedDefaultDocIds, setRemovedDefaultDocIds] = useState({})
  const rejectReasonSuggestionUsageRef = useRef({})
  const [dragStepId, setDragStepId] = useState("")
  const [expandedUploadDocIds, setExpandedUploadDocIds] = useState({})
  const [fileHistoryRequestId, setFileHistoryRequestId] = useState(0)
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

            return { id: documentItem.id, required: documentItem.required !== false, status }
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
        plannedDate: getPhaseDeadlineValue(deadlines, step.id, "output"),
        completedDate: upload?.completedDate || step.completedDate
      }
    }),
    [activeStepId, stepUploads, hasGE, hasAccountingReport, deadlines]
  )

  const enabledSteps = steps.filter((step) => step.status !== "disabled")
  const completedCount = enabledSteps.filter((step) => step.status === "completed").length
  const overallProgress = enabledSteps.length > 0
    ? Math.round((completedCount / enabledSteps.length) * 100)
    : 0
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
    return { name, initials: name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(), avatarUrl: specialistAvatarUrl, color: "bg-[#EFF4FF] text-[#2F6FED]" }
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
      avatarUrl: specialistAvatarUrl,
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

  function handleDocUpload(stepId, docId, files, owner = "client", validation = null) {
    const nextFiles = Array.isArray(files) ? files.filter(Boolean) : []
    if (nextFiles.length === 0) return
    if (owner === "client" && stepUploads[stepId]?.docStatuses?.[docId] === "approved") return
    const docsKey = owner === "datassist" ? "datassistDocs" : "docs"
    const uploadEntries = nextFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      uploadedAt: formatTimestamp(),
      downloadUrl: URL.createObjectURL(file),
      validation,
      reviewStatus: null,
      reviewReason: "",
      reviewedAt: ""
    }))
    setStepUploads((current) => {
      if (owner === "client" && current[stepId]?.docStatuses?.[docId] === "approved") return current
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
          [docsKey]: {
            ...(currentStep[docsKey] || {}),
            [docId]: [...getDocUploads(currentStep[docsKey]?.[docId]), ...uploadEntries]
          },
          docStatuses: owner === "client"
            ? Object.fromEntries(Object.entries(currentStep.docStatuses || {}).filter(([key]) => key !== docId))
            : currentStep.docStatuses,
          docReasons: owner === "client"
            ? Object.fromEntries(Object.entries(currentStep.docReasons || {}).filter(([key]) => key !== docId))
            : currentStep.docReasons
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
        integrations: { ...current.integrations, status: "pending_approval", submitted: true, submittedAt: formatTimestamp() }
      }))
      setToastMessage("Canlıya geçiş hazırlıkları incelemeye gönderildi.")
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
          submittedAt: formatTimestamp(),
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
    setToastMessage(docsToSubmit.length === 1
      ? `${docsToSubmit[0].label} incelemeye gönderildi.`
      : `${docsToSubmit.length} belge incelemeye gönderildi.`)
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

  function handleAddCustomDocument(stepId, { label, responseType = "file", file, description, required = false }) {
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
        required: Boolean(required),
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
            reviewAttachments: Array.isArray(exampleFiles) ? exampleFiles : [],
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
      if (approvedDocs.length > 0) {
        setMessages((current) => [...current, createApprovalChatMessage(stepId, approvedDocs, docs)])
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
    if (nextMessages.length > 0) {
      setMessages((current) => [...current, ...nextMessages])
    }
    if (revisionItems.length === 0) {
      appendSystemMessage(`Karar gönderildi: ${approvedItems.map((item) => `✓ ${item.title}`).join(", ")}`, "approve")
    }
  }

  function handleFileSelected(stepId, docId, e, owner = "client") {
    const files = Array.from(e.target.files || [])
    if (owner === "client" && docId === "doc-starter-kit" && files[0]) {
      setPendingStarterKitUpload({ stepId, docId, file: files[0], owner })
      e.target.value = ""
      return
    }
    handleDocUpload(stepId, docId, files, owner)
    e.target.value = ""
  }

  function handleFileDropped(stepId, docId, e, owner = "client") {
    e.preventDefault()
    setDragStepId("")
    const files = Array.from(e.dataTransfer.files || [])
    if (owner === "client" && docId === "doc-starter-kit" && files[0]) {
      setPendingStarterKitUpload({ stepId, docId, file: files[0], owner })
      return
    }
    handleDocUpload(stepId, docId, files, owner)
  }

  function handleRemoveUploadedFile(stepId, docId, fileId, owner = "client") {
    const docsKey = owner === "datassist" ? "datassistDocs" : "docs"
    setStepUploads((current) => {
      const step = current[stepId]
      if (!step || (step.submitted && owner !== "datassist") || ["docs_approved", "completed", "approved"].includes(step.status)) return current
      if (owner === "datassist" && userRole && userRole !== "imp_ekibi") return current
      if (owner === "client" && (userRole === "viewer" || step.docStatuses?.[docId] === "approved")) return current
      const targetFile = getDocUploads(step[docsKey]?.[docId]).find((file) => file.id === fileId)
      if (!targetFile || targetFile.reviewStatus === "rejected" || targetFile.reviewStatus === "approved") return current
      const remaining = getDocUploads(step[docsKey]?.[docId]).filter((file) => file.id !== fileId)
      if (remaining.length === getDocUploads(step[docsKey]?.[docId]).length) return current
      const nextOwnerDocs = { ...(step[docsKey] || {}) }
      if (remaining.length) nextOwnerDocs[docId] = remaining
      else delete nextOwnerDocs[docId]
      const nextClientDocs = owner === "client" ? nextOwnerDocs : step.docs
      const nextDatassistDocs = owner === "datassist" ? nextOwnerDocs : step.datassistDocs
      const latestClientFile = getDocUploads(nextClientDocs?.[docId]).at(-1)
      const nextDocStatuses = { ...(step.docStatuses || {}) }
      const nextDocReasons = { ...(step.docReasons || {}) }
      if (owner === "client") {
        if (latestClientFile?.reviewStatus) nextDocStatuses[docId] = latestClientFile.reviewStatus
        else delete nextDocStatuses[docId]
        if (latestClientFile?.reviewReason) nextDocReasons[docId] = latestClientFile.reviewReason
        else delete nextDocReasons[docId]
      }
      const hasAnyUploads = Object.values(nextClientDocs || {}).some((value) => getDocUploads(value).length > 0)
        || Object.values(nextDatassistDocs || {}).some((value) => getDocUploads(value).length > 0)
      return {
        ...current,
        [stepId]: {
          ...step,
          [docsKey]: nextOwnerDocs,
          status: step.status === "revision_requested" ? step.status : hasAnyUploads ? "uploaded" : "waiting",
          docStatuses: nextDocStatuses,
          docReasons: nextDocReasons
        }
      }
    })
  }

  function toggleUploadList(stepId, docId) {
    const key = getDocUploadStateKey(stepId, docId)
    setExpandedUploadDocIds((current) => ({
      ...current,
      [key]: !current[key]
    }))
  }

  function handleSendMessage(attachments = [], richTextHtml = "") {
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
        richTextHtml: richTextHtml || undefined,
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

      ${pendingStarterKitUpload ? html`
        <${window.StarterKitSheetEditor}
          file=${pendingStarterKitUpload.file}
          onClose=${() => setPendingStarterKitUpload(null)}
          onReupload=${(file) => setPendingStarterKitUpload((current) => current ? { ...current, file } : current)}
          onSubmit=${(validation, finalFile) => {
            handleDocUpload(pendingStarterKitUpload.stepId, pendingStarterKitUpload.docId, [finalFile], pendingStarterKitUpload.owner || "client", validation)
            setPendingStarterKitUpload(null)
            setToastMessage("Starter Kit yüklendi. İncelemeye iletmek için Onaya Gönder adımını tamamlayın.")
          }}
        />
      ` : null}

      <${ImplementationTimeline}
        steps=${steps}
        activeStepId=${activeStepId}
        onStepChange=${setActiveStepId}
        progress=${overallProgress}
        isClient=${isClientView}
      />

      ${activeStep?.id === "integrations"
        ? html`<${LiveHazirliklarContent}
            stepUpload=${stepUploads["integrations"]}
            userRole=${userRole}
            assignee=${assignee}
            plannedDate=${activeStep.plannedDate}
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
            companyName=${companyName}
            nextStepTitle=${(() => { const visible = steps.filter((step) => step.status !== "disabled"); return visible[visible.findIndex((step) => step.id === activeStep.id) + 1]?.title || "" })()}
            plannedDate=${activeStep.plannedDate}
            stepUpload=${stepUploads[activeStep.id]}
            dragDocId=${dragStepId}
            rejectComposer=${rejectComposer}
            expandedUploadDocIds=${expandedUploadDocIds}
            onFileSelected=${(docId, e, owner) => handleFileSelected(activeStep.id, docId, e, owner)}
            onFileDropped=${(docId, e, owner) => handleFileDropped(activeStep.id, docId, e, owner)}
            onDragStateChange=${setDragStepId}
            onSubmitForApproval=${() => handleSubmitForApproval(activeStep.id)}
            onApprove=${() => handleApprove(activeStep.id)}
            onRequestRevision=${() => handleRequestRevision(activeStep.id)}
            onApproveDoc=${(docId) => handleApproveDoc(activeStep.id, docId)}
            onRejectDoc=${(docId, docLabel) => openRejectComposer(activeStep.id, docId, docLabel)}
            onToggleUploadList=${(docId) => toggleUploadList(activeStep.id, docId)}
            onOpenFileHistory=${() => {
              setFileHistoryRequestId((current) => current + 1)
              requestAnimationFrame(() => document.getElementById("impl-message-feed")?.scrollIntoView({ behavior: "smooth", block: "start" }))
            }}
            onResetDoc=${(docId) => handleResetDoc(activeStep.id, docId)}
            onRemoveUploadedFile=${(docId, fileId, owner) => handleRemoveUploadedFile(activeStep.id, docId, fileId, owner)}
            onCompleteStep=${() => handleCompleteStep(activeStep.id)}
            onSendDecisions=${() => handleSendDecisions(activeStep.id)}
            userRole=${userRole}
            assignee=${assignee}
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
        fileHistoryRequestId=${fileHistoryRequestId}
      />

      ${toastMessage ? html`
        <div role="status" className="fixed bottom-6 left-1/2 z-[90] flex max-w-[420px] -translate-x-1/2 items-center gap-2.5 rounded-[12px] border border-[#ABEFC6] bg-[#ECFDF3] px-4 py-3 text-[13px] font-medium text-[#067647] shadow-[0_12px_32px_rgba(16,24,40,0.14)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="M22 4L12 14.01l-3-3"></path></svg>
          ${toastMessage}
        </div>
      ` : null}
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
    { id: "implementation-report", title: "Rapor Geliştirme", desc: "Firmaya özel rapor tasarımları.", isOptional: true, field: "hasGE" },
    { id: "transition-call", title: "Muhasebe Rapor Kurulumu", desc: "Muhasebe fişi entegrasyonu, şablon eşleşmeleri ve masraf merkezleri.", isOptional: true, field: "hasAccountingReport" },
    { id: "integrations", title: "Canlıya Geçiş Hazırlıkları", desc: "Son kontrol testleri, banka ödeme dosyaları ve nihai onay süreçleri.", isOptional: false },
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
          try {
            event.target.showPicker()
          } catch (_) {
            // Programatik odaklanmada tarayıcı seçim penceresini engelleyebilir;
            // alan yine klavye ile düzenlenebilir durumda kalır.
          }
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

function CalendarModalShell({ labelledBy, onCancel, children }) {
  return html`
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,23,42,0.55)] px-4"
      onClick=${onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby=${labelledBy}
        className="w-full max-w-[480px] rounded-[18px] border border-[#E4E7EC] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
        onClick=${(event) => event.stopPropagation()}
      >
        ${children}
      </div>
    </div>
  `
}

function CalendarPreviewTile({ label, value }) {
  return html`
    <div className="rounded-[12px] border border-[#EAECF0] bg-[#FCFCFD] px-3 py-2.5">
      <p className="text-[11px] font-semibold text-[#667085]">${label}</p>
      <p className="mt-0.5 text-[13px] font-semibold text-[#101828]">${value ? formatDateOnly(value) : "—"}</p>
    </div>
  `
}

// Başlangıç tarihi olmayan şirkette Takvim açılınca gösterilir; tarih ve modüller seçilince takvim otomatik üretilir.
function CalendarStartDateModal({ company, onCancel, onConfirm }) {
  const [startDate, setStartDate] = useState("")
  const [hasAccountingReport, setHasAccountingReport] = useState(company.hasAccountingReport !== false)
  const [hasGE, setHasGE] = useState(company.hasGE !== false)
  const [hasIntegration, setHasIntegration] = useState(Boolean(company.hasIntegration))
  const transitionMeta = getTransitionMeta(company.transitionType)
  const preview = generatePhaseDeadlines({
    startDate,
    transitionType: company.transitionType,
    hasAccountingReport,
    deadlines: company.deadlines
  })
  const planTotalDays = getTransitionPlanTotalDays(company.transitionType, hasAccountingReport)
  const planCustomerDays = getTransitionPlanCustomerDays(company.transitionType, hasAccountingReport)

  return html`
    <${CalendarModalShell} labelledBy="calendar-start-title" onCancel=${onCancel}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF4FF] text-[#2F6FED]">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </span>
        <div className="min-w-0">
          <p id="calendar-start-title" className="text-[15px] font-semibold text-[#101828]">Başlangıç tarihini seçin</p>
          <p className="mt-1 text-[13px] leading-5 text-[#667085]">
            ${planTotalDays
              ? `Kick-off (tanışma toplantısı) tarihini ve modülleri seçin. ${transitionMeta.label} takvimi otomatik oluşur: Datassist ${planTotalDays} iş günü + müşteri veri gönderimi ${planCustomerDays} iş günü (her aşama öncesi 2) = toplam ${planTotalDays + planCustomerDays} iş günü.`
              : "Kick-off (tanışma toplantısı) tarihini girin. Özel takvimde aşama tarihleri müşteriyle birlikte manuel belirlenir."}
          </p>
        </div>
      </div>

      <label className="mt-4 block space-y-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">Başlangıç Tarihi</span>
        <${CalendarDateField}
          value=${startDate}
          placeholder="Tarih Seçiniz"
          onChange=${setStartDate}
          className="h-10 w-full rounded-[10px] border border-[#D0D5DD] bg-white px-3 text-[13px] font-semibold text-[#344054] outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#D5E2FF]"
        />
      </label>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between gap-3 rounded-[12px] border border-[#EAECF0] px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#101828]">Muhasebe Rapor Kurulumu</p>
            <p className="text-[11.5px] text-[#667085]">Aktifse takvime 5 iş günü eklenir.</p>
          </div>
          <${BandToggle} value=${hasAccountingReport} onChange=${setHasAccountingReport} />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-[12px] border border-[#EAECF0] px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#101828]">Rapor Geliştirme</p>
            <p className="text-[11.5px] text-[#667085]">İmplementasyon ekibi tamamlar; tarihleri manuel girilir.</p>
          </div>
          <${BandToggle} value=${hasGE} onChange=${setHasGE} />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-[12px] border border-[#EAECF0] px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#101828]">Entegrasyon</p>
            <p className="text-[11.5px] text-[#667085]">Entegrasyon ekibinde yürür ve onlar tamamlar; takvimi etkilemez.</p>
          </div>
          <${BandToggle} value=${hasIntegration} onChange=${setHasIntegration} />
        </div>
      </div>

      ${preview ? html`
        <div className="mt-3 grid grid-cols-2 gap-2">
          <${CalendarPreviewTile} label="Starter Kit teslimi" value=${getPhaseDeadlineValue(preview, "system-setup", "input")} />
          <${CalendarPreviewTile} label="Go-Live" value=${getPhaseDeadlineValue(preview, "operations-handover")} />
        </div>
      ` : null}

      <div className="mt-5 flex items-center justify-end gap-3">
        <button type="button" onClick=${onCancel} className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#D0D5DD] bg-white px-3.5 text-[12.5px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]">Daha sonra</button>
        <button
          type="button"
          disabled=${!startDate}
          onClick=${() => onConfirm({ startDate, hasAccountingReport, hasGE, hasIntegration })}
          className="inline-flex h-9 items-center justify-center rounded-[10px] bg-[#2F6FED] px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-[#2563CC] disabled:cursor-not-allowed disabled:opacity-50"
        >
          ${planTotalDays ? "Takvimi Oluştur" : "Kaydet"}
        </button>
      </div>
    <//>
  `
}

// Muhasebe modülü sonradan açılır/kapanırsa go-live kayması gösterilir. Kapatmada go-live korunabilir.
function AccountingChangeConfirmModal({ change, onCancel, onApply, onKeepGoLive }) {
  const isEnabling = change.nextValue
  const shiftDays = change.currentGoLive && change.nextGoLive
    ? Math.abs(countBusinessDaysUntil(change.nextGoLive, change.currentGoLive))
    : 0

  return html`
    <${CalendarModalShell} labelledBy="accounting-change-title" onCancel=${onCancel}>
      <p id="accounting-change-title" className="text-[15px] font-semibold text-[#101828]">
        ${isEnabling ? "Muhasebe Rapor Kurulumu eklensin mi?" : "Muhasebe Rapor Kurulumu kaldırılsın mı?"}
      </p>
      <p className="mt-1 text-[13px] leading-5 text-[#667085]">
        ${isEnabling
          ? `Kalan aşamalar ${shiftDays} iş günü ileri kayar. Tamamlanan aşamaların tarihleri değişmez.`
          : "Kalan aşamalar öne çekilebilir ya da müşteriye bildirilen go-live tarihi korunabilir."}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <${CalendarPreviewTile} label="Mevcut Go-Live" value=${change.currentGoLive} />
        <${CalendarPreviewTile} label=${isEnabling ? "Yeni Go-Live" : "Öne çekilirse Go-Live"} value=${change.nextGoLive} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
        <button type="button" onClick=${onCancel} className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#D0D5DD] bg-white px-3.5 text-[12.5px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]">Vazgeç</button>
        ${isEnabling ? null : html`
          <button type="button" onClick=${onKeepGoLive} className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#D0D5DD] bg-white px-3.5 text-[12.5px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]">Go-live'ı koru</button>
        `}
        <button type="button" autoFocus onClick=${onApply} className="inline-flex h-9 items-center justify-center rounded-[10px] bg-[#2F6FED] px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-[#2563CC] disabled:cursor-not-allowed disabled:opacity-50">
          ${isEnabling ? "Ekle ve kaydır" : "Tarihleri öne çek"}
        </button>
      </div>
    <//>
  `
}

// Rapor Geliştirme ve Entegrasyon entegrasyon ekibinde yürür: tarih girilmez, tamamlanınca işaretlenir.
// Kick-off ile tamamlanma arasındaki iş günü bilgi olarak gösterilir; takvimi ve SLA'yı etkilemez.
// Entegrasyon Süreçleri'nin tamamlanma kartı. Tamamlamayı yalnız entegrasyon ekibi yapar (canComplete).
function IntegrationCompletionCard({ company, accentColor, canComplete, onUpdateCompany }) {
  const todayIso = toIsoDate(new Date())
  const completion = company.integrationCompletion || null
  const [isMarking, setIsMarking] = useState(false)
  const [completedAt, setCompletedAt] = useState(todayIso)
  const [note, setNote] = useState("")
  const goLive = getPhaseDeadlineValue(company.deadlines, "operations-handover")
  const isPastGoLive = !completion && goLive && todayIso > goLive
  const elapsedDays = completion && company.startDate
    ? countBusinessDaysUntil(completion.completedAt, company.startDate)
    : null

  // Tamamlama ve geri alma, Entegrasyon Süreçleri'nin mesaj akışına otomatik mesaj olarak düşer.
  const autoMessage = (text, subtype = "approve") => [...(company.integrationMessages || []), createIntegrationSystemMessage(text, subtype)]

  function saveCompletion() {
    const trimmed = note.trim()
    onUpdateCompany({
      ...company,
      integrationCompletion: { completedAt, note: trimmed, completedBy: "Entegrasyon Ekibi" },
      integrationMessages: autoMessage(`Entegrasyon tamamlandı olarak işaretlendi · ${formatDateOnly(completedAt)}${trimmed ? ` · Not: ${trimmed}` : ""}`)
    })
    setIsMarking(false)
    setNote("")
  }

  return html`
    <div className="calendar-optional-card" style=${{ borderLeftColor: accentColor, flexWrap: "wrap" }}>
      <div className="calendar-optional-card__icon" style=${{ background: accentColor }}></div>
      <div className="calendar-optional-card__body">
        <div className="calendar-optional-card__title">Entegrasyon Süreçleri</div>
        <div className="calendar-optional-card__desc">
          ${completion
            ? html`
                <span className="font-semibold text-[#067647]">Tamamlandı · ${formatDateOnly(completion.completedAt)}</span>
                ${elapsedDays !== null ? ` · Kick-off'tan ${elapsedDays} iş günü sonra tamamlandı` : ""}
                ${completion.note ? html`<span className="block text-[#667085]">Not: ${completion.note}</span>` : null}
              `
            : `Entegrasyon ekibinde · Devam ediyor. Takvimi ve SLA süresini etkilemez.${canComplete ? "" : " Tamamlama entegrasyon ekibindedir."}`}
        </div>
        ${isPastGoLive ? html`
          <div className="mt-1.5 text-[12px] font-semibold text-[#B54708]">Go-live tarihi geçti, entegrasyon henüz tamamlanmadı.</div>
        ` : null}
      </div>

      ${canComplete && !isMarking ? html`
        <div className="calendar-optional-card__lane">
          ${completion
            ? html`<button type="button" onClick=${() => onUpdateCompany({ ...company, integrationCompletion: null, integrationMessages: autoMessage("Entegrasyon tamamlanması geri alındı", "revision") })} className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#D0D5DD] bg-white px-3.5 text-[12.5px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]">Geri al</button>`
            : html`<button type="button" onClick=${() => setIsMarking(true)} className="inline-flex h-9 items-center justify-center rounded-[10px] bg-[#2F6FED] px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-[#2563CC] disabled:cursor-not-allowed disabled:opacity-50">Tamamlandı olarak işaretle</button>`}
        </div>
      ` : null}

      ${isMarking ? html`
        <div className="flex w-full flex-wrap items-end gap-3 border-t border-[#EAECF0] pt-3">
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">Tamamlanma Tarihi</span>
            <${CalendarDateField}
              value=${completedAt}
              onChange=${setCompletedAt}
              className="h-9 w-[160px] rounded-[10px] border border-[#D0D5DD] bg-white px-2.5 text-[12.5px] font-semibold text-[#344054] outline-none focus:border-[#2F6FED] focus:ring-2 focus:ring-[#D5E2FF]"
            />
          </label>
          <label className="block min-w-[200px] flex-1 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#667085]">Not (isteğe bağlı)</span>
            <input
              type="text"
              value=${note}
              onInput=${(event) => setNote(event.target.value)}
              placeholder="Örn. API entegrasyonu canlıya alındı"
              className="h-9 w-full rounded-[10px] border border-[#D0D5DD] bg-white px-2.5 text-[12.5px] text-[#344054] outline-none focus:border-[#2F6FED] focus:ring-2 focus:ring-[#D5E2FF]"
            />
          </label>
          <div className="flex gap-2">
            <button type="button" onClick=${() => setIsMarking(false)} className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#D0D5DD] bg-white px-3.5 text-[12.5px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]">Vazgeç</button>
            <button type="button" disabled=${!completedAt} onClick=${saveCompletion} className="inline-flex h-9 items-center justify-center rounded-[10px] bg-[#2F6FED] px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-[#2563CC] disabled:cursor-not-allowed disabled:opacity-50">Kaydet</button>
          </div>
        </div>
      ` : null}
    </div>
  `
}

// Entegrasyon akışındaki otomatik mesaj: İmplementasyon Süreçleri'ndeki otomatik ekip mesajları gibi sohbete düşer.
function createIntegrationSystemMessage(text) {
  return { id: `integration-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type: "integration", stepId: "integration", author: "Entegrasyon Ekibi", avatar: "EE", text, time: formatChatTime() }
}

// İmplementasyon Süreçleri sayfası: firmanın tek çalışma alanı. Entegrasyon modülü açıksa iş kolları sekme olur
// (İmplementasyon · Entegrasyon). Sekmeler gizlenerek tutulur; geçişte yüklemeler ve mesaj taslakları kaybolmaz.
// Entegrasyon ekibi sayfayı kendi sekmesinde açar.
function ProcessWorkspace({ company, userRole, onUpdateCompany }) {
  const hasIntegration = Boolean(company?.hasIntegration)
  const [tab, setTab] = useState(() => (userRole === "entegrasyon_ekibi" ? "integration" : "implementation"))
  useEffect(() => { if (userRole === "entegrasyon_ekibi" && hasIntegration) setTab("integration") }, [userRole])
  const activeTab = hasIntegration ? tab : "implementation"
  const isClient = userRole === "editor" || userRole === "viewer"

  const implementation = html`
    <${ImplementationScreen}
      companyName=${company?.name || ""}
      assignee=${company?.assignee || "Implementasyon Ekibi"}
      companyUsers=${company?.users || []}
      userRole=${userRole}
      hasGE=${company?.hasGE}
      hasAccountingReport=${company?.hasAccountingReport}
      deadlines=${company?.deadlines}
      currentStepIndex=${company?.currentStepIndex || 0}
    />
  `
  if (!hasIntegration) return implementation

  const currentStep = implementationBaseSteps[company.currentStepIndex || 0]
  const integrationTasks = company.integrationCustomTasks || []
  const integrationDone = Boolean(company.integrationCompletion)
  const waitingOnClient = integrationDone ? 0 : integrationTasks.filter((task) => task.required && (task.responseType === "text" ? !task.textResponse?.trim() : !task.clientFiles?.length)).length
  const tabs = [
    { id: "implementation", label: "İmplementasyon", team: "İmplementasyon Ekibi", status: currentStep ? currentStep.title : "", dot: "bg-[#2F6FED]" },
    {
      id: "integration",
      label: "Entegrasyon",
      team: "Entegrasyon Ekibi",
      status: integrationDone ? "Tamamlandı" : integrationTasks.length ? `${integrationTasks.length} görev` : "Devam ediyor",
      dot: integrationDone ? "bg-[#12B76A]" : "bg-[#0E9384]",
      badge: waitingOnClient ? { count: waitingOnClient, title: isClient ? "Sizden beklenen" : "Müşteriden bekleniyor" } : null
    }
  ]

  return html`
    <div className="space-y-6">
      <div role="tablist" aria-label="İş kolları" className="flex gap-1 border-b border-[#E4E7EC]">
        ${tabs.map((item) => {
          const isActive = activeTab === item.id
          return html`
            <button key=${item.id} type="button" role="tab" aria-selected=${isActive} onClick=${() => setTab(item.id)}
              className=${classNames("relative -mb-px flex items-center gap-2.5 border-b-2 px-4 pb-3 pt-1 text-left transition", isActive ? "border-[#2F6FED]" : "border-transparent hover:border-[#D0D5DD]")}>
              <span className=${classNames("h-2 w-2 shrink-0 rounded-full", item.dot, !isActive && "opacity-60")}></span>
              <span className="min-w-0">
                <span className=${classNames("block text-[14px] font-semibold", isActive ? "text-[#101828]" : "text-[#667085]")}>${item.label}</span>
                <span className="block text-[11.5px] text-[#98A2B3]">${item.team}${item.status ? ` · ${item.status}` : ""}</span>
              </span>
              ${item.badge ? html`<span title=${item.badge.title} className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FFFAEB] px-1.5 text-[11px] font-semibold text-[#B54708] ring-1 ring-[#FEDF89]">${item.badge.count}</span>` : null}
            </button>
          `
        })}
      </div>
      <div role="tabpanel" hidden=${activeTab !== "implementation"}>${implementation}</div>
      <div role="tabpanel" hidden=${activeTab !== "integration"}>
        <${IntegrationScreen} company=${company} userRole=${userRole} onUpdateCompany=${onUpdateCompany} />
      </div>
    </div>
  `
}

// Entegrasyon Süreçleri: İmplementasyon Süreçleri'nin altında, entegrasyon modülü açık şirketlerde görünür.
// Belge tablosu implementasyon aşamalarıyla aynı düzendedir: entegrasyon ekibi "Görev Ekle" ile alan açar
// (şablon, açıklama, dosya/metin yanıtı), Datassist sütununa dosya ekler, müşteri kendi sütununa yükler.
// Süreci entegrasyon ekibi tamamlar. Mesajlaşma İmplementasyon Süreçleri'ndeki akışla aynıdır.
function IntegrationScreen({ company, userRole, onUpdateCompany }) {
  const isIntegrationTeam = userRole === "entegrasyon_ekibi"
  const isClient = userRole === "editor" || userRole === "viewer"
  const canClientUpload = userRole === "editor"
  const [chatDraft, setChatDraft] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  if (!company?.hasIntegration) {
    return html`
      <div className="rounded-[16px] border border-[#EAECF0] bg-white p-8 text-center shadow-sm">
        <p className="text-[14px] font-semibold text-[#101828]">Bu şirkette entegrasyon modülü kapalı</p>
        <p className="mt-1 text-[13px] text-[#667085]">Şirket Yönetimi › Takvim'den Entegrasyon açıldığında bu alan kullanılabilir.</p>
      </div>
    `
  }
  const tasks = company.integrationCustomTasks || []
  const completion = company.integrationCompletion || null
  const messages = company.integrationMessages || []
  const canManage = isIntegrationTeam && !completion
  const companyUsers = company.users || []
  const clientName = companyUsers[0] ? `${companyUsers[0].firstName} ${companyUsers[0].lastName}` : "Müşteri"

  const withMessages = (next, items) => ({ ...next, integrationMessages: [...messages, ...items] })
  const saveTasks = (nextTasks, text) => onUpdateCompany(withMessages({ ...company, integrationCustomTasks: nextTasks }, text ? [createIntegrationSystemMessage(text)] : []))
  const patchTask = (taskId, patch, text) => saveTasks(tasks.map((task) => (task.id === taskId ? { ...task, ...patch } : task)), text)

  function addTasks(items) {
    const created = items.map((item, index) => ({
      id: `task-${Date.now()}-${index}`,
      label: item.label,
      description: item.description,
      responseType: item.responseType,
      required: item.required,
      templateName: item.file?.name || "",
      templateUrl: item.file ? URL.createObjectURL(item.file) : "",
      datassistFiles: [],
      clientFiles: [],
      textResponse: ""
    }))
    saveTasks([...tasks, ...created], created.length === 1 ? `Yeni görev eklendi: "${created[0].label}"` : `${created.length} yeni görev eklendi`)
    setIsAddOpen(false)
  }

  function uploadFiles(task, owner, fileList) {
    const files = [...(fileList || [])].map((file) => ({ id: `if-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: file.name, url: URL.createObjectURL(file), uploadedAt: formatTimestamp() }))
    if (!files.length) return
    const key = owner === "datassist" ? "datassistFiles" : "clientFiles"
    patchTask(task.id, { [key]: [...task[key], ...files] }, `${owner === "datassist" ? "Datassist" : clientName} "${task.label}" için ${files.length === 1 ? `"${files[0].name}" dosyasını yükledi` : `${files.length} dosya yükledi`}`)
  }

  function removeFile(task, owner, fileId) {
    const key = owner === "datassist" ? "datassistFiles" : "clientFiles"
    patchTask(task.id, { [key]: task[key].filter((file) => file.id !== fileId) })
  }

  function removeTask(task) {
    if (!window.confirm("Bu görevi silmek istediğinize emin misiniz?")) return
    saveTasks(tasks.filter((item) => item.id !== task.id), `Görev kaldırıldı: "${task.label}"`)
  }

  function completeIntegration() {
    const completedAt = toIsoDate(new Date())
    onUpdateCompany(withMessages({ ...company, integrationCompletion: { completedAt, completedBy: "Entegrasyon Ekibi" } }, [createIntegrationSystemMessage(`Entegrasyon tamamlandı · ${formatDateOnly(completedAt)}`)]))
  }

  function undoCompletion() {
    onUpdateCompany(withMessages({ ...company, integrationCompletion: null }, [createIntegrationSystemMessage("Entegrasyon tamamlanması geri alındı")]))
  }

  function handleSendMessage(attachments = [], richTextHtml = "") {
    if (!chatDraft.trim() && attachments.length === 0) return
    let author, avatar, type
    if (isIntegrationTeam) {
      author = "Entegrasyon Ekibi"; avatar = "EE"; type = "integration"
    } else if (userRole === "imp_ekibi" || !userRole) {
      author = company.assignee || "Implementasyon Ekibi"; avatar = author.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(); type = "implementation"
    } else {
      const u = userRole === "editor" ? companyUsers[0] : companyUsers[1]
      author = u ? `${u.firstName} ${u.lastName}` : userRole === "editor" ? "Düzenleyici" : "Görüntüleyici"
      avatar = u ? `${u.firstName[0]}${u.lastName[0]}` : userRole === "editor" ? "DZ" : "GR"
      type = "client"
    }
    onUpdateCompany(withMessages(company, [{
      id: `integration-msg-${Date.now()}`,
      type,
      stepId: "integration",
      author,
      avatar,
      ...(type === "implementation" ? { avatarUrl: specialistAvatarUrl } : {}),
      text: chatDraft.trim(),
      richTextHtml: richTextHtml || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      time: formatChatTime()
    }]))
    setChatDraft("")
  }

  const gridCols = "xl:grid-cols-[minmax(190px,250px)_180px_minmax(220px,1fr)_minmax(220px,1fr)]"
  const requiredOpen = tasks.filter((task) => task.required && (task.responseType === "text" ? !task.textResponse?.trim() : task.clientFiles.length === 0)).length

  function rowStatus(task) {
    const answered = task.responseType === "text" ? Boolean(task.textResponse?.trim()) : task.clientFiles.length > 0
    if (completion) return { text: "Tamamlandı", tone: "green" }
    if (answered) return { text: task.responseType === "text" ? "Müşteri yanıtladı" : "Müşteri yükledi", tone: "blue" }
    if (!task.required) return { text: "İsteğe bağlı", tone: "gray" }
    return isClient
      ? { text: task.responseType === "text" ? "Yanıtınız bekleniyor" : "Dosyanızı yüklemeniz bekleniyor", tone: "amber" }
      : { text: task.responseType === "text" ? "Müşteri yanıtı bekleniyor" : "Müşteri yüklemesi bekleniyor", tone: "amber" }
  }

  function fileCell(task, owner) {
    const files = owner === "datassist" ? task.datassistFiles : task.clientFiles
    const canUpload = !completion && (owner === "datassist" ? isIntegrationTeam : canClientUpload)
    const inputId = `int-${owner}-${task.id}`
    const tone = owner === "datassist"
      ? { dot: "bg-[#2F6FED]", btn: "border-[#B2CCFF] text-[#175CD3] hover:bg-[#EFF4FF]", chip: "border-[#D5E2FF] bg-[#F5F8FF]" }
      : { dot: "bg-[#7F56D9]", btn: "border-[#D6BBFB] text-[#6941C6] hover:bg-[#F9F5FF]", chip: "border-[#E9D7FE] bg-[#FCFAFF]" }
    return html`
      <div className="min-w-0 space-y-1.5">
        ${files.map((file) => html`
          <div key=${file.id} className=${classNames("flex min-w-0 items-center gap-2 rounded-[9px] border px-2.5 py-1.5", tone.chip)}>
            <span className=${classNames("h-1.5 w-1.5 shrink-0 rounded-full", tone.dot)}></span>
            <a href=${file.url} download=${file.name} className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-[#344054] hover:underline" title=${file.name}>${file.name}</a>
            <span className="shrink-0 text-[10px] text-[#98A2B3]">${file.uploadedAt}</span>
            ${canUpload ? html`<button type="button" aria-label="Dosyayı sil" title="Dosyayı sil" onClick=${() => removeFile(task, owner, file.id)} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-[#D92D20] hover:bg-[#FEF3F2]"><${TrashIcon} /></button>` : null}
          </div>
        `)}
        ${!files.length && !canUpload ? html`<p className="text-[11.5px] font-medium text-[#98A2B3]">Henüz dosya yüklenmedi</p>` : null}
        ${canUpload ? html`
          <button type="button" onClick=${() => document.getElementById(inputId)?.click()} className=${classNames("inline-flex h-7 items-center gap-1 rounded-[7px] border bg-white px-2 text-[10.5px] font-semibold transition", tone.btn)}><${UploadIcon} />Yükle</button>
          <input id=${inputId} type="file" multiple className="hidden" tabIndex="-1" onChange=${(event) => { uploadFiles(task, owner, event.target.files); event.target.value = "" }} />
        ` : null}
      </div>
    `
  }

  return html`
    <div className="space-y-6">
      <${AddCustomDocumentModal} isOpen=${isAddOpen} stepTitle="Entegrasyon Süreçleri" onClose=${() => setIsAddOpen(false)} onSubmit=${addTasks} />

      ${tasks.length ? html`<div className=${classNames("rounded-[16px] border bg-white", completion ? "border-[#ABEFC6]" : "border-[#E4E7EC]")}>
        <div className="flex items-center justify-between gap-3 border-b border-[#F2F4F7] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className=${classNames("h-2 w-2 shrink-0 rounded-full", completion ? "bg-[#12B76A]" : "bg-[#0E9384]")}></span>
            <span className="text-[13px] font-semibold text-[#344054]">Entegrasyon Süreçleri</span>
            <span className=${classNames("inline-flex h-[22px] items-center rounded-full border px-2.5 text-[11px] font-medium", completion ? "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]" : "border-[#99F6E4] bg-[#F0FDFA] text-[#0E7C73]")}>
              ${completion ? `Tamamlandı · ${formatDateOnly(completion.completedAt)}` : "Entegrasyon ekibinde"}
            </span>
          </div>
        </div>

        <div className=${classNames("hidden items-center gap-0 border-b border-[#E4E7EC] bg-[#F8FAFC] px-5 xl:grid", gridCols)}>
          <div className="py-2.5 pr-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#667085]">Dosya / Belge</div>
          <div className="border-l border-[#E4E7EC] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#667085]">Şablon</div>
          <div className="flex items-center gap-2 border-l border-[#E4E7EC] px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-[#2F6FED]"></span>
            <span className="text-[11px] font-semibold text-[#344054]">Datassist</span>
          </div>
          <div className="flex items-center gap-2 border-l border-[#E4E7EC] px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-[#7F56D9]"></span>
            <span className="text-[11px] font-semibold text-[#344054]">Müşteri</span>
          </div>
        </div>

        <div className="divide-y divide-[#F2F4F7]">
          ${tasks.map((task) => html`
            <div key=${task.id} className="px-5 py-3">
              <div className=${classNames("grid grid-cols-1 gap-3 xl:items-center xl:gap-0", gridCols)}>
                <div className="min-w-0 xl:pr-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-[#344054]">${task.label}</span>
                    <${InfoTooltip} text=${task.description} />
                  </div>
                  <${DocStatusLine} status=${rowStatus(task)} />
                </div>
                <div className="flex min-w-0 items-center gap-1 xl:border-l xl:border-[#EEF2F6] xl:px-4">
                  ${task.templateUrl ? html`
                    <a href=${task.templateUrl} download=${task.templateName} className="inline-flex h-8 min-w-[130px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] border border-[#B2CCFF] bg-[#EFF4FF] px-2.5 text-[11px] font-semibold text-[#175CD3] transition hover:border-[#84ADFF] hover:bg-[#DCE8FF]"><${DownloadIcon} />Şablon İndir</a>
                  ` : html`<span className="text-[11px] text-[#98A2B3]">—</span>`}
                  ${canManage ? html`<button type="button" title="Görevi sil" aria-label="Görevi sil" onClick=${() => removeTask(task)} className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] text-[#667085] hover:bg-[#FEF3F2] hover:text-[#D92D20]"><${TrashIcon} /></button>` : null}
                </div>
                <div className="min-w-0 xl:border-l xl:border-[#EEF2F6] xl:px-4">${fileCell(task, "datassist")}</div>
                <div className="min-w-0 xl:border-l xl:border-[#EEF2F6] xl:px-4">
                  ${task.responseType === "text"
                    ? (canClientUpload && !completion
                        ? html`<textarea rows="2" value=${task.textResponse} onInput=${(event) => patchTask(task.id, { textResponse: event.target.value })} placeholder="Yanıtınızı buraya yazın…" className="w-full resize-none rounded-[9px] border border-[#D5DBE5] bg-white px-3 py-2 text-[12.5px] leading-5 text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#2F6FED] focus:ring-4 focus:ring-[#DCE8FF]" />`
                        : html`<p className=${classNames("text-[12px]", task.textResponse ? "text-[#344054]" : "text-[#98A2B3]")}>${task.textResponse || "Henüz yanıtlanmadı"}</p>`)
                    : fileCell(task, "client")}
                </div>
              </div>
            </div>
          `)}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F2F4F7] px-5 py-3.5">
          <p className="text-[12px] text-[#667085]">
            ${completion
              ? `Entegrasyon ${formatDateOnly(completion.completedAt)} tarihinde tamamlandı.`
              : requiredOpen ? `${requiredOpen} zorunlu görev müşteri yanıtı bekliyor.` : "Entegrasyon ekibi süreci tamamladığında işaretler; implementasyon takvimini etkilemez."}
          </p>
          ${isIntegrationTeam ? (completion
            ? html`<button type="button" onClick=${undoCompletion} className="inline-flex h-9 items-center rounded-[10px] border border-[#D0D5DD] bg-white px-3.5 text-[12.5px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]">Geri Al</button>`
            : html`<button type="button" onClick=${completeIntegration} className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-[#067647] px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-[#05603A]"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>Entegrasyonu Tamamla</button>`) : null}
        </div>
      </div>` : null}

      <${ImplementationMessageFeed}
        messages=${messages}
        draft=${chatDraft}
        onDraftChange=${setChatDraft}
        onSend=${handleSendMessage}
        companyName=${company.name}
        assignee=${company.assignee}
        steps=${[{ id: "integration", title: "Entegrasyon Süreçleri" }]}
        stepUploads=${{ integration: { status: completion ? "approved" : "waiting" } }}
        activeStepId="integration"
        onStepChange=${() => {}}
        onMeetingCreated=${(msg) => onUpdateCompany(withMessages(company, [{ ...msg, stepId: "integration" }]))}
        companyUsers=${companyUsers}
        userRole=${userRole}
        fileHistoryRequestId=${0}
        headerActions=${canManage ? html`
          <button type="button" onClick=${() => setIsAddOpen(true)} className="flex items-center gap-1.5 rounded-[7px] border border-[#E4E7EC] bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-[#344054] transition-colors hover:border-[#C8D0DC] hover:bg-[#F9FAFB]"><${PlusIcon} />Görev Ekle</button>
          ${!tasks.length ? html`<button type="button" onClick=${completeIntegration} className="flex items-center gap-1.5 rounded-[7px] border border-[#ABEFC6] bg-[#ECFDF3] px-2.5 py-1.5 text-[11.5px] font-semibold text-[#067647] transition-colors hover:bg-[#D1FADF]">Entegrasyonu Tamamla</button>` : null}
        ` : isIntegrationTeam && completion && !tasks.length ? html`
          <button type="button" onClick=${undoCompletion} className="flex items-center gap-1.5 rounded-[7px] border border-[#E4E7EC] bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-[#344054] transition-colors hover:bg-[#F9FAFB]">Tamamlamayı Geri Al</button>
        ` : null}
      />
    </div>
  `
}

function CompanyCalendarView({ selectedCompany, onUpdateCompany, userRole }) {
  const [isBandEditing, setIsBandEditing] = useState(false)
  const [bandDraft, setBandDraft] = useState({ startDate: "", hasGE: true, hasIntegration: false, hasAccountingReport: true })
  const deadlinesBeforeEditRef = useRef(null)
  const [startModalDismissedFor, setStartModalDismissedFor] = useState(null)
  const [pendingAccountingChange, setPendingAccountingChange] = useState(null)
  const transitionMeta = getTransitionMeta(selectedCompany?.transitionType)
  const planTotalDays = getTransitionPlanTotalDays(
    selectedCompany?.transitionType,
    isBandEditing ? bandDraft.hasAccountingReport : selectedCompany?.hasAccountingReport
  )
  const planCustomerDays = getTransitionPlanCustomerDays(
    selectedCompany?.transitionType,
    isBandEditing ? bandDraft.hasAccountingReport : selectedCompany?.hasAccountingReport
  )

  function startBandEdit() {
    deadlinesBeforeEditRef.current = selectedCompany.deadlines
    setBandDraft({
      startDate: selectedCompany.startDate || "",
      hasGE: selectedCompany.hasGE,
      hasIntegration: Boolean(selectedCompany.hasIntegration),
      hasAccountingReport: selectedCompany.hasAccountingReport
    })
    setIsBandEditing(true)
  }

  function buildDeadlines(draft) {
    return generatePhaseDeadlines({
      startDate: draft.startDate,
      transitionType: selectedCompany.transitionType,
      hasAccountingReport: draft.hasAccountingReport,
      deadlines: selectedCompany.deadlines,
      currentStepIndex: selectedCompany.currentStepIndex
    })
  }

  // Başlangıç tarihi değişince takvim plana göre yeniden üretilir; tamamlanan aşamalar korunur.
  function updateBandDraft(patch) {
    const nextDraft = { ...bandDraft, ...patch }
    setBandDraft(nextDraft)
    const generated = buildDeadlines(nextDraft)
    if (generated) onUpdateCompany({ ...selectedCompany, deadlines: generated })
  }

  // Muhasebe modülü açılıp kapanınca go-live kayar; kaymayı uygulamadan önce onay istenir.
  function requestAccountingChange(nextValue) {
    if (nextValue === bandDraft.hasAccountingReport) return
    const nextDraft = { ...bandDraft, hasAccountingReport: nextValue }
    const generated = buildDeadlines(nextDraft)
    if (!generated) {
      setBandDraft(nextDraft)
      return
    }
    setPendingAccountingChange({
      nextValue,
      generated,
      currentGoLive: getPhaseDeadlineValue(selectedCompany.deadlines, "operations-handover"),
      nextGoLive: getPhaseDeadlineValue(generated, "operations-handover")
    })
  }

  function applyAccountingChange(keepGoLive) {
    const change = pendingAccountingChange
    if (!change) return
    setBandDraft((current) => ({ ...current, hasAccountingReport: change.nextValue }))
    onUpdateCompany({
      ...selectedCompany,
      deadlines: keepGoLive
        ? clearPhaseDeadlineValues(selectedCompany.deadlines, "transition-call")
        : change.generated
    })
    setPendingAccountingChange(null)
  }

  function saveBandEdit() {
    onUpdateCompany({
      ...selectedCompany,
      startDate: bandDraft.startDate,
      hasGE: bandDraft.hasGE,
      hasIntegration: bandDraft.hasIntegration,
      hasAccountingReport: bandDraft.hasAccountingReport
    })
    setIsBandEditing(false)
  }

  function cancelBandEdit() {
    if (deadlinesBeforeEditRef.current) {
      onUpdateCompany({ ...selectedCompany, deadlines: deadlinesBeforeEditRef.current })
    }
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
    hasIntegration: isBandEditing ? bandDraft.hasIntegration : Boolean(selectedCompany.hasIntegration),
    hasAccountingReport: isBandEditing ? bandDraft.hasAccountingReport : selectedCompany.hasAccountingReport
  }
  const isImplementationOwner = userRole === "imp_ekibi" || !userRole
  const isStartDateModalOpen = isImplementationOwner
    && !selectedCompany.startDate
    && !isBandEditing
    && startModalDismissedFor !== selectedCompany.id

  function confirmStartDate({ startDate, hasAccountingReport, hasGE, hasIntegration }) {
    const generated = generatePhaseDeadlines({
      startDate,
      transitionType: selectedCompany.transitionType,
      hasAccountingReport,
      deadlines: selectedCompany.deadlines
    })
    onUpdateCompany({
      ...selectedCompany,
      startDate,
      hasAccountingReport,
      hasGE,
      hasIntegration,
      deadlines: generated || selectedCompany.deadlines
    })
  }

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
      title: "Canlıya Geçiş Hazırlıkları",
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
      title: "Rapor Geliştirme",
      description: "Firmaya özel rapor tasarımları. İmplementasyon ekibi tamamlar.",
      inputLabel: "Rapor Talepleri Gönderim Tarihi",
      outputLabel: "Rapor Tamamlanma Tarihi",
      field: "hasGE",
      accentColor: "#8b5cf6"
    },
    {
      // Giriş/teslim tarihi yoktur; yalnız entegrasyon ekibinin tamamladığı tarih tutulur (integrationCompletion).
      id: "integration-process",
      title: "Entegrasyon Süreçleri",
      description: "API / dosya entegrasyonu. Entegrasyon ekibi yürütür ve tamamlar.",
      field: "hasIntegration",
      accentColor: "#0e9384"
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
      ${pendingAccountingChange ? html`
        <${AccountingChangeConfirmModal}
          change=${pendingAccountingChange}
          onCancel=${() => setPendingAccountingChange(null)}
          onApply=${() => applyAccountingChange(false)}
          onKeepGoLive=${() => applyAccountingChange(true)}
        />
      ` : null}
      ${isStartDateModalOpen ? html`
        <${CalendarStartDateModal}
          company=${selectedCompany}
          onCancel=${() => setStartModalDismissedFor(selectedCompany.id)}
          onConfirm=${confirmStartDate}
        />
      ` : null}
      <div className="calendar-phase-list__core">
      <div className="calendar-phase-list__intro">
        <h3 className="calendar-phase-list__title">İmplementasyon Süreç Takvimi</h3>
        <p className="calendar-phase-list__subtitle">Aşamalara ait hedef tamamlanma tarihlerini (deadline) buradan planlayabilirsiniz.</p>
      </div>

      <div style=${{background:"var(--color-surface-2)",border:"1px solid var(--color-border)",borderRadius:"var(--radius-md)",padding:"12px 20px",display:"flex",alignItems:"center",gap:"32px",marginBottom:"16px"}}>
        <div style=${{display:"flex",flexDirection:"column",gap:"3px"}}>
          <span style=${{fontSize:"10px",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:"var(--color-text-3)"}}>BAŞLANGIÇ TARİHİ</span>
          ${isBandEditing
            ? html`<${CalendarDateField}
                value=${bandDraft.startDate}
                placeholder="Tarih Seçiniz"
                onChange=${(nextValue) => updateBandDraft({ startDate: nextValue })}
                className="h-8 min-w-[145px] rounded-[8px] border border-[#D0D5DD] bg-white px-2.5 text-[12px] font-semibold text-[#344054] outline-none transition focus:border-[#2F6FED] focus:ring-2 focus:ring-[#D5E2FF]"
              />`
            : html`<span style=${{fontSize:"14px",fontWeight:600,color:"var(--color-text-1)"}}>${selectedCompany.startDate ? formatDateOnly(selectedCompany.startDate) : "Girilmedi"}</span>`
          }
        </div>
        <div style=${{width:"1px",alignSelf:"stretch",background:"var(--color-border)"}}></div>
        <div style=${{display:"flex",flexDirection:"column",gap:"3px"}}>
          <span style=${{fontSize:"10px",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:"var(--color-text-3)"}}>GEÇİŞ PLANI</span>
          <span style=${{fontSize:"14px",fontWeight:600,color:"var(--color-text-1)"}}>${transitionMeta.label}${planTotalDays ? ` · ${planTotalDays + planCustomerDays} iş günü` : ""}</span>
          <span style=${{fontSize:"11px",color:"var(--color-text-3)"}} title=${planTotalDays ? "Datassist süresi, müşterinin doğru verileri gönderdiği günden itibaren sayılır." : ""}>
            ${planTotalDays ? `Datassist ${planTotalDays} iş günü + müşteri ${planCustomerDays} iş günü (her aşama öncesi +2) · tatiller sayılmaz` : "Tarihler manuel belirlenir"}
          </span>
        </div>
        <div style=${{width:"1px",alignSelf:"stretch",background:"var(--color-border)"}}></div>
        <div style=${{display:"flex",flexDirection:"column",gap:"3px"}}>
          <span style=${{fontSize:"10px",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:"var(--color-text-3)"}}>RAPOR GELİŞTİRME</span>
          ${isBandEditing
            ? html`<${BandToggle} value=${bandDraft.hasGE} onChange=${(v) => setBandDraft({...bandDraft, hasGE: v})} />`
            : html`<${BandPill} active=${selectedCompany.hasGE} />`
          }
        </div>
        <div style=${{width:"1px",alignSelf:"stretch",background:"var(--color-border)"}}></div>
        <div style=${{display:"flex",flexDirection:"column",gap:"3px"}}>
          <span style=${{fontSize:"10px",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:"var(--color-text-3)"}}>ENTEGRASYON</span>
          ${isBandEditing
            ? html`<${BandToggle} value=${bandDraft.hasIntegration} onChange=${(v) => setBandDraft({...bandDraft, hasIntegration: v})} />`
            : html`<${BandPill} active=${Boolean(selectedCompany.hasIntegration)} />`
          }
        </div>
        <div style=${{width:"1px",alignSelf:"stretch",background:"var(--color-border)"}}></div>
        <div style=${{display:"flex",flexDirection:"column",gap:"3px"}}>
          <span style=${{fontSize:"10px",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:"var(--color-text-3)"}}>MUHASEBE RAPOR KURULUMU</span>
          ${isBandEditing
            ? html`<${BandToggle} value=${bandDraft.hasAccountingReport} onChange=${requestAccountingChange} />`
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
          ${activeOptionalModules.map((module) => module.id === "integration-process"
            ? html`
                <${IntegrationCompletionCard}
                  key=${module.id}
                  company=${selectedCompany}
                  accentColor=${module.accentColor}
                  canComplete=${userRole === "entegrasyon_ekibi"}
                  onUpdateCompany=${onUpdateCompany}
                />
              `
            : html`
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
      id: "entegrasyon_ekibi",
      label: "Entegrasyon Ekibi",
      desc: "Entegrasyon Süreçleri'ni yürütür ve tamamlar",
      avatar: "EE",
      color: "bg-[#F0FDFA] text-[#0E7C73]"
    },
    {
      id: "imp_ekibi",
      label: "İmplementasyon Ekibi",
      desc: selectedCompany?.assignee || "Implementasyon Ekibi",
      avatar: selectedCompany?.assignee
        ? selectedCompany.assignee.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()
        : "IE",
      avatarUrl: specialistAvatarUrl,
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

  const active = roles.find(r => r.id === userRole) || roles.find(r => r.id === "imp_ekibi")

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
              ${role.avatarUrl
                ? html`<img src=${role.avatarUrl} alt=${role.desc} className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-[#DCE3EC]" />`
                : html`<span className=${classNames("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", role.color)}>${role.avatar}</span>`}
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
    return ["dashboard", "processes", "management", "organization", "knowhow"].includes(requestedPage)
      ? requestedPage
      : "dashboard"
  })
  const [userRole, setUserRole] = useState(getImplementationDemoInitialRole)
  const [selectedOnboardingType, setSelectedOnboardingType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [companies, setCompanies] = useState(() => {
    const storedModules = readStoredOptionalModules()
    return seedCompanies.map((company) => {
      if (TEMPORARILY_DISABLED_OPTIONAL_MODULE_COMPANY_IDS.has(company.id)) {
        return { ...company, hasGE: false, hasIntegration: false, hasAccountingReport: false }
      }
      const moduleSettings = storedModules[company.id]
      return moduleSettings
        ? {
            ...company,
            hasGE: Boolean(moduleSettings.hasGE),
            hasIntegration: moduleSettings.hasIntegration !== undefined ? Boolean(moduleSettings.hasIntegration) : Boolean(company.hasIntegration),
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

    if ((newPage === "processes" || newPage === "management" || newPage === "organization" || newPage === "knowhow") && selectedCompanyId === "all") {
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
      hasIntegration: companyDraft.hasIntegration,
      hasAccountingReport: companyDraft.hasAccountingReport,
      startDate: companyDraft.startDate,
      deadlines: normalizePhaseDeadlines(companyDraft.deadlines)
    }

    // Yeni şirkette veya geçiş planı / başlangıç tarihi değiştiğinde takvim plana göre üretilir.
    const isNewCompany = isCreatingCompany || !selectedCompany
    const shouldGenerateDeadlines = isNewCompany
      || normalizeTransitionType(selectedCompany.transitionType) !== normalizedDraft.transitionType
      || selectedCompany.startDate !== normalizedDraft.startDate
    if (shouldGenerateDeadlines) {
      normalizedDraft.deadlines = generatePhaseDeadlines({
        ...normalizedDraft,
        currentStepIndex: isNewCompany ? 0 : selectedCompany.currentStepIndex
      }) || normalizedDraft.deadlines
    }

    if (isNewCompany) {
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
        reason: "Müşterinin eksik analiz bildiriminden dolayı süreç ortasında Rapor Geliştirme adımı eklendi.",
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
                if (activePage === "organization" && window.OrganizationPage) {
                  return html`<${window.OrganizationPage} key=${selectedCompanyId} companyName=${selectedCompany?.name || ""} onNavigate=${handlePageChange} />`
                }
                if (activePage === "knowhow" && window.KnowHowPage) {
                  return html`<${window.KnowHowPage} key=${selectedCompanyId} companyName=${selectedCompany?.name || ""} userRole=${userRole} assignee=${selectedCompany?.assignee || ""} onNavigate=${handlePageChange} />`
                }
                if (activePage === "processes") {
                  return html`<${ProcessWorkspace} key=${selectedCompanyId} company=${selectedCompany} userRole=${userRole} onUpdateCompany=${handleUpdateCompany} />`
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

