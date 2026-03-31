/**
 * Patch @react-pdf/pdfkit to clamp extreme numbers instead of throwing.
 * 
 * This fixes: Error: unsupported number: -2.8390148804238555e+21
 * which occurs when documents have many pages and border rendering
 * coordinates overflow in clipBorderTop/renderBorders/renderNode.
 * 
 * See: https://github.com/diegomura/react-pdf/issues/2734
 * Run: node scripts/patch-pdfkit.js
 */

const fs = require('fs');
const path = require('path');

const pdfkitPath = path.join(__dirname, '..', 'node_modules', '@react-pdf', 'pdfkit', 'lib', 'pdfkit.js');

if (!fs.existsSync(pdfkitPath)) {
  console.log('⚠️  @react-pdf/pdfkit not found, skipping patch');
  process.exit(0);
}

let content = fs.readFileSync(pdfkitPath, 'utf-8');

const ORIGINAL = `  static number(n) {
    if (n > -1e21 && n < 1e21) {
      return Math.round(n * 1e6) / 1e6;
    }
    throw new Error(\`unsupported number: \${n}\`);
  }`;

const PATCHED = `  static number(n) {
    if (n > -1e21 && n < 1e21) {
      return Math.round(n * 1e6) / 1e6;
    }
    // Clamp extreme values instead of throwing (react-pdf border overflow bug)
    const clamped = Math.max(-1e20, Math.min(1e20, n || 0));
    return Math.round(clamped * 1e6) / 1e6;
  }`;

if (content.includes('Clamp extreme values')) {
  console.log('✅ @react-pdf/pdfkit already patched');
  process.exit(0);
}

if (!content.includes(ORIGINAL)) {
  console.log('⚠️  Could not find expected code in pdfkit.js — version may have changed');
  process.exit(1);
}

content = content.replace(ORIGINAL, PATCHED);
fs.writeFileSync(pdfkitPath, content, 'utf-8');
console.log('✅ Patched @react-pdf/pdfkit — extreme numbers will be clamped');
