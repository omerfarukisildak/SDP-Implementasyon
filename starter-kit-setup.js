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
  const SGK_WORKPLACE_DIGITS = 26

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
  const formatPhone = (p) => (p ? `+${p.countryCode} ${p.number.replace(/^(\d{3})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4")}` : "")

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
    const warnings = []
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

    // Kontrol notları
    if (besRequired) {
      companies.filter((c) => c.bes && !c.bes.date && countEmployees(c) > 0).forEach((c) => {
        warnings.push({ level: "warn", text: `“${c.name}” şirketinde ${countEmployees(c)} çalışan var; BES tablosu 5 çalışandan başlıyor. BES başlangıç tarihi boş bırakılacak, uzmanla netleştirin.` })
      })
    }
    companies.forEach((company) => {
      if (company.fromPersonnel) warnings.push({ level: "warn", text: `“${company.name}” Şirket Bilgi sayfasında yok; personel kayıtlarından oluşturulacak.` })
      const count = company.workplaces.reduce((t, w) => t + countEmployees(w), 0)
      if (count === 0) warnings.push({ level: "info", text: `“${company.name}” şirketinde çalışan yok; şirket ve işyerleri yine de oluşturulacak.` })
      company.workplaces.forEach((workplace) => {
        const sgkDigits = workplace.sgkNo.replace(/\D/g, "").length
        if (!workplace.fromPersonnel && sgkDigits !== SGK_WORKPLACE_DIGITS) warnings.push({ level: "warn", text: `“${workplace.name}” işyeri SGK numarası ${sgkDigits ? `${sgkDigits} haneli` : "boş"}; ${SGK_WORKPLACE_DIGITS} hane olmalı.` })
        if (workplace.fromPersonnel) warnings.push({ level: "warn", text: `“${workplace.name}” işyeri İşyeri Bilgi sayfasında yok; personel kayıtlarından ${company.name} altına oluşturulacak.` })
        const deps = workplace.departments
        for (let i = 0; i < deps.length; i++) {
          for (let j = i + 1; j < deps.length; j++) {
            const a = norm(deps[i].name)
            const b = norm(deps[j].name)
            if (a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a))) {
              warnings.push({ level: "info", text: `${workplace.name} altında “${deps[i].name}” ve “${deps[j].name}” departmanları birbirine çok benziyor; ayrı departman olarak oluşturulacak.` })
            }
          }
        }
      })
    })

    const workplaces = companies.flatMap((c) => c.workplaces)
    const departments = workplaces.flatMap((w) => w.departments)
    return {
      group: { type: "group", name: groupName || "Firma Grubu", existing: true },
      companies, workplaces, departments, employees, warnings, besRequired,
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

  // compact: belge tablosunun Aktarım sütunundaki tek satırlık hali (dosya hücresini genişletmez).
  function StarterKitSetupLauncher({ file, groupName, compact = false }) {
    const [open, setOpen] = useState(false)
    const [result, setResult] = useState(() => loadSetupResult(groupName))
    useEffect(() => {
      const onUpdate = () => setResult(loadSetupResult(groupName))
      window.addEventListener("sdp-setup-result-updated", onUpdate)
      return () => window.removeEventListener("sdp-setup-result-updated", onUpdate)
    }, [groupName])
    function handleDone(res) {
      saveSetupResult(groupName, res)
      setResult(res)
    }
    const modal = open ? h`<${StarterKitSetupModal} file=${file} groupName=${groupName} initialResult=${result} onDone=${handleDone} onClose=${() => setOpen(false)} />` : null
    if (compact) {
      return h`
        <div className=${`sku-launch-compact ${result ? "is-done" : ""}`}>
          <button type="button" className="sku-launch-btn" onClick=${() => setOpen(true)}
            title=${result ? `${result.counts.company} şirket · ${result.counts.workplace} işyeri · ${result.counts.department} departman · ${result.counts.employee} çalışan` : "Şirket, işyeri, departman ve çalışanları tek tuşla oluşturun."}>
            <${Icon} d=${result ? ICON.check : ICON.spark} size=${13} stroke=${2} />${result ? "Aktarıldı · Sonuçlar" : "Sisteme Aktar"}
          </button>
        </div>
        ${modal}
      `
    }
    return h`
      <div className=${`sku-launch ${result ? "is-done" : ""}`}>
        <span className="sku-launch-icon"><${Icon} d=${result ? ICON.check : ICON.spark} size=${15} stroke=${2} /></span>
        <div className="sku-launch-text">
          <strong>${result ? "Sisteme aktarıldı" : "Sisteme aktarmaya hazır"}</strong>
          <span>${result
            ? `${result.counts.company} şirket · ${result.counts.workplace} işyeri · ${result.counts.department} departman · ${result.counts.employee} çalışan`
            : "Şirket, işyeri, departman ve çalışanları tek tuşla oluşturun."}</span>
        </div>
        <button type="button" className="sku-launch-btn" onClick=${() => setOpen(true)}>${result ? "Sonuçları Gör" : "Sisteme Aktar"}</button>
      </div>
      ${modal}
    `
  }

  function StarterKitSetupModal({ file, groupName, initialResult, onDone, onClose }) {
    const [phase, setPhase] = useState(initialResult ? "done" : "loading")
    const [plan, setPlan] = useState(initialResult?.plan || null)
    const [error, setError] = useState("")
    const [progress, setProgress] = useState(initialResult?.progress || {})
    const [activeStep, setActiveStep] = useState(null)
    const [log, setLog] = useState([])
    const [elapsed, setElapsed] = useState(initialResult?.elapsed || 0)
    const [result, setResult] = useState(initialResult || null)
    const cancelRef = useRef(false)

    useEffect(() => {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = prev; cancelRef.current = true }
    }, [])

    function loadBuffer(buffer, name) {
      try {
        const parsed = window.StarterKitSheetEditor.helpers.parseWorkbook(buffer)
        if (!parsed.schema.personal) throw new Error("schema")
        const next = buildSetupPlan(parsed, groupName)
        setTimeout(() => { setPlan({ ...next, fileName: name }); setPhase("plan") }, 900)
      } catch (_) {
        setError("Dosya okunamadı veya Starter Kit şablonuna uygun değil.")
        setPhase("source")
      }
    }

    useEffect(() => {
      if (initialResult) return
      const url = file?.downloadUrl
      if (!url || !/^blob:|^https?:/.test(url)) { setPhase("source"); return }
      fetch(url).then((r) => r.arrayBuffer()).then((buf) => loadBuffer(buf, file.name)).catch(() => setPhase("source"))
    }, [])

    function pickFile(e) {
      const f = e.target.files?.[0]
      e.target.value = ""
      if (!f) return
      setError("")
      setPhase("loading")
      f.arrayBuffer().then((buf) => loadBuffer(buf, f.name))
    }

    async function run({ sinceIso, manufacturing }) {
      plan.sinceIso = sinceIso
      plan.workplaces.forEach((w) => { w.manufacturing = manufacturing.has(w) })
      setPhase("running")
      setLog([])
      cancelRef.current = false
      const started = Date.now()
      const timer = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 250)
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
      let nextId = 118752100 + Math.floor(Math.random() * 800)
      const created = []
      const push = (entry) => setLog((l) => [{ id: `${entry.kind}-${nextId}-${l.length}`, at: Date.now() - started, ...entry }, ...l].slice(0, 300))
      const bump = (key, done) => setProgress((p) => ({ ...p, [key]: done }))
      const taken = new Set()

      const stepRun = async (key, items, fn) => {
        setActiveStep(key)
        bump(key, 0)
        for (let i = 0; i < items.length; i++) {
          if (cancelRef.current) return false
          await wait(STEP_DELAY[key])
          fn(items[i], i)
          bump(key, i + 1)
        }
        return true
      }

      setActiveStep("group")
      plan.group.id = 118751544 + 200 + (groupName || "").length
      await wait(500)
      bump("group", 1)
      push({ kind: "group", text: `${plan.group.name} grubu bulundu`, sub: "Firma açılışında oluşturulmuştu" })

      await stepRun("company", plan.companies, (c) => {
        c.id = nextId++
        c.parentId = plan.group.id
        created.push(c)
        const other = [c.tradeRegNo && "ticaret sicil no", c.mersisNo && "Mersis", c.phone && "telefon"].filter(Boolean)
        push({ kind: "company", text: c.name, sub: `Şirket · ID ${c.id} · ${plan.group.name} altına${other.length ? ` · Diğer: ${other.join(", ")}` : ""}` })
      })
      await stepRun("workplace", plan.workplaces, (w) => {
        w.id = nextId++
        w.parentId = w.company.id
        push({ kind: "workplace", text: w.name, sub: `İşyeri · ID ${w.id} · ${w.company.name}${w.manufacturing ? " · imalat sektörü işveren" : ""}${w.sgkUser ? " · SGK bilgileri" : ""}${w.iskurUser ? " · İŞKUR bilgileri" : ""}` })
      })
      await stepRun("bes", plan.besRequired ? plan.companies : [], (c) => {
        push({ kind: "bes", text: c.name, sub: c.bes.date ? `Zorunlu BES aktif · başlangıç ${c.bes.date} · ${c.bes.count} çalışan` : `Zorunlu BES aktif · başlangıç tarihi boş (${c.bes.count} çalışan)` })
      })
      await stepRun("department", plan.departments, (d) => {
        d.id = nextId++
        d.parentId = d.workplace.id
        push({ kind: "department", text: d.name, sub: `Departman · ID ${d.id} · ${d.workplace.name}` })
      })
      await stepRun("employee", plan.employees, (e) => {
        e.id = nextId++
        e.unitId = (e.department || e.workplace).id
        e.username = slugUser(e.firstName, e.lastName, taken)
        e.sinceDate = fromIsoDate(sinceFor(e, sinceIso))
        push({ kind: "employee", text: `${e.firstName} ${e.lastName}`, sub: `Çalışan · ${e.username} · ${(e.department || e.workplace).name}` })
      })
      setActiveStep("values")
      bump("values", 0)
      const chunk = Math.max(1, Math.ceil(plan.employees.length / 6))
      for (let i = 0; i < plan.employees.length; i += chunk) {
        if (cancelRef.current) break
        await wait(STEP_DELAY.values / 6)
        bump("values", Math.min(plan.employees.length, i + chunk))
      }
      push({ kind: "values", text: "Ücret, banka, SGK bilgileri ve since tarihi yazıldı", sub: `${plan.employees.length} çalışan · since ${fromIsoDate(sinceIso)} · toplu değer güncelleme` })

      clearInterval(timer)
      const total = Math.max(1, Math.round((Date.now() - started) / 1000))
      setElapsed(total)
      setActiveStep(null)
      const res = { plan, counts: plan.counts, elapsed: total, progress: { ...plan.counts }, finishedAt: new Date().toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }) }
      setResult(res)
      setPhase("done")
      onDone?.(res)
    }

    function requestClose() {
      if (phase === "running" && !window.confirm("Kurulum devam ediyor. Kapatırsanız işlem yarıda kalır. Kapatmak istiyor musunuz?")) return
      onClose()
    }

    const content = h`
      <div className="sku-backdrop" onMouseDown=${(e) => { if (e.target === e.currentTarget) requestClose() }}>
        <div className="sku-root" role="dialog" aria-modal="true" aria-label="Starter Kit'ten sistem kurulumu">
          <header className="sku-top">
            <span className="sku-mark"><${Icon} d=${ICON.group} size=${18} /></span>
            <div className="sku-top-text">
              <strong>Sistem Kurulumu</strong>
              <span>${groupName || "Firma"} · ${plan?.fileName || file?.name || "Starter Kit"}</span>
            </div>
            <ol className="sku-phases" aria-label="Aşamalar">
              ${[["plan", "Ön izleme"], ["running", "Oluşturma"], ["done", "Sonuç"]].map(([key, label], i) => {
                const order = { source: 0, loading: 0, plan: 0, running: 1, done: 2 }[phase]
                return h`<li key=${key} className=${i < order ? "is-done" : i === order ? "is-active" : ""}><span>${i < order ? h`<${Icon} d=${ICON.check} size=${11} stroke=${2.6} />` : i + 1}</span>${label}</li>`
              })}
            </ol>
            <button type="button" className="sku-close" aria-label="Kapat" onClick=${requestClose}><${Icon} d=${ICON.close} size=${18} /></button>
          </header>
          ${phase === "loading" ? h`<${LoadingView} />`
            : phase === "source" ? h`<${SourceView} error=${error} onPick=${pickFile} />`
            : phase === "plan" ? h`<${PlanView} plan=${plan} onRun=${run} onCancel=${onClose} />`
            : phase === "running" ? h`<${RunningView} plan=${plan} progress=${progress} activeStep=${activeStep} log=${log} elapsed=${elapsed} />`
            : h`<${DoneView} result=${result} onClose=${onClose} />`}
        </div>
      </div>
    `
    return ReactDOM.createPortal(content, document.body)
  }

  function LoadingView() {
    return h`
      <div className="sku-center">
        <span className="sku-spinner"></span>
        <strong>Starter Kit okunuyor</strong>
        <p>Şirket, işyeri, departman ve çalışan bilgileri çıkarılıyor…</p>
      </div>
    `
  }

  function SourceView({ error, onPick }) {
    return h`
      <div className="sku-center">
        <span className="sku-center-icon"><${Icon} d=${ICON.upload} size=${22} /></span>
        <strong>Onaylanan Starter Kit dosyasını seçin</strong>
        <p>${error || "Kurulum, onaylanan Starter Kit dosyasındaki verilerle yapılır."}</p>
        <label className="sku-btn primary">
          <input type="file" accept=".xls,.xlsx" hidden onChange=${onPick} />
          <${Icon} d=${ICON.upload} /> Dosya Seç
        </label>
      </div>
    `
  }

  function PlanView({ plan, onRun, onCancel }) {
    const [open, setOpen] = useState(() => new Set(plan.companies.map((c) => c.name)))
    const toggle = (key) => setOpen((s) => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n })
    const [since, setSince] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01` })
    const [manufacturing, setManufacturing] = useState(() => new Set())
    const toggleMfg = (w) => setManufacturing((s) => { const n = new Set(s); n.has(w) ? n.delete(w) : n.add(w); return n })
    const lateStarters = since ? plan.employees.filter((e) => toIsoDate(e.startDate) > since) : []
    const totalMs = plan.counts.company * STEP_DELAY.company + plan.counts.workplace * STEP_DELAY.workplace + plan.counts.bes * STEP_DELAY.bes + plan.counts.department * STEP_DELAY.department + plan.counts.employee * STEP_DELAY.employee + STEP_DELAY.values + 500
    return h`
      <div className="sku-body">
        <div className="sku-intro">
          <h2>Starter Kit'e göre oluşturulacak yapı</h2>
          <p>Aşağıdaki kayıtlar onaylanan Starter Kit'ten çıkarıldı. Kontrol edip <b>Tümünü Oluştur</b> dediğinizde Dakika'daki toplu aktarım adımları sırasıyla otomatik çalışır.</p>
        </div>
        <div className="sku-kpis">
          ${["group", "company", "workplace", "department", "employee"].map((key) => h`
            <div key=${key} className=${`sku-kpi is-${key}`}>
              <span className="sku-kpi-icon"><${Icon} d=${ICON[key]} size=${16} /></span>
              <strong>${plan.counts[key]}</strong>
              <span>${TYPE_META[key].label}${key === "group" ? " · mevcut" : ""}</span>
            </div>
          `)}
        </div>
        <div className="sku-plan-grid">
          <section className="sku-card">
            <header><strong>Organizasyon yapısı</strong><span>${plan.group.name}</span></header>
            <div className="sku-tree">
              <div className="sku-tree-row is-group"><${Icon} d=${ICON.group} size=${15} /><b>${plan.group.name}</b><em>Grup · mevcut</em></div>
              ${plan.companies.map((c) => {
                const isOpen = open.has(c.name)
                return h`
                  <div key=${c.name} className="sku-tree-branch">
                    <button type="button" className="sku-tree-row is-company" onClick=${() => toggle(c.name)}>
                      <span className=${`sku-caret ${isOpen ? "is-open" : ""}`}><${Icon} d=${ICON.chevron} size=${13} /></span>
                      <${Icon} d=${ICON.company} size=${15} /><b>${c.name}</b>
                      ${c.fromPersonnel ? h`<i className="sku-flag">yeni</i>` : null}
                      <em>${c.workplaces.length} işyeri · ${countEmployees(c)} çalışan</em>
                    </button>
                    ${isOpen ? c.workplaces.map((w) => h`
                      <div key=${w.name} className="sku-tree-sub">
                        <div className="sku-tree-row is-workplace">
                          <${Icon} d=${ICON.workplace} size=${14} /><b>${w.name}</b>
                          ${w.fromPersonnel ? h`<i className="sku-flag">sayfada yok</i>` : null}
                          <em>${w.departments.length} departman · ${countEmployees(w)} çalışan</em>
                        </div>
                        ${w.departments.length ? h`
                          <div className="sku-chips">
                            ${w.departments.map((d) => h`<span key=${d.name} className="sku-chip">${d.name}<em>${d.employees.length}</em></span>`)}
                          </div>
                        ` : null}
                      </div>
                    `) : null}
                  </div>
                `
              })}
            </div>
          </section>
          <div className="sku-side">
            <section className="sku-card">
              <header><strong>Aktarım ayarları</strong><span>Dakika'ya yazılmadan önce</span></header>
              <div className="sku-settings">
                <label className="sku-field">
                  <span>Since tarihi</span>
                  <input type="date" value=${since} onChange=${(e) => setSince(e.target.value)} />
                </label>
                <p className="sku-hint">
                  ${lateStarters.length
                    ? h`<b>${lateStarters.length} çalışan</b> bu tarihten sonra işe girdiği için kendi işe giriş tarihiyle aktarılır.`
                    : "Tüm çalışanlar bu tarihle aktarılır. Bu tarihten sonra işe giren olursa kendi işe giriş tarihinde kalır."}
                </p>
              </div>
              <div className="sku-settings">
                <div className="sku-settings-head"><span>İmalat sektörü kontrolü</span>
                  <a className="sku-link" href=${EBILDIRGE_URL} target="_blank" rel="noopener noreferrer">e-Bildirge'yi aç ↗</a></div>
                <p className="sku-hint">e-Bildirge V2 → Onaylanmış Belgeler → Kanun No 5510 detayında prim indirimi <b>%5</b> ise imalat, <b>%2</b> ise değildir. Kontrol ettiğiniz işyerini işaretleyin; Dakika'da <b>İmalat Sektörü İşveren</b> tiklenir.</p>
                <ul className="sku-checks">
                  ${plan.workplaces.map((w) => h`
                    <li key=${`${w.company.name}|${w.name}`}>
                      <label>
                        <input type="checkbox" checked=${manufacturing.has(w)} onChange=${() => toggleMfg(w)} />
                        <span><b title=${w.name}>${w.name}</b><small>${w.company.name}${w.manufacturingClaim ? ` · Starter Kit: ${w.manufacturingClaim}` : ""}</small></span>
                      </label>
                    </li>
                  `)}
                </ul>
              </div>
              <div className="sku-settings">
                <div className="sku-settings-head"><span>Zorunlu BES</span><em>${plan.besRequired ? "Grup BES'e tabi" : "Tabi değil"}</em></div>
                ${plan.besRequired ? h`
                  <ul className="sku-bes">
                    ${plan.companies.map((c) => h`
                      <li key=${c.name}><span title=${c.name}>${c.name}</span><small>${c.bes.count} çalışan</small><b className=${c.bes.date ? "" : "is-empty"}>${c.bes.date || "Tarih yok"}</b></li>
                    `)}
                  </ul>
                ` : h`<p className="sku-hint">Kişisel Bilgi sayfasında zorunlu BES'e tabi çalışan yok; BES tanımı yapılmaz.</p>`}
              </div>
            </section>
            <section className="sku-card">
              <header><strong>Oluşturma sırası</strong><span>Dakika toplu aktarım adımları</span></header>
              <ol className="sku-order">
                ${SETUP_STEPS.map((s, i) => h`
                  <li key=${s.key}>
                    <span className="sku-order-num">${i + 1}</span>
                    <div><b>${s.title}</b><small>${s.tool} · ${s.source}</small></div>
                    <em>${s.key === "group" ? "mevcut" : s.key === "bes" && !plan.besRequired ? "yok" : plan.counts[s.key]}</em>
                  </li>
                `)}
              </ol>
            </section>
            ${plan.warnings.length ? h`
              <section className="sku-card">
                <header><strong>Kontrol notları</strong><span>${plan.warnings.length} not · kurulumu engellemez</span></header>
                <ul className="sku-notes">
                  ${plan.warnings.map((w, i) => h`<li key=${i} className=${`is-${w.level}`}><${Icon} d=${w.level === "warn" ? ICON.alert : ICON.info} size=${15} /><span>${w.text}</span></li>`)}
                </ul>
              </section>
            ` : null}
          </div>
        </div>
      </div>
      <footer className="sku-foot">
        <p>Tahmini süre: <b>${Math.max(5, Math.round(totalMs / 1000))} saniye</b> · Kayıtlar oluşturulduktan sonra çalışanlara kullanıcı adları atanır.</p>
        <div>
          <button type="button" className="sku-btn" onClick=${onCancel}>Vazgeç</button>
          <button type="button" className="sku-btn primary" disabled=${!since} onClick=${() => onRun({ sinceIso: since, manufacturing })}><${Icon} d=${ICON.spark} /> Tümünü Oluştur</button>
        </div>
      </footer>
    `
  }

  function RunningView({ plan, progress, activeStep, log, elapsed }) {
    const totals = plan.counts
    const weights = { group: 1, company: 3, workplace: 3, bes: plan.besRequired ? 1 : 0, department: 4, employee: 10, values: 3 }
    const sumW = Object.values(weights).reduce((a, b) => a + b, 0)
    const pct = Math.round(SETUP_STEPS.reduce((t, s) => t + weights[s.key] * Math.min(1, (progress[s.key] || 0) / Math.max(1, totals[s.key])), 0) / sumW * 100)
    const current = SETUP_STEPS.find((s) => s.key === activeStep)
    return h`
      <div className="sku-body sku-run">
        <div className="sku-run-head">
          <div className="sku-ring" style=${{ "--p": pct }}><span>%${pct}</span></div>
          <div>
            <h2>Kurulum yapılıyor</h2>
            <p>${current ? h`<b>${current.title}</b> oluşturuluyor · ${current.tool}` : "Hazırlanıyor"}</p>
            <small>Geçen süre ${elapsed} sn · Pencereyi kapatmayın</small>
          </div>
        </div>
        <div className="sku-run-grid">
          <ol className="sku-steps">
            ${SETUP_STEPS.map((s) => {
              const done = progress[s.key] || 0
              const total = totals[s.key] || 0
              const state = s.key === activeStep ? "is-active" : done >= total && progress[s.key] != null ? "is-done" : ""
              return h`
                <li key=${s.key} className=${state}>
                  <span className="sku-step-dot">${state === "is-done" ? h`<${Icon} d=${ICON.check} size=${12} stroke=${2.6} />` : h`<${Icon} d=${ICON[s.key]} size=${13} />`}</span>
                  <div className="sku-step-main">
                    <div className="sku-step-top"><b>${s.title}</b><em>${s.key === "group" ? (done ? "mevcut" : "") : `${done} / ${total}`}</em></div>
                    <div className="sku-step-bar"><span style=${{ width: `${total ? Math.round((done / total) * 100) : 0}%` }}></span></div>
                  </div>
                </li>
              `
            })}
          </ol>
          <section className="sku-log">
            <header><strong>İşlem kaydı</strong><span>${log.length} kayıt</span></header>
            <ul>
              ${log.slice(0, 80).map((l) => h`
                <li key=${l.id} className=${`is-${l.kind}`}>
                  <span className="sku-log-icon"><${Icon} d=${ICON[l.kind] || ICON.check} size=${13} /></span>
                  <div><b>${l.text}</b><small>${l.sub}</small></div>
                  <time>${(l.at / 1000).toFixed(1)} sn</time>
                </li>
              `)}
            </ul>
          </section>
        </div>
      </div>
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
    const plan = { group: { ...raw.group, type: "group", existing: true }, sinceIso: raw.sinceIso, besRequired: raw.besRequired, companies, workplaces, departments: workplaces.flatMap((w) => w.departments), employees, warnings: [], counts: raw.counts, fileName: raw.fileName }
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
    const aoa = [["Sicil No", "Adı", "Soyadı", "T.C. Kimlik No", "Şirket", "İşyeri", "Departman", "Birim ID", "Çalışan ID", "Kullanıcı Adı", "İşe Giriş", "Since Tarihi"]]
    plan.employees.forEach((e) => aoa.push([e.sicil, e.firstName, e.lastName, e.tc, e.company.name, e.workplace.name, e.department?.name || "", e.unitId, e.id, e.username, e.startDate, e.sinceDate || ""]))
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws["!cols"] = aoa[0].map((_, i) => ({ wch: [14, 16, 16, 14, 34, 28, 14, 12, 12, 20, 12, 12][i] }))
    const units = [["Şirket", "İşyeri", "Birim ID", "Ticari Ünvan", "Ticaret Sicil No", "Mersis No", "Telefon Ülke Kodu", "Telefon", "BES Başlangıç", "İşyeri SGK No", "İmalat Sektörü İşveren", "SGK Sistem Kullanıcı Adı", "SGK Sistem Kullanıcı Kodu", "SGK Sistem Şifresi", "SGK İşyeri Şifresi", "İŞKUR Kullanıcı Adı", "İŞKUR Şifresi"]]
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
    start: (e) => String(e.startDate || "").split(".").reverse().join("")
  }

  function TreeRow({ kind, name, sub, count, active, open, onToggle, onSelect }) {
    const hasCaret = open !== undefined
    const label = kind === "department" ? name : niceName(name)
    return h`
      <div className=${`sku-trow is-${kind} ${active ? "is-active" : ""}`}>
        <button type="button" className="sku-trow-main" title=${name} aria-current=${active ? "true" : undefined} onClick=${onSelect}>
          <span className="sku-tile"><${Icon} d=${ICON[kind]} size=${kind === "department" ? 12 : kind === "workplace" ? 14 : 15} stroke=${1.8} /></span>
          <span className="sku-trow-text"><b>${label}</b>${sub ? h`<small>${sub}</small>` : null}</span>
          <span className="sku-tcount" title=${`${count} çalışan`}>${kind === "group" ? h`<${Icon} d=${ICON.person} size=${11} stroke=${2} />` : null}${count}</span>
        </button>
        ${kind === "company" || kind === "workplace" ? h`
          <button type="button" className=${`sku-tcaret ${open ? "is-open" : ""} ${hasCaret ? "" : "is-hidden"}`} tabIndex=${hasCaret ? 0 : -1}
            aria-label=${open ? "Daralt" : "Genişlet"} aria-expanded=${hasCaret ? !!open : undefined} onClick=${hasCaret ? onToggle : undefined}>
            <${Icon} d=${ICON.chevron} size=${12} stroke=${2.2} />
          </button>
        ` : null}
      </div>
    `
  }

  function OrgExplorer({ plan, page = false, actions = null }) {
    const [selected, setSelected] = useState({ type: "group" })
    const [query, setQuery] = useState("")
    const [unitQuery, setUnitQuery] = useState("")
    const [sort, setSort] = useState({ key: null, dir: 1 })
    const [pageNo, setPageNo] = useState(0)
    const detailRef = useRef(null)
    // Sayfada ağaç kaydırmasız sığsın diye aynı anda tek şirket açık kalır
    const [open, setOpen] = useState(() => new Set(page ? plan.companies.slice(0, 1).map((c) => c.id) : plan.companies.map((c) => c.id)))
    const toggle = (id) => setOpen((s) => {
      if (page) return s.has(id) ? new Set() : new Set([id])
      const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n
    })
    const [closedWp, setClosedWp] = useState(() => new Set())
    const toggleWp = (id) => setClosedWp((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
    const companyOf = (sel) => (sel.type === "company" ? sel.node : sel.type === "workplace" ? sel.node.company : sel.type === "department" ? sel.node.workplace.company : null)
    const select = (next) => {
      setSelected(next); setQuery(""); setPageNo(0)
      const c = companyOf(next)
      if (page && c) setOpen(new Set([c.id]))
    }
    // Sayfa değişince listenin başına dön (sayfa kaydırması .app-content içinde)
    const goPage = (n) => { setPageNo(n); if (detailRef.current) detailRef.current.scrollIntoView({ block: "start", behavior: "smooth" }) }

    const scope = useMemo(() => {
      const groupCrumb = { label: plan.group.name, sel: { type: "group" } }
      const deptCount = (c) => c.workplaces.reduce((t, w) => t + w.departments.length, 0)
      const stat = (kind, value, label) => ({ kind, value, label: label || TYPE_META[kind].label })
      if (selected.type === "group") {
        return { title: plan.group.name, type: "Grup", id: plan.group.id, crumbs: [], employees: plan.employees, facts: [],
          stats: [stat("company", plan.companies.length), stat("workplace", plan.workplaces.length), stat("department", plan.departments.length), stat("employee", plan.employees.length)],
          childLabel: "Şirketler",
          children: plan.companies.map((c) => ({ key: c.id, label: c.name, count: countEmployees(c), sub: `${c.workplaces.length} işyeri · ${deptCount(c)} departman`, sel: { type: "company", node: c }, kind: "company" })) }
      }
      const node = selected.node
      if (selected.type === "company") {
        return { title: node.name, type: "Şirket", id: node.id, crumbs: [groupCrumb], employees: plan.employees.filter((e) => e.company === node),
          facts: [["Ticari unvan", node.title || "—"], ["Ticaret sicil no", node.tradeRegNo || "—"], ["Vergi No", node.taxNo || "—"], ["Mersis No", node.mersisNo || "—"],
            ["Telefon", formatPhone(node.phone) || "—"], ...(node.bes ? [["BES başlangıç", node.bes.date || "Tarih yok"]] : [])],
          stats: [stat("workplace", node.workplaces.length), stat("department", deptCount(node)), stat("employee", countEmployees(node))],
          childLabel: "İşyerleri",
          children: node.workplaces.map((w) => ({ key: w.id, label: w.name, count: countEmployees(w), sub: `${w.departments.length} departman`, sel: { type: "workplace", node: w }, kind: "workplace" })) }
      }
      if (selected.type === "workplace") {
        return { title: node.name, type: "İşyeri", id: node.id, crumbs: [groupCrumb, { label: node.company.name, sel: { type: "company", node: node.company } }], employees: plan.employees.filter((e) => e.workplace === node),
          facts: [["SGK işyeri no", node.sgkNo || "—"], ["Adres", node.address || "—"], ["İmalat sektörü", node.manufacturing ? "Evet" : "Hayır"],
            ["SGK kullanıcı adı", node.sgkUser || "—"], ["SGK kullanıcı kodu", node.sgkUserCode || "—"], ["SGK sistem şifresi", node.sgkPassword || "—"], ["SGK işyeri şifresi", node.sgkWorkplacePassword || "—"],
            ["İŞKUR kullanıcı adı", node.iskurUser || "—"], ["İŞKUR şifresi", node.iskurPassword || "—"]],
          stats: [stat("department", node.departments.length), stat("employee", countEmployees(node))],
          childLabel: "Departmanlar",
          children: node.departments.map((d) => ({ key: d.id, label: d.name, count: d.employees.length, sub: "Departman", sel: { type: "department", node: d }, kind: "department" })) }
      }
      const wpTotal = countEmployees(node.workplace)
      return { title: node.name, type: "Departman", id: node.id,
        crumbs: [groupCrumb, { label: node.workplace.company.name, sel: { type: "company", node: node.workplace.company } }, { label: node.workplace.name, sel: { type: "workplace", node: node.workplace } }],
        employees: node.employees, facts: [["Şirket", node.workplace.company.name], ["İşyeri", node.workplace.name]],
        stats: [stat("employee", node.employees.length), stat("workplace", wpTotal ? `%${Math.round((node.employees.length / wpTotal) * 100)}` : "—", "İşyerindeki payı")],
        childLabel: "", children: [] }
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

    const hero = h`
          <header className=${`sku-detail-head sku-hero is-${selected.type}`}>
            <div className="sku-hero-top">
              <span className=${`sku-tile is-lg is-${selected.type}`}><${Icon} d=${ICON[selected.type]} size=${22} stroke=${1.7} /></span>
              <div className="sku-detail-title">
                ${scope.crumbs.length ? h`
                  <div className="sku-crumbs">
                    ${scope.crumbs.map((c, i) => h`<${React.Fragment} key=${i}>${i ? h`<${Icon} d=${ICON.chevron} size=${11} />` : null}<button type="button" title=${c.label} onClick=${() => select(c.sel)}>${niceName(c.label)}</button><//>`)}
                  </div>
                ` : null}
                <h3 title=${scope.title}>${selected.type === "department" ? scope.title : niceName(scope.title)}</h3>
                <div className="sku-detail-meta"><span className=${`sku-type is-${selected.type}`}>${scope.type}</span><span className="sku-idchip">Birim ID <b>${scope.id}</b></span></div>
              </div>
              ${actions ? h`<div className="sku-hero-actions">${actions}</div>` : null}
            </div>
            ${page ? h`
              <div className="sku-hero-stats" style=${{ "--n": scope.stats.length }}>
                ${scope.stats.map((st) => h`
                  <div key=${st.label} className=${`sku-hstat is-${st.kind}`}>
                    <span className="sku-tile"><${Icon} d=${ICON[st.kind]} size=${15} stroke=${1.8} /></span>
                    <div><strong>${st.value}</strong><span>${st.label}</span></div>
                  </div>
                `)}
              </div>
              ${scope.facts.length ? h`
                <dl className="sku-hero-facts">
                  ${scope.facts.map(([k, v]) => h`<div key=${k}><dt>${k}</dt><dd title=${String(v)}>${v}</dd></div>`)}
                </dl>
              ` : null}
            ` : h`<div className="sku-detail-meta"><span><b>${scope.employees.length}</b> çalışan</span></div>`}
          </header>
    `

    return h`
      <div className=${`sku-explorer ${page ? "is-page" : ""}`}>
        ${page ? hero : null}
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
          <div className="sku-nav-list">
            <${TreeRow} kind="group" name=${plan.group.name} count=${plan.employees.length}
              active=${selected.type === "group"} onSelect=${() => select({ type: "group" })} />
            <div className="sku-tchildren">
              ${tree.map(({ c, workplaces }) => {
                const cOpen = open.has(c.id) || !!uq
                return h`
                  <div key=${c.id} className="sku-titem">
                    <${TreeRow} kind="company" name=${c.name} count=${countEmployees(c)}
                      active=${isSel("company", c)} open=${workplaces.length ? cOpen : undefined} onToggle=${() => toggle(c.id)} onSelect=${() => select({ type: "company", node: c })} />
                    ${cOpen && workplaces.length ? h`
                      <div className="sku-tchildren">
                        ${workplaces.map(({ w, departments }) => {
                          const wOpen = !closedWp.has(w.id) || !!uq
                          return h`
                            <div key=${w.id} className="sku-titem">
                              <${TreeRow} kind="workplace" name=${w.name} count=${countEmployees(w)}
                                active=${isSel("workplace", w)} open=${departments.length ? wOpen : undefined} onToggle=${() => toggleWp(w.id)} onSelect=${() => select({ type: "workplace", node: w })} />
                              ${wOpen && departments.length ? h`
                                <div className="sku-dchips">
                                  ${departments.map((d) => h`
                                    <button key=${d.id} type="button" title=${`${d.name} · ${d.employees.length} çalışan`} aria-current=${isSel("department", d) ? "true" : undefined}
                                      className=${`sku-dchip ${isSel("department", d) ? "is-active" : ""}`} onClick=${() => select({ type: "department", node: d })}>
                                      <span>${d.name}</span><em>${d.employees.length}</em>
                                    </button>
                                  `)}
                                </div>
                              ` : null}
                            </div>
                          `
                        })}
                      </div>
                    ` : null}
                  </div>
                `
              })}
            </div>
            ${tree.length === 0 ? h`<p className="sku-nav-empty">“${unitQuery}” ile eşleşen birim yok.</p>` : null}
          </div>
        </nav>
        <section className="sku-detail" ref=${detailRef}>
          ${page ? null : hero}
          ${page && scope.children.length ? h`
            <div className="sku-units">
              <div className="sku-units-head"><b>${scope.childLabel}</b><em>${scope.children.length}</em></div>
              <div className="sku-units-grid">
                ${scope.children.map((c) => {
                  const share = scope.employees.length ? Math.round((c.count / scope.employees.length) * 100) : 0
                  return h`
                    <button key=${c.key} type="button" title=${c.label} className=${`sku-unit is-${c.kind}`} onClick=${() => select(c.sel)}>
                      <span className="sku-unit-top">
                        <span className="sku-tile"><${Icon} d=${ICON[c.kind]} size=${14} stroke=${1.8} /></span>
                        <span className="sku-unit-name"><b>${c.kind === "department" ? c.label : niceName(c.label)}</b><small>${c.sub}</small></span>
                        <span className="sku-unit-go"><${Icon} d=${ICON.chevron} size=${13} stroke=${2} /></span>
                      </span>
                      <span className="sku-unit-bar"><i style=${{ width: `${share}%` }}></i></span>
                      <span className="sku-unit-foot"><b>${c.count}</b> çalışan<em>%${share}</em></span>
                    </button>
                  `
                })}
              </div>
            </div>
          ` : null}
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
                ${showUnit ? sortHead("unit", unitLabel, selected.type === "workplace" ? "dept" : "unit") : null}${sortHead("start", "İşe Giriş")}<th className="col-user">Kullanıcı Adı</th>
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
                    <td className="is-code is-muted"><span className="sku-ellipsis" title=${e.username}>${e.username}</span></td>
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

  function DoneView({ result, onClose }) {
    const { plan } = result
    return h`
      <div className="sku-body sku-done">
        <div className="sku-done-head">
          <span className="sku-done-icon"><${Icon} d=${ICON.check} size=${22} stroke=${2.4} /></span>
          <div>
            <h2>Sistem kurulumu tamamlandı</h2>
            <p>${plan.counts.company} şirket, ${plan.counts.workplace} işyeri, ${plan.counts.department} departman ve ${plan.counts.employee} çalışan <b>${result.elapsed} saniyede</b> oluşturuldu.${result.finishedAt ? ` · ${result.finishedAt}` : ""}</p>
          </div>
          <button type="button" className="sku-btn" onClick=${() => downloadResult(plan)}><${Icon} d=${ICON.download} /> Sonuç listesini indir</button>
        </div>
        <${OrgExplorer} plan=${plan} />
      </div>
      <footer className="sku-foot">
        <p>Bu yapıyı istediğiniz zaman sol menüdeki <b>Organizasyon Yapısı</b> sayfasından görebilirsiniz.</p>
        <div><button type="button" className="sku-btn primary" onClick=${onClose}>Tamam</button></div>
      </footer>
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
        <${OrgExplorer} plan=${plan} page=${true} actions=${h`
          <span className="sku-live" title=${plan.fileName || ""}><i></i>Sisteme aktarıldı${result.finishedAt ? h`<small>${result.finishedAt}</small>` : null}</span>
          <button type="button" className="sku-btn ghost" title="Kurulum sonucunu siler; Starter Kit yeniden yüklenip Sisteme Aktar ile oluşturulabilir"
            onClick=${() => { if (window.confirm(`${companyName} organizasyon yapısı sıfırlansın mı? Starter Kit'i yeniden yükleyip Sisteme Aktar ile tekrar oluşturabilirsiniz.`)) clearSetupResult(companyName) }}>Sıfırla</button>
          <button type="button" className="sku-btn" onClick=${() => downloadResult(plan)}><${Icon} d=${ICON.download} /> Listeyi indir</button>
        `} />
      </div>
    `
  }

  function PageHeader({ companyName, result, onDownload }) {
    return h`
      <header className="sku-page-head">
        <div>
          <div className="sku-page-eyebrow">İmplementasyon · ${companyName || "Firma"}</div>
          <h1>Organizasyon Yapısı</h1>
          <p>Starter Kit'ten oluşturulan grup, şirket, işyeri, departman ve çalışanlar.</p>
        </div>
        ${result ? h`
          <div className="sku-page-actions">
            <div className="sku-page-meta">
              <span className="sku-live"><i></i>Sisteme aktarıldı${result.finishedAt ? h`<small>${result.finishedAt}</small>` : null}</span>
              ${result.plan.fileName ? h`<small title=${result.plan.fileName}><${Icon} d=${ICON.values} size=${12} />${result.plan.fileName}</small>` : null}
            </div>
            <button type="button" className="sku-btn" onClick=${onDownload}><${Icon} d=${ICON.download} /> Listeyi indir</button>
          </div>
        ` : null}
      </header>
    `
  }

  window.StarterKitSetupLauncher = StarterKitSetupLauncher
  window.StarterKitSetupModal = StarterKitSetupModal
  window.StarterKitSetupModal.buildSetupPlan = buildSetupPlan
  window.OrganizationPage = OrganizationPage
})()
