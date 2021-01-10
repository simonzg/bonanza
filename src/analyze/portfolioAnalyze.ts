import { FilterRule } from './simpleFilter';
import { writeAnalysisJSON, writeAnalysisCSV } from '../utils';
import { loadMergedData } from './dataMerger';
import { SimpleFilter } from './simpleFilter';
import { loadAllSymbols } from '../listing';
import { CSVHeaders } from '../const';

export const portfolioAnalyze = async (rawMerged: any[]) => {
  // const rawMerged = loadMergedData(['CRM', 'PFE', 'COST', 'LLY', 'NEE', 'AAPL', 'VRTX', 'NVDA', 'DXCM', 'NVTA', 'AMT']);

  for (const row of rawMerged) {
    const atr = Number(row['atr']);
    const p = Number(row['price']);
    const buyPrice = p + 0.5 * atr;
    const sellPrice = p - 2 * atr;
  }

  let sorted = accepted.sort((a, b): number => {
    return parseInt(a['upHigh']) < parseInt(b['upHigh']) ? 1 : -1;
  });
  await writeAnalysisCSV('watchlist-rsi.csv', CSVHeaders, sorted);
};
