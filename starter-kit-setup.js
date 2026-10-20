// Starter Kit'ten sistem kurulumu: uzman onayladığı Starter Kit ile Şirket → İşyeri → Departman → Çalışan
// kayıtlarını tek tuşla oluşturur. Sıra ve kurallar Dakika toplu aktarım ekranlarıyla aynıdır:
// Grup firma açılışında oluşur (implementation-service), Şirket Grup altına, İşyeri Şirket altına,
// Departman İşyeri altına açılır (CreateBulkUnitFileUpload); çalışanlar yalnız İşyeri/Departman'a
// bağlanır (CreateEmployeeUpload), ücret ve banka bilgileri toplu değer güncellemesiyle yazılır.
;(function () {
  const { useEffect, useMemo, useRef, useState } = React
  const h = htm.bind(React.createElement)

  const TYPE_META = {
    group: { label: "Grup", plural: "Grup" },
    company: { label: "Şirket", plural: "Şirketler" },
    workplace: { label: "İşyeri", plural: "İşyerleri" },
    department: { label: "Departman", plural: "Departmanlar" },
    employee: { label: "Çalışan", plural: "Çalışanlar" }
  }

  // Demo akışında her kaydın oluşturulma süresi (ms); gerçek serviste API çağrısıyla değişir.
  const STEP_DELAY = { company: 520, workplace: 380, department: 170, employee: 45, values: 1400 }

  const SETUP_STEPS = [
    { key: "group", title: "Grup", source: "Firma açılışında oluşturuldu", tool: "İmplementasyon firması" },
    { key: "company", title: "Şirketler", source: "Şirket Bilgi sayfası", tool: "Birim toplu yaratma · Grup altına" },
    { key: "workplace", title: "İşyerleri", source: "İşyeri Bilgi sayfası", tool: "Birim toplu yaratma · Şirket altına" },
    { key: "department", title: "Departmanlar", source: "Kişisel Bilgi sayfası", tool: "Birim toplu yaratma · İşyeri altına" },
    { key: "employee", title: "Çalışanlar", source: "Kişisel Bilgi sayfası", tool: "Toplu çalışan yaratma" },
    { key: "values", title: "Ücret ve banka bilgileri", source: "Kişisel Bilgi sayfası", tool: "Toplu değer güncelleme" }
  ]

  const ICON = {
    close: "M6 6l12 12M18 6 6 18",
    check: "M20 6 9 17l-5-5",
    chevron: "m9 6 6 6-6 6",
    down: "m6 9 6 6 6-6",
    group: ["M3 21h18", "M5 21V7l7-4 7 4v14", "M9 21v-6h6v6"],
    company: ["M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16", "M16 9h2a2 2 0 0 1 2 2v10", "M8 7h4M8 11h4M8 15h4", "M3 21h18"],
    workplace: ["M3 21h18", "M5 21V10l7-5 7 5v11", "M10 21v-5h4v5"],
    department: ["M4 6h16M4 12h16M4 18h10"],
    employee: ["M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1", "M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6", "M20 19v-1a3 3 0 0 0-2-2.8", "M15 4.2a3 3 0 0 1 0 5.6"],
    values: ["M4 7h16v12H4z", "M4 11h16", "M8 15h3"],
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
      const company = { type: "company", name, title: extra.title || "", taxNo: extra.taxNo || "", workplaces: [], fromPersonnel }
      companyByKey.set(key, company)
      companies.push(company)
      return company
    }

    // Şirket Bilgi
    if (schema.company) {
      const sheet = sheets[schema.company.si]
      const head = findHeader(sheet, norm, ["sirketadi"]) || { headerRow: schema.company.headerRow, cols: {} }
      const titleCol = head.cols.ticariunvan
      for (let r = head.headerRow + 1; r < sheet.rowCount; r++) {
        const row = sheet.rows[r]
        if (!row.some((v) => clean(v))) break
        addCompany(clean(row[schema.company.cols.sirketAdi]), { title: titleCol != null ? clean(row[titleCol]) : "", taxNo: clean(row[schema.company.cols.vergiNo]) })
      }
    }

    // İşyeri Bilgi
    const workplaceByKey = new Map()
    const addWorkplace = (company, name, extra = {}, fromPersonnel = false) => {
      const key = `${norm(company.name)}|${norm(name)}`
      if (!norm(name)) return null
      if (workplaceByKey.has(key)) return workplaceByKey.get(key)
      const workplace = { type: "workplace", name, sgkNo: extra.sgkNo || "", address: extra.address || "", departments: [], employees: [], fromPersonnel, company }
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
        addWorkplace(company, name, { sgkNo: clean(row[head.cols.isyerisgknumarasi]), address: clean(row[head.cols.adres]) })
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
          company, workplace, department
        }
        ;(department || workplace).employees.push(employee)
        employees.push(employee)
      }
    }

    // Kontrol notları
    companies.forEach((company) => {
      if (company.fromPersonnel) warnings.push({ level: "warn", text: `“${company.name}” Şirket Bilgi sayfasında yok; personel kayıtlarından oluşturulacak.` })
      const count = company.workplaces.reduce((t, w) => t + countEmployees(w), 0)
      if (count === 0) warnings.push({ level: "info", text: `“${company.name}” şirketinde çalışan yok; şirket ve işyerleri yine de oluşturulacak.` })
      company.workplaces.forEach((workplace) => {
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
      companies, workplaces, departments, employees, warnings,
      counts: { group: 1, company: companies.length, workplace: workplaces.length, department: departments.length, employee: employees.length, values: employees.length }
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

  function StarterKitSetupLauncher({ file, groupName }) {
    const [open, setOpen] = useState(false)
    const [result, setResult] = useState(() => loadSetupResult(groupName))
    function handleDone(res) {
      saveSetupResult(groupName, res)
      setResult(res)
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
      ${open ? h`<${StarterKitSetupModal} file=${file} groupName=${groupName} initialResult=${result} onDone=${handleDone} onClose=${() => setOpen(false)} />` : null}
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

    async function run() {
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
        push({ kind: "company", text: c.name, sub: `Şirket · ID ${c.id} · ${plan.group.name} altına` })
      })
      await stepRun("workplace", plan.workplaces, (w) => {
        w.id = nextId++
        w.parentId = w.company.id
        push({ kind: "workplace", text: w.name, sub: `İşyeri · ID ${w.id} · ${w.company.name}` })
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
      push({ kind: "values", text: "Ücret, banka ve SGK bilgileri yazıldı", sub: `${plan.employees.length} çalışan · toplu değer güncelleme` })

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
    const totalMs = plan.counts.company * STEP_DELAY.company + plan.counts.workplace * STEP_DELAY.workplace + plan.counts.department * STEP_DELAY.department + plan.counts.employee * STEP_DELAY.employee + STEP_DELAY.values + 500
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
              <header><strong>Oluşturma sırası</strong><span>Dakika toplu aktarım adımları</span></header>
              <ol className="sku-order">
                ${SETUP_STEPS.map((s, i) => h`
                  <li key=${s.key}>
                    <span className="sku-order-num">${i + 1}</span>
                    <div><b>${s.title}</b><small>${s.tool} · ${s.source}</small></div>
                    <em>${s.key === "group" ? "mevcut" : plan.counts[s.key]}</em>
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
          <button type="button" className="sku-btn primary" onClick=${onRun}><${Icon} d=${ICON.spark} /> Tümünü Oluştur</button>
        </div>
      </footer>
    `
  }

  function RunningView({ plan, progress, activeStep, log, elapsed }) {
    const totals = plan.counts
    const weights = { group: 1, company: 3, workplace: 3, department: 4, employee: 10, values: 3 }
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
      group: { id: p.group.id, name: p.group.name },
      companies: p.companies.map((c) => ({
        id: c.id, name: c.name, title: c.title, taxNo: c.taxNo, fromPersonnel: c.fromPersonnel,
        workplaces: c.workplaces.map((w) => ({ id: w.id, name: w.name, sgkNo: w.sgkNo, address: w.address, fromPersonnel: w.fromPersonnel, departments: w.departments.map((d) => ({ id: d.id, name: d.name })) }))
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
    const plan = { group: { ...raw.group, type: "group", existing: true }, companies, workplaces, departments: workplaces.flatMap((w) => w.departments), employees, warnings: [], counts: raw.counts, fileName: raw.fileName }
    return { plan, counts: raw.counts, elapsed: raw.elapsed, finishedAt: raw.finishedAt, progress: { ...raw.counts } }
  }

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
    const aoa = [["Sicil No", "Adı", "Soyadı", "T.C. Kimlik No", "Şirket", "İşyeri", "Departman", "Birim ID", "Çalışan ID", "Kullanıcı Adı"]]
    plan.employees.forEach((e) => aoa.push([e.sicil, e.firstName, e.lastName, e.tc, e.company.name, e.workplace.name, e.department?.name || "", e.unitId, e.id, e.username]))
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws["!cols"] = aoa[0].map((_, i) => ({ wch: [14, 16, 16, 14, 34, 28, 14, 12, 12, 20][i] }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Oluşturulan Çalışanlar")
    XLSX.writeFile(wb, `${plan.group.name} - Organizasyon Yapısı.xlsx`)
  }

  // ---------- Organizasyon gezgini (sonuç ekranı ve sayfa ortak) ----------

  function OrgExplorer({ plan, page = false }) {
    const [selected, setSelected] = useState({ type: "group" })
    const [query, setQuery] = useState("")
    const [open, setOpen] = useState(() => new Set(plan.companies.map((c) => c.id)))
    const toggle = (id) => setOpen((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

    const scope = useMemo(() => {
      if (selected.type === "group") {
        return { title: plan.group.name, type: "Grup", id: plan.group.id, crumbs: [], employees: plan.employees,
          facts: [["Şirket", plan.companies.length], ["İşyeri", plan.workplaces.length], ["Departman", plan.departments.length]] }
      }
      const node = selected.node
      if (selected.type === "company") {
        return { title: node.name, type: "Şirket", id: node.id, crumbs: [plan.group.name], employees: plan.employees.filter((e) => e.company === node),
          facts: [["Ticari unvan", node.title || "—"], ["Vergi No", node.taxNo || "—"], ["İşyeri", node.workplaces.length]] }
      }
      if (selected.type === "workplace") {
        return { title: node.name, type: "İşyeri", id: node.id, crumbs: [plan.group.name, node.company.name], employees: plan.employees.filter((e) => e.workplace === node),
          facts: [["SGK işyeri no", node.sgkNo || "—"], ["Departman", node.departments.length], ["Adres", node.address || "—"]] }
      }
      return { title: node.name, type: "Departman", id: node.id, crumbs: [plan.group.name, node.workplace.company.name, node.workplace.name], employees: node.employees,
        facts: [["Bağlı işyeri", node.workplace.name]] }
    }, [selected, plan])

    const q = query.trim().toLocaleLowerCase("tr")
    const rows = q ? scope.employees.filter((e) => [e.firstName, e.lastName, e.sicil, e.tc, e.username].join(" ").toLocaleLowerCase("tr").includes(q)) : scope.employees
    const isSel = (type, node) => selected.type === type && selected.node === node

    return h`
      <div className=${`sku-explorer ${page ? "is-page" : ""}`}>
        <nav className="sku-nav-tree" aria-label="Organizasyon yapısı">
          ${page ? h`<div className="sku-nav-title">Yapı</div>` : null}
          <button type="button" className=${`sku-node is-group ${selected.type === "group" ? "is-active" : ""}`} onClick=${() => setSelected({ type: "group" })}>
            <${Icon} d=${ICON.group} size=${15} /><span>${plan.group.name}</span><em>${plan.employees.length}</em>
          </button>
          ${plan.companies.map((c) => h`
            <div key=${c.id}>
              <div className=${`sku-node is-company ${isSel("company", c) ? "is-active" : ""}`}>
                <button type="button" className=${`sku-caret ${open.has(c.id) ? "is-open" : ""}`} aria-label="Aç/kapat" onClick=${() => toggle(c.id)}><${Icon} d=${ICON.chevron} size=${13} /></button>
                <button type="button" className="sku-node-label" title=${c.name} onClick=${() => setSelected({ type: "company", node: c })}><${Icon} d=${ICON.company} size=${15} /><span>${c.name}</span><em>${countEmployees(c)}</em></button>
              </div>
              ${open.has(c.id) ? c.workplaces.map((w) => h`
                <div key=${w.id} className="sku-node-children">
                  <button type="button" title=${w.name} className=${`sku-node is-workplace ${isSel("workplace", w) ? "is-active" : ""}`} onClick=${() => setSelected({ type: "workplace", node: w })}>
                    <${Icon} d=${ICON.workplace} size=${14} /><span>${w.name}</span><em>${countEmployees(w)}</em>
                  </button>
                  ${w.departments.map((d) => h`
                    <button key=${d.id} type="button" className=${`sku-node is-department ${isSel("department", d) ? "is-active" : ""}`} onClick=${() => setSelected({ type: "department", node: d })}>
                      <${Icon} d=${ICON.department} size=${13} /><span>${d.name}</span><em>${d.employees.length}</em>
                    </button>
                  `)}
                </div>
              `) : null}
            </div>
          `)}
        </nav>
        <section className="sku-detail">
          <header className="sku-detail-head">
            <div className="sku-detail-title">
              ${scope.crumbs.length ? h`<div className="sku-crumbs">${scope.crumbs.join("  /  ")}</div>` : null}
              <h3>${scope.title}</h3>
              <div className="sku-detail-meta"><span className=${`sku-type is-${selected.type}`}>${scope.type}</span><span>Birim ID ${scope.id}</span><span>${scope.employees.length} çalışan</span></div>
            </div>
            <label className="sku-search"><${Icon} d=${ICON.search} size=${15} /><input value=${query} onChange=${(e) => setQuery(e.target.value)} placeholder="Ad, sicil, T.C. veya kullanıcı adı ara" /></label>
          </header>
          ${page && scope.facts?.length ? h`
            <dl className="sku-facts">
              ${scope.facts.map(([k, v]) => h`<div key=${k}><dt>${k}</dt><dd title=${String(v)}>${v}</dd></div>`)}
            </dl>
          ` : null}
          <div className="sku-table-wrap">
            <table className="sku-table">
              <thead><tr><th>Sicil No</th><th>Ad Soyad</th><th>T.C. Kimlik No</th><th>İşyeri</th><th>Departman</th><th>İşe Giriş</th><th>Kullanıcı Adı</th><th>Çalışan ID</th></tr></thead>
              <tbody>
                ${rows.slice(0, 500).map((e) => h`
                  <tr key=${e.id}>
                    <td className="is-mono">${e.sicil}</td>
                    <td><div className="sku-person"><span className="sku-avatar">${(e.firstName[0] || "") + (e.lastName[0] || "")}</span><div><b>${e.firstName} ${e.lastName}</b>${e.position ? h`<small>${e.position}</small>` : null}</div></div></td>
                    <td className="is-mono">${e.tc}</td>
                    <td>${e.workplace.name}</td>
                    <td>${e.department?.name || "—"}</td>
                    <td className="is-mono">${e.startDate}</td>
                    <td className="is-mono">${e.username}</td>
                    <td className="is-mono is-muted">${e.id}</td>
                  </tr>
                `)}
              </tbody>
            </table>
            ${rows.length === 0 ? h`<p className="sku-empty">${q ? "Aramayla eşleşen çalışan yok." : "Bu birimde çalışan yok."}</p>` : null}
          </div>
          <footer className="sku-detail-foot">${rows.length} çalışan gösteriliyor${q ? ` · “${query}” araması` : ""}</footer>
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
        <${PageHeader} companyName=${companyName} result=${result} onDownload=${() => downloadResult(plan)} />
        <div className="sku-page-kpis">
          ${["group", "company", "workplace", "department", "employee"].map((key) => h`
            <div key=${key} className=${`sku-kpi is-${key}`}>
              <span className="sku-kpi-icon"><${Icon} d=${ICON[key]} size=${17} /></span>
              <strong>${plan.counts[key]}</strong>
              <span>${TYPE_META[key].label}</span>
            </div>
          `)}
        </div>
        <${OrgExplorer} plan=${plan} page=${true} />
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
              <span className="sku-live"><i></i>Sisteme aktarıldı</span>
              <small>${result.finishedAt || ""}${result.plan.fileName ? ` · ${result.plan.fileName}` : ""}</small>
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
