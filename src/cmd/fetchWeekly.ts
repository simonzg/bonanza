import { loadAllSymbols } from '../listing';
import { Action, Source } from '../const';
import { runCmd } from './utils';

const fetchFinnhubWeekly = async (symbols: string[]) => {
  // get finnhub weekly data
  await runCmd(Action.fetch, Source.finnhub, ['price_target', 'recommend' /*'week_indicator'*/], symbols, true, false);
};

const fetchTipranks = async (symbols: string[]) => {
  // get tipranks data
  await runCmd(Action.fetch, Source.tipranks, ['page'], symbols, true, false);
};

(async () => {
  const symbols = loadAllSymbols();
  console.log({
    symbolCount: symbols.length,
  });

  await Promise.all([fetchTipranks(symbols), fetchFinnhubWeekly(symbols)]);
})();
