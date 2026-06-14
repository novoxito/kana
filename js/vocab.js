// Vocab dataset: ~100 starter words across 12 themes.
// Each: jp (kana), ro (romaji), es (Spanish), theme, type (noun/verb/adj-i/adj-na/expr/num)

export const THEMES = {
  saludos:   { label: 'Saludos',       emoji: '👋' },
  familia:   { label: 'Familia',       emoji: '👪' },
  comida:    { label: 'Comida',        emoji: '🍱' },
  animales:  { label: 'Animales',      emoji: '🐶' },
  colores:   { label: 'Colores',       emoji: '🎨' },
  cuerpo:    { label: 'Cuerpo',        emoji: '👤' },
  numeros:   { label: 'Números',       emoji: '🔢' },
  tiempo:    { label: 'Tiempo',        emoji: '⏰' },
  lugares:   { label: 'Lugares',       emoji: '🏠' },
  verbos:    { label: 'Verbos',        emoji: '🏃' },
  adj_i:     { label: 'Adjetivos い',   emoji: 'い' },
  adj_na:    { label: 'Adjetivos な',   emoji: 'な' },
};

export const THEME_ORDER = ['saludos','familia','comida','animales','colores','cuerpo','numeros','tiempo','lugares','verbos','adj_i','adj_na'];

