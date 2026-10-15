// ─────────────────────────────────────────────────────────────────────────────
// ALL wedding details live here.
// SAMPLE DATA: every name, date, place and account below is FICTIONAL demo
// content (marked SAMPLE). Replace it with the real couple's details.
// ─────────────────────────────────────────────────────────────────────────────
import gallery from './gallery.json';
import calendar from 'virtual:wedding-calendar'; // date row + lunar date, worked out at build time from dateISO

// Colour palettes. `palette` below picks one.
export const palettes = {
  // "Rumdul Evening": evening leaf green, rumdul cream-yellow, gold (the current concept)
  rumdulEvening: {
    paper: '#24402f', // main colour: deep leaf green
    paperDeep: '#18301f',
    cream: '#fcf7e8', // rumdul petal cream
    creamDeep: '#f3e7c2',
    ink: '#0f1913', // evening garden, for photo sections
    inkSoft: '#26382c',
    foil: ['#8f6a25', '#dcb35c', '#fff1c4', '#e9c773', '#a07535'], // warm gold
  },
  // "Lotus Bloom": deep water blue, lotus-petal pink, dawn gold (the current concept)
  lotusBloom: {
    paper: '#1d2d4d', // main colour: deep water
    paperDeep: '#142039',
    cream: '#fbf4ef', // petal white
    creamDeep: '#f4dfe2', // blush
    ink: '#0d1426', // night water, for photo sections
    inkSoft: '#2a3552',
    foil: ['#94652a', '#e2b462', '#fff0c6', '#efc879', '#a6763a'], // dawn gold
  },
  // "Lotus Silk": crimson silk, champagne gold, ivory (the current concept)
  lotusSilk: {
    paper: '#7c1b2b', // silk envelope / main colour
    paperDeep: '#5a1120',
    cream: '#f8efe1',
    creamDeep: '#f0dcc6', // flap lining: blush champagne
    ink: '#170b0d', // near-black for photo sections
    inkSoft: '#3e2226',
    foil: ['#8a6424', '#d6ad5c', '#fbecc0', '#e0bf72', '#946a26'], // champagne gold
  },
  oliveGold: {
    paper: '#5d6142', // envelope / main paper
    paperDeep: '#474a31',
    cream: '#f3ead6',
    creamDeep: '#e4d6b8',
    ink: '#14130d', // near-black for photo sections
    inkSoft: '#3d3a2c',
    foil: ['#7a5a1e', '#c9a14a', '#f7e6a6', '#d9b45e', '#8a6421'], // dark → highlight → dark
  },
  creamRose: {
    paper: '#efe3d3', paperDeep: '#dccab4', cream: '#fbf5ec', creamDeep: '#efe2cf',
    ink: '#1a1412', inkSoft: '#4a3a34',
    foil: ['#8d5a4a', '#c98f7a', '#f6d6c6', '#d6a08a', '#8a5a48'],
  },
  navySilver: {
    paper: '#1f2a44', paperDeep: '#172036', cream: '#f2f0ea', creamDeep: '#dedbd2',
    ink: '#0b0e16', inkSoft: '#2b3247',
    foil: ['#7d828c', '#c4c8cf', '#ffffff', '#cfd3da', '#80858f'],
  },
};

