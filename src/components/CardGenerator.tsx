"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import TemplateGallery, { TemplateItem, KitItem } from "@/components/TemplateGallery";

const PAGE_PADDING_MM = 20;

const PAPER_DIMENSIONS_MM = {
  A4: { w: 210, h: 297 },
  A5: { w: 148, h: 210 },
  Carta: { w: 216, h: 279 },
} as const;

const PAPER_USABLE_CM = {
  A4: { w: 20.0, h: 28.7 },
  A5: { w: 13.8, h: 20.0 },
  Carta: { w: 20.6, h: 26.9 },
} as const;

const GAP_PADRAO_CM = 0.2;
const ARTE_MIN_CM = 1;
const ARTE_MAX_CM = 30;

type Props = {
  enableTemplates?: boolean;
  templates?: TemplateItem[];
  kits?: KitItem[];
  hasAccess?: boolean;
};

type Side = "front" | "back";
type View = "front" | "back";
type Orientation = "portrait" | "landscape";
type PaperFormat = keyof typeof PAPER_DIMENSIONS_MM;

type CalcResultado =
  | { ok: true; colunas: number; linhas: number; total: number; mensagem: string }
  | { ok: false; mensagem: string };

function calcularGridPorCm(
  larguraCm: number,
  alturaCm: number,
  papel: PaperFormat,
): { colunas: number; linhas: number; total: number } {
  const pagina = PAPER_USABLE_CM[papel];
  const colunas = Math.floor((pagina.w + GAP_PADRAO_CM) / (larguraCm + GAP_PADRAO_CM));
  const linhas = Math.floor((pagina.h + GAP_PADRAO_CM) / (alturaCm + GAP_PADRAO_CM));
  return { colunas, linhas, total: colunas * linhas };
}

function calcularGridPorProporcao(
  imageWidth: number,
  imageHeight: number,
  papel: PaperFormat,
  orientation: Orientation,
  gapMm: number,
): { colunas: number; linhas: number; total: number } {
  const base = PAPER_DIMENSIONS_MM[papel];
  const page =
    orientation === "landscape"
      ? { w: base.h - PAGE_PADDING_MM, h: base.w - PAGE_PADDING_MM }
      : { w: base.w - PAGE_PADDING_MM, h: base.h - PAGE_PADDING_MM };
  const imageRatio = imageWidth / imageHeight;

  let best = {
    colunas: 1,
    linhas: 1,
    total: 1,
    score: Number.POSITIVE_INFINITY,
  };

  for (let colunas = 1; colunas <= 10; colunas += 1) {
    for (let linhas = 1; linhas <= 10; linhas += 1) {
      const cellWidth = (page.w - (colunas - 1) * gapMm) / colunas;
      const cellHeight = (page.h - (linhas - 1) * gapMm) / linhas;
      if (cellWidth <= 0 || cellHeight <= 0) continue;

      const cellRatio = cellWidth / cellHeight;
      const ratioPenalty = Math.abs(Math.log(cellRatio / imageRatio));
      const count = colunas * linhas;
      const score = ratioPenalty * 18 - count;

      if (score < best.score) {
        best = { colunas, linhas, total: count, score };
      }
    }
  }

  return { colunas: best.colunas, linhas: best.linhas, total: best.total };
}

function calcZoomInicial(): number {
  if (typeof window === "undefined") return 45;
  const viewportW = window.innerWidth;
  if (viewportW < 768) {
    const available = viewportW - 32;
    const a4WidthPx = (210 * 96) / 25.4;
    return Math.max(20, Math.min(Math.floor((available / a4WidthPx) * 100), 80));
  }
  return 48;
}

