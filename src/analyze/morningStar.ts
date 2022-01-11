import { loadAllSymbols, loadSymbolsByListing } from '../listing';
import { loadMergedData } from './dataMerger';
import { parse } from 'papaparse';
import * as fs from 'fs';
import * as path from 'path';
import { writeAnalysisCSV } from '../utils';
import { Listing } from '../const';

export const loadMorningStars = async () => {
  return new Promise<any>((resolve, reject) => {
    const file = fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'morning-star-2022-1.csv'), 'utf8');
    parse(file, {
      header: true,
      complete: (result) => {
        resolve(result.data);
      },
    });
  });
};

const formatPercent = (num: number): string => {
  return `${Math.round(10000 * num) / 100}%`;
};

export const updateMorningStarRating = async () => {
  const symbols = loadAllSymbols();
  const portfolioSyms = loadSymbolsByListing(Listing.Portfolio);
  let porfolio = {};
  portfolioSyms.forEach((sym) => {
    porfolio[sym] = true;
  });
  const rawMerged = loadMergedData(symbols);
  let dataMap = {};
  for (const row of rawMerged) {
    dataMap[row.symbol] = row;
  }

  const parsed = await loadMorningStars();
  for (const row of parsed) {
    if (row.Stock in dataMap) {
      const data = dataMap[row.Stock];
      row['mcap'] = data['market cap'];
      row['price'] = data['closePrice'];
      row['trUp%'] = data['trUp'];
      row['fair%'] = formatPercent((Number(row['Fair$']) - Number(data['closePrice'])) / Number(data['closePrice']));
      row['H'] = row.Stock in porfolio ? 'Y' : '';
      row['Stock'] += row['Leadership'] === 'Exemplary' ? ' *' : '';
    }
  }
  let sorted = parsed.sort((a, b) => {
    const astar = Number(a['Star']);
    const bstar = Number(b['Star']);
    const afair = parseFloat(a['Fair%']);
    const bfair = parseFloat(b['Fair%']);
    if (astar == bstar) {
      if (isNaN(afair) && isNaN(bfair)) {
        return -1;
      }
      if (isNaN(afair)) {
        return 1;
      }
      if (isNaN(bfair)) {
        return -1;
      }
      return afair > bfair ? -1 : 1;
    } else {
      return astar > bstar ? -1 : 1;
    }
  });

  const headers = [
    { id: 'H', title: 'H' },
    { id: 'Stock', title: 'Stock' },
    { id: 'Star', title: 'Star' },
    { id: 'fair%', title: 'Fair%' },
    { id: 'trUp%', title: 'TrUp%' },
    { id: 'Moat', title: 'Moat' },
    { id: 'Uncertainty', title: 'Uncertainty' },
    // { id: 'Leadership', title: 'Leadership' },
    { id: 'Fair$', title: 'Fair$' },
    { id: 'price', title: 'Price' },
    { id: 'mcap', title: 'MCap' },
  ];
  writeAnalysisCSV('morning-star.csv', headers, sorted);
};
