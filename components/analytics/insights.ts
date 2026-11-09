import { formatThumn } from '@/utils/thumn';
import type { AnalyticsData, BreakdownRow, Health } from '@/app/API/analytics';
import { t } from '@/i18n';
import { formatNumber, formatPercent } from './theme';

export interface Insight {
  tone: Health | 'neutral';
  text: string;
}

const MIN_RECORDS = 3;

export function entityName(row: { name: string; name_en?: string | null }, lang: string): string {
  return lang !== 'ar' && row.name_en ? row.name_en : row.name;
}

/** Plain-language findings for the executive summary, most important first. */
export function buildInsights(data: AnalyticsData, lang: string): Insight[] {
  const insights: Insight[] = [];
  const { kpis } = data;
  const prev = kpis.previous;

  if (kpis.attendance_rate !== null) {
    if (prev.attendance_rate !== null) {
      const diff = kpis.attendance_rate - prev.attendance_rate;
      const text = Math.abs(diff) < 0.5
        ? t('نسبة الحضور مستقرة عند {rate} مقارنة بالفترة السابقة.', { rate: formatPercent(kpis.attendance_rate) })
        : diff > 0
          ? t('ارتفعت نسبة الحضور إلى {rate} (+{diff} نقطة مقارنة بالفترة السابقة).', { rate: formatPercent(kpis.attendance_rate), diff: formatNumber(diff, 1) })
          : t('انخفضت نسبة الحضور إلى {rate} (−{diff} نقطة مقارنة بالفترة السابقة).', { rate: formatPercent(kpis.attendance_rate), diff: formatNumber(-diff, 1) });
      insights.push({ tone: Math.abs(diff) < 0.5 ? 'neutral' : diff > 0 ? 'good' : 'warning', text });
    } else {
      insights.push({ tone: 'neutral', text: t('بلغت نسبة الحضور {rate} خلال الفترة.', { rate: formatPercent(kpis.attendance_rate) }) });
    }
  } else {
    insights.push({ tone: 'insufficient', text: t('لم يتم تسجيل أي حضور خلال هذه الفترة.') });
  }

  if (kpis.thumn > 0 || prev.thumn > 0) {
    if (prev.thumn > 0) {
      const change = ((kpis.thumn - prev.thumn) / prev.thumn) * 100;
      insights.push({
        tone: change >= 0 ? 'good' : 'warning',
        text: change >= 0
          ? t('تم إنجاز {amount}، بزيادة {change}% عن الفترة السابقة.', { amount: formatThumn(kpis.thumn), change: formatNumber(change, 0) })
          : t('تم إنجاز {amount}، بانخفاض {change}% عن الفترة السابقة.', { amount: formatThumn(kpis.thumn), change: formatNumber(-change, 0) }),
      });
    } else {
      insights.push({ tone: 'good', text: t('تم إنجاز {amount} خلال الفترة.', { amount: formatThumn(kpis.thumn) }) });
    }
  }

  if (kpis.students > 0 && data.level !== 'student') {
    const inactive = kpis.students - kpis.active_students;
    const share = (kpis.active_students / kpis.students) * 100;
    insights.push({
      tone: share >= 85 ? 'good' : share >= 60 ? 'warning' : 'critical',
      text: inactive > 0
        ? t('{active} من أصل {total} طالب نشطون ({share})، و{inactive} بدون أي نشاط.', { active: formatNumber(kpis.active_students), total: formatNumber(kpis.students), share: formatPercent(share, 0), inactive: formatNumber(inactive) })
        : t('جميع الطلاب ({total}) سجلوا نشاطاً خلال الفترة.', { total: formatNumber(kpis.students) }),
    });
  }

  const ranked = data.breakdown.rows
    .filter((row: BreakdownRow) => row.attendance_rate !== null && row.attendance_records >= MIN_RECORDS)
    .sort((a, b) => (b.attendance_rate as number) - (a.attendance_rate as number));
  if (ranked.length >= 2) {
    const best = ranked[0];
    const worst = ranked[ranked.length - 1];
    insights.push({ tone: 'good', text: t('الأفضل حضوراً: {name} بنسبة {rate}.', { name: entityName(best, lang), rate: formatPercent(best.attendance_rate) }) });
    // Only call out the weakest entity when it is actually below the "good" threshold.
    if (worst.health === 'warning' || worst.health === 'critical') {
      insights.push({
        tone: worst.health === 'critical' ? 'critical' : 'warning',
        text: t('يحتاج إلى متابعة: {name} بنسبة حضور {rate}.', { name: entityName(worst, lang), rate: formatPercent(worst.attendance_rate) }),
      });
    }
  }

  const low = data.alerts.filter((a) => a.reason === 'low_attendance').length;
  if (low > 0) {
    insights.push({ tone: 'critical', text: t('{count} طالب نسبة حضورهم أقل من 70%.', { count: formatNumber(low) }) });
  }

  return insights;
}