export const wedding = {
  palette: 'rumdulEvening',

  // SAMPLE: fictional couple
  groom: {
    km: 'ផាត់ សុផានឹត',
    en: 'Phat Sophanith',
    shortKm: 'សុផានឹត', // name logo, top-left
    shortEn: 'Sophanith',
  },
  bride: {
    km: 'មិនទាន់មាន',
    en: 'To be announced',
    shortKm: 'មិនទាន់មាន', // name logo, bottom-right
    shortEn: 'TBA',
  },
  groomParents: { father: { km: 'ញាំង សុភាព', en: 'Nhang Sopheap' }, mother: { km: 'ឆន សុីណា', en: 'Chhon Sina' } },
  brideParents: { father: { km: 'ចាន់ ដារ៉ា', en: 'Chan Dara' }, mother: { km: 'លី ស្រីនាង', en: 'Ly Sreyneang' } },

  // SAMPLE date: drives the countdown, the calendar file, and (automatically) the date row and
  // the Khmer lunar date below — only this line needs changing.
  dateISO: '2026-12-12T07:00:00+07:00',

  // SAMPLE: the two parts of the day. Each guest link can invite to one or both
  // (?e=rituals / ?e=reception / both by default). Programme rows name their event.
  events: [
    {
      id: 'rituals', time: '06:30',
      name: { km: 'ពិធីប្រពៃណី', en: 'Traditional ceremonies', zh: '传统仪式' },
      venue: {
        name: { km: 'គេហដ្ឋានខាងកូនក្រមុំ', en: "The bride's family home", zh: '新娘家' },
        address: { km: 'ផ្លូវលេខ ២៧១ សង្កាត់ទួលទំពូង រាជធានីភ្នំពេញ', en: 'Street 271, Toul Tompoung, Phnom Penh', zh: '金边 271号街 Toul Tompoung' },
        lat: 11.5442, lng: 104.9120,
      },
    },
    {
      id: 'reception', time: '17:30',
      name: { km: 'ពិធីជប់លៀងអាពាហ៍ពិពាហ៍', en: 'Wedding reception', zh: '婚宴' },
      venue: {
        name: { km: 'សាលពិធីមង្គល ផ្កាឈូក', en: 'Lotus Garden Hall', zh: '莲花园礼堂' },
        address: { km: 'មហាវិថីព្រះនរោត្តម រាជធានីភ្នំពេញ', en: 'Preah Norodom Blvd, Phnom Penh', zh: '金边 诺罗敦大道' },
        lat: 11.5564, lng: 104.9282,
      },
      // SAMPLE parking & arrival for this venue
      parking: {
        note: {
          km: 'មានចំណតរថយន្តឥតគិតថ្លៃនៅខាងក្រោយសាល។ សូមអញ្ជើញមកដល់មុនម៉ោង ១៥ នាទី។',
          en: 'Free parking behind the hall. Please arrive 15 minutes early.',
          zh: '礼堂后方设有免费停车场，请提前15分钟到达。',
        },
        lat: 11.5551, lng: 104.9295,
      },
    },
  ],

  // SAMPLE programme over two days. `day` is an index into programmeDays; each day's date is worked
  // out from dateISO (`offset` days before the wedding day), so only dateISO needs changing.
  // icons: incense · tent · tray · gifts · rings · lotus · scissors · thread · petals · feast · music · toast
  // `about` is the ceremony guide shown when a guest taps the ritual; `art` is its illustration.
  programmeDays: [
    { offset: -1, km: 'ថ្ងៃទី១ · ថ្ងៃចូលរោង', en: 'Day 1 · Opening day', zh: '第一天 · 开棚日' },
    { offset: 0, km: 'ថ្ងៃទី២ · ថ្ងៃមង្គលការ', en: 'Day 2 · The wedding day', zh: '第二天 · 婚礼日' },
  ],
  programme: [
    // ── day 1: ថ្ងៃចូលរោង ──
    {
      day: 0, time: '07:00', event: 'rituals', km: 'ពិធីសែនក្រុងពាលី', en: 'Offering to the guardian of the land', zh: '祭拜土地神', icon: 'incense', art: 'rite-pealy',
      about: {
        km: 'ក្រុមគ្រួសាររៀបចំគ្រឿងសែន ដើម្បីសុំការអនុញ្ញាតពីក្រុងពាលី ម្ចាស់ទឹកដី មុនចាប់ផ្តើមពិធីមង្គលការ ហើយសុំឲ្យពិធីទាំងមូលប្រព្រឹត្តទៅដោយសុខសាន្ត។',
        en: 'The family makes an offering to Krong Pealy, guardian spirit of the land, asking permission to hold the wedding and for the days to pass in peace.',
        zh: '家人向土地守护神“Krong Pealy”献上供品，祈求允许举行婚礼，并保佑婚礼平安顺利。',
      },
    },
    {
      day: 0, time: '09:00', event: 'rituals', km: 'ពិធីចូលរោង និងទទួលញាតិមិត្ត', en: 'Opening the wedding pavilion', zh: '开棚迎亲友', icon: 'tent', art: 'rite-pavilion',
      about: {
        km: 'រោងការត្រូវបានបើកជាផ្លូវការ។ ញាតិមិត្តជិតឆ្ងាយមកជួបជុំ ជួយរៀបចំថាសជំនូន ផ្កា និងគ្រឿងតុបតែង ក្នុងបរិយាកាសសប្បាយរីករាយ។',
        en: 'The wedding pavilion opens. Relatives and friends gather to help prepare the gift trays, flowers and decorations together.',
        zh: '婚礼棚正式开启，亲友们齐聚一堂，一起准备聘礼托盘、鲜花和装饰。',
      },
    },
    {
      day: 0, time: '15:00', event: 'rituals', km: 'ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត', en: "Monks' blessing", zh: '僧侣诵经祈福', icon: 'lotus', art: 'rite-lotus',
      about: {
        km: 'ព្រះសង្ឃសូត្រមន្តចម្រើនព្រះបរិត្ត ប្រសិទ្ធពរជ័យសុភមង្គល សេចក្តីសុខ និងភាពសុខដុមរមនាដល់គូស្វាមីភរិយាថ្មី។',
        en: 'Monks chant blessings for happiness, protection and harmony for the new couple.',
        zh: '僧侣为新人诵经，祈求幸福、平安与和睦。',
      },
    },
    {
      day: 0, time: '17:00', event: 'rituals', km: 'ពិធីជាវខាន់ស្លា', en: 'Presenting the betel tray (Khan Sla)', zh: '献槟榔盘礼', icon: 'tray', art: 'rite-khansla',
      about: {
        km: 'តំណាងខាងកូនកំលោះជូនខាន់ស្លាដល់មាតាបិតាកូនក្រមុំ ជាសញ្ញានៃការសុំកូនស្រីដោយការគោរព ហើយគ្រួសារទាំងពីរបានជួបជុំគ្នាជាផ្លូវការ។',
        en: "The groom's family presents the Khan Sla, a betel tray, to the bride's parents: a respectful request for her hand, and the moment the two families formally meet.",
        zh: '新郎家人向新娘父母献上槟榔盘，郑重提亲，两家人正式相聚。',
      },
    },
    {
      day: 0, time: '18:00', event: 'rituals', km: 'ពិសាអាហារពេលល្ងាចជាមួយញាតិមិត្ត', en: 'Family dinner', zh: '亲友晚餐', icon: 'feast', art: 'rite-dinner',
      about: {
        km: 'អាហារពេលល្ងាចដ៏កក់ក្តៅ ជាមួយក្រុមគ្រួសារ និងញាតិមិត្តទាំងសងខាង ដើម្បីស្គាល់គ្នា និងអរគុណចំពោះការជួយរៀបចំ។',
        en: 'A warm dinner with both families and friends, to get to know one another and thank everyone who helped.',
        zh: '与双方家人和亲友共进温馨晚餐，彼此认识，并感谢大家的帮忙。',
      },
    },
    {
      day: 0, time: '19:00', event: 'rituals', km: 'តន្ត្រីភ្លេងការប្រពៃណី', en: 'Traditional wedding music', zh: '传统婚礼音乐', icon: 'music', art: 'rite-music',
      about: {
        km: 'វង់ភ្លេងការប្រគុំបទបុរាណ ដែលបទនីមួយៗរៀបរាប់ដំណើររឿងនៃពិធីមង្គលការ ជូនពរដល់គូស្វាមីភរិយា។',
        en: 'A traditional pinpeat ensemble plays the old wedding songs, each one telling part of the wedding story.',
        zh: '传统乐队演奏古老的婚礼乐曲，每一首都讲述婚礼故事的一部分。',
      },
    },

    // ── day 2: ថ្ងៃមង្គលការ ──
    {
      day: 1, time: '06:30', event: 'rituals', km: 'ពិធីហែជំនូន', en: 'Procession of gifts', zh: '送聘礼游行', icon: 'gifts', art: 'rite-gifts',
      about: {
        km: 'ក្រុមគ្រួសារកូនកំលោះហែជំនូនផ្លែឈើ និងនំចំណីជាច្រើនថាស មកកាន់ផ្ទះកូនក្រមុំ ជាសញ្ញានៃការគោរព និងការជូនពរឲ្យមានភាពសម្បូរសប្បាយ។',
        en: 'The groom’s family walks in procession to the bride’s home carrying trays of fruit and sweets: a gesture of respect and a wish for abundance.',
        zh: '新郎家人捧着一盘盘水果和甜点，列队前往新娘家，表达敬意，也祝愿生活富足。',
      },
    },
    {
      day: 1, time: '07:30', event: 'rituals', km: 'ពិធីរាប់ផ្លែឈើ និងបំពាក់ចិញ្ចៀន', en: 'Counting the gifts & exchanging rings', zh: '清点聘礼与交换戒指', icon: 'rings', art: 'art-07-trays',
      about: {
        km: 'ចាស់ទុំទាំងសងខាងរាប់ថាសជំនូនជាគូៗ ជាសញ្ញាថាជីវិតគូនឹងមិនខ្វះខាត។ បន្ទាប់មក គូស្វាមីភរិយាបំពាក់ចិញ្ចៀនឲ្យគ្នា នៅចំពោះមុខក្រុមគ្រួសារ។',
        en: 'Elders from both sides count the gift trays in pairs, so the couple will never want for anything. Then the couple exchange rings before both families.',
        zh: '双方长辈成对清点聘礼托盘，寓意新人生活无缺。随后，新人在两家人面前互换戒指。',
      },
    },
    {
      day: 1, time: '08:30', event: 'rituals', km: 'ពិធីកាត់សក់បង្កក់សិរី', en: 'Hair-cutting ceremony', zh: '剪发礼', icon: 'scissors', art: 'rite-scissors',
      about: {
        km: 'ពិធីកាត់សក់ជានិមិត្តរូប ដើម្បីជម្រះអ្វីៗពីអតីតកាល ហើយចាប់ផ្តើមជីវិតថ្មីជាមួយគ្នាដោយសិរីមង្គល។',
        en: 'A symbolic trim of the couple’s hair to leave the past behind and begin a new life together.',
        zh: '象征性地为新人修剪头发，告别过去，携手开启新生活。',
      },
    },
    {
      day: 1, time: '10:00', event: 'rituals', km: 'ពិធីបង្វិលពពិល', en: 'Candle-circling blessing', zh: '绕烛祝福礼', icon: 'lotus', art: 'rite-rings',
      about: {
        km: 'ញាតិមិត្តដែលរៀបការរួច អង្គុយជារង្វង់ ហុចពពិលទៀនជុំវិញគូស្វាមីភរិយា ដើម្បីជូនពរឲ្យក្តីស្រឡាញ់របស់ពួកគេរឹងមាំ និងភ្លឺស្វាងជានិច្ច។',
        en: 'Married relatives pass lit candles in a circle around the couple, wishing them a love that stays strong and bright.',
        zh: '已婚的亲友围坐成圈，将点燃的蜡烛绕着新人传递，祝愿他们的爱情坚定而明亮。',
      },
    },
    {
      day: 1, time: '11:00', event: 'rituals', km: 'ពិធីសំពះផ្ទឹម និងចងដៃ', en: 'Knot-tying ceremony', zh: '系线祝福礼', icon: 'thread', art: 'rite-thread',
      about: {
        km: 'ចាស់ទុំ និងភ្ញៀវកិត្តិយសចងអំបោះលើកដៃគូស្វាមីភរិយា ព្រមទាំងជូនពរ ជាសញ្ញានៃការភ្ជាប់ចិត្តគ្នាជារៀងរហូត។',
        en: 'Elders and guests tie blessed threads around the couple’s wrists with their wishes, binding the two together for life.',
        zh: '长辈和宾客在新人手腕上系上祝福之线，送上心愿，象征两人一生相连。',
      },
    },
    {
      day: 1, time: '12:00', event: 'rituals', km: 'ពិធីបាចផ្កាស្លា និងដង្ហែចូលបន្ទប់', en: 'Scattering palm blossoms', zh: '撒槟榔花礼', icon: 'petals', art: 'rite-petals',
      about: {
        km: 'ភ្ញៀវបាចផ្កាស្លាលើគូស្វាមីភរិយា ជូនពរឲ្យរស់នៅជាមួយគ្នាដោយសុខដុម។ កូនកំលោះកាន់ចុងកន្សែងកូនក្រមុំ ដើរតាមចូលបន្ទប់ ជាការបញ្ចប់ពិធីពេលព្រឹក។',
        en: 'Guests shower the couple with palm blossoms for a harmonious life. The groom then holds the end of the bride’s scarf and follows her inside, closing the morning ceremonies.',
        zh: '宾客向新人撒槟榔花，祝愿生活和睦。随后新郎牵着新娘的披肩随她入房，上午的仪式至此结束。',
      },
    },
    {
      day: 1, time: '12:30', event: 'rituals', km: 'ពិសាអាហារថ្ងៃត្រង់', en: 'Lunch with the family', zh: '午宴', icon: 'feast', art: 'rite-lunch',
      about: {
        km: 'អាហារថ្ងៃត្រង់ជាមួយក្រុមគ្រួសារ និងភ្ញៀវដែលបានចូលរួមពិធីពេលព្រឹក។',
        en: 'Lunch with the family and the guests who joined the morning ceremonies.',
        zh: '与家人及参加上午仪式的宾客共进午餐。',
      },
    },
    {
      day: 1, time: '17:00', event: 'reception', km: 'ទទួលភ្ញៀវ និងថតរូបអនុស្សាវរីយ៍', en: 'Welcome & photos with the couple', zh: '迎宾与合影', icon: 'rings', art: 'rite-welcome',
      about: {
        km: 'គូស្វាមីភរិយា និងមាតាបិតាទាំងសងខាង ឈរស្វាគមន៍ភ្ញៀវនៅមាត់ទ្វារសាល។ សូមអញ្ជើញថតរូបអនុស្សាវរីយ៍ជាមួយគូស្វាមីភរិយា។',
        en: 'The couple and both sets of parents welcome guests at the door. Please join them for a photo.',
        zh: '新人与双方父母在礼堂门口迎接宾客，欢迎与新人合影留念。',
      },
    },
    {
      day: 1, time: '18:00', event: 'reception', km: 'ពិសាភោជនាហារ', en: 'Wedding reception dinner', zh: '婚宴', icon: 'feast', art: 'rite-feast',
      about: {
        km: 'ពិធីជប់លៀងអបអរសាទរ ដើម្បីថ្លែងអំណរគុណដល់ភ្ញៀវកិត្តិយសទាំងអស់ ដែលបានអញ្ជើញមកចូលរួម។',
        en: 'A celebration dinner to thank every guest for sharing the day with us.',
        zh: '以喜宴答谢每一位前来分享喜悦的宾客。',
      },
    },
    {
      day: 1, time: '19:30', event: 'reception', km: 'កាត់នំ លើកកែវជូនពរ និងរាំវង់', en: 'Cake, toast & dancing', zh: '切蛋糕、举杯与舞会', icon: 'toast', art: 'rite-dance',
      about: {
        km: 'គូស្វាមីភរិយាកាត់នំមង្គលការ លើកកែវថ្លែងអំណរគុណ ហើយអញ្ជើញភ្ញៀវទាំងអស់ចូលរាំវង់ រាំក្បាច់ និងសារ៉ាវ៉ាន់ជាមួយគ្នា។',
        en: 'The couple cut the cake and raise a toast, then invite everyone to dance the Romvong, Saravan and more.',
        zh: '新人切婚礼蛋糕、举杯致谢，随后邀请所有宾客一起跳南旺舞等传统舞蹈。',
      },
    },
  ],

  // SAMPLE dress code: colours shown as silk swatches
  dressCode: {
    note: {
      km: 'សូមអញ្ជើញស្លៀកពាក់តាមពណ៌ខាងក្រោម ហើយសូមចៀសវាងសម្លៀកបំពាក់ពណ៌ខ្មៅទាំងស្រុង។',
      en: 'We’d love to see these colours. Please avoid dressing all in black.',
      zh: '欢迎穿着以下颜色，请避免全身黑色。',
    },
    colors: [
      { hex: '#8f1d2c', km: 'ក្រហមចាស់', en: 'Crimson', zh: '绯红' },
      { hex: '#d6ad5c', km: 'មាស', en: 'Gold', zh: '金色' },
      { hex: '#f6ecdc', km: 'សភ្លុក', en: 'Ivory', zh: '象牙白' },
      { hex: '#f1dc8e', km: 'លឿងរំដួល', en: 'Rumdul yellow', zh: '淡金黄' },
    ],
  },

  // SAMPLE gift QR codes: they only encode a "sample" note, not real accounts.
  // Replace with the couple's real KHQR / ABA images in /public/qr.
  giftQR: [
    { label: { km: 'ABA · ផាត់ សុផានឹត (គំរូ)', en: 'ABA · Phat Sophanith (sample)', zh: 'ABA · Phat Sophanith（示例）' }, src: '/qr/sample-groom.png' },
    { label: { km: 'ACLEDA · មិនទាន់មាន (គំរូ)', en: 'ACLEDA · to be announced (sample)', zh: 'ACLEDA · 待定（示例）' }, src: '/qr/sample-bride.png' },
  ],
  music: '/music/all3rgy---official-music-video.mp3', // set by npm run music

  // SAMPLE wedding party (fictional names), laid out as a tree under the groom and the bride.
  // Each row is one level; `role` picks the label, `sex` ('m' | 'f') picks the portrait:
  // groomsman · bridesmaid · flower (អ្នកកាន់ផ្កា) · child (កូនអណ្តើក).
  // `escort` (អ្នកដឹកដៃ) stands right beside the bride, on her right.
  weddingParty: {
    mc: [{ km: 'លោក ហេង សុវណ្ណ', en: 'Heng Sovann' }],
    escort: { km: 'អ្នកស្រី ម៉ម សុផល', en: 'Mom Sophal' },
    groomSide: [
      [
        { role: 'groomsman', km: 'ពៅ រតនា', en: 'Pov Rattana' },
        { role: 'groomsman', km: 'សេង វុទ្ធី', en: 'Seng Vuthy' },
        { role: 'groomsman', km: 'គឹម ពិសិដ្ឋ', en: 'Kim Piseth' },
      ],
      [
        { role: 'flower', sex: 'm', km: 'លី ដារ៉ា', en: 'Ly Dara' },
        { role: 'child', sex: 'm', km: 'សុខ ពិសិទ្ធ', en: 'Sok Piseth' },
        { role: 'flower', sex: 'm', km: 'ជា សុធី', en: 'Chea Sothy' },
      ],
    ],
    brideSide: [
      [
        { role: 'bridesmaid', km: 'អ៊ុក ស្រីមុំ', en: 'Ouk Sreymom' },
        { role: 'bridesmaid', km: 'ទេព ចន្ថា', en: 'Tep Chantha' },
        { role: 'bridesmaid', km: 'ហុង ម៉ានី', en: 'Hong Many' },
      ],
      [
        { role: 'flower', sex: 'f', km: 'ចាន់ នីតា', en: 'Chan Nita' },
        { role: 'child', sex: 'f', km: 'ចាន់ ម៉ូនី', en: 'Chan Mony' },
        { role: 'flower', sex: 'f', km: 'អ៊ឹម ស្រីល័ក្ខ', en: 'Im Sreyleak' },
      ],
    ],
  },

  // SAMPLE travel & stay for guests coming from far (fictional hotels; routes are general guidance)
  travel: {
    hotels: [
      { name: 'Rumdul Boutique Hotel', note: { km: 'ដើរ ៥ នាទីពីសាល', en: '5-minute walk to the hall', zh: '步行5分钟到礼堂' }, lat: 11.5571, lng: 104.9301 },
      { name: 'Riverside Garden Inn', note: { km: 'ជិតមាត់ទន្លេ · តម្លៃសមរម្យ', en: 'By the river · good value', zh: '河边 · 实惠' }, lat: 11.5620, lng: 104.9310 },
    ],
    routes: [
      { from: { km: 'ពីសៀមរាប', en: 'From Siem Reap', zh: '从暹粒出发' }, how: { km: 'ឡានក្រុង ឬតាក់ស៊ី ប្រហែល ៥–៦ ម៉ោង តាមផ្លូវជាតិលេខ ៦', en: 'Bus or taxi, about 5–6 hours on National Road 6', zh: '大巴或出租车，经6号国道约5–6小时' } },
      { from: { km: 'ពីបាត់ដំបង', en: 'From Battambang', zh: '从马德望出发' }, how: { km: 'ឡានក្រុង ប្រហែល ៥ ម៉ោង តាមផ្លូវជាតិលេខ ៥', en: 'Bus, about 5 hours on National Road 5', zh: '大巴，经5号国道约5小时' } },
      { from: { km: 'ពីក្រុងព្រះសីហនុ', en: 'From Sihanoukville', zh: '从西哈努克港出发' }, how: { km: 'ផ្លូវល្បឿនលឿន ប្រហែល ២–៣ ម៉ោង', en: 'Expressway, about 2–3 hours', zh: '高速公路约2–3小时' } },
    ],
  },

  // pre-wedding video: a local file (+ poster) or a YouTube id. SAMPLE: a slideshow made from the
  // illustrations by `npm run video`; replace with the couple's own film.
  video: { src: '/video/prewedding.mp4', poster: '/video/prewedding.jpg', youtube: null },

  // live stream for relatives abroad: shown on the wedding day only. SAMPLE link.
  live: { url: 'https://www.youtube.com/live', platform: 'YouTube' },

  siteUrl: 'https://example.vercel.app', // set after deploy (used for og:image and sharing)

  photos: gallery,
  gallery: gallery.filter((p) => p.gallery !== false),
  coverPhoto: (gallery.find((p) => p.cover) || gallery[0])?.slug,
  // which illustration/photo goes where (slugs from src/data/gallery.json)
  invitePhoto: 'art-02-couple',
  groomPhoto: 'art-03-groom',
  bridePhoto: 'art-04-bride',
  candlePhoto: 'art-05-lanterns',
  storyPhotos: ['art-06-sunrise', 'art-07-trays', 'art-02-couple', 'art-08-garden', 'art-01-cover'],
};

// worked out from dateISO (never typed by hand)
wedding.dateParts = calendar.dateParts;
{
  const day0 = new Date(new Date(wedding.dateISO).getTime() + 7 * 3600e3);
  wedding.programmeDays.forEach((d) => {
    d.iso = new Date(day0.getTime() + d.offset * 864e5).toISOString().slice(0, 10);
  });
  wedding.programme.forEach((it) => { it.at = `${wedding.programmeDays[it.day || 0].iso}T${it.time}:00+07:00`; });
}
wedding.lunar = calendar.lunar;
// the main venue (reception if there is one) for places that show a single address
wedding.venue = (wedding.events.find((e) => e.id === 'reception') || wedding.events[0]).venue;

export const palette = palettes[wedding.palette];
