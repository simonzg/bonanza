import { loadAllSymbols } from '../listing';
import { FinvizFilter, FinvizRule } from '../analyze/finvizFilter';
import { writeAnalysisResult } from '../analyze/filter';

// generate an ignored listing for any stock in these situations:
// 1. missing data
// 2. eps next 5 year <= 0%
// 3. market cap < 100m

(async () => {
  const rules = [
    new FinvizRule('eps next 5y > 0%'),
    new FinvizRule('market cap >= 100m'),
  ];
  const fzFilter = new FinvizFilter(rules);

  const symbols = await loadAllSymbols();
  const fzRejectedSymbols = {};

  for (const symbol of symbols) {
    const fzr = fzFilter.match(symbol);
    if (!fzr.accepted) {
      fzRejectedSymbols[symbol] = fzr.rejectReason;
    }
  }
  console.log(Object.keys(fzRejectedSymbols).length);
  writeAnalysisResult(
    'ignore-listing.json',
    JSON.stringify(fzRejectedSymbols, null, 2)
  );
})();
