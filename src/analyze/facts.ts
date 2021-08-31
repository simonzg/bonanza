import { loadMergedData } from './dataMerger';
import { loadSectorSymbolsWithSector, loadSymbolsByListing, loadWatchlistSymbolWithCategory } from '../listing';
import { CSVHeaders, Listing } from '../const';
import { writeAnalysisCSV } from '../utils';

let headers = CSVHeaders;
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
  if (list === Listing.Sectors) {
    const syms = loadSectorSymbolsWithSector();
    for (const f of facts) {
      if (f.symbol in syms) {
        f.sector = syms[f.symbol];
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
  if (list === Listing.Sectors) {
    headers.shift();
    headers.shift();
    headers.unshift({ id: 'sector', title: 'sec' });
    headers.unshift({ id: 'symbol', title: 'sym' });
  }
  const filename = `facts-${Listing[list]}.csv`.toLowerCase();
  await writeAnalysisCSV(filename, headers, facts);
  console.log(`[Done] collect facts for ${Listing[list]}`);
  console.log('-'.repeat(40));
};
