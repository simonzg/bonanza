import { CSVHeaders } from '../const';
import { writeAnalysisCSV } from '../utils';
import { SimpleFilter } from '../analyze/simpleFilter';
import {
  StrenthScreenRules,
  TipRanksScreenRules,
  ShortTermBargainScreenRules,
  LongTermBargainScreenRules,
  FundementalScreenRules,
  DividendScreenRules,
  descUp,
  descStrength,
  ascUpEMA60,
  descTrScore,
  descTrBuy,
  descTrUp,
  descDividend,
  cutOff,
  FarfetchScreenRules,
  TipRanksStrongBuyScreenRules,
} from './screenRules';
export * from './macdScreen';

export const tipranksScreen = async (rawMerged: any[]) => {
  const filter = new SimpleFilter(TipRanksScreenRules);
  const { accepted, rejected } = filter.matchAll(rawMerged);
  // sort by trUp
  const sorted = accepted.sort(descTrBuy);
  await writeAnalysisCSV('picked-by-tipranks.csv', CSVHeaders, cutOff(sorted, 30));
  console.log('[Done] screening for tipranks');
  console.log('-'.repeat(40));
};

export const tipranksStrongBuyScreen = async (rawMerged: any[]) => {
  const filter = new SimpleFilter(TipRanksStrongBuyScreenRules);
  const { accepted, rejected } = filter.matchAll(rawMerged);
  // sort by trUp
  const sorted = accepted.sort(descTrBuy);
  await writeAnalysisCSV('picked-by-tipranks-strongbuy.csv', CSVHeaders, cutOff(sorted, 30));
  console.log('[Done] screening for tipranks');
  console.log('-'.repeat(40));
};

export const shortTermBargainScreen = async (rawMerged: any[]) => {
  const filter = new SimpleFilter(ShortTermBargainScreenRules);

  const { accepted, rejected } = filter.matchAll(rawMerged);

  // sort by desc trUp
  const sorted = accepted.sort(descTrBuy);
  await writeAnalysisCSV('picked-by-shortterm-bargain.csv', CSVHeaders, cutOff(sorted, 30));
  console.log('[Done] screening for short-term bargain');
  console.log('-'.repeat(40));
};

export const longTermBargainScreen = async (rawMerged: any[]) => {
  const filter = new SimpleFilter(LongTermBargainScreenRules);

  const { accepted, rejected } = filter.matchAll(rawMerged);

  // sort by desc trUp
  const sorted = accepted.sort(descTrBuy);
  await writeAnalysisCSV('picked-by-longterm-bargain.csv', CSVHeaders, cutOff(sorted, 30));
  console.log('[Done] screening for long-term bargain');
  console.log('-'.repeat(40));
};

export const strengthScreen = async (rawMerged: any[]) => {
  const filter = new SimpleFilter(StrenthScreenRules);
  const { accepted, rejected } = filter.matchAll(rawMerged);
  //   writeAnalysisCSV(
  //     'rejected-by-strength.csv',
  //     [
  //       { id: 'symbol', title: 'Symbol' },
  //       { id: 'rejectReason', title: 'Reject Reason' },
  //     ],
  //     rejected
  //   );

  // sort by desc strength
  const sorted = accepted.sort(descStrength);

  await writeAnalysisCSV('picked-by-strength.csv', CSVHeaders, cutOff(sorted, 30));
  console.log('[Done] screening for strength');
  console.log('-'.repeat(40));
};

export const fundamentalScreen = async (rawMerged: any[]) => {
  // for debug
  // writeAnalysisJSON('raw-merged.json', rawMerged);

  const filter = new SimpleFilter(FundementalScreenRules);
  const { accepted, rejected } = filter.matchAll(rawMerged);

  // for debug
  // writeAnalysisCSV(
  //   'rejected-by-fundamental.csv',
  //   [
  //     { id: 'symbol', title: 'Symbol' },
  //     { id: 'rejectReason', title: 'Reject Reason' },
  //   ],
  //   rejected
  // );

  // sort by desc up
  const sorted = accepted.sort(descUp);

  await writeAnalysisCSV('picked-by-fundamental.csv', CSVHeaders, sorted);
  console.log('[Done] screening for fundamental');
  console.log('-'.repeat(40));
};

export const dividendScreen = async (rawMerged: any[]) => {
  // for debug
  // writeAnalysisJSON('raw-merged.json', rawMerged);

  const filter = new SimpleFilter(DividendScreenRules);
  const { accepted, rejected } = filter.matchAll(rawMerged);

  // sort by desc up
  const sorted = accepted.sort(descDividend);

  await writeAnalysisCSV('picked-by-dividend.csv', CSVHeaders, sorted);
  console.log('[Done] screening for dividend');
  console.log('-'.repeat(40));
};

export const farfetchScreen = async (rawMerged: any[]) => {
  const filter = new SimpleFilter(FarfetchScreenRules);
  const { accepted, rejected } = filter.matchAll(rawMerged);

  // sort by desc strength
  const sorted = accepted.sort(ascUpEMA60);

  await writeAnalysisCSV('picked-by-farfetch.csv', CSVHeaders, cutOff(sorted, 30));
  console.log('[Done] screening for farfetch');
  console.log('-'.repeat(40));
};
