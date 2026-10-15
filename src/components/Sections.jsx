// Everything below the cover, in its own download: it loads in the background while the
// opening flower is on screen (the page is locked until the flower is opened), so the
// first screen appears sooner on slow phones.
import { useEffect } from 'react';
import { ScrollTrigger } from '../lib/env';
import TableFinder from './sections/TableFinder';
import Invitation from './sections/Invitation';
import Couple from './sections/Couple';
import WeddingParty from './sections/WeddingParty';
import PreWedding from './sections/PreWedding';
import Countdown from './sections/Countdown';
import Programme from './sections/Programme';
import Story from './sections/Story';
import Candle from './sections/Candle';
import Gallery from './sections/Gallery';
import GuestPhotos from './sections/GuestPhotos';
import Venue from './sections/Venue';
import Travel from './sections/Travel';
import DressCode from './sections/DressCode';
import Rsvp from './sections/Rsvp';
import Gift from './sections/Gift';
import Thanks from './sections/Thanks';

export default function Sections({ phase }) {
  // the page just grew: re-measure scroll animations and pinned sections
  useEffect(() => { requestAnimationFrame(() => ScrollTrigger.refresh()); }, []);
  return (
    <>
      {phase === 'today' && <TableFinder />}
      <Invitation />
      <Couple />
      <WeddingParty />
      <PreWedding />
      <Countdown />
      <Programme />
      <Story />
      <Candle />
      <Gallery />
      {phase !== 'before' && <GuestPhotos />}
      <Venue />
      <Travel />
      <DressCode />
      {phase !== 'after' && <Rsvp />}
      <Gift />
      <Thanks />
    </>
  );
}
