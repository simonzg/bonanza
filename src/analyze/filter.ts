import * as fs from 'fs';
import * as path from 'path';

export abstract class Filter {
  abstract match(symbol: string): FilterResult;
}

export interface FilterResult {
  symbol: string;
  accepted: boolean;
  rejectReason: string;
}

export const writeAnalysisResult = (filename: string, data: string) => {
  const filepath = path.join(__dirname, '..', '..', 'analysis', filename);
  console.log(`write result to ${path.normalize(filepath)}`);
  return fs.writeFileSync(filepath, data);
};

export const writeCSVResult = async (
  filename: string,
  headers: { id: string; title: string }[],
  data: object
) => {
  const filepath = path.join(__dirname, '..', '..', 'analysis', filename);
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const csvWriter = createCsvWriter({
    path: filepath,
    header: headers,
  });
  return csvWriter.writeRecords(data);
};
