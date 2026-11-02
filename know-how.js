// Know-How: implementasyon ekibinin müşteriyle ilk toplantıdan itibaren doldurduğu Teknik Dokümantasyon'un
// (eski "Teknik Dokümantasyon.xls") ekran hali. Grup (workgroup) bazında tutulur; implementasyon, operasyon ve
// destek ekipleri tikleyip not ekleyebilir. Modüller ve bordro kalemleri Dakika'daki tanımlardan okunur.
// Canlıya geçişte "Dasi'ye Aktar" ile workgroup bazında Dasi knowledge base'ine gönderilir.
// Erişim bilgilerinin (SGK, İŞKUR, 1003B, OTOBES, dosya şifreleri) değerleri burada tutulmaz ve Dasi'ye gitmez.
;(function () {
  const { useEffect, useMemo, useRef, useState } = React
  const h = htm.bind(React.createElement)

  const STORE_KEY = "sdp-know-how-v1"
  const ORG_SETUP_KEY = "sdp-starter-kit-setup-results-v1"

  const TEAMS = {
    imp: { label: "İmplementasyon Ekibi", short: "İMP" },
    ops: { label: "Operasyon Ekibi", short: "OPS" },
    destek: { label: "Destek Ekibi", short: "DES" }
  }

  const ICON = {
    book: ["M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z", "M4 19.5A2 2 0 0 1 6 18h13", "M9 7h6M9 11h4"],
    check: "M20 6 9 17l-5-5",
    close: "M6 6l12 12M18 6 6 18",
    chevron: "m9 6 6 6-6 6",
    down: "m6 9 6 6 6-6",
    sync: ["M21 12a9 9 0 0 1-15.5 6.2L3 16", "M3 12a9 9 0 0 1 15.5-6.2L21 8", "M21 3v5h-5M3 21v-5h5"],
    note: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"],
    lock: ["M5 11h14v10H5z", "M8 11V7a4 4 0 0 1 8 0v4"],
    plus: "M12 5v14M5 12h14",
    trash: ["M3 6h18", "M8 6V4h8v2", "M6 6l1 14h10l1-14"],
    send: ["M22 2 11 13", "M22 2 15 22l-4-9-9-4 20-7Z"],
    download: ["M12 3v12", "m7 10 5 5 5-5", "M5 20h14"],
    search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16", "m21 21-4.3-4.3"],
    alert: ["M12 9v4", "M12 17h.01", "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"],
    spark: ["M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z", "M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z"],
    link: ["M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7", "M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"],
    building: ["M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17", "M3 21h18", "M10 7h1M13 7h1M10 11h1M13 11h1M10 15h1M13 15h1"],
    scale: ["M12 3v18", "M5 21h14", "M5 7h14", "m5 7-3 7a3 3 0 0 0 6 0Z", "m19 7-3 7a3 3 0 0 0 6 0Z"],
    flag: ["M4 22V4", "M4 4h12l-2 4 2 4H4"],
    db: ["M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3Z", "M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5", "M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"]
  }

  const Icon = ({ d, size = 16, stroke = 1.7 }) => h`
    <svg width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth=${stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">${[].concat(d).map((p, i) => h`<path key=${i} d=${p} />`)}</svg>
  `

  const cx = (...parts) => parts.filter(Boolean).join(" ")

  // ---------- Şema: Teknik Dokümantasyon.xls bölümleri ----------

  // Zorunlu BES (OKS) geçiş takvimi: işyerindeki çalışan sayısına göre başlangıç tarihi.
  const BES_SCHEDULE = [
    { min: 1000, date: "01.01.2017", range: "1000 ve üzeri" },
    { min: 250, date: "01.04.2017", range: "250-999" },
    { min: 100, date: "01.07.2017", range: "100-249" },
    { min: 50, date: "01.01.2018", range: "50-99" },
    { min: 10, date: "01.07.2018", range: "10-49" },
    { min: 5, date: "01.01.2019", range: "5-9" }
  ]

  function besStartDate(orgCounts) {
    const count = parseInt(String(orgCounts?.employee ?? "").replace(/\D/g, ""), 10)
    if (!Number.isFinite(count)) return null
    const row = BES_SCHEDULE.find((r) => count >= r.min)
    return row ? `${row.date} (${row.range} çalışan)` : "Zorunlu değil (5'ten az çalışan)"
  }

  const yn = (id, label, extra) => ({ id, label, type: "yesno", ...extra })
  const tx = (id, label, extra) => ({ id, label, type: "text", ...extra })
  const lt = (id, label, extra) => ({ id, label, type: "longtext", ...extra })
  const sel = (id, label, options, extra) => ({ id, label, type: "select", options, ...extra })
  const head = (label) => ({ heading: label })

  const STANDARD_EXIT = "Standart çıkış süreci uygulanacaktır."

  const SECTIONS = [
    {
      id: "profil", title: "Firma Profili", desc: "Proje, hizmet tipi ve firmanın büyüklüğü.",
      fields: [
        tx("proje", "Proje"),
        tx("hazirlayan", "Hazırlayan"),
        sel("dil", "Yazışma Dili", ["Türkçe", "İngilizce", "Türkçe-İngilizce"]),
        sel("hizmetTipi", "Hizmet Tipi", ["Bordrolama", "Bordrolama-Dakika", "Dakika (SaaS)"]),
        tx("sirketSayisi", "Şirket Sayısı", { org: "company" }),
        tx("isyeriSayisi", "İşyeri Sayısı", { org: "workplace" }),
        tx("personelSayisi", "Personel Sayısı", { org: "employee" }),
        tx("turnover", "Turnover Bilgisi"),
        tx("bordroProgrami", "Bordro Programı", { hint: "Geçiş öncesi kullanılan program" }),
        tx("bordroProvider", "Bordro Provider")
      ]
    },
    {
      id: "iletisim", title: "İletişim ve Yetkilendirme", desc: "Müşteri tarafındaki muhataplar ve Dakika yetkileri.",
      kind: "contacts",
      fields: [lt("dakikaYetki", "Dakika Yetkilendirmeleri", { hint: "Kime hangi yetki verildi?" })]
    },
    {
      id: "mevzuat", title: "Ücret, SGK ve Mevzuat", desc: "Kanun türleri, ücret tipleri, sendika ve huzur hakkı.",
      fields: [
        head("SGK Kanun Türleri"),
        yn("k5510", "5510"), yn("k14857", "14857"), yn("k5746", "5746 / 4691"), yn("k6111", "6111"), yn("emekli", "Emekli"),
        yn("digerTesvik", "Diğer Teşvikler"), yn("imalat", "İmalat Sektörü mevcut mu?"),
        head("Uygulanan Ücret Tipleri"),
        yn("ucretBrut", "Brüt"), yn("ucretNet", "Net"), yn("ucretAylik", "Aylık"), yn("ucretSaatlik", "Saatlik"), yn("ucretGunluk", "Günlük"),
        head("Sendika"),
        yn("sendikali", "Sendikalı mı?"),
        yn("cocukAile", "Sendikalı ise çocuk ve/veya aile yardımı yapılır mı?"),
        head("Huzur Hakkı ve Stajyer"),
        yn("stajyer", "SGK'sız stajyer mevcut mu?"),
        yn("huzurHakki", "Huzur hakkı ödemesi mevcut mu?"),
        lt("huzurKosul", "Huzur hakkı kimlere / hangi koşulda yapılıyor?"),
        head("Muhtasar Prim Hizmet Beyannamesi"),
        sel("muhsgkVeren", "Kim tarafından veriliyor?", ["Şirket kendi şifresiyle", "SMM/YMM şifresiyle", "Bilinmiyor / Diğer"])
      ]
    },
    { id: "moduller", title: "Modüller", desc: "Firmanın kullandığı Dakika modülleri. Yalnız implementasyon ekibi işaretler.", kind: "modules" },
    { id: "erisim", title: "Erişim Bilgileri", desc: "Şifreler bu ekranda tutulmaz; yalnız kasada kayıtlı olup olmadığı izlenir.", kind: "credentials" },
    {
      id: "yasal", title: "Yasal Bildirim Süreçleri", desc: "Datassist'in yürüteceği bildirimler ve bordro kuralları.",
      fields: [
        yn("otoBes", "Otomatik BES süreci"),
        tx("otoBesTarih", "Otomatik BES başlama tarihi", { derive: besStartDate }),
        yn("sgkSifreDegis", "SGK şifreleri değiştirilsin mi?"),
        yn("manuelKalem", "Manuel hesaplanan, kural setiyle otomatikleştirilmesi istenen kalem var mı?"),
        yn("yemekKart", "Yemek kartı kullanımı var mı? (markete açık / kapalı)"),
        sel("maasGun", "Eksik günde maaş ödeme günü", ["Takvim günü", "30 gün üzerinden"]),
        yn("izinParasiOnceden", "İzin parası önceden ödeniyor mu?"),
        head("Bildirimler"),
        yn("iseGiris", "İşe Giriş Bildirgesi"), yn("istenCikis", "İşten Çıkış Bildirgesi"),
        yn("iskurCizelge", "İŞ-KUR Aylık İşgücü Çizelgesi"), yn("kimlikForm", "Kimlik Bilgilendirme Formu"),
        yn("muhsgkBildirim", "MUHSGK Bildirimi"), yn("isGoremezlik", "İş Göremezlik Bildirimi"),
        yn("isyeriHekimi", "İşyeri Hekimi Onaylama"), yn("muhtasar", "Muhtasar")
      ]
    },
    {
      id: "cikis", title: "İşten Çıkış ve Hesaplamalar", desc: "Kıdem, ihbar, giydirilmiş ücret ve karşılık raporları.",
      fields: [
        lt("kidem", "Kıdem hesaplamaları", { presets: ["Yasal kıdem tazminatı hesaplaması"] }),
        lt("ihbar", "İhbar hesaplamaları", { presets: ["Yasal ihbar tazminatı hesaplaması"] }),
        lt("giydirilmisHaric", "Bordroda yer alıp giydirilmiş ücrete dahil olmayan ödemeler", { presets: ["Bordroda yer alıp giydirilmiş ücrete dahil olmayan ödeme yoktur."] }),
        lt("giydirilmisDahil", "Bordroda yer almayıp giydirilmiş ücrete dahil olan ödemeler", { presets: ["Bordroda yer almayıp giydirilmiş ücrete dahil olan ödeme yoktur."] }),
        lt("kismiOdeme", "Çıkışta kısmi (kıst) yapılan ödemeler"),
        lt("ayOrtasi", "Ay ortası çıkışı ödeme tarihi", { presets: ["Ay ortası işten çıkış yapan personelin maaşı ay sonunda ödenir."] }),
        lt("cikisOnay", "İşten çıkış onayı", { presets: [STANDARD_EXIT] }),
        lt("cikisEk", "Çıkış işlemine dair ek detaylar", { presets: [STANDARD_EXIT] }),
        lt("kidemKarsilik", "Kıdem karşılığı raporu detayları", { presets: ["Talep edilen bir kıdem karşılık raporu yoktur."] }),
        lt("izinKarsilik", "İzin karşılığı raporu detayları", { presets: ["Talep edilen bir izin karşılık raporu yoktur."] })
      ]
    },
    {
      id: "islem", title: "İşlem Detayları", desc: "Kurulumda Dakika üzerinde yapılan ayarlar ve kontroller.",
      fields: [
        yn("puantaj", "Firmaya özel puantaj hazırlanması"),
        yn("girisCikisForm", "Firmaya giriş-çıkış formu hazırlanması"),
        yn("takvim", "Yıllık çalışma takvimi"),
        yn("vkn", "Fatura düzenlenecek VKN girilmesi"),
        yn("payrollServis", "\"Payroll Servis ile hesaplansın mı\" implementasyon şirketinde tikli"),
        yn("damgaMahsup", "Damga vergisine mahsup oranı uygula tikinin kaldırılması", { hint: "Ar-Ge'li firmada canlıda otomatik tikli olur" }),
        yn("filtreleme", "Filtreleme"),
        yn("tesvikSorgu", "Teşvik sorgulama"),
        yn("dakikaYetkiVerildi", "Dakika yetkilendirme"),
        yn("sdpAktif", "SDP (Workspace) aktifleştirme"),
        yn("dakikaSifre", "Dakika şifre gönderimi"),
        yn("musteriBilgiFormu", "Müşteri bilgi formu girişi"),
        yn("icraNafakaModul", "İcra-nafaka dosyasının icra modülüne tanımlanması"),
        yn("duzenliOdeme", "Düzenli ödemeler dosyası"),
        yn("paralelKopya", "Sistem üzerinden paralel verilerin kopyalanması"),
        yn("raporluCalisilmadi", "Raporlu sürelerde \"çalışılmamıştır\" tiklensin mi?", { hint: "Müşteriden teyit alınarak ilerlenmeli" }),
        yn("payOps", "PayOps robotik rapor onaylama listesine eklendi mi?"),
        yn("sendikaCalculator", "Sendikalı ise calculator tanımlandı mı?")
      ]
    },
    {
      id: "bordro", title: "Bordro Uygulamaları", desc: "Kesinti süreçleri, çalışma bölünmesi ve puantaj.",
      fields: [
        head("Takip Edilen Kesinti Süreçleri"),
        lt("icra", "İcra"), lt("nafaka", "Nafaka"), lt("taksitliAvans", "Taksitli avans"),
        head("Çalışma ve Puantaj"),
        lt("calismaBolunme", "Çalışma hafta içi / hafta sonu / genel tatil olarak bölünüyor mu?"),
        lt("izinGosterim", "Kullanılan yıllık izin / rapor gün sayısı bordroda gösteriliyor mu?"),
        lt("puantajDetay", "Puantaj (boş puantaj gönderimi + gelen puantajda dikkat edilecekler)", { presets: ["Dakika'da Raporlar alanındaki \"Boş Puantaj Raporu\" çekilerek müşteriye iletilir."] })
      ]
    },
    { id: "kalemler", title: "Bordro Kalemleri", desc: "Dakika'daki kalem tanımları ve her kalemin hesaplama notu.", kind: "kalems", source: "dakika" },
    {
      id: "odeme", title: "Ödeme İşlemleri", desc: "Banka dosyası ve ödeme takvimi.",
      fields: [
        lt("odemeDisketi", "Ödeme disketi ve detayları", { hint: "Banka, yüklemeyi kim yapıyor?" }),
        tx("maasTarih", "Maaş ödeme tarihi"), tx("maasYukleme", "Maaş dosyası yükleme tarihi"),
        lt("digerOdemeler", "Diğer ödemeler (avans vb.)")
      ]
    },
    {
      id: "raporlar", title: "Raporlar ve Bordro Gönderimi", desc: "Standart ve firmaya özel raporlar, entegrasyon.",
      fields: [
        lt("maliyetRaporu", "Maliyet raporu", { presets: ["Standart"] }),
        lt("bordroIcmali", "Bordro icmali", { presets: ["Standart"] }),
        lt("muhasebeRaporu", "Muhasebe raporu"),
        tx("muhasebeTarih", "Muhasebe raporunun finansa verilme tarihi"),
        lt("digerRaporlar", "Diğer raporlar"),
        yn("entegrasyon", "Entegrasyon mevcut mu?"),
        lt("bordroGonderim", "Bordro gönderimi (fiziki gönderim, alıcı, gruplama)"),
        head("Online Bordro"),
        yn("onlineBordro", "Online bordro görüntüleme"),
        yn("bordroMail", "Bordro çalışanın mail adresine gitsin"),
        yn("dakikaKullanici", "Dakika kullanıcısı")
      ]
    },
    { id: "isler", title: "Firmaya Özel İşler", desc: "Açılan işler ve yazılım geliştirmeleri.", kind: "jobs" },
    { id: "notlar", title: "Ekip Notları", desc: "Tüm bölümlerden gelen notlar; genel notlar da buraya.", kind: "notes" },
    { id: "checklist", title: "İmplementasyon Check List", desc: "Sürecin adımları. Dasi'ye aktarılmaz.", kind: "checklist", internal: true },
    { id: "devir", title: "Devir Onayı", desc: "İmplementasyon → Operasyon devir imzaları.", kind: "signoff" }
  ]

  const SECTION_GROUPS = [
    { id: "firma", label: "Firma", sections: ["profil", "iletisim"] },
    { id: "bordro", label: "Bordro ve Mevzuat", sections: ["mevzuat", "yasal", "bordro", "cikis", "odeme", "raporlar"] },
    { id: "dakika", label: "Dakika Kurulumu", sections: ["moduller", "kalemler", "islem", "erisim"] },
    { id: "devir", label: "Devir", sections: ["isler", "notlar", "checklist", "devir"] }
  ]
  const SECTION_ORDER = SECTION_GROUPS.flatMap((g) => g.sections)
  SECTIONS.sort((a, b) => SECTION_ORDER.indexOf(a.id) - SECTION_ORDER.indexOf(b.id))
  SECTIONS.forEach((s) => { s.group = SECTION_GROUPS.find((g) => g.sections.includes(s.id))?.id })

  const CREDENTIALS = [
    { id: "dosya", label: "Dosya şifreleri" },
    { id: "sgk", label: "SGK şifreleri", hint: "Kullanıcı adı, işyeri kodu, sistem ve işyeri şifresi" },
    { id: "iskur", label: "İŞKUR şifreleri" },
    { id: "muhsgk", label: "1003B MUHSGK şifreleri" },
    { id: "otobes", label: "OTOBES şifreleri" }
  ]

  const CHECKLIST = [
    "Satış müşteriyi implementasyona yönlendirdi mi?",
    "Müşteriye implementasyon maili gönderildi mi?",
    "Müşteri mail adresi açıldı mı?",
    "Proje kodu açıldı mı?",
    "Müşteri ile implementasyon toplantısı yapıldı mı?",
    "Müşterinin modül talebi var mı?",
    "Müşterinin rapor geliştirme veya entegrasyon talebi var mı?",
    "Starter Kit geldi mi?",
    "Analiz için gerekli dosyalar talep edildi mi?",
    "Modül talebi destek ekibine iletildi mi?",
    "Kurulum yapıldı mı?",
    "Müşteri Ar-Ge kapsamındaysa Ar-Ge calculator tanımlaması desteğe iletildi mi?",
    "Müşteri sendikalıysa fark bordrosu tanımlaması desteğe iletildi mi?",
    "Bordro analizi yapıldı mı?",
    "Masraf merkezi kategori kodu açıldı mı?",
    "Paralel çalışıldı mı?",
    "Müşteriye analiz maili gönderildi mi?",
    "Müşteriden çalışma için onay alındı mı?",
    "Muhasebe raporu kuruldu mu?",
    "Live hazırlıkları maili gönderildi mi?",
    "Canlıya kopyalama yapıldı mı?",
    "Operasyon teşvik talebi varsa teşvik tanımlamaları yapıldı mı?",
    "Müşteri operasyona devire hazır mı?",
    "Müşteri operasyona devredildi mi?",
    "Müşteri SaaS müşterisi ise eğitim planlandı mı?"
  ].map((label, i) => ({ id: `c${i + 1}`, label }))

  // İmplementasyon imzacısı şirkete atanan sorumlu uzmandır ve onay gerektirmez (uzman değişirse kendiliğinden güncellenir);
  // operasyon imzacıları OGY / MT listesinden seçilip onaylanır.
  const SIGNOFF = [
    { id: "impYonetici", label: "İmplementasyon Yöneticisi", team: "imp", source: "assignee" },
    { id: "opsGrup", label: "Operasyon Grup Yöneticisi", team: "ops", people: "ogy" },
    { id: "opsKoordinator", label: "Müşteri Temsilcisi", team: "ops", people: "mt" }
  ]
  const SIGNOFF_APPROVALS = SIGNOFF.filter((s) => s.source !== "assignee")

  // Operasyon kadrosu (mock). Gerçekte SDP kullanıcılarından OGY / MT rolüyle gelir.
  const OPS_PEOPLE = {
    ogy: ["Serkan Yıldız", "Burcu Karataş", "Murat Demirel", "Selin Aksoy", "Onur Çetinkaya", "Derya Kılıç"],
    mt: ["Elif Aydın", "Can Öztürk", "Merve Şahin", "Emre Koç", "Ayşe Yalçın", "Tolga Arslan", "Zeynep Erdem", "Hakan Polat"]
  }

  // ---------- Dakika kaynağı ----------
  // Şimdilik grup adına göre deterministik örnek veri döner. Dakika'da kalem tanımlarının
  // okunacağı yer netleşince yalnız readDakikaSnapshot gerçek servise bağlanacak; ekran aynı kalır.

  const DAKIKA_MODULES = [
    { id: "bordrolama", label: "Bordrolama", desc: "Bordro hesaplama ve yasal bildirimler" },
    { id: "izin", label: "İzin Modülü", desc: "İzin talep, onay ve bakiye takibi" },
    { id: "avans", label: "Avans Modülü", desc: "Avans talepleri ve bordro kesintisi" },
    { id: "fazlaMesai", label: "Fazla Mesai", desc: "Fazla mesai girişleri ve onayı" },
    { id: "masraf", label: "Masraf", desc: "Masraf beyanı ve ödemeye aktarım" },
    { id: "operasyonTesvik", label: "Operasyon Teşvik", desc: "Datassist'in yürüttüğü teşvik takibi" },
    { id: "uzmanTesvik", label: "Uzman Teşvik", desc: "Teşvik uzmanı analizi" }
  ]

  const KALEM_GROUPS = [
    { id: "mesai", label: "Mesai Kalemleri", detail: ["aciklama", "sira"] },
    { id: "fazla", label: "Fazla Mesai Kalemleri", detail: ["aciklama", "detay"] },
    { id: "odeme", label: "Ödeme Kalemleri", detail: ["aciklama", "sira", "detay"] },
    { id: "brut", label: "Brütleştirme Amaçlı Ödemeler", detail: ["aciklama", "sira", "detay"] },
    { id: "kesinti", label: "Bordro Kesinti Kalemleri", detail: ["aciklama", "sira", "detay"] },
    { id: "aylik", label: "Bordro Aylık Değerler", detail: ["aciklama"] }
  ]

  const KALEM_DETAIL_LABELS = { aciklama: "Açıklama", sira: "Hesaplama sırası", detay: "Detay" }

  const TR_CALISMA = "Türkiye Çalışma"
  const TR_GENEL = "Türkiye Genel Parametreler"
  const MUAF_KESINTI = "SskMuafEkseption|GvMuafEkseption|DvMuafEkseption"

  // [kod, etiket, İngilizce, grup, birim, öncelik, katsayı, parametre, muaflık, her firmada var mı]
  const KALEM_CATALOG = [
    ["normalMesai", "Normal Çalışma", "Salary", "mesai", "Günlük", 10010, 1, TR_CALISMA, "", true],
    ["haftaTatiliNormalMesaisi", "Hafta Tatili", "Weekend Normal Salary", "mesai", "Günlük", 10095, 1, TR_CALISMA, "", true],
    ["genelTatilMesaisiGunluk", "Genel Tatil", "General Working Holiday", "mesai", "Günlük", 10068, 1, TR_GENEL, "", true],
    ["yillikIzin", "Yıllık İzin", "# of Utilized Vacation Days", "mesai", "Günlük", 10060, 1, TR_CALISMA, "", true],
    ["ucretliIzin", "Ücretli İzin", "Paid Leave", "mesai", "Günlük", 10080, 1, TR_CALISMA, ""],
    ["ucretsizIzin", "Ücretsiz İzin", "Unpaid Vacation", "mesai", "Günlük", 10100, 0, TR_CALISMA, "", true],
    ["eksikGunSayisi", "Eksik Gün Sayısı", "Missing Day Count", "mesai", "Günlük", 15500, 0, TR_CALISMA, "", true],
    ["normalMesaiSaatlik", "Normal Çalışma Saat", "Hourly Base Salary", "mesai", "Saatlik", 10020, 1, TR_CALISMA, ""],
    ["fazlaMesai150", "Fazla Mesai 150", "Overtime 150", "fazla", "Saatlik", 10200, 1.5, TR_CALISMA, "", true],
    ["fazlaMesai200", "Fazla Mesai 200", "Overtime 200", "fazla", "Saatlik", 10300, 2, TR_CALISMA, ""],
    ["fazlaMesai100", "Fazla Mesai 100", "Overtime at 1 rate", "fazla", "Saatlik", 10355, 1, TR_CALISMA, ""],
    ["genelTatilFazlaMesai", "Genel Tatil Fazla Mesaisi", "General Holiday Overtime", "fazla", "Saatlik", 10345, 1, TR_GENEL, ""],
    ["ikramiye", "İkramiye", "Bonus-Premium", "odeme", "", 20110, null, TR_GENEL, ""],
    ["yolParasi", "Yol Parası", "Transportation Allowance", "odeme", "", 20350, null, TR_GENEL, "", true],
    ["bayramYardimi", "Bayram Yardımı", "Feast Allowance", "odeme", "", 20370, null, TR_GENEL, ""],
    ["ekOdeme", "Ek Ödeme", "Additional payment", "odeme", "", 20520, null, TR_GENEL, "", true],
    ["performansPrimi", "Performans Primi", "Performance Bonus", "odeme", "", 20260, null, TR_GENEL, ""],
    ["satisPrimi", "Satış Primi", "Sales Premiums", "odeme", "", 20210, null, TR_GENEL, ""],
    ["ihbarTazminati", "İhbar Tazminatı", "Informing Compensation", "odeme", "", 20950, null, TR_GENEL, "SskMuafEkseption", true],
    ["kidemTazminat", "Kıdem Tazminatı", "Seniority Payment", "odeme", "", 20960, null, TR_GENEL, "SskMuafEkseption|GvMuafEkseption|OsMuafEkseption", true],
    ["izinParasi", "Kullanılmayan Yıllık İzin Parası", "Vacation Payments", "odeme", "", 20900, null, TR_GENEL, "", true],
    ["hayatSigortasi", "Hayat S.", "Life Insurance BIK", "brut", "", 24500, null, TR_GENEL, "OzelSigortaGvEkseption|OsMuafEkseption"],
    ["saglikSigortasi", "Sağlık S.", "Health Insurance", "brut", "", 24460, null, TR_GENEL, "OzelSigortaSskEkseption|OzelSigortaGvEkseption|OsMuafEkseption", true],
    ["yemekKarti", "Yemek Kartı", "Food Card", "brut", "", 21957, null, TR_GENEL, "YemekParasiGvEkseption|YemekParasiDvEkseption|YemekParasiSskEkseption"],
    ["digerKesinti", "Diğer Kesinti", "Other Deduction", "kesinti", "", 80069, null, TR_GENEL, MUAF_KESINTI, true],
    ["maasAvans1", "Maaş Avansı", "Salary Advance 1", "kesinti", "", 106005, null, TR_GENEL, MUAF_KESINTI, true],
    ["trafikCezasiKesintisi", "Trafik Cezası Kesintisi", "Traffic Fines Deductions", "kesinti", "", 80396, null, TR_GENEL, MUAF_KESINTI],
    ["fazlaMesaiKesintisi", "Fazla Mesai Kesintisi", "Over Time Deduction", "kesinti", "", 80420, null, TR_GENEL, MUAF_KESINTI],
    ["eksikGunNedeni", "Eksik Gün Nedeni", "Missing Day Reason", "aylik", "", null, null, TR_GENEL, "", true],
    ["calismayaTabiGun", "Çalışmaya Tabi Gün Sayısı", "Working Day Count", "aylik", "", null, null, TR_GENEL, "", true],
    ["ozelSaglikCalisan", "Çalışanın Yaptırdığı Özel Sağlık S.", "Employee Private Health Ins.", "aylik", "", null, null, TR_GENEL, ""],
    ["birikimliHayatCalisan", "Çalışanın Yaptırdığı Birikimli Hayat S.", "Employee Saving Life Ins.", "aylik", "", null, null, TR_GENEL, ""]
  ].map(([code, label, en, group, unit, priority, factor, param, muaf, core]) => ({ code, label, en, group, unit, priority, factor, param, muaf, core: Boolean(core) }))

  function hashOf(text) {
    let hash = 2166136261
    for (const ch of String(text)) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619)
    return hash >>> 0
  }

  function groupTag(groupName) {
    const word = String(groupName || "Grup").split(/\s+/)[0].toLocaleUpperCase("tr-TR")
    return word.replace(/[^A-ZÇĞİÖŞÜ0-9]/g, "") || "GRUP"
  }

  function readDakikaSnapshot(groupName) {
    const seed = hashOf(groupName || "grup")
    const bit = (n) => ((seed >>> n) & 1) === 1
    const kalems = KALEM_CATALOG.filter((k, i) => k.core || bit((i * 7) % 29))
    const tag = groupTag(groupName)
    kalems.push({ code: `nobetSaatOdemesi${tag.slice(0, 3)}`, label: "Nöbet Saat Ödemesi", en: "", group: "fazla", unit: "Saatlik", priority: 10302, factor: 1.5, param: `${tag} Genel Parametreler`, muaf: "", custom: true })
    return { kalems }
  }


  // ---------- Demo verisi: Başkaya Holding (Canlıya Geçiş aşamasında) ----------
  // Tarayıcıda bu grup için henüz yanıt yoksa Know-How bu içerikle açılır; kullanıcı değiştirdikçe normal kayda döner.

  function baskayaSeed() {
    const at = (day, hour, team) => ({ by: team, at: `2026-10-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:15:00.000Z` })
    const imp = (day, hour = 9) => at(day, hour, "imp")
    const ops = (day, hour = 10) => at(day, hour, "ops")
    const des = (day, hour = 11) => at(day, hour, "destek")
    const v = (value, meta, note) => ({ value, ...meta, ...(note ? { note } : {}) })
    const answers = {
      // Firma Profili
      proje: v("BAŞKAYA-2026-IMP", imp(1)),
      hazirlayan: v("Gözde Gökdağ Tumbar", imp(1)),
      dil: v("Türkçe", imp(1)),
      hizmetTipi: v("Bordrolama-Dakika", imp(1)),
      sirketSayisi: v("4", imp(1)),
      isyeriSayisi: v("11", imp(1)),
      personelSayisi: v("1.240", imp(1)),
      turnover: v("Aylık ortalama %3,5 (ayda yaklaşık 40 giriş-çıkış); üretimde Mart–Eylül arası mevsimsel artış", imp(2)),
      bordroProgrami: v("Logo j-HR", imp(1)),
      bordroProvider: v("Şirket içi bordro ekibi (3 kişi)", imp(1)),
      // İletişim
      dakikaYetki: v("İK Direktörü: tüm şirketlerde onay ve rapor yetkisi\nBordro ve Özlük Müdürü: puantaj girişi ve bordro onayı\nFinans Müdürü: maliyet ve muhasebe raporlarını görüntüleme", imp(3)),
      // Ücret, SGK ve Mevzuat
      k5510: v("yes", imp(3)),
      k14857: v("yes", imp(3), "Engelli istihdamı: 38 çalışan"),
      k5746: v("yes", imp(3), "Başkaya Ar-Ge Teknoloji A.Ş. Teknopark'ta (4691)"),
      k6111: v("yes", imp(3)),
      emekli: v("yes", imp(3), "SGDP'li 22 çalışan"),
      digerTesvik: v("yes", imp(3), "7103 ve 17103 teşvikleri"),
      imalat: v("yes", imp(3), "Başkaya Metal Sanayi A.Ş."),
      ucretBrut: v("yes", imp(3)),
      ucretNet: v("yes", imp(3), "Beyaz yakada net ücret anlaşması"),
      ucretAylik: v("yes", imp(3)),
      ucretSaatlik: v("yes", imp(3), "Üretimdeki mavi yaka"),
      ucretGunluk: v("no", imp(3)),
      sendikali: v("yes", imp(3), "Başkaya Metal: Türk Metal Sendikası, MESS TİS (01.09.2025–31.08.2027)"),
      cocukAile: v("yes", imp(3), "Çocuk ve aile yardımı TİS'e göre aylık ödenir"),
      stajyer: v("no", imp(3)),
      huzurHakki: v("yes", imp(3)),
      huzurKosul: v("Yönetim kurulu üyelerine (5 kişi) aylık sabit tutar; SGK'ya tabi değil, gelir ve damga vergisi kesilir.", imp(3)),
      muhsgkVeren: v("SMM/YMM şifresiyle", imp(3)),
      // Yasal Bildirim Süreçleri
      otoBes: v("yes", imp(6)),
      sgkSifreDegis: v("no", imp(6), "Şifreler müşteride kalıyor; Datassist'e alt kullanıcı açıldı"),
      manuelKalem: v("yes", imp(6), "Vardiya primi Excel'de hesaplanıyordu; kural setine alındı (SDP-418)"),
      yemekKart: v("yes", imp(6), "Multinet, markete kapalı"),
      maasGun: v("30 gün üzerinden", imp(6)),
      izinParasiOnceden: v("no", imp(6)),
      iseGiris: v("yes", imp(6)), istenCikis: v("yes", imp(6)), iskurCizelge: v("yes", imp(6)), kimlikForm: v("yes", imp(6)),
      muhsgkBildirim: v("yes", imp(6)), isGoremezlik: v("yes", imp(6)), isyeriHekimi: v("no", imp(6), "Müşteride kalıyor"), muhtasar: v("yes", imp(6)),
      // İşten Çıkış ve Hesaplamalar
      kidem: v("Yasal kıdem tazminatı hesaplaması. TİS kapsamındaki çalışanlarda ikramiye ve yol yardımı giydirilmiş ücrete dahil edilir.", imp(8)),
      ihbar: v("Yasal ihbar tazminatı hesaplaması", imp(8)),
      giydirilmisHaric: v("Fazla mesai ve satış primi giydirilmiş ücrete dahil edilmez.", imp(8)),
      giydirilmisDahil: v("Yemek kartı (Multinet) ve özel sağlık sigortası işveren payı giydirilmiş ücrete dahil edilir.", imp(8)),
      kismiOdeme: v("İkramiye ve bayram yardımı çalışılan gün oranında kıst ödenir.", imp(8)),
      ayOrtasi: v("Ay ortası işten çıkış yapan personelin maaşı ay sonunda ödenir.", imp(8)),
      cikisOnay: v("Çıkış talebi İK Direktörü onayından sonra Dakika'ya girilir; onaysız çıkış bildirgesi verilmez.", imp(8)),
      cikisEk: v("İhbar süresine uyulmayan çıkışlarda ihbar tazminatı çalışandan kesilir; tutar İK ile teyit edilir.", imp(8)),
      kidemKarsilik: v("Üç ayda bir (Mart, Haziran, Eylül, Aralık) şirket bazında kıdem karşılık raporu finansa iletilir.", imp(8)),
      izinKarsilik: v("Talep edilen bir izin karşılık raporu yoktur.", imp(8)),
      // İşlem Detayları
      puantaj: v("yes", imp(10), "Vardiya kodlu (V1/V2/V3) puantaj şablonu"),
      girisCikisForm: v("yes", imp(10)), takvim: v("yes", imp(10)), vkn: v("yes", imp(10)), payrollServis: v("yes", imp(10)),
      damgaMahsup: v("yes", imp(10), "Başkaya Ar-Ge Teknoloji için"), filtreleme: v("yes", imp(10)), tesvikSorgu: v("yes", imp(10)),
      dakikaYetkiVerildi: v("yes", imp(10)), sdpAktif: v("yes", imp(10)), dakikaSifre: v("yes", imp(10)), musteriBilgiFormu: v("yes", imp(10)),
      icraNafakaModul: v("yes", imp(10)), duzenliOdeme: v("yes", imp(10)), paralelKopya: v("yes", imp(10)),
      raporluCalisilmadi: v("yes", imp(10), "Müşteri onayı 14.10.2026 tarihli e-posta"), payOps: v("yes", ops(16)), sendikaCalculator: v("yes", des(15)),
      // Bordro Uygulamaları
      icra: v("Aktif 17 icra dosyası. Kesinti sırası: önce nafaka, sonra icra; 1/4 sınırı net ücret üzerinden.", imp(9)),
      nafaka: v("4 nafaka dosyası; nafaka icradan önce kesilir.", imp(9)),
      taksitliAvans: v("Avans en fazla 3 taksit; Dakika avans modülünden talep edilir, İK onayından sonra bordroya yansır.", imp(9)),
      calismaBolunme: v("Evet. Üretimde hafta içi, hafta sonu ve genel tatil çalışmaları puantajda ayrı kalemlerle gelir.", imp(9)),
      izinGosterim: v("Evet, kullanılan yıllık izin ve rapor günleri bordroda gösterilir.", imp(9)),
      puantajDetay: v("Dakika'da Raporlar alanındaki \"Boş Puantaj Raporu\" çekilerek müşteriye iletilir.\nGelen puantajda vardiya kodları (V1/V2/V3) kontrol edilir; gece vardiyası ayrıca işaretlenir.", ops(15)),
      // Ödeme İşlemleri
      odemeDisketi: v("Garanti BBVA toplu ödeme dosyası (TXT). Dosyayı Datassist hazırlar, yüklemeyi Başkaya finans ekibi yapar.", ops(15)),
      maasTarih: v("Her ayın son iş günü", ops(15)),
      maasYukleme: v("Ödeme gününden 1 iş günü önce, saat 15:00'e kadar", ops(15)),
      digerOdemeler: v("Avanslar ayın 15'inde; TİS ikramiyeleri Mart, Haziran, Eylül ve Aralık bordrosuyla ödenir.", ops(15)),
      // Raporlar ve Bordro Gönderimi
      maliyetRaporu: v("Standart + masraf merkezi (şirket / işyeri / departman) kırılımı", imp(13)),
      bordroIcmali: v("Standart", imp(13)),
      muhasebeRaporu: v("Logo Tiger muhasebe fişi formatında; her şirket için ayrı fiş", imp(13)),
      muhasebeTarih: v("Maaş ödemesinden sonraki 2. iş günü", imp(13)),
      digerRaporlar: v("Aylık personel hareket raporu (giriş-çıkış, turnover) İK Direktörüne gönderilir.", imp(13)),
      entegrasyon: v("yes", imp(13), "Logo Tiger'a muhasebe fişi entegrasyonu (SDP-412)"),
      bordroGonderim: v("Fiziki gönderim yok; e-bordro. Yönetim kurulu bordroları yalnız İK Direktörüne şifreli PDF olarak gider.", imp(13)),
      onlineBordro: v("yes", imp(13)), bordroMail: v("yes", imp(13)), dakikaKullanici: v("yes", imp(13))
    }
    const kalems = {
      normalMesai: { aciklama: "Aylık ücretlilerde 30 gün; saatlik ücretlilerde puantajdaki çalışılan gün.", sira: "1", ...imp(9) },
      haftaTatiliNormalMesaisi: { aciklama: "Saatlik ücretlilerde 6 gün çalışana 1 gün hafta tatili ücreti.", ...imp(9) },
      fazlaMesai150: { aciklama: "Haftalık 45 saati aşan çalışma.", detay: "Puantajdan saat olarak gelir; yıllık 270 saat sınırı kontrol edilir.", ...ops(15) },
      nobetSaatOdemesiBAŞ: { aciklama: "Bakım ekibinin nöbet saatleri.", detay: "Saat ücreti x 1,5", ...des(15) },
      yolParasi: { aciklama: "TİS'e göre günlük yol yardımı, çalışılan gün üzerinden.", sira: "3", detay: "Brüt ödenir.", ...imp(9) },
      ekOdeme: { aciklama: "Tek seferlik ödemeler; İK onaylı listeyle gelir.", ...imp(9) },
      kidemTazminat: { aciklama: "Yasal tavan uygulanır.", detay: "Giydirilmiş ücrete TİS ikramiyesi ve yol yardımı dahil.", ...imp(9) },
      saglikSigortasi: { aciklama: "Beyaz yaka özel sağlık sigortası, işveren payı.", detay: "Asgari ücretin %30'una kadar SGK ve gelir vergisi istisnası uygulanır.", ...imp(9) },
      maasAvans1: { aciklama: "Ayın 15'inde verilen avans; ay sonunda tek seferde kesilir.", ...ops(15) },
      digerKesinti: { aciklama: "Sendika aidatı bu kalemle kesilir (Türk Metal).", detay: "Brüt ücretin 1 günlüğü.", ...ops(15) },
      eksikGunNedeni: { aciklama: "Rapor, ücretsiz izin ve devamsızlık kodları puantajdan gelir.", ...imp(9) }
    }
    const note = (id, sectionId, team, day, text) => ({ id, sectionId, team, text, at: `2026-10-${day}T13:30:00.000Z` })
    return {
      answers,
      kalems,
      contacts: [
        { ad: "Okan Tuna", unvan: "İK Direktörü", yetki: "Onaylayıcı (tüm şirketler)", mail: "okan.tuna@baskaya.com.tr", tel: "0216 555 01 10", ...imp(3) },
        { ad: "Derya Kılınç", unvan: "Bordro ve Özlük Müdürü", yetki: "Puantaj girişi ve bordro onayı", mail: "derya.kilinc@baskaya.com.tr", tel: "0216 555 01 14", ...imp(3) },
        { ad: "Murat Esen", unvan: "Finans Müdürü", yetki: "Rapor görüntüleme", mail: "murat.esen@baskaya.com.tr", tel: "0216 555 01 20", ...imp(3) }
      ],
      jobs: [
        { kod: "SDP-412", detay: "Logo Tiger muhasebe fişi entegrasyonu", aciklama: "Canlıda; ilk ay paralel kontrol edilecek.", ...imp(13) },
        { kod: "SDP-418", detay: "Vardiya primi kural seti", aciklama: "V2 %10, V3 %20; Dakika calculator'a tanımlandı.", ...des(15) },
        { kod: "SDP-423", detay: "Şirket bazında kıdem karşılık raporu", aciklama: "Üç ayda bir otomatik üretilir.", ...imp(13) }
      ],
      modules: {
        bordrolama: { value: true, ...imp(5) },
        izin: { value: true, ...imp(5) },
        avans: { value: true, ...imp(5) },
        fazlaMesai: { value: true, ...imp(5) },
        masraf: { value: false, ...imp(5) },
        operasyonTesvik: { value: true, ...imp(5) },
        uzmanTesvik: { value: false, ...imp(5) }
      },
      credentials: {
        dosya: { status: "Kasada kayıtlı", where: "Dakika şifre kasası (bordro PDF şifre kuralı)", ...imp(6) },
        sgk: { status: "Kasada kayıtlı", where: "Dakika şifre kasası", ...imp(6) },
        iskur: { status: "Kasada kayıtlı", where: "Dakika şifre kasası", ...imp(6) },
        muhsgk: { status: "Gerekmiyor", where: "YMM tarafından veriliyor", ...imp(6) },
        otobes: { status: "Kasada kayıtlı", where: "Dakika şifre kasası", ...imp(6) }
      },
      checklist: Object.fromEntries(CHECKLIST.slice(0, 23).map((c, i) => [c.id, { done: true, date: `2026-${i < 9 ? "08" : i < 17 ? "09" : "10"}-${String(5 + (i % 9) * 2).padStart(2, "0")}T09:00:00.000Z`, ...imp(16) }])),
      signoff: {
        impYonetici: { name: "Gözde Gökdağ Tumbar", approved: true, ...imp(17) },
        opsGrup: { name: "Serkan Yıldız", approved: true, ...ops(17) },
        opsKoordinator: { name: "Elif Aydın", approved: true, ...ops(17) }
      },
      notes: [
        note("n-bsk-1", "profil", "imp", "02", "Grup 4 şirketten oluşuyor: Başkaya Holding A.Ş., Başkaya Metal Sanayi A.Ş. (sendikalı üretim), Başkaya Ar-Ge Teknoloji A.Ş. (Teknopark) ve Başkaya Lojistik A.Ş."),
        note("n-bsk-2", "mevzuat", "imp", "03", "Başkaya Metal'de TİS 01.09.2025'te yenilendi; zam farkları fark bordrosuyla ödendi."),
        note("n-bsk-3", "kalemler", "ops", "15", "Vardiya primi (V2 %10, V3 %20) normal saat ücreti üzerinden hesaplanır."),
        note("n-bsk-4", "odeme", "ops", "15", "Banka dosyası 15:00'ten sonra yüklenirse ödeme ertesi güne kalıyor; yükleme saatine dikkat."),
        note("n-bsk-5", "notlar", "destek", "15", "Ar-Ge şirketinde damga vergisi mahsubu canlıda otomatik tikli geliyor; ilk canlı bordroda kontrol edilmeli."),
        note("n-bsk-6", "notlar", "imp", "17", "Paralel çalışma Ağustos ve Eylül bordrolarında yapıldı, fark çıkmadı. Canlı geçiş Ekim 2026 bordrosu.")
      ],
      dakikaSyncedAt: "2026-10-17T08:00:00.000Z",
      updatedAt: "2026-10-17T14:00:00.000Z",
      seeded: true
    }
  }

  const DEMO_SEEDS = { "Başkaya Holding": baskayaSeed }

  // ---------- Depolama ----------

  // Demo: Dasi aktarımı her sayfa açılışında sıfırlanır; sunumda "Dasi'ye Aktar" adımı yeniden gösterilebilsin.
  // Know-How içeriği korunur, yalnız aktarım geçmişi temizlenir.
  try {
    const all = JSON.parse(window.localStorage.getItem(STORE_KEY) || "{}")
    let changed = false
    Object.values(all).forEach((g) => { if (g?.dasi?.history?.length) { g.dasi = { history: [] }; changed = true } })
    if (changed) window.localStorage.setItem(STORE_KEY, JSON.stringify(all))
  } catch (_) { /* depolama kapalıysa sıfırlanacak kayıt da yoktur */ }

  function emptyState() {
    return { answers: {}, modules: {}, kalems: {}, draftKalems: [], contacts: [], jobs: [], credentials: {}, checklist: {}, signoff: {}, notes: [], dasi: { history: [] }, dakikaSyncedAt: null, updatedAt: null }
  }

  function readAll() {
    try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || "{}") } catch (_) { return {} }
  }

  function readGroup(groupName) {
    const stored = readAll()[groupName]
    const untouched = !stored || (!stored.seeded && !Object.keys(stored.answers || {}).length && !(stored.dasi?.history || []).length)
    if (untouched && DEMO_SEEDS[groupName]) return { ...emptyState(), ...DEMO_SEEDS[groupName]() }
    return { ...emptyState(), ...(stored || {}) }
  }

  function writeGroup(groupName, data) {
    try {
      const all = readAll()
      all[groupName] = data
      window.localStorage.setItem(STORE_KEY, JSON.stringify(all))
    } catch (_) { /* depolama kapalıysa yalnız oturum içinde tutulur */ }
    window.dispatchEvent(new CustomEvent("sdp-know-how-updated", { detail: { groupName } }))
  }

  function readOrgCounts(groupName) {
    try {
      const raw = JSON.parse(window.localStorage.getItem(ORG_SETUP_KEY) || "{}")[groupName]
      if (!raw) return null
      const company = raw.companies?.[0] || {}
      const address = company.workplaces?.find((w) => w.address)?.address
      return { ...raw.counts, title: company.title || company.name || null, taxNo: company.taxNo || null, address: address || null }
    } catch (_) { return null }
  }

  // Değişikliği yapan ekip kullanıcının rolünden gelir; SDP'de operasyon/destek rolleri açıldığında buradan eşlenir.
  function teamForRole(userRole) {
    if (userRole === "ops_ekibi" || userRole === "operasyon") return "ops"
    if (userRole === "destek_ekibi" || userRole === "destek") return "destek"
    return "imp"
  }

  function readActor() {
    return teamForRole(window.__sdpUserRole)
  }

  const stamp = (team) => ({ by: team, at: new Date().toISOString() })

  function formatStamp(iso, withYear) {
    if (!iso) return ""
    const d = new Date(iso)
    const opts = { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
    if (withYear) opts.year = "numeric"
    return d.toLocaleString("tr-TR", opts)
  }

  const isFilled = (v) => v != null && String(v).trim() !== ""

  // ---------- Türetilmiş değerler ----------

  function fieldValue(state, field, orgCounts) {
    const ans = state.answers[field.id]
    if (ans && isFilled(ans.value)) return { value: ans.value, from: "manual", meta: ans }
    if (field.org && orgCounts?.[field.org] != null) return { value: String(orgCounts[field.org]), from: "org" }
    const derived = field.derive?.(orgCounts)
    if (isFilled(derived)) return { value: derived, from: "org" }
    return { value: "", from: null }
  }

  // Modül kullanımı Dakika'daki tikten okunmaz; implementasyon ekibi Evet/Hayır olarak işaretler.
  function moduleValue(state, moduleId) {
    const cur = state.modules[moduleId]
    return cur && typeof cur.value === "boolean" ? { value: cur.value, meta: cur } : { value: null, meta: null }
  }

  function allKalems(state, snapshot) {
    return [...snapshot.kalems, ...state.draftKalems.map((k) => ({ ...k, draft: true }))]
  }

  function sectionProgress(section, state, snapshot, orgCounts) {
    if (section.fields) {
      const fields = section.fields.filter((f) => !f.heading)
      let done = fields.filter((f) => isFilled(fieldValue(state, f, orgCounts).value)).length
      let total = fields.length
      if (section.kind === "contacts") { total += 1; if (state.contacts.length) done += 1 }
      return { done, total }
    }
    if (section.kind === "modules") return { done: DAKIKA_MODULES.filter((m) => moduleValue(state, m.id).value !== null).length, total: DAKIKA_MODULES.length }
    if (section.kind === "kalems") {
      const list = allKalems(state, snapshot)
      return { done: list.filter((k) => isFilled(state.kalems[k.code]?.aciklama)).length, total: list.length }
    }
    if (section.kind === "credentials") return { done: CREDENTIALS.filter((c) => state.credentials[c.id]?.status).length, total: CREDENTIALS.length }
    if (section.kind === "checklist") return { done: CHECKLIST.filter((c) => state.checklist[c.id]?.done).length, total: CHECKLIST.length }
    if (section.kind === "signoff") return { done: SIGNOFF_APPROVALS.filter((s) => state.signoff[s.id]?.approved).length, total: SIGNOFF_APPROVALS.length }
    return null
  }

  function overallProgress(state, snapshot, orgCounts) {
    let done = 0, total = 0
    SECTIONS.forEach((s) => {
      if (s.kind === "checklist" || s.kind === "signoff") return
      const p = sectionProgress(s, state, snapshot, orgCounts)
      if (p) { done += p.done; total += p.total }
    })
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
  }

  // ---------- Dasi paketi ----------

  function slugify(text) {
    const map = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" }
    return String(text || "").toLocaleLowerCase("tr-TR").replace(/[çğıöşü]/g, (c) => map[c]).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }

  function answerLine(field, fv, state) {
    if (field.type === "yesno") {
      if (!isFilled(fv.value)) return null
      const note = state.answers[field.id]?.note
      return `- ${field.label}: ${fv.value === "yes" ? "Evet" : "Hayır"}${isFilled(note) ? ` — ${note}` : ""}`
    }
    if (!isFilled(fv.value)) return null
    const value = String(fv.value).trim()
    return value.includes("\n") ? `- ${field.label}:\n${value.split("\n").map((l) => `  ${l}`).join("\n")}` : `- ${field.label}: ${value}`
  }

  function notesFor(state, sectionId) {
    return state.notes.filter((n) => n.sectionId === sectionId)
  }

  function notesBlock(notes) {
    if (!notes.length) return ""
    return `\n\n### Ekip notları\n${notes.map((n) => `- [${TEAMS[n.team]?.label || n.team}, ${formatStamp(n.at, true)}] ${n.text}`).join("\n")}`
  }

  function buildDasiPackage(groupName, state, snapshot, orgCounts, actor) {
    const documents = []
    const push = (section, body, extra = {}) => {
      const content = `## ${section.title}\n${body.trim()}${notesBlock(notesFor(state, section.id))}`
      documents.push({ id: `${slugify(groupName)}/${section.id}`, title: `${groupName} · ${section.title}`, section: section.id, content, ...extra })
    }

    SECTIONS.forEach((section) => {
      if (section.internal || section.kind === "credentials" || section.kind === "notes" || section.kind === "signoff") return
      if (section.fields) {
        let body = ""
        section.fields.forEach((f) => {
          if (f.heading) { body += `\n**${f.heading}**\n`; return }
          const line = answerLine(f, fieldValue(state, f, orgCounts), state)
          if (line) body += `${line}\n`
        })
        if (section.kind === "contacts" && state.contacts.length) {
          body = `**Muhataplar**\n${state.contacts.map((c) => `- ${[c.ad, c.unvan, c.yetki, c.mail, c.tel].filter(isFilled).join(" · ")}`).join("\n")}\n${body}`
        }
        if (body.replace(/\*\*[^*]+\*\*/g, "").trim()) push(section, body)
        return
      }
      if (section.kind === "modules") {
        const body = DAKIKA_MODULES.map((m) => {
          const mv = moduleValue(state, m.id)
          return mv.value === null ? null : `- ${m.label}: ${mv.value ? "Kullanıyor" : "Kullanmıyor"}`
        }).filter(Boolean).join("\n")
        if (body) push(section, body)
        return
      }
      if (section.kind === "kalems") {
        const list = allKalems(state, snapshot)
        KALEM_GROUPS.forEach((g) => {
          const items = list.filter((k) => k.group === g.id)
          if (!items.length) return
          const body = items.map((k) => {
            const kn = state.kalems[k.code] || {}
            const def = [k.unit, k.priority != null ? `öncelik ${k.priority}` : "", k.factor != null ? `katsayı ${k.factor}` : "", k.param, k.muaf ? `muaflık ${k.muaf}` : ""].filter(isFilled).join(", ")
            const lines = [`### ${k.label} (${k.code})${k.draft ? " — Dakika'ya henüz tanımlanmadı" : ""}`, def ? `Tanım: ${def}` : ""]
            g.detail.forEach((key) => { if (isFilled(kn[key])) lines.push(`${KALEM_DETAIL_LABELS[key]}: ${kn[key]}`) })
            return lines.filter(Boolean).join("\n")
          }).join("\n\n")
          documents.push({ id: `${slugify(groupName)}/kalemler/${g.id}`, title: `${groupName} · ${g.label}`, section: "kalemler", content: `## ${g.label}\n${body}${g.id === "mesai" ? notesBlock(notesFor(state, "kalemler")) : ""}` })
        })
        return
      }
      if (section.kind === "jobs" && state.jobs.length) {
        push(section, state.jobs.map((j) => `- ${j.kod || "—"}: ${[j.detay, j.aciklama].filter(isFilled).join(" — ")}`).join("\n"))
      }
    })

    const general = notesFor(state, "notlar")
    if (general.length) {
      documents.push({ id: `${slugify(groupName)}/notlar`, title: `${groupName} · Ekip Notları`, section: "notlar", content: `## Ekip Notları${notesBlock(general).replace("\n\n### Ekip notları", "")}` })
    }

    return {
      source: "SDP Know-How",
      workgroup: { name: groupName, key: slugify(groupName) },
      version: (state.dasi.history.length || 0) + 1,
      exportedAt: new Date().toISOString(),
      exportedBy: TEAMS[actor]?.label || actor,
      excluded: ["Erişim bilgileri (şifreler)", "İmplementasyon check list"],
      documents
    }
  }

  // ---------- Hook ----------

  function useKnowHow(groupName) {
    const [state, setState] = useState(() => readGroup(groupName))
    const snapshot = useMemo(() => readDakikaSnapshot(groupName), [groupName])
    const [orgCounts, setOrgCounts] = useState(() => readOrgCounts(groupName))

    useEffect(() => {
      setState(readGroup(groupName))
      setOrgCounts(readOrgCounts(groupName))
      const onUpdate = (e) => { if (!e.detail || e.detail.groupName === groupName) setState(readGroup(groupName)) }
      const onOrg = () => setOrgCounts(readOrgCounts(groupName))
      window.addEventListener("sdp-know-how-updated", onUpdate)
      window.addEventListener("sdp-setup-result-updated", onOrg)
      return () => {
        window.removeEventListener("sdp-know-how-updated", onUpdate)
        window.removeEventListener("sdp-setup-result-updated", onOrg)
      }
    }, [groupName])

    function update(mutator) {
      const next = mutator(readGroup(groupName))
      next.updatedAt = new Date().toISOString()
      writeGroup(groupName, next)
      setState(next)
    }

    return { state, snapshot, orgCounts, update }
  }

  // ---------- Küçük bileşenler ----------

  function TeamChip({ meta }) {
    if (!meta?.by) return null
    const team = TEAMS[meta.by]
    return h`<span className=${`kh-team is-${meta.by}`} title=${`${team?.label || meta.by} · ${formatStamp(meta.at, true)}`}>${team?.short || meta.by}</span>`
  }

  function YesNo({ value, onChange, disabled }) {
    return h`
      <div className="kh-yn" role="group">
        <button type="button" disabled=${disabled} className=${cx("is-yes", value === "yes" && "active")} onClick=${() => onChange(value === "yes" ? "" : "yes")}>Evet</button>
        <button type="button" disabled=${disabled} className=${cx("is-no", value === "no" && "active")} onClick=${() => onChange(value === "no" ? "" : "no")}>Hayır</button>
      </div>
    `
  }

  function AutoText({ value, onCommit, placeholder, multiline, className }) {
    const [draft, setDraft] = useState(value || "")
    useEffect(() => { setDraft(value || "") }, [value])
    const commit = () => { if ((draft || "") !== (value || "")) onCommit(draft) }
    if (multiline) {
      const rows = Math.min(8, Math.max(2, String(draft).split("\n").length))
      return h`<textarea className=${cx("kh-input", className)} rows=${rows} value=${draft} placeholder=${placeholder} onChange=${(e) => setDraft(e.target.value)} onBlur=${commit}></textarea>`
    }
    return h`<input className=${cx("kh-input", className)} value=${draft} placeholder=${placeholder} onChange=${(e) => setDraft(e.target.value)} onBlur=${commit} onKeyDown=${(e) => { if (e.key === "Enter") e.target.blur() }} />`
  }

  function Segmented({ value, options, onChange }) {
    return h`
      <div className="kh-seg">
        ${options.map((o) => h`<button key=${o} type="button" className=${cx(value === o && "active")} onClick=${() => onChange(value === o ? "" : o)}>${o}</button>`)}
      </div>
    `
  }

  // ---------- Bölüm gövdeleri ----------

  function FieldRow({ field, state, orgCounts, team, update, onlyEmpty }) {
    const fv = fieldValue(state, field, orgCounts)
    const ans = state.answers[field.id]
    if (onlyEmpty && isFilled(fv.value)) return null
    const setAnswer = (patch) => update((s) => {
      const prev = s.answers[field.id] || {}
      s.answers = { ...s.answers, [field.id]: { ...prev, ...patch, ...stamp(team) } }
      return s
    })

    let control
    if (field.type === "yesno") {
      control = h`
        <div className="kh-yn-wrap">
          <${YesNo} value=${fv.value} onChange=${(v) => setAnswer({ value: v })} />
          <${AutoText} className="kh-input--note" value=${ans?.note} placeholder="Açıklama" onCommit=${(v) => setAnswer({ note: v })} />
        </div>
      `
    } else if (field.type === "select") {
      control = field.options.length <= 3
        ? h`<${Segmented} value=${fv.value} options=${field.options} onChange=${(v) => setAnswer({ value: v })} />`
        : h`<select className="kh-input" value=${fv.value} onChange=${(e) => setAnswer({ value: e.target.value })}><option value="">Seçiniz</option>${field.options.map((o) => h`<option key=${o}>${o}</option>`)}</select>`
    } else {
      control = h`
        <div className="kh-text-wrap">
          <${AutoText} multiline=${field.type === "longtext"} value=${fv.from ? fv.value : ""} placeholder=${field.hint || ""} onCommit=${(v) => setAnswer({ value: v })} />
          ${field.presets && !isFilled(fv.value) ? h`
            <div className="kh-presets">${field.presets.map((p) => h`<button key=${p} type="button" onClick=${() => setAnswer({ value: p })}><${Icon} d=${ICON.plus} size=${11} />${p}</button>`)}</div>
          ` : null}
        </div>
      `
    }

    return h`
      <div className=${cx("kh-row", !isFilled(fv.value) && "is-empty", fv.from === "org" && "is-org")}>
        <div className="kh-row-label">
          <span>${field.label}</span>
          ${field.hint && field.type !== "text" && field.type !== "longtext" ? h`<small>${field.hint}</small>` : null}
          ${fv.from === "org" ? h`<em className="kh-src is-org" title="Onaylanan Starter Kit'ten otomatik alındı"><${Icon} d=${ICON.check} size=${10} />Starter Kit'ten alındı</em>` : null}
        </div>
        <div className="kh-row-control">${control}</div>
        <div className="kh-row-meta"><${TeamChip} meta=${ans} /></div>
      </div>
    `
  }

  function FieldsBody({ section, onlyEmpty, ...rest }) {
    const rows = []
    let pendingHead = null
    section.fields.forEach((f, i) => {
      if (f.heading) { pendingHead = f.heading; return }
      const row = h`<${FieldRow} key=${f.id} field=${f} onlyEmpty=${onlyEmpty} ...${rest} />`
      if (onlyEmpty && isFilled(fieldValue(rest.state, f, rest.orgCounts).value)) return
      if (pendingHead) { rows.push(h`<div key=${`h${i}`} className="kh-subhead">${pendingHead}</div>`); pendingHead = null }
      rows.push(row)
    })
    if (!rows.length) return h`<div className="kh-empty-line">Bu bölümde boş alan kalmadı.</div>`
    return h`<div className="kh-rows">${rows}</div>`
  }

  function ContactsBody({ state, team, update }) {
    const cols = [["ad", "Adı Soyadı"], ["unvan", "Unvanı"], ["yetki", "Yetki"], ["mail", "Mail Adresi"], ["tel", "Telefon"]]
    const setContact = (i, key, value) => update((s) => { s.contacts = s.contacts.map((c, idx) => idx === i ? { ...c, [key]: value, ...stamp(team) } : c); return s })
    return h`
      <div className="kh-table-wrap">
        <div className="kh-subhead">İletişim Bilgileri</div>
        <table className="kh-table">
          <thead><tr>${cols.map(([, l]) => h`<th key=${l}>${l}</th>`)}<th></th></tr></thead>
          <tbody>
            ${state.contacts.map((c, i) => h`
              <tr key=${i}>
                ${cols.map(([k, l]) => h`<td key=${k}><${AutoText} value=${c[k]} placeholder=${l} onCommit=${(v) => setContact(i, k, v)} /></td>`)}
                <td className="kh-td-actions">
                  <${TeamChip} meta=${c} />
                  <button type="button" className="kh-icon-btn" title="Satırı sil" onClick=${() => update((s) => { s.contacts = s.contacts.filter((_, idx) => idx !== i); return s })}><${Icon} d=${ICON.trash} size=${14} /></button>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
        <button type="button" className="kh-add" onClick=${() => update((s) => { s.contacts = [...s.contacts, { ...stamp(team) }]; return s })}><${Icon} d=${ICON.plus} size=${13} /> Kişi ekle</button>
      </div>
    `
  }

  function JobsBody({ state, team, update }) {
    const cols = [["kod", "İş Kodu"], ["detay", "Detay"], ["aciklama", "Açıklama"]]
    const setJob = (i, key, value) => update((s) => { s.jobs = s.jobs.map((j, idx) => idx === i ? { ...j, [key]: value, ...stamp(team) } : j); return s })
    return h`
      <div className="kh-table-wrap">
        ${state.jobs.length ? h`
          <table className="kh-table">
            <thead><tr>${cols.map(([, l]) => h`<th key=${l}>${l}</th>`)}<th></th></tr></thead>
            <tbody>
              ${state.jobs.map((j, i) => h`
                <tr key=${i}>
                  ${cols.map(([k, l]) => h`<td key=${k} className=${k === "kod" ? "is-narrow" : ""}><${AutoText} value=${j[k]} placeholder=${k === "kod" ? "#152373" : l} onCommit=${(v) => setJob(i, k, v)} /></td>`)}
                  <td className="kh-td-actions">
                    <${TeamChip} meta=${j} />
                    <button type="button" className="kh-icon-btn" title="Satırı sil" onClick=${() => update((s) => { s.jobs = s.jobs.filter((_, idx) => idx !== i); return s })}><${Icon} d=${ICON.trash} size=${14} /></button>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        ` : h`<div className="kh-empty-line">Firmaya özel açılmış iş yok.</div>`}
        <button type="button" className="kh-add" onClick=${() => update((s) => { s.jobs = [...s.jobs, { ...stamp(team) }]; return s })}><${Icon} d=${ICON.plus} size=${13} /> İş ekle</button>
      </div>
    `
  }

  function CredentialsBody({ state, team, update }) {
    const set = (id, patch) => update((s) => { s.credentials = { ...s.credentials, [id]: { ...(s.credentials[id] || {}), ...patch, ...stamp(team) } }; return s })
    return h`
      <div>
        <div className="kh-callout">
          <${Icon} d=${ICON.lock} size=${15} />
          <p>Şifre, kullanıcı adı ve işyeri kodları bu ekrana yazılmaz ve Dasi'ye aktarılmaz. Sadece bilginin kasada kayıtlı olup olmadığını ve nerede tutulduğunu işaretleyin.</p>
        </div>
        <div className="kh-rows">
          ${CREDENTIALS.map((c) => {
            const cur = state.credentials[c.id]
            return h`
              <div key=${c.id} className=${cx("kh-row", !cur?.status && "is-empty")}>
                <div className="kh-row-label"><span>${c.label}</span>${c.hint ? h`<small>${c.hint}</small>` : null}</div>
                <div className="kh-row-control">
                  <div className="kh-yn-wrap">
                    <${Segmented} value=${cur?.status || ""} options=${["Kasada kayıtlı", "Eksik", "Gerekmiyor"]} onChange=${(v) => set(c.id, { status: v })} />
                    <${AutoText} className="kh-input--note" value=${cur?.where} placeholder="Nerede tutuluyor? (ör. Dakika şifre kasası)" onCommit=${(v) => set(c.id, { where: v })} />
                  </div>
                </div>
                <div className="kh-row-meta"><${TeamChip} meta=${cur} /></div>
              </div>
            `
          })}
        </div>
      </div>
    `
  }

  function ModulesBody({ state, team, update }) {
    const canEdit = team === "imp"
    const set = (id, v) => update((s) => {
      const next = { ...s.modules }
      if (v === "") delete next[id]
      else next[id] = { value: v === "yes", ...stamp(team) }
      s.modules = next
      return s
    })
    return h`
      <div className="kh-modules">
        ${DAKIKA_MODULES.map((m) => {
          const mv = moduleValue(state, m.id)
          return h`
            <div key=${m.id} className=${cx("kh-module", mv.value === true && "is-on")}>
              <div className="kh-module-main">
                <strong>${m.label}</strong>
                <small>${m.desc}</small>
              </div>
              <div className="kh-row-meta"><${TeamChip} meta=${mv.meta} /></div>
              <div title=${canEdit ? "" : "Yalnız implementasyon ekibi işaretler"}>
                <${YesNo} value=${mv.value === null ? "" : mv.value ? "yes" : "no"} disabled=${!canEdit} onChange=${(v) => set(m.id, v)} />
              </div>
            </div>
          `
        })}
      </div>
    `
  }

  function KalemDraftForm({ team, update, onClose }) {
    const [draft, setDraft] = useState({ label: "", code: "", group: "odeme", unit: "", note: "" })
    const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))
    const valid = isFilled(draft.label) && isFilled(draft.code)
    return h`
      <div className="kh-kalem-form">
        <div className="kh-kalem-form-grid">
          <label>Etiket<input className="kh-input" value=${draft.label} placeholder="Ör. Vardiya Primi" onChange=${(e) => set("label", e.target.value)} /></label>
          <label>Sistem adı<input className="kh-input kh-mono" value=${draft.code} placeholder="vardiyaPrimi" onChange=${(e) => set("code", e.target.value.replace(/\s+/g, ""))} /></label>
          <label>Grup<select className="kh-input" value=${draft.group} onChange=${(e) => set("group", e.target.value)}>${KALEM_GROUPS.map((g) => h`<option key=${g.id} value=${g.id}>${g.label}</option>`)}</select></label>
          <label>Birim<select className="kh-input" value=${draft.unit} onChange=${(e) => set("unit", e.target.value)}><option value="">—</option><option>Saatlik</option><option>Günlük</option></select></label>
        </div>
        <p className="kh-kalem-form-hint"><${Icon} d=${ICON.alert} size=${13} /> Kalem taslak olarak eklenir; Dakika'ya tanımlanana kadar "Tanımlanacak" görünür.</p>
        <div className="kh-kalem-form-actions">
          <button type="button" className="kh-btn" onClick=${onClose}>Vazgeç</button>
          <button type="button" className="kh-btn primary" disabled=${!valid} onClick=${() => {
            update((s) => { s.draftKalems = [...s.draftKalems, { code: draft.code, label: draft.label, group: draft.group, unit: draft.unit, en: "", priority: null, factor: null, param: "", muaf: "", ...stamp(team) }]; return s })
            onClose()
          }}>Taslak kalem ekle</button>
        </div>
      </div>
    `
  }

  function KalemRow({ kalem, group, state, team, update, open, onToggle }) {
    const kn = state.kalems[kalem.code] || {}
    const set = (key, value) => update((s) => { s.kalems = { ...s.kalems, [kalem.code]: { ...(s.kalems[kalem.code] || {}), [key]: value, ...stamp(team) } }; return s })
    const hasNote = isFilled(kn.aciklama)
    return h`
      <div className=${cx("kh-kalem", open && "is-open", kalem.draft && "is-draft")}>
        <button type="button" className="kh-kalem-head" onClick=${onToggle} aria-expanded=${String(open)}>
          <span className="kh-kalem-caret"><${Icon} d=${open ? ICON.down : ICON.chevron} size=${14} /></span>
          <span className="kh-kalem-name">
            <strong>${kalem.label}</strong>
            <code>${kalem.code}</code>
          </span>
          <span className="kh-kalem-def">
            ${kalem.unit ? h`<em>${kalem.unit}</em>` : null}
            ${kalem.factor != null ? h`<em>×${kalem.factor}</em>` : null}
            ${kalem.priority != null ? h`<em className="kh-num">${kalem.priority}</em>` : null}
          </span>
          <span className="kh-kalem-param">${kalem.draft ? h`<b className="kh-pill is-warn">Tanımlanacak</b>` : kalem.custom ? h`<b className="kh-pill">Firmaya özel</b>` : kalem.param}</span>
          <span className=${cx("kh-kalem-state", hasNote && "is-done")}>${hasNote ? h`<${Icon} d=${ICON.check} size=${12} /> Notlu` : "Not yok"}</span>
        </button>
        ${open ? h`
          <div className="kh-kalem-body">
            <dl className="kh-kalem-meta">
              ${kalem.en ? h`<div><dt>English</dt><dd>${kalem.en}</dd></div>` : null}
              ${kalem.param ? h`<div><dt>Parametre</dt><dd>${kalem.param}</dd></div>` : null}
              ${kalem.muaf ? h`<div><dt>Muaflık</dt><dd className="kh-mono">${kalem.muaf.split("|").join(" · ")}</dd></div>` : null}
            </dl>
            ${group.detail.map((key) => h`
              <label key=${key} className="kh-kalem-field">
                <span>${KALEM_DETAIL_LABELS[key]}</span>
                <${AutoText} multiline=${true} value=${kn[key]} placeholder=${key === "sira" ? "Ör. Puantajdan gelen gün × günlük ücret" : ""} onCommit=${(v) => set(key, v)} />
              </label>
            `)}
            <div className="kh-kalem-foot">
              <${TeamChip} meta=${kn.by ? kn : null} />
              ${kalem.draft ? h`<button type="button" className="kh-link is-danger" onClick=${() => update((s) => { s.draftKalems = s.draftKalems.filter((d) => d.code !== kalem.code); return s })}>Taslağı sil</button>` : null}
            </div>
          </div>
        ` : null}
      </div>
    `
  }

  function KalemsBody({ state, snapshot, team, update, onlyEmpty }) {
    const [openCode, setOpenCode] = useState(null)
    const [formOpen, setFormOpen] = useState(false)
    const list = allKalems(state, snapshot)
    return h`
      <div className="kh-kalems">
        <div className="kh-kalem-cols" aria-hidden="true"><span></span><span>Kalem</span><span>Tanım</span><span>Parametre</span><span>Not</span></div>
        ${KALEM_GROUPS.map((g) => {
          const items = list.filter((k) => k.group === g.id && (!onlyEmpty || !isFilled(state.kalems[k.code]?.aciklama)))
          if (!items.length) return null
          return h`
            <div key=${g.id} className="kh-kalem-group">
              <div className="kh-subhead">${g.label}<small>${items.length}</small></div>
              ${items.map((k) => h`<${KalemRow} key=${k.code} kalem=${k} group=${g} state=${state} team=${team} update=${update} open=${openCode === k.code} onToggle=${() => setOpenCode(openCode === k.code ? null : k.code)} />`)}
            </div>
          `
        })}
        ${formOpen
          ? h`<${KalemDraftForm} team=${team} update=${update} onClose=${() => setFormOpen(false)} />`
          : h`<button type="button" className="kh-add" onClick=${() => setFormOpen(true)}><${Icon} d=${ICON.plus} size=${13} /> Yeni kalem tanımla</button>`}
      </div>
    `
  }

  function ChecklistBody({ state, team, update }) {
    const toggle = (id) => update((s) => {
      const cur = s.checklist[id]
      s.checklist = { ...s.checklist, [id]: cur?.done ? { ...cur, done: false, ...stamp(team) } : { ...(cur || {}), done: true, date: new Date().toISOString(), ...stamp(team) } }
      return s
    })
    const setNote = (id, note) => update((s) => { s.checklist = { ...s.checklist, [id]: { ...(s.checklist[id] || {}), note, ...stamp(team) } }; return s })
    return h`
      <ol className="kh-checklist">
        ${CHECKLIST.map((c, i) => {
          const cur = state.checklist[c.id]
          return h`
            <li key=${c.id} className=${cx(cur?.done && "is-done")}>
              <button type="button" className="kh-check" onClick=${() => toggle(c.id)} aria-pressed=${String(Boolean(cur?.done))}>${cur?.done ? h`<${Icon} d=${ICON.check} size=${12} stroke=${2.4} />` : i + 1}</button>
              <span className="kh-check-label">${c.label}${cur?.done && cur.date ? h`<small>${formatStamp(cur.date, true)}</small>` : null}</span>
              <${AutoText} className="kh-input--note" value=${cur?.note} placeholder="Not" onCommit=${(v) => setNote(c.id, v)} />
              <${TeamChip} meta=${cur} />
            </li>
          `
        })}
      </ol>
    `
  }

  const trFold = (text) => String(text || "").toLocaleLowerCase("tr-TR")

  // Tıklayınca kaydırılabilir liste açılır; yazarak isimle aranır.
  function PersonPicker({ value, options, onChange, disabled, placeholder }) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [up, setUp] = useState(false)
    const rootRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
      if (!open) return
      const close = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false) }
      document.addEventListener("mousedown", close)
      return () => document.removeEventListener("mousedown", close)
    }, [open])

    // Liste, görünen alanın (sayfayı kaydıran kap) altında yer yoksa yukarı açılır.
    const visibleBox = (el) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const oy = getComputedStyle(p).overflowY
        if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight) return p.getBoundingClientRect()
      }
      return { top: 0, bottom: window.innerHeight }
    }

    useEffect(() => {
      if (open) rootRef.current?.querySelector(".kh-picker-pop")?.scrollIntoView({ block: "nearest" })
    }, [open])

    const toggle = () => {
      if (disabled) return
      if (!open && rootRef.current) {
        const rect = rootRef.current.getBoundingClientRect()
        const box = visibleBox(rootRef.current)
        const below = box.bottom - rect.bottom, above = rect.top - box.top
        setUp(below < 270 && above > below)
      }
      setQuery("")
      setOpen((o) => !o)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
    const pick = (name) => { onChange(name); setOpen(false) }
    const matches = options.filter((o) => trFold(o).includes(trFold(query.trim())))

    return h`
      <div className=${cx("kh-picker", open && "is-open", up && "is-up", disabled && "is-disabled")} ref=${rootRef}>
        <button type="button" className="kh-input kh-picker-trigger" disabled=${disabled} onClick=${toggle}>
          <span className=${cx(!value && "is-placeholder")}>${value || placeholder}</span>
          ${disabled ? null : h`<${Icon} d=${ICON.down} size=${14} />`}
        </button>
        ${open ? h`
          <div className="kh-picker-pop">
            <label className="kh-picker-search">
              <${Icon} d=${ICON.search} size=${13} />
              <input ref=${inputRef} value=${query} placeholder="İsimle ara" onChange=${(e) => setQuery(e.target.value)}
                onKeyDown=${(e) => { if (e.key === "Enter" && matches[0]) pick(matches[0]); if (e.key === "Escape") setOpen(false) }} />
            </label>
            <ul className="kh-picker-list">
              ${matches.length
                ? matches.map((o) => h`<li key=${o}><button type="button" className=${cx(o === value && "is-active")} onClick=${() => pick(o)}>${o}${o === value ? h`<${Icon} d=${ICON.check} size=${13} />` : null}</button></li>`)
                : h`<li className="kh-picker-empty">Sonuç yok</li>`}
            </ul>
          </div>
        ` : null}
      </div>
    `
  }

  function SignoffBody({ state, team, update, assignee }) {
    return h`
      <div className="kh-signoff">
        ${SIGNOFF.map((s) => {
          const stored = state.signoff[s.id] || {}
          if (s.source === "assignee") {
            const name = isFilled(assignee) ? assignee : stored.name
            return h`
              <div key=${s.id} className="kh-sign is-auto">
                <span className="kh-sign-role">${s.label}</span>
                <div className="kh-input kh-sign-fixed" title="Şirkete atanan sorumlu uzman">${name || "Sorumlu uzman atanmadı"}</div>
                <span className="kh-sign-note">Şirkete atanan sorumlu uzman; onay gerekmez.</span>
              </div>
            `
          }
          const cur = stored
          const canApprove = team === s.team && isFilled(cur.name)
          return h`
            <div key=${s.id} className=${cx("kh-sign", cur.approved && "is-approved")}>
              <span className="kh-sign-role">${s.label}</span>
              ${h`<${PersonPicker} value=${cur.name} options=${OPS_PEOPLE[s.people] || []} disabled=${cur.approved} placeholder=${s.people === "ogy" ? "OGY seçin" : "MT seçin"}
                    onChange=${(v) => update((st) => { st.signoff = { ...st.signoff, [s.id]: { ...cur, name: v } }; return st })} />`}
              ${cur.approved
                ? h`<span className="kh-sign-ok"><${Icon} d=${ICON.check} size=${13} /> Onaylandı · ${formatStamp(cur.at, true)}</span>`
                : h`<button type="button" className="kh-btn" disabled=${!canApprove} title=${team !== s.team ? `${TEAMS[s.team].label} onaylar` : ""} onClick=${() => update((st) => { st.signoff = { ...st.signoff, [s.id]: { ...cur, approved: true, ...stamp(team) } }; return st })}>Onayla</button>`}
            </div>
          `
        })}
      </div>
    `
  }

  function NoteList({ notes, team, update, showSection }) {
    if (!notes.length) return null
    return h`
      <ul className="kh-notes">
        ${notes.slice().reverse().map((n) => h`
          <li key=${n.id}>
            <span className=${`kh-team is-${n.team}`}>${TEAMS[n.team]?.short || n.team}</span>
            <div>
              <div className="kh-note-meta">
                <b>${TEAMS[n.team]?.label || n.team}</b>
                ${showSection ? h`<em>${SECTIONS.find((s) => s.id === n.sectionId)?.title || ""}</em>` : null}
                <small>${formatStamp(n.at, true)}</small>
                ${n.team === team ? h`<button type="button" className="kh-link" onClick=${() => update((s) => { s.notes = s.notes.filter((x) => x.id !== n.id); return s })}>Sil</button>` : null}
              </div>
              <p>${n.text}</p>
            </div>
          </li>
        `)}
      </ul>
    `
  }

  function NoteComposer({ sectionId, team, update }) {
    const [text, setText] = useState("")
    const add = () => {
      if (!text.trim()) return
      update((s) => { s.notes = [...s.notes, { id: `n${Date.now()}`, sectionId, team, text: text.trim(), at: new Date().toISOString() }]; return s })
      setText("")
    }
    return h`
      <div className="kh-composer">
        <span className=${`kh-team is-${team}`}>${TEAMS[team].short}</span>
        <textarea className="kh-input" rows="2" value=${text} placeholder=${`${TEAMS[team].label} olarak not ekleyin…`} onChange=${(e) => setText(e.target.value)} onKeyDown=${(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add() }}></textarea>
        <button type="button" className="kh-btn primary" disabled=${!text.trim()} onClick=${add}>Not ekle</button>
      </div>
    `
  }

  // ---------- Bölüm kartı ----------

  function SectionCard({ section, ctx, onlyEmpty }) {
    const { state, snapshot, orgCounts, team, update, syncing, onSync } = ctx
    const [notesOpen, setNotesOpen] = useState(false)
    const progress = sectionProgress(section, state, snapshot, orgCounts)
    const notes = section.kind === "notes" ? state.notes : notesFor(state, section.id)
    const complete = progress && progress.done === progress.total

    if (onlyEmpty && complete && section.kind !== "notes") return null

    let body
    const common = { state, snapshot, orgCounts, team, update, onlyEmpty, assignee: ctx.assignee }
    if (section.kind === "modules") body = h`<${ModulesBody} ...${common} />`
    else if (section.kind === "kalems") body = h`<${KalemsBody} ...${common} />`
    else if (section.kind === "credentials") body = h`<${CredentialsBody} ...${common} />`
    else if (section.kind === "jobs") body = h`<${JobsBody} ...${common} />`
    else if (section.kind === "checklist") body = h`<${ChecklistBody} ...${common} />`
    else if (section.kind === "signoff") body = h`<${SignoffBody} ...${common} />`
    else if (section.kind === "notes") body = h`
      <div>
        <${NoteComposer} sectionId="notlar" team=${team} update=${update} />
        ${notes.length ? h`<${NoteList} notes=${notes} team=${team} update=${update} showSection=${true} />` : h`<div className="kh-empty-line">Henüz not yok.</div>`}
      </div>
    `
    else body = h`
      <div>
        ${section.kind === "contacts" && !onlyEmpty ? h`<${ContactsBody} ...${common} />` : null}
        <${FieldsBody} section=${section} ...${common} />
      </div>
    `

    return h`
      <section id=${`kh-${section.id}`} className=${cx("kh-card", section.internal && "is-internal")}>
        <header className="kh-card-head">
          <div>
            <h2>${section.title}
              ${section.source === "dakika" ? h`<span className="kh-src is-dakika"><${Icon} d=${ICON.db} size=${11} />Dakika'dan</span>` : null}
              ${section.internal ? h`<span className="kh-src">Dasi'ye gitmez</span>` : null}
              ${section.kind === "credentials" ? h`<span className="kh-src"><${Icon} d=${ICON.lock} size=${11} />Dasi'ye gitmez</span>` : null}
            </h2>
            <p>${section.desc}</p>
          </div>
          <div className="kh-card-tools">
            ${section.source === "dakika" ? h`
              <button type="button" className="kh-btn sm" onClick=${onSync} disabled=${syncing}>
                <span className=${cx(syncing && "kh-spin")}><${Icon} d=${ICON.sync} size=${13} /></span>${syncing ? "Okunuyor…" : "Dakika'dan yenile"}
              </button>
            ` : null}
            ${progress ? h`<span className=${cx("kh-count", complete && "is-done")}>${progress.done}/${progress.total}</span>` : null}
            ${section.kind !== "notes" ? h`
              <button type="button" className=${cx("kh-btn sm ghost", notesOpen && "active")} onClick=${() => setNotesOpen(!notesOpen)}>
                <${Icon} d=${ICON.note} size=${13} /> Not${notes.length ? h`<b>${notes.length}</b>` : null}
              </button>
            ` : null}
          </div>
        </header>
        ${section.source === "dakika" && state.dakikaSyncedAt ? h`<div className="kh-sync-line">Son okuma: ${formatStamp(state.dakikaSyncedAt, true)}</div>` : null}
        <div className="kh-card-body">${body}</div>
        ${notesOpen && section.kind !== "notes" ? h`
          <div className="kh-card-notes">
            <${NoteList} notes=${notes} team=${team} update=${update} />
            <${NoteComposer} sectionId=${section.id} team=${team} update=${update} />
          </div>
        ` : null}
      </section>
    `
  }

  // ---------- Dasi aktarım modalı ----------

  const DASI_STEPS = ["Know-How paketleniyor", "Workgroup eşleştiriliyor", "Knowledge base'e yazılıyor", "Dasi indeksliyor"]

  // Dasi paketindeki markdown'ı önizlemede başlık / alan-değer / not satırları olarak gösterir.
  function DocPreview({ content }) {
    const blocks = []
    let inNotes = false
    String(content || "").split("\n").forEach((line) => {
      if (!line.trim()) return
      if (line.startsWith("## ")) { blocks.push({ t: "title", text: line.slice(3) }); return }
      if (line.startsWith("### Ekip notları")) { inNotes = true; blocks.push({ t: "sub", text: "Ekip notları" }); return }
      if (line.startsWith("### ")) { inNotes = false; blocks.push({ t: "item", text: line.slice(4) }); return }
      if (/^\*\*.+\*\*$/.test(line.trim())) { blocks.push({ t: "sub", text: line.trim().slice(2, -2) }); return }
      if (line.startsWith("  ") && blocks.length && blocks[blocks.length - 1].t === "kv") { blocks[blocks.length - 1].value += `\n${line.trim()}`; return }
      if (inNotes && line.startsWith("- [")) {
        const m = line.match(/^- \[([^,]+), ([^\]]+)\] (.*)$/)
        blocks.push(m ? { t: "note", who: m[1], at: m[2], text: m[3] } : { t: "p", text: line.slice(2) }); return
      }
      const kv = line.match(/^-?\s*([^:]{1,90}):\s?(.*)$/)
      if (kv) { blocks.push({ t: "kv", key: kv[1].trim(), value: kv[2] }); return }
      blocks.push({ t: "p", text: line.replace(/^- /, "") })
    })
    const pretty = (v) => v === "Evet" || v.startsWith("Evet —") ? h`<span className="kh-pv-yes">${v}</span>` : v === "Hayır" || v.startsWith("Hayır —") ? h`<span className="kh-pv-no">${v}</span>` : v
    return h`
      <div className="kh-pv">
        ${blocks.map((b, i) => b.t === "title" ? h`<h4 key=${i}>${b.text}</h4>`
          : b.t === "sub" ? h`<div key=${i} className="kh-pv-sub">${b.text}</div>`
          : b.t === "item" ? h`<div key=${i} className="kh-pv-item">${b.text}</div>`
          : b.t === "kv" ? h`<div key=${i} className="kh-pv-kv"><span>${b.key}</span><b>${b.value ? pretty(b.value) : "—"}</b></div>`
          : b.t === "note" ? h`<div key=${i} className="kh-pv-note"><em>${b.who}</em><small>${b.at}</small><p>${b.text}</p></div>`
          : h`<p key=${i} className="kh-pv-p">${b.text}</p>`)}
      </div>
    `
  }

  const DOC_ICONS = { profil: ICON.building, iletisim: ICON.note, mevzuat: ICON.scale, yasal: ICON.scale, bordro: ICON.scale, cikis: ICON.scale, odeme: ICON.book, raporlar: ICON.book, moduller: ICON.db, kalemler: ICON.db, islem: ICON.db, isler: ICON.flag, notlar: ICON.note }

  function DasiModal({ isOpen, companyName, onClose, onComplete }) {
    const [phase, setPhase] = useState("preview")
    const [stepIndex, setStepIndex] = useState(0)
    const [pkg, setPkg] = useState(null)
    const [activeDoc, setActiveDoc] = useState(0)
    const [redirect, setRedirect] = useState(false)
    const timers = useRef([])

    useEffect(() => {
      if (!isOpen) return
      const state = readGroup(companyName)
      setPkg(buildDasiPackage(companyName, state, readDakikaSnapshot(companyName), readOrgCounts(companyName), readActor()))
      setPhase("preview"); setStepIndex(0); setActiveDoc(0)
      return () => { timers.current.forEach(clearTimeout); timers.current = [] }
    }, [isOpen, companyName])

    if (!isOpen || !pkg) return null

    const state = readGroup(companyName)
    const snapshot = readDakikaSnapshot(companyName)
    const orgCounts = readOrgCounts(companyName)
    const progress = overallProgress(state, snapshot, orgCounts)
    const unmarked = DAKIKA_MODULES.filter((m) => moduleValue(state, m.id).value === null)
    const draftCount = state.draftKalems.length
    const signed = SIGNOFF_APPROVALS.filter((s) => state.signoff[s.id]?.approved).length
    const last = state.dasi.history[state.dasi.history.length - 1]

    function run() {
      setPhase("running")
      DASI_STEPS.forEach((_, i) => {
        timers.current.push(setTimeout(() => setStepIndex(i + 1), 650 * (i + 1)))
      })
      timers.current.push(setTimeout(() => {
        const actor = readActor()
        const s = readGroup(companyName)
        s.dasi = { history: [...(s.dasi?.history || []), { version: pkg.version, at: pkg.exportedAt, by: actor, docCount: pkg.documents.length }] }
        writeGroup(companyName, s)
        setPhase("done")
      }, 650 * DASI_STEPS.length + 300))
    }

    function downloadJson() {
      const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `know-how-${pkg.workgroup.key}-v${pkg.version}.json`
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    }

    const warnings = [
      progress.pct < 100 ? `Know-How %${progress.pct} dolu; boş alanlar Dasi'ye gitmez.` : null,
      unmarked.length ? `${unmarked.length} modül henüz işaretlenmedi (${unmarked.map((d) => d.label).join(", ")}).` : null,
      draftCount ? `${draftCount} taslak kalem Dakika'ya henüz tanımlanmadı.` : null,
      signed < SIGNOFF_APPROVALS.length ? `Devir onayı ${signed}/${SIGNOFF_APPROVALS.length}.` : null
    ].filter(Boolean)

    const doc = pkg.documents[activeDoc]

    return ReactDOM.createPortal(h`
      <div className="kh-modal-backdrop" onClick=${phase === "running" ? undefined : onClose}>
        <div className="kh-modal" role="dialog" aria-modal="true" aria-label="Dasi'ye aktar" onClick=${(e) => e.stopPropagation()}>
          <header className="kh-modal-head">
            <span className="kh-dasi-mark is-bot"><img src=${DASI_IMG.avatar} alt="Dasi" /></span>
            <div>
              <h3>Know-How'ı Dasi'ye Aktar</h3>
              <p>${companyName} workgroup'u · Dasi bilgi bankası</p>
            </div>
            <span className="kh-dasi-ver">${phase === "done" ? `v${pkg.version} Dasi'de` : last ? `v${last.version} → v${pkg.version}` : `İlk aktarım · v${pkg.version}`}</span>
            ${phase !== "running" ? h`<button type="button" className="kh-icon-btn" onClick=${onClose} aria-label="Kapat"><${Icon} d=${ICON.close} /></button>` : null}
          </header>

          ${phase === "preview" ? h`
            <div className="kh-modal-body is-preview">
              <div className="kh-dasi-kpis">
                <div><span className="is-doc"><${Icon} d=${ICON.book} size=${15} /></span><strong>${pkg.documents.length}</strong><small>doküman aktarılacak</small></div>
                <div><span className="is-fill"><${Icon} d=${ICON.check} size=${15} /></span><strong>%${progress.pct}</strong><small>Know-How doluluğu</small></div>
                <div><span className="is-note"><${Icon} d=${ICON.note} size=${15} /></span><strong>${state.notes.length}</strong><small>ekip notu</small></div>
                <div><span className="is-sign"><${Icon} d=${ICON.flag} size=${15} /></span><strong>${signed}/${SIGNOFF_APPROVALS.length}</strong><small>devir onayı</small></div>
              </div>
              ${warnings.length ? h`<ul className="kh-dasi-warn">${warnings.map((w) => h`<li key=${w}><${Icon} d=${ICON.alert} size=${13} />${w}</li>`)}</ul>` : null}
              <div className="kh-dasi-preview">
                <div className="kh-dasi-docs">
                  <div className="kh-dasi-docs-head">Dokümanlar <em>${pkg.documents.length}</em></div>
                  <ul>
                    ${pkg.documents.map((d, i) => h`<li key=${d.id}><button type="button" className=${cx(i === activeDoc && "active")} onClick=${() => setActiveDoc(i)}><${Icon} d=${DOC_ICONS[d.section] || ICON.book} size=${13} /><span>${d.title.replace(`${companyName} · `, "")}</span></button></li>`)}
                  </ul>
                  <p className="kh-dasi-excluded"><${Icon} d=${ICON.lock} size=${12} /> Aktarılmaz: ${pkg.excluded.join(", ")}</p>
                </div>
                <div className="kh-dasi-doc">
                  ${doc ? h`
                    <div className="kh-dasi-doc-head">
                      <span>${pkg.workgroup.key}/${doc.section}</span>
                      <em>Dasi'nin göreceği içerik</em>
                    </div>
                    <${DocPreview} content=${doc.content} />
                  ` : h`<p className="kh-muted">Aktarılacak doküman yok.</p>`}
                </div>
              </div>
            </div>
            <footer className="kh-modal-foot">
              <button type="button" className="kh-btn ghost" onClick=${downloadJson}><${Icon} d=${ICON.download} size=${14} /> JSON indir</button>
              <span></span>
              <button type="button" className="kh-btn" onClick=${onClose}>Vazgeç</button>
              <button type="button" className="kh-btn dasi" disabled=${!pkg.documents.length} onClick=${run}><img src=${DASI_IMG.avatar} alt="" />Dasi'ye Aktar</button>
            </footer>
          ` : null}

          ${phase === "running" || phase === "done" ? h`
            <div className="kh-modal-body">
              <div className=${cx("kh-dasi-flow", phase === "done" && "is-done")} aria-hidden="true">
                <div className="kh-dasi-src">
                  <span><${Icon} d=${ICON.book} size=${18} /></span>
                  <b>SDP Know-How</b><small>${pkg.documents.length} doküman</small>
                </div>
                <div className="kh-dasi-lane">
                  ${phase === "running" ? [0, 1, 2, 3, 4].map((i) => h`<i key=${i} style=${{ animationDelay: `${i * 0.32}s` }}><${Icon} d=${ICON.book} size=${10} /></i>`) : h`<span className="kh-dasi-lane-ok"><${Icon} d=${ICON.check} size=${14} stroke=${2.6} /></span>`}
                </div>
                <div className="kh-dasi-dst">
                  <img src=${phase === "done" ? DASI_IMG.success : DASI_IMG.thinking} alt="" />
                  <b>Dasi</b><small>${phase === "done" ? `v${pkg.version} öğrenildi` : "öğreniyor…"}</small>
                </div>
              </div>
              <ol className="kh-dasi-steps">
                ${DASI_STEPS.map((label, i) => {
                  const done = phase === "done" || i < stepIndex
                  const active = phase === "running" && i === stepIndex
                  return h`<li key=${label} className=${cx(done && "is-done", active && "is-active")}><span>${done ? h`<${Icon} d=${ICON.check} size=${12} stroke=${2.4} />` : i + 1}</span>${label}</li>`
                })}
              </ol>
              ${phase === "done" ? h`
                <div className="kh-dasi-done">
                  <strong>Dasi, ${companyName} workgroup'u için ${pkg.documents.length} dokümanı aldı.</strong>
                  <p>Operasyon ve destek ekipleri bu firmayla ilgili soruları artık Dasi'ye sorabilir. Know-How'da yapılan sonraki değişiklikler yeniden aktarılarak güncellenir.</p>
                </div>
              ` : null}
            </div>
            <footer className="kh-modal-foot">
              <span></span>
              ${phase === "done" ? h`
                <button type="button" className="kh-btn" onClick=${() => { onComplete?.(); onClose() }}>Kapat</button>
                <button type="button" className="kh-btn dasi" onClick=${() => setRedirect(true)}><img src=${DASI_IMG.avatar} alt="" />Dasi'de Aç</button>
              ` : h`<span className="kh-muted">Aktarılıyor…</span>`}
            </footer>
            ${redirect ? h`<${DasiRedirect} groupName=${companyName} docCount=${pkg.documents.length} onClose=${() => { setRedirect(false); onComplete?.(); onClose() }} />` : null}
          ` : null}
        </div>
      </div>
    `, document.body)
  }


  // ---------- Dasi'ye yönlendirme (tam ekran animasyon + sohbet önizlemesi) ----------

  const DASI_IMG = { avatar: "Assets/dasi/dasi-avatar.png", thinking: "Assets/dasi/dasi-thinking.png", success: "Assets/dasi/dasi-success.png" }
  const DASI_STARS = [[12, 18], [24, 64], [38, 12], [70, 16], [84, 48], [66, 78], [18, 42], [90, 26], [48, 86], [8, 80], [78, 88], [56, 8]]

  // Know-How'dan Dasi'nin cevaplayabileceği örnek sorular; yalnız dolu alanlardan üretilir.
  function dasiQuestions(state, orgCounts) {
    const val = (id) => {
      const field = SECTIONS.flatMap((sec) => sec.fields || []).find((f) => f.id === id)
      return field ? String(fieldValue(state, field, orgCounts).value || "").trim() : ""
    }
    const note = (id) => String(state.answers[id]?.note || "").trim()
    const yes = (id) => val(id) === "yes"
    const list = []
    if (val("maasTarih")) list.push({ q: "Maaşlar ne zaman ödeniyor?", a: `Maaşlar ${val("maasTarih").toLocaleLowerCase("tr-TR")} ödeniyor.${val("maasYukleme") ? ` Banka dosyası ${val("maasYukleme").replace(/^Ödeme/, "ödeme")} yüklenmeli.` : ""}`, src: "Ödeme İşlemleri" })
    if (val("odemeDisketi")) list.push({ q: "Banka dosyasını kim yüklüyor?", a: val("odemeDisketi"), src: "Ödeme İşlemleri" })
    if (yes("sendikali")) list.push({ q: "Sendikalı çalışan var mı?", a: `Evet. ${note("sendikali") || "Firma sendikalı."}${yes("cocukAile") ? ` ${note("cocukAile") || "Çocuk ve aile yardımı yapılıyor."}` : ""}`, src: "Ücret, SGK ve Mevzuat" })
    if (val("muhasebeRaporu")) list.push({ q: "Muhasebe raporu ne zaman ve hangi formatta veriliyor?", a: `${val("muhasebeRaporu")}.${val("muhasebeTarih") ? ` Finansa ${val("muhasebeTarih").toLocaleLowerCase("tr-TR")} iletiliyor.` : ""}`, src: "Raporlar ve Bordro Gönderimi" })
    const kanun = [["k5510", "5510"], ["k14857", "14857"], ["k5746", "5746/4691"], ["k6111", "6111"]].filter(([id]) => yes(id))
    if (kanun.length) list.push({ q: "Hangi teşvikler uygulanıyor?", a: `${kanun.map(([id, label]) => `${label}${note(id) ? ` (${note(id)})` : ""}`).join(", ")}.${yes("digerTesvik") && note("digerTesvik") ? ` Ayrıca ${note("digerTesvik")}.` : ""}`, src: "Ücret, SGK ve Mevzuat" })
    if (val("icra")) list.push({ q: "İcra ve nafaka kesintileri nasıl yapılıyor?", a: `${val("icra")}${val("nafaka") ? ` ${val("nafaka")}` : ""}`, src: "Bordro Uygulamaları" })
    return list.slice(0, 4)
  }

  function DasiRedirect({ groupName, docCount, onClose }) {
    const [stage, setStage] = useState("travel")
    const [chat, setChat] = useState([])
    const [typing, setTyping] = useState(false)
    const timers = useRef([])
    const state = useMemo(() => readGroup(groupName), [groupName])
    const questions = useMemo(() => dasiQuestions(state, readOrgCounts(groupName)), [state, groupName])
    const asked = new Set(chat.filter((m) => m.from === "user").map((m) => m.text))

    useEffect(() => {
      timers.current.push(setTimeout(() => setStage("arrive"), 2300))
      timers.current.push(setTimeout(() => setStage("chat"), 3200))
      const onKey = (e) => { if (e.key === "Escape") onClose() }
      window.addEventListener("keydown", onKey)
      return () => { timers.current.forEach(clearTimeout); window.removeEventListener("keydown", onKey) }
    }, [])

    function ask(item) {
      if (typing) return
      setChat((c) => [...c, { from: "user", text: item.q }])
      setTyping(true)
      timers.current.push(setTimeout(() => {
        setTyping(false)
        setChat((c) => [...c, { from: "dasi", text: item.a, src: item.src }])
      }, 1400))
    }

    return ReactDOM.createPortal(h`
      <div className=${cx("dasi-go", `is-${stage}`)} role="dialog" aria-modal="true" aria-label="Dasi">
        <div className="dasi-go-sky" aria-hidden="true">
          ${DASI_STARS.map(([l, t], i) => h`<i key=${i} style=${{ left: `${l}%`, top: `${t}%`, animationDelay: `${(i % 6) * 0.35}s` }}></i>`)}
        </div>
        <button type="button" className="dasi-go-close" onClick=${onClose} aria-label="Kapat"><${Icon} d=${ICON.close} size=${18} /></button>

        ${stage !== "chat" ? h`
          <div className="dasi-go-stage">
            <div className="dasi-go-orbit" aria-hidden="true">
              <span className="dasi-go-ring r1"></span><span className="dasi-go-ring r2"></span><span className="dasi-go-ring r3"></span>
              ${["Firma Profili", "Ödeme", "Mevzuat", "Kalemler", "Raporlar", "Ekip Notları"].map((t, i) => h`<em key=${t} className="dasi-go-doc" style=${{ "--a": `${i * 60}deg`, animationDelay: `${i * 0.12}s` }}><${Icon} d=${ICON.book} size=${11} />${t}</em>`)}
              <img className="dasi-go-bot" src=${stage === "arrive" ? DASI_IMG.success : DASI_IMG.thinking} alt="Dasi" />
            </div>
            <h2>${stage === "arrive" ? "Dasi hazır!" : "Dasi'ye yönlendiriliyorsunuz"}</h2>
            <p>${groupName} workgroup'u · ${docCount} doküman Dasi'nin bilgi bankasında</p>
            <div className="dasi-go-bar"><i></i></div>
          </div>
        ` : h`
          <div className="dasi-go-app">
            <header className="dasi-go-top">
              <img src=${DASI_IMG.avatar} alt="" />
              <div><b>Dasi</b><span>Bilgi Bankası · ${groupName}</span></div>
              <em><i></i>${docCount} doküman öğrenildi</em>
            </header>
            <div className="dasi-go-hero">
              <img src=${DASI_IMG.success} alt="Dasi" />
              <h3>Merhaba! ${groupName}'in Know-How'ını öğrendim.</h3>
              <p>Operasyon ve destek ekipleri bu firmayla ilgili sorularını artık bana sorabilir. Cevaplarım Know-How kaynaklarına dayanır.</p>
            </div>
            <div className="dasi-go-chat">
              ${chat.map((m, i) => h`
                <div key=${i} className=${cx("dasi-go-msg", `is-${m.from}`)}>
                  ${m.from === "dasi" ? h`<img src=${DASI_IMG.avatar} alt="" />` : null}
                  <div><p>${m.text}</p>${m.src ? h`<small><${Icon} d=${ICON.book} size=${11} />Kaynak: ${groupName} · ${m.src}</small>` : null}</div>
                </div>
              `)}
              ${typing ? h`<div className="dasi-go-msg is-dasi is-typing"><img src=${DASI_IMG.thinking} alt="" /><div><p><i></i><i></i><i></i></p></div></div>` : null}
            </div>
            <div className="dasi-go-suggest">
              ${questions.filter((item) => !asked.has(item.q)).map((item) => h`<button key=${item.q} type="button" disabled=${typing} onClick=${() => ask(item)}><${Icon} d=${ICON.spark} size=${13} />${item.q}</button>`)}
            </div>
          </div>
        `}
      </div>
    `, document.body)
  }

  // ---------- Sayfa ----------

  const GROUP_ICONS = { firma: ICON.building, bordro: ICON.scale, dakika: ICON.db, devir: ICON.flag }

  function NavStatus({ progress }) {
    if (!progress) return h`<span className="kh-nav-status"></span>`
    const pct = progress.total ? progress.done / progress.total : 0
    if (pct >= 1) return h`<span className="kh-nav-status is-done"><${Icon} d=${ICON.check} size=${10} stroke=${3} /></span>`
    return h`<span className="kh-nav-status" style=${{ "--p": Math.round(pct * 100) }}></span>`
  }

  function KnowHowPage({ companyName, userRole, assignee }) {
    const groupName = companyName || "Grup"
    const { state, snapshot, orgCounts, update } = useKnowHow(groupName)
    const team = teamForRole(userRole)
    const [onlyEmpty, setOnlyEmpty] = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [activeId, setActiveId] = useState(SECTIONS[0].id)

    useEffect(() => { window.__sdpUserRole = userRole }, [userRole])

    useEffect(() => {
      if (!state.dakikaSyncedAt) update((s) => { s.dakikaSyncedAt = new Date().toISOString(); return s })
    }, [groupName])

    useEffect(() => {
      // Sayfa .app-content içinde kayar; kayan alanın üstünden 120px aşağıdaki çizgiyi geçen son bölüm aktiftir.
      const scroller = document.querySelector(".app-content") || window
      const onScroll = () => {
        const top = scroller === window ? 0 : scroller.getBoundingClientRect().top
        let current = SECTIONS[0].id
        SECTIONS.forEach((s) => {
          const el = document.getElementById(`kh-${s.id}`)
          if (el && el.getBoundingClientRect().top - top <= 120) current = s.id
        })
        setActiveId(current)
      }
      onScroll()
      scroller.addEventListener("scroll", onScroll, { passive: true })
      return () => scroller.removeEventListener("scroll", onScroll)
    }, [groupName, onlyEmpty])

    if (userRole === "editor" || userRole === "viewer") {
      return h`
        <div className="kh-page">
          <div className="kh-locked"><${Icon} d=${ICON.lock} size=${22} /><h2>Know-How Datassist ekiplerine özeldir</h2><p>Bu alan implementasyon, operasyon ve destek ekiplerinin iç dokümantasyonudur.</p></div>
        </div>
      `
    }

    function sync() {
      setSyncing(true)
      setTimeout(() => {
        update((s) => { s.dakikaSyncedAt = new Date().toISOString(); return s })
        setSyncing(false)
      }, 900)
    }

    function jumpTo(id) {
      const el = document.getElementById(`kh-${id}`)
      const scroller = document.querySelector(".app-content")
      if (!el) return
      setActiveId(id)
      if (!scroller) { el.scrollIntoView({ behavior: "smooth", block: "start" }); return }
      const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 16
      const start = scroller.scrollTop
      scroller.scrollTo({ top, behavior: "smooth" })
      // Hareket azaltma açık ya da smooth desteklenmiyorsa kaydırma hiç başlamaz; o zaman doğrudan atla.
      setTimeout(() => { if (scroller.scrollTop === start && Math.abs(top - start) > 2) scroller.scrollTop = top }, 160)
    }

    const progress = overallProgress(state, snapshot, orgCounts)
    const activeModules = DAKIKA_MODULES.filter((m) => moduleValue(state, m.id).value === true).length
    const kalemList = allKalems(state, snapshot)
    const kalemNoted = kalemList.filter((k) => isFilled(state.kalems[k.code]?.aciklama)).length
    const checkDone = CHECKLIST.filter((c) => state.checklist[c.id]?.done).length
    const ctx = { state, snapshot, orgCounts, team, update, syncing, onSync: sync, assignee }

    const stats = [
      { label: "Modüller", sub: "kullanılıyor", icon: ICON.db, value: activeModules, total: DAKIKA_MODULES.length, target: "moduller" },
      { label: "Bordro kalemleri", sub: "açıklamalı", icon: ICON.book, value: kalemNoted, total: kalemList.length, target: "kalemler" },
      { label: "Ekip notları", sub: state.notes.length ? "not eklendi" : "henüz not yok", icon: ICON.note, value: state.notes.length, target: "notlar" },
      { label: "Check list", sub: "adım tamamlandı", icon: ICON.check, value: checkDone, total: CHECKLIST.length, target: "checklist" }
    ]

    return h`
      <div className="kh-page">
        <section className="kh-summary" aria-label="Özet">
          <div className="kh-summary-progress">
            <span className="kh-stat-label"><span className="kh-stat-icon is-brand"><${Icon} d=${ICON.spark} size=${13} /></span>Doluluk</span>
            <strong className="kh-stat-value">%${progress.pct}</strong>
            <div className="kh-bar"><i style=${{ width: `${Math.max(progress.pct, progress.done ? 2 : 0)}%` }}></i></div>
            <small className="kh-stat-sub">${progress.done} / ${progress.total} alan dolduruldu</small>
          </div>
          ${stats.map((st) => h`
            <button key=${st.label} type="button" className="kh-stat" onClick=${() => jumpTo(st.target)}>
              <span className="kh-stat-label"><span className="kh-stat-icon"><${Icon} d=${st.icon} size=${13} /></span>${st.label}<${Icon} d=${ICON.chevron} size=${13} /></span>
              <strong className="kh-stat-value">${st.value}${st.total != null ? h`<small>/${st.total}</small>` : null}</strong>
              <div className="kh-bar is-soft">${st.total ? h`<i style=${{ width: `${Math.round((st.value / st.total) * 100)}%` }}></i>` : null}</div>
              <small className="kh-stat-sub">${st.sub}</small>
            </button>
          `)}
        </section>

        <div className="kh-layout">
          <aside className="kh-nav" aria-label="Know-How bölümleri">
            <label className=${cx("kh-filter", onlyEmpty && "is-on")}>
              <input type="checkbox" checked=${onlyEmpty} onChange=${(e) => setOnlyEmpty(e.target.checked)} />
              <span className="kh-switch" aria-hidden="true"><i></i></span>
              <span>Sadece boş alanlar</span>
            </label>
            ${SECTION_GROUPS.map((g) => h`
              <div key=${g.id} className="kh-nav-group">
                <div className="kh-nav-head"><${Icon} d=${GROUP_ICONS[g.id]} size=${13} />${g.label}</div>
                <ul>
                  ${g.sections.map((id) => {
                    const s = SECTIONS.find((x) => x.id === id)
                    const p = sectionProgress(s, state, snapshot, orgCounts)
                    return h`
                      <li key=${id}>
                        <a href=${`#kh-${id}`} className=${cx(activeId === id && "active")} onClick=${(e) => { e.preventDefault(); jumpTo(id) }}>
                          <${NavStatus} progress=${p} />
                          <span className="kh-nav-label" title=${s.title}>${s.title}</span>
                          ${p ? h`<small>${p.done}/${p.total}</small>` : s.kind === "notes" && state.notes.length ? h`<small>${state.notes.length}</small>` : null}
                        </a>
                      </li>
                    `
                  })}
                </ul>
              </div>
            `)}
          </aside>

          <div className="kh-cards">
            ${SECTION_GROUPS.map((g) => {
              const cards = g.sections.map((id) => SECTIONS.find((x) => x.id === id)).map((sec) => h`<${SectionCard} key=${sec.id} section=${sec} ctx=${ctx} onlyEmpty=${onlyEmpty} />`)
              return h`
                <div key=${g.id} className="kh-group">
                  <div className="kh-group-head"><span><${Icon} d=${GROUP_ICONS[g.id]} size=${14} /></span>${g.label}</div>
                  ${cards}
                </div>
              `
            })}
          </div>
        </div>
      </div>
    `
  }

  window.KnowHowPage = KnowHowPage
  window.KnowHowDasiModal = DasiModal
  window.KnowHowDasiRedirect = DasiRedirect
  window.KnowHowStore = {
    getLastExport(groupName) {
      const history = readGroup(groupName).dasi.history
      return history[history.length - 1] || null
    },
    isStale(groupName) {
      const state = readGroup(groupName)
      const last = state.dasi.history[state.dasi.history.length - 1]
      return Boolean(last && state.updatedAt && new Date(state.updatedAt) > new Date(last.at))
    },
    getProgress(groupName) {
      return overallProgress(readGroup(groupName), readDakikaSnapshot(groupName), readOrgCounts(groupName))
    }
  }
})()
