import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'papaparse';
import { Listing } from './const';

export const loadListingFromFile = async (
  filename: string,
  symbolColName: string
) => {
  return new Promise<string[]>((resolve, reject) => {
    const file = fs.readFileSync(
      path.join(__dirname, '..', 'config', filename),
      'utf8'
    );
    parse(file, {
      header: true,
      complete: (result) => {
        const symbols = result.data
          .map((row) => row[symbolColName])
          .filter((s: string) => !s.includes('^') && !s.includes('.'));
        resolve(symbols);
      },
    });
  });
};

export const loadMyOwnListing = (): string[] => {
  const filepath = path.join(__dirname, '..', 'config', 'myown_listing.json');
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

export const loadSymbolsByListing = async (ex: Listing): Promise<string[]> => {
  switch (ex) {
    case Listing.Myown:
      return loadMyOwnListing();
    case Listing.Amex:
      return await loadListingFromFile('AMEX.csv', 'Symbol');
    case Listing.Nasdaq:
      return await loadListingFromFile('NASDAQ.csv', 'Symbol');
    case Listing.Nyse:
      return await loadListingFromFile('NYSE.csv', 'Symbol');
    case Listing.Russel2000:
      return await loadListingFromFile('russel2000.csv', 'Security Ticker');
    case Listing.SP500:
      return await loadListingFromFile('sp500.csv', 'Ticker');
  }
};
