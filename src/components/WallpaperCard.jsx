// 1080×1920 phone-wallpaper version of the invitation, rendered at /?card and captured by
// scripts/og.mjs into public/card.jpg (the "Download the card" button).
import { wedding } from '../data/wedding';
import { text, pick } from '../i18n';
import NameLogo from './NameLogo';
import { Corner, Crest, Divider } from './Decor';
import Photo from './Photo';

export default function WallpaperCard() {
  const d = wedding.dateParts;
  return (
    <div className="wall paper">
      <Corner className="wall-c tl" /><Corner flip="x" className="wall-c tr" />
      <Corner flip="y" className="wall-c bl" /><Corner flip="xy" className="wall-c br" />
      <div className="wall-inner">
        <Crest className="wall-crest" />
        <p className="km-moul foil wall-title" lang="km">{text.km.blessingTitle}</p>
        <div className="wall-photo"><Photo slug={wedding.invitePhoto} sizes="640px" alt="" /></div>
        <NameLogo className="wall-logo" />
        <p className="script wall-names">{wedding.groom.en} <span>&amp;</span> {wedding.bride.en}</p>
        <Divider className="wall-div" />
        <p className="wall-date" lang="km">{['weekday', 'day', 'month', 'year'].map((k, i) => `${text.km.dateLabels[i]}${pick(d[k], 'km')}`).join('  ')}</p>
        <p className="wall-lunar" lang="km">{pick(wedding.lunar, 'km')}</p>
        <p className="wall-venue" lang="km">{pick(wedding.venue.name, 'km')}<br />{pick(wedding.venue.address, 'km')}</p>
      </div>
    </div>
  );
}
