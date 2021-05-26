import { readData } from '../utils';

const formatPercent = (num: number): string => {
  return `${Math.round(10000 * num) / 100}%`;
};

export const loadMergedData = (symbols: string[]) => {
  const result = [];
  const visited = {};
  const EMA = require('technicalindicators').EMA;

  let sp500Rate = 0;
  const spyStr = readData('finviz', 'page', 'SPY');
  try {
    if (!!spyStr) {
      const spy = JSON.parse(spyStr);
      const spyChange = spy['change'];
      sp500Rate = parseFloat(spyChange) / 100.0;
    }
  } catch (e) {
    // ignore
  }
  console.log('Base: SPY, change: ', sp500Rate);

  for (const symbol of symbols) {
    try {
      if (symbol in visited) {
        continue;
      }
      visited[symbol] = true;

      const priceTargetData = readData('finnhub', 'price_target', symbol);
      const candleData = readData('finnhub', 'candle', symbol);
      const dayIndicatorData = readData('finnhub', 'day_indicator', symbol);
      const recommendData = readData('finnhub', 'recommend', symbol);
      const finvizData = readData('finviz', 'page', symbol);
      const tiprankData = readData('tipranks', 'page', symbol);

      const profileData = readData('finnhub', 'profile', symbol);
      let industry = 'unknown';
      if (profileData) {
        industry = JSON.parse(profileData).finnhubIndustry;
      }
      if (!dayIndicatorData || !candleData || !priceTargetData || !recommendData || !finvizData) {
        continue;
      }

      const recommend = JSON.parse(recommendData);
      if (recommend.length <= 0) {
        continue;
      }
      const finviz = JSON.parse(finvizData);
      const dayIndicator = JSON.parse(dayIndicatorData);
      const candle = JSON.parse(candleData);
      const priceTarget = JSON.parse(priceTargetData);

      if (candle.c === undefined || priceTarget.targetHigh === undefined) {
        continue;
      }
      // close price of last day
      const closePrice = candle.c[candle.c.length - 1];

      // target price
      const targetHigh = priceTarget.targetHigh;
      const targetMedian = priceTarget.targetMedian;
      const targetLow = priceTarget.targetLow;
      if (targetHigh === targetLow) {
        continue;
      }

      // recommend count
      const buyTotal = recommend[0]['buy'] + recommend[0]['strongBuy'];
      const sellTotal = recommend[0]['sell'] + recommend[0]['strongSell'];
      const holdTotal = recommend[0]['hold'];

      // calculate change rate within time period:
      // 1m - one month, 3m - three months, 6m - six months, 1y - 1 year
      let rate1m = '0%',
        rate3m = '0%',
        rate6m = '0%',
        rate1y = '0%';
      if (candle.c.length > 30) {
        const price1m = Number(candle.c[candle.c.length - 30]);
        rate1m = formatPercent((closePrice - price1m) / price1m);
      }
      if (candle.c.length > 60) {
        const price3m = Number(candle.c[candle.c.length - 90]);
        rate3m = formatPercent((closePrice - price3m) / price3m);
      }
      if (candle.c.length > 180) {
        const price6m = Number(candle.c[candle.c.length - 180]);
        rate6m = formatPercent((closePrice - price6m) / price6m);
      }
      if (candle.c.length > 354) {
        const price1y = Number(candle.c[candle.c.length - 354]);
        rate1y = formatPercent((closePrice - price1y) / price1y);
      }

      // EMA
      const last2Close = candle.c[candle.c.length - 2];
      const rate1d = (closePrice - last2Close) / last2Close;
      const ema20Series = EMA.calculate({ period: 20, values: candle.c });
      const ema20 = ema20Series[ema20Series.length - 1];
      const ema60Series = EMA.calculate({ period: 60, values: candle.c });
      const ema60 = ema60Series[ema60Series.length - 1];
      const ema120Series = EMA.calculate({ period: 120, values: candle.c });
      const ema120 = ema120Series[ema120Series.length - 1];
      let relativeStrength = (rate1d - sp500Rate) / sp500Rate;
      if (sp500Rate < 0) {
        relativeStrength *= -1;
      }

      // TipRanks
      let trScore = 0,
        trBuy = 0,
        trHold = 0,
        trSell = 0,
        trPtLow = 0,
        trPtHigh = 0,
        trPt = 0,
        trUpLow = '0%',
        trUpHigh = '0%',
        trUp = '0%';
      let trStrongBuy = 0;

      try {
        const tr = JSON.parse(tiprankData);
        if (!!tr) {
          if (tr.consensuses && tr.consensuses.length > 0) {
            const d = tr.consensuses[0];
            trBuy = d.nB;
            trHold = d.nH;
            trSell = d.nS;
            trStrongBuy = trBuy >= 3 ? trBuy / (trBuy + trHold + trSell) : 0.45;
          }
          if (tr.ptConsensus && tr.ptConsensus.length > 0) {
            const pt = tr.ptConsensus[0];
            trPtLow = pt.low;
            trPtHigh = pt.high;
            trPt = pt.priceTarget;
            trUp = formatPercent((trPt - closePrice) / closePrice);
            trUpLow = formatPercent((trPtLow - closePrice) / closePrice);
            trUpHigh = formatPercent((trPtHigh - closePrice) / closePrice);
            trStrongBuy = trBuy >= 3 ? trBuy / (trBuy + trHold + trSell) : 0.45;
          }
          trScore = tr.tipranksStockScore ? tr.tipranksStockScore.score || 0 : 0;
        }
      } catch (e) {
        console.log('error during parse tiprank data for :', symbol);
      }

      result.push({
        symbol,
        industry,
        closePrice,
        targetHigh,
        targetMedian,
        targetLow,

        // percent towards target prices
        upLow: formatPercent((targetLow - closePrice) / closePrice),
        upMedian: formatPercent((targetMedian - closePrice) / closePrice),
        upHigh: formatPercent((targetHigh - closePrice) / closePrice),

        buyTotal,
        sellTotal,
        holdTotal,

        // used for filter
        buyMinusSell: buyTotal - sellTotal,
        buyMinusHold: buyTotal - holdTotal,

        // rate changed within 1month, 3months, 6months and 1year
        rate1d: formatPercent(rate1d),
        rate1m,
        rate3m,
        rate6m,
        rate1y,

        // EMA
        ema20,
        ema60,
        ema120,
        relativeStrength: formatPercent(relativeStrength), // relative strength to SP500
        shortTrend: formatPercent((closePrice - ema20) / ema20), // short term trend strength
        mediumTrend: formatPercent((ema20 - ema60) / ema60), // medium term trend strength
        longTrend: formatPercent((ema60 - ema120) / ema120), // long term trend strength

        // percent above EMA20 (negative means current price is below EMA)
        upEMA20: formatPercent((closePrice - ema20) / ema20),
        upEMA60: formatPercent((closePrice - ema60) / ema60),
        upEMA120: formatPercent((closePrice - ema120) / ema120),

        ...finviz,

        trScore,
        trUp,
        trUpHigh,
        trUpLow,
        trBuy,
        trSell,
        trHold,
        'trStrongBuy%': trStrongBuy,
        trPtHigh,
        trPtLow,
        trPt,
      });
    } catch (e) {
      console.log('ERROR HAPPENED: ', e);
      continue;
    }
  }
  return result;
};
