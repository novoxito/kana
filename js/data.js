// Kana database: basic gojūon + dakuten + handakuten + yōon + special
// Each tier is independently activatable. Existing exercises consume whatever is active.

const BASIC_ROWS = [
  { key: 'vowels', label: 'Vocales', tier: 'basic', chars: [
    ['a'], ['i'], ['u'], ['e'], ['o']
  ]},
  { key: 'k', label: 'K', tier: 'basic', chars: [
    ['ka'], ['ki'], ['ku'], ['ke'], ['ko']
  ]},
  { key: 's', label: 'S', tier: 'basic', chars: [
    ['sa'], ['shi','si'], ['su'], ['se'], ['so']
  ]},
  { key: 't', label: 'T', tier: 'basic', chars: [
    ['ta'], ['chi','ti'], ['tsu','tu'], ['te'], ['to']
  ]},
  { key: 'n', label: 'N', tier: 'basic', chars: [
    ['na'], ['ni'], ['nu'], ['ne'], ['no']
  ]},
  { key: 'h', label: 'H', tier: 'basic', chars: [
    ['ha'], ['hi'], ['fu','hu'], ['he'], ['ho']
  ]},
  { key: 'm', label: 'M', tier: 'basic', chars: [
    ['ma'], ['mi'], ['mu'], ['me'], ['mo']
  ]},
  { key: 'y', label: 'Y', tier: 'basic', chars: [
    ['ya'], null, ['yu'], null, ['yo']
  ]},
  { key: 'r', label: 'R', tier: 'basic', chars: [
    ['ra'], ['ri'], ['ru'], ['re'], ['ro']
  ]},
  { key: 'w', label: 'W', tier: 'basic', chars: [
    ['wa'], null, null, null, ['wo','o']
  ]},
  { key: 'nn', label: 'N', tier: 'basic', chars: [
    ['n','nn'], null, null, null, null
  ]},
];

const DAKUTEN_ROWS = [
  { key: 'g', label: 'G (dakuten)', tier: 'dakuten', chars: [
    ['ga'], ['gi'], ['gu'], ['ge'], ['go']
  ]},
  { key: 'z', label: 'Z (dakuten)', tier: 'dakuten', chars: [
    ['za'], ['ji','zi'], ['zu'], ['ze'], ['zo']
  ]},
  { key: 'd', label: 'D (dakuten)', tier: 'dakuten', chars: [
    ['da'], ['di','dji'], ['du','dzu'], ['de'], ['do']
  ]},
  { key: 'b', label: 'B (dakuten)', tier: 'dakuten', chars: [
    ['ba'], ['bi'], ['bu'], ['be'], ['bo']
  ]},
  { key: 'p', label: 'P (handakuten)', tier: 'handakuten', chars: [
    ['pa'], ['pi'], ['pu'], ['pe'], ['po']
  ]},
];

const YOON_ROWS = [
  { key: 'ky', label: 'Ky', tier: 'yoon', chars: [['kya'], null, ['kyu'], null, ['kyo']] },
  { key: 'sh', label: 'Sh', tier: 'yoon', chars: [['sha','sya'], null, ['shu','syu'], null, ['sho','syo']] },
  { key: 'ch', label: 'Ch', tier: 'yoon', chars: [['cha','tya','cya'], null, ['chu','tyu','cyu'], null, ['cho','tyo','cyo']] },
  { key: 'ny', label: 'Ny', tier: 'yoon', chars: [['nya'], null, ['nyu'], null, ['nyo']] },
  { key: 'hy', label: 'Hy', tier: 'yoon', chars: [['hya'], null, ['hyu'], null, ['hyo']] },
  { key: 'my', label: 'My', tier: 'yoon', chars: [['mya'], null, ['myu'], null, ['myo']] },
  { key: 'ry', label: 'Ry', tier: 'yoon', chars: [['rya'], null, ['ryu'], null, ['ryo']] },
  { key: 'gy', label: 'Gy', tier: 'yoon', chars: [['gya'], null, ['gyu'], null, ['gyo']] },
  { key: 'j', label: 'J', tier: 'yoon', chars: [['ja','jya','zya'], null, ['ju','jyu','zyu'], null, ['jo','jyo','zyo']] },
  { key: 'by', label: 'By', tier: 'yoon', chars: [['bya'], null, ['byu'], null, ['byo']] },
  { key: 'py', label: 'Py', tier: 'yoon', chars: [['pya'], null, ['pyu'], null, ['pyo']] },
];

