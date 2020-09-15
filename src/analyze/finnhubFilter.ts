import { Filter, FilterResult } from './filter';
import { readData } from '../utils';

export class FinnhubFilter extends Filter {
  match(symbol: string): FilterResult {
    try {
      const priceTarget = readData('finnhub', 'price_target', symbol);
      const candle = readData('finnhub', 'candle', symbol);
      const dayIndicator = readData('finnhub', 'day_indicator', symbol);
      const recommend = readData('finnhub', 'recommend', symbol);

      if (!dayIndicator || !candle || !priceTarget || !recommend) {
        return {
          symbol,
          accepted: false,
          rejectReason: 'missing data for analysis',
        };
      }

      const di = JSON.parse(dayIndicator);
      const cdl = JSON.parse(candle);
      const ptg = JSON.parse(priceTarget);
      const rmd = JSON.parse(recommend);

      /* Day Indicator
      {
          "technicalAnalysis": {
              "count": {
              "buy": 4,
              "neutral": 7,
              "sell": 6
              },
              "signal": "neutral"
          },
          "trend": {
              "adx": 12.884892439260407,
              "trending": false
          }
      }
      */
      /*
      if (!di.trend || !di.trend.trending) {
        // console.log(`skip ${symbol} due to trending`);
        return {
          symbol,
          accepted: false,
          rejectReason: 'trending is false in day_indicator',
        };
      }
      */

      /* Price Target
      {
          "lastUpdated": "",
          "symbol": "",
          "targetHigh": 0,
          "targetLow": 0,
          "targetMean": 0,
          "targetMedian": 0
      }
  
      Candle 
      {
          c: [p1, p2, p3 ... latest price] // close
          o: [...] // open
          h: [...] // high
          l: [...] // low
      }
      */
      //   if (
      //     !ptg.targetMedian ||
      //     !cdl.c ||
      //     ptg.targetHigh < cdl.c[cdl.c.length - 1] ||
      //     ptg.targetLow > cdl.c[cdl.c.length - 1]
      //   ) {
      //     return {
      //       symbol,
      //       accepted: false,
      //       rejectReason:
      //         'target high < latest price || target low > latest price',
      //     };
      //   }
      if (
        !ptg.targetHigh ||
        !ptg.targetLow ||
        ptg.targetHigh === ptg.targetLow
      ) {
        return {
          symbol,
          accepted: false,
          rejectReason: 'target high = target low (1 analyst)',
        };
      }

      /* Recommend
      [ {
          "buy": 9,
          "hold": 4,
          "period": "2020-07-01",
          "sell": 0,
          "strongBuy": 6,
          "strongSell": 0,
          "symbol": "TWLO"
      }, ...]
      */
      if (rmd.length < 0 || !rmd[0]) {
        return {
          symbol,
          accepted: false,
          rejectReason: 'missing recommend info',
        };
      }
      const b = rmd[0]['buy'];
      const sb = rmd[0]['strongBuy'];
      const h = rmd[0]['hold'];
      const ss = rmd[0]['strongSell'];
      const s = rmd[0]['sell'];
      if (b + sb < h) {
        return { symbol, accepted: false, rejectReason: 'totalBuy < hold' };
      }
      if (s + ss > b + sb) {
        return {
          symbol,
          accepted: false,
          rejectReason: 'totalSell < totalBuy',
        };
      }
      if ((b + sb + h) / (b + sb + h + s + ss) < 0.5) {
        return {
          symbol,
          accepted: false,
          rejectReason: 'totalBuy + hold < 50%',
        };
      }
      return { symbol, accepted: true, rejectReason: '' };
    } catch (e) {
      return { symbol, accepted: false, rejectReason: e.message };
    }
  }
}
