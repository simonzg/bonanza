import { fundamentalScreen } from '../analyze/fundamentalScreen';
import { strengthScreen } from '../analyze/strengthScreen';
import { loadMergedData } from '../analyze/dataMerger';
import { loadAllSymbols } from '../listing';

(async () => {
  const symbols = loadAllSymbols();
  const rawMerged = loadMergedData(symbols);

  await fundamentalScreen(rawMerged);
  console.log('done screening for fundamentals');
  await strengthScreen(rawMerged);
  console.log('done screening for strength');
})();
