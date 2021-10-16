import { CSVHeaders } from '../const';
import { writeAnalysisCSV } from '../utils';
import { SimpleFilter } from '../analyze/simpleFilter';
import {
  BargainEMA200,
  BargainLongTerm,
  BargainShortTerm,
  BargainTrUpLow,
  BargainFarfetch,
  FactsOutdated,
  TrendShort,
  TrendLong,
  TrendWeeklyLong,
  StrenthScreenRules,
  TipRanksScreenRules,
  FundementalScreenRules,
  DividendScreenRules,
  descUp,
  descStrength,
  descTrBuy,
  descTrUp,
  descDividend,
  cutOff,
  PEScreenRules,
  PEGScreenRules,
  ascPE,
  ascPeg,
  PositiveUpRules,
  TrScore6Rules,
} from './screenRules';
import { PlungeFilter } from '../analyze/plungeFilter';
import { SkyrocketFilter } from '../analyze/skyrocketFilter';
export * from './macdScreen';
import { FilterRule } from '../analyze/simpleFilter';

const standardScreen = async (name: string, rawMerged: any[], sortCriteria: (a: any, b: any) => number, cutOffCount: number, ...rules: FilterRule[]) => {
  const filter = new SimpleFilter(...rules);
  const { accepted, rejected } = filter.matchAll(rawMerged);

  const sorted = accepted.sort(sortCriteria);
  const filename = name.toLowerCase().replace(' ', '-');
  let result = sorted;
  if (cutOffCount > 0) {
    result = cutOff(result, cutOffCount);
  }
  await writeAnalysisCSV(`${filename}.csv`, CSVHeaders, result);
  console.log(`[Done] screening for ${name}`);
  console.log('-'.repeat(40));
};

export const bestScreen = async (rawMerged: any[]) => {
  const cutOffCount = 100;
  standardScreen('best-tipranks', rawMerged, descTrBuy, cutOffCount, ...TipRanksScreenRules);
  standardScreen('best-strength', rawMerged, descStrength, cutOffCount, ...StrenthScreenRules);
  standardScreen('best-fundamental', rawMerged, descUp, cutOffCount, ...FundementalScreenRules);
  standardScreen('best-dividend', rawMerged, descDividend, cutOffCount, ...DividendScreenRules);
  standardScreen('best-pe', rawMerged, ascPE, cutOffCount, ...PEScreenRules);
  standardScreen('best-peg', rawMerged, ascPeg, cutOffCount, ...PEGScreenRules);
};

export const bargainScreen = async (rawMerged: any[]) => {
  standardScreen('bargain-shortterm', rawMerged, descTrUp, 0, ...BargainShortTerm);
  standardScreen('bargain-longterm', rawMerged, descTrUp, 0, ...BargainLongTerm);
  standardScreen('bargain-farfetch', rawMerged, descTrUp, 0, ...BargainFarfetch);
  standardScreen('bargain-ema200', rawMerged, descTrUp, 0, ...BargainEMA200);
  standardScreen('bargain-upLow', rawMerged, descTrUp, 0, ...BargainTrUpLow);
};

export const trendScreen = async (rawMerged: any[]) => {
  standardScreen('trend-long', rawMerged, descTrUp, 0, ...TrendLong);
  standardScreen('trend-short', rawMerged, descTrUp, 0, ...TrendShort);
  standardScreen('trend-weekly-long', rawMerged, descTrUp, 0, ...TrendWeeklyLong);
};

export const outdatedScreen = async (rawMerged: any[]) => {
  standardScreen('facts-outdated', rawMerged, descTrUp, 0, ...FactsOutdated);
};

export const plungeScreen = async (rawMerged: any[], plungePct: number, withinDays: number) => {
  const filter = new PlungeFilter(withinDays, plungePct);
  const { accepted, rejected } = filter.matchAll(rawMerged);
  const simpleFilter = new SimpleFilter(...TrScore6Rules);
  const secondResult = simpleFilter.matchAll(accepted);

  // sort by desc strength
  const sorted = secondResult.accepted.sort(descTrUp);

  await writeAnalysisCSV('bargain-plummet.csv', CSVHeaders, cutOff(sorted, 100));
  console.log(`[Done] screening for plunge > ${plungePct * 100}% in ${withinDays} days`);
  console.log('-'.repeat(40));
};

export const skyrocketScreen = async (rawMerged: any[], rocketPct: number, withinDays: number) => {
  const filter = new SkyrocketFilter(withinDays, rocketPct);
  const { accepted, rejected } = filter.matchAll(rawMerged);
  const simpleFilter = new SimpleFilter(...TrScore6Rules);
  const secondResult = simpleFilter.matchAll(accepted);

  // sort by desc strength
  const sorted = secondResult.accepted.sort(descTrUp);

  await writeAnalysisCSV('bargain-skyrocket.csv', CSVHeaders, cutOff(sorted, 100));
  console.log(`[Done] screening for skyrocket > ${rocketPct * 100}% in ${withinDays} days`);
  console.log('-'.repeat(40));
};