const RAW = [
  // SALUDOS
  ['こんにちは', 'konnichiwa', 'hola (durante el día)', 'saludos', 'expr'],
  ['おはよう', 'ohayou', 'buenos días', 'saludos', 'expr'],
  ['こんばんは', 'konbanwa', 'buenas tardes/noches', 'saludos', 'expr'],
  ['さようなら', 'sayounara', 'adiós', 'saludos', 'expr'],
  ['ありがとう', 'arigatou', 'gracias', 'saludos', 'expr'],
  ['すみません', 'sumimasen', 'perdón / disculpa', 'saludos', 'expr'],
  ['はい', 'hai', 'sí', 'saludos', 'expr'],
  ['いいえ', 'iie', 'no', 'saludos', 'expr'],
  ['おやすみ', 'oyasumi', 'buenas noches (al dormir)', 'saludos', 'expr'],

  // FAMILIA
  ['ちち', 'chichi', 'padre (propio)', 'familia', 'noun'],
  ['はは', 'haha', 'madre (propia)', 'familia', 'noun'],
  ['あに', 'ani', 'hermano mayor', 'familia', 'noun'],
  ['あね', 'ane', 'hermana mayor', 'familia', 'noun'],
  ['おとうと', 'otouto', 'hermano menor', 'familia', 'noun'],
  ['いもうと', 'imouto', 'hermana menor', 'familia', 'noun'],
  ['かぞく', 'kazoku', 'familia', 'familia', 'noun'],
  ['こども', 'kodomo', 'niño/a', 'familia', 'noun'],
  ['ともだち', 'tomodachi', 'amigo/a', 'familia', 'noun'],

  // COMIDA
  ['みず', 'mizu', 'agua', 'comida', 'noun'],
  ['ごはん', 'gohan', 'arroz / comida', 'comida', 'noun'],
  ['パン', 'pan', 'pan', 'comida', 'noun'],
  ['にく', 'niku', 'carne', 'comida', 'noun'],
  ['さかな', 'sakana', 'pescado', 'comida', 'noun'],
  ['たまご', 'tamago', 'huevo', 'comida', 'noun'],
  ['やさい', 'yasai', 'verdura', 'comida', 'noun'],
  ['くだもの', 'kudamono', 'fruta', 'comida', 'noun'],
  ['おちゃ', 'ocha', 'té', 'comida', 'noun'],
  ['コーヒー', 'koohii', 'café', 'comida', 'noun'],
  ['ぎゅうにゅう', 'gyuunyuu', 'leche', 'comida', 'noun'],
  ['りんご', 'ringo', 'manzana', 'comida', 'noun'],

  // ANIMALES
  ['いぬ', 'inu', 'perro', 'animales', 'noun'],
  ['ねこ', 'neko', 'gato', 'animales', 'noun'],
  ['とり', 'tori', 'pájaro', 'animales', 'noun'],
  ['うま', 'uma', 'caballo', 'animales', 'noun'],
  ['うし', 'ushi', 'vaca', 'animales', 'noun'],
  ['ぶた', 'buta', 'cerdo', 'animales', 'noun'],
  ['うさぎ', 'usagi', 'conejo', 'animales', 'noun'],
  ['くま', 'kuma', 'oso', 'animales', 'noun'],
  ['さる', 'saru', 'mono', 'animales', 'noun'],

  // COLORES
  ['あか', 'aka', 'rojo', 'colores', 'noun'],
  ['あお', 'ao', 'azul', 'colores', 'noun'],
  ['しろ', 'shiro', 'blanco', 'colores', 'noun'],
  ['くろ', 'kuro', 'negro', 'colores', 'noun'],
  ['きいろ', 'kiiro', 'amarillo', 'colores', 'noun'],
  ['みどり', 'midori', 'verde', 'colores', 'noun'],
  ['むらさき', 'murasaki', 'morado', 'colores', 'noun'],
  ['ちゃいろ', 'chairo', 'marrón', 'colores', 'noun'],
  ['オレンジ', 'orenji', 'naranja', 'colores', 'noun'],
  ['ピンク', 'pinku', 'rosa', 'colores', 'noun'],

  // CUERPO
  ['あたま', 'atama', 'cabeza', 'cuerpo', 'noun'],
  ['め', 'me', 'ojo', 'cuerpo', 'noun'],
  ['みみ', 'mimi', 'oreja', 'cuerpo', 'noun'],
  ['はな', 'hana', 'nariz', 'cuerpo', 'noun'],
  ['くち', 'kuchi', 'boca', 'cuerpo', 'noun'],
  ['て', 'te', 'mano', 'cuerpo', 'noun'],
  ['あし', 'ashi', 'pie / pierna', 'cuerpo', 'noun'],
  ['かみ', 'kami', 'pelo', 'cuerpo', 'noun'],
  ['は', 'ha', 'diente', 'cuerpo', 'noun'],

  // NÚMEROS
  ['いち', 'ichi', 'uno', 'numeros', 'num'],
  ['に', 'ni', 'dos', 'numeros', 'num'],
  ['さん', 'san', 'tres', 'numeros', 'num'],
  ['よん', 'yon', 'cuatro', 'numeros', 'num'],
  ['ご', 'go', 'cinco', 'numeros', 'num'],
  ['ろく', 'roku', 'seis', 'numeros', 'num'],
  ['なな', 'nana', 'siete', 'numeros', 'num'],
  ['はち', 'hachi', 'ocho', 'numeros', 'num'],
  ['きゅう', 'kyuu', 'nueve', 'numeros', 'num'],
  ['じゅう', 'juu', 'diez', 'numeros', 'num'],

  // TIEMPO
  ['きょう', 'kyou', 'hoy', 'tiempo', 'noun'],
  ['あした', 'ashita', 'mañana (día)', 'tiempo', 'noun'],
  ['きのう', 'kinou', 'ayer', 'tiempo', 'noun'],
  ['あさ', 'asa', 'mañana (parte del día)', 'tiempo', 'noun'],
  ['ひる', 'hiru', 'mediodía', 'tiempo', 'noun'],
  ['よる', 'yoru', 'noche', 'tiempo', 'noun'],
  ['いま', 'ima', 'ahora', 'tiempo', 'noun'],
  ['まいにち', 'mainichi', 'todos los días', 'tiempo', 'noun'],

  // LUGARES
  ['いえ', 'ie', 'casa', 'lugares', 'noun'],
  ['うち', 'uchi', 'casa (propia)', 'lugares', 'noun'],
  ['がっこう', 'gakkou', 'escuela', 'lugares', 'noun'],
  ['みせ', 'mise', 'tienda', 'lugares', 'noun'],
  ['えき', 'eki', 'estación (tren)', 'lugares', 'noun'],
  ['びょういん', 'byouin', 'hospital', 'lugares', 'noun'],
  ['こうえん', 'kouen', 'parque', 'lugares', 'noun'],
  ['みち', 'michi', 'camino / calle', 'lugares', 'noun'],
  ['へや', 'heya', 'habitación', 'lugares', 'noun'],

  // VERBOS (dictionary form)
  ['たべる', 'taberu', 'comer', 'verbos', 'verb'],
  ['のむ', 'nomu', 'beber', 'verbos', 'verb'],
  ['みる', 'miru', 'ver / mirar', 'verbos', 'verb'],
  ['きく', 'kiku', 'escuchar', 'verbos', 'verb'],
  ['いく', 'iku', 'ir', 'verbos', 'verb'],
  ['くる', 'kuru', 'venir', 'verbos', 'verb'],
  ['する', 'suru', 'hacer', 'verbos', 'verb'],
  ['はなす', 'hanasu', 'hablar', 'verbos', 'verb'],
  ['よむ', 'yomu', 'leer', 'verbos', 'verb'],
  ['かく', 'kaku', 'escribir', 'verbos', 'verb'],
  ['ねる', 'neru', 'dormir', 'verbos', 'verb'],
  ['おきる', 'okiru', 'despertarse', 'verbos', 'verb'],
  ['かう', 'kau', 'comprar', 'verbos', 'verb'],

  // ADJETIVOS い
  ['おおきい', 'ookii', 'grande', 'adj_i', 'adj-i'],
  ['ちいさい', 'chiisai', 'pequeño', 'adj_i', 'adj-i'],
  ['たかい', 'takai', 'alto / caro', 'adj_i', 'adj-i'],
  ['ひくい', 'hikui', 'bajo', 'adj_i', 'adj-i'],
  ['やすい', 'yasui', 'barato', 'adj_i', 'adj-i'],
  ['あつい', 'atsui', 'caliente', 'adj_i', 'adj-i'],
  ['さむい', 'samui', 'frío (clima)', 'adj_i', 'adj-i'],
  ['つめたい', 'tsumetai', 'frío (al tacto)', 'adj_i', 'adj-i'],
  ['あたらしい', 'atarashii', 'nuevo', 'adj_i', 'adj-i'],
  ['ふるい', 'furui', 'viejo', 'adj_i', 'adj-i'],
  ['はやい', 'hayai', 'rápido', 'adj_i', 'adj-i'],
  ['おそい', 'osoi', 'lento', 'adj_i', 'adj-i'],
  ['いい', 'ii', 'bueno', 'adj_i', 'adj-i'],
  ['わるい', 'warui', 'malo', 'adj_i', 'adj-i'],
  ['おいしい', 'oishii', 'rico / delicioso', 'adj_i', 'adj-i'],
  ['むずかしい', 'muzukashii', 'difícil', 'adj_i', 'adj-i'],
  ['やさしい', 'yasashii', 'fácil / amable', 'adj_i', 'adj-i'],
  ['たのしい', 'tanoshii', 'divertido', 'adj_i', 'adj-i'],

  // ADJETIVOS な
  ['しずか', 'shizuka', 'tranquilo / silencioso', 'adj_na', 'adj-na'],
  ['にぎやか', 'nigiyaka', 'animado / bullicioso', 'adj_na', 'adj-na'],
  ['きれい', 'kirei', 'bonito / limpio', 'adj_na', 'adj-na'],
  ['げんき', 'genki', 'sano / animado', 'adj_na', 'adj-na'],
  ['ゆうめい', 'yuumei', 'famoso', 'adj_na', 'adj-na'],
  ['べんり', 'benri', 'cómodo / práctico', 'adj_na', 'adj-na'],
  ['しんせつ', 'shinsetsu', 'amable', 'adj_na', 'adj-na'],
  ['すき', 'suki', 'gustar', 'adj_na', 'adj-na'],
  ['きらい', 'kirai', 'odiar / no gustar', 'adj_na', 'adj-na'],
  ['ひま', 'hima', 'libre (de tiempo)', 'adj_na', 'adj-na'],
  ['たいへん', 'taihen', 'duro / pesado', 'adj_na', 'adj-na'],
  ['だいじょうぶ', 'daijoubu', 'estar bien / OK', 'adj_na', 'adj-na'],
];

export const VOCAB = RAW.map((row, i) => ({
  id: 'v' + i,
  jp: row[0],
  ro: row[1],
  es: row[2],
  theme: row[3],
  type: row[4],
}));

export const VOCAB_BY_ID = Object.fromEntries(VOCAB.map(w => [w.id, w]));

export function vocabInThemes(themeSet) {
  return VOCAB.filter(w => themeSet.has(w.theme));
}

export function vocabByTheme(theme) {
  return VOCAB.filter(w => w.theme === theme);
}

export function typeLabel(t) {
  return { 'noun': 'sust.', 'verb': 'verbo', 'adj-i': 'adj. い', 'adj-na': 'adj. な', 'expr': 'expr.', 'num': 'núm.' }[t] || t;
}
