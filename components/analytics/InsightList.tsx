import React from 'react';
import { CircleAlert, CircleCheck, CircleMinus, CircleX, Info } from 'lucide-react';
import type { Insight } from './insights';

// Status meaning is never color-alone: every insight carries an icon shape as well.
const ICONS: Record<Insight['tone'], React.ReactNode> = {
  good: <CircleCheck size={16} className="mt-0.5 shrink-0 text-[#0ca30c]" aria-hidden="true" />,
  warning: <CircleAlert size={16} className="mt-0.5 shrink-0 text-[#c98500]" aria-hidden="true" />,
  critical: <CircleX size={16} className="mt-0.5 shrink-0 text-[#d03b3b]" aria-hidden="true" />,
  insufficient: <CircleMinus size={16} className="mt-0.5 shrink-0 text-gray-400" aria-hidden="true" />,
  neutral: <Info size={16} className="mt-0.5 shrink-0 text-[#2a78d6]" aria-hidden="true" />,
};

export function InsightList({ insights, columns = 2 }: { insights: Insight[]; columns?: 1 | 2 }) {
  return (
    <ul className={columns === 2 ? 'grid gap-2 md:grid-cols-2' : 'grid gap-2'}>
      {insights.map((insight, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
          {ICONS[insight.tone]}
          <span>{insight.text}</span>
        </li>
      ))}
    </ul>
  );
}
