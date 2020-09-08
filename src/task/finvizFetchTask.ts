import { FetchTask } from './fetchTask';
import * as cheerio from 'cheerio';

export class FinvizFetchTask extends FetchTask {
  async processRaw(raw: string): Promise<string> {
    const $ = cheerio.load(raw);
    const data: { [key: string]: string } = {};
    const tds = $('table.snapshot-table2')
      .first()
      .find('td')
      .toArray()
      .map((x) => {
        return $(x).text();
      });

    while (tds && tds.length > 0) {
      const name = tds.shift().toLowerCase();
      const val = tds.shift().toLowerCase();
      data[name] = val;
    }
    return JSON.stringify(data, null, 2);
  }

  public toString(): string {
    return `FinvizFetchTask ${this.name} with ${this.url}`;
  }
}
