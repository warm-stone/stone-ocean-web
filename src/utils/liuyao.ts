/**
 * 六爻起卦 / 装卦 / 断卦辅助 — 纯逻辑模块（不依赖 DOM）
 *
 * 规则依据（传统京房纳甲筮法）：
 * 1. 铜钱起卦：三枚铜钱，字面(正)记 2、背面(花)记 3。
 *    三背=9 老阳(动) | 二背一字=8 少阴(静) | 一背二字=7 少阳(静) | 三字=6 老阴(动)。
 *    自下而上摇六次成卦；老阳变阴、老阴变阳得变卦。
 * 2. 八宫纳甲：六十四卦分八宫（乾坤震巽坎离艮兑），依八宫次序定世应；
 *    纳甲歌诀 配天干地支；以卦宫五行为"我"定六亲；以日干起六神。
 * 3. 时间：年柱以立春为界、月柱以节气约界（近似），日柱精确（儒略日公式），
 *    时柱五鼠遁；余气旬空、月破、日冲、日合、旺相休囚死。
 */

// ---------- 基础表 ----------

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
export type Stem = (typeof STEMS)[number]

export const BRANCHES = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
] as const
export type Branch = (typeof BRANCHES)[number]

export const ELEMENTS = ['木', '火', '土', '金', '水'] as const
export type ElementName = (typeof ELEMENTS)[number]

export const RELATIVES = ['父母', '兄弟', '子孙', '妻财', '官鬼'] as const
export type RelativesName = (typeof RELATIVES)[number]

export const SPIRITS = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'] as const
export type SpiritName = (typeof SPIRITS)[number]

export const TRIGRAMS = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'] as const
export type TrigramName = (typeof TRIGRAMS)[number]

export const PALACES = ['乾宫', '兑宫', '离宫', '震宫', '巽宫', '坎宫', '艮宫', '坤宫'] as const
export type PalaceName = (typeof PALACES)[number]

export const PALACE_POSITIONS = [
  '本宫卦',
  '一世卦',
  '二世卦',
  '三世卦',
  '四世卦',
  '五世卦',
  '游魂卦',
  '归魂卦',
] as const
export type PalacePosition = (typeof PALACE_POSITIONS)[number]

/** 地支五行 */
export const BRANCH_ELEMENTS: Record<Branch, ElementName> = {
  子: '水',
  丑: '土',
  寅: '木',
  卯: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水',
}

/** 八卦五行 */
export const TRIGRAM_ELEMENTS: Record<TrigramName, ElementName> = {
  乾: '金',
  兑: '金',
  离: '火',
  震: '木',
  巽: '木',
  坎: '水',
  艮: '土',
  坤: '土',
}

/** 五行相生：A 生 B */
const SHENG: Record<ElementName, ElementName> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
/** 五行相克：A 克 B */
const KE: Record<ElementName, ElementName> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }

/** 八卦下卦(内卦)三爻与上卦(外卦)三爻的纳甲干支（自下而上共六位） */
export const TRIGRAM_NAJIA: Record<TrigramName, { stems: Stem[]; branches: Branch[] }> = {
  乾: {
    stems: ['甲', '甲', '甲', '壬', '壬', '壬'],
    branches: ['子', '寅', '辰', '午', '申', '戌'],
  },
  兑: {
    stems: ['丁', '丁', '丁', '丁', '丁', '丁'],
    branches: ['巳', '卯', '丑', '亥', '酉', '未'],
  },
  离: {
    stems: ['己', '己', '己', '己', '己', '己'],
    branches: ['卯', '丑', '亥', '酉', '未', '巳'],
  },
  震: {
    stems: ['庚', '庚', '庚', '庚', '庚', '庚'],
    branches: ['子', '寅', '辰', '午', '申', '戌'],
  },
  巽: {
    stems: ['辛', '辛', '辛', '辛', '辛', '辛'],
    branches: ['丑', '亥', '酉', '未', '巳', '卯'],
  },
  坎: {
    stems: ['戊', '戊', '戊', '戊', '戊', '戊'],
    branches: ['寅', '辰', '午', '申', '戌', '子'],
  },
  艮: {
    stems: ['丙', '丙', '丙', '丙', '丙', '丙'],
    branches: ['辰', '午', '申', '戌', '子', '寅'],
  },
  坤: {
    stems: ['乙', '乙', '乙', '癸', '癸', '癸'],
    branches: ['未', '巳', '卯', '丑', '亥', '酉'],
  },
}

/** 相冲（六冲）：子午 丑未 寅申 卯酉 辰戌 巳亥 */
export const CHONG: Record<Branch, Branch> = {
  子: '午',
  午: '子',
  丑: '未',
  未: '丑',
  寅: '申',
  申: '寅',
  卯: '酉',
  酉: '卯',
  辰: '戌',
  戌: '辰',
  巳: '亥',
  亥: '巳',
}

/** 六合：子丑 寅亥 卯戌 辰酉 巳申 午未 */
export const HE: Record<Branch, Branch> = {
  子: '丑',
  丑: '子',
  寅: '亥',
  亥: '寅',
  卯: '戌',
  戌: '卯',
  辰: '酉',
  酉: '辰',
  巳: '申',
  申: '巳',
  午: '未',
  未: '午',
}

