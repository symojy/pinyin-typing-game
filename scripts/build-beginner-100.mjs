/**
 * 入門 100 語を生成（beginner-100-slot-plan.md の字数・カテゴリ割当に準拠）
 * 方針: 口語頻度（SUBTLEX-CH 系の「会話に出やすい語」イメージ）＋ HSK1 前後の核語彙
 * 中級: questions-intermediate.json と漢字列（hanzi 連結）が一致する語は除外
 *
 * Run: node scripts/build-beginner-100.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** @type {{ hanzi: string[]; pinyin: string[]; tones: number[] }[]} */
const WORDS = [
  // 1 代名・呼びかけ 1字×3
  { hanzi: ['我'], pinyin: ['wo'], tones: [3] },
  { hanzi: ['你'], pinyin: ['ni'], tones: [3] },
  { hanzi: ['他'], pinyin: ['ta'], tones: [1] },
  // 2字×7
  { hanzi: ['我', '们'], pinyin: ['wo', 'men'], tones: [3, 0] },
  { hanzi: ['你', '们'], pinyin: ['ni', 'men'], tones: [3, 0] },
  { hanzi: ['他', '们'], pinyin: ['ta', 'men'], tones: [1, 0] },
  { hanzi: ['这', '个'], pinyin: ['zhe', 'ge'], tones: [4, 0] },
  { hanzi: ['那', '个'], pinyin: ['na', 'ge'], tones: [4, 0] },
  { hanzi: ['什', '么'], pinyin: ['shen', 'me'], tones: [2, 0] },
  { hanzi: ['人'], pinyin: ['ren'], tones: [2] },
  // 11 判断 1字×4
  { hanzi: ['是'], pinyin: ['shi'], tones: [4] },
  { hanzi: ['不'], pinyin: ['bu'], tones: [4] },
  { hanzi: ['没'], pinyin: ['mei'], tones: [2] },
  { hanzi: ['有'], pinyin: ['you'], tones: [3] },
  // 2字×4
  { hanzi: ['不', '是'], pinyin: ['bu', 'shi'], tones: [2, 4] },
  { hanzi: ['没', '有'], pinyin: ['mei', 'you'], tones: [2, 3] },
  { hanzi: ['行', '吗'], pinyin: ['xing', 'ma'], tones: [2, 0] },
  { hanzi: ['可', '以'], pinyin: ['ke', 'yi'], tones: [3, 3] },
  // 19 数量 1字×7
  { hanzi: ['一'], pinyin: ['yi'], tones: [1] },
  { hanzi: ['二'], pinyin: ['er'], tones: [4] },
  { hanzi: ['三'], pinyin: ['san'], tones: [1] },
  { hanzi: ['四'], pinyin: ['si'], tones: [4] },
  { hanzi: ['五'], pinyin: ['wu'], tones: [3] },
  { hanzi: ['六'], pinyin: ['liu'], tones: [4] },
  { hanzi: ['几'], pinyin: ['ji'], tones: [3] },
  { hanzi: ['多', '少'], pinyin: ['duo', 'shao'], tones: [1, 3] },
  { hanzi: ['几', '个'], pinyin: ['ji', 'ge'], tones: [3, 0] },
  { hanzi: ['第', '一', '次'], pinyin: ['di', 'yi', 'ci'], tones: [4, 1, 4] },
  // 29 時・場 1字×2
  { hanzi: ['上'], pinyin: ['shang'], tones: [4] },
  { hanzi: ['下'], pinyin: ['xia'], tones: [4] },
  { hanzi: ['上', '午'], pinyin: ['shang', 'wu'], tones: [4, 3] },
  { hanzi: ['下', '午'], pinyin: ['xia', 'wu'], tones: [4, 3] },
  { hanzi: ['晚', '上'], pinyin: ['wan', 'shang'], tones: [3, 0] },
  { hanzi: ['家', '里'], pinyin: ['jia', 'li'], tones: [1, 3] },
  { hanzi: ['国', '内'], pinyin: ['guo', 'nei'], tones: [2, 4] },
  { hanzi: ['这', '边'], pinyin: ['zhe', 'bian'], tones: [4, 1] },
  { hanzi: ['楼', '上'], pinyin: ['lou', 'shang'], tones: [2, 4] },
  { hanzi: ['怎', '么', '样'], pinyin: ['zen', 'me', 'yang'], tones: [3, 0, 4] },
  { hanzi: ['为', '什', '么'], pinyin: ['wei', 'shen', 'me'], tones: [4, 2, 0] },
  { hanzi: ['在', '哪', '儿'], pinyin: ['zai', 'na', 'er'], tones: [4, 3, 2] },
  // 41 動作 1字×4
  { hanzi: ['来'], pinyin: ['lai'], tones: [2] },
  { hanzi: ['吃'], pinyin: ['chi'], tones: [1] },
  { hanzi: ['看'], pinyin: ['kan'], tones: [4] },
  { hanzi: ['学', '习'], pinyin: ['xue', 'xi'], tones: [2, 2] },
  { hanzi: ['工', '作'], pinyin: ['gong', 'zuo'], tones: [1, 4] },
  { hanzi: ['走', '路'], pinyin: ['zou', 'lu'], tones: [3, 4] },
  { hanzi: ['回', '家'], pinyin: ['hui', 'jia'], tones: [2, 1] },
  { hanzi: ['写', '字'], pinyin: ['xie', 'zi'], tones: [3, 4] },
  { hanzi: ['说', '话'], pinyin: ['shuo', 'hua'], tones: [1, 4] },
  { hanzi: ['喝', '茶'], pinyin: ['he', 'cha'], tones: [1, 2] },
  { hanzi: ['开', '门'], pinyin: ['kai', 'men'], tones: [1, 2] },
  { hanzi: ['去', '看'], pinyin: ['qu', 'kan'], tones: [4, 4] },
  { hanzi: ['出', '去'], pinyin: ['chu', 'qu'], tones: [1, 4] },
  { hanzi: ['去', '吃', '饭'], pinyin: ['qu', 'chi', 'fan'], tones: [4, 1, 4] },
  // 55 性状 1字×3
  { hanzi: ['好'], pinyin: ['hao'], tones: [3] },
  { hanzi: ['大'], pinyin: ['da'], tones: [4] },
  { hanzi: ['小'], pinyin: ['xiao'], tones: [3] },
  { hanzi: ['很', '大'], pinyin: ['hen', 'da'], tones: [3, 4] },
  { hanzi: ['很', '小'], pinyin: ['hen', 'xiao'], tones: [3, 3] },
  { hanzi: ['很', '多'], pinyin: ['hen', 'duo'], tones: [3, 1] },
  { hanzi: ['太', '忙'], pinyin: ['tai', 'mang'], tones: [4, 2] },
  { hanzi: ['一', '样'], pinyin: ['yi', 'yang'], tones: [2, 4] },
  // 63 接続 1字×5
  { hanzi: ['吗'], pinyin: ['ma'], tones: [0] },
  { hanzi: ['呢'], pinyin: ['ne'], tones: [0] },
  { hanzi: ['吧'], pinyin: ['ba'], tones: [0] },
  { hanzi: ['了'], pinyin: ['le'], tones: [0] },
  { hanzi: ['就'], pinyin: ['jiu'], tones: [4] },
  { hanzi: ['如', '果'], pinyin: ['ru', 'guo'], tones: [2, 3] },
  { hanzi: ['或', '者'], pinyin: ['huo', 'zhe'], tones: [4, 3] },
  { hanzi: ['而', '且'], pinyin: ['er', 'qie'], tones: [2, 3] },
  { hanzi: ['不', '过'], pinyin: ['bu', 'guo'], tones: [2, 4] },
  { hanzi: ['可', '是'], pinyin: ['ke', 'shi'], tones: [3, 4] },
  { hanzi: ['是', '不', '是'], pinyin: ['shi', 'bu', 'shi'], tones: [4, 2, 4] },
  { hanzi: ['要', '不', '要'], pinyin: ['yao', 'bu', 'yao'], tones: [4, 2, 4] },
  // 75 名物 2字×16
  { hanzi: ['妈', '妈'], pinyin: ['ma', 'ma'], tones: [1, 0] },
  { hanzi: ['爸', '爸'], pinyin: ['ba', 'ba'], tones: [4, 0] },
  { hanzi: ['孩', '子'], pinyin: ['hai', 'zi'], tones: [2, 0] },
  { hanzi: ['老', '师'], pinyin: ['lao', 'shi'], tones: [3, 1] },
  { hanzi: ['学', '生'], pinyin: ['xue', 'sheng'], tones: [2, 1] },
  { hanzi: ['学', '校'], pinyin: ['xue', 'xiao'], tones: [2, 4] },
  { hanzi: ['中', '国'], pinyin: ['zhong', 'guo'], tones: [1, 2] },
  { hanzi: ['北', '京'], pinyin: ['bei', 'jing'], tones: [3, 1] },
  { hanzi: ['上', '海'], pinyin: ['shang', 'hai'], tones: [4, 3] },
  { hanzi: ['名', '字'], pinyin: ['ming', 'zi'], tones: [2, 0] },
  { hanzi: ['电', '话'], pinyin: ['dian', 'hua'], tones: [4, 4] },
  { hanzi: ['身', '体'], pinyin: ['shen', 'ti'], tones: [1, 3] },
  { hanzi: ['眼', '睛'], pinyin: ['yan', 'jing'], tones: [3, 0] },
  { hanzi: ['书', '包'], pinyin: ['shu', 'bao'], tones: [1, 1] },
  { hanzi: ['手', '机'], pinyin: ['shou', 'ji'], tones: [3, 1] },
  { hanzi: ['超', '市'], pinyin: ['chao', 'shi'], tones: [1, 4] },
  { hanzi: ['小', '学', '生'], pinyin: ['xiao', 'xue', 'sheng'], tones: [3, 2, 1] },
  { hanzi: ['中', '国', '人'], pinyin: ['zhong', 'guo', 'ren'], tones: [1, 2, 2] },
  // 93 挨拶
  { hanzi: ['谢', '谢'], pinyin: ['xie', 'xie'], tones: [4, 0] },
  { hanzi: ['你', '好'], pinyin: ['ni', 'hao'], tones: [3, 3] },
  { hanzi: ['再', '见'], pinyin: ['zai', 'jian'], tones: [4, 4] },
  { hanzi: ['早', '上', '好'], pinyin: ['zao', 'shang', 'hao'], tones: [3, 0, 3] },
  { hanzi: ['晚', '上', '好'], pinyin: ['wan', 'shang', 'hao'], tones: [3, 0, 3] },
  { hanzi: ['大', '家', '好'], pinyin: ['da', 'jia', 'hao'], tones: [4, 1, 3] },
  { hanzi: ['不', '用', '客', '气'], pinyin: ['bu', 'yong', 'ke', 'qi'], tones: [2, 4, 4, 0] },
  { hanzi: ['请', '多', '关', '照'], pinyin: ['qing', 'duo', 'guan', 'zhao'], tones: [3, 1, 1, 1] },
];

function main() {
  const intPath = path.join(root, 'data/questions-intermediate.json');
  const intermediate = JSON.parse(fs.readFileSync(intPath, 'utf8'));
  const intSet = new Set(intermediate.map((q) => q.hanzi.join('')));

  if (WORDS.length !== 100) {
    console.error('Expected 100 words, got', WORDS.length);
    process.exit(1);
  }

  const seen = new Set();
  const errors = [];

  for (const w of WORDS) {
    const compound = w.hanzi.join('');
    const key = compound + '|' + w.pinyin.join(' ');
    if (seen.has(key)) errors.push('duplicate ' + key);
    seen.add(key);
    if (intSet.has(compound)) errors.push('in intermediate: ' + compound);
    if (w.hanzi.length !== w.pinyin.length || w.hanzi.length !== w.tones.length) {
      errors.push('length ' + compound);
    }
  }

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  const outPath = path.join(root, 'data/questions-beginner.json');
  fs.writeFileSync(outPath, JSON.stringify(WORDS, null, 2) + '\n', 'utf8');
  console.log('OK:', WORDS.length, '→', path.relative(root, outPath));
}

main();
