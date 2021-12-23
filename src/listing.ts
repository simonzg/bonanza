import { Listing } from './const';
import * as nasdaq100 from '../config/listing/NDX.json';
import * as sp500 from '../config/listing/SP500.json';
import * as dji30 from '../config/listing/DJI.json';
import * as ignored from '../config/listing/ignored.json';
import * as nyse from '../config/listing/nyse.json';
import * as nasdaq from '../config/listing/nasdaq.json';
import * as portfolio from '../config/listing/portfolio.json';
import * as watchlist from '../config/listing/watchlist.json';
import * as sectors from '../config/listing/sectors.json';
import * as temp from '../config/listing/temporary.json';

export const loadSectorSymbols = (): string[] => {
  let symbols = [];
  for (const sector in sectors) {
    if (sectors[sector] instanceof Array) {
      symbols = symbols.concat(sectors[sector]);
    }
  }
  return symbols;
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

export const loadTemporarySymbols = (): string[] => {
  return temp.symbols;
};

export const loadSectorSymbolsWithSector = () => {
  let symbols = {};
  for (const sector of Object.keys(sectors)) {
    if (!(sectors[sector] instanceof Array)) {
      continue;
    }
    for (const sym of sectors[sector]) {
      symbols[sym] = sector;
    }
  }
  return symbols;
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
    case Listing.Watchlist:
      symbols = loadWatchlistSymbols();
      break;
    case Listing.Sectors:
      symbols = loadSectorSymbols();
      break;
    case Listing.Top:
      symbols = nasdaq100.constituents.concat(dji30.constituents).concat(sp500.constituents);
      break;
    case Listing.All:
      symbols = loadAllSymbols();
      break;
    case Listing.Temporary:
      symbols = loadTemporarySymbols();
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
  const watchlistSymbols = loadWatchlistSymbols();
  const portfolioSymbols = portfolio.symbols;
  const symbolsSet = new Set(nasdaqSymbols.concat(nyseSymbols).concat(watchlistSymbols).concat(portfolioSymbols).concat(dji30.constituents).concat(nasdaq100.constituents).concat(sp500.constituents));
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
