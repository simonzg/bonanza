import { macdScreen } from '../analyze/macdScreen';
import { loadMergedData } from '../analyze/dataMerger';

(async () => {
  const symbols = ['MSFT'];
  const rawMerged = loadMergedData(symbols);

  await macdScreen(rawMerged);
  console.log('[Done] MACD screening');
})();
