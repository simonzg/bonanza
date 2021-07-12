import { loadAllSymbols } from '../listing';
import { Action, Source } from '../const';
import { runCmd } from './utils';

const fetchFinnhubDaily = async (symbols: string[]) => {
  // get finnhub daily data
  await runCmd(Action.fetch, Source.finnhub, ['candle'], symbols, true, false);

  // get SPY, QQQ data
  await runCmd(Action.fetch, Source.finviz, ['page'], ['SPY', 'QQQ'], true, false);
};

const fetchFinviz = async (symbols: string[]) => {
  // get finviz data
  await runCmd(Action.fetch, Source.finviz, ['page'], symbols, true, false);
};

(async () => {
  const symbols = loadAllSymbols();
  console.log({
    symbolCount: symbols.length,
  });

  await Promise.all([fetchFinviz(symbols), fetchFinnhubDaily(symbols)]);
})();
