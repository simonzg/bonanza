import * as fs from 'fs';
import * as path from 'path';
import { getDataPath } from './config';

export const readData = (source: string, model: string, symbol: string) => {
  try {
    const filepath = getDataPath(source, model, symbol);
    const content = fs.readFileSync(filepath);
    return content.toString('utf-8');
  } catch (e) {
    return undefined;
  }
};

export const deleteData = (source: string, model: string, symbol: string) => {
  const filepath = getDataPath(source, model, symbol);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};

export const writeData = (
  source: string,
  model: string,
  symbol: string,
  data: string
) => {
  const filepath = getDataPath(source, model, symbol);
  console.log(`write result to ${path.normalize(filepath)}`);
  return fs.writeFileSync(filepath, data);
};

export const writeConfigJSON = (filename: string, obj: object) => {
  const filepath = path.join(__dirname, '..', 'config', filename);
  fs.writeFileSync(filepath, JSON.stringify(obj, null, 2));
  console.log(`saved JSON: ${filepath}`);
};

export const writeListingJSON = (filename: string, obj: object) => {
  const filepath = path.join(__dirname, '..', 'config', 'listing', filename);
  fs.writeFileSync(filepath, JSON.stringify(obj, null, 2));
  console.log(`saved JSON: ${filepath}`);
};

export const writeAnalysisJSON = (filename: string, obj: object) => {
  const filepath = path.join(__dirname, '..', 'analysis', filename);
  fs.writeFileSync(filepath, JSON.stringify(obj, null, 2));
  console.log(`saved JSON: ${filepath}`);
};

export const writeAnalysisCSV = async (
  filename: string,
  headers: { id: string; title: string }[],
  data: object
) => {
  const filepath = path.join(__dirname, '..', 'analysis', filename);
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const csvWriter = createCsvWriter({
    path: filepath,
    header: headers,
  });
  await csvWriter.writeRecords(data);
  console.log(`saved CSV: ${filepath}`);
};
