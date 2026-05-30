"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import TemplateGallery, { TemplateItem } from "@/components/TemplateGallery";

const PAGE_PADDING_MM = 20;

type Props = {
  enableTemplates?: boolean;
  templates?: TemplateItem[];
  hasAccess?: boolean;
};

type Side = "front" | "back";
type View = "front" | "back";
type Orientation = "portrait" | "landscape";

export default function CardGenerator({
  enableTemplates = false,
  templates = [],
  hasAccess = false,
}: Props) {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [gap, setGap] = useState(0);
  const [rotateFront, setRotateFront] = useState(false);
  const [rotateBack, setRotateBack] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [currentView, setCurrentView] = useState<View>("front");
  const [showGuides, setShowGuides] = useState(true);
  const [zoom, setZoom] = useState(48);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loadingSide, setLoadingSide] = useState<Side | null>(null);
  const zoomRef = useRef<HTMLDivElement | null>(null);

  const safeRows = Math.min(10, Math.max(1, rows));
  const safeCols = Math.min(10, Math.max(1, cols));
  const safeGap = Math.min(20, Math.max(0, gap));

  useEffect(() => {
    setRows(safeRows);
    setCols(safeCols);
    setGap(safeGap);
  }, [safeRows, safeCols, safeGap]);

  const cardSize = useMemo(() => {
    const pageWidth = orientation === "landscape" ? 297 : 210;
    const pageHeight = orientation === "landscape" ? 210 : 297;
    const availableWidth = pageWidth - PAGE_PADDING_MM;
    const availableHeight = pageHeight - PAGE_PADDING_MM;
    const cardWidthMm = Math.max(0, (availableWidth - (safeCols - 1) * safeGap) / safeCols);
    const cardHeightMm = Math.max(0, (availableHeight - (safeRows - 1) * safeGap) / safeRows);

    return {
      mm: `${cardWidthMm.toFixed(1)} mm x ${cardHeightMm.toFixed(1)} mm`,
      px: `(${Math.round(cardWidthMm * (300 / 25.4))} px x ${Math.round(cardHeightMm * (300 / 25.4))} px a 300 DPI)`,
    };
  }, [orientation, safeCols, safeRows, safeGap]);

  function showMessage(message: string) {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(null), 2600);
  }

  function onImageUpload(event: ChangeEvent<HTMLInputElement>, side: Side) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showMessage("Formato inválido. Selecione uma imagem.");
      event.target.value = "";
      return;
    }

    setLoadingSide(side);
    const reader = new FileReader();
    reader.onerror = () => {
      setLoadingSide(null);
      showMessage("Falha ao ler o arquivo.");
    };
    reader.onload = () => {
      const data = String(reader.result || "");
      const image = new Image();
      image.onerror = () => {
        setLoadingSide(null);
        showMessage("Imagem corrompida ou inválida.");
      };
      image.onload = () => {
        if (side === "front") setFrontImage(data);
        if (side === "back") setBackImage(data);
        setLoadingSide(null);
        showMessage(`Arte ${side === "front" ? "da frente" : "do verso"} carregada.`);
      };
      image.src = data;
    };
    reader.readAsDataURL(file);
  }

  function renderGrid(side: Side) {
    const imageSrc = side === "front" ? frontImage : backImage;
    const rotate = side === "front" ? rotateFront : rotateBack;
    const cells = [];
    for (let row = 0; row < safeRows; row += 1) {
      for (let col = 0; col < safeCols; col += 1) {
        const gridCol = side === "back" ? safeCols - col : col + 1;
        cells.push(
          <div
            key={`${side}-${row}-${col}`}
            className="card-tile"
            style={{ gridRow: row + 1, gridColumn: gridCol }}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={`Arte ${side}`}
                style={{ transform: rotate ? "rotate(90deg)" : "none" }}
              />
            ) : (
              row === 0 &&
              col === 0 && (
                <span className="m-auto text-xs text-[#1a0533]/35">
                  {side === "front" ? "Adicione arte de frente" : "Adicione arte de verso"}
                </span>
              )
            )}
          </div>,
        );
      }
    }
    return cells;
  }

  function handlePrint(side: Side) {
    if (side === "front" && !frontImage) return showMessage("Adicione a arte da frente antes de imprimir.");
    if (side === "back" && !backImage) return showMessage("Adicione a arte do verso antes de imprimir.");
    setCurrentView(side);

    window.setTimeout(() => {
      const zoomEl = zoomRef.current;
      const oldTransform = zoomEl?.style.transform ?? "";
      if (zoomEl) {
        zoomEl.style.transform = "none";
      }

      const restore = () => {
        if (zoomEl) {
          zoomEl.style.transform = oldTransform;
        }
        window.removeEventListener("afterprint", restore);
      };

      window.addEventListener("afterprint", restore);
      window.print();
    }, 100);
  }

  function handleTemplateSelect(template: TemplateItem) {
    setFrontImage(template.front_url);
    setBackImage(template.back_url || null);
    showMessage(`Template "${template.name}" carregado.`);
  }

  return (
    <div className="imprimax-generator grid gap-4 lg:grid-cols-[1fr_360px]">
      <Card className="imprimax-preview-card relative overflow-auto p-4">
        {statusMessage && (
          <div className="no-print mb-3 rounded-xl bg-[#1a0533] px-3 py-2 text-xs font-medium text-white">
            {statusMessage}
          </div>
        )}

        <div className="no-print mb-3 flex items-center gap-2">
          <button
            onClick={() => setCurrentView("front")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${currentView === "front" ? "bg-[#6c2eb9]/15 text-[#6c2eb9]" : "text-[#1a0533]/60"}`}
          >
            Ver frente
          </button>
          <button
            onClick={() => setCurrentView("back")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${currentView === "back" ? "bg-[#6c2eb9]/15 text-[#6c2eb9]" : "text-[#1a0533]/60"}`}
          >
            Ver verso
          </button>
          <div className="ml-auto flex items-center gap-2">
            <input
              type="range"
              min={20}
              max={150}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
            <span className="w-10 text-right text-xs font-semibold">{zoom}%</span>
          </div>
        </div>

        <div
          ref={zoomRef}
          className="imprimax-zoom"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          <div className={`a4-sheet ${orientation === "landscape" ? "landscape" : ""} ${showGuides ? "card-tile-guides" : ""}`}>
            <div
              className="card-grid"
              style={{
                gridTemplateColumns: `repeat(${safeCols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${safeRows}, minmax(0, 1fr))`,
                gap: `${safeGap}mm`,
              }}
            >
              {currentView === "front" ? renderGrid("front") : renderGrid("back")}
            </div>
          </div>
        </div>
      </Card>

      <div className="no-print space-y-4">
        <Card>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#1a0533]/70">Suas artes</h3>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#1a0533]">
              Arte da frente
              <Input type="file" accept="image/*" onChange={(e) => onImageUpload(e, "front")} className="mt-1" />
            </label>
            <label className="block text-sm font-medium text-[#1a0533]">
              Arte do verso
              <Input type="file" accept="image/*" onChange={(e) => onImageUpload(e, "back")} className="mt-1" />
            </label>
          </div>
          {loadingSide && <p className="mt-2 text-xs text-[#e91e8c]">Carregando arte {loadingSide}...</p>}
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#1a0533]/70">Formato e grade</h3>
          <div className="grid grid-cols-3 gap-2">
            <label className="text-xs">
              Colunas
              <Input type="number" min={1} max={10} value={safeCols} onChange={(e) => setCols(Number(e.target.value))} />
            </label>
            <label className="text-xs">
              Linhas
              <Input type="number" min={1} max={10} value={safeRows} onChange={(e) => setRows(Number(e.target.value))} />
            </label>
            <label className="text-xs">
              Gap (mm)
              <Input type="number" min={0} max={20} value={safeGap} onChange={(e) => setGap(Number(e.target.value))} />
            </label>
          </div>
          <label className="mt-3 block text-xs">
            Orientação
            <select
              className="mt-1 w-full rounded-xl border border-[#6c2eb9]/20 bg-white px-3 py-2 text-sm"
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as Orientation)}
            >
              <option value="portrait">Retrato</option>
              <option value="landscape">Paisagem</option>
            </select>
          </label>
          <div className="mt-3 space-y-1 text-xs text-[#1a0533]/70">
            <p>Tamanho ideal: <strong>{cardSize.mm}</strong></p>
            <p>{cardSize.px}</p>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={rotateFront} onChange={(e) => setRotateFront(e.target.checked)} />
              Girar arte da frente
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={rotateBack} onChange={(e) => setRotateBack(e.target.checked)} />
              Girar arte do verso
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} />
              Mostrar linhas de corte
            </label>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <button className="imprimax-btn w-full" type="button" onClick={() => handlePrint("front")}>
              1. Imprimir frente
            </button>
            <button className="imprimax-btn w-full" type="button" onClick={() => handlePrint("back")}>
              2. Imprimir verso
            </button>
          </div>
        </Card>

        {enableTemplates && (
          <TemplateGallery templates={templates} hasAccess={hasAccess} onSelect={handleTemplateSelect} />
        )}
      </div>
    </div>
  );
}
