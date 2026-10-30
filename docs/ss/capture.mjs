// Kurulum (proje dışında bir klasörde): npm i puppeteer-core@23.11.1
// Çalıştırma: node capture.mjs <prototip klasörü> docs/ss
// Prototip dosyaları (legacy.html, app.js, styles.css, Assets) <prototip klasörü> içinde olmalı; script kendi sunucusunu 5533 portunda açar.
// Prototipten canlı UX dokümanı için ekran görüntüleri alır.
// Kullanım: node capture.mjs <site klasörü> <çıktı klasörü>
import puppeteer from "puppeteer-core"
import { spawn } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const [siteDir, outDir] = process.argv.slice(2)
const PORT = 5533
const BASE = `http://localhost:${PORT}/legacy.html?page=processes`
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
fs.mkdirSync(outDir, { recursive: true })

const server = spawn("python3", ["-m", "http.server", String(PORT), "--directory", siteDir], { stdio: "ignore" })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
await sleep(800)

const dummyFile = path.join(outDir, "..", "Starter Kit-İMAS KLİMA VE İMAS İZMİR MAK 31052026.xls")
fs.writeFileSync(dummyFile, "demo")

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 } })
const page = await browser.newPage()
const done = []

async function open(query = "") {
  await page.goto(`${BASE}${query}`, { waitUntil: "networkidle0" })
  await page.waitForFunction(() => document.querySelector("h2"), { timeout: 15000 })
  await sleep(700)
}

async function clickText(text, { last = false, selector = "button, label, a" } = {}) {
  const ok = await page.evaluate((text, last, selector) => {
    const els = [...document.querySelectorAll(selector)].filter((el) => el.textContent.replace(/\s+/g, " ").trim().includes(text) && el.offsetParent !== null)
    const el = last ? els[els.length - 1] : els[0]
    if (!el) return false
    el.click()
    return true
  }, text, last, selector)
  if (!ok) throw new Error(`Bulunamadı: ${text}`)
  await sleep(600)
}

// Aşama başlığını (h2) üst bara yakın konumlar; kart ve alt bilgi görünür kalır.
async function focusStage() {
  await page.evaluate(() => {
    const h2 = [...document.querySelectorAll("h2")].find((el) => el.closest("main") || true)
    const y = h2.getBoundingClientRect().top + window.scrollY - 330
    document.querySelectorAll("*").forEach((el) => { if (el.scrollHeight > el.clientHeight + 50 && getComputedStyle(el).overflowY !== "visible") el.scrollTop = 0 })
    window.scrollTo(0, Math.max(0, y))
    const scroller = [...document.querySelectorAll("main, [class*='overflow-y-auto']")].find((el) => el.contains(h2) && el.scrollHeight > el.clientHeight)
    if (scroller) scroller.scrollTop = Math.max(0, h2.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 250)
  })
  await sleep(300)
}

async function focusText(text, offset = 120) {
  await page.evaluate((text, offset) => {
    const el = [...document.querySelectorAll("p, span, div, h3")].find((node) => node.children.length === 0 && node.textContent.includes(text))
    if (!el) return
    el.scrollIntoView({ block: "start" })
    const scroller = el.closest("main") || document.scrollingElement
    scroller.scrollTop -= offset
    window.scrollBy(0, -offset)
  }, text, offset)
  await sleep(300)
}

async function shot(name) {
  await page.screenshot({ path: path.join(outDir, `${name}.png`) })
  done.push(name)
  console.log("✓", name)
}

async function step(name, fn) {
  try { await fn() } catch (error) { console.log("✗", name, error.message) }
}

// 1 — Karşılama durumu
await step("1-musteri", async () => { await open("&role=client"); await focusStage(); await shot("1-karsilama-musteri") })
await step("1-uzman", async () => { await open("&role=uzman"); await focusStage(); await shot("1-karsilama-uzman") })
await step("1-10", async () => { await open("&role=client"); await focusText("Mesajlar", 40); await shot("1-10-kilitli-asamalar-sol-liste") })
await step("1-6-m", async () => { await open("&role=client&step=parallel-cost"); await focusStage(); await shot("1-6-bordro-analiz-musteri") })
await step("1-6-u", async () => { await open("&role=uzman&step=parallel-cost"); await focusStage(); await shot("1-6-bordro-analiz-uzman") })
await step("1-7-m", async () => { await open("&role=client&step=integrations"); await focusStage(); await shot("1-7-canliya-gecis-hazirliklari-musteri") })
await step("1-7-u", async () => { await open("&role=uzman&step=integrations"); await focusStage(); await shot("1-7-canliya-gecis-hazirliklari-uzman") })
await step("1-8", async () => { await open("&role=client&step=operations-handover"); await focusStage(); await shot("1-8-canliya-gecis-musteri") })

// 2–4 — Müşteri yükleme ve gönderim akışı
await step("2-4", async () => {
  await open("&role=client")
  const input = await page.$("#step-upload-system-setup-doc-starter-kit")
  await input.uploadFile(dummyFile)
  await sleep(1200)
  await shot("2-validasyon-hatali-dosya")
  const reupload = async () => {
    const modalInput = await page.$("label input[type=file][accept='.xlsx,.xls,.csv']")
    await modalInput.uploadFile(dummyFile)
    await sleep(1200)
  }
  await reupload()
  await shot("3-validasyon-hatasiz-uyarili")
  await reupload()
  await shot("3-validasyon-bulgusuz")
  await clickText("Yüklemeyi Tamamla")
  await sleep(600)
  await focusStage()
  await shot("4-1-gonderime-hazir-musteri")
  await clickText("Onaya Gönder")
  await sleep(500)
  await shot("4-2-onay-penceresi")
  await clickText("Onaya Gönder", { last: true })
  await sleep(900)
  await focusStage()
  await shot("4-3-incelemede-musteri")
})

// 5–6 — Uzman inceleme
await step("5-6", async () => {
  await open("&role=uzman&validationPreview=1")
  await focusStage()
  await shot("5-inceleme-bekliyor-uzman")
  await clickText("Validasyon Sonuçlarını Gör")
  await sleep(800)
  await shot("6-validasyon-modali-uzman")
})
await step("4-4", async () => { await open("&role=client&validationPreview=1"); await focusStage(); await shot("4-4-incelemede-musteri") })

// 8 — Red
await step("8-m", async () => {
  await open("&demo=rejected")
  await sleep(500)
  await shot("8-2-revize-talebi-modali-musteri")
  await page.keyboard.press("Escape")
  await sleep(500)
  await focusStage()
  await shot("8-1-revize-karti-musteri")
})
await step("8-u", async () => { await open("&demo=rejected&role=uzman"); await focusStage(); await shot("8-5-revize-uzman") })

// 9 — Onay
await step("9-m", async () => { await open("&demo=approved&role=client"); await focusStage(); await shot("9-onaylandi-musteri") })
await step("9-u", async () => { await open("&demo=approved&role=uzman"); await focusStage(); await shot("9-onaylandi-uzman") })

await browser.close()
server.kill()
fs.rmSync(dummyFile, { force: true })
console.log(`${done.length} görüntü alındı.`)
