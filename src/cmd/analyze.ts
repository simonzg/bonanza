import { fundamentalScreen } from '../analyze/fundamentalScreen';
import { strengthScreen } from '../analyze/strengthScreen';
import { loadMergedData } from '../analyze/dataMerger';
import { loadAllSymbols } from '../listing';
import { Listing } from '../const';
import { writeFacts } from '../analyze/facts';

(async () => {
  const symbols = loadAllSymbols();
  const rawMerged = loadMergedData(symbols);

  await fundamentalScreen(rawMerged);
  console.log('[Done] screening for fundamentals');

  await strengthScreen(rawMerged);
  console.log('[Done] screening for strength');

  await writeFacts(Listing.Pool, 'pool-facts.csv');
  console.log('[Done] collecting facts for pool');

  await writeFacts(Listing.Portfolio, 'portfolio-facts.csv');
  console.log('[Done] collecting facts for portfolio');

  await writeFacts(Listing.Temporary, 'temporary-facts.csv');
  console.log('[Done] collecting facts for temporary');

  await writeFacts(Listing.Watchlist, 'watchlist-facts.csv');
  console.log('done collecting facts for watchlist');
})();
