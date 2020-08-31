import { Task, TaskOption } from './task';
import axios from 'axios';
import { ensureDataDirectory } from '../config';
import { writeData } from '../utils';

export class FetchTask extends Task {
  private urlPattern = '';
  private data = '';

  constructor(options: TaskOption) {
    super(options);
  }

  async execute() {
    console.log(`exec fetch: ${this.name}`);
    ensureDataDirectory(this.source, this.model);
    try {
      const res = await axios.get(this.url);
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
