import { loadAllSymbols } from '../listing';
import { SimpleFilter, FilterRule } from '../analyze/simpleFilter';
import { writeListingJSON } from '../utils';
import { loadMergedData } from '../analyze/dataMerger';

// generate an ignored listing for any stock in these situations:
// 1. missing data
// 2. eps next 5 year <= 0%
// 3. market cap < 100m

(async () => {
  const rules = [
    new FilterRule('eps next 5y > 0%'),
    new FilterRule('market cap >= 100m'),
  ];
  const filter = new SimpleFilter(rules);

  const symbols = loadAllSymbols();
  const rawMerged = loadMergedData();
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
