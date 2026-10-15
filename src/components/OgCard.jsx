// 1200×630 link-preview card, rendered at /?og and captured by scripts/og.mjs → public/og.jpg
import { wedding } from '../data/wedding';
import { text, pick } from '../i18n';
import NameLogo from './NameLogo';
import { Corner, Divider } from './Decor';
import Photo from './Photo';

export default function OgCard() {
  const d = wedding.dateParts;
  return (
    <div className="og">
      <div className="og-photo"><Photo slug={wedding.coverPhoto} sizes="1200px" alt="" /></div>
      <div className="og-shade" />
      <Corner className="og-c tl" /><Corner flip="x" className="og-c tr" />
      <Corner flip="y" className="og-c bl" /><Corner flip="xy" className="og-c br" />
      <div className="og-inner">
        <p className="km-moul foil og-title" lang="km">{text.km.blessingTitle}</p>
        <NameLogo className="og-logo" />
        <p className="script og-names">{wedding.groom.en} <span>&amp;</span> {wedding.bride.en}</p>
        <Divider className="og-div" />
        <p className="og-date" lang="km">{[d.weekday, d.day, d.month, d.year].map((x) => pick(x, 'km')).join('  ·  ')}</p>
      </div>
    </div>
  );
}
