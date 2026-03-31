import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { RieDocument } from "../lib/pdf/rie-document";
import { readFileSync, writeFileSync } from "fs";

const payloadPath = "C:\\Users\\GuusB\\.openclaw\\workspace-emily\\output\\snelrie\\demo-rie-payload.json";
const outputPath = "C:\\Users\\GuusB\\.openclaw\\workspace-emily\\output\\snelrie\\RIE-Bakkerij-De-Gouden-Korst.pdf";

async function main() {
  const payload = JSON.parse(readFileSync(payloadPath, "utf-8"));
  const data = {
    ...payload,
    datum: payload.datum || new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }),
  };
  const element = React.createElement(RieDocument, { data });
  const buffer = await renderToBuffer(element as any);
  writeFileSync(outputPath, new Uint8Array(buffer));
  console.log(`PDF generated: ${outputPath} (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
}

main().catch(console.error);
