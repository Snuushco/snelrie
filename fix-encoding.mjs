import { readFileSync, writeFileSync } from 'fs';

const filePath = 'app/page.tsx';
const buf = readFileSync(filePath);

// Detect double-encoded UTF-8: read bytes as latin1, then decode as utf8
const latin1 = buf.toString('latin1');
const utf8 = buf.toString('utf8');

// Check for mojibake signature: \xC3\xA2\xC2\x82\xC2\xAC = double-encoded €
const hasDoubleEncoding = latin1.includes('\xC3\xA2\xC2\x82\xC2\xAC') || 
                           utf8.includes('\u00E2\u201A\u00AC') ||
                           utf8.includes('\u00C2\u00A9');

console.log('Double encoding detected:', hasDoubleEncoding);
console.log('File size:', buf.length, 'bytes');

// Strategy: the file was written with correct UTF-8 bytes but then
// something read it as latin1 and re-saved as UTF-8, doubling the encoding.
// Fix: read the UTF-8 string and replace known mojibake patterns.

let text = utf8;
const replacements = [
  ['\u00E2\u201A\u00AC', '\u20AC'],       // € (euro)
  ['\u00E2\u20AC\u201C', '\u2014'],       // — (em dash)  
  ['\u00E2\u20AC\u2122', '\u2019'],       // ' (right single quote)
  ['\u00E2\u20AC\u0153', '\u201C'],       // " (left double quote)  
  ['\u00E2\u20AC\u009D', '\u201D'],       // " (right double quote)
  ['\u00E2\u0086\u2019', '\u2192'],       // → (arrow)
  ['\u00E2\u0098\u2026', '\u2605'],       // ★ (star)
  ['\u00C2\u00A9', '\u00A9'],             // © (copyright)
  ['\u00C2\u00B7', '\u00B7'],             // · (middle dot)
  ['\u00C3\u00A9', '\u00E9'],             // é
  ['\u00C3\u00AB', '\u00EB'],             // ë
  ['\u00C3\u00B6', '\u00F6'],             // ö
  ['\u00C3\u00BC', '\u00FC'],             // ü
  ['\u00C3\u00B3', '\u00F3'],             // ó
  ['\u00C3\u00A8', '\u00E8'],             // è
  ['\u00C3\u00AF', '\u00EF'],             // ï
  ['\u00C3\u00A7', '\u00E7'],             // ç
  ['\u00C3\u00AE', '\u00EE'],             // î
  ['\u00C3\u00A0', '\u00E0'],             // à  
  ['\u00C3\u00A4', '\u00E4'],             // ä
];

let totalFixed = 0;
for (const [find, replace] of replacements) {
  const count = text.split(find).length - 1;
  if (count > 0) {
    console.log(`Fixed ${count}x: ${replace} (U+${replace.codePointAt(0).toString(16).toUpperCase()})`);
    text = text.replaceAll(find, replace);
    totalFixed += count;
  }
}

console.log(`Total replacements: ${totalFixed}`);
writeFileSync(filePath, text, 'utf8');
console.log('Saved.');
