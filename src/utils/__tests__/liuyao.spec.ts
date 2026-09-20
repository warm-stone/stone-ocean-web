import { describe, expect, it } from 'vitest'
import {
  buildChart,
  buildHexagram,
  calcGanZhi,
  findHexagram,
  julianDayNumber,
  najiaAt,
  relativesOf,
  spiritOf,
  tossOnce,
  wangShuaiOf,
  type TossResult,
} from '../liuyao.ts'

/** 构造一个静爻结果 */
function staticToss(yang: boolean): TossResult {
  return yang
    ? { coins: ['背', '背', '字'], value: 7, name: '少阳', moving: false, yang: true }
    : { coins: ['字', '字', '背'], value: 8, name: '少阴', moving: false, yang: false }
}

describe('儒略日与干支历法', () => {
  it('1949-10-01 的儒略日为 2433191（甲子日锚点）', () => {
    expect(julianDayNumber(1949, 10, 1)).toBe(2433191)
  })

  it('1949-10-01 为己丑年癸酉月甲子日', () => {
    const t = calcGanZhi(new Date(1949, 9, 1, 12))
    expect(t.yearStem).toBe('己')
    expect(t.yearBranch).toBe('丑')
    expect(t.monthStem).toBe('癸')
    expect(t.monthBranch).toBe('酉')
    expect(t.dayStem).toBe('甲')
    expect(t.dayBranch).toBe('子')
  })

  it('2000-01-01 0 时为己卯年丁丑月戊午日壬子时', () => {
    const t = calcGanZhi(new Date(2000, 0, 1, 0, 0))
    expect(t.yearStem).toBe('己')
    expect(t.yearBranch).toBe('卯')
    expect(t.monthStem).toBe('丁')
    expect(t.monthBranch).toBe('丑')
    expect(t.dayStem).toBe('戊')
    expect(t.dayBranch).toBe('午')
    expect(t.hourStem).toBe('壬')
    expect(t.hourBranch).toBe('子')
  })

  it('甲子日旬空为戌亥', () => {
    const t = calcGanZhi(new Date(1949, 9, 1, 12))
    expect(t.kongWang).toEqual(['戌', '亥'])
  })

  it('晚子时（23 点后）日柱进一日', () => {
    const before = calcGanZhi(new Date(2024, 1, 10, 22, 0))
    const after = calcGanZhi(new Date(2024, 1, 10, 23, 30))
    const next = calcGanZhi(new Date(2024, 1, 11, 0, 0))
    expect(after.dayStem).toBe(next.dayStem)
    expect(after.dayBranch).toBe(next.dayBranch)
    expect(before.dayStem).not.toBe(next.dayStem)
  })

  it('月建以立春为界：2/3 属丑月，2/5 属寅月', () => {
    const t1 = calcGanZhi(new Date(2024, 1, 3, 12))
    expect(t1.monthBranch).toBe('丑')
    const t2 = calcGanZhi(new Date(2024, 1, 5, 12))
    expect(t2.monthBranch).toBe('寅')
  })
})

describe('六十四卦与八宫世应', () => {
  // 卦名 → 世爻位置（0=初爻…5=上爻），依据京房八宫次序
  const SHI_TABLE: Record<string, number> = {
    乾为天: 5,
    天风姤: 0,
    天山遁: 1,
    天地否: 2,
    风地观: 3,
    山地剥: 4,
    火地晋: 3,
    火天大有: 2,
    坎为水: 5,
    水泽节: 0,
    水雷屯: 1,
    水火既济: 2,
    泽火革: 3,
    雷火丰: 4,
    地火明夷: 3,
    地水师: 2,
    艮为山: 5,
    山火贲: 0,
    山天大畜: 1,
    山泽损: 2,
    火泽睽: 3,
    天泽履: 4,
    风泽中孚: 3,
    风山渐: 2,
    震为雷: 5,
    雷地豫: 0,
    雷水解: 1,
    雷风恒: 2,
    地风升: 3,
    水风井: 4,
    泽风大过: 3,
    泽雷随: 2,
    巽为风: 5,
    风天小畜: 0,
    风火家人: 1,
    风雷益: 2,
    天雷无妄: 3,
    火雷噬嗑: 4,
    山雷颐: 3,
    山风蛊: 2,
    离为火: 5,
    火山旅: 0,
    火风鼎: 1,
    火水未济: 2,
    山水蒙: 3,
    风水涣: 4,
    天水讼: 3,
    天火同人: 2,
    坤为地: 5,
    地雷复: 0,
    地泽临: 1,
    地天泰: 2,
    雷天大壮: 3,
    泽天夬: 4,
    水天需: 3,
    水地比: 2,
    兑为泽: 5,
    泽水困: 0,
    泽地萃: 1,
    泽山咸: 2,
    水山蹇: 3,
    地山谦: 4,
    雷山小过: 3,
    雷泽归妹: 2,
  }

  it('全部 64 卦均能构建且世爻位置正确', () => {
    for (const [name, expectedShi] of Object.entries(SHI_TABLE)) {
      const h = findHexagram(name)
      expect(h).not.toBeNull()
      expect(h?.shi).toBe(expectedShi)
      expect(h?.ying).toBe(expectedShi <= 2 ? expectedShi + 3 : expectedShi - 3)
    }
  })

  it('乾为天：乾宫本宫卦，世上应三，五行属金，纳甲甲子起', () => {
    const h = buildHexagram('111111')
    expect(h?.palace).toBe('乾宫')
    expect(h?.palacePosition).toBe('本宫卦')
    expect(h?.shi).toBe(5)
    expect(h?.ying).toBe(2)
    expect(h?.element).toBe('金')
    const n0 = najiaAt(h!, 0)
    expect(n0.stem).toBe('甲')
    expect(n0.branch).toBe('子')
    expect(n0.element).toBe('水')
    const n3 = najiaAt(h!, 3)
    expect(n3.stem).toBe('壬')
    expect(n3.branch).toBe('午')
  })

  it('水火既济为坎宫三世卦', () => {
    const h = buildHexagram('101010')
    expect(h?.name).toBe('水火既济')
    expect(h?.palace).toBe('坎宫')
    expect(h?.palacePosition).toBe('三世卦')
    expect(h?.shi).toBe(2)
  })
})

