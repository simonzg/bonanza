import { readData } from './utils';
const MACD = require('technicalindicators').MACD;
const EMA = require('technicalindicators').EMA;
const TRIX = require('technicalindicators').TRIX;

const smaPeriod = 8;

const data = readData('finnhub', 'candle', 'MSFT');
const values = JSON.parse(data).c;

// const macdInput = {
//   values,
//   fastPeriod: 12,
//   slowPeriod: 26,
//   signalPeriod: 9,
//   SimpleMAOscillator: false,
//   SimpleMASignal: false,
// };

// const macd = MACD.calculate(macdInput);
// console.log('MACD:', macd, macd.length);
// for (const r of macd) {
//   console.log(r);
// }
const ema = EMA.calculate({ period: 20, values });
console.log('EMA:', ema, ema.length);

// const trix = TRIX.calculate({ values, period: 20 });
// for (const t of trix) {
// console.log(t);
// }
console.log(values.length);
