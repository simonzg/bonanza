import { Filter, FilterResult } from './filter';
import { readData } from '../utils';

export class FinvizRule {
  field: string;
  op: string;
  target: string;
  value: string;
  constructor(rule: string) {
    const items = rule.split(' ');
    if (items.length < 3) {
      throw new Error('invalid format for finviz rule');
    }
    this.field = items.slice(0, items.length - 2).join(' ');
    this.op = items[items.length - 2];
    this.target = items[items.length - 1];
    this.value = '';
  }

  public match(data: object): boolean {
    if (!Object.keys(data).includes(this.field)) {
      return false;
    }
    if (!['>', '>=', '=', '<', '<='].includes(this.op)) {
      return false;
    }

    const target = this.target;
    const value = String(data[this.field]);
    this.value = value;
    // console.log(
    // `compare ${this.field} value: ${value}, op: ${this.op}, target: ${target}`
    // );

    try {
      let valNum: number, tgtNum: number;
      if (value === '-') {
        // shortcut
        return true;
      }
      const valUnit = value[value.length - 1];
      const tgtUnit = target[target.length - 1];
      if (['b', 'm', '%'].includes(valUnit)) {
        valNum = Number(value.slice(0, value.length - 1));
      }
      if (['b', 'm', '%'].includes(tgtUnit)) {
        tgtNum = Number(target.slice(0, target.length - 1));
      }
      if (valUnit === 'b') {
        valNum *= 1000;
      }
      if (tgtUnit === 'b') {
        tgtNum *= 1000;
      }
      let result = false;
      switch (this.op) {
        case '<':
          result = valNum < tgtNum;
          break;
        case '<=':
          result = valNum <= tgtNum;
          break;
        case '=':
          result = valNum == tgtNum;
          break;
        case '>':
          result = valNum > tgtNum;
          break;
        case '>=':
          result = valNum >= tgtNum;
          break;
      }
      // console.log('result = ', result);
      return result;
    } catch (e) {
      return false;
    }
  }

  public toString(): string {
    return [this.field, this.op, this.target].join(' ');
  }
}

export class FinvizFilter extends Filter {
  rules = [
    new FinvizRule('eps next 5y > 5%'),
    new FinvizRule('market cap > 100m'),
    new FinvizRule('sma200 > 5%'),
    new FinvizRule('roe > 5%'),
    new FinvizRule('short float < 10%'),
  ];

  match(symbol: string): FilterResult {
    const fvData = readData('finviz', 'page', symbol);
    if (!fvData) {
      return {
        accepted: false,
        rejectReason: 'missing data for analysis',
      } as FilterResult;
    }
    // console.log(symbol);
    for (const rule of this.rules) {
      if (!rule.match(JSON.parse(fvData))) {
        return {
          symbol,
          accepted: false,
          rejectReason: `not matching rule: ${rule.toString()}, actual value: ${
            rule.value
          }`,
        };
      }
    }
    return { symbol, accepted: true, rejectReason: '' };
  }
}
