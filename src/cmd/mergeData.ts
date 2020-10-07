import { FilterRule } from '../analyze/simpleFilter';
import { writeAnalysisJSON, writeAnalysisCSV } from '../utils';
import { loadMergedData } from '../analyze/dataMerger';
import { SimpleFilter } from '../analyze/simpleFilter';

(async () => {
  const data = loadMergedData();
  writeAnalysisJSON('raw-merged.json', data);
})();
