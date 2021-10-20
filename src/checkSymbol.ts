#!/usr/bin/env node

import { loadAllSymbols } from './listing';
import * as ignored from '../config/listing/ignored.json';
import { loadMergedData } from './analyze/dataMerger';
(async () => {
  if (process.argv.length < 3) {
    console.log('[Usage] node checkSymbol.ts [Symbol]');
    process.exit(-1);
  }
  const symbols = loadAllSymbols();
  const target = process.argv[2];
  console.log('TARGET: ', target);
  let found = false;
  for (const s of symbols) {
    if (s.toLowerCase() === target.toLowerCase()) {
      console.log('FOUND: ', target);
      found = true;
    }
  }
  if (found) {
    for (const sym in ignored) {
      if (sym.toLowerCase() === target.toLowerCase()) {
        console.log('BUT IGNORED: ', ignored[sym]);
      }
    }
    const merged = loadMergedData([target.toUpperCase()]);
    console.log('loaded data: ', merged);
  } else {
    console.log('NOT FOUND: ', target);
  }
})();
