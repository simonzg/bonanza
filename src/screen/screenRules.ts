import { Filter } from '../analyze/filter';
import { FilterRule } from '../analyze/simpleFilter';
export const CommonRules = [new FilterRule('avg volume > 300k'), new FilterRule('market cap > 1b'), new FilterRule('trScore > 6')];

export const PositiveUpRules = [...CommonRules, new FilterRule('upMedian > 0%'), new FilterRule('trUp > 0%')];
export const TrScore6Rules = [...CommonRules, new FilterRule('trScore > 6'), new FilterRule('trBuy > 0')];

export const StrenthScreenRules = [
  ...CommonRules,
  new FilterRule('relativeStrength > 0%'),
  new FilterRule('shortTrend > 0%'),
  new FilterRule('mediumTrend > 0%'),
  new FilterRule('eps next 5y > 0%'),
  new FilterRule('eps past 5y > 0%'),
  new FilterRule('trBuy > 3'),
];

export const FundementalScreenRules = [
  ...CommonRules,
  new FilterRule('upMedian > 0%'), // upMedian > 0%
  new FilterRule('buyMinusHold > 0'), // buy+strongBuy > hold
  new FilterRule('buyMinusSell > 0'), // buy+strongBuy > sell+strongSell
  new FilterRule('eps next 5y > 5%'),
  new FilterRule('eps past 5y > 0%'),
  new FilterRule('sma200 > 5%'),
  new FilterRule('roe > 5%'),
  new FilterRule('short float < 10%'),
  new FilterRule('perf half y > 0%'),
  // new FilterRule('up% > 0%'),
];

export const TipRanksScreenRules = [
  ...CommonRules,
  new FilterRule('trBuy% > 70%'),
  new FilterRule('trUp > 5%'),
  new FilterRule('upMedian > 5%'),
  new FilterRule('trBuy > 3'),
  new FilterRule('trScore >= 6'),
  new FilterRule('roe > -40%'),
  new FilterRule('eps next 5y >= 0%'),
  new FilterRule('eps past 5y >= 0%'),
  new FilterRule('eps q/q >= 0%'),
];

export const SmallCaps = [new FilterRule('market cap > 1b')];
export const MidCaps = [new FilterRule('market cap > 10b')];

//////////////////////////////////////////
// Bargain Screen Rules
//////////////////////////////////////////

export const BargainShortTerm = [...CommonRules, ...MidCaps, new FilterRule('shortTrend >= 0%'), new FilterRule('mediumTrend < 0%'), new FilterRule('trBuy% > 45%'), new FilterRule('trUp > 0%')];

export const BargainLongTerm = [
  ...CommonRules,
  ...MidCaps,
  new FilterRule('emaWeekly5 >= emaWeekly20'),
  new FilterRule('emaWeekly20 >= emaWeekly40'),
  new FilterRule('upEMAWeekly20 <= 3%'),
  new FilterRule('upEMAWeekly20 >= -5%'),
  new FilterRule('upEMAWeekly40 >= 0%'),
];

export const BargainEMA200 = [...CommonRules, ...MidCaps, new FilterRule('upEMA200 <= 3%')];
export const BargainTrUpLow = [...CommonRules, ...MidCaps, new FilterRule('trUpLow >= 1%')];
export const BargainFarfetch = [...CommonRules, ...MidCaps, new FilterRule('upEMA60 < -10%'), new FilterRule('trBuy > 2')];

//////////////////////////////////////////
// Trend Screen Rules
//////////////////////////////////////////

export const TrendWeeklyLong = [...CommonRules, ...MidCaps, new FilterRule('emaWeekly5 >= emaWeekly20'), new FilterRule('emaWeekly20 >= emaWeekly40')];

export const TrendLong = [
  ...CommonRules,
  ...MidCaps,
  new FilterRule('shortTrend >= 0%'),
  new FilterRule('mediumTrend >= 0%'),
  new FilterRule('longTrend >= 0%'),
  new FilterRule('trBuy > 2'),
  new FilterRule('trUp > 5%'),
];

export const TrendShort = [
  ...CommonRules,
  ...MidCaps,
  new FilterRule('shortTrend < 0%'),
  new FilterRule('mediumTrend < 0%'),
  new FilterRule('longTrend < 0%'),
  new FilterRule('trBuy > 2'),
  new FilterRule('trUp > 5%'),
];

//////////////////////////////////////////
// Facts Screen Rules
//////////////////////////////////////////

export const FactsOutdated = [...CommonRules, new FilterRule('outdated = true')];

export const DividendScreenRules = [...CommonRules, new FilterRule('dividend % > 2%'), new FilterRule('market cap > 1b'), new FilterRule('trUp > 5%'), new FilterRule('upMedian > 0%')];

export const BasicScreenRules = [...CommonRules, new FilterRule('upMedian > 0%'), new FilterRule('trBuy > 3'), new FilterRule('trScore > 6')];

export const PEScreenRules = [...CommonRules, new FilterRule('p/e < 15'), new FilterRule('p/e > 0'), new FilterRule('trUp > 0%'), new FilterRule('upMedian > 0%')];

export const PEGScreenRules = [...CommonRules, new FilterRule('peg < 4'), new FilterRule('peg > 0'), new FilterRule('trUp > 0%'), new FilterRule('upMedian > 0%')];

export const descMacd = (a, b) => (a.macd < b.macd ? 1 : -1);

export const descNum = (fieldName) => {
  return (a, b) => {
    if (a[fieldName] === undefined) {
      return 1;
    }
    if (b[fieldName] === undefined) {
      return -1;
    }
    const va = typeof a[fieldName] === 'string' ? parseFloat(a[fieldName].replace('%', '')) : Number(a[fieldName]);
    const vb = typeof b[fieldName] === 'string' ? parseFloat(b[fieldName].replace('%', '')) : Number(b[fieldName]);
    if (isNaN(va) && isNaN(vb)) {
      return 0;
    }
    if (isNaN(va)) {
      return 1;
    }
    if (isNaN(vb)) {
      return -1;
    }
    return va < vb ? 1 : -1;
  };
};

export const ascNum = (fieldName) => {
  return (a, b) => {
    if (a[fieldName] === undefined) {
      return 1;
    }
    if (b[fieldName] === undefined) {
      return -1;
    }
    const va = typeof a[fieldName] === 'string' ? parseFloat(a[fieldName].replace('%', '')) : Number(a[fieldName]);
    const vb = typeof b[fieldName] === 'string' ? parseFloat(b[fieldName].replace('%', '')) : Number(b[fieldName]);
    if (isNaN(va) && isNaN(vb)) {
      return 0;
    }
    if (isNaN(va)) {
      return 1;
    }
    if (isNaN(vb)) {
      return -1;
    }
    return va > vb ? 1 : -1;
  };
};

export const descTrScore = descNum('trScore');
export const descUp = descNum('up');
export const descTrUp = descNum('trUp');
export const descTrBuy = descNum('trBuy');
export const descStrength = descNum('relativeStrength');
export const descUpEMA60 = descNum('upEMA60');
export const ascUpEMA60 = ascNum('upEMA60');
export const descDividend = descNum('dividend %');
export const ascPE = ascNum('p/e');
export const ascPeg = ascNum('peg');

export const cutOff = (list, num) => {
  if (list instanceof Array) {
    if (list.length <= num) {
      return list;
    }
    return list.slice(0, num);
  }
  return [];
};
