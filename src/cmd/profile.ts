#!/usr/bin/env node

import inquirer from 'inquirer';
import { loadMergedData } from '../analyze/dataMerger';

(async () => {
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
