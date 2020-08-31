import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'papaparse';
import { Source } from './const';

import * as SOURCES from '../config/sources.json';
import * as REMOTE_SERVERS from '../config/remote_servers.json';
export const PROXY_PORT = 8604;

export const getModelNames = (source: Source) => {
  if (Object.keys(SOURCES).includes(Source[source])) {
    return Object.keys(SOURCES[Source[source]].models);
  }
  return [];
};

export const getUrlPattern = (source: Source, model: string) => {
  const models = getModelNames(source);
  if (!models || models.length <= 0) {
    return;
  }
  return SOURCES[Source[source]].base + SOURCES[Source[source]].models[model];
};

export const getDataPath = (source: string, model: string, symbol: string) => {
  return path.join(__dirname, '..', 'data', source, model, symbol + '.json');
};

export const ensureDataDirectory = (source: string, model: string) => {
  const filepath = getDataPath(source, model, 'test');
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const loadFinnhubAccounts = async () => {
  return new Promise<any>((resolve, reject) => {
    const file = fs.readFileSync(
      path.join(__dirname, '..', 'config', 'finnhubAccounts.csv'),
      'utf8'
    );
    parse(file, {
      header: true,
      complete: (result) => {
        resolve(result.data);
      },
    });
  });
};

export const loadRemoteServers = () => {
  return REMOTE_SERVERS['remote_servers'];
};
