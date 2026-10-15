// Calendar lines worked out from the wedding date, so they can't be typed wrong:
// the solar date row (ថ្ងៃ | ទី | ខែ | ឆ្នាំ) and the Khmer lunar date (ចន្ទគតិ), in km / en / zh.
// The lunar conversion uses @thyrith/momentkh (MIT), checked against Meak/Visak Bochea and Pchum Ben.
// It runs at build time (vite.config.js → virtual:wedding-calendar), so guests never download it.
import momentkh from '@thyrith/momentkh';
import { khmerNum } from '../i18n.js';

const KM_DAYS = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
const EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ZH_DAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const KM_MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ZH_MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

// Khmer lunar month and animal-year names, romanised for English (Chinese uses its zodiac)
const LUNAR_MONTH_EN = {
  មិគសិរ: 'Migasir', បុស្ស: 'Bos', មាឃ: 'Meak', ផល្គុន: 'Phalkun', ចេត្រ: 'Chaet', ពិសាខ: 'Pisak',
  ជេស្ឋ: 'Jesth', អាសាឍ: 'Asath', បឋមាសាឍ: 'First Asath', ទុតិយាសាឍ: 'Second Asath', ស្រាពណ៍: 'Srap', ភទ្របទ: 'Phatrabot', អស្សុជ: 'Assoch', កត្ដិក: 'Kadeuk', កត្តិក: 'Kadeuk',
};
const ANIMALS = {
  ជូត: ['Rat', '鼠'], ឆ្លូវ: ['Ox', '牛'], ខាល: ['Tiger', '虎'], ថោះ: ['Rabbit', '兔'], រោង: ['Dragon', '龙'], ម្សាញ់: ['Snake', '蛇'],
  មមី: ['Horse', '马'], មមែ: ['Goat', '羊'], វក: ['Monkey', '猴'], រកា: ['Rooster', '鸡'], ច: ['Dog', '狗'], កុរ: ['Pig', '猪'],
};
const ordinal = (n) => `${n}${[, 'st', 'nd', 'rd'][n % 10 > 3 || Math.floor((n % 100) / 10) === 1 ? 0 : n % 10] || 'th'}`;

/** wall-clock parts of an ISO date in Phnom Penh time (UTC+7) */
function local(dateISO) {
  const d = new Date(new Date(dateISO).getTime() + 7 * 3600e3);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, day: d.getUTCDate(), wd: d.getUTCDay() };
}

/** { weekday, day, month, year } each as { km, en, zh } */
export function dateParts(dateISO) {
  const { y, m, day, wd } = local(dateISO);
  return {
    weekday: { km: KM_DAYS[wd], en: EN_DAYS[wd], zh: ZH_DAYS[wd] },
    day: { km: khmerNum(day), en: String(day), zh: String(day) },
    month: { km: KM_MONTHS[m - 1], en: EN_MONTHS[m - 1], zh: ZH_MONTHS[m - 1] },
    year: { km: khmerNum(y), en: String(y), zh: String(y) },
  };
}

/** "ត្រូវនឹងថ្ងៃ ៣កើត ខែមិគសិរ ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០" (+ en / zh) */
export function lunarLine(dateISO) {
  const { y, m, day } = local(dateISO);
  const k = momentkh.fromGregorian(y, m, day).khmer;
  const waxing = k.moonPhaseName === 'កើត';
  const [animalEn, animalZh] = ANIMALS[k.animalYearName] || [k.animalYearName, k.animalYearName];
  const month = LUNAR_MONTH_EN[k.monthName] || k.monthName;
  return {
    km: `ត្រូវនឹងថ្ងៃ ${khmerNum(k.day)}${k.moonPhaseName} ខែ${k.monthName} ឆ្នាំ${k.animalYearName} ${k.sakName} ព.ស. ${khmerNum(k.beYear)}`,
    en: `${ordinal(k.day)} ${waxing ? 'waxing' : 'waning'} day of ${month}, Year of the ${animalEn} · B.E. ${k.beYear}`,
    zh: `高棉历${animalZh}年 ${month}月 ${waxing ? '上弦' : '下弦'}第${k.day}日 · 佛历${k.beYear}`,
  };
}
