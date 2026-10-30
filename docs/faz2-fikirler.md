# SDP Implementasyon – Faz 2 Fikir Havuzu

> **Yaşayan doküman.** Datassist şirket repoları okunarak implementasyon modülüne neler eklenebileceği çıkarılır. Periyodik güncellemede yeni commit'lere bakılır; yeni fikirler yeni ID ile eklenir, mevcut fikirlerin durumu güncellenir, değişiklikler en alttaki **Güncelleme Günlüğü**'ne tarihli olarak yazılır.
>
> - **Son tarama:** 20 Eki 2026 (ilk derin analiz)
> - **Yöntem:** Repolar klonlanmadan, `gh api` ile uzaktan okundu (salt okuma). 56 öncelikli repo kod seviyesinde, kalan ~140 repo README seviyesinde tarandı.
> - **Fikir ID'leri:** `HK-xx` = Hızlı kazanım, `BB-xx` = Büyük bahis. ID'ler kalıcıdır; bir fikir düşerse silinmez, durumu `Düştü` yapılır.
> - **Durum değerleri:** `Yeni` · `Değerlendiriliyor` · `Prototipte` · `Backlog` · `Düştü`
> - **Efor:** S (≤1 hafta) · M (2–4 hafta) · L (1+ ay, birden çok ekip). **Öncelik:** P1 · P2 · P3

---

## 1. Prototipin bugünkü kapsamı (referans)

| Alan | Prototipte olan |
|---|---|
| Aşamalar | 6 aşama: Sistem Kurulumu → Bordro Analiz Çalışmaları → (ops.) Rapor Geliştirme ve Entegrasyon → (ops.) Muhasebe Rapor Kurulumu → Canlıya Geçiş Hazırlıkları → Canlıya Geçiş |
| Starter Kit | Excel düzenleyici, validasyon (hata / uyarı / güncelleme), renklendirilmiş Excel indirme, uzman onayı sonrası tek tuşla Grup → Şirket → İşyeri → Departman → Çalışan kurulumu |
| Organizasyon Yapısı | Starter Kit'ten üretilen ağaç sayfası |
| Belge yönetimi | Müşteri / Datassist sütunları, revizyon talebi, onay bildirimi, isteğe bağlı / koşullu belgeler ("Değişiklik yok") |
| Takvim | Geçiş tipine göre (hızlı / örneklem / paralel) iş günü bazlı otomatik aşama tarihleri, müşteri payı |
| SLA | SLA Çalışma Alanı, gecikme uyarıları, audit listesi |
| Canlıya Geçiş | Firma kopyalama, OGY/MT ataması |
| Diğer | Şirket yönetimi, kullanıcı oluşturma + kimlik bilgisi maili, mesajlaşma, dashboard |

---

## 2. Repo haritası

Sütunlar: **Repo**, **Ne yapar**, **İmplementasyona ilgisi** (★★★ doğrudan, ★★ güçlü fırsat, ★ dolaylı).

### 2.1 İmplementasyonun çekirdeği

| Repo | Ne yapar | İlgi |
|---|---|---|
| implementation-service | Onboarding domain'i. Aşamalar, görev kataloğu, belge inceleme yaşam döngüsü, 3 SLA saati, kaskad gecikme, audit_event, go-live, kullanıcı ve birim oluşturma | ★★★ |
| implementation-validation-service | Starter Kit "Kişisel Bilgi" sayfası validasyonu: 54 kolon, 5 seviye (error / correction / flag_user / flag_specialist / addition), renklendirilmiş düzeltilmiş dosya | ★★★ |
| sdp-backend | sdp-ui'ın BFF'i. Implementation proxy'leri, roller (CL_VIEWER / CL_EDITOR / SPECIALIST / HEAD), mesajlar, bildirim kutusu, agentic-operations proxy'si | ★★★ |
| sdp-ui | Canlı UI: `/implementation/{company, processes, dashboard, sla}` | ★★★ |
| sdp-client | SDP DTO kütüphanesi. `WorkgroupType` içinde IMPLEMENTATION yok, güncel değil | ★ |
| workspace-service | Workgroup, workspace (kanal), event (due date), mesaj v2: mention, reaction, flag, arama, PDF export | ★★ |

### 2.1b Dakika monoliti

| Repo | Ne yapar | İlgi |
|---|---|---|
| dakika-payroll | Dakika'nın ana gövdesi (Java 8, JBoss Seam 2 + JSF, EJB, ~3.900 dosya). Toplu aktarım ekranları burada: birim yaratma, çalışan yaratma, değer güncelleme, masraf merkezi/proje dağılımı (AR-1529). Firma kopyalama burada. **`POST /item-copy/go-live` REST ucu implementation-service için yazılmış** (SQUAD-549). Müşteriye özel banka ve GL rapor sınıfları da burada | ★★★ |
| dakika-ui-mono-repo | "Port UI" monoreposu (port-dakika + mobil). İmplementasyonla ilgisi yok | — |
| dakika-test-automation | Selenium testleri. SDP tarafında yalnız bordro hesapla/kesinleştir test ediliyor; kurulum ve go-live testi yok | ★ |

### 2.2 Veri, eşleme ve validasyon

| Repo | Ne yapar | İlgi |
|---|---|---|
| mapping-service | Müşteri bordro/icmal kolonlarını Datassist kataloğuna eşler. Şablon tanıma (LOGO, LUCA, SAP, ZIRVE, ORKA, DELTA…), müşteri bazlı karar hafızası, cross-customer öneri, AI aday | ★★★ |
| validation-service | Ortak kural motoru: 121 alan, 270 kural, 30+ strateji, SpEL. `/bundle` kuralları istemci tarafında çalıştırmaya izin verir; quick-fix önerileri var. Severity yok | ★★ |
| rule-validator | Düz Türkçe kural talebinden LLM ile SpEL üretir, deterministik kapılardan geçirir (zaten var mı, alan biliniyor mu) ve PR açar | ★★ |
| category-variable-service | Kategori ağacı, değişkenler, seçenekler (choices). Starter Kit kolonlarını veriden üretmek mümkün | ★★ |
| value-service | Tarihli (since/till) değerler, aylık ve yıllık değerler, snapshot ve geçmiş | ★★ |
| proxy-item-service | Birim / çalışan / istihdam kayıtları, hiyerarşi (README) | ★★ |
| mena-service | Çok ülkeli bordro orkestrasyonu: takvim, döngü, milestone, SLA, belge revizyonu, ülke bazlı stage plan | ★★ |
| mena-mapping-service | Rapor kalemlerini dashboard metriklerine eşler | ★ |

### 2.3 Bordro hesap, mutabakat ve takvim

