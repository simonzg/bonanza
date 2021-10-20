import { loadAllSymbols } from '../listing';
import { loadMergedData } from './dataMerger';
import { parse } from 'papaparse';
import * as fs from 'fs';
import * as path from 'path';
import { writeAnalysisCSV } from '../utils';

export const loadMorningStars = async () => {
  return new Promise<any>((resolve, reject) => {
    const file = fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'morning-star-2021-10.csv'), 'utf8');
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
      row['trUp%'] = data['upMedian'];
      row['fair%'] = formatPercent((Number(row['Fair$']) - Number(data['closePrice'])) / Number(data['closePrice']));
    }
  }
  const headers = [
    { id: 'H', title: 'H' },
    { id: 'Stock', title: 'Stock' },
    { id: 'Moat', title: 'Moat' },
    { id: 'Fair$', title: 'Fair$' },
    { id: 'Uncertainty', title: 'Uncertainty' },
    { id: 'Leadership', title: 'Leadership' },
    { id: 'price', title: 'Price' },
    { id: 'fair%', title: 'Fair%' },
    { id: 'trUp%', title: 'TrUp%' },
    { id: 'mcap', title: 'MCap%' },
  ];
  writeAnalysisCSV('morning-start.csv', headers, parsed);
};
