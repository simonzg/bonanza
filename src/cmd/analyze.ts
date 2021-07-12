import { loadMergedData } from '../analyze/dataMerger';
import { loadAllSymbols, loadWatchlistSymbols } from '../listing';
import { Listing } from '../const';
import { writeFacts } from '../analyze/facts';
import { watchlistTiming } from '../analyze/watchlistTiming';
import { shortTermBargainScreen, longTermBargainScreen, fundamentalScreen, strengthScreen, macdScreen, tipranksScreen, dividendScreen, farfetchScreen, peScreen, pegScreen } from '../screen';
import { sectorAnalyze } from '../analyze/sectorAnalyze';

(async () => {
  const symbols = loadAllSymbols();
  const rawMerged = loadMergedData(symbols);
  const wlSymbols = loadWatchlistSymbols();
  const rawMergedWL = loadMergedData(wlSymbols);

  await watchlistTiming(rawMergedWL);
  console.log(`[Done] timing watchlist`);

  await sectorAnalyze(rawMerged);

  await fundamentalScreen(rawMerged);
  await shortTermBargainScreen(rawMerged);
  await longTermBargainScreen(rawMerged);
  await strengthScreen(rawMerged);
  await farfetchScreen(rawMerged);
  await macdScreen(rawMerged);
  await tipranksScreen(rawMerged);
  await dividendScreen(rawMerged);
  await peScreen(rawMerged);
  await pegScreen(rawMerged);

  // write facts
  await writeFacts(Listing.Pool);
  await writeFacts(Listing.Portfolio);
  await writeFacts(Listing.Temporary);
  await writeFacts(Listing.Watchlist);
  await writeFacts(Listing.Sectors);
})();
