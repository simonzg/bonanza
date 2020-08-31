import * as fs from 'fs';
import * as path from 'path';
import { getDataPath } from './config';

export const readData = (source: string, model: string, symbol: string) => {
  const filepath = getDataPath(source, model, symbol);
  const content = fs.readFileSync(filepath);
  return content.toString('utf-8');
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
