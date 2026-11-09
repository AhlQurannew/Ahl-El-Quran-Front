'use client';

import { Select } from '@/components/ui/Select';
import { HIZB_COUNT, THUMN_PER_HIZB, locateThumn, thumnRange, type ThumnRange } from '@/data/quran_thumn';
import { quranSurahs } from '@/data/quran_data';
import { t } from '@/i18n';

const surahName = (number: number) => quranSurahs.find((s) => s.number === number)?.name ?? String(number);

interface ThumnPickerProps {
  value: ThumnRange;
  onChange: (range: ThumnRange) => void;
}

/** Picks one Thumn by Hizb and position; the record keeps that Thumn's verse range. */
export function ThumnPicker({ value, onChange }: ThumnPickerProps) {
  const { hizb, thumn } = locateThumn(value.fromSurah, value.fromVerse);
  const exact = thumnRange(hizb, thumn);
  const isWholeThumn = (['fromSurah', 'fromVerse', 'toSurah', 'toVerse'] as const).every((key) => exact[key] === value[key]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <Select
          label={t('الحزب *')}
          value={hizb}
          onChange={(e) => onChange(thumnRange(Number(e.target.value), thumn))}
          options={Array.from({ length: HIZB_COUNT }, (_, i) => ({ value: i + 1, label: t('الحزب {n}', { n: i + 1 }) }))}
        />
        <Select
          label={t('الثمن *')}
          value={thumn}
          searchable={false}
          onChange={(e) => onChange(thumnRange(hizb, Number(e.target.value)))}
          options={Array.from({ length: THUMN_PER_HIZB }, (_, i) => ({ value: i + 1, label: t('الثمن {n}', { n: i + 1 }) }))}
        />
      </div>
      <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
        {t('من {from} آية {fromVerse} إلى {to} آية {toVerse}', {
          from: surahName(value.fromSurah),
          fromVerse: value.fromVerse,
          to: surahName(value.toSurah),
          toVerse: value.toVerse,
        })}
      </p>
      {!isWholeThumn && (
        <p className="text-xs text-amber-700">{t('هذا السجل القديم مسجل بالآيات. اختيار ثمن آخر يستبدل هذا المدى.')}</p>
      )}
    </div>
  );
}