const ALL_ROWS = [...BASIC_ROWS, ...DAKUTEN_ROWS, ...YOON_ROWS];

const HIRAGANA_MAP = {
  a:'あ', i:'い', u:'う', e:'え', o:'お',
  ka:'か', ki:'き', ku:'く', ke:'け', ko:'こ',
  sa:'さ', shi:'し', su:'す', se:'せ', so:'そ',
  ta:'た', chi:'ち', tsu:'つ', te:'て', to:'と',
  na:'な', ni:'に', nu:'ぬ', ne:'ね', no:'の',
  ha:'は', hi:'ひ', fu:'ふ', he:'へ', ho:'ほ',
  ma:'ま', mi:'み', mu:'む', me:'め', mo:'も',
  ya:'や', yu:'ゆ', yo:'よ',
  ra:'ら', ri:'り', ru:'る', re:'れ', ro:'ろ',
  wa:'わ', wo:'を', n:'ん',
  // dakuten
  ga:'が', gi:'ぎ', gu:'ぐ', ge:'げ', go:'ご',
  za:'ざ', ji:'じ', zu:'ず', ze:'ぜ', zo:'ぞ',
  da:'だ', di:'ぢ', du:'づ', de:'で', do:'ど',
  ba:'ば', bi:'び', bu:'ぶ', be:'べ', bo:'ぼ',
  // handakuten
  pa:'ぱ', pi:'ぴ', pu:'ぷ', pe:'ぺ', po:'ぽ',
  // yōon
  kya:'きゃ', kyu:'きゅ', kyo:'きょ',
  sha:'しゃ', shu:'しゅ', sho:'しょ',
  cha:'ちゃ', chu:'ちゅ', cho:'ちょ',
  nya:'にゃ', nyu:'にゅ', nyo:'にょ',
  hya:'ひゃ', hyu:'ひゅ', hyo:'ひょ',
  mya:'みゃ', myu:'みゅ', myo:'みょ',
  rya:'りゃ', ryu:'りゅ', ryo:'りょ',
  gya:'ぎゃ', gyu:'ぎゅ', gyo:'ぎょ',
  ja:'じゃ', ju:'じゅ', jo:'じょ',
  bya:'びゃ', byu:'びゅ', byo:'びょ',
  pya:'ぴゃ', pyu:'ぴゅ', pyo:'ぴょ',
};

const KATAKANA_MAP = {
  a:'ア', i:'イ', u:'ウ', e:'エ', o:'オ',
  ka:'カ', ki:'キ', ku:'ク', ke:'ケ', ko:'コ',
  sa:'サ', shi:'シ', su:'ス', se:'セ', so:'ソ',
  ta:'タ', chi:'チ', tsu:'ツ', te:'テ', to:'ト',
  na:'ナ', ni:'ニ', nu:'ヌ', ne:'ネ', no:'ノ',
  ha:'ハ', hi:'ヒ', fu:'フ', he:'ヘ', ho:'ホ',
  ma:'マ', mi:'ミ', mu:'ム', me:'メ', mo:'モ',
  ya:'ヤ', yu:'ユ', yo:'ヨ',
  ra:'ラ', ri:'リ', ru:'ル', re:'レ', ro:'ロ',
  wa:'ワ', wo:'ヲ', n:'ン',
  // dakuten
  ga:'ガ', gi:'ギ', gu:'グ', ge:'ゲ', go:'ゴ',
  za:'ザ', ji:'ジ', zu:'ズ', ze:'ゼ', zo:'ゾ',
  da:'ダ', di:'ヂ', du:'ヅ', de:'デ', do:'ド',
  ba:'バ', bi:'ビ', bu:'ブ', be:'ベ', bo:'ボ',
  // handakuten
  pa:'パ', pi:'ピ', pu:'プ', pe:'ペ', po:'ポ',
  // yōon
  kya:'キャ', kyu:'キュ', kyo:'キョ',
  sha:'シャ', shu:'シュ', sho:'ショ',
  cha:'チャ', chu:'チュ', cho:'チョ',
  nya:'ニャ', nyu:'ニュ', nyo:'ニョ',
  hya:'ヒャ', hyu:'ヒュ', hyo:'ヒョ',
  mya:'ミャ', myu:'ミュ', myo:'ミョ',
  rya:'リャ', ryu:'リュ', ryo:'リョ',
  gya:'ギャ', gyu:'ギュ', gyo:'ギョ',
  ja:'ジャ', ju:'ジュ', jo:'ジョ',
  bya:'ビャ', byu:'ビュ', byo:'ビョ',
  pya:'ピャ', pyu:'ピュ', pyo:'ピョ',
};

