import inquirer from 'inquirer';
import { getModelNames, loadFinnhubAccounts } from './config';
import { loadSymbolsByListing } from './listing';
import { FetchTask } from './task/fetchTask';
import { CleanTask } from './task/cleanTask';
import { ShowTask } from './task/showTask';
import { TaskOption } from './task/task';
import { FinvizFetchTask } from './task/finvizFetchTask';
import { TaskExecutor, TaskExecutorOption } from './task/taskExecutor';
import {
  Listing,
  Action,
  Source,
  enumKeys,
  toListing,
  toAction,
  toSource,
} from './const';

(async () => {
  let models: string[];

  let answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What action do you want?',
      choices: enumKeys(Action),
    },
    {
      type: 'list',
      name: 'source',
      message: 'Which source do you want to use?',
      choices: enumKeys(Source),
    },
  ]);
  const action = toAction(answers.action);
  const source = toSource(answers.source);

  const modelChoices = getModelNames(source);
  if (modelChoices.length === 1) {
    models = modelChoices;
  } else {
    answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'models',
        message: 'Which models do you need?',
        choices: modelChoices,
      },
    ]);
    models = answers.models;
  }

  answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'listing',
      message: 'What predefined listing of symbols will you use?',
      choices: enumKeys(Listing),
    },
  ]);

  const listing = toListing(answers.listing);
  let symbols: string[];
  if (listing === Listing.Others) {
    answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'symbols',
        message: 'What symbols do you need?',
      },
    ]);
    symbols = answers.symbols.split(',');
  } else {
    symbols = await loadSymbolsByListing(listing);
  }
  console.log({
    action,
    source,
    models,
    symbolCount: symbols.length,
  });

  for (const model of models) {
    let options: TaskExecutorOption = {
      action,
      source,
      model,
      symbols,
      skipExisting: false,
      extraParams: {},
    };
    if (action === Action.fetch && source === Source.finnhub) {
      const accts = await loadFinnhubAccounts();
      const tokens = accts.map((acct) => acct.Token);
      options.extraParams['tokens'] = tokens;
    }
    let executor = new TaskExecutor(options);
    await executor.executeInSequence();
  }
})();