// ---------- 六十四卦 ----------

/** 卦的三才位：name=卦名, lower=下卦, upper=上卦 */
const HEX_ENTRIES: Array<[name: string, lower: TrigramName, upper: TrigramName]> = [
  ['乾为天', '乾', '乾'],
  ['坤为地', '坤', '坤'],
  ['水雷屯', '震', '坎'],
  ['山水蒙', '坎', '艮'],
  ['水天需', '乾', '坎'],
  ['天水讼', '坎', '乾'],
  ['地水师', '坎', '坤'],
  ['水地比', '坤', '坎'],
  ['风天小畜', '乾', '巽'],
  ['天泽履', '兑', '乾'],
  ['地天泰', '乾', '坤'],
  ['天地否', '坤', '乾'],
  ['天火同人', '离', '乾'],
  ['火天大有', '乾', '离'],
  ['地山谦', '艮', '坤'],
  ['雷地豫', '坤', '震'],
  ['泽雷随', '震', '兑'],
  ['山风蛊', '巽', '艮'],
  ['地泽临', '兑', '坤'],
  ['风地观', '坤', '巽'],
  ['火雷噬嗑', '震', '离'],
  ['山火贲', '离', '艮'],
  ['山地剥', '坤', '艮'],
  ['地雷复', '震', '坤'],
  ['天雷无妄', '震', '乾'],
  ['山天大畜', '乾', '艮'],
  ['山雷颐', '震', '艮'],
  ['泽风大过', '巽', '兑'],
  ['坎为水', '坎', '坎'],
  ['离为火', '离', '离'],
  ['泽山咸', '艮', '兑'],
  ['雷风恒', '巽', '震'],
  ['天山遁', '艮', '乾'],
  ['雷天大壮', '乾', '震'],
  ['火地晋', '坤', '离'],
  ['地火明夷', '离', '坤'],
  ['风火家人', '离', '巽'],
  ['火泽睽', '兑', '离'],
  ['水山蹇', '坎', '艮'],
  ['雷水解', '坎', '震'],
  ['山泽损', '艮', '兑'],
  ['风雷益', '巽', '震'],
  ['泽天夬', '乾', '兑'],
  ['天风姤', '巽', '乾'],
  ['泽地萃', '坤', '兑'],
  ['地风升', '巽', '坤'],
  ['泽水困', '坎', '兑'],
  ['水风井', '巽', '坎'],
  ['泽火革', '离', '兑'],
  ['火风鼎', '巽', '离'],
  ['震为雷', '震', '震'],
  ['艮为山', '艮', '艮'],
  ['风山渐', '艮', '巽'],
  ['雷泽归妹', '兑', '震'],
  ['雷火丰', '离', '震'],
  ['火山旅', '艮', '离'],
  ['巽为风', '巽', '巽'],
  ['兑为泽', '兑', '兑'],
  ['风水涣', '坎', '巽'],
  ['水泽节', '兑', '坎'],
  ['风泽中孚', '兑', '巽'],
  ['雷山小过', '艮', '震'],
  ['水火既济', '离', '坎'],
  ['火水未济', '坎', '离'],
]

/** 每宫八卦：本宫、一世…游魂、归魂（与京房八宫次序一致） */
const PALACE_HEXES: Record<PalaceName, string[]> = {
  乾宫: ['乾为天', '天风姤', '天山遁', '天地否', '风地观', '山地剥', '火地晋', '火天大有'],
  坎宫: ['坎为水', '水泽节', '水雷屯', '水火既济', '泽火革', '雷火丰', '地火明夷', '地水师'],
  艮宫: ['艮为山', '山火贲', '山天大畜', '山泽损', '火泽睽', '天泽履', '风泽中孚', '风山渐'],
  震宫: ['震为雷', '雷地豫', '雷水解', '雷风恒', '地风升', '水风井', '泽风大过', '泽雷随'],
  巽宫: ['巽为风', '风天小畜', '风火家人', '风雷益', '天雷无妄', '火雷噬嗑', '山雷颐', '山风蛊'],
  离宫: ['离为火', '火山旅', '火风鼎', '火水未济', '山水蒙', '风水涣', '天水讼', '天火同人'],
  坤宫: ['坤为地', '地雷复', '地泽临', '地天泰', '雷天大壮', '泽天夬', '水天需', '水地比'],
  兑宫: ['兑为泽', '泽水困', '泽地萃', '泽山咸', '水山蹇', '地山谦', '雷山小过', '雷泽归妹'],
}

/** 八宫卦位对应的世爻位置（0=初爻 … 5=上爻） */
const SHI_BY_POSITION: Record<PalacePosition, number> = {
  本宫卦: 5,
  一世卦: 0,
  二世卦: 1,
  三世卦: 2,
  四世卦: 3,
  五世卦: 4,
  游魂卦: 3,
  归魂卦: 2,
}

