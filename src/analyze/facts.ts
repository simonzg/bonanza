import { loadMergedData } from './dataMerger';
import { loadSymbolsByListing, loadWatchlistSymbolWithCategory } from '../listing';
import { CSVHeaders, Listing, TiprankHeaders } from '../const';
import { writeAnalysisCSV } from '../utils';

let headers = CSVHeaders;
for (const col of TiprankHeaders) {
  headers.push(col);
}

export const writeFacts = async (list: Listing) => {
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

  if (list === Listing.Watchlist) {
    headers.push({ id: 'sector', title: 'sec' }, { id: 'category', title: 'cat' });
  }
  const filename = `facts-for-${Listing[list]}.csv`;
  await writeAnalysisCSV(filename, headers, facts);
  console.log(`[Done] collect facts for ${Listing[list]}`);
  console.log('-'.repeat(40));
};
