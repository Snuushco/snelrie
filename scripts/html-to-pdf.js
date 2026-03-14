const { chromium } = require("playwright-core");
const path = require("path");
const fs = require("fs");

async function main() {
  const htmlPath = path.join(__dirname, "..", "public", "rie-checklist.html");
  const pdfPath = path.join(__dirname, "..", "public", "rie-checklist.pdf");
  const docPdfPath = "C:\\Users\\Gebruiker\\.openclaw\\workspace\\documents\\snelrie\\lead-magnets\\rie-checklist.pdf";

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const page = await browser.newPage();
  
  await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  
  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: { top: "10mm", bottom: "10mm", left: "12mm", right: "12mm" },
    printBackground: true,
  });

  fs.writeFileSync(pdfPath, pdfBuffer);
  console.log(`✅ PDF written: ${pdfPath} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);

  fs.mkdirSync(path.dirname(docPdfPath), { recursive: true });
  fs.writeFileSync(docPdfPath, pdfBuffer);
  console.log(`✅ PDF copied: ${docPdfPath}`);

  await browser.close();
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
