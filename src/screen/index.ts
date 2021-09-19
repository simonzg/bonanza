import { CSVHeaders } from '../const';
import { writeAnalysisCSV } from '../utils';
import { SimpleFilter } from '../analyze/simpleFilter';
import {
  CommonScreenRules,
  StrenthScreenRules,
  TipRanksScreenRules,
  ShortTermBargainScreenRules,
  LongTermBargainScreenRules,
  LongArrayScrrenRules,
  FundementalScreenRules,
  DividendScreenRules,
  descUp,
  descStrength,
  descTrBuy,
  descTrUp,
  descDividend,
  cutOff,
  FarfetchScreenRules,
  PEScreenRules,
  PEGScreenRules,
  ascPE,
  ascPeg,
  PositiveUpRules,
  ShortArrayScrrenRules,
  TrScore6Rules,
  OutdatedScreenRules,
  WeeklyTrendLongScreenRules,
  BargainLongTermScreenRules,
  EMA200ScreenRules,
} from './screenRules';
import { PlungeFilter } from '../analyze/plungeFilter';
import { SkyrocketFilter } from '../analyze/skyrocketFilter';
import internal from 'stream';
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
  standardScreen('bargain-shortterm', rawMerged, descTrUp, 0, ...ShortTermBargainScreenRules);
  standardScreen('bargain-longterm', rawMerged, descTrUp, 0, ...BargainLongTermScreenRules);
  standardScreen('bargain-farfetch', rawMerged, descTrUp, 0, ...FarfetchScreenRules);
  standardScreen('bargain-ema200', rawMerged, descTrUp, 0, ...EMA200ScreenRules);
};

export const trendScreen = async (rawMerged: any[]) => {
  standardScreen('trend-long', rawMerged, descTrUp, 0, ...LongArrayScrrenRules);
  standardScreen('trend-short', rawMerged, descTrUp, 0, ...ShortArrayScrrenRules);
  standardScreen('trend-weekly-long', rawMerged, descTrUp, 0, ...WeeklyTrendLongScreenRules);
};

export const outdatedScreen = async (rawMerged: any[]) => {
  standardScreen('facts-outdated', rawMerged, descTrUp, 0, ...OutdatedScreenRules);
};

export const plungeScreen = async (rawMerged: any[], plungePct: number, withinDays: number) => {
  const filter = new PlungeFilter(withinDays, plungePct);
  const { accepted, rejected } = filter.matchAll(rawMerged);
  const simpleFilter = new SimpleFilter(...CommonScreenRules, ...TrScore6Rules);
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
  const simpleFilter = new SimpleFilter(...CommonScreenRules, ...TrScore6Rules);
  const secondResult = simpleFilter.matchAll(accepted);

  // sort by desc strength
  const sorted = secondResult.accepted.sort(descTrUp);

  await writeAnalysisCSV('bargain-skyrocket.csv', CSVHeaders, cutOff(sorted, 100));
  console.log(`[Done] screening for skyrocket > ${rocketPct * 100}% in ${withinDays} days`);
  console.log('-'.repeat(40));
};
