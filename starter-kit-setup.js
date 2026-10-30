// Starter Kit'ten sistem kurulumu: uzman onayladığı Starter Kit ile Şirket → İşyeri → Departman → Çalışan
// kayıtlarını tek tuşla oluşturur. Sıra ve kurallar Dakika toplu aktarım ekranlarıyla aynıdır:
// Grup firma açılışında oluşur (implementation-service), Şirket Grup altına, İşyeri Şirket altına,
// Departman İşyeri altına açılır (CreateBulkUnitFileUpload); çalışanlar yalnız İşyeri/Departman'a
// bağlanır (CreateEmployeeUpload), ücret ve banka bilgileri toplu değer güncellemesiyle yazılır.
;(function () {
  const { useEffect, useMemo, useRef, useState } = React
  const h = htm.bind(React.createElement)

  // Workgroup adları değişti; tarayıcıda eski adla kayıtlı organizasyon yapısı ve Know-How verisi yeni ada taşınır.
  const RENAMED_GROUPS = { "Anadolu Lojistik Operasyon": "İMAS Klima", "Marmara Grup Bordro": "Başkaya Holding" }
  ;["sdp-starter-kit-setup-results-v1", "sdp-know-how-v1"].forEach((key) => {
    try {
      const store = JSON.parse(window.localStorage.getItem(key) || "{}")
      let changed = false
      Object.entries(RENAMED_GROUPS).forEach(([from, to]) => {
        if (store[from] && !store[to]) { store[to] = store[from]; changed = true }
        if (store[from]) { delete store[from]; changed = true }
      })
      if (changed) window.localStorage.setItem(key, JSON.stringify(store))
    } catch (_) { /* depolama kapalıysa taşınacak veri de yoktur */ }
  })
  try {
    const RESET_FLAG = "sdp-demo-reset-imas-klima-2026-10-23"
    if (!window.localStorage.getItem(RESET_FLAG)) {
      const store = JSON.parse(window.localStorage.getItem("sdp-starter-kit-setup-results-v1") || "{}")
      delete store["İMAS Klima"]
      window.localStorage.setItem("sdp-starter-kit-setup-results-v1", JSON.stringify(store))
      window.localStorage.setItem(RESET_FLAG, "1")
    }
  } catch (_) { /* depolama kapalıysa sıfırlanacak kayıt da yoktur */ }

  const TYPE_META = {
    group: { label: "Grup", plural: "Grup" },
    company: { label: "Şirket", plural: "Şirketler" },
    workplace: { label: "İşyeri", plural: "İşyerleri" },
    department: { label: "Departman", plural: "Departmanlar" },
    employee: { label: "Çalışan", plural: "Çalışanlar" }
  }

  // Demo akışında her kaydın oluşturulma süresi (ms); gerçek serviste API çağrısıyla değişir.
  const STEP_DELAY = { company: 520, workplace: 380, bes: 300, department: 170, employee: 45, values: 1400 }

  // Zorunlu BES başlangıç tarihi şirketin çalışan sayısına göre belirlenir (Bes Tanımlamaları).
  const BES_SCHEDULE = [
    { min: 1000, date: "01.01.2017", label: "1000 ve üzeri" },
    { min: 250, date: "01.04.2017", label: "250 – 999" },
    { min: 100, date: "01.07.2017", label: "100 – 249" },
    { min: 50, date: "01.01.2018", label: "50 – 99" },
    { min: 10, date: "01.07.2018", label: "10 – 49" },
    { min: 5, date: "01.01.2019", label: "5 – 9" }
  ]
  const besStartFor = (count) => BES_SCHEDULE.find((b) => count >= b.min) || null
  const EBILDIRGE_URL = "https://ebildirge.sgk.gov.tr/EBildirgeV2"
  // İşyeri SGK sicil no: 26 hane ya da aracı no (son 3 hane) olmadan 23 hane.
  const SGK_WORKPLACE_LENGTHS = [23, 26]

  // Starter Kit'teki telefon Dakika'da ülke kodu (90) ve numara olarak ayrı alanlara yazılır.
  function splitPhone(raw) {
    const text = String(raw || "").trim()
    if (!text) return null
    let digits = text.replace(/\D/g, "")
    if (digits.startsWith("0090")) digits = digits.slice(4)
    else if (digits.startsWith("90") && digits.length === 12) digits = digits.slice(2)
    if (digits.startsWith("0")) digits = digits.slice(1)
    return { countryCode: "90", number: digits, raw: text }
  }

  const toIsoDate = (tr) => { const m = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(String(tr || "").trim()); return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : "" }
  const fromIsoDate = (iso) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ""); return m ? `${m[3]}.${m[2]}.${m[1]}` : "" }
  // Since tarihi: uzmanın seçtiği tarih; bundan sonra işe giren çalışan kendi işe giriş tarihiyle kalır.
  const sinceFor = (employee, sinceIso) => { const start = toIsoDate(employee.startDate); return start && start > sinceIso ? start : sinceIso }

  const SETUP_STEPS = [
    { key: "group", title: "Grup", source: "Firma açılışında oluşturuldu", tool: "İmplementasyon firması" },
    { key: "company", title: "Şirketler", source: "Şirket Bilgi sayfası", tool: "Birim toplu yaratma · Grup altına" },
    { key: "workplace", title: "İşyerleri", source: "İşyeri Bilgi sayfası", tool: "Birim toplu yaratma · Şirket altına" },
    { key: "bes", title: "BES tanımları", source: "Kişisel Bilgi sayfası", tool: "Şirket · Standart Görünüm · Çalışma · Bes Tanımlamaları" },
    { key: "department", title: "Departmanlar", source: "Kişisel Bilgi sayfası", tool: "Birim toplu yaratma · İşyeri altına" },
    { key: "employee", title: "Çalışanlar", source: "Kişisel Bilgi sayfası", tool: "Toplu çalışan yaratma" },
    { key: "values", title: "Ücret, banka ve since tarihi", source: "Kişisel Bilgi sayfası", tool: "Toplu değer güncelleme" }
  ]

  const ICON = {
    close: "M6 6l12 12M18 6 6 18",
    check: "M20 6 9 17l-5-5",
    chevron: "m9 6 6 6-6 6",
    down: "m6 9 6 6 6-6",
    group: ["M3 21h18", "M3 10h18", "m12 3 9 7H3l9-7Z", "M6 10v8M10 10v8M14 10v8M18 10v8"],
    company: ["M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17", "M3 21h18", "M10 7h1M13 7h1M10 11h1M13 11h1M10 15h1M13 15h1", "M11 21v-3h2v3"],
    workplace: ["M3 21h18", "M4 21V11l5 3v-3l5 3V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v14", "M8 17h1M12 17h1M16 17h1"],
    department: ["M4 8h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z", "M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2", "M3 13h18"],
    person: ["M18 20a6 6 0 0 0-12 0", "M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8"],
    employee: ["M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1", "M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6", "M20 19v-1a3 3 0 0 0-2-2.8", "M15 4.2a3 3 0 0 1 0 5.6"],
    values: ["M4 7h16v12H4z", "M4 11h16", "M8 15h3"],
    bes: ["M12 3 4 6v6c0 4.4 3.4 8.3 8 9 4.6-.7 8-4.6 8-9V6l-8-3Z", "m9 12 2 2 4-4"],
    spark: ["M12 3v4M12 17v4M3 12h4M17 12h4", "m5.6 5.6 2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"],
    download: ["M12 3v12", "m7 10 5 5 5-5", "M5 20h14"],
    search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16", "m21 21-4.3-4.3"],
    alert: ["M12 9v4", "M12 17h.01", "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"],
    info: ["M12 16v-4", "M12 8h.01", "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20"],
    upload: ["M12 21V9", "m7 14 5-5 5 5", "M5 4h14"]
  }

  const Icon = ({ d, size = 16, stroke = 1.7 }) => h`
    <svg width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth=${stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">${[].concat(d).map((p, i) => h`<path key=${i} d=${p} />`)}</svg>
  `

  // ---------- Starter Kit → kurulum planı ----------

  function findHeader(sheet, norm, required) {
    for (let r = 0; r < Math.min(sheet.rowCount, 40); r++) {
      const cols = {}
      sheet.rows[r].forEach((v, c) => { const n = norm(v); if (n && cols[n] == null) cols[n] = c })
      if (required.every((k) => cols[k] != null)) return { headerRow: r, cols }
    }
    return null
  }

  function buildSetupPlan(parsed, groupName) {
    const { skNorm: norm } = window.StarterKitSheetEditor.helpers
    const { sheets, schema } = parsed
    const clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim()
    const companies = []
    const companyByKey = new Map()

    const addCompany = (name, extra = {}, fromPersonnel = false) => {
      const key = norm(name)
      if (!key) return null
      if (companyByKey.has(key)) return companyByKey.get(key)
      const company = { type: "company", name, title: extra.title || "", taxNo: extra.taxNo || "", tradeRegNo: extra.tradeRegNo || "", mersisNo: extra.mersisNo || "", phone: extra.phone || null, workplaces: [], fromPersonnel }
      companyByKey.set(key, company)
      companies.push(company)
      return company
    }

    // Şirket Bilgi
    if (schema.company) {
      const sheet = sheets[schema.company.si]
      const head = findHeader(sheet, norm, ["sirketadi"]) || { headerRow: schema.company.headerRow, cols: {} }
      const at = (row, n) => (head.cols[n] == null ? "" : clean(row[head.cols[n]]))
      for (let r = head.headerRow + 1; r < sheet.rowCount; r++) {
        const row = sheet.rows[r]
        if (!row.some((v) => clean(v))) break
        addCompany(clean(row[schema.company.cols.sirketAdi]), {
          title: at(row, "ticariunvan"),
          tradeRegNo: at(row, "ticaretsicilnumarasi") || at(row, "ticaretsicilno"),
          mersisNo: at(row, "mersisno"),
          phone: splitPhone(at(row, "telefon")),
          taxNo: clean(row[schema.company.cols.vergiNo])
        })
      }
    }

    // İşyeri Bilgi
    const workplaceByKey = new Map()
    const addWorkplace = (company, name, extra = {}, fromPersonnel = false) => {
      const key = `${norm(company.name)}|${norm(name)}`
      if (!norm(name)) return null
      if (workplaceByKey.has(key)) return workplaceByKey.get(key)
      const workplace = {
        type: "workplace", name, sgkNo: extra.sgkNo || "", address: extra.address || "",
        manufacturingClaim: extra.manufacturingClaim || "", manufacturing: false,
        sgkUser: extra.sgkUser || "", sgkUserCode: extra.sgkUserCode || "", sgkPassword: extra.sgkPassword || "", sgkWorkplacePassword: extra.sgkWorkplacePassword || "",
        iskurUser: extra.iskurUser || "", iskurPassword: extra.iskurPassword || "",
        departments: [], employees: [], fromPersonnel, company
      }
      workplaceByKey.set(key, workplace)
      company.workplaces.push(workplace)
      return workplace
    }
    sheets.forEach((sheet) => {
      const head = findHeader(sheet, norm, ["baglibulundugusirketadi", "isyeriadi"])
      if (!head) return
      for (let r = head.headerRow + 1; r < sheet.rowCount; r++) {
        const row = sheet.rows[r]
        const companyName = clean(row[head.cols.baglibulundugusirketadi])
        const name = clean(row[head.cols.isyeriadi])
        if (!companyName || !name) { if (!row.some((v) => clean(v))) break; continue }
        const company = companyByKey.get(norm(companyName)) || addCompany(companyName, {}, true)
        const at = (n) => (head.cols[n] == null ? "" : clean(row[head.cols[n]]))
        addWorkplace(company, name, {
          sgkNo: at("isyerisgknumarasi"), address: at("adres"),
          // Başlık "İmalat Sektörü mü? Evet/Hayır" gibi açıklamayla birlikte gelebilir.
          manufacturingClaim: at(Object.keys(head.cols).find((k) => k.startsWith("imalatsektoru"))),
          sgkUser: at("sgksistemkullaniciadi"), sgkUserCode: at("sgksistemkullanicikodu"),
          sgkPassword: at("sgksistemsifresi"), sgkWorkplacePassword: at("sgkisyerisifresi"),
          iskurUser: at("iskursistemkullaniciadi"), iskurPassword: at("iskursistemkullanicisifresi")
        })
      }
    })

    // Kişisel Bilgi → departmanlar ve çalışanlar
    const employees = []
    if (schema.personal) {
      const { si, headerRow, cols } = schema.personal
      const sheet = sheets[si]
      const extra = {}
      sheet.rows[headerRow].forEach((v, c) => { const n = norm(v); if (n && extra[n] == null) extra[n] = c })
      const at = (row, c) => (c == null ? "" : clean(row[c]))
      const colCompany = extra.sirketidadi ?? extra.sirketadi
      const colWorkplace = extra.isyeriidadi ?? extra.isyeriadi
      const colDepartment = extra.departmanadi
      const colPosition = extra.pozisyon
      const colBank = extra.banka
      const colBes = extra.zorunlubesuygulamasinatabimi
      for (let r = headerRow + 1; r < sheet.rowCount; r++) {
        const row = sheet.rows[r]
        if (!["sicil", "ad", "soyad", "tc"].some((k) => at(row, cols[k]))) continue
        const companyName = at(row, colCompany) || companies[0]?.name || groupName
        const company = companyByKey.get(norm(companyName)) || addCompany(companyName, {}, true)
        const workplaceName = at(row, colWorkplace) || company.workplaces[0]?.name || company.name
        const workplace = workplaceByKey.get(`${norm(company.name)}|${norm(workplaceName)}`) || addWorkplace(company, workplaceName, {}, true)
        const departmentName = at(row, colDepartment)
        let department = null
        if (departmentName) {
          department = workplace.departments.find((d) => norm(d.name) === norm(departmentName))
          if (!department) {
            department = { type: "department", name: departmentName, employees: [], workplace }
            workplace.departments.push(department)
          }
        }
        const employee = {
          type: "employee",
          row: r + 1,
          sicil: at(row, cols.sicil),
          firstName: at(row, cols.ad),
          lastName: at(row, cols.soyad),
          tc: at(row, cols.tc),
          birthDate: at(row, cols.dogum),
          gender: at(row, cols.cinsiyet),
          sgkNo: at(row, cols.sgk),
          jobCode: at(row, cols.meslek),
          startDate: at(row, cols.iseGiris),
          seniorityDate: at(row, cols.kidem),
          salary: at(row, cols.maas),
          iban: at(row, cols.iban),
          bank: at(row, colBank),
          position: at(row, colPosition),
          besRequired: ["e", "evet"].includes(norm(at(row, colBes))),
          company, workplace, department
        }
        ;(department || workplace).employees.push(employee)
        employees.push(employee)
      }
    }

    // Zorunlu BES: personelden biri tabi ise grup zorunlu BES'e tabi seçilir; tarih şirketin çalışan sayısından gelir.
    const besRequired = employees.some((e) => e.besRequired)
    companies.forEach((company) => {
      const count = countEmployees(company)
      const slot = besRequired ? besStartFor(count) : null
      company.bes = besRequired ? { date: slot?.date || "", bracket: slot?.label || "5'ten az", count } : null
    })

    const workplaces = companies.flatMap((c) => c.workplaces)
    const departments = workplaces.flatMap((w) => w.departments)
    return {
      group: { type: "group", name: groupName || "Firma Grubu", existing: true },
      companies, workplaces, departments, employees, besRequired,
      counts: { group: 1, company: companies.length, workplace: workplaces.length, bes: besRequired ? companies.length : 0, department: departments.length, employee: employees.length, values: employees.length }
    }
  }

  function countEmployees(node) {
    if (node.type === "workplace") return node.employees.length + node.departments.reduce((t, d) => t + d.employees.length, 0)
    if (node.type === "company") return node.workplaces.reduce((t, w) => t + countEmployees(w), 0)
    if (node.type === "department") return node.employees.length
    return 0
  }

  function slugUser(first, last, taken) {
    const base = `${first}.${last}`.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").replace(/[^a-z.]/g, "").replace(/\.+/g, ".").replace(/^\.|\.$/g, "") || "kullanici"
    let name = base
    let n = 2
    while (taken.has(name)) name = `${base}${n++}`
    taken.add(name)
    return name
  }

  // ---------- Bileşenler ----------

  // Onaylanan Starter Kit firma bazında kaydedilir; Organizasyon Yapısı sayfası aktarımı bu dosyayla hazırlar.
  window.__skApprovedKits = window.__skApprovedKits || {}
  function registerApprovedKit(groupName, file) {
    if (!groupName || !file) return
    window.__skApprovedKits[groupName] = { name: file.name, downloadUrl: file.downloadUrl || "", approvedAt: file.reviewedAt || "", uploadedAt: file.uploadedAt || "" }
  }
  const goToOrganization = () => window.dispatchEvent(new CustomEvent("sdp-navigate", { detail: { page: "organization" } }))

  // compact: belge tablosunun Aktarım sütunundaki tek satırlık hali (dosya hücresini genişletmez).
  // Aktarım Organizasyon Yapısı sayfasında yapılır; buton yalnız oraya götürür.
  function StarterKitSetupLauncher({ file, groupName, compact = false }) {
    const [result, setResult] = useState(() => loadSetupResult(groupName))
    useEffect(() => { registerApprovedKit(groupName, file) }, [groupName, file])
    useEffect(() => {
      const onUpdate = () => setResult(loadSetupResult(groupName))
      window.addEventListener("sdp-setup-result-updated", onUpdate)
      return () => window.removeEventListener("sdp-setup-result-updated", onUpdate)
    }, [groupName])
    const open = () => { registerApprovedKit(groupName, file); goToOrganization() }
    const summary = result ? `${result.counts.company} şirket · ${result.counts.workplace} işyeri · ${result.counts.department} departman · ${result.counts.employee} çalışan` : "Organizasyon Yapısı ekranında ön izleyip tek tuşla aktarın."
    if (compact) {
      return h`
        <div className=${`sku-launch-compact ${result ? "is-done" : ""}`}>
          <button type="button" className="sku-launch-btn" onClick=${open} title=${summary}>
            <${Icon} d=${result ? ICON.check : ICON.spark} size=${13} stroke=${2} />${result ? "Aktarıldı · Yapıyı Gör" : "Sisteme Aktar"}
          </button>
        </div>
      `
    }
    return h`
      <div className=${`sku-launch ${result ? "is-done" : ""}`}>
        <span className="sku-launch-icon"><${Icon} d=${result ? ICON.check : ICON.spark} size=${15} stroke=${2} /></span>
        <div className="sku-launch-text">
          <strong>${result ? "Sisteme aktarıldı" : "Sisteme aktarmaya hazır"}</strong>
          <span>${summary}</span>
        </div>
        <button type="button" className="sku-launch-btn" onClick=${open}>${result ? "Yapıyı Gör" : "Sisteme Aktar"}</button>
      </div>
    `
  }

  const TOAST_MS = 6000
  const RUN_STEPS = SETUP_STEPS.filter((s) => s.key !== "group")
  const RUN_WEIGHTS = { company: 3, workplace: 3, bes: 1, department: 4, employee: 10, values: 3 }
  // Sayaç şeridinde yalnız yapı kayıtları görünür; BES ve toplu değer adımları arka planda çalışır.
  const STRIP_STEPS = RUN_STEPS.filter((s) => ["company", "workplace", "department", "employee"].includes(s.key))

  // Organizasyon Yapısı sayfasında aktarım: ön izleme + ayarlar → oluşturma → sonuç (sayfa gezginine döner).
  function SetupWorkspace({ kit, groupName, onDone }) {
    const [phase, setPhase] = useState("loading")
    const [plan, setPlan] = useState(null)
    const [fileName, setFileName] = useState(kit.name)
    const [error, setError] = useState("")
    const [since, setSince] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01` })
    const [manufacturing, setManufacturing] = useState(() => new Set())
    const [progress, setProgress] = useState({})
    const [activeStep, setActiveStep] = useState(null)
    const [lastEvent, setLastEvent] = useState("")
    const [elapsed, setElapsed] = useState(0)
    const cancelRef = useRef(false)
    const norm = window.StarterKitSheetEditor.helpers.skNorm

    function loadBuffer(buffer, name) {
      try {
        const parsed = window.StarterKitSheetEditor.helpers.parseWorkbook(buffer)
        if (!parsed.schema.personal) throw new Error("schema")
        const next = buildSetupPlan(parsed, groupName)
        setTimeout(() => {
          setPlan({ ...next, fileName: name })
          setFileName(name)
          setPhase("plan")
        }, 700)
      } catch (_) {
        setError("Dosya okunamadı veya Starter Kit şablonuna uygun değil.")
        setPhase("source")
      }
    }

    useEffect(() => {
      cancelRef.current = false
      if (!/^blob:|^https?:/.test(kit.downloadUrl || "")) { setPhase("source"); return undefined }
      fetch(kit.downloadUrl).then((r) => r.arrayBuffer()).then((buf) => loadBuffer(buf, kit.name)).catch(() => setPhase("source"))
      return () => { cancelRef.current = true }
    }, [kit.downloadUrl])

    const modalOpen = phase === "confirm" || phase === "running" || phase === "done"
    useEffect(() => {
      if (!modalOpen) return undefined
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      const onKey = (e) => { if (e.key === "Escape") setPhase((p) => (p === "confirm" ? "plan" : p)) }
      window.addEventListener("keydown", onKey)
      return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey) }
    }, [modalOpen])

    function pickFile(e) {
      const f = e.target.files?.[0]
      e.target.value = ""
      if (!f) return
      setError("")
      setPhase("loading")
      f.arrayBuffer().then((buf) => loadBuffer(buf, f.name))
    }

    async function run() {
      setPhase("running")
      plan.sinceIso = since
      plan.workplaces.forEach((w) => { w.manufacturing = manufacturing.has(w) })
      const started = Date.now()
      const timer = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 250)
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
      let nextId = 118752100 + Math.floor(Math.random() * 800)
      const bump = (key, done) => setProgress((p) => ({ ...p, [key]: done }))
      const taken = new Set()
      const stepRun = async (key, items, fn) => {
        setActiveStep(key)
        bump(key, 0)
        for (let i = 0; i < items.length; i++) {
          if (cancelRef.current) return
          await wait(STEP_DELAY[key])
          fn(items[i])
          bump(key, i + 1)
        }
      }

      plan.group.id = 118751544 + 200 + (groupName || "").length
      await stepRun("company", plan.companies, (c) => {
        c.id = nextId++
        c.parentId = plan.group.id
        setLastEvent(`${c.name} şirketi oluşturuldu`)
      })
      await stepRun("workplace", plan.workplaces, (w) => {
        w.id = nextId++
        w.parentId = w.company.id
        setLastEvent(`${w.name} işyeri ${w.company.name} altına açıldı${w.manufacturing ? " · imalat sektörü işveren" : ""}`)
      })
      await stepRun("bes", plan.besRequired ? plan.companies : [], (c) => {
        c.besDone = true
        setLastEvent(`${c.name} · zorunlu BES ${c.bes.date ? `başlangıç ${c.bes.date}` : "başlangıç tarihi boş"}`)
      })
      await stepRun("department", plan.departments, (d) => {
        d.id = nextId++
        d.parentId = d.workplace.id
        setLastEvent(`${d.name} departmanı ${d.workplace.name} altına açıldı`)
      })
      await stepRun("employee", plan.employees, (e) => {
        e.id = nextId++
        e.unitId = (e.department || e.workplace).id
        e.username = slugUser(e.firstName, e.lastName, taken)
        e.sinceDate = fromIsoDate(sinceFor(e, since))
        setLastEvent(`${e.firstName} ${e.lastName} · ${e.username}`)
      })
      setActiveStep("values")
      bump("values", 0)
      const chunk = Math.max(1, Math.ceil(plan.employees.length / 6))
      for (let i = 0; i < plan.employees.length; i += chunk) {
        if (cancelRef.current) break
        await wait(STEP_DELAY.values / 6)
        bump("values", Math.min(plan.employees.length, i + chunk))
      }
      clearInterval(timer)
      if (cancelRef.current) return
      setLastEvent(`Ücret, banka, SGK bilgileri ve since tarihi (${fromIsoDate(since)}) yazıldı`)
      const total = Math.max(1, Math.round((Date.now() - started) / 1000))
      setActiveStep(null)
      setPhase("done")
      await wait(900)
      if (cancelRef.current) return
      onDone({ plan, counts: plan.counts, elapsed: total, progress: { ...plan.counts }, finishedAt: new Date().toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }) })
    }

    const running = phase === "running" || phase === "done"
    const totalMs = plan ? RUN_STEPS.reduce((t, s) => t + (s.key === "values" ? STEP_DELAY.values : plan.counts[s.key] * STEP_DELAY[s.key]), 0) : 0
    const sumW = RUN_STEPS.reduce((t, s) => t + (s.key === "bes" && !plan?.besRequired ? 0 : RUN_WEIGHTS[s.key]), 0)
    const pct = plan ? Math.round(RUN_STEPS.reduce((t, s) => t + (s.key === "bes" && !plan.besRequired ? 0 : RUN_WEIGHTS[s.key] * Math.min(1, (progress[s.key] || 0) / Math.max(1, plan.counts[s.key]))), 0) / sumW * 100) : 0
    const lateStarters = plan && since ? plan.employees.filter((e) => toIsoDate(e.startDate) > since).length : 0
    const besDated = plan?.besRequired ? plan.companies.filter((c) => c.bes.date).length : 0
    const toggleMfg = (w) => setManufacturing((s) => { const n = new Set(s); n.has(w) ? n.delete(w) : n.add(w); return n })
    const openReview = () => setPhase("confirm")

    const stepStrip = plan ? h`
      <ol className="skx-steps">
        ${STRIP_STEPS.map((s) => {
          const done = progress[s.key] || 0
          const total = plan.counts[s.key]
          const state = s.key === activeStep ? "is-active" : progress[s.key] != null && done >= total ? "is-done" : ""
          return h`
            <li key=${s.key} className=${state} title=${`${s.tool} · ${s.source}`}>
              <span className=${`skx-step-dot is-${s.key}`}>${state === "is-done" ? h`<${Icon} d=${ICON.check} size=${12} stroke=${2.6} />` : h`<${Icon} d=${ICON[s.key]} size=${14} />`}</span>
              <div>
                <strong>${running ? `${done}/${total}` : total}</strong>
                <span>${s.title}</span>
              </div>
            </li>
          `
        })}
      </ol>
    ` : null

    if (phase === "loading" || phase === "source") {
      return h`
        <section className="skx-hero">
          <div className="skx-hero-main">
            <span className="skx-hero-icon">${phase === "loading" ? h`<span className="sku-spinner"></span>` : h`<${Icon} d=${ICON.upload} size=${22} />`}</span>
            <div className="skx-hero-text">
              <span className="skx-badge">Onaylandı</span>
              <h2>${phase === "loading" ? "Starter Kit okunuyor" : "Onaylanan Starter Kit dosyasını seçin"}</h2>
              <p>${phase === "loading" ? "Şirket, işyeri, departman ve çalışan bilgileri çıkarılıyor…" : error || "Aktarım, onaylanan Starter Kit dosyasındaki verilerle yapılır."}</p>
              <div className="skx-hero-meta"><span title=${kit.name}><${Icon} d=${ICON.values} size=${13} />${kit.name}</span>${kit.approvedAt ? h`<span><${Icon} d=${ICON.check} size=${13} stroke=${2} />Onay ${kit.approvedAt}</span>` : null}</div>
            </div>
            ${phase === "source" ? h`
              <div className="skx-hero-cta">
                <label className="skx-cta"><input type="file" accept=".xls,.xlsx" hidden onChange=${pickFile} /><${Icon} d=${ICON.upload} size=${16} stroke=${2} /> Dosya Seç</label>
              </div>
            ` : null}
          </div>
        </section>
      `
    }

    // Aktarılacak yapı: ayarlardan sonra onay penceresinde gösterilir; Aktar ile aktarım burada ilerler.
    const modal = phase === "confirm" || running ? ReactDOM.createPortal(h`
      <div className="sku-backdrop" onMouseDown=${(e) => { if (e.target === e.currentTarget && phase === "confirm") setPhase("plan") }}>
        <div className="skx-modal" role="dialog" aria-modal="true" aria-label="Aktarılacak yapı">
          <header className="skx-modal-head">
            <span className=${`skx-modal-icon ${phase === "done" ? "is-done" : ""}`}>
              ${phase === "running" ? h`<span className="skx-ring is-sm" style=${{ "--p": pct }}><b>%${pct}</b></span>` : h`<${Icon} d=${phase === "done" ? ICON.check : ICON.group} size=${19} stroke=${phase === "done" ? 2.4 : 1.8} />`}
            </span>
            <div className="skx-modal-title">
              <strong>${phase === "done" ? "Aktarım tamamlandı" : phase === "running" ? "Dakika'ya aktarılıyor" : "Aktarılacak yapı"}</strong>
              <span>${phase === "running"
                ? h`${lastEvent || "Hazırlanıyor"} <em className="skx-dim">· ${elapsed} sn</em>`
                : phase === "done" ? "Organizasyon yapısı açılıyor…"
                : `${plan.group.name} grubu altına ${plan.counts.company} şirket, ${plan.counts.workplace} işyeri, ${plan.counts.department} departman ve ${plan.counts.employee} çalışan oluşturulacak.`}</span>
            </div>
            ${phase === "confirm" ? h`<button type="button" className="sku-close" aria-label="Kapat" onClick=${() => setPhase("plan")}><${Icon} d=${ICON.close} size=${18} /></button>` : null}
          </header>
          ${running ? h`<div className="skx-hero-bar is-inline"><span style=${{ width: `${pct}%` }}></span></div>` : null}
          ${stepStrip}
          <div className="skx-modal-body"><${PlanExplorer} plan=${plan} running=${running} since=${since} manufacturing=${manufacturing} /></div>
          <footer className="skx-modal-foot">
            ${phase === "confirm" ? h`
              <div className="skx-modal-actions">
                <button type="button" className="skx-btn" onClick=${() => setPhase("plan")}>Ayarlara dön</button>
                <button type="button" className="skx-cta is-md" onClick=${run}><${Icon} d=${ICON.spark} size=${15} stroke=${2} /> Aktar</button>
              </div>
            ` : h`<p className="skx-modal-note">${phase === "done" ? "Tüm kayıtlar oluşturuldu." : "Aktarım sürüyor; pencereyi kapatmayın."}</p>`}
          </footer>
        </div>
      </div>
    `, document.body) : null

    const step = (n, done) => h`<span className=${`skx-num-badge ${done ? "is-done" : ""}`}>${done ? h`<${Icon} d=${ICON.check} size=${12} stroke=${2.6} />` : n}</span>`

    return h`
      <section className="skx-hero">
        <div className="skx-hero-main">
          <span className="skx-hero-icon"><${Icon} d=${ICON.spark} size=${22} /></span>
          <div className="skx-hero-text">
            <span className="skx-badge">Onaylandı · Aktarıma hazır</span>
            <h2>Starter Kit sisteme aktarılmaya hazır</h2>
            <p>Aşağıdaki aktarım ayarlarını tamamlayın. Sisteme Aktar ile oluşturulacak yapıyı kontrol edip Dakika'ya aktarırsınız.</p>
            <div className="skx-hero-meta">
              <span title=${fileName}><${Icon} d=${ICON.values} size=${13} />${fileName}</span>
              ${kit.approvedAt ? h`<span><${Icon} d=${ICON.check} size=${13} stroke=${2} />Onay ${kit.approvedAt}</span>` : null}
              <label className="skx-meta-link"><input type="file" accept=".xls,.xlsx" hidden onChange=${pickFile} /><${Icon} d=${ICON.upload} size=${13} />Farklı dosya seç</label>
            </div>
          </div>
        </div>
        ${stepStrip}
      </section>

      <div className="skx-section-head">
        <div><h2>Aktarım ayarları</h2><p>Dakika'ya yazılmadan önce uzman tarafından tamamlanır.</p></div>
      </div>

      <div className="skx-settings">
        <section className="skx-panel">
          <div className="skx-panel-head">${step(1, Boolean(since))}<div><strong>Since tarihi</strong><small>Çalışanların sisteme başlangıç tarihi</small></div></div>
          <input type="date" className="skx-input" value=${since} onChange=${(e) => setSince(e.target.value)} />
          <p className="skx-help">${lateStarters
            ? h`<b>${lateStarters} çalışan</b> bu tarihten sonra işe girdiği için kendi işe giriş tarihiyle aktarılır.`
            : "Bu tarihten sonra işe giren çalışan olursa kendi işe giriş tarihinde kalır."}</p>
        </section>

        <section className="skx-panel">
          <div className="skx-panel-head">
            ${step(2, manufacturing.size > 0)}
            <div><strong>İmalat sektörü</strong><small>${manufacturing.size} / ${plan.workplaces.length} işyeri işaretli</small></div>
            <a className="skx-link" href=${EBILDIRGE_URL} target="_blank" rel="noopener noreferrer">e-Bildirge ↗</a>
          </div>
          <p className="skx-help">Onaylanmış Belgeler → Kanun No 5510 detayında prim indirimi <b>%5</b> ise imalat, <b>%2</b> ise değildir.</p>
          <ul className="skx-checks">
            ${plan.workplaces.map((w) => {
              const claim = norm(w.manufacturingClaim)
              return h`
                <li key=${`${w.company.name}|${w.name}`}>
                  <label className=${manufacturing.has(w) ? "is-on" : ""}>
                    <input type="checkbox" checked=${manufacturing.has(w)} onChange=${() => toggleMfg(w)} />
                    <span className="skx-check-text"><b title=${w.name}>${niceName(w.name)}</b><small title=${w.company.name}>${niceName(w.company.name)}</small></span>
                    ${claim ? h`<em className=${`skx-claim ${claim === "evet" ? "is-yes" : ""}`} title="Starter Kit'teki beyan">SK: ${claim === "evet" ? "Evet" : claim === "hayir" ? "Hayır" : w.manufacturingClaim}</em>` : null}
                  </label>
                </li>
              `
            })}
          </ul>
        </section>

        <section className="skx-panel">
          <div className="skx-panel-head">
            ${step(3, true)}
            <div><strong>Zorunlu BES</strong><small>${plan.besRequired ? "Grup BES'e tabi · Bes Tanımlamaları aktif" : "Tabi çalışan yok · tanım yapılmaz"}</small></div>
          </div>
          ${plan.besRequired ? h`
            <p className="skx-help">Başlangıç tarihi şirketin çalışan sayısına göre otomatik belirlenir.</p>
            <ul className="skx-bes">
              ${plan.companies.map((c) => h`
                <li key=${c.name}><span title=${c.name}>${niceName(c.name)}</span><small>${c.bes.count} çalışan</small><b className=${c.bes.date ? "" : "is-empty"}>${c.bes.date || "Tarih yok"}</b></li>
              `)}
            </ul>
          ` : h`<p className="skx-help">Kişisel Bilgi sayfasında zorunlu BES'e tabi çalışan bulunmadığı için BES tanımı yapılmaz.</p>`}
        </section>
      </div>

      <div className="skx-actionbar">
        <div className="skx-actionbar-text">
          <strong>Ayarlar tamamlandıysa aktarılacak yapıyı kontrol edin</strong>
          <span>Since ${since ? fromIsoDate(since) : "seçilmedi"} · ${manufacturing.size} imalat işyeri · ${plan.besRequired ? `${besDated} şirkete BES tarihi` : "BES yok"} · tahmini ${Math.max(5, Math.round(totalMs / 1000))} sn</span>
        </div>
        <button type="button" className="skx-cta" disabled=${!since} onClick=${openReview}>Devam et <${Icon} d=${ICON.chevron} size=${16} stroke=${2.2} /></button>
      </div>
      ${modal}
    `
  }

  // ---------- Sonuçların saklanması (firma bazında) ----------

  const STORAGE_KEY = "sdp-starter-kit-setup-results-v1"

  function serializeResult(res) {
    const p = res.plan
    return {
      counts: res.counts, elapsed: res.elapsed, finishedAt: res.finishedAt, fileName: p.fileName,
      group: { id: p.group.id, name: p.group.name }, sinceIso: p.sinceIso, besRequired: p.besRequired,
      companies: p.companies.map(({ workplaces, ...c }) => ({
        ...c,
        workplaces: workplaces.map(({ company, departments, employees, ...w }) => ({ ...w, departments: departments.map((d) => ({ id: d.id, name: d.name })) }))
      })),
      employees: p.employees.map(({ company, workplace, department, ...rest }) => ({ ...rest, companyId: company.id, workplaceId: workplace.id, departmentId: department ? department.id : null }))
    }
  }

  function deserializeResult(raw) {
    const units = new Map()
    const companies = raw.companies.map((c) => {
      const company = { ...c, type: "company", workplaces: [] }
      units.set(c.id, company)
      company.workplaces = c.workplaces.map((w) => {
        const workplace = { ...w, type: "workplace", company, employees: [], departments: [] }
        units.set(w.id, workplace)
        workplace.departments = w.departments.map((d) => {
          const department = { ...d, type: "department", workplace, employees: [] }
          units.set(d.id, department)
          return department
        })
        return workplace
      })
      return company
    })
    const employees = raw.employees.map(({ companyId, workplaceId, departmentId, ...rest }) => {
      const e = { ...rest, type: "employee", company: units.get(companyId), workplace: units.get(workplaceId), department: departmentId != null ? units.get(departmentId) : null }
      ;(e.department || e.workplace).employees.push(e)
      return e
    })
    const workplaces = companies.flatMap((c) => c.workplaces)
    const plan = { group: { ...raw.group, type: "group", existing: true }, sinceIso: raw.sinceIso, besRequired: raw.besRequired, companies, workplaces, departments: workplaces.flatMap((w) => w.departments), employees, counts: raw.counts, fileName: raw.fileName }
    return { plan, counts: raw.counts, elapsed: raw.elapsed, finishedAt: raw.finishedAt, progress: { ...raw.counts } }
  }

  // Demo: İMAS her sayfa yenilemesinde hiç aktarılmamış gibi başlar; aktarım yalnız o oturum boyunca görünür.
  try {
    const store = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}")
    const kept = Object.fromEntries(Object.entries(store).filter(([name]) => !/^imas\b/.test(name.toLocaleLowerCase("tr-TR").replace(/i̇/g, "i"))))
    if (Object.keys(kept).length !== Object.keys(store).length) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(kept))
  } catch (_) { /* depolama kapalı */ }

  function readStore() {
    try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}") } catch (_) { return {} }
  }

  function saveSetupResult(groupName, res) {
    window.__skSetupResults = { ...(window.__skSetupResults || {}), [groupName]: res }
    try {
      const store = readStore()
      store[groupName] = serializeResult(res)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    } catch (_) { /* depolama kapalıysa yalnız oturum içinde tutulur */ }
    window.dispatchEvent(new CustomEvent("sdp-setup-result-updated", { detail: { groupName } }))
  }

  function clearSetupResult(groupName) {
    if (window.__skSetupResults) delete window.__skSetupResults[groupName]
    try {
      const store = readStore()
      delete store[groupName]
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    } catch (_) { /* depolama kapalıysa yalnız oturumdaki kayıt silinir */ }
    window.dispatchEvent(new CustomEvent("sdp-setup-result-updated", { detail: { groupName } }))
  }

  function loadSetupResult(groupName) {
    if (!groupName) return null
    if (window.__skSetupResults?.[groupName]) return window.__skSetupResults[groupName]
    const raw = readStore()[groupName]
    if (!raw) return null
    try {
      const res = deserializeResult(raw)
      window.__skSetupResults = { ...(window.__skSetupResults || {}), [groupName]: res }
      return res
    } catch (_) { return null }
  }

  function downloadResult(plan) {
    const aoa = [["Sicil No", "Adı", "Soyadı", "T.C. Kimlik No", "Şirket", "İşyeri", "Departman", "Kurum ID", "Çalışan ID", "Kullanıcı Adı", "İşe Giriş", "Since Tarihi"]]
    plan.employees.forEach((e) => aoa.push([e.sicil, e.firstName, e.lastName, e.tc, e.company.name, e.workplace.name, e.department?.name || "", e.unitId, e.id, e.username, e.startDate, e.sinceDate || ""]))
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws["!cols"] = aoa[0].map((_, i) => ({ wch: [14, 16, 16, 14, 34, 28, 14, 12, 12, 20, 12, 12][i] }))
    const units = [["Şirket", "İşyeri", "Kurum ID", "Ticari Ünvan", "Ticaret Sicil No", "Mersis No", "Telefon Ülke Kodu", "Telefon", "BES Başlangıç", "İşyeri SGK No", "İmalat Sektörü İşveren", "SGK Sistem Kullanıcı Adı", "SGK Sistem Kullanıcı Kodu", "SGK Sistem Şifresi", "SGK İşyeri Şifresi", "İŞKUR Kullanıcı Adı", "İŞKUR Şifresi"]]
    plan.companies.forEach((c) => c.workplaces.forEach((w) => units.push([
      c.name, w.name, w.id, c.title, c.tradeRegNo || "", c.mersisNo || "", c.phone?.countryCode || "", c.phone?.number || "", c.bes?.date || "",
      w.sgkNo, w.manufacturing ? "Evet" : "Hayır", w.sgkUser || "", w.sgkUserCode || "", w.sgkPassword || "", w.sgkWorkplacePassword || "", w.iskurUser || "", w.iskurPassword || ""
    ])))
    const wsUnits = XLSX.utils.aoa_to_sheet(units)
    wsUnits["!cols"] = units[0].map((_, i) => ({ wch: i < 2 ? 30 : 18 }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Oluşturulan Çalışanlar")
    XLSX.utils.book_append_sheet(wb, wsUnits, "Şirket ve İşyerleri")
    XLSX.writeFile(wb, `${plan.group.name} - Organizasyon Yapısı.xlsx`)
  }

  // Dakika birim ağacı gibi tek satırlık düğüm: aç/kapa oku, tür harfi, ad ve çalışan sayısı.
  const TREE_LETTER = { group: "G", company: "Ş", workplace: "İ", department: "D" }
  function CompactRow({ kind, label, depth, count, open, onToggle, onSelect, active, created, title }) {
    return h`
      <div role="treeitem" aria-selected=${active} aria-expanded=${open} className=${`skx-tr is-${kind} ${active ? "is-active" : ""} ${created ? "is-created" : ""}`} style=${{ "--d": depth }}>
        ${open !== undefined
          ? h`<button type="button" className=${`skx-tr-caret ${open ? "is-open" : ""}`} aria-label=${open ? "Daralt" : "Genişlet"} onClick=${onToggle}><svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1.5 7.5 5 3 8.5Z" fill="currentColor" /></svg></button>`
          : h`<span className="skx-tr-caret is-leaf"></span>`}
        <button type="button" className="skx-tr-main" title=${title} onClick=${onSelect}>
          <span className="skx-tr-ico">${TREE_LETTER[kind]}</span>
          <span className="skx-tr-name">${label}</span>
          ${created ? h`<span className="skx-tr-ok"><${Icon} d=${ICON.check} size=${11} stroke=${2.6} /></span>` : null}
          <span className="skx-tr-count">${count}</span>
        </button>
      </div>
    `
  }

  // Onay penceresindeki yapı gezgini: solda birim ağacı, sağda seçilen birimin çalışanları.
  // Kayıtlar henüz oluşturulmadığından ID yerine durum gösterilir; aktarım ilerledikçe güncellenir.
  function PlanExplorer({ plan, running, since, manufacturing }) {
    const [selected, setSelected] = useState({ type: "group" })
    const [query, setQuery] = useState("")
    const [unitQuery, setUnitQuery] = useState("")
    // Ağaç kapalı açılır: yalnız şirketler görünür; birime tıklayınca altı açılır.
    const [opened, setOpened] = useState(() => new Set())
    const toggle = (node) => setOpened((s) => { const n = new Set(s); n.has(node) ? n.delete(node) : n.add(node); return n })
    const select = (next) => {
      setSelected(next)
      setQuery("")
      if (next.node && next.type !== "department") setOpened((s) => (s.has(next.node) ? s : new Set(s).add(next.node)))
    }
    const isSel = (type, node) => selected.type === type && selected.node === node
    const node = selected.node

    const scope = selected.type === "group"
      ? { title: plan.group.name, type: "Grup", employees: plan.employees, facts: [["Şirket", plan.companies.length], ["İşyeri", plan.workplaces.length], ["Departman", plan.departments.length]] }
      : selected.type === "company"
        ? { title: node.name, type: "Şirket", employees: plan.employees.filter((e) => e.company === node),
            facts: [["Ticari unvan", node.title || "—"], ["Ticaret sicil no", node.tradeRegNo || "—"], ["Vergi No", node.taxNo || "—"], ...(node.bes ? [["BES başlangıç", node.bes.date || "Tarih yok"]] : [])] }
        : selected.type === "workplace"
          ? { title: node.name, type: "İşyeri", employees: plan.employees.filter((e) => e.workplace === node),
              facts: [["Şirket", niceName(node.company.name)], ["SGK işyeri no", node.sgkNo ? `${node.sgkNo}${SGK_WORKPLACE_LENGTHS.includes(node.sgkNo.replace(/\D/g, "").length) ? "" : " · hane sayısı hatalı"}` : "—"], ["İmalat sektörü", manufacturing.has(node) ? "Evet" : "Hayır"]] }
          : { title: node.name, type: "Departman", employees: node.employees, facts: [["İşyeri", niceName(node.workplace.name)], ["Şirket", niceName(node.workplace.company.name)]] }

    const q = query.trim().toLocaleLowerCase("tr")
    const rows = q ? scope.employees.filter((e) => [e.firstName, e.lastName, e.sicil, e.tc].join(" ").toLocaleLowerCase("tr").includes(q)) : scope.employees
    const LIMIT = 300
    const showUnit = selected.type !== "department"
    const uq = unitQuery.trim().toLocaleLowerCase("tr")
    const hit = (name) => !uq || name.toLocaleLowerCase("tr").includes(uq)
    const tree = plan.companies.map((c) => {
      const workplaces = c.workplaces.map((w) => {
        const departments = hit(w.name) || hit(c.name) ? w.departments : w.departments.filter((d) => hit(d.name))
        return { w, departments, visible: hit(c.name) || hit(w.name) || departments.length > 0 }
      }).filter((x) => x.visible)
      return { c, workplaces, visible: hit(c.name) || workplaces.length > 0 }
    }).filter((x) => x.visible)
    const created = (n) => Boolean(n.id)
    const sinceOf = (e) => fromIsoDate(sinceFor(e, since))

    return h`
      <div className="sku-explorer skx-explorer">
        <nav className="sku-nav-tree" aria-label="Aktarılacak yapı">
          <div className="sku-nav-top">
            <label className="sku-search is-small"><${Icon} d=${ICON.search} size=${14} /><input value=${unitQuery} onChange=${(e) => setUnitQuery(e.target.value)} placeholder="Birim ara" />
              ${unitQuery ? h`<button type="button" className="sku-search-clear" aria-label="Aramayı temizle" onClick=${() => setUnitQuery("")}><${Icon} d=${ICON.close} size=${12} /></button>` : null}
            </label>
          </div>
          <div className="skx-tree" role="tree">
            <${CompactRow} kind="group" label=${plan.group.name} depth=${0} count=${plan.employees.length} active=${selected.type === "group"} onSelect=${() => select({ type: "group" })} title=${`${plan.group.name} · grup (mevcut)`} />
            ${tree.map(({ c, workplaces }) => {
              const cOpen = opened.has(c) || !!uq
              return h`
                <${React.Fragment} key=${c.name}>
                  <${CompactRow} kind="company" label=${niceName(c.name)} depth=${1} count=${countEmployees(c)} created=${created(c)} title=${c.name}
                    active=${isSel("company", c)} open=${workplaces.length ? cOpen : undefined} onToggle=${() => toggle(c)} onSelect=${() => select({ type: "company", node: c })} />
                  ${cOpen ? workplaces.map(({ w, departments }) => {
                    const wOpen = opened.has(w) || !!uq
                    return h`
                      <${React.Fragment} key=${w.name}>
                        <${CompactRow} kind="workplace" label=${niceName(w.name)} depth=${2} count=${countEmployees(w)} created=${created(w)} title=${w.fromPersonnel ? `${w.name} · İşyeri Bilgi sayfasında yok` : w.name}
                          active=${isSel("workplace", w)} open=${departments.length ? wOpen : undefined} onToggle=${() => toggle(w)} onSelect=${() => select({ type: "workplace", node: w })} />
                        ${wOpen ? departments.map((d) => h`
                          <${CompactRow} key=${d.name} kind="department" label=${d.name} depth=${3} count=${d.employees.length} created=${created(d)} title=${d.name}
                            active=${isSel("department", d)} onSelect=${() => select({ type: "department", node: d })} />
                        `) : null}
                      <//>
                    `
                  }) : null}
                <//>
              `
            })}
            ${tree.length === 0 ? h`<p className="sku-nav-empty">“${unitQuery}” ile eşleşen birim yok.</p>` : null}
          </div>
        </nav>
        <section className="sku-detail">
          <header className="skx-detail-head">
            <span className=${`sku-tile is-${selected.type}`}><${Icon} d=${ICON[selected.type]} size=${17} stroke=${1.8} /></span>
            <div className="skx-detail-title">
              <div className="skx-detail-name">
                <h3 title=${scope.title}>${selected.type === "department" ? scope.title : niceName(scope.title)}</h3>
                <span className=${`sku-type is-${selected.type}`}>${scope.type}</span>
                ${selected.type !== "group" ? (created(node)
                  ? h`<span className="skx-state is-ok"><${Icon} d=${ICON.check} size=${12} stroke=${2.4} />ID ${node.id}</span>`
                  : h`<span className="skx-state">${running ? "Sırada" : "Oluşturulacak"}</span>`) : null}
              </div>
              <dl className="skx-facts">${scope.facts.map(([k, v]) => h`<div key=${k}><dt>${k}</dt><dd title=${String(v)}>${v}</dd></div>`)}</dl>
            </div>
          </header>
          <div className="sku-toolbar skx-toolbar">
            <div className="sku-toolbar-title">
              <span className="sku-toolbar-icon"><${Icon} d=${ICON.employee} size=${15} /></span>
              <b>Çalışanlar</b><em>${q ? `${rows.length} / ${scope.employees.length}` : scope.employees.length}</em>
            </div>
            <label className="sku-search"><${Icon} d=${ICON.search} size=${15} /><input value=${query} onChange=${(e) => setQuery(e.target.value)} placeholder="Ad, sicil veya T.C. ara" />
              ${query ? h`<button type="button" className="sku-search-clear" aria-label="Aramayı temizle" onClick=${() => setQuery("")}><${Icon} d=${ICON.close} size=${12} /></button>` : null}
            </label>
          </div>
          <div className="sku-table-wrap">
            <table className="sku-table">
              <thead><tr>
                <th>Sicil No</th><th>Ad Soyad</th><th>T.C. Kimlik No</th>${showUnit ? h`<th>${selected.type === "workplace" ? "Departman" : "İşyeri / Departman"}</th>` : null}<th>İşe Giriş</th><th>Since</th><th>Durum</th>
              </tr></thead>
              <tbody>
                ${rows.slice(0, LIMIT).map((e, i) => {
                  const sinceText = since ? sinceOf(e) : "—"
                  const ownDate = since && toIsoDate(e.startDate) > since
                  return h`
                    <tr key=${`${e.row}-${i}`} className=${e.id ? "is-created" : ""}>
                      <td className="is-code">${e.sicil}</td>
                      <td><div className="sku-person"><span className=${`sku-avatar ${toneOf(e)}`}>${(e.firstName[0] || "") + (e.lastName[0] || "")}</span><div><b>${trTitle(e.firstName)} ${trTitle(e.lastName)}</b>${e.position ? h`<small title=${e.position}>${niceName(e.position)}</small>` : null}</div></div></td>
                      <td className="is-code">${e.tc}</td>
                      ${showUnit ? h`<td className="sku-unit-cell">
                        ${selected.type === "workplace" ? h`<span>${e.department?.name || "—"}</span>` : h`<span title=${e.workplace.name}>${niceName(e.workplace.name)}</span>${e.department ? h`<small>${e.department.name}</small>` : null}`}
                      </td>` : null}
                      <td className="is-num">${e.startDate}</td>
                      <td className="is-num">${ownDate ? h`<span className="skx-own" title="Bu tarihten sonra işe girdiği için kendi işe giriş tarihiyle aktarılır">${sinceText}</span>` : sinceText}</td>
                      <td>${e.id
                        ? h`<span className="skx-state is-ok" title=${`Çalışan ID ${e.id}`}><${Icon} d=${ICON.check} size=${12} stroke=${2.4} />${e.username}</span>`
                        : h`<span className=${`skx-state ${running ? "is-wait" : ""}`}>${running ? "Sırada" : "Yeni"}</span>`}</td>
                    </tr>
                  `
                })}
              </tbody>
            </table>
            ${rows.length === 0 ? h`<p className="sku-empty">${q ? "Aramayla eşleşen çalışan yok." : "Bu birimde çalışan yok."}</p>` : null}
          </div>
          <footer className="sku-detail-foot">${rows.length > LIMIT ? `İlk ${LIMIT} çalışan gösteriliyor · toplam ${rows.length}` : `${rows.length} çalışan`}${q ? ` · “${query}” araması` : ""}</footer>
        </section>
      </div>
    `
  }

  // ---------- Organizasyon gezgini (sonuç ekranı ve sayfa ortak) ----------

  const AVATAR_TONES = ["is-blue", "is-violet", "is-teal", "is-amber", "is-rose"]
  const trTitle = (v) => String(v || "").toLocaleLowerCase("tr").replace(/(^|[\s.'-])(\S)/g, (m, sep, ch) => sep + ch.toLocaleUpperCase("tr"))
  // Starter Kit'ten tamamen büyük harfle gelen birim/pozisyon adlarını ekranda okunur gösterir; kısaltmalar büyük kalır.
  const KEEP_UPPER = new Set(["AŞ", "A", "Ş", "ŞTİ", "LTD", "Tİ", "İK", "IT", "AR", "GE", "ARGE", "SGK", "KDV", "OSB"])
  const KEEP_LOWER = new Set(["VE", "İLE", "DE", "DA"])
  const niceName = (v) => {
    const text = String(v || "")
    if (text.length < 6 || text !== text.toLocaleUpperCase("tr") || !/[A-ZÇĞİÖŞÜ]{3}/.test(text)) return text
    return text.split(/(\s+|[.\-/()])/).map((part) => {
      if (!part || !/[A-ZÇĞİÖŞÜ]/.test(part)) return part
      if (KEEP_UPPER.has(part)) return part
      if (KEEP_LOWER.has(part)) return part.toLocaleLowerCase("tr")
      // Türkçe harf içermeyen kelime ASCII yazılmıştır (KLIMA = KLİMA); I'yı ı değil i yap.
      const rest = /[ÇĞİÖŞÜ]/.test(part) ? part.slice(1).toLocaleLowerCase("tr") : part.slice(1).toLowerCase()
      return part.charAt(0) + rest
    }).join("").replace(/^./, (c) => c.toLocaleUpperCase("tr"))
  }
  const toneOf = (e) => AVATAR_TONES[[...`${e.firstName}${e.lastName}`].reduce((t, ch) => t + ch.charCodeAt(0), 0) % AVATAR_TONES.length]

  const SORTERS = {
    sicil: (e) => e.sicil,
    name: (e) => `${e.firstName} ${e.lastName}`,
    unit: (e) => `${e.workplace.name} ${e.department?.name || ""}`,
    start: (e) => String(e.startDate || "").split(".").reverse().join(""),
    since: (e) => String(e.sinceDate || "").split(".").reverse().join("")
  }

  function OrgExplorer({ plan, page = false, actions = null }) {
    const [selected, setSelected] = useState({ type: "group" })
    const [query, setQuery] = useState("")
    const [unitQuery, setUnitQuery] = useState("")
    const [sort, setSort] = useState({ key: null, dir: 1 })
    const [pageNo, setPageNo] = useState(0)
    const detailRef = useRef(null)
    // Ağaç kapalı açılır: yalnız şirketler görünür; birime tıklayınca altı açılır.
    const [opened, setOpened] = useState(() => new Set())
    const toggle = (node) => setOpened((s) => { const n = new Set(s); n.has(node) ? n.delete(node) : n.add(node); return n })
    const select = (next) => {
      setSelected(next); setQuery(""); setPageNo(0)
      if (next.node && next.type !== "department") setOpened((s) => (s.has(next.node) ? s : new Set(s).add(next.node)))
    }
    // Sayfa değişince listenin başına dön (sayfa kaydırması .app-content içinde)
    const goPage = (n) => { setPageNo(n); if (detailRef.current) detailRef.current.scrollIntoView({ block: "start", behavior: "smooth" }) }

    const scope = useMemo(() => {
      if (selected.type === "group") return { title: plan.group.name, type: "Grup", id: plan.group.id, employees: plan.employees }
      const node = selected.node
      if (selected.type === "company") return { title: node.name, type: "Şirket", id: node.id, employees: plan.employees.filter((e) => e.company === node) }
      if (selected.type === "workplace") return { title: node.name, type: "İşyeri", id: node.id, employees: plan.employees.filter((e) => e.workplace === node) }
      return { title: node.name, type: "Departman", id: node.id, employees: node.employees }
    }, [selected, plan])

    const q = query.trim().toLocaleLowerCase("tr")
    const filtered = q ? scope.employees.filter((e) => [e.firstName, e.lastName, e.sicil, e.tc, e.username].join(" ").toLocaleLowerCase("tr").includes(q)) : scope.employees
    const rows = sort.key ? [...filtered].sort((a, b) => SORTERS[sort.key](a).localeCompare(SORTERS[sort.key](b), "tr", { numeric: true }) * sort.dir) : filtered
    const PAGE_SIZE = 25
    const pageCount = page ? Math.max(1, Math.ceil(rows.length / PAGE_SIZE)) : 1
    const curPage = Math.min(pageNo, pageCount - 1)
    const visible = page ? rows.slice(curPage * PAGE_SIZE, curPage * PAGE_SIZE + PAGE_SIZE) : rows.slice(0, 500)
    const pageList = Array.from({ length: pageCount }, (_, i) => i).filter((i) => pageCount <= 7 || i === 0 || i === pageCount - 1 || Math.abs(i - curPage) <= 1)
    const isSel = (type, node) => selected.type === type && selected.node === node
    const showUnit = selected.type !== "department"
    const unitLabel = selected.type === "workplace" ? "Departman" : "İşyeri / Departman"

    // Birim araması: eşleşen birimi ve üst birimlerini gösterir
    const uq = unitQuery.trim().toLocaleLowerCase("tr")
    const hit = (name) => !uq || name.toLocaleLowerCase("tr").includes(uq)
    const tree = plan.companies.map((c) => {
      const workplaces = c.workplaces.map((w) => {
        const departments = hit(w.name) || hit(c.name) ? w.departments : w.departments.filter((d) => hit(d.name))
        return { w, departments, visible: hit(c.name) || hit(w.name) || departments.length > 0 }
      }).filter((x) => x.visible)
      return { c, workplaces, visible: hit(c.name) || workplaces.length > 0 }
    }).filter((x) => x.visible)

    const sortHead = (key, label, col) => h`
      <th className=${`is-sortable col-${col || key}`} aria-sort=${sort.key === key ? (sort.dir > 0 ? "ascending" : "descending") : "none"}>
        <button type="button" onClick=${() => { setPageNo(0); setSort((s) => (s.key === key ? (s.dir > 0 ? { key, dir: -1 } : { key: null, dir: 1 }) : { key, dir: 1 })) }}>
          ${label}<i className=${`sku-sort ${sort.key === key ? (sort.dir > 0 ? "is-asc" : "is-desc") : ""}`}></i>
        </button>
      </th>
    `

    // Seçili birimin başlığı: sağ panelin üstünde; birim bilgileri tek satırda.
    const hero = h`
          <header className="skx-detail-head is-page">
            <span className=${`sku-tile is-${selected.type}`}><${Icon} d=${ICON[selected.type]} size=${17} stroke=${1.8} /></span>
            <div className="skx-detail-title">
              <div className="skx-detail-name">
                <h3 title=${scope.title}>${selected.type === "department" ? scope.title : niceName(scope.title)}</h3>
                <span className=${`sku-type is-${selected.type}`}>${scope.type}</span>
                <span className="sku-idchip" title="Dakika'daki unit ID">Kurum ID <b>${scope.id}</b></span>
              </div>
            </div>
            ${actions ? h`<div className="skx-detail-actions">${actions}</div>` : null}
          </header>
    `

    return h`
      <div className=${`sku-explorer ${page ? "is-page" : ""}`}>
        <nav className="sku-nav-tree" aria-label="Organizasyon yapısı">
          ${page ? h`
            <div className="sku-nav-top">
              <div className="sku-nav-heading">
                <span className="sku-nav-title">Yapı</span>
                <div className="sku-legend" aria-hidden="true">
                  ${["company", "workplace", "department"].map((k) => h`<span key=${k} className=${`is-${k}`} title=${`${plan.counts[k]} ${TYPE_META[k].label.toLocaleLowerCase("tr")}`}><i><${Icon} d=${ICON[k]} size=${10} stroke=${2} /></i><b>${plan.counts[k]}</b>${TYPE_META[k].label}</span>`)}
                </div>
              </div>
              <label className="sku-search is-small"><${Icon} d=${ICON.search} size=${14} /><input value=${unitQuery} onChange=${(e) => setUnitQuery(e.target.value)} placeholder="Şirket, işyeri veya departman ara" />
                ${unitQuery ? h`<button type="button" className="sku-search-clear" aria-label="Aramayı temizle" onClick=${() => setUnitQuery("")}><${Icon} d=${ICON.close} size=${12} /></button>` : null}
              </label>
            </div>
          ` : null}
          <div className="skx-tree" role="tree">
            <${CompactRow} kind="group" label=${plan.group.name} depth=${0} count=${plan.employees.length} active=${selected.type === "group"} onSelect=${() => select({ type: "group" })} title=${plan.group.name} />
            ${tree.map(({ c, workplaces }) => {
              const cOpen = opened.has(c) || !!uq
              return h`
                <${React.Fragment} key=${c.id}>
                  <${CompactRow} kind="company" label=${niceName(c.name)} depth=${1} count=${countEmployees(c)} title=${c.name}
                    active=${isSel("company", c)} open=${workplaces.length ? cOpen : undefined} onToggle=${() => toggle(c)} onSelect=${() => select({ type: "company", node: c })} />
                  ${cOpen ? workplaces.map(({ w, departments }) => {
                    const wOpen = opened.has(w) || !!uq
                    return h`
                      <${React.Fragment} key=${w.id}>
                        <${CompactRow} kind="workplace" label=${niceName(w.name)} depth=${2} count=${countEmployees(w)} title=${w.name}
                          active=${isSel("workplace", w)} open=${departments.length ? wOpen : undefined} onToggle=${() => toggle(w)} onSelect=${() => select({ type: "workplace", node: w })} />
                        ${wOpen ? departments.map((d) => h`
                          <${CompactRow} key=${d.id} kind="department" label=${d.name} depth=${3} count=${d.employees.length} title=${d.name}
                            active=${isSel("department", d)} onSelect=${() => select({ type: "department", node: d })} />
                        `) : null}
                      <//>
                    `
                  }) : null}
                <//>
              `
            })}
            ${tree.length === 0 ? h`<p className="sku-nav-empty">“${unitQuery}” ile eşleşen birim yok.</p>` : null}
          </div>
        </nav>
        <section className="sku-detail" ref=${detailRef}>
          ${hero}
          <div className="sku-toolbar">
            <div className="sku-toolbar-title">
              <span className="sku-toolbar-icon"><${Icon} d=${ICON.employee} size=${15} /></span>
              <b>Çalışanlar</b><em>${q ? `${rows.length} / ${scope.employees.length}` : scope.employees.length}</em>
            </div>
            <label className="sku-search"><${Icon} d=${ICON.search} size=${15} /><input value=${query} onChange=${(e) => { setQuery(e.target.value); setPageNo(0) }} placeholder="Ad, sicil, T.C. veya kullanıcı adı ara" />
              ${query ? h`<button type="button" className="sku-search-clear" aria-label="Aramayı temizle" onClick=${() => { setQuery(""); setPageNo(0) }}><${Icon} d=${ICON.close} size=${12} /></button>` : null}
            </label>
          </div>
          <div className="sku-table-wrap">
            <table className="sku-table">
              <thead><tr>
                ${sortHead("sicil", "Sicil No")}${sortHead("name", "Ad Soyad")}<th className="col-tc">T.C. Kimlik No</th>
                ${showUnit ? sortHead("unit", unitLabel, selected.type === "workplace" ? "dept" : "unit") : null}${sortHead("start", "İşe Giriş")}${sortHead("since", "Since")}
              </tr></thead>
              <tbody>
                ${visible.map((e) => h`
                  <tr key=${e.id}>
                    <td className="sku-id-cell"><span className="is-code">${e.sicil}</span><small title="Çalışan ID">ID ${e.id}</small></td>
                    <td><div className="sku-person"><span className=${`sku-avatar ${toneOf(e)}`}>${(e.firstName[0] || "") + (e.lastName[0] || "")}</span><div><b>${trTitle(e.firstName)} ${trTitle(e.lastName)}</b>${e.position ? h`<small title=${e.position}>${niceName(e.position)}</small>` : null}</div></div></td>
                    <td className="is-code">${e.tc}</td>
                    ${showUnit ? h`<td className="sku-unit-cell">
                      ${selected.type === "workplace" ? h`<span>${e.department?.name || "—"}</span>` : h`<span title=${e.workplace.name}>${niceName(e.workplace.name)}</span>${e.department ? h`<small>${e.department.name}</small>` : null}`}
                    </td>` : null}
                    <td className="is-num">${e.startDate}</td>
                    <td className="is-num" title=${e.username ? `Kullanıcı adı: ${e.username}` : ""}>${e.sinceDate || "—"}</td>
                  </tr>
                `)}
              </tbody>
            </table>
            ${rows.length === 0 ? h`<p className="sku-empty">${q ? "Aramayla eşleşen çalışan yok." : "Bu birimde çalışan yok."}</p>` : null}
          </div>
          <footer className="sku-detail-foot">
            <span>
              ${rows.length ? h`<b>${curPage * (page ? PAGE_SIZE : 0) + 1}–${curPage * (page ? PAGE_SIZE : 0) + visible.length}</b> / ${rows.length} çalışan` : "0 çalışan"}${q ? ` · “${query}” araması` : ""}
              ${sort.key ? h` · <button type="button" className="sku-link" onClick=${() => setSort({ key: null, dir: 1 })}>Sıralamayı sıfırla</button>` : null}
            </span>
            ${pageCount > 1 ? h`
              <nav className="sku-pager" aria-label="Sayfalar">
                <button type="button" disabled=${curPage === 0} onClick=${() => goPage(curPage - 1)} aria-label="Önceki sayfa"><span className="is-flip"><${Icon} d=${ICON.chevron} size=${14} stroke=${2} /></span></button>
                ${pageList.map((i, idx) => h`
                  <${React.Fragment} key=${i}>
                    ${idx && i - pageList[idx - 1] > 1 ? h`<span className="sku-pager-gap">…</span>` : null}
                    <button type="button" className=${i === curPage ? "is-current" : ""} aria-current=${i === curPage ? "page" : undefined} onClick=${() => goPage(i)}>${i + 1}</button>
                  <//>
                `)}
                <button type="button" disabled=${curPage >= pageCount - 1} onClick=${() => goPage(curPage + 1)} aria-label="Sonraki sayfa"><${Icon} d=${ICON.chevron} size=${14} stroke=${2} /></button>
              </nav>
            ` : null}
          </footer>
        </section>
      </div>
    `
  }

  // ---------- Organizasyon Yapısı sayfası (sol menü) ----------

  function OrganizationPage({ companyName, onNavigate }) {
    const [result, setResult] = useState(() => loadSetupResult(companyName))
    useEffect(() => {
      setResult(loadSetupResult(companyName))
      const onUpdate = () => setResult(loadSetupResult(companyName))
      window.addEventListener("sdp-setup-result-updated", onUpdate)
      return () => window.removeEventListener("sdp-setup-result-updated", onUpdate)
    }, [companyName])
    // Aktarım sonucu ekranın altında bildirim olarak görünür; süresi dolunca kayarak kapanır.
    const [flash, setFlash] = useState(null)
    const [flashLeaving, setFlashLeaving] = useState(false)
    const closeFlash = () => setFlashLeaving(true)
    useEffect(() => {
      if (!flash) return undefined
      setFlashLeaving(false)
      const t = setTimeout(closeFlash, TOAST_MS)
      return () => clearTimeout(t)
    }, [flash])
    useEffect(() => {
      if (!flashLeaving) return undefined
      const t = setTimeout(() => { setFlash(null); setFlashLeaving(false) }, 320)
      return () => clearTimeout(t)
    }, [flashLeaving])
    const kit = window.__skApprovedKits?.[companyName]

    if (!result && kit) {
      return h`
        <div className="sku-page">
          <${PageHeader} companyName=${companyName} subtitle="Onaylanan Starter Kit'teki yapıyı ön izleyin, aktarım ayarlarını tamamlayın ve Dakika'ya aktarın." />
          <${SetupWorkspace} kit=${kit} groupName=${companyName} onDone=${(res) => {
            setFlash(res)
            saveSetupResult(companyName, res)
          }} />
        </div>
      `
    }

    if (!result) {
      return h`
        <div className="sku-page">
          <${PageHeader} companyName=${companyName} />
          <div className="sku-page-empty">
            <span className="sku-page-empty-art"><${Icon} d=${ICON.group} size=${28} /></span>
            <h2>Henüz organizasyon yapısı oluşturulmadı</h2>
            <p>Starter Kit onaylandıktan sonra <b>İmplementasyon Süreçleri → Sistem Kurulumu</b> adımındaki <b>Sisteme Aktar</b> ile şirket, işyeri, departman ve çalışanlar tek tuşla oluşturulur; sonuç burada görünür.</p>
            <ol className="sku-page-empty-steps">
              <li><span>1</span>Müşteri Starter Kit'i yükler ve düzeltir</li>
              <li><span>2</span>Uzman Starter Kit'i onaylar</li>
              <li><span>3</span>Sisteme Aktar ile yapı oluşturulur</li>
            </ol>
            ${onNavigate ? h`<button type="button" className="sku-btn primary" onClick=${() => onNavigate("processes")}>İmplementasyon Süreçleri'ne git</button>` : null}
          </div>
        </div>
      `
    }

    const { plan } = result
    return h`
      <div className="sku-page">
        ${flash ? h`
          <div className=${`skx-toast ${flashLeaving ? "is-leaving" : ""}`} role="status" style=${{ "--t": `${TOAST_MS}ms` }}>
            <span className="skx-toast-icon"><${Icon} d=${ICON.check} size=${15} stroke=${2.4} /></span>
            <div><strong>Dakika'ya aktarıldı</strong><span>${flash.counts.company} şirket · ${flash.counts.workplace} işyeri · ${flash.counts.department} departman · ${flash.counts.employee} çalışan · ${flash.elapsed} sn</span></div>
            <button type="button" className="skx-toast-x" aria-label="Kapat" onClick=${closeFlash}><${Icon} d=${ICON.close} size=${14} /></button>
            <i className="skx-toast-timer"></i>
          </div>
        ` : null}
        <${OrgExplorer} plan=${plan} page=${true} actions=${h`
          <span className="sku-live" title=${[result.finishedAt, plan.fileName].filter(Boolean).join(" · ")}><i></i>Sisteme aktarıldı</span>
          <button type="button" className="sku-btn ghost" title="Kurulum sonucunu siler; Starter Kit yeniden yüklenip Sisteme Aktar ile oluşturulabilir"
            onClick=${() => { if (window.confirm(`${companyName} organizasyon yapısı sıfırlansın mı? Starter Kit'i yeniden yükleyip Sisteme Aktar ile tekrar oluşturabilirsiniz.`)) clearSetupResult(companyName) }}>Sıfırla</button>
          <button type="button" className="sku-btn" onClick=${() => downloadResult(plan)}><${Icon} d=${ICON.download} /> Listeyi indir</button>
        `} />
      </div>
    `
  }

  function PageHeader({ companyName, subtitle }) {
    return h`
      <header className="sku-page-head">
        <div>
          <div className="sku-page-eyebrow">İmplementasyon · ${companyName || "Firma"}</div>
          <h1>Organizasyon Yapısı</h1>
          <p>${subtitle || "Starter Kit'ten oluşturulan grup, şirket, işyeri, departman ve çalışanlar."}</p>
        </div>
      </header>
    `
  }

  window.StarterKitSetupLauncher = StarterKitSetupLauncher
  window.StarterKitSetupLauncher.buildSetupPlan = buildSetupPlan
  window.OrganizationPage = OrganizationPage
})()
