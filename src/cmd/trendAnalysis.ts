import { writeAnalysisCSV } from '../utils';
import { FilterRule, SimpleFilter } from '../analyze/simpleFilter';
import { loadMergedData } from '../analyze/dataMerger';
import { loadAllSymbols } from '../listing';

(async () => {
  const symbols = loadAllSymbols();
  const rawMerged = loadMergedData(symbols);

  const rules = [
    new FilterRule('relativeStrength > 0%'),
    new FilterRule('shortTrend > 0%'),
    new FilterRule('mediumTrend > 0%'),
    new FilterRule('eps next 5y > 0%'),
    new FilterRule('eps past 5y > 0%'),
    new FilterRule('avg volume > 300k'),
    new FilterRule('market cap > 60m'),
  ];
  const filter = new SimpleFilter(rules);

  let accepted = [];
  let rejected = [];
  for (const raw of rawMerged) {
    const fr = filter.match(raw);
    if (fr.accepted) {
      accepted.push(raw);
    } else {
      rejected.push(fr);
    }
  }
  writeAnalysisCSV(
    'trend-rejected.csv',
    [
      { id: 'symbol', title: 'Symbol' },
      { id: 'rejectReason', title: 'Reject Reason' },
    ],
    rejected
  );

  const headers = [
    { id: 'symbol', title: 'Sym' },
    { id: 'industry', title: 'Ind' },
    { id: 'relativeStrength', title: 'relStr' },
    { id: 'shortTrend', title: 'c/s' },
    { id: 'mediumTrend', title: 's/m' },
    { id: 'longTrend', title: 'm/l' },

    { id: 'upMedian', title: 'up%' },
    { id: 'upHigh', title: 'uphigh%' },
    { id: 'eps next 5y', title: 'eps>5y' },
    { id: 'eps past 5y', title: 'eps<5y' },
    { id: 'roe', title: 'roe' },
    { id: 'peg', title: 'peg' },
    { id: 'rsi (14)', title: 'rsi' },
    { id: 'atr', title: 'atr' },
    { id: 'price', title: 'p' },
    { id: 'market cap', title: 'm cap' },
  ];
  writeAnalysisCSV('trend-prime.csv', headers, accepted);
})();