/** 各卦简要卦意（供解读参考） */
export const HEX_THEMES: Record<string, string> = {
  乾为天: '刚健自强，创始通达',
  坤为地: '柔顺包容，厚德载物',
  水雷屯: '初生艰难，起步维艰',
  山水蒙: '蒙昧未开，启蒙教化',
  水天需: '有所需求，耐心待时',
  天水讼: '争讼不和，慎防纠纷',
  地水师: '兴师动众，竞争抗争',
  水地比: '亲比团结，互相辅助',
  风天小畜: '小有积蓄，蓄势待发',
  天泽履: '履行礼义，如履薄冰',
  地天泰: '上下交通，通泰安和',
  天地否: '上下不交，闭塞不通',
  天火同人: '与人合同，同心协力',
  火天大有: '大为富有，丰收之象',
  地山谦: '谦逊退让，谦卑受益',
  雷地豫: '愉悦安乐，豫备在先',
  泽雷随: '随顺随从，随机应变',
  山风蛊: '积弊成蛊，整治革新',
  地泽临: '君临亲临，渐进而大',
  风地观: '观望审察，观察时势',
  火雷噬嗑: '咬合除障，明断刑罚',
  山火贲: '文饰修饰，美化外表',
  山地剥: '剥落侵蚀，阴盛阳衰',
  地雷复: '一阳来复，回复复兴',
  天雷无妄: '不妄为，防无妄之灾',
  山天大畜: '大积蓄，蓄养德能',
  山雷颐: '颐养之道，慎言语节饮食',
  泽风大过: '大为过甚，负重堪忧',
  坎为水: '重重险陷，涉险而行',
  离为火: '附丽光明，文明之象',
  泽山咸: '交感相应，男女相感',
  雷风恒: '恒久之道，持之以恒',
  天山遁: '退避隐遁，以退为进',
  雷天大壮: '强盛壮大，勿恃强妄为',
  火地晋: '光明上升，晋升前进',
  地火明夷: '光明受损，韬光养晦',
  风火家人: '家庭伦理，齐家之道',
  火泽睽: '乖离背离，求同存异',
  水山蹇: '险阻艰难，知难而进',
  雷水解: '险难化解，困难解除',
  山泽损: '减损之道，损己利人',
  风雷益: '增益之道，损上益下',
  泽天夬: '决断去除，当断则断',
  天风姤: '不期而遇，邂逅相遇',
  泽地萃: '荟萃聚集，相聚成群',
  地风升: '顺势上升，积小成大',
  泽水困: '困顿穷厄，安守正道',
  水风井: '井养不穷，修德养民',
  泽火革: '除旧布新，变革革新',
  火风鼎: '鼎新立新，稳重厚实',
  震为雷: '震惊警醒，临危不惧',
  艮为山: '静止安稳，知止不殆',
  风山渐: '循序渐进，渐进而成',
  雷泽归妹: '婚嫁之象，宜正不宜偏',
  雷火丰: '丰盛光明，盛极防衰',
  火山旅: '旅行在外，漂泊不安',
  巽为风: '谦逊深入，柔顺渐入',
  兑为泽: '喜悦和悦，朋友讲习',
  风水涣: '涣散离析，化解郁结',
  水泽节: '节制有度，量入为出',
  风泽中孚: '诚信中实，信及豚鱼',
  雷山小过: '小有过越，宜下不宜上',
  水火既济: '既已成功，慎终如始',
  火水未济: '尚未成功，继续努力',
}

/** 六十四卦 Unicode 卦符（U+4DC0 起，按通行卦序），字体不支持时可忽略 */
export const HEX_SYMBOLS = [
  '䷀',
  '䷁',
  '䷂',
  '䷃',
  '䷄',
  '䷅',
  '䷆',
  '䷇',
  '䷈',
  '䷉',
  '䷊',
  '䷋',
  '䷌',
  '䷍',
  '䷎',
  '䷏',
  '䷐',
  '䷑',
  '䷒',
  '䷓',
  '䷔',
  '䷕',
  '䷖',
  '䷗',
  '䷘',
  '䷙',
  '䷚',
  '䷛',
  '䷜',
  '䷝',
  '䷞',
  '䷟',
  '䷠',
  '䷡',
  '䷢',
  '䷣',
  '䷤',
  '䷥',
  '䷦',
  '䷧',
  '䷨',
  '䷩',
  '䷪',
  '䷫',
  '䷬',
  '䷭',
  '䷮',
  '䷯',
  '䷰',
  '䷱',
  '䷲',
  '䷳',
  '䷴',
  '䷵',
  '䷶',
  '䷷',
  '䷸',
  '䷹',
  '䷺',
  '䷻',
  '䷼',
  '䷽',
  '䷾',
  '䷿',
]

// ---------- 类型 ----------

export type CoinFace = '字' | '背'

export interface TossResult {
  coins: [CoinFace, CoinFace, CoinFace]
  /** 6 老阴(动) | 7 少阳 | 8 少阴 | 9 老阳(动) */
  value: 6 | 7 | 8 | 9
  name: '老阴' | '少阳' | '少阴' | '老阳'
  /** 是否动爻 */
  moving: boolean
  /** 爻象：true=阳 */
  yang: boolean
}