describe('六亲 / 六神 / 旺衰', () => {
  it('乾宫(金)六亲：木-妻财 土-父母 水-子孙 火-官鬼 金-兄弟', () => {
    expect(relativesOf('金', '木')).toBe('妻财')
    expect(relativesOf('金', '土')).toBe('父母')
    expect(relativesOf('金', '水')).toBe('子孙')
    expect(relativesOf('金', '火')).toBe('官鬼')
    expect(relativesOf('金', '金')).toBe('兄弟')
  })

  it('六神以日干起：甲日起青龙', () => {
    expect(spiritOf('甲', 0)).toBe('青龙')
    expect(spiritOf('甲', 1)).toBe('朱雀')
    expect(spiritOf('甲', 5)).toBe('玄武')
    expect(spiritOf('庚', 0)).toBe('白虎')
    expect(spiritOf('壬', 0)).toBe('玄武')
  })

  it('旺相休囚死：寅月(木) 木旺 火相 水休 金囚 土死', () => {
    expect(wangShuaiOf('木', '寅')).toBe('旺')
    expect(wangShuaiOf('火', '寅')).toBe('相')
    expect(wangShuaiOf('水', '寅')).toBe('休')
    expect(wangShuaiOf('金', '寅')).toBe('囚')
    expect(wangShuaiOf('土', '寅')).toBe('死')
  })
})

describe('装卦（完整排盘）', () => {
  it('乾为天（六爻皆静）：世应、六亲、六神、六冲均符合经典', () => {
    const tosses = ['1', '1', '1', '1', '1', '1'].map((b) => staticToss(b === '1'))
    const chart = buildChart(tosses, new Date(1949, 9, 1, 12)) // 甲子日（甲日起青龙）
    expect(chart).not.toBeNull()
    expect(chart?.original.name).toBe('乾为天')
    expect(chart?.staticHexagram).toBe(true)
    expect(chart?.liuChong).toBe(true)
    expect(chart?.liuHe).toBe(false)

    const rel = chart!.lines.map((l) => l.originalRelatives)
    expect(rel).toEqual(['子孙', '妻财', '父母', '官鬼', '兄弟', '父母'])

    expect(chart!.lines[5]!.mark).toBe('世')
    expect(chart!.lines[2]!.mark).toBe('应')

    // 六神：甲日起青龙，自初爻向上
    const spirits = chart!.lines.map((l) => l.spirit)
    expect(spirits).toEqual(['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'])

    // 甲日甲子旬空戌亥
    expect(chart!.lines.filter((l) => l.kongWang).map((l) => l.originalBranch)).toEqual(['戌'])
  })

  it('泽火革（坎宫四世）：验证宫位与六亲纳甲', () => {
    const tosses = [
      staticToss(true), // 初 少阳
      staticToss(false), // 二 少阴
      staticToss(true), // 三 少阳
      staticToss(true), // 四
      staticToss(true), // 五
      staticToss(false), // 上
    ]
    const chart = buildChart(tosses, new Date(2024, 1, 5, 12))
    expect(chart?.original.name).toBe('泽火革')
    expect(chart?.original.palace).toBe('坎宫')
    expect(chart?.original.palacePosition).toBe('四世卦')
    expect(chart?.lines[3]!.mark).toBe('世')
    expect(chart?.lines[0]!.mark).toBe('应')
    // 坎宫(水)：卯木子孙、丑土官鬼、亥水兄弟、酉金父母
    expect(chart?.lines[0]!.originalRelatives).toBe('子孙')
    expect(chart?.lines[1]!.originalRelatives).toBe('官鬼')
    expect(chart?.lines[4]!.originalRelatives).toBe('父母')
  })

  it('火天大有有动爻：老阴变阳得变卦乾为天', () => {
    const tosses = [
      staticToss(true), // 初 阳
      staticToss(true), // 二 阳
      staticToss(true), // 三 阳
      staticToss(true), // 四 阳
      {
        coins: ['字', '字', '字'],
        value: 6,
        name: '老阴',
        moving: true,
        yang: false,
      } as TossResult, // 五 老阴→阳
      staticToss(true), // 上 阳
    ]
    const chart = buildChart(tosses, new Date(2024, 1, 5, 12))
    expect(chart?.original.name).toBe('火天大有')
    expect(chart?.movingCount).toBe(1)
    expect(chart?.changed?.name).toBe('乾为天')
    expect(chart?.lines[4]!.moving).toBe(true)
    expect(chart?.lines[4]!.changedYang).toBe(true)
  })

  it('地天泰为六合卦', () => {
    const tosses = ['1', '1', '1', '0', '0', '0'].map((b) => staticToss(b === '1'))
    const chart = buildChart(tosses, new Date(2024, 1, 5, 12))
    expect(chart?.original.name).toBe('地天泰')
    expect(chart?.liuHe).toBe(true)
    expect(chart?.liuChong).toBe(false)
  })

  it('摇卦结果取值合法', () => {
    for (let i = 0; i < 200; i++) {
      const t = tossOnce()
      expect([6, 7, 8, 9]).toContain(t.value)
      expect(t.moving).toBe(t.value === 6 || t.value === 9)
      expect(t.yang).toBe(t.value === 7 || t.value === 9)
    }
  })
})
