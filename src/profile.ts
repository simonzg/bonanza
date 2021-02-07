#!/usr/bin/env node

import inquirer from 'inquirer';
import { getModelNames, loadFinnhubAccounts } from './config';
import { loadSymbolsByListing } from './listing';
import { TaskExecutor, TaskExecutorOption } from './task/taskExecutor';
import { Listing, Action, Source, enumKeys, toListing, toAction, toSource } from './const';
import { loadMergedData } from './analyze/dataMerger';

(async () => {
  let models: string[];

  let answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'symbol',
      message: "Which stock's profile do you want to see?",
    },
  ]);
  const { symbol } = answers;
  const datas = loadMergedData([symbol]);
  for (const d of datas) {
    for (const key in d) {
      console.log(`${key} : ${d[key]}`);
    }
  }
})();
