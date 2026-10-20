// Starter Kit Excel düzenleyicisi: müşterinin yüklediği dosya Excel görünümünde açılır,
// hata (kırmızı) ve uyarı (mor) hücreleri yerinde düzeltilir, sonunda toplu aktarım için
// nihai Starter Kit dosyası üretilir.
;(function () {
  const { useEffect, useMemo, useRef, useState, memo } = React
  const h = htm.bind(React.createElement)

  const SKS_TYPES = {
    hata: { label: "Hata", hint: "Düzeltilmesi zorunludur. Hatalar giderilmeden dosya yüklenemez." },
    uyari: { label: "Uyarı", hint: "Gönderimi engellemez; bilgilerin doğruluğunun kontrol edilmesi önerilir." }
  }
  const SKS_CLIENT_TYPES = ["hata", "uyari"]
  const SKS_SEVERITY = { hata: 0, uyari: 1, guncelleme: 2, yeni: 3 }
  // 2026 aylık brüt asgari ücret; mevzuat değiştiğinde güncellenmelidir.
  const SKS_MIN_GROSS_WAGE = 33030
  const SKS_HEADER_H = 74
  const SKS_HEADER_MAX_W = 240
  const SKS_ROWHEAD_W = 52
  const SKS_ROW_H = 34
  const SKS_EXTRA_ROWS = 12
  const SKS_EXTRA_COLS = 2
  const SKS_LOGO_SRC = "Assets/datassist-logo.png"
  // Kontrol çok hızlı bittiği için bekleme ekranı adımlar okunabilsin diye en az bu süre gösterilir.
  const SKS_MIN_LOADING_MS = 2600
  const SKS_LOADING_STEPS = ["Dosya açılıyor", "Sayfalar okunuyor", "Personel bilgileri kontrol ediliyor", "Sonuçlar hazırlanıyor"]
  const SKS_EDUCATION_KEYWORDS = ["okuryazar", "ilk", "orta", "lise", "onlisans", "lisans", "yuksek", "doktora", "master", "meslek"]

  const PERSONAL_FIELDS = [
    { key: "sicil", label: "Personel Sicil Numarası", match: ["personelsicilnumarasi", "personelsicilno", "sicilno"] },
    { key: "ad", label: "Adı", match: ["adi", "ad"] },
    { key: "soyad", label: "Soyadı", match: ["soyadi", "soyad"] },
    { key: "cinsiyet", label: "Cinsiyet", match: ["cinsiyet"] },
    { key: "tc", label: "T.C. Kimlik No", match: ["tckimlikno", "tckimliknumarasi"] },
    { key: "dogum", label: "Doğum Tarihi", match: ["dogumtarihi"] },
    { key: "medeni", label: "Medeni Hali", match: ["medenihali", "medenihal"] },
    { key: "ogrenim", label: "Öğrenim Durumu", match: ["ogrenimdurumu"] },
    { key: "kidem", label: "Kıdem Tarihi", match: ["kidemtarihi"] },
    { key: "iseGiris", label: "İşe Giriş Tarihi", match: ["isegiristarihi"] },
    { key: "sgk", label: "SGK Sicil No", match: ["sgksicilno"] },
    { key: "meslek", label: "Meslek Kodu", match: ["meslekkodu"] },
    { key: "emekli", label: "Emekli", match: ["emekli"] },
    { key: "asgari", label: "Asgari Ücret İstisnası", match: ["calisanasgariucretistisnasinatabimi", "asgariucretistisnasinatabimi"] },
    { key: "ssk", label: "Çalışan SSK'ya Tabi", match: ["calisansskyatabi"] },
    { key: "kanun", label: "Kanun No", match: ["kanunno"] },
    { key: "maas", label: "Maaş", match: ["maas"] },
    { key: "iban", label: "IBAN", match: ["iban"] }
  ]
  const COMPANY_FIELDS = [
    { key: "sirketAdi", label: "Şirket Adı", match: ["sirketadi"] },
    { key: "vergiNo", label: "Vergi No", match: ["vergino"] },
    { key: "eposta", label: "E-Posta (Fatura)", match: ["emailadresifaturaicin", "epostaadresifaturaicin"] }
  ]

  // ---------- Yardımcılar ----------

  function skNorm(value) {
    return String(value ?? "")
      .toLocaleLowerCase("tr")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/ı/g, "i")
      .replace(/[^a-z0-9]/g, "")
  }

  function colLetter(c) {
    let s = ""
    let n = c + 1
    while (n > 0) {
      const m = (n - 1) % 26
      s = String.fromCharCode(65 + m) + s
      n = Math.floor((n - 1) / 26)
    }
    return s
  }

  function cellRef(r, c) {
    return `${colLetter(c)}${r + 1}`
  }

  function isValidDate(text) {
    const value = String(text || "").trim()
    let d, mo, y
    let m = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)
    if (m) { d = +m[1]; mo = +m[2]; y = +m[3] }
    else if ((m = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) { y = +m[1]; mo = +m[2]; d = +m[3] }
    else if ((m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/))) { mo = +m[1]; d = +m[2]; y = 1900 + +m[3] }
    else return false
    if (y < 1900 || y > 2100) return false
    const date = new Date(y, mo - 1, d)
    return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d
  }

  function isValidTc(text) {
    const v = String(text || "").replace(/\s/g, "")
    if (!/^[1-9]\d{10}$/.test(v)) return false
    const n = [...v].map(Number)
    const odd = n[0] + n[2] + n[4] + n[6] + n[8]
    const even = n[1] + n[3] + n[5] + n[7]
    const d10 = ((odd * 7 - even) % 10 + 10) % 10
    const d11 = n.slice(0, 10).reduce((a, b) => a + b, 0) % 10
    return d10 === n[9] && d11 === n[10]
  }

  function isValidIban(text) {
    const v = String(text || "").replace(/\s/g, "").toUpperCase()
    if (!/^TR\d{24}$/.test(v)) return false
    const rearranged = v.slice(4) + v.slice(0, 4)
    const digits = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55))
    let rem = 0
    for (const ch of digits) rem = (rem * 10 + Number(ch)) % 97
    return rem === 1
  }

  function parseAmount(text) {
    let v = String(text || "").replace(/TL|TRY|₺/gi, "").replace(/\s/g, "")
    if (!v) return null
    if (!/^-?[\d.,]+$/.test(v)) return NaN
    const lastDot = v.lastIndexOf(".")
    const lastComma = v.lastIndexOf(",")
    if (lastDot > -1 && lastComma > -1) {
      v = lastComma > lastDot ? v.replace(/\./g, "").replace(",", ".") : v.replace(/,/g, "")
    } else if (lastComma > -1) {
      v = /^\d{1,3}(,\d{3})+$/.test(v) ? v.replace(/,/g, "") : v.replace(",", ".")
    } else if (lastDot > -1 && /^\d{1,3}(\.\d{3})+$/.test(v)) {
      v = v.replace(/\./g, "")
    }
    const n = Number(v)
    return Number.isFinite(n) ? n : NaN
  }

  function formatAmount(n) {
    return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // ---------- Dosya okuma ----------

  function parseSheet(name, ws) {
    const ref = ws["!ref"]
    const range = ref ? XLSX.utils.decode_range(ref) : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }
    const merges = (ws["!merges"] || []).map((m) => ({ s: { ...m.s }, e: { ...m.e } }))
    let lastRow = 0
    let lastCol = 0
    const raw = []
    for (let r = 0; r <= range.e.r; r++) {
      for (let c = 0; c <= range.e.c; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })]
        if (!cell) continue
        const text = cell.w != null ? String(cell.w) : cell.v != null ? String(cell.v) : ""
        if (text === "") continue
        raw.push([r, c, text, cell.t === "n"])
        if (r > lastRow) lastRow = r
        if (c > lastCol) lastCol = c
      }
    }
    merges.forEach((m) => { lastRow = Math.max(lastRow, m.e.r); lastCol = Math.max(lastCol, m.e.c) })
    const rowCount = Math.max(lastRow + 1 + SKS_EXTRA_ROWS, 30)
    const colCount = Math.max(lastCol + 1 + SKS_EXTRA_COLS, 10)
    const rows = Array.from({ length: rowCount }, () => new Array(colCount).fill(""))
    const numeric = {}
    raw.forEach(([r, c, text, isNum]) => {
      rows[r][c] = text
      if (isNum) numeric[`${r}:${c}`] = true
    })
    const colWidths = Array.from({ length: colCount }, (_, c) => {
      const info = ws["!cols"]?.[c]
      const px = info?.wpx || (info?.wch ? info.wch * 7 + 5 : 0) || 96
      return Math.round(Math.min(Math.max(px, 56), 320))
    })
    const hiddenCols = Array.from({ length: colCount }, (_, c) => Boolean(ws["!cols"]?.[c]?.hidden))
    const rowHeights = Array.from({ length: rowCount }, (_, r) => {
      const info = ws["!rows"]?.[r]
      const px = info?.hpx || (info?.hpt ? info.hpt * 4 / 3 : 0)
      return px ? Math.round(Math.min(Math.max(px, SKS_ROW_H), 120)) : SKS_ROW_H
    })
    const hiddenRows = Array.from({ length: rowCount }, (_, r) => Boolean(ws["!rows"]?.[r]?.hidden))
    return { name, rows, numeric, colWidths, hiddenCols, rowHeights, hiddenRows, merges, rowCount, colCount }
  }

  function detectHeader(sheet, fields, minMatches) {
    const limit = Math.min(sheet.rowCount, 40)
    let best = null
    for (let r = 0; r < limit; r++) {
      const cols = {}
      let count = 0
      sheet.rows[r].forEach((value, c) => {
        const n = skNorm(value)
        if (!n) return
        const field = fields.find((f) => f.match.includes(n))
        if (field && cols[field.key] == null) { cols[field.key] = c; count += 1 }
      })
      if (count >= minMatches && (!best || count > best.count)) best = { headerRow: r, cols, count }
    }
    return best
  }

  function buildSchema(sheets) {
    let personal = null
    let company = null
    sheets.forEach((sheet, si) => {
      const p = detectHeader(sheet, PERSONAL_FIELDS, 5)
      if (p && (!personal || p.count > personal.count)) personal = { si, ...p }
      const co = detectHeader(sheet, COMPANY_FIELDS, 2)
      if (co && (!company || co.count > company.count)) company = { si, ...co }
    })
    if (company && personal && company.si === personal.si) company = null
    return { personal, company }
  }

  function parseWorkbook(buffer) {
    const wb = XLSX.read(buffer, { type: "array", cellStyles: true })
    const sheets = wb.SheetNames.map((name) => parseSheet(name, wb.Sheets[name]))
    const schema = buildSchema(sheets)
    const fieldLabels = sheets.map(() => ({}))
    if (schema.personal) Object.entries(schema.personal.cols).forEach(([key, c]) => { fieldLabels[schema.personal.si][c] = PERSONAL_FIELDS.find((f) => f.key === key).label })
    if (schema.company) Object.entries(schema.company.cols).forEach(([key, c]) => { fieldLabels[schema.company.si][c] = COMPANY_FIELDS.find((f) => f.key === key).label })
    // Doğrulanan alanların başlığı okunabilsin diye sütunlar en az bu genişlikte açılır.
    fieldLabels.forEach((labels, si) => Object.keys(labels).forEach((c) => {
      sheets[si].colWidths[c] = Math.max(sheets[si].colWidths[c], 124)
    }))
    // Şablonu tanınan sayfalarda dosyadaki Türkçe başlık satırı ve üstündeki İngilizce başlık satırı
    // sabit sütun başlığına taşınır; bu satırlar tabloda tekrar gösterilmez.
    const headerLabels = sheets.map(() => null)
    ;[schema.personal, schema.company].filter(Boolean).forEach(({ si, headerRow }) => {
      const sheet = sheets[si]
      const wideMerge = (r, c) => sheet.merges.some((m) => r >= m.s.r && r <= m.e.r && c >= m.s.c && c <= m.e.c && m.e.c > m.s.c)
      let enRow = -1
      let best = 2
      for (let r = headerRow - 1; r >= Math.max(0, headerRow - 3); r--) {
        const count = sheet.rows[r].filter((v, c) => String(v).trim() && !wideMerge(r, c)).length
        if (count > best) { best = count; enRow = r }
      }
      const clean = (v) => String(v || "").replace(/\s+/g, " ").trim()
      headerLabels[si] = {
        tr: sheet.rows[headerRow].map(clean),
        en: enRow > -1 ? sheet.rows[enRow].map((v, c) => (wideMerge(enRow, c) ? "" : clean(v))) : []
      }
    })
    // Sütunlar başlıkları sığacak kadar genişletilir; çok uzun başlıklar iki satıra bölünür.
    headerLabels.forEach((labels, si) => {
      if (!labels) return
      const sheet = sheets[si]
      sheet.colWidths = sheet.colWidths.map((w, c) => {
        // Tek satıra sığmayan başlık iki satıra bölünür; kelime kırılımı için pay bırakılır.
        const fit = (text, font) => {
          const need = measureText(text, font) + 22
          return need <= SKS_HEADER_MAX_W ? need : Math.ceil(need / 2) + 40
        }
        const width = Math.max(fit(labels.tr[c], "600 12px Inter, sans-serif"), fit(labels.en[c], "italic 500 10.5px Inter, sans-serif"))
        return Math.max(w, Math.min(Math.round(width), SKS_HEADER_MAX_W + 40))
      })
    })
    return { sheets, schema, fieldLabels, headerLabels }
  }

  let measureCtx = null
  function measureText(text, font) {
    if (!text) return 0
    measureCtx = measureCtx || document.createElement("canvas").getContext("2d")
    measureCtx.font = font
    return measureCtx.measureText(String(text)).width
  }

  // ---------- Validasyon ----------

  function validateBook(data, book) {
    const issues = []
    const { personal, company } = book.schema
    const covered = book.sheets.map((sheet) => {
      const set = new Set()
      sheet.merges.forEach((m) => {
        for (let r = m.s.r; r <= m.e.r; r++) for (let c = m.s.c; c <= m.e.c; c++) if (r !== m.s.r || c !== m.s.c) set.add(`${r}:${c}`)
      })
      return set
    })
    const add = (si, r, c, fieldKey, fieldLabel, type, message, extra = {}) => {
      if (covered[si].has(`${r}:${c}`)) return
      issues.push({ id: `${si}:${r}:${c}:${fieldKey}:${type}`, si, r, c, fieldKey, fieldLabel, type, message, value: data[si][r][c], ...extra })
    }

    if (personal) {
      const { si, headerRow, cols } = personal
      const rows = data[si]
      const label = (key) => PERSONAL_FIELDS.find((f) => f.key === key).label
      for (let r = headerRow + 1; r < rows.length; r++) {
        const v = (key) => (cols[key] == null ? "" : String(rows[r][cols[key]] ?? "").trim())
        if (!["sicil", "ad", "soyad", "tc"].some((key) => v(key))) continue
        const push = (key, type, message, extra) => { if (cols[key] != null) add(si, r, cols[key], key, label(key), type, message, extra) }
        const person = [v("ad"), v("soyad")].filter(Boolean).join(" ")
        const ctx = { person }

        // Her kural kısa bir başlık (özet kartı) ve "Nasıl düzeltilir?" yönlendirmesi taşır.
        const rule = (title, fix, extra = {}) => ({ ...ctx, rule: title, title, fix, ...extra })
        const dateFix = (example) => `Tarihi GG.AA.YYYY formatında yazın. Örnek: ${example}`

        if (!v("ad")) push("ad", "hata", "Ad alanı zorunludur; boş bırakılamaz.", rule("Ad boş", "Çalışanın adını yazın."))
        if (!v("soyad")) push("soyad", "hata", "Soyad alanı zorunludur; boş bırakılamaz.", rule("Soyad boş", "Çalışanın soyadını yazın."))

        const gender = skNorm(v("cinsiyet"))
        if (!gender) push("cinsiyet", "hata", "Cinsiyet zorunlu bir alandır; boş bırakılamaz.", rule("Cinsiyet boş", "E (Erkek) veya K (Kadın) yazın."))
        else if (!["e", "k", "erkek", "kadin", "male", "female"].includes(gender)) push("cinsiyet", "hata", "Cinsiyet tanımlı değerlerden biri değil.", rule("Cinsiyet geçersiz", "E (Erkek) veya K (Kadın) yazın."))

        if (!v("tc")) push("tc", "hata", "T.C. Kimlik No zorunlu bir alandır; boş bırakılamaz.", rule("T.C. Kimlik No boş", "Nüfus cüzdanındaki 11 haneli numarayı boşluksuz yazın."))
        else if (!isValidTc(v("tc"))) push("tc", "hata", "T.C. Kimlik No geçerli değil; 11 haneli değil veya numara doğrulamasından geçmiyor.", rule("T.C. Kimlik No geçersiz", "Numarayı nüfus cüzdanıyla karşılaştırın; 11 hane olmalı ve 0 ile başlamamalı."))

        if (!isValidDate(v("dogum"))) push("dogum", "hata", v("dogum") ? "Girilen değer geçerli bir tarih değil." : "Doğum tarihi zorunlu bir alandır; boş bırakılamaz.", rule(v("dogum") ? "Doğum tarihi geçersiz" : "Doğum tarihi boş", dateFix("24.01.1985")))
        if (!isValidDate(v("iseGiris"))) push("iseGiris", "hata", v("iseGiris") ? "Girilen değer geçerli bir tarih değil." : "İşe giriş tarihi zorunlu bir alandır; boş bırakılamaz.", rule(v("iseGiris") ? "İşe giriş tarihi geçersiz" : "İşe giriş tarihi boş", dateFix("01.03.2023")))

        if (!v("kidem")) {
          push("kidem", "uyari", "Kıdem tarihi boş bırakılmış.", rule("Kıdem tarihi boş", "Kıdem tarihi çoğunlukla işe giriş tarihiyle aynıdır. Öneriyi uygulayın ya da doğru tarihi yazın.", isValidDate(v("iseGiris")) ? { suggestion: v("iseGiris") } : {}))
        } else if (!isValidDate(v("kidem"))) {
          push("kidem", "hata", "Girilen değer geçerli bir tarih değil.", rule("Kıdem tarihi geçersiz", dateFix("01.03.2023")))
        }

        if (!v("sgk")) push("sgk", "uyari", "SGK sicil numarası boş bırakılmış.", rule("SGK Sicil No boş", "SGK sicil no çoğunlukla T.C. Kimlik No ile aynıdır. Öneriyi uygulayın ya da doğru numarayı yazın.", isValidTc(v("tc")) ? { suggestion: v("tc") } : {}))

        const edu = skNorm(v("ogrenim"))
        if (edu && !SKS_EDUCATION_KEYWORDS.some((k) => edu.includes(k))) {
          push("ogrenim", "uyari", "Öğrenim durumu tanımlı değerlerle eşleşmiyor; bu haliyle gönderilirse alan boş aktarılır.", rule("Öğrenim durumu tanımsız", "Şu değerlerden birini yazın: İlkokul, Ortaokul, Lise, Önlisans, Lisans, Yüksek Lisans, Doktora."))
        }

        if (skNorm(v("ssk")) === "hayir") push("ssk", "uyari", "Çalışan SSK'ya tabi değil olarak belirtilmiş. Bu durum istisnai olduğundan kontrol edilmelidir.", rule("SSK'ya tabi değil", "Bilgi doğruysa dokunmayın. Yanlışsa \"Evet\" yazın."))
        if (skNorm(v("asgari")) === "hayir") push("asgari", "uyari", "Çalışan asgari ücret istisnasına tabi değil olarak belirtilmiş; bu bilgi bordro hesaplamasını etkiler.", rule("Asgari ücret istisnası yok", "Bilgi doğruysa dokunmayın. Yanlışsa \"Evet\" yazın."))

        const salary = parseAmount(v("maas"))
        if (salary === null) push("maas", "hata", "Maaş zorunlu bir alandır; boş bırakılamaz.", rule("Maaş boş", "Brüt aylık maaşı rakamla yazın. Örnek: 45000,00"))
        else if (Number.isNaN(salary)) push("maas", "hata", "Maaş sayısal bir tutar değil.", rule("Maaş sayısal değil", "Yalnızca rakam kullanın; TL gibi ifadeler eklemeyin. Örnek: 45000,00"))
        else if (salary > 0 && salary < SKS_MIN_GROSS_WAGE) push("maas", "uyari", `Girilen maaş güncel brüt asgari ücretin (${formatAmount(SKS_MIN_GROSS_WAGE)} TL) altında.`, rule("Maaş asgari ücretin altında", "Tutarın brüt aylık maaş olduğunu kontrol edin. Doğruysa olduğu gibi bırakabilirsiniz."))

        if (!v("iban")) push("iban", "uyari", "IBAN boş bırakılmış. Dosya gönderilebilir; ancak maaş ödemesi için canlıya geçişten önce tamamlanmalıdır.", rule("IBAN boş", "Biliyorsanız TR ile başlayan 26 karakterlik IBAN'ı yazın; bilmiyorsanız şimdilik boş bırakabilirsiniz."))
        else if (!isValidIban(v("iban"))) push("iban", "hata", "IBAN geçerli değil.", rule("IBAN geçersiz", "TR ile başlayan 26 karakterlik IBAN'ı eksiksiz yazın. Örnek: TR33 0006 1005 1978 6457 8413 26"))

        // Otomatik güncellemeler müşteriye gösterilmez; nihai dosyaya uygulanır ve uzman ekranında listelenir.
        const marital = skNorm(v("medeni"))
        if (marital === "e") push("medeni", "guncelleme", "Kısaltma olarak girilen medeni hal bilgisi sistemdeki karşılığına dönüştürüldü.", { ...ctx, newValue: "Evli" })
        if (marital === "b") push("medeni", "guncelleme", "Kısaltma olarak girilen medeni hal bilgisi sistemdeki karşılığına dönüştürüldü.", { ...ctx, newValue: "Bekar" })
        if (!v("meslek")) push("meslek", "guncelleme", "Meslek kodu boş bırakıldığı için 0000.00 olarak dolduruldu. Doğru meslek kodunun girilmesi önerilir.", { ...ctx, newValue: "0000.00" })
        if (["e", "evet"].includes(skNorm(v("emekli"))) && v("kanun") === "5510") push("kanun", "guncelleme", "Çalışan emekli olarak belirtildiği için Kanun No 5510 yerine 0000 olarak güncellendi.", { ...ctx, newValue: "0000" })
      }
    }

    if (company) {
      const { si, headerRow, cols } = company
      const rows = data[si]
      const label = (key) => COMPANY_FIELDS.find((f) => f.key === key).label
      for (let r = headerRow + 1; r < rows.length; r++) {
        const v = (key) => (cols[key] == null ? "" : String(rows[r][cols[key]] ?? "").trim())
        // Şirket tablosu ilk boş satırda biter; altındaki açıklama blokları veri değildir.
        if (!rows[r].some((cell) => String(cell).trim())) break
        const push = (key, type, message, title, fix) => { if (cols[key] != null) add(si, r, cols[key], key, label(key), type, message, { person: v("sirketAdi"), rule: title, title, fix }) }
        if (!v("sirketAdi")) push("sirketAdi", "hata", "Şirket adı zorunlu bir alandır.", "Şirket adı boş", "Şirketin tam adını yazın.")
        if (!/^\d{10}$/.test(v("vergiNo").replace(/\s/g, ""))) push("vergiNo", "hata", "Vergi numarası 10 haneli değil.", "Vergi No geçersiz", "Vergi levhasındaki 10 haneli numarayı boşluksuz yazın.")
        if (v("eposta") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("eposta"))) push("eposta", "uyari", "Fatura e-posta adresinin formatı geçerli görünmüyor.", "Fatura e-postası hatalı", "Adresi ornek@sirket.com biçiminde yazın.")
      }
    }
    return issues
  }

  function countIssues(issues) {
    const totals = { hata: 0, uyari: 0, guncelleme: 0 }
    issues.forEach((i) => { totals[i.type] = (totals[i.type] || 0) + 1 })
    return totals
  }

  // Uzman ekranındaki mevcut validasyon modalının beklediği kayıt biçimi.
  function toLegacyIssues(issues) {
    return issues.map((issue, index) => ({
      id: `${issue.fieldKey}-${index + 1}`,
      fieldId: issue.fieldKey,
      fieldLabel: issue.fieldLabel,
      column: colLetter(issue.c),
      type: issue.type,
      row: issue.r + 1,
      originalValue: issue.value,
      ...(issue.newValue ? { newValue: issue.newValue } : issue.suggestion ? { suggestedValue: issue.suggestion } : {}),
      message: issue.message,
      fullName: issue.person || ""
    }))
  }

  // ---------- Dışa aktarma ----------

  const SKS_EXPORT_STYLE = {
    hata: { fill: "FEF3F2", font: "B42318", border: "F04438" },
    uyari: { fill: "F4F3FF", font: "5925DC", border: "7A5AF8" }
  }

  function buildExportWorkbook(buffer, book, data, issues, { highlight = false, applyAutoFixes = true } = {}) {
    const wb = XLSX.read(buffer, { type: "array", cellStyles: true })
    const finalValues = data.map((rows) => rows.map((row) => row.slice()))
    if (applyAutoFixes) issues.filter((i) => i.type === "guncelleme").forEach((i) => { finalValues[i.si][i.r][i.c] = i.newValue })
    book.sheets.forEach((sheet, si) => {
      const ws = wb.Sheets[sheet.name]
      let maxR = 0
      let maxC = 0
      for (let r = 0; r < sheet.rowCount; r++) {
        for (let c = 0; c < sheet.colCount; c++) {
          const next = finalValues[si][r][c]
          if (next !== "") { maxR = Math.max(maxR, r); maxC = Math.max(maxC, c) }
          if (next === sheet.rows[r][c]) continue
          const addr = XLSX.utils.encode_cell({ r, c })
          if (next === "") { delete ws[addr]; continue }
          const wasNumeric = sheet.numeric[`${r}:${c}`]
          const asNumber = wasNumeric ? parseAmount(next) : NaN
          ws[addr] = Number.isFinite(asNumber) ? { t: "n", v: asNumber } : { t: "s", v: next }
        }
      }
      const prev = ws["!ref"] ? XLSX.utils.decode_range(ws["!ref"]) : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }
      ws["!ref"] = XLSX.utils.encode_range({ s: prev.s, e: { r: Math.max(prev.e.r, maxR), c: Math.max(prev.e.c, maxC) } })
    })
    if (highlight) {
      issues.filter((i) => SKS_CLIENT_TYPES.includes(i.type)).forEach((i) => {
        const ws = wb.Sheets[book.sheets[i.si].name]
        const addr = XLSX.utils.encode_cell({ r: i.r, c: i.c })
        if (!ws[addr]) ws[addr] = { t: "s", v: "" }
        const st = SKS_EXPORT_STYLE[i.type]
        const side = { style: "thin", color: { rgb: st.border } }
        ws[addr].s = { fill: { fgColor: { rgb: st.fill } }, font: { color: { rgb: st.font }, bold: true }, border: { top: side, bottom: side, left: side, right: side } }
        ws[addr].c = [{ a: "Datassist", t: `${SKS_TYPES[i.type].label}: ${i.message}` }]
      })
    }
    return wb
  }

  function exportFileName(name, suffix) {
    return `${String(name || "Starter Kit").replace(/\.[^.]+$/, "")} - ${suffix}.xlsx`
  }

  // React çizimi bittikten hemen sonra çalışır; requestAnimationFrame bazı tarayıcı durumlarında hiç tetiklenmediği için kullanılmaz.
  const afterRender = (fn) => setTimeout(fn, 0)

  // ---------- Bileşenler ----------

  const Icon = ({ d, size = 16, stroke = 1.7 }) => h`
    <svg width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth=${stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">${[].concat(d).map((p, i) => h`<path key=${i} d=${p} />`)}</svg>
  `
  const ICONS = {
    close: "M6 6l12 12M18 6 6 18",
    download: ["M12 3v12", "m7 10 5 5 5-5", "M5 20h14"],
    upload: ["M12 21V9", "m7 14 5-5 5 5", "M5 4h14"],
    undo: ["M9 14 4 9l5-5", "M4 9h11a5 5 0 0 1 0 10h-3"],
    redo: ["m15 14 5-5-5-5", "M20 9H9a5 5 0 0 0 0 10h3"],
    up: "m18 15-6-6-6 6",
    down: "m6 9 6 6 6-6",
    filter: "M4 5h16l-6 8v5l-4 2v-7L4 5Z",
    check: "M20 6 9 17l-5-5",
    panel: ["M4 4h16v16H4z", "M15 4v16"],
    spark: ["M12 3v4M12 17v4M3 12h4M17 12h4", "m5.6 5.6 2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"],
    lock: ["M6 11h12v9H6z", "M8 11V8a4 4 0 0 1 8 0v3"],
    grid: ["M4 4h16v16H4z", "M4 10h16M4 15h16M10 4v16"]
  }

  const SheetRow = memo(function SheetRow({ frozen, r, cells, height, visibleCols, rowIssues, rowEdited, mergeRow, selC, editing, draft, headerZone, numericRow, rowSeverity, onDraft, onEditorKey, onEditorBlur, fieldWidths }) {
    return h`
      <tr style=${{ height }}>
        <th className=${`sks-rowhead ${selC >= 0 ? "is-active" : ""} ${rowSeverity ? `has-${rowSeverity}` : ""}`} scope="row">${r + 1}</th>
        ${visibleCols.map((c) => {
          const merge = mergeRow?.[c]
          if (merge === "covered") return null
          const issue = rowIssues?.[c]
          const value = cells[c]
          const isSel = selC === c
          const isEditing = editing && editing.c === c
          const isNum = numericRow?.[c] || /^-?[\d.,]+%?$/.test(value)
          const cls = [
            "sks-cell",
            issue ? `is-${issue.type}` : "",
            isSel ? "is-sel" : "",
            rowEdited?.[c] && !issue ? "is-fixed" : "",
            isNum && value ? "is-num" : "",
            headerZone ? "is-headzone" : "",
            merge ? "is-merged" : "",
            height > 40 || merge ? "is-wrap" : "",
            frozen?.[c] ? "is-frozen" : "",
            frozen?.[c]?.last ? "is-frozen-last" : ""
          ].filter(Boolean).join(" ")
          return h`
            <td key=${c} className=${cls} style=${frozen?.[c] ? { left: frozen[c].left } : undefined} data-r=${r} data-c=${c} colSpan=${merge?.colSpan} rowSpan=${merge?.rowSpan}>
              <span className=${`sks-cell-text ${isEditing && editing.source === "bar" ? "is-live" : ""}`}>${isEditing && editing.source === "bar" ? draft : value}</span>
              ${isEditing && editing.source !== "bar" ? h`
                <input
                  className="sks-editor"
                  autoFocus
                  value=${draft}
                  style=${{ minWidth: `calc(100% + 2px)`, width: `${Math.min(Math.max(fieldWidths[c] || 0, String(draft).length * 7.4 + 24), 460)}px` }}
                  onChange=${(e) => onDraft(e.target.value)}
                  onKeyDown=${onEditorKey}
                  onBlur=${onEditorBlur}
                  spellCheck=${false}
                />
              ` : null}
            </td>
          `
        })}
      </tr>
    `
  })

  function StarterKitSheetEditor({ file, onClose, onSubmit, onReupload }) {
    const [status, setStatus] = useState("loading")
    const [loadingStep, setLoadingStep] = useState(0)
    const [book, setBook] = useState(null)
    const [data, setData] = useState(null)
    const [edited, setEdited] = useState({})
    const [active, setActive] = useState(0)
    const [sel, setSel] = useState({ r: 0, c: 0 })
    const [editing, setEditing] = useState(null)
    const [draft, setDraft] = useState("")
    const [filter, setFilter] = useState("all")
    // Filtre seçildiği andaki sorunlu satırlar; düzeltilen satır hemen kaybolmasın diye sabitlenir.
    const [filterRows, setFilterRows] = useState(null)
    // Özet kartından seçilen tek bir sorun türü (ör. "Doğum tarihi geçersiz").
    const [ruleFilter, setRuleFilter] = useState(null)
    const [hover, setHover] = useState(null)
    const zoom = 1
    const [viewport, setViewport] = useState({ top: 0, height: 800 })
    const [toast, setToast] = useState("")
    const [, forceHistory] = useState(0)
    const bufferRef = useRef(null)
    const historyRef = useRef({ undo: [], redo: [] })
    const initialRef = useRef(null)
    const gridRef = useRef(null)
    const pendingScrollRef = useRef(null)
    const bypassBlurRef = useRef(false)

    // Dosyayı oku
    useEffect(() => {
      let cancelled = false
      const startedAt = Date.now()
      setStatus("loading")
      setLoadingStep(0)
      const stepTimer = setInterval(() => setLoadingStep((n) => Math.min(n + 1, SKS_LOADING_STEPS.length - 1)), SKS_MIN_LOADING_MS / SKS_LOADING_STEPS.length)
      initialRef.current = null
      historyRef.current = { undo: [], redo: [] }
      const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), Math.max(0, SKS_MIN_LOADING_MS - (Date.now() - startedAt))))
      file.arrayBuffer().then(wait).then((buffer) => {
        if (cancelled) return
        clearInterval(stepTimer)
        const parsed = parseWorkbook(buffer)
        bufferRef.current = buffer
        const nextData = parsed.sheets.map((s) => s.rows.map((row) => row.slice()))
        const firstIssues = validateBook(nextData, parsed)
        const firstClient = firstIssues.filter((i) => SKS_CLIENT_TYPES.includes(i.type)).sort((a, b) => SKS_SEVERITY[a.type] - SKS_SEVERITY[b.type] || a.si - b.si || a.r - b.r || a.c - b.c)
        const startSheet = firstClient[0]?.si ?? parsed.schema.personal?.si ?? 0
        setBook(parsed)
        setData(nextData)
        setEdited({})
        setActive(startSheet)
        const startSchema = [parsed.schema.personal, parsed.schema.company].find((sc) => sc?.si === startSheet)
        setSel(firstClient[0] ? { r: firstClient[0].r, c: firstClient[0].c } : { r: startSchema ? startSchema.headerRow + 1 : 0, c: 0 })
        pendingScrollRef.current = firstClient[0] ? { r: firstClient[0].r, c: firstClient[0].c } : null
        setEditing(null)
        setFilter("all")
        setFilterRows(null)
        setRuleFilter(null)
        setStatus("ready")
      }).catch(() => { clearInterval(stepTimer); if (!cancelled) setStatus("error") })
      return () => { cancelled = true; clearInterval(stepTimer) }
    }, [file])

    useEffect(() => {
      const previous = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = previous }
    }, [])

    useEffect(() => {
      if (!toast) return
      const t = setTimeout(() => setToast(""), 2600)
      return () => clearTimeout(t)
    }, [toast])

    const issues = useMemo(() => (book && data ? validateBook(data, book) : []), [book, data])
    const clientIssues = useMemo(
      () => issues.filter((i) => SKS_CLIENT_TYPES.includes(i.type)).sort((a, b) => a.si - b.si || a.r - b.r || a.c - b.c),
      [issues]
    )
    const totals = useMemo(() => countIssues(issues), [issues])
    const ruleKey = (i) => `${i.si}|${i.rule}`
    const matchesFilter = (i) => (filter === "all" || i.type === filter) && (!ruleFilter || ruleKey(i) === ruleFilter)
    if (book && !initialRef.current) initialRef.current = { hata: totals.hata, uyari: totals.uyari }
    const recognized = Boolean(book?.schema.personal)
    const canSubmit = status === "ready" && recognized && totals.hata === 0
    const editedCount = Object.keys(edited).length

    const sheet = book?.sheets[active]
    const rows = data?.[active]

    // Aktif sayfadaki hücre → sorun eşlemesi (en ağır olan gösterilir)
    const issueGrid = useMemo(() => {
      const map = {}
      clientIssues.forEach((i) => {
        if (i.si !== active || !matchesFilter(i)) return
        const row = (map[i.r] = map[i.r] || {})
        if (!row[i.c] || SKS_SEVERITY[i.type] < SKS_SEVERITY[row[i.c].type]) row[i.c] = i
      })
      return map
    }, [clientIssues, active, filter, ruleFilter])

    const rowSeverity = useMemo(() => {
      const out = {}
      Object.entries(issueGrid).forEach(([r, cols]) => {
        out[r] = Object.values(cols).some((i) => i.type === "hata") ? "hata" : "uyari"
      })
      return out
    }, [issueGrid])

    const editedGrid = useMemo(() => {
      const map = {}
      Object.keys(edited).forEach((key) => {
        const [si, r, c] = key.split(":").map(Number)
        if (si !== active) return
        ;(map[r] = map[r] || {})[c] = true
      })
      return map
    }, [edited, active])

    const numericGrid = useMemo(() => {
      const map = {}
      if (!sheet) return map
      Object.keys(sheet.numeric).forEach((key) => {
        const [r, c] = key.split(":").map(Number)
        ;(map[r] = map[r] || {})[c] = true
      })
      return map
    }, [sheet])

    const sheetSchema = useMemo(() => {
      if (!book) return null
      if (book.schema.personal?.si === active) return book.schema.personal
      if (book.schema.company?.si === active) return book.schema.company
      return null
    }, [book, active])

    const visibleCols = useMemo(() => (sheet ? sheet.colWidths.map((_, c) => c).filter((c) => !sheet.hiddenCols[c]) : []), [sheet])

    // Personel sayfasında Sicil, Ad ve Soyad sütunları sola sabitlenir; sağa kaydırıldığında kişi kaybolmaz.
    const frozen = useMemo(() => {
      const personal = book?.schema.personal
      if (!sheet || !personal || personal.si !== active) return null
      const cols = ["sicil", "ad", "soyad"].map((k) => personal.cols[k]).filter((c) => c != null && !sheet.hiddenCols[c]).sort((a, b) => a - b)
      if (!cols.length) return null
      const map = {}
      let left = SKS_ROWHEAD_W
      cols.forEach((c, i) => { map[c] = { left, last: i === cols.length - 1 }; left += Math.round(sheet.colWidths[c] * zoom) })
      map.width = left - SKS_ROWHEAD_W
      return map
    }, [book, sheet, active, zoom])

    const visibleRows = useMemo(() => {
      if (!sheet) return []
      const out = []
      for (let r = 0; r < sheet.rowCount; r++) {
        if (sheet.hiddenRows[r]) continue
        if (sheetSchema && r <= sheetSchema.headerRow) continue
        if ((filter !== "all" || ruleFilter) && sheetSchema && r > sheetSchema.headerRow && !issueGrid[r] && !filterRows?.has(`${active}:${r}`)) continue
        out.push(r)
      }
      return out
    }, [sheet, filter, ruleFilter, filterRows, sheetSchema, issueGrid, active])

    const merges = useMemo(() => {
      const map = {}
      if (!sheet) return map
      const visibleRowSet = new Set(visibleRows)
      sheet.merges.forEach((m) => {
        if (!visibleRowSet.has(m.s.r)) return
        let colSpan = 0
        for (let c = m.s.c; c <= m.e.c; c++) if (!sheet.hiddenCols[c]) colSpan += 1
        let rowSpan = 0
        for (let r = m.s.r; r <= m.e.r; r++) if (visibleRowSet.has(r)) rowSpan += 1
        for (let r = m.s.r; r <= m.e.r; r++) {
          for (let c = m.s.c; c <= m.e.c; c++) {
            const row = (map[r] = map[r] || {})
            row[c] = r === m.s.r && c === m.s.c ? { colSpan: Math.max(colSpan, 1), rowSpan: Math.max(rowSpan, 1), e: m.e } : "covered"
          }
        }
      })
      return map
    }, [sheet, visibleRows])

    const colW = (c) => Math.round(sheet.colWidths[c] * zoom)
    const rowH = (r) => Math.round(sheet.rowHeights[r] * zoom)

    const rowOffsets = useMemo(() => {
      if (!sheet) return [0]
      const out = [0]
      visibleRows.forEach((r, i) => { out[i + 1] = out[i] + Math.round(sheet.rowHeights[r] * zoom) })
      return out
    }, [sheet, visibleRows, zoom])

    const colOffsets = useMemo(() => {
      const out = {}
      let x = 0
      visibleCols.forEach((c) => { out[c] = x; x += sheet ? Math.round(sheet.colWidths[c] * zoom) : 0 })
      return out
    }, [visibleCols, sheet, zoom])

    // Satır sanallaştırma: yalnızca görünen satırlar çizilir.
    const windowRange = useMemo(() => {
      const n = visibleRows.length
      if (n === 0) return [0, 0]
      const top = Math.max(0, viewport.top - SKS_HEADER_H)
      const bottom = top + viewport.height
      let lo = 0
      let hi = n
      while (lo < hi) { const mid = (lo + hi) >> 1; if (rowOffsets[mid + 1] <= top) lo = mid + 1; else hi = mid }
      let start = Math.max(0, lo - 10)
      let end = start
      while (end < n && rowOffsets[end] < bottom) end++
      end = Math.min(n, end + 10)
      sheet.merges.forEach((m) => {
        const sIdx = visibleRows.indexOf(m.s.r)
        if (sIdx > -1 && sIdx < start && visibleRows.some((r, i) => i >= start && r <= m.e.r)) start = sIdx
      })
      return [start, end]
    }, [visibleRows, rowOffsets, viewport, sheet])

    function onGridScroll(e) {
      const el = e.currentTarget
      setViewport((v) => (Math.abs(v.top - el.scrollTop) < 8 && v.height === el.clientHeight ? v : { top: el.scrollTop, height: el.clientHeight }))
      if (hover) setHover(null)
    }

    useEffect(() => {
      const el = gridRef.current
      if (!el) return
      const ro = new ResizeObserver(() => setViewport({ top: el.scrollTop, height: el.clientHeight }))
      ro.observe(el)
      return () => ro.disconnect()
    }, [status])

    function ensureVisible(r, c) {
      const el = gridRef.current
      if (!el || !sheet) return
      const idx = visibleRows.indexOf(r)
      if (idx === -1) return
      const y = rowOffsets[idx]
      const hgt = rowOffsets[idx + 1] - y
      const x = colOffsets[c] ?? 0
      const w = colW(c)
      const viewH = el.clientHeight - SKS_HEADER_H
      const frozenW = frozen && !frozen[c] ? frozen.width : 0
      const viewW = el.clientWidth - SKS_ROWHEAD_W
      if (y < el.scrollTop) el.scrollTop = Math.max(0, y - hgt * 2)
      else if (y + hgt > el.scrollTop + viewH) el.scrollTop = y + hgt - viewH + hgt * 2
      if (frozen?.[c]) { /* sabit sütun her zaman görünür */ }
      else if (x - frozenW < el.scrollLeft) el.scrollLeft = Math.max(0, x - frozenW - 24)
      else if (x + w > el.scrollLeft + viewW) el.scrollLeft = x + w - viewW + 24
    }

    useEffect(() => {
      if (!pendingScrollRef.current || status !== "ready") return
      const target = pendingScrollRef.current
      pendingScrollRef.current = null
      afterRender(() => {
        const el = gridRef.current
        if (!el) return
        // Hücre zaten rahatça görünüyorsa kaydırılmaz; görünmüyorsa ekranın üçte birine getirilir.
        const idx = visibleRows.indexOf(target.r)
        if (idx > -1) {
          const y = rowOffsets[idx]
          const viewH = el.clientHeight - SKS_HEADER_H
          if (y < el.scrollTop || y + (rowOffsets[idx + 1] - y) > el.scrollTop + viewH) el.scrollTop = Math.max(0, y - viewH / 3)
        }
        if (!frozen?.[target.c]) {
          const x = colOffsets[target.c] ?? 0
          const w = colW(target.c)
          const frozenW = frozen ? frozen.width : 0
          const viewW = el.clientWidth - SKS_ROWHEAD_W
          if (x - frozenW < el.scrollLeft || x + w > el.scrollLeft + viewW - 16) el.scrollLeft = Math.max(0, x - frozenW - (viewW - frozenW) / 3)
        }
        gridRef.current.focus({ preventScroll: true })
      })
    })

    // ---------- Düzenleme ----------

    function applyChanges(changes, { record = true } = {}) {
      if (!changes.length) return
      setData((prev) => {
        const next = prev.slice()
        changes.forEach(({ si, r, c, next: value }) => {
          if (next[si] === prev[si]) next[si] = prev[si].slice()
          if (next[si][r] === prev[si][r]) next[si][r] = prev[si][r].slice()
          next[si][r][c] = value
        })
        return next
      })
      setEdited((prev) => {
        const next = { ...prev }
        changes.forEach(({ si, r, c, next: value }) => {
          const key = `${si}:${r}:${c}`
          if (value === book.sheets[si].rows[r][c]) delete next[key]
          else next[key] = true
        })
        return next
      })
      if (record) {
        historyRef.current.undo.push(changes)
        historyRef.current.redo = []
        forceHistory((n) => n + 1)
      }
    }

    function setCell(r, c, value) {
      const prev = rows[r][c]
      if (prev === value) return
      applyChanges([{ si: active, r, c, prev, next: value }])
    }

    function undo() {
      const entry = historyRef.current.undo.pop()
      if (!entry) return
      historyRef.current.redo.push(entry)
      applyChanges(entry.map((ch) => ({ ...ch, next: ch.prev })), { record: false })
      const last = entry[entry.length - 1]
      jumpTo(last.si, last.r, last.c)
      forceHistory((n) => n + 1)
    }

    function redo() {
      const entry = historyRef.current.redo.pop()
      if (!entry) return
      historyRef.current.undo.push(entry)
      applyChanges(entry, { record: false })
      const last = entry[entry.length - 1]
      jumpTo(last.si, last.r, last.c)
      forceHistory((n) => n + 1)
    }

    function startEdit(initial) {
      if (!rows) return
      setEditing({ r: sel.r, c: sel.c })
      setDraft(initial != null ? initial : rows[sel.r][sel.c])
    }

    function commitEdit(move) {
      if (!editing) return
      setCell(editing.r, editing.c, draft)
      setEditing(null)
      if (move) moveSel(move[0], move[1])
      afterRender(() => gridRef.current?.focus({ preventScroll: true }))
    }

    function cancelEdit() {
      setEditing(null)
      afterRender(() => gridRef.current?.focus({ preventScroll: true }))
    }

    function onEditorKey(e) {
      if (e.key === "Enter") { e.preventDefault(); bypassBlurRef.current = true; commitEdit([e.shiftKey ? -1 : 1, 0]) }
      else if (e.key === "Tab") { e.preventDefault(); bypassBlurRef.current = true; commitEdit([0, e.shiftKey ? -1 : 1]) }
      else if (e.key === "Escape") { e.preventDefault(); bypassBlurRef.current = true; cancelEdit() }
    }

    function onEditorBlur() {
      if (bypassBlurRef.current) { bypassBlurRef.current = false; return }
      if (editing) { setCell(editing.r, editing.c, draft); setEditing(null) }
    }

    function resolveCell(r, c) {
      const m = merges[r]?.[c]
      if (m === "covered") {
        const origin = sheet.merges.find((mm) => r >= mm.s.r && r <= mm.e.r && c >= mm.s.c && c <= mm.e.c)
        if (origin) return { r: origin.s.r, c: origin.s.c }
      }
      return { r, c }
    }

    function moveSel(dr, dc) {
      setSel((cur) => {
        let rIdx = visibleRows.indexOf(cur.r)
        let cIdx = visibleCols.indexOf(cur.c)
        if (rIdx === -1) rIdx = 0
        if (cIdx === -1) cIdx = 0
        const span = merges[cur.r]?.[cur.c]
        if (span && span !== "covered") {
          if (dr > 0) rIdx += span.rowSpan - 1
          if (dc > 0) cIdx += span.colSpan - 1
        }
        rIdx = Math.min(Math.max(rIdx + dr, 0), visibleRows.length - 1)
        cIdx = Math.min(Math.max(cIdx + dc, 0), visibleCols.length - 1)
        const next = resolveCell(visibleRows[rIdx], visibleCols[cIdx])
        afterRender(() => ensureVisible(next.r, next.c))
        return next
      })
    }

    function jumpTo(si, r, c, { scroll = true } = {}) {
      // Kaydırma, filtre ve sayfa değişiklikleri çizildikten sonra yapılır; aksi halde eski düzene göre hesaplanır.
      if (si !== active) setActive(si)
      if (si !== active || scroll) pendingScrollRef.current = { r, c, force: true }
      setEditing(null)
      setSel({ r, c })
      afterRender(() => gridRef.current?.focus({ preventScroll: true }))
    }

    function onGridKeyDown(e) {
      if (editing || !rows) return
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); return }
      if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); return }
      if (mod) return
      switch (e.key) {
        case "ArrowUp": e.preventDefault(); moveSel(-1, 0); return
        case "ArrowDown": e.preventDefault(); moveSel(1, 0); return
        case "ArrowLeft": e.preventDefault(); moveSel(0, -1); return
        case "ArrowRight": e.preventDefault(); moveSel(0, 1); return
        case "Tab": e.preventDefault(); moveSel(0, e.shiftKey ? -1 : 1); return
        case "Enter": case "F2": e.preventDefault(); startEdit(); return
        case "Delete": case "Backspace": e.preventDefault(); setCell(sel.r, sel.c, ""); return
        default:
          if (e.key.length === 1 && !e.altKey) { e.preventDefault(); startEdit(e.key) }
      }
    }

    function onGridCopy(e) {
      if (editing || !rows) return
      e.preventDefault()
      e.clipboardData.setData("text/plain", rows[sel.r][sel.c])
    }

    // Excel'den kopyalanan blok (sekme/satır ayrılmış) seçili hücreden itibaren yapıştırılır.
    function onGridPaste(e) {
      if (editing || !rows) return
      e.preventDefault()
      const text = e.clipboardData.getData("text/plain").replace(/\r/g, "").replace(/\n$/, "")
      const block = text.split("\n").map((line) => line.split("\t"))
      const changes = []
      const rIdx = visibleRows.indexOf(sel.r)
      const cIdx = visibleCols.indexOf(sel.c)
      block.forEach((line, dr) => line.forEach((value, dc) => {
        const r = visibleRows[rIdx + dr]
        const c = visibleCols[cIdx + dc]
        if (r == null || c == null || rows[r][c] === value) return
        changes.push({ si: active, r, c, prev: rows[r][c], next: value })
      }))
      applyChanges(changes)
      if (changes.length > 1) setToast(`${changes.length} hücre yapıştırıldı`)
    }

    function cellFromEvent(e) {
      const td = e.target.closest?.("td[data-r]")
      return td ? { td, r: Number(td.dataset.r), c: Number(td.dataset.c) } : null
    }

    function onGridMouseDown(e) {
      const hit = cellFromEvent(e)
      if (!hit) return
      if (editing && editing.r === hit.r && editing.c === hit.c) return
      if (editing) { setCell(editing.r, editing.c, draft); setEditing(null); bypassBlurRef.current = true }
      setSel({ r: hit.r, c: hit.c })
    }

    function onGridDoubleClick(e) {
      const hit = cellFromEvent(e)
      if (!hit) return
      setSel({ r: hit.r, c: hit.c })
      setEditing({ r: hit.r, c: hit.c })
      setDraft(rows[hit.r][hit.c])
    }

    function onGridMouseOver(e) {
      const hit = cellFromEvent(e)
      const issue = hit ? issueGrid[hit.r]?.[hit.c] : null
      if (!issue || (editing && editing.r === hit.r && editing.c === hit.c)) { if (hover) setHover(null); return }
      if (hover?.issue === issue) return
      const rect = hit.td.getBoundingClientRect()
      setHover({ issue, rect })
    }

    // Satır bileşenleri memo'lu kalsın diye düzenleyici olayları sabit referanslarla iletilir.
    const handlersRef = useRef({})
    handlersRef.current = { onEditorKey, onEditorBlur }
    const stableEditorKey = useRef((e) => handlersRef.current.onEditorKey(e)).current
    const stableEditorBlur = useRef(() => handlersRef.current.onEditorBlur()).current

    // ---------- Sorun listesi ----------

    const filteredIssues = useMemo(() => clientIssues.filter(matchesFilter), [clientIssues, filter, ruleFilter])

    // Özet kartları: aynı türdeki sorunlar tek kartta toplanır.
    const ruleSummary = useMemo(() => {
      const map = new Map()
      clientIssues.forEach((i) => {
        const key = ruleKey(i)
        if (!map.has(key)) map.set(key, { key, si: i.si, type: i.type, title: i.title || i.fieldLabel, fieldLabel: i.fieldLabel, column: colLetter(i.c), fix: i.fix, count: 0 })
        map.get(key).count += 1
      })
      return [...map.values()].sort((a, b) => SKS_SEVERITY[a.type] - SKS_SEVERITY[b.type] || b.count - a.count)
    }, [clientIssues])

    function firstDataRow(si) {
      const schema = [book.schema.personal, book.schema.company].find((sc) => sc?.si === si)
      return schema ? schema.headerRow + 1 : 0
    }

    function chooseRule(key) {
      if (ruleFilter === key) { setRuleFilter(null); if (filter === "all") setFilterRows(null); return }
      setRuleFilter(key)
      const matched = clientIssues.filter((i) => ruleKey(i) === key)
      setFilterRows(new Set(matched.map((i) => `${i.si}:${i.r}`)))
      if (matched[0]) jumpTo(matched[0].si, matched[0].r, matched[0].c)
    }

    function chooseFilter(type) {
      setFilter(type)
      setRuleFilter(null)
      if (type === "all") { setFilterRows(null); return }
      const typed = clientIssues.filter((i) => i.type === type)
      setFilterRows(new Set(typed.map((i) => `${i.si}:${i.r}`)))
      const first = typed.find((i) => i.si === active) || typed[0]
      if (first) jumpTo(first.si, first.r, first.c)
      else if (gridRef.current) gridRef.current.scrollTop = 0
    }

    // "Tümü" görünümünde önce hatalar gezilir; hatalar bitince uyarılara geçilir.
    const navList = useMemo(() => {
      const hasErrors = filteredIssues.some((i) => i.type === "hata")
      const list = filter === "all" && !ruleFilter && hasErrors ? filteredIssues.filter((i) => i.type === "hata") : filteredIssues.slice()
      const seen = new Set()
      return list.filter((i) => { const k = `${i.si}:${i.r}:${i.c}`; if (seen.has(k)) return false; seen.add(k); return true })
    }, [filteredIssues, filter, ruleFilter])

    const currentNavIndex = navList.findIndex((i) => i.si === active && i.r === sel.r && i.c === sel.c)

    function goIssue(step) {
      if (!navList.length) return
      let idx
      if (currentNavIndex > -1) idx = (currentNavIndex + step + navList.length) % navList.length
      else {
        const pos = (i) => i.si * 1e9 + i.r * 1e4 + i.c
        const here = active * 1e9 + sel.r * 1e4 + sel.c
        idx = step > 0 ? navList.findIndex((i) => pos(i) > here) : navList.map(pos).reverse().findIndex((p) => p < here)
        if (step < 0 && idx > -1) idx = navList.length - 1 - idx
        if (idx === -1) idx = step > 0 ? 0 : navList.length - 1
      }
      const target = navList[idx]
      jumpTo(target.si, target.r, target.c)
    }

    // Öneri uygulandıktan sonra aynı listedeki bir sonraki kayda geçilir.
    function applySuggestion(issue) {
      const idx = navList.findIndex((i) => i.si === issue.si && i.r === issue.r && i.c === issue.c)
      const next = navList.length > 1 ? navList[(idx + 1) % navList.length] : null
      applyChanges([{ si: issue.si, r: issue.r, c: issue.c, prev: data[issue.si][issue.r][issue.c], next: issue.suggestion }])
      if (next && next !== issue) jumpTo(next.si, next.r, next.c)
      setToast("Öneri uygulandı")
    }

    function applyFieldSuggestions(issue) {
      const changes = clientIssues.filter((i) => i.si === issue.si && i.fieldKey === issue.fieldKey && i.suggestion).map((i) => ({ si: i.si, r: i.r, c: i.c, prev: data[i.si][i.r][i.c], next: i.suggestion }))
      applyChanges(changes)
      setToast(`${changes.length} öneri uygulandı · Geri almak için ⌘Z / Ctrl+Z`)
    }

    // ---------- Dışa aktarma / gönderim ----------

    // Müşteri yalnızca işaretli kopyayı indirir; temiz dosya "Yüklemeyi Tamamla" sırasında üretilir.
    function download() {
      const wb = buildExportWorkbook(bufferRef.current, book, data, issues, { highlight: true })
      XLSX.writeFile(wb, exportFileName(file.name, "İşaretli"))
    }

    function submit() {
      if (!canSubmit) return
      const wb = buildExportWorkbook(bufferRef.current, book, data, issues, { highlight: false })
      const out = XLSX.write(wb, { type: "array", bookType: "xlsx" })
      const finalFile = new File([out], exportFileName(file.name, "Final"), { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      onSubmit({ issues: toLegacyIssues(issues), checkedAt: formatSksTimestamp(), editedCells: editedCount }, finalFile)
    }

    function requestClose() {
      if (editedCount > 0 && !window.confirm("Yaptığınız düzenlemeler kaydedilmedi. Çıkmak istediğinize emin misiniz?")) return
      onClose()
    }

    function handleReupload(e) {
      const next = e.target.files?.[0]
      e.target.value = ""
      if (!next) return
      if (editedCount > 0 && !window.confirm("Yeni dosya yüklendiğinde mevcut düzenlemeler silinecek. Devam edilsin mi?")) return
      onReupload(next)
    }

    // ---------- Görünüm ----------

    const selIssues = rows ? clientIssues.filter((i) => i.si === active && i.r === sel.r && i.c === sel.c) : []
    const sheetIssueCounts = useMemo(() => {
      const out = {}
      clientIssues.forEach((i) => {
        const c = (out[i.si] = out[i.si] || { hata: 0, uyari: 0 })
        c[i.type] += 1
      })
      return out
    }, [clientIssues])

    const fieldWidths = useMemo(() => (sheet ? sheet.colWidths.map((w) => Math.round(w * zoom)) : []), [sheet, zoom])
    // Starter Kit sayfalarının üstündeki boş logo alanına (Excel'deki gibi) Datassist logosu yerleştirilir.
    const logoBox = useMemo(() => {
      if (!sheet || !rows || sheetSchema) return null
      let band = 0
      while (band < visibleRows.length && rows[visibleRows[band]].every((v) => !String(v).trim())) band++
      if (band < 2 || band >= visibleRows.length) return null
      const nextRow = visibleRows[band]
      const anchor = sheet.merges
        .filter((m) => m.s.r === nextRow && m.e.c > m.s.c)
        .sort((a, b) => (b.e.c - b.s.c) - (a.e.c - a.s.c))[0]
      const bandH = rowOffsets[band]
      const height = Math.min(Math.round(bandH * 0.5), 52)
      const width = Math.round(height * (400 / 68))
      let left = colOffsets[visibleCols[1]] ?? 0
      if (anchor) {
        const x0 = colOffsets[anchor.s.c] ?? 0
        const x1 = (colOffsets[anchor.e.c] ?? x0) + colW(anchor.e.c)
        left = Math.max(0, Math.round((x0 + x1) / 2 - width / 2))
      }
      return { top: SKS_HEADER_H + Math.round((bandH - height) / 2), left: SKS_ROWHEAD_W + left, width, height }
    }, [sheet, rows, sheetSchema, visibleRows, rowOffsets, colOffsets, visibleCols])

    const [winStart, winEnd] = windowRange
    const topPad = rowOffsets[winStart] || 0
    const bottomPad = (rowOffsets[visibleRows.length] || 0) - (rowOffsets[winEnd] || 0)
    const tableWidth = SKS_ROWHEAD_W + visibleCols.reduce((t, c) => t + (fieldWidths[c] || 0), 0)

    const filterNoun = ruleFilter ? "kayıt" : { all: totals.hata ? "hata" : "uyarı", hata: "hata", uyari: "uyarı" }[filter]
    const selIssue = selIssues.find((i) => filter === "all" || i.type === filter) || null
    const fieldSuggestions = selIssue ? clientIssues.filter((i) => i.si === selIssue.si && i.fieldKey === selIssue.fieldKey && i.suggestion).length : 0
    const hasMultipleSheets = book && book.sheets.length > 1
    const nextLabel = currentNavIndex > -1
      ? `Sonraki ${filterNoun}`
      : ruleFilter ? "İlk kayda git" : { all: totals.hata ? "İlk hataya git" : "İlk uyarıya git", hata: "İlk hataya git", uyari: "İlk uyarıya git" }[filter]
    function goNext() {
      const firstError = currentNavIndex === -1 && filter === "all" && !ruleFilter ? navList.find((i) => i.type === "hata") : null
      if (firstError) jumpTo(firstError.si, firstError.r, firstError.c)
      else goIssue(1)
    }
    const nextButton = navList.length ? h`
      <span className="sks-nav">
        ${currentNavIndex > -1 ? h`<span className="sks-nav-count">${currentNavIndex + 1} / ${navList.length}</span>` : null}
        <span className="sks-nav-group">
          ${currentNavIndex > -1 ? h`<button type="button" onClick=${() => goIssue(-1)} aria-label="Önceki" title="Önceki"><${Icon} d=${ICONS.up} size=${15} /></button>` : null}
          <button type="button" onClick=${goNext}>${nextLabel} <${Icon} d=${ICONS.down} size=${15} /></button>
        </span>
      </span>
    ` : null

    const content = h`
      <div className="sks-backdrop" onMouseDown=${(e) => { if (e.target === e.currentTarget) requestClose() }}>
      <div className="sks-root" role="dialog" aria-modal="true" aria-label="Starter Kit kontrolü">
        <header className="sks-topbar">
          <div className="sks-brand">
            <span className="sks-brand-mark"><${Icon} d=${ICONS.grid} size=${18} /></span>
            <div className="sks-brand-text">
              <div className="sks-title-main">Starter Kit Kontrolü</div>
              <div className="sks-title">
                <span className="sks-file" title=${file.name}>${file.name}</span>
                ${status === "ready" && editedCount > 0 ? h`<span className="sks-pill is-draft"><i></i>${editedCount} hücre düzenlendi</span>` : null}
              </div>
            </div>
          </div>
          <div className="sks-top-actions">
            ${historyRef.current.undo.length ? h`<button type="button" className="sks-btn ghost" title="Geri al (⌘Z)" onClick=${undo}><${Icon} d=${ICONS.undo} /> Geri al</button>` : null}
            <label className="sks-btn ghost">
              <input type="file" accept=".xlsx,.xls,.csv" hidden onChange=${handleReupload} />
              <${Icon} d=${ICONS.upload} /> Yeniden Yükle
            </label>
            <button type="button" className="sks-icon-btn" aria-label="Kapat" onClick=${requestClose}><${Icon} d=${ICONS.close} size=${18} /></button>
          </div>
        </header>

        ${status === "loading" ? h`
          <div className="sks-loading" role="status" aria-live="polite">
            <div className="sks-loading-card">
              <span className="sks-loading-icon"><${Icon} d=${ICONS.grid} size=${22} /></span>
              <strong>Starter Kit'iniz kontrol ediliyor</strong>
              <p>Bu işlem birkaç saniye sürebilir. Lütfen pencereyi kapatmayın.</p>
              <ol className="sks-loading-steps">
                ${SKS_LOADING_STEPS.map((label, i) => h`
                  <li key=${label} className=${i < loadingStep ? "is-done" : i === loadingStep ? "is-active" : ""}>
                    <span className="sks-loading-dot">${i < loadingStep ? h`<${Icon} d=${ICONS.check} size=${12} stroke=${2.4} />` : null}</span>
                    ${label}
                  </li>
                `)}
              </ol>
              <div className="sks-loading-bar"><span style=${{ width: `${Math.round(((loadingStep + 1) / SKS_LOADING_STEPS.length) * 100)}%` }}></span></div>
              <small>${file.name}</small>
            </div>
          </div>
        ` : status === "error" ? h`
          <div className="sks-state is-error"><strong>Dosya açılamadı</strong><p>Dosya bozuk veya desteklenmeyen bir formatta olabilir. Lütfen .xls ya da .xlsx formatındaki Starter Kit dosyasını yeniden yükleyin.</p></div>
        ` : h`
          ${recognized ? h`
            <div className="sks-status-row">
              ${["hata", "uyari"].map((type) => {
                const isOn = filter === type && !ruleFilter
                const count = totals[type]
                return h`
                  <button key=${type} type="button" className=${`sks-seg is-${type} ${isOn ? "is-active" : ""} ${count ? "" : "is-clear"}`} disabled=${!count} aria-pressed=${isOn} onClick=${() => chooseFilter(isOn ? "all" : type)}>
                    <i></i>
                    <strong>${type === "hata" ? "Hata" : "Uyarı"}</strong>
                    <b>${count}</b>
                    <span>${type === "hata"
                      ? (count ? "Düzeltilmesi zorunlu; düzeltilmeden dosya yüklenemez" : "Yüklemeyi engelleyen hata yok")
                      : (count ? "Yüklemeyi engellemez; bilgi doğruysa dokunmayın" : "Kontrol edilecek uyarı yok")}</span>
                    ${isOn ? h`<span className="sks-chip-x" aria-label="Filtreyi kaldır" title="Filtreyi kaldır">×</span>` : null}
                  </button>
                `
              })}
              ${initialRef.current?.hata ? h`
                <span className="sks-seg-progress">
                  <span className="sks-ov-bar"><span style=${{ width: `${Math.round(Math.max(0, initialRef.current.hata - totals.hata) / initialRef.current.hata * 100)}%` }}></span></span>
                  ${Math.max(0, initialRef.current.hata - totals.hata)} / ${initialRef.current.hata} hata düzeltildi
                </span>
              ` : null}
            </div>
            ${ruleSummary.length ? h`
              <div className="sks-rule-tabs" role="tablist" aria-label="Sorun türleri">
                <span className="sks-rule-tabs-label">Sorun türleri</span>
                ${ruleSummary.map((g) => h`
                  <button key=${g.key} type="button" role="tab" title=${g.fix || ""} aria-selected=${ruleFilter === g.key}
                    className=${`sks-rule-tab is-${g.type} ${ruleFilter === g.key ? "is-active" : ""}`} onClick=${() => chooseRule(g.key)}>
                    <i></i>${g.title}<em>${g.count}</em>
                    ${ruleFilter === g.key ? h`<span className="sks-chip-x" aria-label="Filtreyi kaldır" title="Filtreyi kaldır">×</span>` : null}
                  </button>
                `)}
              </div>
            ` : null}
          ` : null}

          ${!recognized ? h`
            <div className="sks-context is-hata">
              <span className="sks-context-badge">Şablon tanınmadı</span>
              <p>Dosyada Starter Kit <b>Kişisel Bilgi</b> sayfası bulunamadı. Lütfen Datassist tarafından iletilen Starter Kit şablonunu kullanarak dosyayı yeniden yükleyin.</p>
            </div>
          ` : selIssue ? h`
            <div className=${`sks-context is-${selIssue.type}`}>
              <span className="sks-context-mark" aria-label=${SKS_TYPES[selIssue.type].label}>${selIssue.type === "hata" ? "!" : "i"}</span>
              <div className="sks-context-body">
                <strong title=${selIssue.message}>${selIssue.title || selIssue.fieldLabel}${selIssue.person ? h`<span> · ${selIssue.person}</span>` : null}</strong>
                <p>${(() => {
                  const text = selIssue.fix || selIssue.message
                  return selIssue.suggestion ? text : `${text}${/[.!?]$/.test(text) ? "" : "."} Hücreye çift tıklayıp düzeltebilirsiniz.`
                })()}</p>
              </div>
              <div className="sks-context-actions">
                ${selIssue.suggestion ? h`
                  <button type="button" className="sks-suggest" onClick=${() => applySuggestion(selIssue)}>
                    Öneriyi uygula: <b>${selIssue.suggestion}</b>
                  </button>
                ` : null}
                ${fieldSuggestions > 1 ? h`
                  <button type="button" className="sks-suggest is-solid" onClick=${() => applyFieldSuggestions(selIssue)}>
                    <${Icon} d=${ICONS.spark} size=${14} /> Tümüne uygula (${fieldSuggestions})
                  </button>
                ` : null}
                ${nextButton}
              </div>
            </div>
          ` : totals.hata + totals.uyari === 0 ? h`
            <div className="sks-context is-fixed">
              <span className="sks-context-badge">Hazır</span>
              <p><b>Tüm kontroller tamamlandı.</b> Dosyada hata veya uyarı kalmadı. Sağ alttaki <b>Yüklemeyi Tamamla</b> düğmesine basabilirsiniz.</p>
            </div>
          ` : h`
            <div className="sks-context is-neutral">
              <p>Yukarıdan bir sorun türü seçin ya da <b>${totals.hata ? "İlk hataya git" : "İlk uyarıya git"}</b> düğmesiyle başlayın. Tabloda kırmızı hücreler hata, mor hücreler uyarıdır.</p>
              <div className="sks-context-actions">${nextButton}</div>
            </div>
          `}

          <div className="sks-main">
            <div className="sks-work">
            <div
              ref=${gridRef}
              className="sks-grid"
              tabIndex=${0}
              onScroll=${onGridScroll}
              onKeyDown=${onGridKeyDown}
              onCopy=${onGridCopy}
              onPaste=${onGridPaste}
              onMouseDown=${onGridMouseDown}
              onDoubleClick=${onGridDoubleClick}
              onMouseOver=${onGridMouseOver}
              onMouseLeave=${() => setHover(null)}
            >
              <table className="sks-table" style=${{ width: tableWidth }}>
                <colgroup>
                  <col style=${{ width: SKS_ROWHEAD_W }} />
                  ${visibleCols.map((c) => h`<col key=${c} style=${{ width: fieldWidths[c] }} />`)}
                </colgroup>
                <thead>
                  <tr>
                    <th className="sks-corner"></th>
                    ${visibleCols.map((c) => {
                      const field = book.fieldLabels[active]?.[c]
                      const labels = book.headerLabels[active]
                      const tr = labels ? labels.tr[c] || field || "" : ""
                      const en = labels ? labels.en[c] || "" : ""
                      return h`
                        <th key=${c} style=${frozen?.[c] ? { left: frozen[c].left } : undefined} className=${`sks-colhead ${sel.c === c ? "is-active" : ""} ${labels ? "is-labeled" : ""} ${field ? "has-field" : ""} ${frozen?.[c] ? "is-frozen" : ""} ${frozen?.[c]?.last ? "is-frozen-last" : ""}`} title=${[en, tr].filter(Boolean).join(" / ")}>
                          <span className="sks-col-letter">${colLetter(c)}</span>
                          ${labels ? h`
                            <span className="sks-col-en">${en || "\u00a0"}</span>
                            <span className="sks-col-field">${tr || "\u00a0"}</span>
                          ` : null}
                        </th>
                      `
                    })}
                  </tr>
                </thead>
                <tbody>
                  ${topPad ? h`<tr className="sks-pad" style=${{ height: topPad }}><td colSpan=${visibleCols.length + 1}></td></tr>` : null}
                  ${visibleRows.slice(winStart, winEnd).map((r) => h`
                    <${SheetRow}
                      key=${r}
                      frozen=${frozen}
                      r=${r}
                      cells=${rows[r]}
                      height=${rowH(r)}
                      visibleCols=${visibleCols}
                      rowIssues=${issueGrid[r]}
                      rowEdited=${editedGrid[r]}
                      mergeRow=${merges[r]}
                      selC=${sel.r === r ? sel.c : -1}
                      editing=${editing && editing.r === r ? editing : null}
                      draft=${editing && editing.r === r ? draft : ""}
                      headerZone=${Boolean(sheetSchema && r <= sheetSchema.headerRow)}
                      numericRow=${numericGrid[r]}
                      rowSeverity=${rowSeverity[r]}
                      onDraft=${setDraft}
                      onEditorKey=${stableEditorKey}
                      onEditorBlur=${stableEditorBlur}
                      fieldWidths=${fieldWidths}
                    />
                  `)}
                  ${bottomPad ? h`<tr className="sks-pad" style=${{ height: bottomPad }}><td colSpan=${visibleCols.length + 1}></td></tr>` : null}
                </tbody>
              </table>
              ${logoBox ? h`<img className="sks-sheet-logo" src=${SKS_LOGO_SRC} alt="Datassist" style=${logoBox} />` : null}
              </div>
            </div>
          </div>

          ${hasMultipleSheets ? h`
            <div className="sks-tabs" role="tablist" aria-label="Sayfalar">
              ${book.sheets.map((s, si) => {
                const counts = sheetIssueCounts[si]
                const count = counts ? (filter === "all" ? counts.hata + counts.uyari : counts[filter]) : 0
                return h`
                  <button key=${s.name} type="button" role="tab" aria-selected=${si === active} className=${`sks-tab ${si === active ? "is-active" : ""}`}
                    onClick=${() => { if (si !== active) { setActive(si); setEditing(null); setSel({ r: firstDataRow(si), c: 0 }); if (gridRef.current) { gridRef.current.scrollTop = 0; gridRef.current.scrollLeft = 0 } } }}>
                    ${s.name}
                    ${count ? h`<span className=${`sks-tab-badge ${filter === "uyari" || !counts.hata ? "is-uyari" : "is-hata"}`}>${count}</span>` : null}
                  </button>
                `
              })}
            </div>
          ` : null}

          <footer className="sks-footer">
            <p className=${totals.hata > 0 || !recognized ? "is-block" : ""}>
              ${!recognized
                ? "Dosya Starter Kit şablonuna uygun olmadığı için yüklenemez."
                : totals.hata > 0
                  ? h`<b>${totals.hata} hata</b> giderilmeden yükleme tamamlanamaz.${totals.uyari ? ` ${totals.uyari} uyarının kontrol edilmesi önerilir.` : ""}`
                  : totals.uyari > 0
                    ? h`Hata yok. <b>${totals.uyari} uyarı</b> gönderimi engellemez; kontrol edilmesi önerilir.`
                    : "Dosya yüklenmeye hazır."}
            </p>
            <div className="sks-footer-actions">
              <button type="button" className="sks-btn" title="Kalan hata ve uyarılar renkli olarak işaretlenmiş Excel dosyası" onClick=${download}>
                <${Icon} d=${ICONS.download} /> Excel'i İndir
              </button>
              <span className="sks-submit-wrap" title=${canSubmit ? "" : !recognized ? "Dosya Starter Kit şablonuna uygun değil." : `${totals.hata} hata giderilmeden yükleme tamamlanamaz.`}>
                <button type="button" className="sks-btn primary" disabled=${!canSubmit} onClick=${submit}>
                  ${canSubmit ? h`<${Icon} d=${ICONS.check} />` : h`<${Icon} d=${ICONS.lock} />`} Yüklemeyi Tamamla
                </button>
              </span>
            </div>
          </footer>
        `}

        ${hover ? h`<${HoverCard} hover=${hover} />` : null}
        ${toast ? h`<div className="sks-toast" role="status">${toast}</div>` : null}
      </div>
      </div>
    `
    return ReactDOM.createPortal(content, document.body)
  }

  function HoverCard({ hover }) {
    const { issue, rect } = hover
    const width = 320
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12)
    const below = rect.bottom + 150 < window.innerHeight
    const style = below ? { left, top: rect.bottom + 8, width } : { left, bottom: window.innerHeight - rect.top + 8, width }
    return h`
      <div className=${`sks-hover is-${issue.type}`} style=${style} role="tooltip">
        <div className="sks-hover-head">
          <span className="sks-hover-badge">${SKS_TYPES[issue.type].label}</span>
          <strong>${issue.fieldLabel}</strong>
          <span className="sks-hover-ref">${cellRef(issue.r, issue.c)}</span>
        </div>
        ${issue.person ? h`<div className="sks-hover-person">${issue.person}</div>` : null}
        <p>${issue.message}</p>
        ${issue.suggestion ? h`<div className="sks-hover-suggest">Öneri: <b>${issue.suggestion}</b></div>` : null}
      </div>
    `
  }

  function formatSksTimestamp() {
    return new Date().toLocaleString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", "")
  }

  window.StarterKitSheetEditor = StarterKitSheetEditor
  window.StarterKitSheetEditor.helpers = { parseWorkbook, validateBook, buildExportWorkbook, skNorm, colLetter, isValidDate, parseAmount }
})()