export interface HexagramBuild {
  name: string
  /** 自下而上的六爻爻象，'1'=阳 '0'=阴 */
  binary: string
  lower: TrigramName
  upper: TrigramName
  palace: PalaceName
  palacePosition: PalacePosition
  /** 世爻位置 0-5 */
  shi: number
  /** 应爻位置 0-5 */
  ying: number
  element: ElementName
  theme: string
  symbol: string
}

export type WangShuai = '旺' | '相' | '休' | '囚' | '死'

export interface ChartLine {
  /** 0=初爻 … 5=上爻 */
  index: number
  toss: TossResult
  moving: boolean
  // 本卦
  originalStem: Stem
  originalBranch: Branch
  originalElement: ElementName
  originalRelatives: RelativesName
  spirit: SpiritName
  mark: '世' | '应' | ''
  // 变卦
  hasChanged: boolean
  changedYang: boolean
  changedStem: Stem | null
  changedBranch: Branch | null
  changedRelatives: RelativesName | null
  // 状态
  wangShuai: WangShuai
  kongWang: boolean
  yuePo: boolean
  riChong: boolean
  riHe: boolean
}

export interface GanZhiTime {
  yearStem: Stem
  yearBranch: Branch
  monthStem: Stem
  monthBranch: Branch
  dayStem: Stem
  dayBranch: Branch
  hourStem: Stem
  hourBranch: Branch
  /** 旬空（两组地支，与现代历法一致） */
  kongWang: [Branch, Branch]
  /** 农历近似（Intl 中国历） */
  lunar: string
}

export interface LiuYaoChart {
  lines: ChartLine[]
  original: HexagramBuild
  changed: HexagramBuild | null
  time: GanZhiTime
  movingCount: number
  /** 六冲卦 */
  liuChong: boolean
  /** 六合卦 */
  liuHe: boolean
  /** 静卦 */
  staticHexagram: boolean
}

// ---------- 起卦：铜钱 ----------

/** 摇一次铜钱，返回一爻 */
export function tossOnce(): TossResult {
  const coins: [CoinFace, CoinFace, CoinFace] = [
    Math.random() < 0.5 ? '背' : '字',
    Math.random() < 0.5 ? '背' : '字',
    Math.random() < 0.5 ? '背' : '字',
  ]
  const backs = coins.filter((c) => c === '背').length
  const value = (3 * backs + 2 * (3 - backs)) as 6 | 7 | 8 | 9
  switch (value) {
    case 9:
      return { coins, value, name: '老阳', moving: true, yang: true }
    case 8:
      return { coins, value, name: '少阴', moving: false, yang: false }
    case 7:
      return { coins, value, name: '少阳', moving: false, yang: true }
    default:
      return { coins, value, name: '老阴', moving: true, yang: false }
  }
}

// ---------- 卦象构建 ----------

function trigramBits(t: TrigramName): string {
  switch (t) {
    case '乾':
      return '111'
    case '兑':
      return '110'
    case '离':
      return '101'
    case '震':
      return '100'
    case '巽':
      return '011'
    case '坎':
      return '010'
    case '艮':
      return '001'
    case '坤':
      return '000'
  }
}

const HEX_BY_BINARY = new Map<string, { name: string; lower: TrigramName; upper: TrigramName }>()
for (const [name, lower, upper] of HEX_ENTRIES) {
  HEX_BY_BINARY.set(trigramBits(lower) + trigramBits(upper), { name, lower, upper })
}

const PALACE_OF: Record<string, { palace: PalaceName; position: PalacePosition }> = {}
;(Object.keys(PALACE_HEXES) as PalaceName[]).forEach((palace) => {
  PALACE_HEXES[palace].forEach((name, i) => {
    PALACE_OF[name] = { palace, position: PALACE_POSITIONS[i]! }
  })
})

/** 由 6 位爻象（自下而上）构建卦信息 */
export function buildHexagram(binary: string): HexagramBuild | null {
  const entry = HEX_BY_BINARY.get(binary)
  if (!entry) return null
  const { name, lower, upper } = entry
  const loc = PALACE_OF[name]
  if (!loc) return null
  const shi = SHI_BY_POSITION[loc.position]
  const ying = shi <= 2 ? shi + 3 : shi - 3
  const index = HEX_ENTRIES.findIndex((e) => e[0] === name)
  return {
    name,
    binary,
    lower,
    upper,
    palace: loc.palace,
    palacePosition: loc.position,
    shi,
    ying,
    element: TRIGRAM_ELEMENTS[loc.palace[0] as TrigramName],
    theme: HEX_THEMES[name] ?? '',
    symbol: index >= 0 ? (HEX_SYMBOLS[index] ?? '') : '',
  }
}

/** 按卦名查卦 */
export function findHexagram(name: string): HexagramBuild | null {
  const entry = HEX_ENTRIES.find((e) => e[0] === name)
  if (!entry) return null
  return buildHexagram(trigramBits(entry[1]) + trigramBits(entry[2]))
}