| Repo | Ne yapar | İlgi |
|---|---|---|
| payroll-recon-engine-service / -backend / -ui ("RAKUN") | Eski sağlayıcının maliyet raporunu Dakika'da yeniden hesaplar ve farkları açıklar. Müşteriye özel Excel/PDF rapor üretir. Main'e henüz merge edilmedi, deploy edilmedi | ★★★ |
| analysis-service | Fark nedenlerini bulur: senaryo arama, kalem sırası keşfi, öğrenen profil, stateless `baseline` | ★★ |
| calculator-service | Bordro hesap motoru, diagnostic trace | ★★ |
| payroll-service | Bordro hesapla / kesinleştir / sıfırla, V3 asenkron. Test bordrosu ve paralel koşu için gerçek yol | ★★ |
| on-the-fly-payroll-service | Kayıt tutmadan hesap, `bulk-interval`. Net-brüt simülasyonu için uygun | ★★ |
| payroll-calendar-service | Paygroup bazlı, versiyonlu, müşteri onaylı bordro takvimi (ARGELİ / ARGESİZ şablon) | ★★★ |
| net-brut-mcp-service | Net-brüt ve kıdem hesaplarını MCP tool'u olarak sunar | ★ |
| sgk-gateway-service | SGK 4A işe giriş/çıkış, e-Vizite, mahsuplaşma (README) | ★ |
| global-adp-automation | ADP / CloudPay verisini Dakika formatına çevirir (README) | ★ |

### 2.4 AI ve agentic

| Repo | Ne yapar | İlgi |
|---|---|---|
| agentic-operations-service | Aylık bordro kontrolleri (M01–M20, E01–E05), bulgular, kontrol bazlı ve dönem bazlı onay | ★★★ |
| agentic-operations-ai-service | LLM katmanı: kural iyileştirme, mükerrerlik kontrolü, mevzuat kontrolü (RAG), kolon eşleme. On-prem Gemma | ★★ |
| agentic-operations-ui / -backend | Boş iskelet | — |
| ai-service ("luna") + payroll-agent-* | İK/bordro asistanı: tool calling, işe giriş talebi çıkarma, alan eşleme. gpt-5 kullanıyor | ★ |
| audit-ai | Denetim/güvenlik anketlerini geçmiş cevaplardan, kaynak göstererek yanıtlar | ★ |
| kai-gpu-host | On-prem LLM (Gemma 4 26B) + embedding. KVKK gereği bordro verisi buradan işlenmeli | ★★ |
| vector-embedding-service | OpenAI uyumlu embedding API | ★ |

### 2.5 Bilgi, destek ve iletişim

| Repo | Ne yapar | İlgi |
|---|---|---|
| knowledge-ai-service / -service / -backend / -ui | Bilgi Bankası. Hibrit RAG, kaynaklı cevap, etiket önerisi, "Dasi" sohbet ekranı, uzmana eskalasyon | ★★ |
| support-line-* | Redmine uyumlu ticket sistemi, SLA zaman alanları, AI konuşma katmanı, otomasyon durum makinesi | ★★ |
| support-chatbot-widget / -service | Gömülebilir yardım baloncuğu, RAG chatbot | ★★ |
| ops-chatbot | Kurum içi dosya okuyabilen chatbot (xlsx/pdf okuma + hesap) | ★ |
| lore | AI ajanları için karar/blocker hafızası (geliştirici aracı) | ★ |
| communication-service | E-posta (Mailgun), SMS/OTP, KEP e-imza. Şablon motoru ve zamanlama yok | ★★ |
| activity-log-service | Merkezi audit log. 6 ay saklama sınırı var | ★ |
| file-storage-service | Dosya + metadata etiketleri. Versiyonlama, virüs tarama ve presigned URL yok | ★ |
| authz-service | Süreli (validFrom/Until) kapsamlı yetkiler | ★★ |
| role-and-permission-service | Çalışan bazlı yetki, referanstan kopyalama, demo kullanıcılar | ★ |
| customer-service | API ürün/kapsam/token yönetimi. Müşteri ana kaydı değil | ★ |

### 2.6 Rapor, entegrasyon ve otomasyon

| Repo | Ne yapar | İlgi |
|---|---|---|
| no-code-report-* | Yeni rapor motoru. 69 banka disketi, 6 muhtasar, bordro zarfı, 140 masraf merkezi/muhasebe taslağı (SAP, Logo, Oracle GL…), taslak → yayın akışı | ★★★ |
| report-studio-* | Doğal dille rapor kurgulama (216 kolon, GPT) | ★ |
| integration-service | Müşteri İK sistemlerinden dosya/API entegrasyonu: SFTP + PGP, ADP, Workday dosyası, SOAP; ~80 müşteri konfigürasyonu, onay kuyruğu | ★★ |
| external-integration-service | Partner'lara açık güvenli API (OAuth scope'ları), web servis logları | ★ |
| airflow | Zamanlanmış işler (DAG). **`implementation_service_sla_evaluate` saatlik çalışıyor**; `knowledge_escalation_reminders`, `comparison_service_parallel_run` | ★★ |
| scheduler-service | Hatırlatma/uyarı mail görevleri (sözleşme, deneme süresi, belge süresi…) | ★ |
| data-aggregator-service | Yönetici dashboard grafikleri (Elasticsearch) | ★ |
| workflows | Sadece CI pipeline'ları | — |

### 2.7 README seviyesinde dikkat çekenler

| Repo | Not |
|---|---|
| datassist-finance-service | Logo cari ↔ unit eşlemesi, sözleşme, tahakkuk, fatura. Go-live'da faturalamayı başlatmak için aday |
| deletion-orchestration-service | Birimi tüm alt kayıtlarıyla silme. Test kurulumunu geri almak için aday |
| employee-document-service | Belge tipleri, zorunluluk kuralları, onay durumu. Belge yönetimi için referans tasarım |
| holiday-domain | Resmi tatil kütüphanesi (TR, RO, EG, AE…). Türkiye verisi 2026'da bitiyor |
| gallery-ui | Etkileşimli onboarding turu (react-joyride) |
| hr-analytics | Birim hiyerarşisinde aylık İK metrikleri |
| finance-code-validation | Excel'de hatalı hücreyi işaretleyip Türkçe rapor veren desen |
| muhsgk | MUHSGK beyanname XML'i üretimi |

---

## 3. Fikirler

Her fikir şu alanları taşır: **Ne yapar**, **Kaynak**, **Kazanç**, **Efor / Öncelik**, **Bağımlılık / Risk**, **Durum**.

### 3.1 Hızlı kazanımlar
Backend'de büyük ölçüde hazır olan, prototipte UI ile hemen gösterilebilecek fikirler.

