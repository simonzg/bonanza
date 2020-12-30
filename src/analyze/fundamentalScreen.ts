import { FilterRule } from './simpleFilter';
import { writeAnalysisJSON, writeAnalysisCSV } from '../utils';
import { loadMergedData } from './dataMerger';
import { SimpleFilter } from './simpleFilter';
import { loadAllSymbols } from '../listing';
import { CSVHeaders } from '../const';

export const fundamentalScreen = async (rawMerged: any[]) => {
  writeAnalysisJSON('raw-merged.json', rawMerged);
  const rules = [
    new FilterRule('upMedian > 0%'), // upMedian > 0%
    new FilterRule('buyMinusHold > 0'), // buy+strongBuy > hold
    new FilterRule('buyMinusSell > 0'), // buy+strongBuy > sell+strongSell
    new FilterRule('eps next 5y > 5%'),
    new FilterRule('eps past 5y > 0%'),
    new FilterRule('avg volume > 300k'),
    new FilterRule('market cap > 100m'),
    new FilterRule('sma200 > 5%'),
    new FilterRule('roe > 5%'),
    new FilterRule('short float < 10%'),
    new FilterRule('perf half y > 0%'),
    // new FilterRule('up% > 0%'),
  ];
  const filter = new SimpleFilter(rules);

  const accepted = [];
  const rejected = [];
  for (const raw of rawMerged) {
    const fr = filter.match(raw);
    if (fr.accepted) {
      accepted.push(raw);
    } else {
      rejected.push(fr);
    }
  }

  writeAnalysisCSV(
    'fundamental-rejected.csv',
    [
      { id: 'symbol', title: 'Symbol' },
      { id: 'rejectReason', title: 'Reject Reason' },
    ],
    rejected
  );

  let sorted = accepted.sort((a, b): number => {
    if (a.industry == b.industry) {
      return parseInt(a['upHigh']) < parseInt(b['upHigh']) ? 1 : -1;
    }
    return a.industry > b.industry ? 1 : -1;
  });
  await writeAnalysisCSV('fundamental-prime.csv', CSVHeaders, sorted);
};
