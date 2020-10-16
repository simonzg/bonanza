import { loadMergedData } from '../analyze/dataMerger';
import { loadSymbolsByListing } from '../listing';
import { Listing } from '../const';
import { writeAnalysisCSV } from '../utils';

const headers = [
  { id: 'symbol', title: 'Sym' },
  { id: 'industry', title: 'Ind' },
  { id: 'upMedian', title: 'up%' },
  { id: 'upHigh', title: 'uphigh%' },
  { id: 'rate1m', title: '1m%' },
  { id: 'rate6m', title: '6m%' },
  { id: 'sales q/q', title: 'sales q/q' },
  { id: 'eps q/q', title: 'eps q/q' },
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

const writeFacts = async (list: Listing, filename: string) => {
  const symbols = loadSymbolsByListing(list);
  const poolFacts = loadMergedData(symbols);
  const symSet = new Set([]);
  let missing = [];
  for (const f of poolFacts) {
    symSet.add(f.symbol);
  }
  for (const sym of symbols) {
    if (!symSet.has(sym)) {
      missing.push(sym);
    }
  }
  if (missing.length > 0) {
    console.log('Missing data for:', missing.join(', '));
  }
  await writeAnalysisCSV(filename, headers, poolFacts);
};

(async () => {
  await writeFacts(Listing.Pool, 'pool-facts.csv');
  await writeFacts(Listing.Portfolio, 'portfolio-facts.csv');
  await writeFacts(Listing.Temporary, 'temporary-facts.csv');
  await writeFacts(Listing.Watchlist, 'watchlist-facats.csv');
})();
