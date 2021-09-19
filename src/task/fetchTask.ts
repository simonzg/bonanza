import { Task, TaskOption } from './task';
import { Source } from '../const';
import axios from 'axios';
import { ensureDataDirectory } from '../config';
import { writeData } from '../utils';
import { getUrlPattern } from '../config';
export class FetchTask extends Task {
  private data = '';

  constructor(options: TaskOption, url?: string) {
    super(options);
    this.url = this.getUrl();
    if (url) {
      this.url = url;
    }
  }

  async execute() {
    console.log(`Exec fetch: ${this.name} with ${this.url}`);
    ensureDataDirectory(this.source, this.model);
    try {
      const res = await axios.get(this.url, { timeout: 10000 });
      if (res.status != 200) {
        console.log('fetch failed for: ', this.url, 'with error: ', res.status);
      }
      this.data = await this.processRaw(res.data);
      writeData(this.source, this.model, this.symbol, this.data);
      return this.data;
    } catch (e) {
      console.log('-'.repeat(80));
      console.log('Error Happened (but ignored): ', e.name, e.message);
      console.log('code:', e.code, 'stack:', e.stack);
      console.log(e.config.method, e.config.url, ' with data:', e.config.data);
      console.log('-'.repeat(80));
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
    if (this.urlParams && Object.keys(this.urlParams).length > 0) {
      for (const key of Object.keys(this.urlParams)) {
        const val = this.urlParams[key];
        url = url.replace(`{${key}}`, val.toString());
      }
    }
    return url;
  }

  public toString(): string {
    return `FetchTask ${this.name} with ${this.url}`;
  }
}
