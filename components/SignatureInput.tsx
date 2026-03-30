"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Pen, Type, Upload, Trash2, AlertTriangle } from "lucide-react";

type SignatureMethod = "tekenen" | "typen" | "uploaden";

interface SignatureInputProps {
  onSignatureChange: (dataUrl: string | null) => void;
  hasSignature: boolean;
}

export default function SignatureInput({
  onSignatureChange,
  hasSignature,
}: SignatureInputProps) {
  const [method, setMethod] = useState<SignatureMethod>("tekenen");

  return (
    <div>
      {/* Method tabs */}
      <div className="flex items-center gap-1 mb-3 bg-gray-100 rounded-lg p-1">
        {([
          { key: "tekenen" as const, label: "Tekenen", icon: Pen },
          { key: "typen" as const, label: "Typen", icon: Type },
          { key: "uploaden" as const, label: "Uploaden", icon: Upload },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setMethod(key);
              onSignatureChange(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
              method === key
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Method content */}
      {method === "tekenen" && (
        <DrawSignature onSignatureChange={onSignatureChange} />
      )}
      {method === "typen" && (
        <TypeSignature onSignatureChange={onSignatureChange} />
      )}
      {method === "uploaden" && (
        <UploadSignature onSignatureChange={onSignatureChange} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Method 1: Draw
// ═══════════════════════════════════════════════════════════════

function DrawSignature({
  onSignatureChange,
}: {
  onSignatureChange: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDrawing(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    setHasDrawn(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDrawing() {
    setIsDrawing(false);
    if (hasDrawn && canvasRef.current) {
      onSignatureChange(canvasRef.current.toDataURL("image/png"));
    }
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSignatureChange(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Pen className="w-4 h-4" />
          Handtekening tekenen
        </label>
        {hasDrawn && (
          <button
            onClick={clearCanvas}
            className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Wissen
          </button>
        )}
      </div>
      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="w-full touch-none cursor-crosshair"
          style={{ height: 160 }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      {!hasDrawn && (
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          Teken uw handtekening in het vak hierboven
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Method 2: Type
// ═══════════════════════════════════════════════════════════════

const SIGNATURE_FONTS = [
  { name: "Dancing Script", css: "'Dancing Script', cursive" },
  { name: "Great Vibes", css: "'Great Vibes', cursive" },
  { name: "Pacifico", css: "'Pacifico', cursive" },
];

function TypeSignature({
  onSignatureChange,
}: {
  onSignatureChange: (dataUrl: string | null) => void;
}) {
  const [text, setText] = useState("");
  const [fontIndex, setFontIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load Google Fonts
  useEffect(() => {
    const families = SIGNATURE_FONTS.map((f) => f.name.replace(/ /g, "+")).join("&family=");
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Wait for fonts to load
    const timer = setTimeout(() => setFontsLoaded(true), 1000);
    if (document.fonts) {
      document.fonts.ready.then(() => setFontsLoaded(true));
    }
    return () => clearTimeout(timer);
  }, []);

  // Render text to canvas when text or font changes
  useEffect(() => {
    if (!text.trim()) {
      onSignatureChange(null);
      return;
    }
    renderToCanvas();
  }, [text, fontIndex, fontsLoaded]);

  function renderToCanvas() {
    const canvas = canvasRef.current;
    if (!canvas || !text.trim()) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 200;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const font = SIGNATURE_FONTS[fontIndex];
    ctx.font = `48px ${font.css}`;
    ctx.fillStyle = "#1e3a8a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Measure and scale text to fit
    const metrics = ctx.measureText(text);
    const maxWidth = canvas.width - 40;
    if (metrics.width > maxWidth) {
      const scale = maxWidth / metrics.width;
      ctx.font = `${Math.floor(48 * scale)}px ${font.css}`;
    }

    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    onSignatureChange(canvas.toDataURL("image/png"));
  }

  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
        <Type className="w-4 h-4" />
        Getypte handtekening
      </label>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Typ uw naam"
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-3"
      />

      {/* Font selector */}
      <div className="flex gap-2 mb-3">
        {SIGNATURE_FONTS.map((font, i) => (
          <button
            key={i}
            onClick={() => setFontIndex(i)}
            className={`flex-1 py-2 px-3 rounded-lg border text-center transition ${
              fontIndex === i
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
            style={{ fontFamily: font.css, fontSize: 16 }}
          >
            {text || "Voorbeeld"}
          </button>
        ))}
      </div>

      {/* Preview */}
      {text.trim() && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white flex items-center justify-center p-4">
          <div
            style={{
              fontFamily: SIGNATURE_FONTS[fontIndex].css,
              fontSize: "2.5rem",
              color: "#1e3a8a",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {text}
          </div>
        </div>
      )}

      {/* Hidden canvas for rendering */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Method 3: Upload
// ═══════════════════════════════════════════════════════════════

function UploadSignature({
  onSignatureChange,
}: {
  onSignatureChange: (dataUrl: string | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(
    async (file: File) => {
      setWarning(null);
      setProcessing(true);

      try {
        // Validate file type
        if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
          setWarning("Alleen PNG of JPG bestanden zijn toegestaan.");
          setProcessing(false);
          return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          setWarning("Bestand is te groot. Maximum 2MB.");
          setProcessing(false);
          return;
        }

        const img = await loadImage(file);

        // Validate aspect ratio (should be wider than tall, roughly signature-shaped)
        const ratio = img.width / img.height;
        if (ratio < 0.8) {
          setWarning(
            "Dit lijkt geen handtekening te zijn. Upload een afbeelding van uw handtekening op een witte achtergrond."
          );
        }

        // Validate: signature heuristic (not a photo)
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const validation = validateSignatureImage(imageData);

        if (!validation.valid) {
          setWarning(validation.message);
        }

        // Auto-crop whitespace
        const cropped = autoCropSignature(canvas, ctx, imageData);

        // Convert to base64
        const dataUrl = cropped.toDataURL("image/png");
        setPreview(dataUrl);
        onSignatureChange(dataUrl);
      } catch {
        setWarning("Kon afbeelding niet verwerken. Probeer een ander bestand.");
      } finally {
        setProcessing(false);
      }
    },
    [onSignatureChange]
  );

  function clearUpload() {
    setPreview(null);
    setWarning(null);
    onSignatureChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
        <Upload className="w-4 h-4" />
        Afbeelding uploaden
      </label>

      {!preview ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Klik om een afbeelding te selecteren
          </p>
          <p className="text-xs text-gray-400">PNG of JPG, max 2MB</p>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Voorbeeld</span>
            <button
              onClick={clearUpload}
              className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Verwijderen
            </button>
          </div>
          <div className="flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Handtekening preview"
              className="max-h-32 max-w-full object-contain"
            />
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processImage(file);
        }}
      />

      {warning && (
        <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800">{warning}</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════════════════════════

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function validateSignatureImage(imageData: ImageData): {
  valid: boolean;
  message: string;
} {
  const { data, width, height } = imageData;
  const totalPixels = width * height;

  // Count unique colors (sample for performance)
  const colorSet = new Set<string>();
  let darkPixels = 0;
  let lightPixels = 0;
  const sampleStep = Math.max(1, Math.floor(totalPixels / 10000));

  for (let i = 0; i < data.length; i += 4 * sampleStep) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip fully transparent pixels
    if (a < 10) {
      lightPixels++;
      continue;
    }

    // Quantize colors (reduce to ~64 bins per channel)
    const qr = Math.floor(r / 4);
    const qg = Math.floor(g / 4);
    const qb = Math.floor(b / 4);
    colorSet.add(`${qr},${qg},${qb}`);

    const brightness = (r + g + b) / 3;
    if (brightness < 128) {
      darkPixels++;
    } else {
      lightPixels++;
    }
  }

  const sampledPixels = Math.ceil(totalPixels / sampleStep);
  const darkRatio = darkPixels / sampledPixels;
  const uniqueColors = colorSet.size;

  // A photo typically has many unique colors (>500), a signature has few (<200)
  if (uniqueColors > 500) {
    return {
      valid: false,
      message:
        "Dit lijkt geen handtekening te zijn. Upload een afbeelding van uw handtekening op een witte achtergrond.",
    };
  }

  // Must have some dark strokes but not too many (not a solid fill)
  if (darkRatio < 0.01) {
    return {
      valid: false,
      message:
        "De afbeelding lijkt leeg te zijn. Upload een afbeelding met een zichtbare handtekening.",
    };
  }

  if (darkRatio > 0.7) {
    return {
      valid: false,
      message:
        "Dit lijkt geen handtekening te zijn. Upload een afbeelding van uw handtekening op een witte achtergrond.",
    };
  }

  return { valid: true, message: "" };
}

function autoCropSignature(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  imageData: ImageData
): HTMLCanvasElement {
  const { data, width, height } = imageData;

  let top = height,
    bottom = 0,
    left = width,
    right = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Check if pixel is not white/transparent
      const brightness = (r + g + b) / 3;
      if (a > 20 && brightness < 240) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }

  // Add padding
  const pad = 10;
  top = Math.max(0, top - pad);
  bottom = Math.min(height - 1, bottom + pad);
  left = Math.max(0, left - pad);
  right = Math.min(width - 1, right + pad);

  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;

  if (cropWidth <= 0 || cropHeight <= 0) return canvas;

  const cropped = document.createElement("canvas");
  cropped.width = cropWidth;
  cropped.height = cropHeight;
  const cropCtx = cropped.getContext("2d")!;
  cropCtx.drawImage(
    canvas,
    left,
    top,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return cropped;
}
