import { CSVHeaders } from '../const';
import { writeAnalysisCSV } from '../utils';
import { FilterRule, SimpleFilter } from './simpleFilter';

export const strengthScreen = async (rawMerged: any[]) => {
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

  writeAnalysisCSV('trend-prime.csv', CSVHeaders, accepted);
};
