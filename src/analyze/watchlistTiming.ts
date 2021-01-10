import { FilterRule } from './simpleFilter';
import { writeAnalysisJSON, writeAnalysisCSV } from '../utils';
import { loadMergedData } from './dataMerger';
import { SimpleFilter } from './simpleFilter';
import { loadAllSymbols } from '../listing';
import { CSVHeaders } from '../const';

export const watchlistTiming = async (rawMerged: any[]) => {
  const rules = [
    new FilterRule('rsi (14) < 50'), // rsi < 50
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

  let sorted = accepted.sort((a, b): number => {
    return parseInt(a['upHigh']) < parseInt(b['upHigh']) ? 1 : -1;
  });
  await writeAnalysisCSV('watchlist-rsi.csv', CSVHeaders, sorted);
};