/** 六亲：以卦宫五行为"我" */
export function relativesOf(palaceElement: ElementName, lineElement: ElementName): RelativesName {
  if (palaceElement === lineElement) return '兄弟'
  if (SHENG[palaceElement] === lineElement) return '子孙'
  if (SHENG[lineElement] === palaceElement) return '父母'
  if (KE[palaceElement] === lineElement) return '妻财'
  return '官鬼'
}

/** 六神：以日干起（甲乙青龙、丙丁朱雀、戊勾陈、己螣蛇、庚辛白虎、壬癸玄武） */
const SPIRIT_START: Record<Stem, number> = {
  甲: 0,
  乙: 0,
  丙: 1,
  丁: 1,
  戊: 2,
  己: 3,
  庚: 4,
  辛: 4,
  壬: 5,
  癸: 5,
}

export function spiritOf(dayStem: Stem, lineIndex: number): SpiritName {
  return SPIRITS[(SPIRIT_START[dayStem] + lineIndex) % 6]!
}

// ---------- 干支历法 ----------

/** 儒略日数（公历日期，按当天 0 点计） */
export function julianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  )
}

function dayOfYear(date: Date): number {
  const y = date.getFullYear()
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
  const monthDays = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let sum = 0
  for (let i = 1; i < date.getMonth() + 1; i++) sum += monthDays[i]!
  return sum + date.getDate()
}

/** 近似节气月建起止日（公历）：[月份, 日]，对应 寅月至子月 */
const MONTH_BOUNDARIES: Array<[number, number]> = [
  [2, 4],
  [3, 6],
  [4, 5],
  [5, 6],
  [6, 6],
  [7, 7],
  [8, 8],
  [9, 8],
  [10, 8],
  [11, 7],
  [12, 7],
]

/** 月建地支序号（0=寅 … 11=丑），以节气约界 */
export function monthBranchIndex(date: Date): number {
  const y = date.getFullYear()
  const d = dayOfYear(date)
  const boundaryDoy = (md: [number, number]) => dayOfYear(new Date(y, md[0] - 1, md[1]))
  if (d < boundaryDoy([2, 4])) return 11 // 立春前为丑月
  for (let i = 10; i >= 0; i--) {
    if (d >= boundaryDoy(MONTH_BOUNDARIES[i]!)) return i
  }
  return 11
}

function toStem(idx: number): Stem {
  return STEMS[((idx % 10) + 10) % 10]!
}

function toBranch(idx: number): Branch {
  return BRANCHES[((idx % 12) + 12) % 12]!
}

/** 计算公历时间对应的干支（年柱以立春为界、月柱以节气约界、日柱精确、时柱五鼠遁） */
export function calcGanZhi(date: Date): GanZhiTime {
  const hour = date.getHours()
  // 晚子时（23 点后）日柱进一日
  const shifted = new Date(date)
  if (hour >= 23) shifted.setDate(shifted.getDate() + 1)

  const y = shifted.getFullYear()
  const m = shifted.getMonth() + 1
  const d = shifted.getDate()

  // 日柱：儒略日 → 六十甲子（1949-10-01 为甲子日）
  const jdn = julianDayNumber(y, m, d)
  const dayIdx = (((jdn + 49) % 60) + 60) % 60
  const dayStem = toStem(dayIdx)
  const dayBranch = toBranch(dayIdx)

  // 年柱：以立春（约 2/4）为界
  const beforeLiChun = m < 2 || (m === 2 && d < 4)
  const lunarYear = beforeLiChun ? y - 1 : y
  const yearIdx = (((lunarYear - 4) % 60) + 60) % 60
  const yearStem = toStem(yearIdx)
  const yearBranch = toBranch(yearIdx)

  // 月柱：五虎遁（甲己之年丙作首）
  const mb = monthBranchIndex(shifted)
  const monthStemBase = (((yearIdx % 10) % 5) * 2 + 2) % 10
  const monthStem = toStem(monthStemBase + mb)
  const monthBranch = toBranch(mb + 2)

  // 时柱：五鼠遁（甲己还加甲）
  const hb = Math.floor(((hour + 1) % 24) / 2)
  const hourStemBase = ((dayIdx % 10) % 5) * 2
  const hourStem = toStem(hourStemBase + hb)
  const hourBranch = toBranch(hb)

  // 旬空
  const xun = Math.floor(dayIdx / 10)
  const kongWang: [Branch, Branch] = [toBranch((10 - 2 * xun) % 12), toBranch((11 - 2 * xun) % 12)]

  let lunar = ''
  try {
    const fmt = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    lunar = fmt.format(date)
  } catch {
    lunar = ''
  }

  return {
    yearStem,
    yearBranch,
    monthStem,
    monthBranch,
    dayStem,
    dayBranch,
    hourStem,
    hourBranch,
    kongWang,
    lunar,
  }
}

// ---------- 旺衰与刑冲合 ----------

