export enum Listing {
  Top = 'Top (Nasdaq100 + S&P500 + DJI30)',
  All = 'All',
  Pool = 'Pool', // screening result
  Watchlist = 'Watchlist', // handpick stocks
  Portfolio = 'Portfolio', // positioned stocks
  Temporary = 'Temporary', // temporary list to focus
  Others = 'Others',
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
