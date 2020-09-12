import { readData } from './utils';
import { loadAllSymbols } from './listing';
import { FinvizFilter } from './analyze/finvizFilter';
import { FinnhubFilter } from './analyze/finnhubFilter';
import {
  FilterResult,
  writeAnalysisResult,
  writeCSVResult,
} from './analyze/filter';

const daysOfYear = () => {
  const now = new Date().getTime();
  const start = new Date(new Date().getFullYear(), 0, 0).getTime();
  var diff = now - start;
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);
  return day;
};

const writeRejectedData = (filename: string, results: FilterResult[]) => {
  let data = 'Symbol,Reject Reason\n';
  for (const r of results) {
    data += `${r.symbol},${r.rejectReason}\n`;
  }
  writeAnalysisResult(filename, data);
};

const writeFacts = (filename: string, symbols: string[]) => {
  console.log('save facts for ', filename);
  let facts = [];
  for (const symbol of symbols) {
    try {
      const candle = JSON.parse(readData('finnhub', 'candle', symbol));
      const priceTarget = JSON.parse(
        readData('finnhub', 'price_target', symbol)
      );
      const industry = getIndustry(symbol);
      const finviz = JSON.parse(readData('finviz', 'page', symbol));
      const price = candle.c[candle.c.length - 1];
      const price1m = Number(candle.c[candle.c.length - 30]);
      const rate1m =
        String(
          Math.floor(((price - Number(price1m)) / price1m) * 10000) / 100
        ) + '%';
      const price3m = candle.c[candle.c.length - 90];
      const rate3m =
        String(
          Math.floor(((price - Number(price3m)) / price3m) * 10000) / 100
        ) + '%';
      const price6m = candle.c[candle.c.length - 180];
      const rate6m =
        String(
          Math.floor(((price - Number(price6m)) / price6m) * 10000) / 100
        ) + '%';

      const up =
        (Number(priceTarget.targetMedian) - Number(price)) / Number(price);
      const uphigh =
        (Number(priceTarget.targetHigh) - Number(price)) / Number(price);

      if (priceTarget.targetLow === priceTarget.targetHigh) {
        continue;
      }
      if (finviz['eps past 5y'] === '-' && finviz['eps next 5y'] === '-') {
        continue;
      }
      facts.push({
        symbol,
        industry,
        targetLow: priceTarget.targetLow,
        targetHigh: priceTarget.targetHigh,
        targetMedian: priceTarget.targetMedian,
        price,
        'up%': String(Math.floor(up * 10000) / 100) + '%',
        'uphigh%': String(Math.floor(uphigh * 10000) / 100) + '%',
        rate1m: rate1m,
        rate3m: rate3m,
        rate6m: rate6m,
        ...finviz,
      });
    } catch (e) {
      console.log('skip ', symbol);
      continue;
    }
  }
  const headers = [
    { id: 'symbol', title: 'Sym' },
    { id: 'industry', title: 'Ind' },
    { id: 'targetMedian', title: 'Tgt M' },
    { id: 'price', title: 'p' },
    { id: 'up%', title: 'up%' },
    { id: 'uphigh%', title: 'uphigh%' },
    { id: 'rate1m', title: '1m%' },
    { id: 'rate3m', title: '3m%' },
    { id: 'rate6m', title: '6m%' },
    { id: 'eps next 5y', title: 'eps>5y' },
    { id: 'eps past 5y', title: 'eps<5y' },
    { id: 'roe', title: 'roe' },
    { id: 'targetHigh', title: 'Tgt H' },
  ];
  writeCSVResult(filename, headers, facts).then(() => {
    console.log('saved: ', filename);
  });
};

const writeAcceptedData = (sl1: string[], sl2: string[]) => {
  let intersect = [];
  let leftover = [];
  let inds = {};
  for (const sym of sl1.concat(sl2)) {
    inds[sym] = getIndustry(sym);
  }

  let finvizByIndustry = {};
  let finnhubByIndustry = {};
  for (const symbol of sl1) {
    const industry = inds[symbol];
    finvizByIndustry[industry] = finvizByIndustry[industry] || [];
    finvizByIndustry[industry].push(symbol);
  }

  for (const symbol of sl2) {
    const industry = inds[symbol];
    finnhubByIndustry[industry] = finnhubByIndustry[industry] || [];
    finnhubByIndustry[industry].push(symbol);
  }

  writeAnalysisResult(
    'finviz_accepted.json',
    JSON.stringify(finvizByIndustry, null, 2)
  );
  writeAnalysisResult(
    'finnhub_accepted.json',
    JSON.stringify(finnhubByIndustry, null, 2)
  );

  for (const s of sl1) {
    if (sl2.indexOf(s) >= 0) {
      intersect.push(s);
      delete sl2[sl2.indexOf(s)];
    } else {
      leftover.push(s);
    }
  }
  for (const s of sl2) {
    if (s) {
      leftover.push(s);
    }
  }
  let intersectByIndustry = new Map();
  let leftoverByIndustry = new Map();

  for (const symbol of intersect) {
    const industry = inds[symbol];
    intersectByIndustry[industry] = intersectByIndustry[industry] || [];
    intersectByIndustry[industry].push(symbol);
  }
  writeAnalysisResult(
    'intersect.json',
    JSON.stringify(intersectByIndustry, null, 2)
  );

  for (const symbol of leftover) {
    const industry = getIndustry(symbol);
    leftoverByIndustry[industry] = leftoverByIndustry[industry] || [];
    leftoverByIndustry[industry].push(symbol);
  }
  writeAnalysisResult(
    'leftover.json',
    JSON.stringify(leftoverByIndustry, null, 2)
  );

  writeFacts('intersect.csv', intersect);
  writeFacts('leftover.csv', leftover);
};

const getIndustry = (symbol) => {
  const content = readData('finnhub', 'profile', symbol);
  if (!content) {
    return 'unknown';
  }
  return JSON.parse(content).finnhubIndustry;
};

(async () => {
  const fzFilter = new FinvizFilter();
  const fhFilter = new FinnhubFilter();

  const symbols = await loadAllSymbols();
  const fzAcceptedSymbols: string[] = [];
  const fzRejected: FilterResult[] = [];
  const fhAcceptedSymbols: string[] = [];
  const fhRejected: FilterResult[] = [];

  for (const symbol of symbols) {
    const fzr = fzFilter.match(symbol);
    if (fzr.accepted) {
      fzAcceptedSymbols.push(symbol);
    } else {
      fzRejected.push(fzr);
    }
    const fhr = fhFilter.match(symbol);
    if (fhr.accepted) {
      fhAcceptedSymbols.push(symbol);
    } else {
      fhRejected.push(fhr);
    }
  }

  writeRejectedData('finviz_rejected.csv', fzRejected);
  writeRejectedData('finnhub_rejected.csv', fhRejected);

  writeAcceptedData(fzAcceptedSymbols, fhAcceptedSymbols);
})();