/** 旺相休囚死：以月建为令 */
export function wangShuaiOf(element: ElementName, monthBranch: Branch): WangShuai {
  const monthEle = BRANCH_ELEMENTS[monthBranch]
  if (element === monthEle) return '旺'
  if (SHENG[monthEle] === element) return '相'
  if (SHENG[element] === monthEle) return '休'
  if (KE[monthEle] === element) return '死'
  return '囚'
}

// ---------- 装卦 ----------

const LINE_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

/** 依据六次摇卦结果与起卦时间，排出完整六爻盘 */
export function buildChart(tosses: TossResult[], date: Date): LiuYaoChart | null {
  if (tosses.length !== 6) return null
  const time = calcGanZhi(date)

  const originalBinary = tosses.map((t) => (t.yang ? '1' : '0')).join('')
  const original = buildHexagram(originalBinary)
  if (!original) return null

  const movingIndexes = tosses.map((t, i) => (t.moving ? i : -1)).filter((i) => i >= 0)
  const hasMoving = movingIndexes.length > 0

  let changed: HexagramBuild | null = null
  if (hasMoving) {
    const changedBinary = tosses
      .map((t) => (t.moving ? (t.yang ? '0' : '1') : t.yang ? '1' : '0'))
      .join('')
    changed = buildHexagram(changedBinary)
  }

  // 六冲 / 六合：依本卦纳甲，对位 初-四、二-五、三-六 相冲则六冲，相合则六合
  let chongCount = 0
  let heCount = 0
  for (let i = 0; i < 3; i++) {
    const a = najiaAt(original, i).branch
    const b = najiaAt(original, i + 3).branch
    if (CHONG[a] === b) chongCount++
    if (HE[a] === b) heCount++
  }

  const lines: ChartLine[] = tosses.map((toss, i) => {
    const naj = najiaAt(original, i)
    const changedNaj = changed ? najiaAt(changed, i) : null
    const ws = wangShuaiOf(naj.element, time.monthBranch)
    return {
      index: i,
      toss,
      moving: toss.moving,
      originalStem: naj.stem,
      originalBranch: naj.branch,
      originalElement: naj.element,
      originalRelatives: relativesOf(original.element, naj.element),
      spirit: spiritOf(time.dayStem, i),
      mark: i === original.shi ? '世' : i === original.ying ? '应' : '',
      hasChanged: !!changedNaj,
      changedYang: changedNaj ? changedNaj.binary === '1' : toss.yang,
      changedStem: changedNaj ? changedNaj.stem : null,
      changedBranch: changedNaj ? changedNaj.branch : null,
      changedRelatives:
        changed && changedNaj ? relativesOf(changed.element, changedNaj.element) : null,
      wangShuai: ws,
      kongWang: naj.branch === time.kongWang[0] || naj.branch === time.kongWang[1],
      yuePo: CHONG[naj.branch] === time.monthBranch,
      riChong: CHONG[naj.branch] === time.dayBranch,
      riHe: HE[naj.branch] === time.dayBranch,
    }
  })

  return {
    lines,
    original,
    changed,
    time,
    movingCount: movingIndexes.length,
    liuChong: chongCount === 3,
    liuHe: heCount === 3,
    staticHexagram: !hasMoving,
  }
}

/** 取卦中某爻（0=初爻）的纳甲干支 */
export function najiaAt(
  hex: HexagramBuild,
  index: number,
): { stem: Stem; branch: Branch; element: ElementName; binary: '0' | '1' } {
  const isUpper = index >= 3
  const trigram = isUpper ? hex.upper : hex.lower
  const inner = isUpper ? index - 3 : index
  const naj = TRIGRAM_NAJIA[trigram]
  const flatIndex = isUpper ? 3 + inner : inner
  return {
    stem: naj.stems[flatIndex]!,
    branch: naj.branches[flatIndex]!,
    element: BRANCH_ELEMENTS[naj.branches[flatIndex]!]!,
    binary: hex.binary[index] === '1' ? '1' : '0',
  }
}

// ---------- 断卦辅助 ----------

export type YongShenRel = RelativesName | '世爻'

export interface YongShenGuide {
  label: string
  keywords: string[]
  relatives: YongShenRel[]
  desc: string
}

