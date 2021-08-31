import { loadMergedData } from '../analyze/dataMerger';
import { loadAllSymbols, loadWatchlistSymbols } from '../listing';
import { Listing } from '../const';
import { writeFacts } from '../analyze/facts';
import { watchlistTiming } from '../analyze/watchlistTiming';
import { plungeScreen, skyrocketScreen, bestScreen, trendScreen, bargainScreen, macdScreen, outdatedScreen } from '../screen';
import { sectorAnalyze } from '../analyze/sectorAnalyze';
import { raw } from 'body-parser';

(async () => {
  const symbols = loadAllSymbols();
  const rawMerged = loadMergedData(symbols);
  const wlSymbols = loadWatchlistSymbols();
  const rawMergedWL = loadMergedData(wlSymbols);

  await watchlistTiming(rawMergedWL);
  console.log(`[Done] timing watchlist`);

  await sectorAnalyze(rawMerged);

  await macdScreen(rawMerged);
  await bestScreen(rawMerged);
  await bargainScreen(rawMerged);
  await trendScreen(rawMerged);
  await outdatedScreen(rawMerged);

  await plungeScreen(rawMerged, 0.08, 10); // plunged > 8% within 10days
  await skyrocketScreen(rawMerged, 0.08, 10); // skyrocketed > 8% within 10days

  // write facts
  await writeFacts(Listing.Pool);
  await writeFacts(Listing.Portfolio);
  await writeFacts(Listing.Temporary);
  await writeFacts(Listing.Watchlist);
  await writeFacts(Listing.Sectors);
})();
