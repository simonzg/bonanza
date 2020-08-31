import * as fs from 'fs';
import * as cheerio from 'cheerio';

const c = fs.readFileSync('./WDAY.html').toString();
const $ = cheerio.load(c);
const d: { [key: string]: string } = {};
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
  d[name] = val;
}

console.log(d);
