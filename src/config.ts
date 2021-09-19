import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'papaparse';
import { Source } from './const';
import axios from 'axios';
import * as pkg from '../package.json';

import * as SOURCES from '../config/sources.json';
import * as REMOTE_SERVERS from '../config/remote_servers.json';
export const PROXY_PORT = 8604;

export const getModelNames = (source: Source) => {
  if (Object.keys(SOURCES).includes(Source[source])) {
    return Object.keys(SOURCES[Source[source]].models);
  }
  return [];
};
const sleep = (ms) => {
  const s = Math.floor((ms / 1000.0) * 100) / 100.0;
  console.log(`sleep for ${s}s`);
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    const file = fs.readFileSync(path.join(__dirname, '..', 'config', 'finnhubAccounts.csv'), 'utf8');
    parse(file, {
      header: true,
      complete: (result) => {
        resolve(result.data);
      },
    });
  });
};

const verifyVersion = async (ip: string, name: string) => {
  try {
    console.log(`checking version for ${name}:${ip}`);
    const res = (await Promise.race([sleep(3000), axios.get(`http://${ip}:${PROXY_PORT}/version`, { timeout: 3000 })])) as any;
    if (!res) {
      console.log(`timed out on ${name}:${ip}, ignore for now`);
      return false;
    }
    const expectedVersion = pkg.version;
    if (res.data === expectedVersion) {
      console.log(`version match on ${name}:${ip}`);
      return true;
    } else {
      console.log(`version mismatch on ${name}:${ip}, expected: ${expectedVersion}, got: ${res.data}`);
    }
  } catch (e) {
    console.log(`fetch version error on ${name}:${ip} `, (e as Error).message, 'ignore this server');
  }
  return false;
};

export const loadRemoteServers = async () => {
  const config = REMOTE_SERVERS['remote_servers'];
  let validServers = [];
  for (const c of config) {
    const verified = await verifyVersion(c.ip, c.name);
    if (verified) {
      validServers.push(c);
    }
  }
  console.log('VALID SERVERS: ', validServers);
  return validServers;
};
