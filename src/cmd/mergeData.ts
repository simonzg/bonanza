import { FilterRule } from '../analyze/simpleFilter';
import { writeAnalysisJSON, writeAnalysisCSV } from '../utils';
import { loadMergedData } from '../analyze/dataMerger';
import { SimpleFilter } from '../analyze/simpleFilter';
import { loadAllSymbols } from '../listing';

(async () => {
  const symbols = loadAllSymbols();
  const data = loadMergedData(symbols);
  writeAnalysisJSON('raw-merged.json', data);
})();
