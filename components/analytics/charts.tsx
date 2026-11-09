'use client';

/**
 * Chart primitives for the admin BI dashboard (plain SVG/HTML, no chart library).
 * Specs follow the dataviz method: 2px lines with a ~10% wash, columns <= 24px with a 4px
 * rounded data-end and 2px surface gaps, hairline grid, crosshair/hover tooltips, keyboard
 * focus, and a table view for every chart. `staticMode` drops interaction for the PDF report.
 */
import React, { useMemo, useState } from 'react';
import { CircleAlert, CircleCheck, CircleMinus, CircleX, Table2, ChartColumn, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { Health } from '@/app/API/analytics';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';
import { HEALTH_COLORS, HEALTH_LABELS, INK, SERIES_1, formatCompact, formatNumber } from './theme';
import { useElementWidth } from './useElementWidth';

// ------------------------------------------------------------------ shared pieces

export interface TableView {
  columns: string[];
  rows: (string | number)[][];
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  table?: TableView;
  staticMode?: boolean;
  className?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/** Card owning title, caption and the table-view toggle (the accessible twin of every chart). */
export function ChartCard({ title, subtitle, table, staticMode, className, actions, children }: ChartCardProps) {
  const [showTable, setShowTable] = useState(false);
  return (
    <figure className={cn('min-w-0 rounded-2xl border border-gray-200 bg-[#fcfcfb] p-4 shadow-sm sm:p-5', className)}>
      <figcaption className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900 sm:text-base">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          {actions}
          {table && !staticMode && (
            <button
              type="button"
              onClick={() => setShowTable((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              aria-pressed={showTable}
            >
              {showTable ? <ChartColumn size={14} /> : <Table2 size={14} />}
              {showTable ? t('عرض الرسم') : t('عرض الجدول')}
            </button>
          )}
        </div>
      </figcaption>
      {showTable && table ? <DataTable table={table} /> : children}
    </figure>
  );
}

export function DataTable({ table, dense }: { table: TableView; dense?: boolean }) {
  return (
    <div className="relative overflow-x-auto">
      <table className={cn('w-full text-start text-xs', dense ? '' : 'sm:text-sm')}>
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            {table.columns.map((column) => (
              <th key={column} scope="col" className="whitespace-nowrap px-2 py-2 text-start font-semibold">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {table.rows.map((row, index) => (
            <tr key={index} className="border-b border-gray-100 last:border-0">
              {row.map((cell, i) => (
                <td key={i} className="whitespace-nowrap px-2 py-1.5 text-gray-800">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TooltipRow {
  label: string;
  value: string;
  color?: string;
}

/** Values lead (strong), labels follow; series keyed by a short line, never a box. */
function Tooltip({ x, y, width, title, rows }: { x: number; y: number; width: number; title: string; rows: TooltipRow[] }) {
  const boxWidth = 176;
  const left = Math.min(Math.max(x - boxWidth / 2, 0), Math.max(0, width - boxWidth));
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs shadow-lg"
      style={{ left, top: Math.max(0, y), width: boxWidth }}
    >
      <p className="mb-1 text-[11px] text-gray-500">{title}</p>
      {rows.map((row) => (
        <p key={row.label} className="flex items-center gap-2 py-0.5">
          {row.color && <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: row.color }} aria-hidden="true" />}
          <span className="font-bold text-gray-900 tabular-nums">{row.value}</span>
          <span className="truncate text-gray-500">{row.label}</span>
        </p>
      ))}
    </div>
  );
}

/** Round axis maximum and ticks to clean numbers. */
function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((f) => f * magnitude).find((s) => s >= raw) ?? raw;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => +(i * step).toFixed(6));
}

/** Pick evenly spaced x labels so they never collide. */
function labelIndexes(count: number, innerWidth: number, minGap = 64): Set<number> {
  const maxLabels = Math.max(2, Math.floor(innerWidth / minGap));
  const step = Math.max(1, Math.ceil(count / maxLabels));
  const indexes = new Set<number>();
  for (let i = 0; i < count; i += step) indexes.add(i);
  // Always label the latest point, dropping the regular label just before it when the
  // two would sit closer than a full step and collide.
  const last = count - 1;
  const previous = last - (last % step);
  if (previous !== last && last - previous < step) indexes.delete(previous);
  indexes.add(last);
  return indexes;
}

const MARGIN = { top: 12, right: 16, bottom: 28, left: 40 };

// ------------------------------------------------------------------ line chart

export interface LinePoint {
  label: string;
  longLabel: string;
  value: number | null;
}

interface LineChartProps {
  points: LinePoint[];
  seriesLabel: string;
  formatValue: (value: number) => string;
  yMax?: number;
  height?: number;
  staticMode?: boolean;
  fixedWidth?: number;
}

/** Single-series trend: 2px line, 10% area wash, end-dot with surface ring, crosshair tooltip. */
export function LineChart({ points, seriesLabel, formatValue, yMax, height = 220, staticMode, fixedWidth }: LineChartProps) {
  const { ref, width: measured } = useElementWidth<HTMLDivElement>(fixedWidth ?? 600);
  const width = fixedWidth ?? measured;
  const [active, setActive] = useState<number | null>(null);
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;
  const values = points.map((p) => p.value).filter((v): v is number => v !== null);
  const ticks = niceTicks(yMax ?? Math.max(1, ...values));
  const top = ticks[ticks.length - 1];
  const x = (i: number) => MARGIN.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => MARGIN.top + innerH - (v / top) * innerH;

  // Break the line at missing values instead of drawing through them.
  const segments = useMemo(() => {
    const result: number[][] = [];
    let current: number[] = [];
    points.forEach((p, i) => {
      if (p.value === null) {
        if (current.length) result.push(current);
        current = [];
      } else current.push(i);
    });
    if (current.length) result.push(current);
    return result;
  }, [points]);

  const lastIndex = [...points.keys()].reverse().find((i) => points[i].value !== null);
  const shown = labelIndexes(points.length, innerW);

  const locate = (clientX: number, rect: DOMRect) => {
    const ratio = (clientX - rect.left - MARGIN.left) / innerW;
    setActive(Math.min(points.length - 1, Math.max(0, Math.round(ratio * (points.length - 1)))));
  };

  return (
    <div ref={ref} className="relative w-full" style={fixedWidth ? { width: fixedWidth } : undefined}>
      <svg
        width={width}
        height={height}
        style={{ direction: 'ltr' }}
        role="img"
        aria-label={`${seriesLabel}: ${points.map((p) => `${p.longLabel} ${p.value === null ? '—' : formatValue(p.value)}`).join(', ')}`}
        tabIndex={staticMode ? undefined : 0}
        onKeyDown={staticMode ? undefined : (event) => {
          if (event.key === 'ArrowRight') setActive((a) => Math.min(points.length - 1, (a ?? -1) + 1));
          if (event.key === 'ArrowLeft') setActive((a) => Math.max(0, (a ?? points.length) - 1));
        }}
        onBlur={() => setActive(null)}
        className="overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-sky-300 rounded"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(tick)} y2={y(tick)} stroke={tick === 0 ? INK.axis : INK.grid} strokeWidth={1} />
            <text x={MARGIN.left - 6} y={y(tick)} dy="0.32em" textAnchor="end" fontSize={11} fill={INK.muted} className="tabular-nums">
              {formatCompact(tick)}
            </text>
          </g>
        ))}
        {points.map((p, i) => shown.has(i) && (
          <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize={11} fill={INK.muted}>{p.label}</text>
        ))}
        {segments.map((seg, si) => {
          const line = seg.map((i, k) => `${k ? 'L' : 'M'}${x(i)},${y(points[i].value as number)}`).join(' ');
          const area = seg.length > 1 ? `${line} L${x(seg[seg.length - 1])},${y(0)} L${x(seg[0])},${y(0)} Z` : '';
          return (
            <g key={si}>
              {area && <path d={area} fill={SERIES_1} opacity={0.1} />}
              <path d={line} fill="none" stroke={SERIES_1} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {seg.length === 1 && <circle cx={x(seg[0])} cy={y(points[seg[0]].value as number)} r={3} fill={SERIES_1} />}
            </g>
          );
        })}
        {lastIndex !== undefined && (
          <>
            <circle cx={x(lastIndex)} cy={y(points[lastIndex].value as number)} r={5} fill={SERIES_1} stroke={INK.surface} strokeWidth={2} />
            <text x={x(lastIndex)} y={y(points[lastIndex].value as number) - 10} textAnchor="end" fontSize={12} fontWeight={700} fill={INK.primary}>
              {formatValue(points[lastIndex].value as number)}
            </text>
          </>
        )}
        {active !== null && (
          <g pointerEvents="none">
            <line x1={x(active)} x2={x(active)} y1={MARGIN.top} y2={MARGIN.top + innerH} stroke={INK.secondary} strokeWidth={1} />
            {points[active].value !== null && (
              <circle cx={x(active)} cy={y(points[active].value as number)} r={5} fill={SERIES_1} stroke={INK.surface} strokeWidth={2} />
            )}
          </g>
        )}
        {!staticMode && (
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={Math.max(0, innerW)}
            height={innerH}
            fill="transparent"
            onPointerMove={(event) => locate(event.clientX, (event.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect())}
            onPointerLeave={() => setActive(null)}
          />
        )}
      </svg>
      {active !== null && !staticMode && (
        <Tooltip
          x={x(active)}
          y={8}
          width={width}
          title={points[active].longLabel}
          rows={[{ label: seriesLabel, value: points[active].value === null ? t('لا توجد بيانات') : formatValue(points[active].value as number), color: SERIES_1 }]}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------------ stacked columns

export interface ColumnSeries {
  key: string;
  label: string;
  color: string;
  values: number[];
}

interface StackedColumnsProps {
  labels: string[];
  longLabels: string[];
  series: ColumnSeries[];
  formatValue: (value: number) => string;
  totalLabel: string;
  height?: number;
  staticMode?: boolean;
  fixedWidth?: number;
}

function roundedTopRect(x: number, y: number, w: number, h: number, r: number): string {
  const radius = Math.min(r, w / 2, h);
  return `M${x},${y + h} L${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + w - radius},${y} Q${x + w},${y} ${x + w},${y + radius} L${x + w},${y + h} Z`;
}

/** Stacked columns over time; one hover target per column listing every series. */
export function StackedColumns({ labels, longLabels, series, formatValue, totalLabel, height = 240, staticMode, fixedWidth }: StackedColumnsProps) {
  const { ref, width: measured } = useElementWidth<HTMLDivElement>(fixedWidth ?? 600);
  const width = fixedWidth ?? measured;
  const [active, setActive] = useState<number | null>(null);
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;
  const totals = labels.map((_, i) => series.reduce((sum, s) => sum + (s.values[i] || 0), 0));
  const ticks = niceTicks(Math.max(1, ...totals));
  const top = ticks[ticks.length - 1];
  const band = innerW / Math.max(1, labels.length);
  const barW = Math.max(2, Math.min(24, band * 0.6));
  const y = (v: number) => MARGIN.top + innerH - (v / top) * innerH;
  const shown = labelIndexes(labels.length, innerW);
  const GAP = 2;

  return (
    <div ref={ref} className="relative w-full" style={fixedWidth ? { width: fixedWidth } : undefined}>
      <Legend items={series.map((s) => ({ label: s.label, color: s.color }))} />
      <svg width={width} height={height} style={{ direction: 'ltr' }} role="img" aria-label={totalLabel} className="overflow-visible">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(tick)} y2={y(tick)} stroke={tick === 0 ? INK.axis : INK.grid} strokeWidth={1} />
            <text x={MARGIN.left - 6} y={y(tick)} dy="0.32em" textAnchor="end" fontSize={11} fill={INK.muted} className="tabular-nums">{formatCompact(tick)}</text>
          </g>
        ))}
        {labels.map((label, i) => {
          const cx = MARGIN.left + band * i + band / 2;
          let base = 0;
          const visible = series.filter((s) => (s.values[i] || 0) > 0);
          return (
            <g key={i} opacity={active === null || active === i ? 1 : 0.55}>
              {visible.map((s, k) => {
                const value = s.values[i];
                const y0 = y(base);
                const y1 = y(base + value);
                base += value;
                const isTop = k === visible.length - 1;
                const h = Math.max(0, y0 - y1 - (k > 0 ? GAP : 0));
                const yTop = y1;
                return isTop
                  ? <path key={s.key} d={roundedTopRect(cx - barW / 2, yTop, barW, h, 4)} fill={s.color} />
                  : <rect key={s.key} x={cx - barW / 2} y={yTop} width={barW} height={h} fill={s.color} />;
              })}
              {shown.has(i) && <text x={cx} y={height - 8} textAnchor="middle" fontSize={11} fill={INK.muted}>{label}</text>}
              {!staticMode && (
                <rect
                  x={cx - band / 2}
                  y={MARGIN.top}
                  width={band}
                  height={innerH}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`${longLabels[i]}: ${formatValue(totals[i])}`}
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="outline-none"
                />
              )}
            </g>
          );
        })}
      </svg>
      {active !== null && !staticMode && (
        <Tooltip
          x={MARGIN.left + band * active + band / 2}
          y={28}
          width={width}
          title={longLabels[active]}
          rows={[
            { label: totalLabel, value: formatValue(totals[active]) },
            ...series.map((s) => ({ label: s.label, value: formatValue(s.values[active] || 0), color: s.color })),
          ]}
        />
      )}
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string; icon?: React.ReactNode }[] }) {
  return (
    <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          {item.icon ?? <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} aria-hidden="true" />}
          {item.label}
        </li>
      ))}
    </ul>
  );
}

// ------------------------------------------------------------------ segmented bar

export interface SegmentPart {
  key: string;
  label: string;
  value: number;
  color: string;
  textColor: string;
  icon: React.ReactNode;
}

/** Tall segmented bar (one whole split in <= 6 parts): shares printed where they fit. */
export function SegmentedBar({ parts, staticMode }: { parts: SegmentPart[]; staticMode?: boolean }) {
  const { ref, width } = useElementWidth<HTMLDivElement>(600);
  const [active, setActive] = useState<string | null>(null);
  const total = parts.reduce((sum, p) => sum + p.value, 0);
  if (!total) return <p className="py-6 text-center text-sm text-gray-400">{t('لا توجد بيانات للفترة المحددة')}</p>;
  const visible = parts.filter((p) => p.value > 0);
  return (
    <div ref={ref} className="relative">
      <div
        className="flex h-7 w-full gap-0.5"
        role="img"
        aria-label={visible.map((p) => `${p.label} ${formatNumber(p.value)} (${formatNumber((p.value / total) * 100, 1)}%)`).join(', ')}
      >
        {visible.map((part) => {
          const share = (part.value / total) * 100;
          const text = `${formatNumber(share, 0)}%`;
          const blockWidth = (share / 100) * width;
          return (
            <div
              key={part.key}
              className={cn('flex h-full items-center rounded px-2 text-xs font-bold transition-opacity', active && active !== part.key && 'opacity-60')}
              style={{ width: `${share}%`, background: part.color, color: part.textColor }}
              tabIndex={staticMode ? undefined : 0}
              onPointerEnter={() => setActive(part.key)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(part.key)}
              onBlur={() => setActive(null)}
              aria-label={`${part.label}: ${formatNumber(part.value)} (${formatNumber(share, 1)}%)`}
            >
              {blockWidth > text.length * 8 + 16 ? text : null}
            </div>
          );
        })}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-600">
        {parts.map((part) => (
          <li key={part.key} className="flex items-center gap-1.5">
            <span style={{ color: part.color }} aria-hidden="true">{part.icon}</span>
            <span>{part.label}</span>
            <span className="font-semibold tabular-nums text-gray-900">{formatNumber(part.value)}</span>
          </li>
        ))}
      </ul>
      {active && !staticMode && (() => {
        const part = parts.find((p) => p.key === active)!;
        return (
          <p className="mt-2 text-xs text-gray-600" role="status">
            <span className="font-bold text-gray-900">{formatNumber((part.value / total) * 100, 1)}%</span> · {part.label} · {formatNumber(part.value)}
          </p>
        );
      })()}
    </div>
  );
}

// ------------------------------------------------------------------ ranked bars

export interface RankedRow {
  id: number;
  label: string;
  value: number | null;
  display: string;
  hint?: string;
  health?: Health;
}

/** Ranked horizontal bars (one hue). Clicking a bar drills into that entity. */
export function RankedBars({ rows, max, onSelect, staticMode, emptyLabel }: {
  rows: RankedRow[];
  max?: number;
  onSelect?: (id: number) => void;
  staticMode?: boolean;
  emptyLabel: string;
}) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.value ?? 0));
  if (!rows.length) return <p className="py-6 text-center text-sm text-gray-400">{emptyLabel}</p>;
  return (
    <ul className="space-y-1">
      {rows.map((row) => {
        const content = (
          <>
            <span className="flex items-center justify-between gap-2 text-xs">
              <span className="flex min-w-0 items-center gap-1.5">
                {row.health && <HealthIcon health={row.health} size={13} />}
                <span className="truncate font-medium text-gray-800">{row.label}</span>
              </span>
              <span className="shrink-0 font-bold tabular-nums text-gray-900">{row.display}</span>
            </span>
            <span className="mt-1 block h-3 w-full">
              <span
                className="block h-full rounded-e"
                style={{ width: `${row.value === null ? 0 : Math.max(1, (row.value / top) * 100)}%`, background: SERIES_1 }}
              />
            </span>
            {row.hint && <span className="mt-0.5 block text-[11px] text-gray-400">{row.hint}</span>}
          </>
        );
        return (
          <li key={row.id}>
            {onSelect && !staticMode ? (
              <button
                type="button"
                onClick={() => onSelect(row.id)}
                className="block w-full rounded-lg px-2 py-1.5 text-start transition-colors hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                {content}
              </button>
            ) : (
              <div className="px-2 py-1.5">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ------------------------------------------------------------------ stat tile & health

export function HealthIcon({ health, size = 15 }: { health: Health; size?: number }) {
  const Icon = health === 'good' ? CircleCheck : health === 'warning' ? CircleAlert : health === 'critical' ? CircleX : CircleMinus;
  return <Icon size={size} style={{ color: HEALTH_COLORS[health] }} aria-hidden="true" className="shrink-0" />;
}

export function HealthBadge({ health }: { health: Health }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-gray-700">
      <HealthIcon health={health} />
      {t(HEALTH_LABELS[health])}
    </span>
  );
}

interface StatTileProps {
  label: string;
  value: string;
  deltaLabel?: string | null;
  /** true = this change is good news, false = bad news, null = neutral */
  deltaGood?: boolean | null;
  deltaDirection?: number;
  hint?: string;
  trend?: (number | null)[];
}

/** Stat tile: label · value · delta vs previous period · optional sparkline. */
export function StatTile({ label, value, deltaLabel, deltaGood, deltaDirection = 0, hint, trend }: StatTileProps) {
  const DeltaIcon = deltaDirection > 0 ? TrendingUp : deltaDirection < 0 ? TrendingDown : Minus;
  const spark = trend?.map((v) => v ?? 0) ?? [];
  const sparkMax = Math.max(1, ...spark);
  return (
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-[#fcfcfb] p-4 shadow-sm">
      <p className="truncate text-xs font-medium text-gray-500">{label}</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-x-2 gap-y-1">
        <p className="max-w-full break-words text-2xl font-semibold leading-tight text-gray-900 sm:text-[28px]">{value}</p>
        {spark.length > 1 && (
          <svg width={64} height={20} viewBox={`0 0 64 20`} style={{ direction: 'ltr' }} aria-hidden="true" className="shrink-0">
            <polyline
              points={spark.map((v, i) => `${(i / (spark.length - 1)) * 62 + 1},${19 - (v / sparkMax) * 17}`).join(' ')}
              fill="none"
              stroke="#b6b4ac"
              strokeWidth={1.5}
            />
            <circle cx={63} cy={19 - (spark[spark.length - 1] / sparkMax) * 17} r={2.5} fill={SERIES_1} />
          </svg>
        )}
      </div>
      {deltaLabel ? (
        <p className="mt-1 text-xs">
          <span
            className="inline-flex items-center gap-1 font-semibold"
            style={{ color: deltaGood === null || deltaGood === undefined ? INK.secondary : deltaGood ? INK.successText : INK.criticalText }}
          >
            <DeltaIcon size={13} className="shrink-0" aria-hidden="true" />
            {deltaLabel}
          </span>
          <span className="block truncate text-[11px] text-gray-400">{t('مقارنة بالفترة السابقة')}</span>
        </p>
      ) : (
        hint && <p className="mt-1 truncate text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}
