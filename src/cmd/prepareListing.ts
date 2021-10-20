import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'papaparse';
import { writeListingJSON } from '../utils';

/**
 * Data sources:
 * https://github.com/datasets/s-and-p-500-companies
 * https://github.com/datasets/nasdaq-listings
 * https://github.com/datasets/nyse-other-listings
 *
 */
export const loadListingFromCSV = async (filename: string, symbolColName: string, companyNameColName: string) => {
  return new Promise<string[]>((resolve, reject) => {
    const file = fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'listing', filename), 'utf8');
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

(async () => {
  const nasdaqSymbols = await loadListingFromCSV('nasdaq-listed.csv', 'Symbol', 'Company Name');
  const nyseSymbols = await loadListingFromCSV('nyse-listed.csv', 'ACT Symbol', 'Company Name');
  writeListingJSON('nasdaq.json', { symbols: nasdaqSymbols });
  writeListingJSON('nyse.json', { symbols: nyseSymbols });
})();
