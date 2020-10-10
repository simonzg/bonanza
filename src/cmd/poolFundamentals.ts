import { FilterRule } from '../analyze/simpleFilter';
import { writeAnalysisJSON, writeAnalysisCSV } from '../utils';
import { loadMergedData } from '../analyze/dataMerger';
import { SimpleFilter } from '../analyze/simpleFilter';
import { loadAllSymbols, loadSymbolsByListing } from '../listing';
import { Listing } from '../const';
import * as pool from '../../config/listing/mypool.json';

(async () => {
  let symbols = [];
  let secs = {};
  for (const sector of Object.keys(pool)) {
    for (const subsector of Object.keys(pool[sector])) {
      if (pool[sector][subsector] instanceof Array) {
        for (const sym of pool[sector][subsector]) {
          secs[sym] = [sector, subsector];
          symbols.push(sym);
        }
      }
    }
  }
  const rawMerged = loadMergedData(symbols);
  for (const raw of rawMerged) {
    if (raw.symbol in secs) {
      const sector = secs[raw.symbol][0];
      const subsector = secs[raw.symbol][1];
      raw.sector = sector;
      raw.subsector = subsector;
    }
  }

  const headers = [
    { id: 'symbol', title: 'Sym' },
    { id: 'sector', title: 'Sec' },
    { id: 'subsector', title: 'SubSec' },
    { id: 'relativeStrength', title: 'relStr' },
    { id: 'shortTrend', title: 'c/e' },
    { id: 'mediumTrend', title: 's/m' },
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
  let sorted = rawMerged.sort((a, b): number => {
    if (a.sector == b.sector) {
      if (a.subsector == b.subsector) {
        return parseInt(a['upHigh']) < parseInt(b['upHigh']) ? 1 : -1;
      }
      return a.subsector > b.subsector ? 1 : -1;
    }
    return a.sector > b.sector ? 1 : -1;
  });
  await writeAnalysisCSV('pool.csv', headers, sorted);
})();
