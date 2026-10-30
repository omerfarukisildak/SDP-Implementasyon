// Kurulum (proje dışında bir klasörde): npm i puppeteer-core@23.11.1 marked@14.1.4
// Çalıştırma: node topdf.mjs <md> <pdf> [--no-page-breaks]
// md → PDF (görüntüler md'ye göre göreli yoldan yüklenir).
// Kullanım: node topdf.mjs <md dosyası> <pdf çıktısı>
import puppeteer from "puppeteer-core"
import { marked } from "marked"
import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

const [mdPath, pdfPath, ...flags] = process.argv.slice(2)
const pageBreaks = !flags.includes("--no-page-breaks")
const mdDir = path.dirname(path.resolve(mdPath))
// PDF'te görüntüler tam genişlikte ve başlığıyla aynı sayfada: yan yana tablolar alt alta figürlere çevrilir.
const figure = (label, src) => `<figure><figcaption>${label}</figcaption><img src="${src}"></figure>`
let md = fs.readFileSync(mdPath, "utf8")
md = md.replace(/\| ([^|\n]+) \| ([^|\n]+) \|\n\|---\|---\|\n\| !\[[^\]]*\]\(([^)]+)\) \| !\[[^\]]*\]\(([^)]+)\) \|/g,
  (_, a, b, srcA, srcB) => `${figure(a.trim(), srcA)}\n${figure(b.trim(), srcB)}`)
md = md.replace(/\*([^*\n]+)\*\n\n!\[[^\]]*\]\(([^)]+)\)/g, (_, label, src) => figure(label, src))
const body = marked.parse(md)
const docTitle = (md.match(/^# (.+)$/m)?.[1] || "").replace(/ \(.*\)$/, "")

const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<base href="${pathToFileURL(mdDir + "/").href}">
<style>
  @page { size: A4; margin: 16mm 14mm 18mm; }
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; font-size: 10.5pt; line-height: 1.5; color: #1d2939; }
  h1 { font-size: 20pt; margin: 0 0 6pt; color: #101828; }
  h2 { font-size: 14pt; margin: 18pt 0 6pt; padding-bottom: 4pt; border-bottom: 1px solid #e4e7ec; color: #101828; break-after: avoid; }
  ${pageBreaks ? "h2 { break-before: page; }" : ""}
  h2:first-of-type { break-before: auto; }
  p { margin: 5pt 0; }
  ul { margin: 3pt 0 6pt; padding-left: 16pt; }
  li { margin: 2pt 0; }
  code { font-family: "SF Mono", Menlo, monospace; font-size: 9pt; background: #f2f4f7; padding: 1pt 3pt; border-radius: 3px; }
  hr { border: 0; border-top: 1px solid #e4e7ec; margin: 12pt 0; }
  table { width: 100%; border-collapse: collapse; margin: 6pt 0 10pt; font-size: 9.5pt; break-inside: avoid; }
  th, td { border: 1px solid #e4e7ec; padding: 4pt 6pt; text-align: left; vertical-align: top; }
  th { background: #f8fafc; font-weight: 600; }
  img { display: block; max-width: 100%; border: 1px solid #e4e7ec; border-radius: 4px; margin: 4pt 0 10pt; break-inside: avoid; }
  figure { margin: 8pt 0 12pt; break-inside: avoid; }
  figcaption { color: #667085; font-size: 8.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: .03em; margin-bottom: 3pt; }
  figure img { margin: 0; }
  p:has(> img) { break-inside: avoid; }
  em { color: #667085; font-style: normal; font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: .03em; }
  blockquote { margin: 6pt 0; padding: 4pt 10pt; border-left: 3px solid #d0d5dd; color: #475467; background: #f9fafb; }
  blockquote p { margin: 2pt 0; }
</style></head><body>${body}</body></html>`

const tmpHtml = path.join(mdDir, ".pdf-onizleme.html")
fs.writeFileSync(tmpHtml, html)
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true })
const page = await browser.newPage()
await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: "networkidle0" })
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: "<span></span>",
  footerTemplate: `<div style="font-size:8pt;color:#98a2b3;width:100%;padding:0 14mm;display:flex;justify-content:space-between;font-family:Arial"><span>${docTitle}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  margin: { top: "16mm", bottom: "18mm", left: "14mm", right: "14mm" }
})
await browser.close()
fs.rmSync(tmpHtml, { force: true })
console.log("PDF:", pdfPath)