#### HK-01 · Üç SLA saati ve kaskad gecikme rozetleri
- **Ne yapar:** Her aşamada üç ayrı sayaç gösterir: müşteri yüklemesi, Datassist inceleme cevabı (2 iş günü) ve aşama tamamlanması. Durum ON_TIME / AT_RISK (pencerenin son %25'i) / BREACHED olarak renklenir. Önceki aşamadaki gecikmenin sonraki tarihleri ne kadar kaydırdığı ("+3 iş günü kaydı") görünür.
- **Kaynak:** implementation-service `SlaCalculator`, `StageStateResolver`, `/api/sla/snapshot`; airflow `implementation_service_sla_evaluate`.
- **Kazanç:** Müşteri "neden geç" sorusunun cevabını kendisi görür. Uzman da riskteki aşamayı süre dolmadan fark eder.
- **Efor / Öncelik:** S / P1
- **Bağımlılık / Risk:** Kaskad verisi bugün yalnız SLA sayfasında. Müşteri rolüne snapshot kapalı, müşteriye sadeleştirilmiş görünüm gerekir.
- **Durum:** Yeni

#### HK-02 · Starter Kit sonucunda 5 seviye: uzmana özel notlar ve eklenen kolonlar
- **Ne yapar:** Mevcut hata / uyarı / güncelleme üçlüsüne iki seviye eklenir. "Uzman notu" (flag_specialist, mor) müşteriye hiç gösterilmez. "Eklenen kolon" (addition, yeşil başlık) şablonda olmayan kolonları listeler. Sonuç ekranı son validasyonu yeniden çalıştırmadan açar. "Düzeltmeleri kabul et" düzeltilmiş dosyayı yeni versiyon olarak kaydeder.
- **Kaynak:** implementation-validation-service `problems[].level`, `correctedFileHandle`; implementation-service `/task-documents/validation`, `create-from-handle`.
- **Kazanç:** Uzman, müşteriyi gereksiz uyarıya boğmadan kendi kontrol notlarını görür. Müşteri tekrar yükleme yapmadan düzeltilmiş dosyayla ilerler.
- **Efor / Öncelik:** S / P1
- **Bağımlılık / Risk:** Backend hazır. Metinler validasyon UX dokümanıyla uyumlu yazılmalı.
- **Durum:** Yeni

#### HK-03 · Taslak karar → toplu yayınla ve belge versiyon geçmişi
- **Ne yapar:** Uzman bir aşamadaki belgeler için onay/ret kararlarını taslak olarak biriktirir ve "Kararları gönder" ile tek seferde yayınlar. Müşteriye tek bildirim gider. Her belge satırında versiyon geçmişi gösterilir; yerine yenisi gelen (SMASHED) yüklemeler dahil. Müşteri incelemeye gönderdiği belgeyi geri çekebilir.
- **Kaynak:** implementation-service `draft_review_status`, `/api/tasks/send-decisions`, `withdraw-review`, `review_attachments`.
- **Kazanç:** Müşteri 6 ayrı bildirim yerine tek özet alır. Revizyon döngüsü izlenebilir olur.
- **Efor / Öncelik:** S–M / P1
- **Bağımlılık / Risk:** Yok, backend hazır.
- **Durum:** Yeni

#### HK-04 · Firma bazlı aktivite zaman çizelgesi
- **Ne yapar:** 14 audit olay tipi (dosya yüklendi, incelemeye gönderildi, onay/ret, kararlar gönderildi, hedef tarih değişti, kaskad uygulandı, opsiyonel modül açıldı, SLA riskte/aşıldı…) firma detayında filtrelenebilir bir akış olarak gösterilir. Yalnız uzman görür.
- **Kaynak:** implementation-service `audit_event`, `/api/sla/audit-history`.
- **Kazanç:** "Kim ne zaman ne yaptı" sorusu için mesaj geçmişi kazımaya gerek kalmaz. Müşteriyle tarih tartışmalarında kanıt olur.
- **Efor / Öncelik:** S / P2
- **Bağımlılık / Risk:** SLA Çalışma Alanı'ndaki audit listesi genelleştirilebilir.
- **Durum:** Yeni

#### HK-05 · Akıllı hatırlatma özeti
- **Ne yapar:** Müşteriye günlük tek bir mail gider: bekleyen belgeler, kalan iş günü, geciken maddeler. Uzmana da "48 saattir cevapsız inceleme" özeti gider. Prototipte belge satırında "Son hatırlatma: dün 09:00" etiketi ve firma ayarında hatırlatma sıklığı gösterilebilir.
- **Kaynak:** airflow (`knowledge_escalation_reminders` gruplama deseni: 12–24 / 24–36 / 36–48 / 48+ saat), communication-service `/api/email`, scheduler-service.
- **Kazanç:** Uzmanın manuel takip mesajları azalır. Müşteri payının gecikmesi SLA'yı daha az bozar.
- **Efor / Öncelik:** M / P1
- **Bağımlılık / Risk:** communication-service'te şablon motoru yok, HTML'i implementasyon tarafı üretmeli. Mail gönderen tarafın sorumluluğu netleşmeli.
- **Durum:** Yeni

#### HK-06 · Aşamaya duyarlı yardım paneli
- **Ne yapar:** Her aşamada sağ panelde "Bu adımla ilgili sık sorulanlar" listelenir (Bilgi Bankası makaleleri). Müşteri soru yazabilir; cevap bulunamazsa "Uzmana sor" ile aşamanın mesaj kanalına düşer. Yardım Merkezi menüsü bu kanala bağlanır.
- **Kaynak:** knowledge-ai-service `POST /answer` (kaynaklı cevap), `labeling.py` (makaleleri aşama etiketiyle otomatik etiketleme); knowledge-ui `dasi/*`, `ask-expert-dialog`; support-chatbot-widget.
- **Kazanç:** Tekrarlayan "şablonda X ne demek" soruları uzmana gelmeden çözülür.
- **Efor / Öncelik:** M / P2
- **Bağımlılık / Risk:** knowledge-ai-service'te PII maskeleme kapalı. Müşteri sorusunda TCKN/IBAN geçebilir, önce düzeltilmeli. Bkz. bölüm 5.
- **Durum:** Yeni

#### HK-07 · Bordro takvimini dosya yerine sistemde kurmak
- **Ne yapar:** Canlıya Geçiş Hazırlıkları'ndaki "Bordro Takvimi 2026" maddesi dosya yükleme olmaktan çıkar. Uzman şablonu (ARGELİ / ARGESİZ) seçer, dönemler otomatik üretilir, tatile denk gelen günler kırmızı işaretlenir, takvim müşteriye "Onayla / Revizyon iste" ile gider.
- **Kaynak:** payroll-calendar-service (`/api/admin/payroll-calendars`, `/api/client/payroll-calendars/approve|reject`, Excel export, versiyonlama).
- **Kazanç:** Takvim operasyona devirde hazır ve onaylı olur; Excel'den tekrar girilmez.
- **Efor / Öncelik:** M / P1
- **Bağımlılık / Risk:** payroll-calendar-service yeni (PRD v1.0). Paygroup kurulumu go-live'dan önce gerekir.
- **Durum:** Yeni

#### HK-08 · Banka ve muhasebe formatı "hazır mı?" göstergesi
- **Ne yapar:** Müşteri banka disketi örneğini yüklediğinde veya bankasını seçtiğinde "Bu banka formatı sistemde hazır (Garanti – Excel)" ya da "Yeni format geliştirmesi gerekir" bilgisi gösterilir. Muhasebe tarafında da hedef ERP (SAP, Logo, Oracle GL…) için hazır taslak olup olmadığı görünür.
- **Kaynak:** no-code-report-backend `/api/reports/banks`, `/catalogs`; no-code-report-service tanımları (69 banka, 140 masraf merkezi taslağı).
- **Kazanç:** Rapor/entegrasyon eforu kick-off'ta görünür. Opsiyonel G&E aşamasının açılıp açılmayacağına erken karar verilir.
- **Efor / Öncelik:** S / P2
- **Bağımlılık / Risk:** Tanımlar yalnız sentetik veriyle doğrulanmış.
- **Durum:** Yeni

#### HK-09 · Mesajlaşmada v2 özellikleri
- **Ne yapar:** Aşama mesajlarında @mention (@herkes dahil), tepki, işaretleme (flag), dosya adı dahil arama, okunmamış sayısı ve konuşmayı PDF olarak dışa aktarma.
- **Kaynak:** workspace-service mesaj v2; sdp-backend `/api/v2/messages`, bildirim kutusu.
- **Kazanç:** Kaybolan karar mesajları azalır. Devirde konuşma geçmişi PDF olarak eklenebilir.
- **Efor / Öncelik:** S / P2
- **Bağımlılık / Risk:** Yok, backend canlıda.
- **Durum:** Yeni

#### HK-10 · Toplantıları gerçek takvim olayı yapmak
- **Ne yapar:** Kick-off ve geçiş toplantıları sohbet HTML'inin içine gömülü JSON (`data-impl-meeting`) yerine workspace event olarak tutulur. Tarih, sorumlu ve tamamlandı bilgisiyle firma takviminde görünür.
- **Kaynak:** workspace-service `WorkspaceEventController` (`due-time`), sdp-ui `stage-meeting.tsx`.
- **Kazanç:** Toplantılar takvimde ve SLA'da görünür. Hatırlatma (HK-05) bağlanabilir.
- **Efor / Öncelik:** S–M / P3
- **Bağımlılık / Risk:** Küçük backend işi.
- **Durum:** Yeni

#### HK-11 · Devir sihirbazında SaaS / Global kırılımları
- **Ne yapar:** Canlıya Geçiş'te firma kopyalama ve OGY/MT ataması tek akışta gösterilir. Onboarding tipine göre hedef grup seçilir (Global için alt gruplar). SaaS müşterilerinde rol ataması adımı gizlenir. Rol ataması kopyalama bitmeden açılmaz.
- **Kaynak:** implementation-service `GoLiveFlowService`, `/api/go-live/{copy-company, assign-roles, global-sub-groups}`; dakika-payroll `POST /item-copy/go-live` (`api/itemcopy/controller/ItemCopyApiController.java`).
- **Kopyalama seçenekleri (Dakika API):** bordro kopyalama tipi (kopyalama / bordro / kümülatif), tarih aralığı, puantaj ve icra kopyalama. Cevapta kopyalanan birim/çalışan/istihdam sayıları, süre ve uyarı döner. Bu seçenekler ve "N çalışan kopyalandı" özeti sihirbazda gösterilebilir.
- **Kazanç:** Prototip canlıdaki kuralla birebir hizalanır; operasyona yanlış devir riski azalır.
- **Efor / Öncelik:** S / P2
- **Bağımlılık / Risk:** Prototipte firma kopyalama ve OGY zaten var; eksik olan onboarding tipine göre dallanma. Dakika tarafındaki API boşlukları için bkz. BB-17.
- **Durum:** Yeni

#### HK-12 · Dakika konfigürasyon kontrol listesi
- **Ne yapar:** Uzmanın bugün Dakika'da elle kurduğu ayarlar implementasyonda bir kontrol listesi olarak görünür. Her madde Dakika verisinden otomatik "tamam / eksik" olarak işaretlenir:
  - Her İşyeri'nde SGK sicil no, SGK işyeri kodu ve vergi no dolu mu.
  - Her çalışanda IBAN/banka, ücret ve başlangıç tarihi var mı; masraf merkezi yüzdeleri toplamı 100 mü.
  - Banka ödeme formatı tanımlı mı (AR-1563 uyarısı).
  - Müşterinin GL/masraf merkezi raporu var mı.
  - Düzenli ödeme/kesinti kalemleri (otomatik elemanlar) tanımlı mı.
- **Kaynak:** dakika-payroll `util/VariableConstants.java` (birim değişkenleri), `report/implementation/bank/*`, `report/implementation/costcenter/RS*CostCenterReportAction` (~129 müşteriye özel sınıf), `AutomatedElementDefinitionFileUpload`, `CostCenterBatchUpload`.
- **Kazanç:** "Canlıya geçtik, banka formatı yokmuş" türü sürprizler biter. Canlıya Geçiş Hazırlıkları'ndaki dosya maddelerinin bir kısmı veriyle doğrulanır.
- **Efor / Öncelik:** M / P1 (prototipte mock checklist: S)
- **Bağımlılık / Risk:** Dakika'da bunu dönen bir uç yok. Önerilen: `GET /implementation/{unitId}/readiness`. BB-07 (hazırlık skoru) için ana veri kaynağı olur.
- **Durum:** Yeni

#### HK-13 · Kodla üretilen şablon + "Açıklama" sayfası
- **Ne yapar:** Starter Kit ve diğer şablonlar statik dosya yerine kodla üretilir. Başlıklar sabit, ilk sayfa doldurma talimatlarını içeren bir "Açıklama" sayfası. Kolon listesi müşterinin yetkili değişkenlerinden gelir.
- **Kaynak:** dakika-payroll `CostCenterDistributionExcel.createTemplate()` (AR-1529), `getPossibleVariables`; category-variable-service (BB-05).
- **Kazanç:** Şablon sürüm karmaşası biter. Müşteri doldururken açıklamayı dosyanın içinde görür.
- **Efor / Öncelik:** S–M / P2
- **Bağımlılık / Risk:** BB-05'in hafif ilk adımı.
- **Durum:** Yeni

### 3.2 Büyük bahisler
AI/agentic işler, otomatik validasyon, eşleme önerisi, canlı geçiş kontrolleri ve uçtan uca otomasyon.

#### BB-01 · Bordro Analiz aşamasını mutabakat motoruyla (RAKUN) çalıştırmak ⭐
- **Ne yapar:** Müşterinin yüklediği "Maliyet Raporu (Çarşaf İcmal)" doğrudan mutabakat analizine dönüşür:
  1. Dosya çözümlenir; şablon tanınır ("Logo formatına %92 benziyor").
  2. Kolonlar eşlenir.
  3. "Dosyanın söylemedikleri" soruları sorulur (dönem, devreden kümülatifler…).
  4. Dakika'da yeniden hesaplanır.
  5. Çalışanlar KAPANDI / AÇIK / EKSİK olarak ayrılır.
  6. Farklar senaryoya göre açıklanır.

  Müşteriye özel fark raporu (Excel/PDF) aşamanın çıktısı olur.
- **Kaynak:** payroll-recon-engine-service (`/api/analyses`, `input-precheck`, `blockers`, tolerans sabitleri), payroll-recon-engine-backend (`CustomerReportComposer`, Excel/PDF rapor), payroll-recon-engine-ui (wizard desenleri), analysis-service.
- **Kazanç:** Bordro Analiz bugün "dosya topla, elle karşılaştır" adımı; bu fikirle ölçülebilir bir kalite kapısına dönüşür. Go-live kararı veriye dayanır. Aynı eski sağlayıcıdan gelen sonraki müşteri öğrenen profil sayesinde daha hızlı analiz edilir.
- **Efor / Öncelik:** L / P1
- **Bağımlılık / Risk:** Mimari main'e merge edilmedi; mapping-service ve analysis-service 24 Eyl itibarıyla deploy edilmemiş. PDF bordro, banka disketi ve muhasebe örneği için servis yok (BB-12). Mutabakat ekibiyle ortak roadmap gerekir.
- **Durum:** Yeni

#### BB-02 · Ücret kalemi eşleme sihirbazı
- **Ne yapar:** Eski sağlayıcının bordro/icmal kolonları Datassist kalemlerine eşlenir ve üç gruba ayrılır:
  - Otomatik onaylı: birebir eşleşen ya da müşteri hafızasından gelen.
  - Tek tık onay: kural tabanlı veya başka müşterilerin onayladığı.
  - Eşlenemeyen: Datassist'te karşılığı yok.

  Eşlenemeyen her kolon Canlıya Geçiş Hazırlıkları'na "Yeni kalem tanımı gerekir" görevi olarak düşer. Kararlar müşteri hafızasına yazılır.
- **Kaynak:** mapping-service (`/api/cost-reports/{preview, mappings, mapped-dataset}`, şablon parmak izi, `mapping-profiles`, `alias-candidates`); agentic-operations-ai-service `/api/columns/match`.
- **Kazanç:** Kalem kurulumu sistematik olur. "Unutulan kalem" yüzünden ilk canlı bordroda fark çıkması önlenir. Her implementasyon global sözlüğü zenginleştirir.
- **Efor / Öncelik:** L / P1
- **Bağımlılık / Risk:** BB-01 ile aynı servis ailesinde; birlikte planlanmalı. AI önerileri test setlerinde düşük isabetli olduğu için bugün kapalı. UI'da AI etiketi ayrı ve "tek tek onay" zorunlu olmalı.
- **Durum:** Yeni

#### BB-03 · Tek tuşla sistem kurulumunun backend'i ve geri alma
- **Ne yapar:** Prototipteki "Starter Kit'ten tek tuşla kurulum" gerçek servis çağrılarına bağlanır:
  1. proxy-item-service ile İşyeri / Departman / Çalışan / İstihdam kayıtları açılır.
  2. value-service ile ücret, banka ve devreden değerleri yazılır.
  3. Kurulum hatalı çıkarsa deletion-orchestration-service ile "kurulumu geri al" yapılır.
- **Kaynak:** proxy-item-service, value-service (snapshot / save), category-variable-service, deletion-orchestration-service (`remove-unit-with-all-childs`); implementation-service `UnitController` (bugün yalnız Grup ve Şirket açabiliyor); dakika-payroll toplu aktarım mantığı (`upload/CreateBulkUnitFileUpload.java`, `upload/CreateEmployeeUpload.java`, `BulkUpdate*Upload`).
- **Kazanç:** Sistem Kurulumu aşamasının en uzun manuel işi (toplu aktarım ekranları) ortadan kalkar.
- **Efor / Öncelik:** L / P1
- **Bağımlılık / Risk:**
  - **Kritik bulgu:** implementation-service'te bu orkestrasyon yok, prototipteki akışın backend karşılığı sıfırdan yazılmalı. Şirket Bilgi ve İşyeri Bilgi sayfaları için validasyon kural seti de yok (bugün yalnız Kişisel Bilgi validasyonu yapılıyor). Geri almanın demo olmayan birimlerde güvenli olduğu doğrulanmalı.
  - **Dakika okumasından (20 Eki):** Dakika'daki toplu aktarımlar yalnız JSF ekranı olarak var, API olarak çağrılamıyor. Bu yüzden ya mantık Dakika'da ayrıştırılıp iç servis ucu açılmalı ya da proxy-item/value-service yolu seçilmeli.
  - Önerilen API şekli:
    - `units:validate|apply`: tüm ağaç geçici ID'lerle tek istekte gelir, tek transaction'da işlenir, İşyeri SGK/vergi/banka alanlarını da kabul eder.
    - `employees:validate|apply`: satır bazlı yapılandırılmış hata döner, şifre döndürmez.
    - `values:apply`: ücret ve banka değerlerini değişken adıyla yazar.
  - Dakika ekranının bugünkü kısıtları prototip akışını doğrular: birim yaratma yalnız ad ve tip yazıyor, aynı dosyada yeni açılan üst birime referans veremiyor (her seviye ayrı yükleme), hata olursa geri almıyor (yarım ağaç kalıyor).
  - AR-1529'daki (masraf merkezi toplu aktarımı) validator deseni örnek alınmalı: JSF'ten bağımsız, satır bazlı anahtarlı mesajlar, onayda yeniden validasyon, yalnız hatasız grupları aktarma.
- **Durum:** Yeni (prototip UI var, backend yok)

#### BB-04 · Starter Kit'te canlı (hücre bazlı) validasyon ve "kendi formatınla yükle"
- **Ne yapar:** Excel düzenleyicide her hücre düzenlemesinde kurallar tarayıcıda çalışır; hata o an kırmızı yanar ve "şu değerlerden birini seç" düzeltme çipleri çıkar. Kaydederken sunucu son sözü söyler. Müşteri kendi İK sisteminin export'unu da yükleyebilir; kolonlar Starter Kit kolonlarına eşlenip normalize edilir.
- **Kaynak:** validation-service `/api/validations/bundle` (istemci tarafı kural ağacı), `quick_fix_advices`, `/requirements`; mapping-service `mapped-dataset`; implementation-validation-service.
- **Kazanç:** Yükle → hata al → düzelt → tekrar yükle döngüsü kısalır. Şablon doldurma yükü azalır.
- **Efor / Öncelik:** L / P2
- **Bağımlılık / Risk:** İki ayrı kural motoru var (validation-service: Java/SpEL; implementation-validation-service: Python/JSON). Hangisinin kaynak olacağına karar verilmeli. validation-service'te hata/uyarı ayrımı (severity) yok.
- **Durum:** Yeni

#### BB-05 · Dinamik Starter Kit şablonu
- **Ne yapar:** Şablon kolonları, tipleri, zorunluluk bilgisi ve açılır liste değerleri müşterinin kategori/değişken tanımından üretilir. Sektör şablonu ("perakende", "üretim – AR-GE'li") referans müşteriden kopyalanır.
- **Kaynak:** category-variable-service (`/variables/focus`, `/choices`, `/categories/copy`).
- **Kazanç:** Elle güncellenen statik Excel şablonu kalkar. Müşteriye yalnız ihtiyacı olan kolonlar gider.
- **Efor / Öncelik:** M–L / P3
- **Bağımlılık / Risk:** Validasyon ruleset'iyle senkron kalmalı.
- **Durum:** Yeni

#### BB-06 · Paralel koşu kontrolleri ve go-live onay kapısı
- **Ne yapar:** Paralel koşu dönemlerinde aylık bordro kontrol havuzu, eski sağlayıcı bordrosuna karşı çalıştırılır:
  - M03 kümülatif matrah: yıl ortası geçişte kritik.
  - M04 / M08: çalışan sayısı ve SGK kişi sayısı tutarlılığı.
  - M06: net ödenen aritmetiği.
  - M12: asgari ücret.
  - E05: kolon aktarımı.

  Her kontrol için "onayla + not" alınır. Tüm kontroller onaylanınca "Canlıya geçiş onayı" (kim, ne zaman) verilir.
- **Kaynak:** agentic-operations-service (`@OperationControl` havuzu, `ControlFinding`, `PayrollControlState`: kontrol bazlı ve dönem bazlı onay), sdp-backend agentic-operations proxy'si.
- **Kazanç:** Go-live kararı standart bir kontrol listesine ve kanıta bağlanır. Aynı kontrolleri ilk canlı aylarda da kullanmak operasyona sorunsuz devir sağlar.
- **Efor / Öncelik:** L / P1
- **Bağımlılık / Risk:** Yeni bir veri kaynağı tipi gerekir (ör. `LEGACY_PAYROLL`). Bulgu/onay ekranı agentic-operations-ui'da yok, nerede yaşadığı bulunmalı.
- **Durum:** Yeni

#### BB-07 · Canlıya hazırlık skoru (agentic readiness)
- **Ne yapar:** Bir ajan, firmanın tüm durumunu toplar: açık Starter Kit bulguları, onaysız belgeler, eşlenemeyen kalemler, paralel koşu farkları, takvim onayı, entegrasyon durumu, SLA. Bunlardan `{durum, blocker'lar[], kanıtlar[]}` şeklinde bir hazırlık özeti üretir. Uzman her blocker için "istisna kabul + not" verir. İlk sürüm deterministik kurallarla, ikinci sürüm LLM özetiyle.
- **Kaynak:** implementation-service (stage state, SLA), BB-01/02/06 çıktıları; agentic-operations-ai-service desenleri (katı yapılandırılmış çıktı, kod tarafı doğrulama); kai-gpu-host (on-prem Gemma).
- **Kazanç:** Implementasyon lideri tüm portföyü "hazır / riskli / bloklu" diye tek bakışta görür. Go-live toplantısı bir rapora dayanır.
- **Efor / Öncelik:** L / P2
- **Bağımlılık / Risk:** KVKK gereği yalnız on-prem LLM kullanılmalı. Önce deterministik sürüm çıkmalı.
- **Durum:** Yeni

#### BB-08 · Entegrasyon kurulumunu aşamaya bağlamak
- **Ne yapar:** Rapor Geliştirme ve Entegrasyon aşamasında uzman veri kaynağını seçer: Excel, SFTP dosyası veya API. Entegrasyon konfigürasyonu şablondan üretilir, `dryRun` ile test edilir. "Entegrasyon canlı" maddesi web servis loglarında başarılı çağrı görülünce otomatik işaretlenir.
- **Kaynak:** integration-service (`/api/configuration/management/save`, `integrationConfigurationTemplate.xlsx`, `GenericUnitFeederImplementation`, onay kuyruğu), external-integration-service (`/api/web-service-logs/summary`), airflow entegrasyon DAG'ları.
- **Kazanç:** Entegrasyon durumu implementasyonda görünür hale gelir. "Entegrasyon Tanımı" Excel'i yerine çalışan bir konfigürasyon kalır.
- **Efor / Öncelik:** L / P2
- **Bağımlılık / Risk:** Konfigürasyonlar repoda JSON. Bazılarında düz metin token var (bkz. bölüm 5). Entegrasyon ekibiyle sahiplik netleşmeli.
- **Durum:** Yeni

#### BB-09 · Rapor Haritası'ndan no-code rapor taslaklarına
- **Ne yapar:** Müşterinin "Rapor Haritası"ndaki her satır bir rapor ailesine eşlenir: banka, muhtasar, bordro zarfı veya masraf merkezi/muhasebe. En yakın mevcut tanım taslak olarak klonlanır. Aşama ilerlemesi taslak → önizleme → yayın durumundan otomatik izlenir. Serbest metin talepler için report-studio ile önerilen rapor planı sunulur.
- **Kaynak:** no-code-report-backend (`/api/reports/settings/{id}/drafts`, `publish`, `preview`), no-code-report-service tanımları, report-studio-*.
- **Kazanç:** Muhasebe Rapor Kurulumu ve G&E aşamaları dosya takibi olmaktan çıkar, gerçek iş durumunu gösterir.
- **Efor / Öncelik:** L / P2
- **Bağımlılık / Risk:** Motor eski report-service'in yerini almak üzere; tanımların gerçek veriyle doğrulanması bekleniyor.
- **Durum:** Yeni

#### BB-10 · Müşteriye özel kural talebi
- **Ne yapar:** Uzman "Bu firmada TİS gereği bayram ikramiyesi brütün %50'si" gibi bir kuralı Türkçe yazar. Sistem kuralı yapılandırır, mükerrer olup olmadığını ve mevzuata uygunluğunu (RAG) kontrol eder, sonra inceleyici kuyruğuna gönderir. "Zaten var: M10" gibi reddetme gerekçeleri açıkça gösterilir.
- **Kaynak:** agentic-operations-ai-service `/api/rules/check-new`, rule-validator, sdp-backend `/api/agentic-operations-ai/rules/check-new`.
- **Kazanç:** Implementasyonda öğrenilen müşteri kuralları kaybolmaz; operasyona kontrol olarak devredilir.
- **Efor / Öncelik:** M / P3
- **Bağımlılık / Risk:** rule-validator'ın doğrulama tarafı henüz yazılmamış (501 dönüyor).
- **Durum:** Yeni

#### BB-11 · Implementasyon asistanı (müşteri + uzman copilot)
- **Ne yapar:**
  - **Müşteri tarafı:** "Starter Kit'te AR-GE oranını nereye yazıyorum?", "Paralel koşu ne demek?" gibi sorulara kaynaklı cevap verir; bulamazsa uzmana eskalasyon yapar.
  - **Uzman tarafı:** müşteri belgeleri (sözleşme, TİS) üzerinde soru-cevap, net-brüt ve kıdem hesabı (MCP), validasyon bulgularının sade dille özeti, KVKK/güvenlik anketlerinin geçmiş cevaplardan doldurulması.
- **Kaynak:** knowledge-ai-service, knowledge-ui `dasi/*`, payroll-agent-ui (hazır soru şablonları), net-brut-mcp-service, audit-ai, ops-chatbot (xlsx okuma deseni), kai-gpu-host.
- **Kazanç:** Uzman başına yönetilebilen paralel implementasyon sayısı artar.
- **Efor / Öncelik:** L / P2
- **Bağımlılık / Risk:** PII maskeleme, on-prem model zorunluluğu, kaynak gösterme ve "bilmiyorum" deme davranışı.
- **Durum:** Yeni

#### BB-12 · PDF bordro, banka disketi ve muhasebe örneğini otomatik okuma
- **Ne yapar:** Bordro Analiz'deki diğer üç belge de makineyle okunur:
  - **PDF bordrolar:** çalışan bazında net / brüt / kesinti değerleri çıkarılır ve maliyet raporuyla çapraz kontrol edilir.
  - **Banka disketi:** formatı tanınır ve no-code-report banka tanımıyla karşılaştırılır.
  - **Muhasebe örneği:** hesap kodları masraf merkezi eşlemesine aday olarak çıkarılır.
- **Kaynak:** Bu iş için doğrudan bir servis yok. ops-chatbot dosya okuma deseni, kai-gpu-host (vision/LLM), no-code-report banka tanımları, finance-code-validation deseni kullanılabilir.
- **Kazanç:** Bordro Analiz'in kalan manuel yarısı otomatikleşir.
- **Efor / Öncelik:** L / P3
- **Bağımlılık / Risk:** Format çeşitliliği yüksek; doğruluk ölçümü (golden set) gerekir.
- **Durum:** Yeni

#### BB-13 · Hypercare devri: destek hattına otomatik geçiş
- **Ne yapar:** Go-live'da firmanın destek hattı projesi, üyeleri ve kategorileri organizasyon yapısından otomatik kurulur. Kapanmamış checklist maddeleri bağlantılı ticket'lara dönüşür. İlk 1–2 ay ticket'lar "hypercare" kuyruğunda ayrı izlenir. Uzmanın implementasyon yetkileri go-live + 30 gün sonra otomatik düşer.
- **Kaynak:** support-line-* (`Project`, `IssueCategory`, `IssueRelation`, SLA zaman alanları, kuyruk görünümleri), authz-service (`validFrom` / `validUntil`).
- **Kazanç:** "Canlıya geçtik, açık konular nerede?" boşluğu kapanır. İlk ay şikâyetleri ölçülebilir hale gelir.
- **Efor / Öncelik:** M–L / P2
- **Bağımlılık / Risk:** support-line'da SLA duraklatma tabloları kaldırılmış; "müşteri bekleniyor" mantığı yeniden tasarlanmalı.
- **Durum:** Yeni

#### BB-14 · Go-live orkestrasyonu: faturalama, yetki, API, KEP
- **Ne yapar:** "Canlıya Geçir" tek adımda zincirleme işler yapar:
  1. Birimleri kesinleştirir.
  2. Kullanıcı yetkilerini referanstan kopyalar.
  3. Logo cari eşlemesini, sözleşmeyi ve ilk tahakkuku açar (seçilen opsiyonel modüllerden).
  4. Entegrasyon varsa API token'ı üretir.
  5. Go-live onayını KEP ile hukuki kanıt olarak gönderir.
  6. Audit kaydını yazar.
- **Kaynak:** datassist-finance-service, role-and-permission-service (referanstan kopyalama), customer-service (token), communication-service (KEP e-imza), activity-log-service.
- **Kazanç:** Satış → implementasyon → finans arasındaki elle aktarım ve fatura gecikmesi kalkar.
- **Efor / Öncelik:** L / P3
- **Bağımlılık / Risk:** Çok ekipli. activity-log'un 6 ay saklama sınırı implementasyon kayıtları için yetersiz olabilir.
- **Durum:** Yeni

#### BB-15 · Geçmiş implementasyonlardan öğrenme ve tahmini go-live
- **Ne yapar:** Kapanan implementasyonların aşama süreleri, revizyon sayıları, blocker'ları ve eski sağlayıcısı indekslenir. Yeni firmada "Benzer müşterilerde (Logo'dan gelen, 500–1000 çalışan) Bordro Analiz ortalama 9 iş günü sürdü" bilgisi ve gerçekçi go-live tahmini gösterilir. Sık revizyon sebepleri müşteriye önceden ipucu olarak verilir.
- **Kaynak:** implementation-service audit_event + SLA verisi, vector-embedding-service, knowledge-ai-service `index`; lore (karar/blocker kaydı kavramı).
- **Kazanç:** Takvim planlaması tahmine değil veriye dayanır. Revizyon döngüleri azalır.
- **Efor / Öncelik:** M–L / P3
- **Bağımlılık / Risk:** Yeterli tarihsel veri gerekir. audit_event V2'den beri tutuluyor.
- **Durum:** Yeni

