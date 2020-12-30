import { Listing } from './const';
import * as nasdaq100 from '../config/listing/NDX.json';
import * as sp500 from '../config/listing/SP500.json';
import * as dji30 from '../config/listing/DJI.json';
import * as ignored from '../config/listing/ignored.json';
import * as pool from '../config/listing/pool.json';
import * as nyse from '../config/listing/nyse.json';
import * as nasdaq from '../config/listing/nasdaq.json';
import * as temporary from '../config/listing/temporary.json';
import * as portfolio from '../config/listing/portfolio.json';
import * as watchlist from '../config/listing/watchlist.json';
import { symlink, watch } from 'fs';

export const loadPoolSymbols = (): string[] => {
  let symbols: { [key: string]: boolean } = {};
  for (const sector of Object.values(pool)) {
    for (const symList of Object.values(sector)) {
      if (symList instanceof Array) {
        for (const sym of symList) {
          symbols[sym] = true;
        }
      }
    }
  }
  return Object.keys(symbols);
};

export const loadWatchlistSymbols = (): string[] => {
  let symbols: { [key: string]: boolean } = {};
  for (const sector of Object.values(watchlist)) {
    for (const symList of Object.values(sector)) {
      if (symList instanceof Array) {
        for (const sym of symList) {
          symbols[sym] = true;
        }
      }
    }
  }
  return Object.keys(symbols);
};

export const loadWatchlistSymbolWithCategory = () => {
  let symbols = {};
  for (const sector of Object.keys(watchlist)) {
    for (const category of Object.keys(watchlist[sector])) {
      const symList = watchlist[sector][category];
      if (symList instanceof Array) {
        for (const sym of symList) {
          symbols[sym] = { sector, category };
        }
      }
    }
  }
  return symbols;
};

export const loadSymbolsByListing = (ex: Listing): string[] => {
  let symbols = [];
  switch (ex) {
    case Listing.Portfolio:
      symbols = portfolio.symbols;
      break;
    case Listing.Temporary:
      symbols = temporary.symbols;
      break;
    case Listing.Watchlist:
      symbols = loadWatchlistSymbols();
      break;
    case Listing.Pool:
      symbols = loadPoolSymbols();
      break;
    case Listing.Top:
      symbols = nasdaq100.constituents.concat(dji30.constituents).concat(sp500.constituents);
      break;
    case Listing.All:
      symbols = loadAllSymbols();
      break;
  }
  const originLen = symbols.length;
  const ignoredSymbols = new Set(Object.keys(ignored));
  const filtered = symbols.filter((sym) => {
    return !ignoredSymbols.has(sym);
  });

  const ignoredLen = originLen - filtered.length;
  console.log(`${ex}: Loaded ${filtered.length} symbols (total: ${symbols.length}, ignored: ${ignoredLen})`);
  return filtered;
};

export const loadAllSymbols = (filter = true) => {
  const nasdaqSymbols = nasdaq.symbols;
  const nyseSymbols = nyse.symbols;
  const poolSymbols = loadPoolSymbols();
  const watchlistSymbols = loadWatchlistSymbols();
  const portfolioSymbols = portfolio.symbols;
  const temporarySymbols = temporary.symbols;
  const symbolsSet = new Set(
    nasdaqSymbols
      .concat(nyseSymbols)
      .concat(poolSymbols)
      .concat(watchlistSymbols)
      .concat(temporarySymbols)
      .concat(portfolioSymbols)
      .concat(dji30.constituents)
      .concat(nasdaq100.constituents)
      .concat(sp500.constituents)
  );
  const symbols = [...symbolsSet];
  const originLen = symbols.length;

  console.log('filter = ', filter);
  if (filter) {
    const ignoredSymbols = new Set(Object.keys(ignored));
    const filtered = symbols.filter((sym) => {
      return !ignoredSymbols.has(sym);
    });

    const ignoredLen = originLen - filtered.length;

    console.log(`Loaded ${filtered.length} symbols (total: ${symbols.length}, ignored: ${ignoredLen})`);
    return filtered;
  } else {
    console.log(`Loaded ${symbols.length} symbols`);
    return symbols;
  }
};
