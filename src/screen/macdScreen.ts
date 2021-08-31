import { readData, writeAnalysisCSV } from '../utils';
import { CSVHeaders } from '../const';
import { BasicScreenRules, descMacd } from './screenRules';
import { SimpleFilter } from '../analyze/simpleFilter';
const MACD = require('technicalindicators').MACD;

export const macdScreen = async (rawMerged: any[]) => {
  let accepted = [];
  for (const raw of rawMerged) {
    const data = readData('finnhub', 'candle', raw.symbol);
    const values = JSON.parse(data).c;

    const macdInput = {
      values,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    };

    const macd = MACD.calculate(macdInput);
    if (macd.length < 4) {
      continue;
    }
    const last4 = macd.slice(Math.max(macd.length - 4, 1));
    const last4Dif = [];
    for (const d of last4) {
      last4Dif.push({
        dif: d.signal - d.MACD,
        macd: d.histogram * 2,
      });
    }

    let expand = false;
    let upward = false;
    for (let i = 0; i < last4Dif.length - 1; i++) {
      const cur = last4Dif[i];
      const nxt = last4Dif[i + 1];
      if (nxt.dif >= cur.dif && nxt > 0 && cur > 0) {
        expand = true;
      } else {
        expand = false;
      }
      if (nxt.macd >= cur.macd) {
        upward = true;
      } else {
        upward = false;
      }
    }
    const deadCross = !upward && last4Dif[0].macd >= 0 && last4Dif[last4Dif.length - 1].macd < 0;
    const goldCross = upward && last4Dif[0].macd <= 0 && last4Dif[last4Dif.length - 1].macd > 0;

    if (goldCross) {
      raw.macd = last4Dif[last4Dif.length - 1].macd;
      raw.expand = expand;
      accepted.push(raw);
    }
  }

  let headers = CSVHeaders;
  headers.push({ id: 'macd', title: 'macd' }, { id: 'expand', title: 'ex' });
  const filter = new SimpleFilter(...BasicScreenRules);
  const res = filter.matchAll(accepted);
  const sorted = res.accepted.sort(descMacd);

  await writeAnalysisCSV('picked-by-macd.csv', headers, sorted);
  console.log('[Done] screening for macd');
  console.log('-'.repeat(40));
};
