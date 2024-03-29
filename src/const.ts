export enum Listing {
  Top = 'Top (Nasdaq100 + S&P500 + DJI30)',
  All = 'All',
  Pool = 'Pool', // screening result
  Watchlist = 'Watchlist', // handpick stocks
  Portfolio = 'Portfolio', // positioned stocks
  Temporary = 'Temporary', // temporary list to focus
  Others = 'Others',
  Sectors = 'Sectors',
}

export enum Action {
  fetch = 0,
  clean,
  show,
}

export enum Source {
  finviz = 0,
  finnhub,
  tipranks,
}

export const enumKeys = (es: any) => Object.values(es).filter((x) => typeof x === 'string');

export const toListing = (val: string): Listing => {
  for (const [k, v] of Object.entries(Listing)) {
    if (v === val) {
      return Listing[k];
    }
  }
};

export const toAction = (key: string): Action => {
  for (const [k, v] of Object.entries(Action)) {
    if (k === key) {
      return Action[k];
    }
  }
};

export const toSource = (key: string): Source => {
  for (const [k, v] of Object.entries(Source)) {
    if (k === key) {
      return Source[k];
    }
  }
};

export const CSVHeaders = [
  { id: 'symbol', title: 'sym' },

  // fundamentals
  { id: 'industry', title: 'ind' },
  { id: 'upMedian', title: 'up%' },

  // tipranks
  { id: 'trUp', title: 'trUp%' },
  { id: 'trUpLow', title: 'trUpLow%' },
  { id: 'trScore', title: 'trScore' },
  { id: 'trBuy', title: 'nB' },
  { id: 'trBuy%', title: 'B%' },

  // fundamentals
  { id: 'dividend %', title: 'div%' },
  { id: 'roe', title: 'roe' },
  { id: 'p/e', title: 'p/e' },
  { id: 'peg', title: 'peg' },
  { id: 'rsi (14)', title: 'rsi' },
  { id: 'atr', title: 'atr' },
  { id: 'sales q/q', title: 'sales q/q' },
  { id: 'eps q/q', title: 'eps q/q' },
  { id: 'eps next 5y', title: 'eps>5y' },
  { id: 'eps past 5y', title: 'eps<5y' },
  { id: 'closePrice', title: 'p' },

  // strength
  { id: 'market cap', title: 'mcap' },
  { id: 'relativeStrength', title: 'relStr' },
  { id: 'shortTrend', title: 'c/s' },
  { id: 'mediumTrend', title: 's/m' },
  { id: 'longTrend', title: 'm/l' },

  // momentum
  { id: 'upEMA20', title: 'ema20%' },
  { id: 'upEMA60', title: 'ema60%' },
  { id: 'upEMA120', title: 'ema120%' },

  // performance
  { id: 'rate1m', title: '1m%' },
  { id: 'rate6m', title: '6m%' },

  // update info
  { id: 'lastUpdated', title: 'lastUpdated' },
  { id: 'outdated', title: 'outdated' },
];
