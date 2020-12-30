import { loadMergedData } from './dataMerger';
import { loadSymbolsByListing, loadWatchlistSymbolWithCategory } from '../listing';
import { CSVHeaders, Listing } from '../const';
import { writeAnalysisCSV } from '../utils';

export const writeFacts = async (list: Listing, filename: string) => {
  const symbols = loadSymbolsByListing(list);
  const facts = loadMergedData(symbols);
  const symSet = new Set([]);
  let missing = [];
  if (list === Listing.Watchlist) {
    const syms = loadWatchlistSymbolWithCategory();
    for (const f of facts) {
      if (f.symbol in syms) {
        f.sector = syms[f.symbol].sector;
        f.category = syms[f.symbol].category;
      }
    }
  }

  for (const f of facts) {
    symSet.add(f.symbol);
  }
  for (const sym of symbols) {
    if (!symSet.has(sym)) {
      missing.push(sym);
    }
  }
  if (missing.length > 0) {
    console.log(`List ${Listing[list]} missing data:`, missing.join(', '));
  }
  let headers = CSVHeaders;
  if (list === Listing.Watchlist) {
    headers.push({ id: 'sector', title: 'sec' }, { id: 'category', title: 'cat' });
  }
  await writeAnalysisCSV(filename, headers, facts);
};
