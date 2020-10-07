import inquirer from 'inquirer';
import { loadFinnhubAccounts } from '../config';
import { loadAllSymbols } from '../listing';
import { TaskExecutor, TaskExecutorOption } from '../task/taskExecutor';
import { Listing, Action, Source } from '../const';

const runCmd = async (
  action: Action,
  source: Source,
  models: string[],
  symbols: string[],
  proxyFetch: boolean,
  skipExisting: boolean
) => {
  for (const model of models) {
    let options: TaskExecutorOption = {
      action,
      source,
      model,
      symbols,
      proxyFetch,
      skipExisting,
      extraParams: {},
      batchInterval: 3000,
    };
    if (action === Action.fetch && source === Source.finnhub) {
      const accts = await loadFinnhubAccounts();
      const tokens = accts.map((acct) => acct.Token);
      options.extraParams['tokens'] = tokens;
    }

    let executor = new TaskExecutor(options);
    await executor.executeAll();
  }
};

(async () => {
  const symbols = loadAllSymbols();
  console.log({
    symbolCount: symbols.length,
  });
  // get finnhub one-time fact
  await runCmd(
    Action.fetch,
    Source.finnhub,
    ['profile', 'peer'],
    symbols,
    true,
    false
  );

  // get finnhub day data
  // await runCmd(Action.fetch, Source.finnhub, ['profile'], symbols, true, false);

  // get finnhub week data
  await runCmd(
    Action.fetch,
    Source.finnhub,
    ['price_target', 'recommend', 'week_indicator'],
    symbols,
    true,
    false
  );

  // get finviz data
  await runCmd(Action.fetch, Source.finviz, ['page'], symbols, true, false);

  // get tipranks data
  await runCmd(Action.fetch, Source.tipranks, ['page'], symbols, true, false);
})();
