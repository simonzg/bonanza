import { Listing } from './const';
import * as nasdaq100 from '../config/listing/NDX.json';
import * as sp500 from '../config/listing/SP500.json';
import * as dji30 from '../config/listing/DJI.json';
import * as ignored from '../config/listing/ignored.json';
import * as myown from '../config/listing/myown.json';
import * as nyse from '../config/listing/nyse.json';
import * as nasdaq from '../config/listing/nasdaq.json';

export const loadMyOwnListing = (): string[] => {
  let symbols: { [key: string]: boolean } = {};
  for (const sector of Object.values(myown)) {
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

export const loadSymbolsByListing = (ex: Listing): string[] => {
  let symbols = [];
  switch (ex) {
    case Listing.Myown:
      symbols = loadMyOwnListing();
      break;
    case Listing.Top:
      symbols = nasdaq100.constituents
        .concat(dji30.constituents)
        .concat(sp500.constituents);
      break;
    case Listing.All:
      symbols = loadAllSymbols();
      break;
  }
  const ignoredSymbols = new Set(Object.keys(ignored));
  const filtered = symbols.filter((sym) => {
    return !ignoredSymbols.has(sym);
  });

  console.log(
    `${ex}: Loaded ${filtered.length} symbols (total: ${symbols.length}, ignored: ${ignoredSymbols.size})`
  );
  return filtered;
};

export const loadAllSymbols = (filter = true) => {
  const nasdaqSymbols = nasdaq.symbols;
  const nyseSymbols = nyse.symbols;
  const myOwnSymbols = loadMyOwnListing();
  const symbolsSet = new Set(
    nasdaqSymbols
      .concat(nyseSymbols)
      .concat(myOwnSymbols)
      .concat(dji30.constituents)
      .concat(nasdaq100.constituents)
      .concat(sp500.constituents)
  );
  const symbols = [...symbolsSet];

  console.log('filter = ', filter);
  if (filter) {
    const ignoredSymbols = new Set(Object.keys(ignored));
    const filtered = symbols.filter((sym) => {
      return !ignoredSymbols.has(sym);
    });

    console.log(
      `Loaded ${filtered.length} symbols (total: ${symbols.length}, ignored: ${ignoredSymbols.size})`
    );
    return filtered;
  } else {
    console.log(`Loaded ${symbols.length} symbols`);
    return symbols;
  }
};
