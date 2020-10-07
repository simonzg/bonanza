import { FilterRule } from '../analyze/simpleFilter';
import { writeAnalysisJSON, writeAnalysisCSV } from '../utils';
import { loadMergedData } from '../analyze/dataMerger';
import { SimpleFilter } from '../analyze/simpleFilter';

(async () => {
  const rawMerged = loadMergedData();
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

  const headers = [
    { id: 'symbol', title: 'Sym' },
    { id: 'industry', title: 'Ind' },
    { id: 'upMedian', title: 'up%' },
    { id: 'upHigh', title: 'uphigh%' },
    { id: 'rate1m', title: '1m%' },
    { id: 'rate3m', title: '3m%' },
    { id: 'rate6m', title: '6m%' },
    { id: 'eps next 5y', title: 'eps>5y' },
    { id: 'eps past 5y', title: 'eps<5y' },
    { id: 'roe', title: 'roe' },
    { id: 'peg', title: 'peg' },
    { id: 'rsi (14)', title: 'rsi' },
    { id: 'atr', title: 'atr' },
    { id: 'price', title: 'p' },
    { id: 'targetMedian', title: 'Tgt M' },
    { id: 'targetHigh', title: 'Tgt H' },
  ];
  let sorted = accepted.sort((a, b): number => {
    if (a.industry == b.industry) {
      return parseInt(a['upHigh']) < parseInt(b['upHigh']) ? 1 : -1;
    }
    return a.industry > b.industry ? 1 : -1;
  });
  await writeAnalysisCSV('fundamental-prime.csv', headers, sorted);
})();
