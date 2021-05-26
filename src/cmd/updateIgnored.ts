import { loadAllSymbols } from '../listing';
import { SimpleFilter, FilterRule } from '../analyze/simpleFilter';
import { writeListingJSON } from '../utils';
import { loadMergedData } from '../analyze/dataMerger';

// generate an ignored listing for any stock in these situations:
// 1. missing data
// 2. eps next 5 year <= 0%
// 3. market cap < 100m

(async () => {
  const rules = [new FilterRule('market cap >= 30m')];
  const filter = new SimpleFilter(rules);

  const symbols = loadAllSymbols(false);
  const rawMerged = loadMergedData(symbols);
  const ignored = {};

  const visitedSymbols = {};
  for (const raw of rawMerged) {
    const fr = filter.match(raw);
    visitedSymbols[raw.symbol] = true;
    if (!fr.accepted) {
      ignored[raw.symbol] = fr.rejectReason;
    }
  }

  for (const sym of symbols) {
    if (!(sym in visitedSymbols)) {
      ignored[sym] = 'missing data';
    }
  }

  console.log(Object.keys(ignored).length);
  writeListingJSON('ignored.json', ignored);
})();
