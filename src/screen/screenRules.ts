import { Filter } from '../analyze/filter';
import { FilterRule } from '../analyze/simpleFilter';
const CommonScreenRules = [new FilterRule('avg volume > 300k'), new FilterRule('market cap > 60m'), new FilterRule('trScore > 5')];

export const StrenthScreenRules = [
  ...CommonScreenRules,
  new FilterRule('relativeStrength > 0%'),
  new FilterRule('shortTrend > 0%'),
  new FilterRule('mediumTrend > 0%'),
  new FilterRule('eps next 5y > 0%'),
  new FilterRule('eps past 5y > 0%'),
  new FilterRule('trBuy > 3'),
];

export const FundementalScreenRules = [
  ...CommonScreenRules,
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

export const ShortTermBargainScreenRules = [
  ...CommonScreenRules,
  new FilterRule('shortTrend > 0%'),
  new FilterRule('mediumTrend < 0%'),
  new FilterRule('avg volume > 300k'),
  new FilterRule('trScore > 5'),
  new FilterRule('trUp > 8%'),
];

export const TipRanksStrongBuyScreenRules = [...CommonScreenRules, new FilterRule('trStrongBuy% > 0.5'), new FilterRule('trUp > 5%'), new FilterRule('upMedian > 5%')];

export const LongTermBargainScreenRules = [...CommonScreenRules, new FilterRule('shortTrend > 0%'), new FilterRule('longTrend < 0%'), new FilterRule('trBuy > 2'), new FilterRule('trUp > 5%')];

export const FarfetchScreenRules = [...CommonScreenRules, new FilterRule('upEMA60 < -10%'), new FilterRule('trBuy > 2')];

export const DividendScreenRules = [new FilterRule('dividend % > 2%'), new FilterRule('market cap > 1b'), new FilterRule('trUp > 5%'), new FilterRule('upMedian > 0%')];

export const BasicScreenRules = [...CommonScreenRules, new FilterRule('upMedian > 0%'), new FilterRule('trBuy > 3'), new FilterRule('trScore > 6')];

export const TipRanksScreenRules = [new FilterRule('trScore > 6'), new FilterRule('trBuy > 6'), new FilterRule('trUp > 15%')];

export const descMacd = (a, b) => (a.macd < b.macd ? 1 : -1);

export const descTrScore = (a, b) => (b.trScore < a.trScore ? 1 : -1);

export const descUp = (a, b) => (parseInt(a['up']) < parseInt(b['up']) ? 1 : -1);

export const descTrUp = (a, b) => (parseInt(a['trUp']) < parseInt(b['trUp']) ? 1 : -1);

export const descTrBuy = (a, b) => (parseInt(a['trBuy']) < parseInt(b['trBuy']) ? 1 : -1);

export const descStrength = (a, b) => (parseInt(a['relativeStrength']) < parseInt(b['relativeStrength']) ? 1 : -1);

export const descUpEMA60 = (a, b) => (parseInt(a['upEMA60']) < parseInt(b['upEMA60']) ? 1 : -1);
export const ascUpEMA60 = (a, b) => (parseInt(a['upEMA60']) > parseInt(b['upEMA60']) ? 1 : -1);

export const descDividend = (a, b) => (parseFloat(a['dividend %']) < parseFloat(b['dividend %']) ? 1 : -1);

export const cutOff = (list, num) => {
  if (list instanceof Array) {
    if (list.length <= num) {
      return list;
    }
    return list.slice(0, num);
  }
  return [];
};
