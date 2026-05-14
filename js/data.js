// Gojūon básico - 46 hiragana + 46 katakana
// romaji is an array: first entry is canonical, rest are accepted alternatives

const ROWS = [
  { key: 'vowels', label: 'Vocales', chars: [
    ['a','a'], ['i','i'], ['u','u'], ['e','e'], ['o','o']
  ]},
  { key: 'k', label: 'K', chars: [
    ['ka','ka'], ['ki','ki'], ['ku','ku'], ['ke','ke'], ['ko','ko']
  ]},
  { key: 's', label: 'S', chars: [
    ['sa','sa'], ['shi','shi','si'], ['su','su'], ['se','se'], ['so','so']
  ]},
  { key: 't', label: 'T', chars: [
    ['ta','ta'], ['chi','chi','ti'], ['tsu','tsu','tu'], ['te','te'], ['to','to']
  ]},
  { key: 'n', label: 'N', chars: [
    ['na','na'], ['ni','ni'], ['nu','nu'], ['ne','ne'], ['no','no']
  ]},
  { key: 'h', label: 'H', chars: [
    ['ha','ha'], ['hi','hi'], ['fu','fu','hu'], ['he','he'], ['ho','ho']
  ]},
  { key: 'm', label: 'M', chars: [
    ['ma','ma'], ['mi','mi'], ['mu','mu'], ['me','me'], ['mo','mo']
  ]},
  { key: 'y', label: 'Y', chars: [
    ['ya','ya'], null, ['yu','yu'], null, ['yo','yo']
  ]},
  { key: 'r', label: 'R', chars: [
    ['ra','ra'], ['ri','ri'], ['ru','ru'], ['re','re'], ['ro','ro']
  ]},
  { key: 'w', label: 'W', chars: [
    ['wa','wa'], null, null, null, ['wo','wo','o']
  ]},
  { key: 'special', label: 'N', chars: [
    ['n','n','nn'], null, null, null, null
  ]},
];

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
  wa:'わ', wo:'を',
  n:'ん'
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
  wa:'ワ', wo:'ヲ',
  n:'ン'
};

export const KANA = [];

for (const row of ROWS) {
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
      });
    }
  }
}

export const KANA_BY_ID = Object.fromEntries(KANA.map(k => [k.id, k]));

export const GROUPS = ROWS.map(r => ({ key: r.key, label: r.label, slots: r.chars }));

// Build display grid: for each group, two parallel rows (hiragana + katakana) by slot.
export function buildSettingsGrid(script) {
  return GROUPS.map(g => ({
    key: g.key,
    label: g.label,
    cells: g.slots.map(slot => {
      if (!slot) return null;
      const canonical = slot[0];
      const prefix = script === 'hiragana' ? 'h_' : 'k_';
      return KANA_BY_ID[prefix + canonical] || null;
    }),
  }));
}