/** 常用用神速查 */
export const YONG_SHEN_GUIDES: YongShenGuide[] = [
  {
    label: '求财 · 生意',
    keywords: ['财', '钱', '生意', '收入', '投资', '股', '基金', '买卖', '赚钱', '财运'],
    relatives: ['妻财'],
    desc: '占求财看妻财爻，子孙为财源（生财之神）。妻财旺相有气、临生扶为得财之象。',
  },
  {
    label: '事业 · 官运',
    keywords: ['工作', '事业', '官', '升职', '求职', '面试', '调任', '公务员', '职位', '前程'],
    relatives: ['官鬼'],
    desc: '占事业官运看官鬼爻，父母为文书职位。官鬼旺相、临世得扶则前程有望。',
  },
  {
    label: '婚姻 · 感情',
    keywords: ['婚', '感情', '恋爱', '对象', '伴侣', '相亲', '交往', '分手', '复合'],
    relatives: ['妻财', '官鬼'],
    desc: '男占婚以妻财为用，女占婚以官鬼为用；应爻为对方。世应相生相合则两情相悦。',
  },
  {
    label: '健康 · 疾病',
    keywords: ['病', '健康', '身体', '手术', '治疗', '康复', '医院', '体检', '伤痛'],
    relatives: ['官鬼', '子孙'],
    desc: '官鬼为病，子孙为医药。子孙旺相发动制官鬼，为医药得力之象。',
  },
  {
    label: '考试 · 学业',
    keywords: ['考试', '学业', '成绩', '升学', '学习', '毕业', '进修', '论文', '考证'],
    relatives: ['父母'],
    desc: '占学业考试看父母爻（文书），官鬼为名次座次。父母旺相则文书写得好。',
  },
  {
    label: '家庭 · 长辈',
    keywords: ['父母', '长辈', '房产', '房屋', '购房', '搬家', '合同', '文书', '证', '家'],
    relatives: ['父母'],
    desc: '占父母长辈看父母爻，占房屋文书契约亦取父母为用神。',
  },
  {
    label: '子嗣',
    keywords: ['孩子', '子女', '怀孕', '生育', '后代', '生子', '求子'],
    relatives: ['子孙'],
    desc: '占子嗣以子孙为用神，子孙旺相有气则子缘佳。',
  },
  {
    label: '出行 · 旅行',
    keywords: ['出行', '旅行', '出差', '航班', '车', '旅途', '远行', '搬家远行'],
    relatives: ['世爻'],
    desc: '占出行以世爻为行人，子孙为一路平安之福神，官鬼为旅途之障碍。',
  },
  {
    label: '官司 · 是非',
    keywords: ['官司', '诉讼', '纠纷', '口舌', '是非', '被告', '原告', '仲裁'],
    relatives: ['官鬼'],
    desc: '占官司以官鬼为对方或法官，应爻为对方；官鬼旺相克世则易不利。',
  },
]

/** 依据所问之事关键词，推断可能的用神 */
export function guessYongShen(question: string): YongShenGuide | null {
  if (!question) return null
  let best: YongShenGuide | null = null
  let bestHits = 0
  for (const guide of YONG_SHEN_GUIDES) {
    const hits = guide.keywords.filter((k) => question.includes(k)).length
    if (hits > bestHits && hits > 0) {
      best = guide
      bestHits = hits
    }
  }
  return best
}

/** 生成断卦参考文案（非宿命论断，仅供娱乐参考） */
export function generateAnalysis(chart: LiuYaoChart, question: string): string[] {
  const out: string[] = []
  const { original, changed, time } = chart

  out.push(`所问：${question || '（未填写）'}`)
  out.push(
    `起卦时间：${time.yearStem}${time.yearBranch}年 ${time.monthStem}${time.monthBranch}月 ${time.dayStem}${time.dayBranch}日 ${time.hourStem}${time.hourBranch}时（旬空：${time.kongWang.join('、')}）`,
  )
  out.push(
    `本卦【${original.name}】（${original.palace}·${original.palacePosition}），卦意：${original.theme}。`,
  )
  if (changed) {
    out.push(
      `动爻${chart.movingCount}个，变卦为【${changed.name}】（${changed.palace}·${changed.palacePosition}）。`,
    )
  } else {
    out.push('本卦六爻安静，为静卦，谋事宜守不宜攻，多主维持现状、按部就班。')
  }

  if (chart.liuChong)
    out.push('此卦为六冲卦：性主散、快、不稳定，测久远之事多主难成难守，测新事急事反主快速了断。')
  if (chart.liuHe)
    out.push('此卦为六合卦：性主合、慢、稳定持久，测合作婚姻类为吉，测急事宜防拖延。')

  const shiLine = chart.lines[original.shi]!
  const yingLine = chart.lines[original.ying]!
  const shiBranch = shiLine.originalBranch
  const yingBranch = yingLine.originalBranch
  let relation = '比和'
  if (CHONG[shiBranch] === yingBranch) relation = '相冲'
  else if (HE[shiBranch] === yingBranch) relation = '相合'
  else if (KE[shiLine.originalElement] === yingLine.originalElement) relation = '世克应'
  else if (KE[yingLine.originalElement] === shiLine.originalElement) relation = '应克世'
  else if (SHENG[shiLine.originalElement] === yingLine.originalElement) relation = '世生应'
  else if (SHENG[yingLine.originalElement] === shiLine.originalElement) relation = '应生世'
  out.push(
    `世爻在${LINE_NAMES[original.shi]}（${shiLine.originalRelatives}${shiLine.originalStem}${shiLine.originalBranch}），应爻在${LINE_NAMES[original.ying]}（${yingLine.originalRelatives}${yingLine.originalStem}${yingLine.originalBranch}），世应${relation}。`,
  )

  // 用神分析
  const guide = guessYongShen(question)
  if (guide) {
    out.push(`占意近「${guide.label}」：${guide.desc}`)
    for (const rel of guide.relatives) {
      if (rel === '世爻') {
        const tags: string[] = [`${shiLine.wangShuai}于月建`]
        if (shiLine.moving) tags.push('发动')
        else tags.push('安静')
        if (shiLine.kongWang) tags.push('旬空')
        if (shiLine.yuePo) tags.push('月破')
        out.push(
          `以世爻为行人/自身：世爻在${LINE_NAMES[original.shi]}（${shiLine.originalRelatives}${shiLine.originalStem}${shiLine.originalBranch}），${tags.join('，')}。`,
        )
        continue
      }
      const hits = chart.lines.filter((l) => l.originalRelatives === rel)
      if (hits.length === 0) {
        out.push(`用神「${rel}」卦中不现（伏藏），主所求之事有隐情未明，或需另择时机再占。`)
        continue
      }
      for (const l of hits) {
        const tags: string[] = [`${l.wangShuai}于月建`]
        if (l.moving) tags.push('发动')
        else tags.push('安静')
        if (l.kongWang) tags.push('旬空')
        if (l.yuePo) tags.push('月破')
        if (l.riChong) tags.push('日冲')
        if (l.riHe) tags.push('日合')
        out.push(
          `用神「${rel}」现于${LINE_NAMES[l.index]}（${l.originalStem}${l.originalBranch}${time.dayStem}${time.dayBranch}日），${tags.join('，')}。`,
        )
      }
    }
  } else {
    const wsLines = chart.lines.filter((l) => l.wangShuai === '旺' || l.wangShuai === '相')
    if (wsLines.length > 0) {
      out.push(
        `卦中得令之爻：${wsLines
          .map((l) => `${LINE_NAMES[l.index]}${l.originalRelatives}${l.originalBranch}`)
          .join('、')}，为卦中最有力量者，可作主要参考。`,
      )
    }
  }

  const moving = chart.lines.filter((l) => l.moving)
  if (moving.length > 0) {
    for (const l of moving) {
      const target = changed?.binary[l.index] === '1' ? '阳' : '阴'
      out.push(
        `${LINE_NAMES[l.index]}发动（${l.toss.name}），${l.originalRelatives}${l.originalStem}${l.originalBranch}动化${target}爻（${l.changedRelatives}${l.changedStem ?? ''}${l.changedBranch ?? ''}），主此事有变化、应期较快。`,
      )
    }
    out.push(
      '动爻为事情变化之枢机：动而化吉（变出用神、变爻生扶）则吉，动而化凶（变出忌神、化克化绝）则凶。',
    )
  }

  out.push('—— 卦理参考，仅供娱乐；人生际遇终在自身努力与善缘。')
  return out
}

