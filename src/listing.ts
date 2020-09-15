import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'papaparse';
import { Listing } from './const';
/**
 * Data sources:
 * https://github.com/datasets/s-and-p-500-companies
 * https://github.com/datasets/nasdaq-listings
 * https://github.com/datasets/nyse-other-listings
 *
 */
export const loadListingFromFile = async (
  filename: string,
  symbolColName: string,
  companyNameColName: string
) => {
  return new Promise<string[]>((resolve, reject) => {
    const file = fs.readFileSync(
      path.join(__dirname, '..', 'config', filename),
      'utf8'
    );
    parse(file, {
      header: true,
      error: (err) => {
        console.log(err);
      },
      complete: (result) => {
        const symSet = {};
        const companies: { [key: string]: string[] } = {};
        for (const row of result.data) {
          let symbol = row[symbolColName];
          if (!symbol) {
            continue;
          }
          let name = row[companyNameColName];
          for (const separator of ['#', '.', '^', '$']) {
            if (symbol.includes(separator)) {
              symbol = symbol.substr(0, symbol.indexOf(separator));
            }
          }
          if (companies.hasOwnProperty(name)) {
            companies[name].push(symbol);
          } else {
            companies[name] = [symbol];
          }
        }

        for (const companySymbols of Object.values(companies)) {
          if (companySymbols.length === 1) {
            symSet[companySymbols[0]] = true;
          } else {
            const sym = companySymbols.reduce((prev, cur) => {
              try {
                return cur.length < prev.length ? cur : prev;
              } catch (e) {
                console.log('y', e);
                return '';
              }
            }, 'XXXXXXXX');
            symSet[sym] = true;
          }
        }
        resolve(Object.keys(symSet));
      },
    });
  });
};

export const loadMyOwnListing = (): string[] => {
  const filepath = path.join(__dirname, '..', 'config', 'myown-listing.json');
  const myown = JSON.parse(fs.readFileSync(filepath).toString());
  let symbols: { [key: string]: boolean } = {};
  for (const sector of Object.values(myown)) {
    for (const symList of Object.values(sector)) {
      for (const sym of symList) {
        symbols[sym] = true;
      }
    }
  }
  return Object.keys(symbols);
};

export const loadIgnoreListing = (): string[] => {
  const filepath = path.join(__dirname, '..', 'config', 'ignore-listing.json');
  const ignores = JSON.parse(fs.readFileSync(filepath).toString());
  return Object.keys(ignores);
};

export const loadSymbolsByListing = async (ex: Listing): Promise<string[]> => {
  let symbols = [];
  switch (ex) {
    case Listing.Myown:
      symbols = loadMyOwnListing();
      break;
    case Listing.Nasdaq:
      symbols = await loadListingFromFile(
        'nasdaq-listed.csv',
        'Symbol',
        'Company Name'
      );
      break;
    case Listing.Nyse:
      symbols = await loadListingFromFile(
        'nyse-listed.csv',
        'ACT Symbol',
        'Company Name'
      );
      break;
    case Listing.Russel2000:
      symbols = await loadListingFromFile(
        'russel2000.csv',
        'Security Ticker',
        'Security Description'
      );
      break;
    case Listing.SP500:
      symbols = await loadListingFromFile('sp500-listed.csv', 'Symbol', 'Name');
      break;
  }
  const ignores = new Set(loadIgnoreListing());
  console.log(`${ex}: Loaded ${symbols.length} symbols`);
  return symbols.filter((sym) => {
    return !ignores.has(sym);
  });
};

export const loadAllSymbols = async () => {
  const nasdaqSymbols = await loadSymbolsByListing(Listing.Nasdaq);
  const sp500Symbols = await loadSymbolsByListing(Listing.SP500);
  const nyseSymbols = await loadSymbolsByListing(Listing.Nyse);
  const myOwnSymbols = await loadSymbolsByListing(Listing.Myown);
  const symbolsSet = new Set(
    nasdaqSymbols.concat(sp500Symbols).concat(myOwnSymbols).concat(nyseSymbols)
  );
  const symbols = [...symbolsSet];
  return symbols;
};
