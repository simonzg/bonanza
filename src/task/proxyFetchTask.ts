import { Task, TaskOption } from './task';
import axios from 'axios';
import { ensureDataDirectory, PROXY_PORT } from '../config';
import { writeData } from '../utils';

export class ProxyFetchTask extends Task {
  private data = '';
  private server = '';

  constructor(options: TaskOption, proxyIP: string) {
    super(options);
    this.server = proxyIP;
  }

  async execute() {
    console.log(`exec fetch: ${this.name} proxy ${this.server}`);
    ensureDataDirectory(this.source, this.model);
    try {
      const res = await axios.post(
        `http://${this.server}:${PROXY_PORT}/fetch`,
        this.options
      );
      if (res.status != 200) {
        console.log('fetch failed for: ', this.url, 'with error: ', res.status);
      }
      this.data = await this.processRaw(res.data);
      writeData(this.source, this.model, this.symbol, this.data);
      return this.data;
    } catch (e) {
      console.log('Error Happened (ignored): ', e);
    }
  }

  async processRaw(raw: any): Promise<string> {
    if (raw instanceof String) {
      return raw as string;
    } else if (raw instanceof Object) {
      return JSON.stringify(raw, null, 2);
    }
    return (raw as Object).toString();
  }
}
