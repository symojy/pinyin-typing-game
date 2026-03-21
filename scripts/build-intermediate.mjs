/**
 * @deprecated 中級は `build-intermediate-200.mjs` に移行しました（入門と別リスト 200 語）。
 * このスクリプトは過去のマージ用です。`npm run build:intermediate` は新スクリプトを呼びます。
 *
 * Regenerates data/questions-intermediate.json:
 * - Deduped existing intermediate (by hanzi|pinyin)
 * - All beginner words not yet in that set
 * - Plus supplemental entries (HSK-style phrases, longer words)
 *
 * Run: node scripts/build-intermediate.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const key = (q) => q.hanzi.join('') + '|' + q.pinyin.join(' ');

/** @type {import('../data/questions-beginner.json')} */
const beginner = JSON.parse(
  fs.readFileSync(path.join(root, 'data/questions-beginner.json'), 'utf8'),
);
/** @type {typeof beginner} */
const prevIntermediate = JSON.parse(
  fs.readFileSync(path.join(root, 'data/questions-intermediate.json'), 'utf8'),
);

/** New vocabulary (avoid overlap with questions-beginner.json); user can review/edit. */
const supplement = [
  { hanzi: ['朋', '友'], pinyin: ['peng', 'you'], tones: [2, 0] },
  { hanzi: ['今', '天'], pinyin: ['jin', 'tian'], tones: [1, 1] },
  { hanzi: ['明', '天'], pinyin: ['ming', 'tian'], tones: [2, 1] },
  { hanzi: ['昨', '天'], pinyin: ['zuo', 'tian'], tones: [2, 1] },
  { hanzi: ['对', '不', '起'], pinyin: ['dui', 'bu', 'qi'], tones: [4, 4, 3] },
  { hanzi: ['没', '关', '系'], pinyin: ['mei', 'guan', 'xi'], tones: [2, 1, 4] },
  { hanzi: ['卫', '生', '间'], pinyin: ['wei', 'sheng', 'jian'], tones: [4, 1, 1] },
  { hanzi: ['火', '车', '站'], pinyin: ['huo', 'che', 'zhan'], tones: [3, 1, 4] },
  { hanzi: ['飞', '机', '场'], pinyin: ['fei', 'ji', 'chang'], tones: [1, 1, 3] },
  { hanzi: ['公', '交', '车'], pinyin: ['gong', 'jiao', 'che'], tones: [1, 1, 1] },
  { hanzi: ['地', '铁', '站'], pinyin: ['di', 'tie', 'zhan'], tones: [4, 3, 4] },
  { hanzi: ['公', '园'], pinyin: ['gong', 'yuan'], tones: [1, 2] },
  { hanzi: ['体', '育', '馆'], pinyin: ['ti', 'yu', 'guan'], tones: [3, 4, 3] },
  { hanzi: ['冰', '淇', '淋'], pinyin: ['bing', 'qi', 'lin'], tones: [1, 2, 2] },
  { hanzi: ['巧', '克', '力'], pinyin: ['qiao', 'ke', 'li'], tones: [3, 3, 3] },
  { hanzi: ['圣', '诞', '节'], pinyin: ['sheng', 'dan', 'jie'], tones: [4, 4, 2] },
  { hanzi: ['情', '人', '节'], pinyin: ['qing', 'ren', 'jie'], tones: [2, 2, 2] },
  { hanzi: ['我', '爱', '你'], pinyin: ['wo', 'ai', 'ni'], tones: [3, 4, 3] },
  { hanzi: ['多', '少', '钱'], pinyin: ['duo', 'shao', 'qian'], tones: [1, 3, 2] },
  { hanzi: ['听', '不', '懂'], pinyin: ['ting', 'bu', 'dong'], tones: [1, 4, 3] },
  { hanzi: ['请', '稍', '等'], pinyin: ['qing', 'shao', 'deng'], tones: [3, 1, 3] },
  { hanzi: ['加', '油'], pinyin: ['jia', 'you'], tones: [1, 2] },
  { hanzi: ['注', '意'], pinyin: ['zhu', 'yi'], tones: [4, 4] },
  { hanzi: ['信', '号', '灯'], pinyin: ['xin', 'hao', 'deng'], tones: [4, 4, 1] },
  { hanzi: ['红', '绿', '灯'], pinyin: ['hong', 'lv', 'deng'], tones: [2, 4, 1] },
  { hanzi: ['人', '行', '道'], pinyin: ['ren', 'xing', 'dao'], tones: [2, 2, 4] },
  { hanzi: ['斑', '马', '线'], pinyin: ['ban', 'ma', 'xian'], tones: [1, 3, 4] },
  { hanzi: ['作', '业'], pinyin: ['zuo', 'ye'], tones: [4, 4] },
  { hanzi: ['考', '试'], pinyin: ['kao', 'shi'], tones: [3, 4] },
  { hanzi: ['护', '照'], pinyin: ['hu', 'zhao'], tones: [4, 4] },
  { hanzi: ['签', '证'], pinyin: ['qian', 'zheng'], tones: [1, 4] },
  { hanzi: ['行', '李', '箱'], pinyin: ['xing', 'li', 'xiang'], tones: [2, 3, 1] },
  { hanzi: ['登', '机', '牌'], pinyin: ['deng', 'ji', 'pai'], tones: [1, 3, 2] },
  { hanzi: ['身', '份', '证'], pinyin: ['shen', 'fen', 'zheng'], tones: [1, 4, 4] },
  { hanzi: ['地', '图'], pinyin: ['di', 'tu'], tones: [4, 2] },
  { hanzi: ['路', '线'], pinyin: ['lu', 'xian'], tones: [4, 4] },
  { hanzi: ['火', '车', '票'], pinyin: ['huo', 'che', 'piao'], tones: [3, 3, 4] },
  { hanzi: ['地', '铁', '票'], pinyin: ['di', 'tie', 'piao'], tones: [4, 3, 4] },
  { hanzi: ['旅', '行', '社'], pinyin: ['lv', 'xing', 'she'], tones: [3, 2, 4] },
  { hanzi: ['导', '游'], pinyin: ['dao', 'you'], tones: [3, 2] },
  { hanzi: ['警', '察', '局'], pinyin: ['jing', 'cha', 'ju'], tones: [3, 2, 2] },
  { hanzi: ['便', '利', '店'], pinyin: ['bian', 'li', 'dian'], tones: [4, 4, 4] },
  { hanzi: ['电', '梯'], pinyin: ['dian', 'ti'], tones: [4, 1] },
  { hanzi: ['楼', '梯'], pinyin: ['lou', 'ti'], tones: [2, 1] },
  { hanzi: ['密', '码'], pinyin: ['mi', 'ma'], tones: [4, 3] },
  { hanzi: ['大', '使', '馆'], pinyin: ['da', 'shi', 'guan'], tones: [4, 3, 3] },
  { hanzi: ['欢', '迎'], pinyin: ['huan', 'ying'], tones: [1, 2] },
  { hanzi: ['介', '绍'], pinyin: ['jie', 'shao'], tones: [4, 4] },
  { hanzi: ['菜', '单'], pinyin: ['cai', 'dan'], tones: [4, 4] },
  { hanzi: ['发', '票'], pinyin: ['fa', 'piao'], tones: [1, 4] },
  { hanzi: ['收', '据'], pinyin: ['shou', 'ju'], tones: [1, 4] },
  { hanzi: ['打', '折'], pinyin: ['da', 'zhe'], tones: [3, 2] },
  { hanzi: ['排', '队'], pinyin: ['pai', 'dui'], tones: [2, 4] },
  { hanzi: ['预', '约'], pinyin: ['yu', 'yue'], tones: [4, 4] },
  { hanzi: ['洗', '手', '间'], pinyin: ['xi', 'shou', 'jian'], tones: [3, 3, 1] },
  { hanzi: ['出', '租', '车'], pinyin: ['chu', 'zu', 'che'], tones: [1, 1, 1] },
  { hanzi: ['单', '人', '床'], pinyin: ['dan', 'ren', 'chuang'], tones: [1, 2, 2] },
  { hanzi: ['双', '人', '床'], pinyin: ['shuang', 'ren', 'chuang'], tones: [1, 2, 2] },
];

const out = [];
const seen = new Set();

for (const q of prevIntermediate) {
  const k = key(q);
  if (seen.has(k)) continue;
  seen.add(k);
  out.push(q);
}

for (const q of beginner) {
  const k = key(q);
  if (seen.has(k)) continue;
  seen.add(k);
  out.push(q);
}

for (const q of supplement) {
  const k = key(q);
  if (seen.has(k)) {
    console.warn('skip duplicate supplement:', k);
    continue;
  }
  seen.add(k);
  out.push(q);
}

const outPath = path.join(root, 'data/questions-intermediate.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('Wrote', out.length, 'items to', path.relative(root, outPath));