/** 生成可复制/分享的完整排盘文本 */
export function formatChartText(chart: LiuYaoChart, question: string): string {
  const { original, changed, time } = chart
  const out: string[] = []

  out.push('【六爻铜钱卦 · 排盘结果】')
  out.push(`所问之事：${question || '（未填写）'}`)
  out.push(
    `起卦时间：${time.yearStem}${time.yearBranch}年 ${time.monthStem}${time.monthBranch}月 ${time.dayStem}${time.dayBranch}日 ${time.hourStem}${time.hourBranch}时（旬空：${time.kongWang.join('、')}${time.lunar ? `；${time.lunar}` : ''}）`,
  )
  out.push(
    `本卦【${original.name}】${original.palace}·${original.palacePosition}　五行：${original.element}　卦意：${original.theme}`,
  )
  if (changed) {
    out.push(
      `变卦【${changed.name}】${changed.palace}·${changed.palacePosition}　五行：${changed.element}　（动爻 ${chart.movingCount} 个）`,
    )
  } else {
    out.push('变卦：无（六爻安静，静卦）')
  }
  if (chart.liuChong) out.push('卦性：六冲卦（性主散、快、不稳定，测久远之事难成难守）')
  else if (chart.liuHe) out.push('卦性：六合卦（性主合、慢、稳定持久，测合作婚姻类为吉）')

  out.push('')
  out.push('爻位 | 六神 | 干支 | 六亲 | 世应 | 本卦 | 动 | 变卦 | 变卦六亲 | 状态')
  for (let i = 5; i >= 0; i--) {
    const l = chart.lines[i]!
    const ya = l.toss.yang ? '—' : '- -'
    const cya = l.hasChanged || changed ? (l.changedYang ? '—' : '- -') : ' '
    const mark = l.mark || ' '
    const moving = l.moving ? (l.toss.name === '老阳' ? '○' : '×') : ' '
    const tags: string[] = [l.wangShuai]
    if (l.kongWang) tags.push('空')
    if (l.yuePo) tags.push('破')
    if (l.riChong) tags.push('冲')
    if (l.riHe) tags.push('合')
    out.push(
      `${LINE_NAMES[i]} | ${l.spirit} | ${l.originalStem}${l.originalBranch} | ${l.originalRelatives} | ${mark} | ${ya} | ${moving} | ${cya} | ${l.changedRelatives ?? '—'} | ${tags.join('/')}`,
    )
  }

  out.push('')
  out.push('—— 断卦参考 ——')
  out.push(generateAnalysis(chart, question).join('\n'))
  return out.join('\n')
}