#### BB-16 · Çok ülkeli implementasyon
- **Ne yapar:** Aşama ve görev kataloğu ülkeye göre değişir (TR, BAE, varsayılan). Starter Kit kolonları ve validasyon seti de ülkeye göre seçilir; TCKN/SGK kuralları yurt dışında kapanır. Tatil takvimi ülkeye göre olur.
- **Kaynak:** mena-service (ülke bazlı stage plan deseni, `TurkishPayrollStagePlan` / `EmiratesPayrollStagePlan`), holiday-domain, validation-service (birim bazlı validasyon setleri).
- **Kazanç:** MENA ve global müşteriler aynı modülle onboard edilir.
- **Efor / Öncelik:** L / P3
- **Bağımlılık / Risk:** Ticari öncelik netleşmeli.
- **Durum:** Yeni

#### BB-17 · Go-live kopyalamasını asenkron ve eksiksiz yapmak
- **Ne yapar:** Dakika `item-copy/go-live` ucu dört yönde genişletilir:
  1. **Asenkron çalışır:** iş ID'si ve durum ucu olur. Kopyalama 4 saate kadar sürebiliyor; prototipte "Kopyalanıyor · 1.240 / 3.100 çalışan" ilerleme çubuğu gösterilir.
  2. **Düzenli ödeme/kesinti kalemleri de kopyalanır:** JSF ekranında bu seçenek var, API'de yok.
  3. **Hedef alt grup baştan verilir:** kopya OUTSOURCING kökü yerine doğru yere iner.
  4. **Eski → yeni ID eşlemesi döner:** OGY/MT ataması ve masraf merkezi eşlemesi bunu kullanır.
