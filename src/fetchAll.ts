import inquirer from 'inquirer';
import { getModelNames, loadFinnhubAccounts } from './config';
import { loadSymbolsByListing } from './listing';
import { TaskExecutor, TaskExecutorOption } from './task/taskExecutor';
import { Listing, Action, Source } from './const';

(async () => {
  const listing = Listing.Nasdaq;
  const nasdaqSymbols = await loadSymbolsByListing(Listing.Nasdaq);
  const sp500Symbols = await loadSymbolsByListing(Listing.SP500);
  const myOwnSymbols = await loadSymbolsByListing(Listing.Myown);
  const amexSymbols = await loadSymbolsByListing(Listing.Amex);
  const symbolsSet = new Set(
    nasdaqSymbols.concat(sp500Symbols).concat(myOwnSymbols).concat(amexSymbols)
  );
  const symbols = [...symbolsSet];
  console.log({
    symbolCount: symbols.length,
  });
  // // get finnhub one-time fact
  // await runCmd(
  //   Action.fetch,
  //   Source.finnhub,
  //   ['profile', 'peer'],
  //   symbols,
  //   true,
  //   false
  // );

  // // get finnhub day data
  // await runCmd(
  //   Action.fetch,
  //   Source.finnhub,
  //   ['candle', 'day_indicator', 'day_pattern'],
  //   symbols,
  //   true,
  //   false
  // );

  // // get finnhub week data
  // await runCmd(
  //   Action.fetch,
  //   Source.finnhub,
  //   ['price_target', 'recommend', 'week_indicator'],
  //   symbols,
  //   true,
  //   false
  // );

  await runCmd(
    Action.fetch,
    Source.finnhub,
    ['day_pattern', 'week_indicator'],
    symbols,
    true,
    false
  );

  // get finviz data
  // await runCmd(Action.fetch, Source.finviz, ['page'], symbols, true, false);

  // get tipranks data
  // await runCmd(Action.fetch, Source.tipranks, ['page'], symbols, true, false);
})();

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
