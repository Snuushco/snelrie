/**
 * Render demo PDF using SnelRIE's actual @react-pdf/renderer pipeline.
 * Requires tsx for TSX import support.
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// We need to use tsx to handle the TSX imports
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const payloadPath = resolve(__dirname, '..', '..', '.openclaw', 'workspace-emily', 'output', 'snelrie', 'demo-rie-payload.json');
const outputPath = resolve(__dirname, '..', '..', '.openclaw', 'workspace-emily', 'output', 'snelrie', 'RIE-Bakkerij-De-Gouden-Korst.pdf');

console.log('Generating PDF via SnelRIE dev server API...');

// Start dev server and hit the API endpoint
const payload = JSON.parse(readFileSync(payloadPath, 'utf-8'));

// Use fetch to call the local API if dev server is running, or use direct rendering
async function main() {
  // Try local dev server first
  try {
    const res = await fetch('http://localhost:3000/api/rie/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      writeFileSync(outputPath, Buffer.from(buffer));
      console.log(`PDF generated: ${outputPath} (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
      return;
    }
    console.log(`Dev server responded with ${res.status}, trying direct render...`);
  } catch (e) {
    console.log('Dev server not running, trying direct render...');
  }

  // Direct render using tsx
  try {
    const tsxScript = `
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { RieDocument, getBranding } from "../lib/pdf/rie-document";
import { readFileSync, writeFileSync } from "fs";

const payload = JSON.parse(readFileSync("${payloadPath.replace(/\\/g, '\\\\')}", "utf-8"));
const data = {
  ...payload,
  datum: payload.datum || new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }),
};
const element = React.createElement(RieDocument, { data });
const buffer = await renderToBuffer(element);
writeFileSync("${outputPath.replace(/\\/g, '\\\\')}", new Uint8Array(buffer));
console.log("PDF generated: ${outputPath.replace(/\\/g, '\\\\')} (" + (buffer.byteLength / 1024).toFixed(0) + " KB)");
`;
    const tmpScript = resolve(__dirname, '_tmp_render.tsx');
    writeFileSync(tmpScript, tsxScript);
    execSync(`npx tsx "${tmpScript}"`, { cwd: resolve(__dirname, '..'), stdio: 'inherit' });
    // Cleanup
    try { require('fs').unlinkSync(tmpScript); } catch {}
  } catch (e) {
    console.error('Direct render failed:', e.message);
    console.log('Trying via next dev server...');
  }
}

main().catch(console.error);