export const KANA = [];

for (const row of ALL_ROWS) {
  for (const entry of row.chars) {
    if (!entry) continue;
    const [canonical, ...alts] = entry;
    const allRomaji = [canonical, ...alts.filter(r => r !== canonical)];
    if (HIRAGANA_MAP[canonical]) {
      KANA.push({
        id: 'h_' + canonical,
        char: HIRAGANA_MAP[canonical],
        romaji: allRomaji,
        canonical,
        script: 'hiragana',
        group: row.key,
        groupLabel: row.label,
        tier: row.tier,
      });
    }
    if (KATAKANA_MAP[canonical]) {
      KANA.push({
        id: 'k_' + canonical,
        char: KATAKANA_MAP[canonical],
        romaji: allRomaji,
        canonical,
        script: 'katakana',
        group: row.key,
        groupLabel: row.label,
        tier: row.tier,
      });
    }
  }
}

export const KANA_BY_ID = Object.fromEntries(KANA.map(k => [k.id, k]));

// Reverse lookup: character → kana entry (for tokenizing words)
const CHAR_TO_KANA = {};
for (const k of KANA) {
  CHAR_TO_KANA[k.char] = k;
}

// Tokenize a katakana or hiragana string into kana entries.
// Handles 2-char yōon (e.g., "キャ") and recognizes ッ (sokuon) and ー (chōonpu).
export function tokenize(str) {
  const tokens = [];
  let i = 0;
  while (i < str.length) {
    // Try 2-char (yōon)
    if (i + 1 < str.length) {
      const two = str.slice(i, i + 2);
      if (CHAR_TO_KANA[two]) {
        tokens.push({ char: two, kana: CHAR_TO_KANA[two], special: null });
        i += 2;
        continue;
      }
    }
    const one = str[i];
    if (one === 'ッ' || one === 'っ') {
      tokens.push({ char: one, kana: null, special: 'sokuon' });
    } else if (one === 'ー') {
      tokens.push({ char: one, kana: null, special: 'chouonpu' });
    } else if (CHAR_TO_KANA[one]) {
      tokens.push({ char: one, kana: CHAR_TO_KANA[one], special: null });
    } else {
      tokens.push({ char: one, kana: null, special: 'unknown' });
    }
    i++;
  }
  return tokens;
}

// Returns the set of kana ids required to read this string. Special chars
// (ッ ー) don't require any kana — they only modify neighbors.
export function requiredKanaIds(str) {
  const ids = new Set();
  for (const t of tokenize(str)) {
    if (t.kana) ids.add(t.kana.id);
  }
  return ids;
}

// Tier groupings shown in settings UI.
export const TIERS = {
  basic:      { key: 'basic',      label: 'Básico',     rowsHira: BASIC_ROWS,    rowsKata: BASIC_ROWS },
  dakuten:    { key: 'dakuten',    label: 'Dakuten',    rowsHira: DAKUTEN_ROWS,  rowsKata: DAKUTEN_ROWS },
  yoon:       { key: 'yoon',       label: 'Yōon',       rowsHira: YOON_ROWS,     rowsKata: YOON_ROWS },
};

export const TIER_ORDER = ['basic', 'dakuten', 'yoon'];

// Build display grid for the settings UI.
export function buildSettingsGrid(script, tier) {
  const t = TIERS[tier];
  if (!t) return [];
  const rows = script === 'hiragana' ? t.rowsHira : t.rowsKata;
  return rows.map(g => ({
    key: g.key,
    label: g.label,
    cells: g.chars.map(slot => {
      if (!slot) return null;
      const canonical = slot[0];
      const prefix = script === 'hiragana' ? 'h_' : 'k_';
      return KANA_BY_ID[prefix + canonical] || null;
    }),
  }));
}
