import type { PointerState } from '../engine/types/step';

/**
 * 指针标注：圆角胶囊标签 + 虚线引导 + 箭头。
 * 多个指针纵向分层错开，避免标签重叠；同层并排时横向错位。
 * 用于柱状图 / 方块数组等渲染器，保证 lo / mid / hi / left / right 等标注排版统一精致。
 */
const PILL_H = 18;
const LAYER_H = 27;
const CHAR_W = 7.2;

export function PointerLabelGroup({
  pointers,
  cx,
  topY,
}: {
  pointers: PointerState[];
  cx: number;
  topY: number;
}) {
  if (pointers.length === 0) return null;

  // 分层：每层最多 3 个（并排）；最多 3 层
  const layers: PointerState[][] = [];
  for (let i = 0; i < pointers.length; i += 1) {
    const layer = Math.floor(i / 3);
    if (!layers[layer]) layers[layer] = [];
    layers[layer].push(pointers[i]);
  }

  const renderedLayers = layers.slice(0, 3);

  return (
    <g>
      {renderedLayers.map((layer, li) => {
        const pillBottom = topY - 8 - li * LAYER_H;
        const pillY = pillBottom - PILL_H;
        const count = layer.length;
        return layer.map((p, pi) => {
          const offset = count > 1 ? (pi - (count - 1) / 2) * 26 : 0;
          const pillCx = cx + offset;
          const text = p.name;
          const pillW = Math.max(26, text.length * CHAR_W + 14);
          const pillX = pillCx - pillW / 2;
          return (
            <g key={p.id} className="viz-transition">
              {/* 虚线引导 */}
              <line
                x1={pillCx}
                y1={pillBottom + 1}
                x2={cx}
                y2={topY - 2}
                stroke="var(--cv-accent)"
                strokeWidth={1.2}
                strokeDasharray="3 3"
                opacity={0.75}
              />
              {/* 元素顶部箭头 */}
              <path
                d={`M ${cx - 4} ${topY - 8} L ${cx + 4} ${topY - 8} L ${cx} ${topY - 1} Z`}
                fill="var(--cv-accent)"
              />
              {/* 胶囊 */}
              <rect
                x={pillX}
                y={pillY}
                width={pillW}
                height={PILL_H}
                rx={PILL_H / 2}
                fill="var(--cv-accent)"
              />
              <text
                x={pillCx}
                y={pillY + PILL_H / 2 + 4}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill="#ffffff"
                style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}
              >
                {text}
              </text>
            </g>
          );
        });
      })}
    </g>
  );
}

/**
 * 区间标注：在元素下方绘制括号线 + 标签（如"搜索区间 [lo, hi]"）。
 */
export function RangeBracket({
  fromX,
  toX,
  y,
  label,
}: {
  fromX: number;
  toX: number;
  y: number;
  label: string;
}) {
  const left = Math.min(fromX, toX);
  const right = Math.max(fromX, toX);
  if (right - left < 4) return null;
  const mid = (left + right) / 2;
  return (
    <g className="viz-transition">
      <path
        d={`M ${left} ${y} L ${left} ${y + 6} L ${right} ${y + 6} L ${right} ${y}`}
        fill="none"
        stroke="var(--cv-muted)"
        strokeWidth={1.4}
        opacity={0.9}
      />
      <text
        x={mid}
        y={y + 19}
        textAnchor="middle"
        fontSize={10.5}
        fill="var(--cv-muted)"
      >
        {label}
      </text>
    </g>
  );
}
