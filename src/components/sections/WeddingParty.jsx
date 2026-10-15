import { lite } from '../../lib/env';
import { wedding } from '../../data/wedding';
import { useLang } from '../../lib/lang';
import Photo from '../Photo';
import { RumdulMark, HEART } from '../Decor';
import { useGsap, SectionHead, headIn, scrollTl } from '../Shared';

// Family & wedding party, arranged like the family photo on the wedding day: the couple together
// under a gold arch in the middle, the groom's side on the left and the bride's side on the right,
// mirrored; the parents above, the attendants and the little ones in front, the MC at the end.
const ART = {
  groomsman: 'party-groomsman', bridesmaid: 'party-bridesmaid', flower: 'party-flower',
  child: 'party-child', escort: 'party-escort', mc: 'party-mc',
  father: 'party-father', mother: 'party-mother', 'flower-m': 'party-flower-boy', 'child-f': 'party-child-girl',
};
const artFor = (m) => ART[`${m.role}-${m.sex}`] || ART[m.role];

function Node({ art, role, name, className = '' }) {
  const { lang, p } = useLang();
  return (
    <figure className={`pt-node ${className}`}>
      <div className="pt-circle"><Photo slug={art} sizes="160px" alt="" eager={false} /></div>
      <figcaption>
        {role && <span className="pt-role" lang={lang}>{role}</span>}
        <span className="pt-name" lang="km">{name.km}</span>
        {lang !== 'km' && <span className="pt-en">{p(name)}</span>}
      </figcaption>
    </figure>
  );
}

// one side's people in a row; `side` sets which way they spread out from the middle
function Group({ side, people, label, tag }) {
  const { lang, t } = useLang();
  return (
    <div className={`fp-group is-${side}`}>
      <div className="fp-people">
        {people.map((m, i) => <Node key={i} art={artFor(m)} role={t.roles[m.role]} name={m} />)}
      </div>
      {label && <p className="fp-label" lang={lang}>{label}</p>}
      {tag && <p className="fp-label fp-tag" lang={lang}>{tag}</p>}
    </div>
  );
}

const parentsOf = (pp) => (pp ? [{ ...pp.father, role: 'father' }, { ...pp.mother, role: 'mother' }] : []);

export default function WeddingParty() {
  const { lang, t } = useLang();
  const party = wedding.weddingParty;
  const ref = useGsap((q, el) => {
    headIn(q, el);
    if (lite) return;
    // the couple first: the arch rises, the two portraits meet, the heart beats in
    const tl = scrollTl(q('.fp-couple')[0], 'top 85%')
      .from(q('.fp-arch'), { y: 40, opacity: 0, scale: 0.92, duration: 1.2, ease: 'expo.out' })
      .from(q('.fp-arch .is-groom'), { x: -36, opacity: 0, duration: 1, ease: 'expo.out' }, 0.3)
      .from(q('.fp-arch .is-bride'), { x: 36, opacity: 0, duration: 1, ease: 'expo.out' }, 0.3)
      .from(q('.fp-heart'), { scale: 0, duration: 0.8, ease: 'back.out(3)' }, 0.8);
    if (q('.fp-escort').length) tl.from(q('.fp-escort'), { x: -24, opacity: 0, duration: 0.9, ease: 'expo.out' }, 0.9);
    // every other row: each side spreads outward from the middle
    q('.fp-row').forEach((row) => {
      const r = scrollTl(row, 'top 88%')
        .from(row.querySelectorAll('.is-groom .pt-node'), { x: 24, opacity: 0, duration: 0.9, stagger: { each: 0.1, from: 'end' }, ease: 'expo.out' }, 0)
        .from(row.querySelectorAll('.is-bride .pt-node'), { x: -24, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out' }, 0);
      if (row.querySelector('.fp-label')) r.from(row.querySelectorAll('.fp-label'), { opacity: 0, y: 8, duration: 0.8 }, 0.4);
    });
    if (q('.fp-mc').length) scrollTl(q('.fp-mc')[0], 'top 90%').from(q('.fp-mc > *'), { opacity: 0, y: 16, duration: 0.9, stagger: 0.12, ease: 'expo.out' });
  });
  if (!party) return null;
  const g = party.groomSide || [], b = party.brideSide || [];
  const rows = Array.from({ length: Math.max(g.length, b.length) }, (_, i) => [g[i] || [], b[i] || []]);
  return (
    <section className="sec sec-light paper-card party" id="party" ref={ref}>
      <SectionHead k="partyTitle" />
      <div className="fp">
        {(wedding.groomParents || wedding.brideParents) && (
          <div className="fp-row fp-parents">
            <Group side="groom" people={parentsOf(wedding.groomParents)} label={t.groomParents} />
            <Group side="bride" people={parentsOf(wedding.brideParents)} label={t.brideParents} />
          </div>
        )}

        <div className="fp-couple">
          {party.escort && <span className="fp-spacer" aria-hidden="true" />}
          <div className="fp-arch">
            <RumdulMark className="fp-crown" />
            <Node className="is-groom" art={wedding.groomPhoto} role={t.groom} name={wedding.groom} />
            <svg className="fp-heart" viewBox="0 0 24 22" aria-hidden="true"><path d={HEART} /></svg>
            <Node className="is-bride" art={wedding.bridePhoto} role={t.bride} name={wedding.bride} />
          </div>
          {party.escort && <Node className="fp-escort" art={ART.escort} role={t.roles.escort} name={party.escort} />}
        </div>

        {rows.map(([gr, br], i) => (
          <div className="fp-row" key={i}>
            <Group side="groom" people={gr} tag={t.sideGroom} />
            <Group side="bride" people={br} tag={t.sideBride} />
          </div>
        ))}

        {party.mc?.length > 0 && (
          <div className="fp-mc">
            <p className="fp-label" lang={lang}>{t.mc}</p>
            <div className="fp-people">{party.mc.map((m) => <Node key={m.en} art={ART.mc} name={m} />)}</div>
          </div>
        )}
      </div>
    </section>
  );
}
