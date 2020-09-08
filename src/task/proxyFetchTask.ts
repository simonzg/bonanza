import { Task, TaskOption } from './task';
import axios from 'axios';
import { ensureDataDirectory, PROXY_PORT } from '../config';
import { writeData } from '../utils';
import { Source } from '../const';
import { getUrlPattern } from '../config';
export class ProxyFetchTask extends Task {
  private data = '';
  private server = '';
  private proxyUrl = '';

  constructor(options: TaskOption, proxy: any) {
    super(options);
    this.server = proxy.ip;
    this.proxyUrl = `http://${this.server}:${PROXY_PORT}/fetch`;
    this.url = this.getUrl();
  }

  async execute() {
    console.log(`Exec fetch: ${this.name} with ${this.url}`);
    ensureDataDirectory(this.source, this.model);
    try {
      const res = await axios.post(this.proxyUrl, {
        source: this.source,
        model: this.model,
        symbol: this.symbol,
        url: this.url,
        output: false,
      });
      if (res.status != 200) {
        console.log(
          'fetch failed for: ',
          this.proxyUrl,
          'with error: ',
          res.status
        );
      }
      this.data = await this.processRaw(res.data);
      writeData(this.source, this.model, this.symbol, this.data);
      return this.data;
    } catch (e) {
      console.log('Error Happened (but ignored): ', e);
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

  private getUrl() {
    let url = getUrlPattern(Source[this.source], this.model);
    if (this.urlParams) {
      for (const key of Object.keys(this.urlParams)) {
        const val = this.urlParams[key];
        url = url.replace(`{${key}}`, val.toString());
      }
    }
    return url;
  }

  public toString(): string {
    return `ProxyFetchTask ${this.name} with ${this.url}`;
  }
}