- **Kaynak:** dakika-payroll `ItemCopyApiService`, `domain/service/ItemCopyService.java`, `ItemCopyingForm.copyAutomatedElements`.
- **Kazanç:** Devir günü "kopyalama bitti mi, takıldı mı" belirsizliği biter. Kopya sonrası elle taşıma ve kalem kurulumu kalkar.
- **Efor / Öncelik:** M–L / P2
- **Bağımlılık / Risk:**
  - Kopyalama, oturumdaki giriş yapmış kullanıcıyı geçici olarak değiştirerek çalışıyor; kod yorumunda eşzamanlı çağrılar için güvensiz olduğu yazıyor.
  - Dakika ekibinin kapasitesi gerekir.
- **Durum:** Yeni

---

## 4. Prototipe hemen eklenebilecek ilk 5 öneri

Seçim kriteri: backend'de karşılığı var veya büyük bahsin vitrini, ve prototipte mock veriyle 1–3 günde gösterilebilir.

| # | Öneri | Fikir | Prototipte nereye |
|---|---|---|---|
| 1 | **Aşama kartında 3 SLA saati + kaskad kaydırma rozeti** | HK-01 | İmplementasyon Süreçleri → aşama başlığı ve stepper. Müşteriye sade, uzmana detaylı görünüm |
| 2 | **Starter Kit sonucunda "Uzman notu" ve "Eklenen kolonlar"** + "Düzeltmeleri kabul et" | HK-02 | Uzman validasyon modalına mor seviye; müşteri modalında gizli |
| 3 | **"Mutabakat Sonucu" kartı** (KAPANDI / AÇIK / EKSİK, tolerans çipleri, müşteri fark raporu indir) | BB-01 vitrini | Bordro Analiz Çalışmaları → Maliyet Raporu satırının altında |
| 4 | **Ücret kalemi eşleme ekranı** ("Logo şablonu tanındı · 42/48 kolon eşlendi", 3 grup, eşlenemeyen → görev) | BB-02 vitrini | Bordro Analiz içinde yeni sekme veya modal |
| 5 | **Canlıya Hazırlık paneli** (blocker listesi + kanıt + istisna notu, ilk sürüm deterministik; maddeler HK-12'deki Dakika konfigürasyon kontrollerinden) | BB-07 / HK-12 / BB-06 vitrini | Canlıya Geçiş aşamasının üstünde; dashboard'da portföy kolonu |

> Alternatif 5. öneri: HK-03 (taslak karar → toplu yayınla). Backend tamamen hazır olduğu için canlıya en hızlı gidecek iş bu.

---

## 5. Taramada çıkan riskler ve bulgular (fikir değil, bilgi)

1. **Repolarda düz metin gizli bilgi:** knowledge-ai-service `app/config.py` (DB parolaları, LLM anahtarı), ai-service `application.yaml` (OpenAI ve Bugsnag anahtarları), integration-service bazı müşteri konfigürasyonları (unit feeder token), dakika-payroll `CustomAuthenticationFilter` (implementation-service'in go-live token'ı dahil servis token'ları). Değerler burada tekrarlanmadı. Sahip ekiplere iletilip anahtarlar değiştirilmeli.
2. **PII maskeleme kapalı:** knowledge-ai-service `mask_pii()` metni değiştirmeden döndürüyor. Müşteriye açık AI özelliklerinden (HK-06, BB-11) önce düzeltilmeli.
3. **Prototipte olup backend'de olmayanlar:**
   - Tek tuşla İşyeri / Departman / Çalışan kurulumu (BB-03).
   - Şirket Bilgi ve İşyeri Bilgi sayfalarının validasyonu.
4. **Asgari ücret iki yerde sabit:** implementation-validation-service `config.py` ve agentic-operations-service M12'de (2026: 33.030 brüt / 28.075,50 net). 2027 güncellemesi unutulmamalı.
5. **Tatil verisi 2026'da bitiyor:** holiday-domain'de Türkiye 2026'ya kadar. İş günü hesapları 2027'ye taşacak; implementation-service'in kendi `TurkeyHolidayProvider` kapsamı ayrıca kontrol edilmeli.
6. **Geçiş tipi enum'ları uyumsuz:** backend `NORMAL | FAST | EXTRA_FAST | SAMPLE`, prototip `fast | sample | parallel (+custom)`. sdp-ui'da da "enum değerlerini teyit et" TODO'su açık.
7. **Aşama kodları farklı:** backend `payroll-analysis`, `report-implementation`, `accounting-report-setup`, `live-preparation`, `operation-handover`; prototip `parallel-cost`, `implementation-report`, `transition-call`, `integrations`, `operations-handover`. Jira raporunda kod eşlemesi verilirse geliştirici tarafı kolaylaşır.
8. **Aşama bağımlılıkları paralel:** Backend'de aşama 3, 4 ve 5, aşama 2 bitince paralel açılıyor (SQUAD-599). Prototip takvimi sıralı diziyor. Takvim müşteri payı kararıyla birlikte ele alınmalı.
9. **Mutabakat altyapısı henüz canlıda değil:** BB-01 ve BB-02'nin dayandığı servisler feature branch'lerde; mapping-service ve analysis-service deploy edilmemiş (24 Eyl 2026).
10. **Dakika toplu aktarım hataları** (prototip akışına referans olan ekranlar):
    - CreateBulkUnitFileUpload `.xlsx` kabul edip yalnız `.xls` okuyor.
    - Üst birim ID'si yoksa NullPointerException ile çöküyor.
    - Hata olursa geri almıyor; yarım ağaç kalıyor.
    - CreateEmployeeUpload başarı ekranında şifreleri düz metin gösteriyor.

    Prototipte "tek transaction, hata varsa hiçbir şey yazılmaz" davranışının açıkça gösterilmesi Jira'da bu farkı netleştirir.

---

## 6. Periyodik güncelleme notları

Bir sonraki tarama için kontrol listesi:
- Öncelikli repolarda son taramadan bu yana gelen commit'lere bakılır:
  ```
  gh api "repos/datassist/<repo>/commits?since=<son tarama ISO>"
  ```
  Bu tur tarih: 2026-10-20.
- Yakından izlenecekler:
  - implementation-service ve implementation-validation-service: yeni ruleset ya da sayfa validasyonu → HK-02, BB-03
  - payroll-recon-engine-* ve mapping-service: main'e merge ve deploy → BB-01, BB-02
  - payroll-calendar-service → HK-07
  - agentic-operations-* → BB-06, BB-07
  - no-code-report-service: gerçek veriyle doğrulama → HK-08, BB-09
  - sdp-ui: canlıya çıkan implementation ekranları → prototiple fark
  - dakika-payroll: `upload/`, `api/itemcopy/`, toplu aktarım ve go-live commit'leri (SQUAD-*, AR-*) → BB-03, BB-17, HK-12
- Yeni repo açılmışsa repo haritasına eklenir.
- Repolar klonlanmaz; yalnız `gh api` ile okunur.

---

## Güncelleme Günlüğü

### 2026-10-20 — İlk derin analiz
- 56 öncelikli repo kod seviyesinde, ~140 repo README seviyesinde tarandı.
- 11 hızlı kazanım (HK-01 – HK-11) ve 16 büyük bahis (BB-01 – BB-16) eklendi.
- İlk 5 prototip önerisi belirlendi.
- 9 risk/bulgu kaydedildi.
- **Ek (aynı gün):** dakika-payroll, dakika-ui-mono-repo ve dakika-test-automation kod seviyesinde okundu (ilk turda atlanmıştı).
  - Eklendi: HK-12, HK-13, BB-17, risk #10.
  - Güncellendi: BB-03, HK-11, ilk 5 öneriden #5, risk #1.
  - İzleme listesine dakika-payroll eklendi.