export default function CardGenerator({
  enableTemplates = false,
  templates = [],
  kits = [],
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
  const [zoom, setZoom] = useState(() => calcZoomInicial());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loadingSide, setLoadingSide] = useState<Side | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const [paperFormat, setPaperFormat] = useState<PaperFormat>("A4");
  const [arteWidthCm, setArteWidthCm] = useState<string>("");
  const [arteHeightCm, setArteHeightCm] = useState<string>("");
  const [calcResultado, setCalcResultado] = useState<CalcResultado | null>(null);

  const zoomRef = useRef<HTMLDivElement | null>(null);

  const safeRows = Math.min(10, Math.max(1, rows));
  const safeCols = Math.min(10, Math.max(1, cols));
  const safeGap = Math.min(20, Math.max(0, gap));

  useEffect(() => {
    setRows(safeRows);
    setCols(safeCols);
    setGap(safeGap);
  }, [safeRows, safeCols, safeGap]);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    function onResize() {
      setZoom(calcZoomInicial());
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const paperDims = useMemo(() => {
    const base = PAPER_DIMENSIONS_MM[paperFormat];
    return orientation === "landscape"
      ? { w: base.h, h: base.w }
      : { w: base.w, h: base.h };
  }, [paperFormat, orientation]);

  const cardSize = useMemo(() => {
    const availableWidth = paperDims.w - PAGE_PADDING_MM;
    const availableHeight = paperDims.h - PAGE_PADDING_MM;
    const cardWidthMm = Math.max(0, (availableWidth - (safeCols - 1) * safeGap) / safeCols);
    const cardHeightMm = Math.max(0, (availableHeight - (safeRows - 1) * safeGap) / safeRows);
    return {
      mm: `${cardWidthMm.toFixed(1)} mm x ${cardHeightMm.toFixed(1)} mm`,
      px: `(${Math.round(cardWidthMm * (300 / 25.4))} px x ${Math.round(cardHeightMm * (300 / 25.4))} px a 300 DPI)`,
    };
  }, [paperDims, safeCols, safeRows, safeGap]);

  const hasArtwork = Boolean(frontImage || backImage);

  useEffect(() => {
    setCalcResultado(null);
  }, [paperFormat]);

  function handleCalcularGrid() {
    const larguraCm = parseFloat(arteWidthCm.replace(",", "."));
    const alturaCm = parseFloat(arteHeightCm.replace(",", "."));

    if (!Number.isFinite(larguraCm) || !Number.isFinite(alturaCm)) {
      setCalcResultado({ ok: false, mensagem: "Informe largura e altura em cm." });
      return;
    }
    if (
      larguraCm < ARTE_MIN_CM || alturaCm < ARTE_MIN_CM ||
      larguraCm > ARTE_MAX_CM || alturaCm > ARTE_MAX_CM
    ) {
      setCalcResultado({ ok: false, mensagem: `Use dimensoes entre ${ARTE_MIN_CM} e ${ARTE_MAX_CM} cm.` });
      return;
    }

    const pagina = PAPER_USABLE_CM[paperFormat];
    if (larguraCm > pagina.w || alturaCm > pagina.h) {
      setCalcResultado({ ok: false, mensagem: "Arte maior que o papel selecionado. Revise as dimensoes." });
      return;
    }

    const { colunas, linhas, total } = calcularGridPorCm(larguraCm, alturaCm, paperFormat);

    if (colunas === 0 || linhas === 0) {
      setCalcResultado({ ok: false, mensagem: "Arte maior que o papel selecionado. Revise as dimensoes." });
      return;
    }

    setCols(colunas);
    setRows(linhas);
    setCalcResultado({
      ok: true,
      colunas,
      linhas,
      total,
      mensagem: `${colunas} colunas x ${linhas} linhas = ${total} cartoes por folha (${paperFormat}, artes de ${larguraCm}x${alturaCm} cm)`,
    });
  }

  function showMessage(message: string) {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(null), 2600);
  }

  function applyAutoGridFromImage(_image: HTMLImageElement) {
    setCols(3);
    setRows(3);
    setCalcResultado({
      ok: true,
      colunas: 3,
      linhas: 3,
      total: 9,
      mensagem: "Grade padrão 3x3 aplicada. Ajuste manualmente se necessário.",
    });
  }

  function loadImageForAutoGrid(src: string, onReady?: () => void) {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => { applyAutoGridFromImage(image); onReady?.(); };
    image.onerror = () => { onReady?.(); };
    image.src = src;
  }

  function onImageUpload(event: ChangeEvent<HTMLInputElement>, side: Side) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedTemplateId(null);
    if (!file.type.startsWith("image/")) {
      showMessage("Formato inválido. Selecione uma imagem.");
      event.target.value = "";
      return;
    }
    setLoadingSide(side);
    const reader = new FileReader();
    reader.onerror = () => { setLoadingSide(null); showMessage("Falha ao ler o arquivo."); };
    reader.onload = () => {
      const data = String(reader.result || "");
      const image = new Image();
      image.onerror = () => { setLoadingSide(null); showMessage("Imagem corrompida ou inválida."); };
      image.onload = () => {
        if (side === "front") setFrontImage(data);
        if (side === "back") setBackImage(data);
        if (side === "front") applyAutoGridFromImage(image);
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
                style={{
                  transform: rotate ? "rotate(90deg)" : "none",
                  imageRendering: "high-quality" as React.CSSProperties["imageRendering"],
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              row === 0 && col === 0 && (
                <span className="m-auto text-xs text-[#16120E]/35">
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
      if (zoomEl) zoomEl.style.transform = "none";
      const restore = () => {
        if (zoomEl) zoomEl.style.transform = oldTransform;
        window.removeEventListener("afterprint", restore);
      };
      window.addEventListener("afterprint", restore);
      window.print();
    }, 100);
  }

  function handleTemplateSelect(template: TemplateItem) {
    setFrontImage(template.front_url);
    setBackImage(template.back_url || null);
    setSelectedTemplateId(template.id);
    loadImageForAutoGrid(template.front_url, () => {
      showMessage(`Template "${template.name}" carregado com grade automatica.`);
    });
  }

  return (
    <div
      className={`imprimax-generator grid gap-4 ${
        enableTemplates
          ? "xl:grid-cols-[390px_minmax(0,1fr)_340px]"
          : "lg:grid-cols-[minmax(0,1fr)_360px]"
      }`}
    >
      {enableTemplates && (
        <aside className="no-print xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-auto">
          <Card className="p-4">
            <TemplateGallery
              templates={templates}
              kits={kits}
              hasAccess={hasAccess}
              selectedTemplateId={selectedTemplateId}
              onSelect={handleTemplateSelect}
              onKitSelect={(kit) => {
                const primeiro = kit.templates?.[0];
                if (primeiro) handleTemplateSelect(primeiro);
                showMessage(`Kit "${kit.name}" carregado. ${kit.templates?.length || 0} peças disponíveis.`);
              }}
            />
          </Card>
        </aside>
      )}

      <Card
        className={`imprimax-preview-card relative overflow-auto p-4 ${
          isMobile ? "min-h-[calc(100vh-320px)]" : "min-h-[540px]"
        }`}
      >
        {statusMessage && (
          <div className="no-print mb-3 rounded-xl bg-[#16120E] px-3 py-2 text-xs font-medium text-white">
            {statusMessage}
          </div>
        )}

        {hasArtwork ? (
          <>
            <div className="no-print mb-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCurrentView("front")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${currentView === "front" ? "bg-[#FF5028]/15 text-[#FF5028]" : "text-[#16120E]/60"}`}
              >
                Ver frente
              </button>
              <button
                onClick={() => setCurrentView("back")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${currentView === "back" ? "bg-[#FF5028]/15 text-[#FF5028]" : "text-[#16120E]/60"}`}
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
                transition: "transform 200ms ease",
                willChange: "transform",
                WebkitFontSmoothing: "antialiased",
              } as React.CSSProperties}
            >
              <div
                className={`a4-sheet ${orientation === "landscape" ? "landscape" : ""} ${showGuides ? "card-tile-guides" : ""}`}
                style={{ width: `${paperDims.w}mm`, height: `${paperDims.h}mm` }}
              >
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
          </>
        ) : (
          <div className="flex min-h-[500px] flex-col justify-center rounded-lg border border-dashed border-[#FFD2C7] bg-[#FFF8F5] p-6">
            <div className="mx-auto w-full max-w-xl text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-white text-[#FF5028] shadow-sm">
                <Icon name="grid" className="size-6" />
              </div>
              <h2 className="text-xl font-extrabold text-[#16120E]">
                Escolha um template para montar a folha
              </h2>
              <p className="mt-2 text-sm text-[#16120E]/65">
                Os templates ficam em destaque no painel ao lado. Ao carregar um modelo, a folha de impressao aparece aqui com frente, verso e ajustes.
              </p>
              {templates.length > 0 && (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {templates.slice(0, 3).map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className="overflow-hidden rounded-lg border border-[#E6E2DC] bg-white text-left shadow-sm transition hover:border-[#FF5028]"
                    >
                      <div className="aspect-[4/5] bg-[#F7F7F7]">
                        <img
                          src={template.front_url}
                          alt={template.name}
                          className="h-full w-full object-contain p-3"
                          loading="lazy"
                        />
                      </div>
                      <p className="truncate px-3 py-2.5 text-xs font-bold text-[#16120E]">
                        {template.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      <div className="no-print space-y-4">
        <Card>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#16120E]/70">Suas artes</h3>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#16120E]">
              Arte da frente
              <Input type="file" accept="image/*" onChange={(e) => onImageUpload(e, "front")} className="mt-1" />
            </label>
            <label className="block text-sm font-medium text-[#16120E]">
              Arte do verso
              <Input type="file" accept="image/*" onChange={(e) => onImageUpload(e, "back")} className="mt-1" />
            </label>
          </div>
          {loadingSide && <p className="mt-2 text-xs text-[#16120E]">Carregando arte {loadingSide}...</p>}
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#16120E]/70">
            <Icon name="ruler" className="size-4 text-[#FF5028]" />
            Tamanho da arte
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs">
              Largura (cm)
              <Input mono type="number" step="0.1" min={ARTE_MIN_CM} max={ARTE_MAX_CM} placeholder="ex: 6" value={arteWidthCm} onChange={(e) => setArteWidthCm(e.target.value)} />
            </label>
            <label className="text-xs">
              Altura (cm)
              <Input mono type="number" step="0.1" min={ARTE_MIN_CM} max={ARTE_MAX_CM} placeholder="ex: 7" value={arteHeightCm} onChange={(e) => setArteHeightCm(e.target.value)} />
            </label>
          </div>
          <label className="mt-3 block text-xs">
            Formato do papel
            <select
              className="mt-1 w-full rounded-xl border border-[#FF5028]/20 bg-white px-3 py-2 text-sm"
              value={paperFormat}
              onChange={(e) => setPaperFormat(e.target.value as PaperFormat)}
            >
              <option value="A4">A4 (21 x 29,7 cm)</option>
              <option value="A5">A5 (14,8 x 21 cm)</option>
              <option value="Carta">Carta (21,6 x 27,9 cm)</option>
            </select>
          </label>
          <button type="button" onClick={handleCalcularGrid} className="ix-btn-accent mt-3 w-full justify-center">
            <Icon name="sparkle" className="size-4" />
            Calcular grid automaticamente
          </button>
          {calcResultado && (
            <div className={`mt-3 rounded-xl px-3 py-2 text-xs font-medium ${calcResultado.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              <Icon name={calcResultado.ok ? "success" : "x"} className="mr-1 inline size-4 align-[-3px]" />
              {calcResultado.mensagem}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#16120E]/70">Formato e grade</h3>
          <div className="grid grid-cols-3 gap-2">
            <label className="text-xs">
              Colunas
              <Input mono type="number" min={1} max={10} value={safeCols} onChange={(e) => setCols(Number(e.target.value))} />
            </label>
            <label className="text-xs">
              Linhas
              <Input mono type="number" min={1} max={10} value={safeRows} onChange={(e) => setRows(Number(e.target.value))} />
            </label>
            <label className="text-xs">
              Gap (mm)
              <Input mono type="number" min={0} max={20} value={safeGap} onChange={(e) => setGap(Number(e.target.value))} />
            </label>
          </div>
          <label className="mt-3 block text-xs">
            Orientação
            <select
              className="mt-1 w-full rounded-xl border border-[#FF5028]/20 bg-white px-3 py-2 text-sm"
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as Orientation)}
            >
              <option value="portrait">Retrato</option>
              <option value="landscape">Paisagem</option>
            </select>
          </label>
          <div className="mt-3 space-y-1 text-xs text-[#16120E]/70">
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
      </div>
    </div>
  );
}
