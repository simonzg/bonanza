import { Filter, FilterResult } from './filter';
import { readData } from '../utils';

export class FilterRule {
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

  public match(data: any): boolean {
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
      const valUnit = value[value.length - 1];
      const tgtUnit = target[target.length - 1];
      if (['b', 'm', 'k', '%'].includes(valUnit)) {
        valNum = Number(value.slice(0, value.length - 1));
      } else if (value === '-') {
        valNum = 0;
      } else {
        valNum = Number(value);
      }
      if (['b', 'm', 'k', '%'].includes(tgtUnit)) {
        tgtNum = Number(target.slice(0, target.length - 1));
      } else {
        tgtNum = Number(target);
      }
      switch (valUnit) {
        case 'b':
          valNum *= 1e9;
        case 'm':
          valNum *= 1e6;
        case 'k':
          valNum *= 1e3;
      }
      switch (tgtUnit) {
        case 'b':
          tgtNum *= 1e9;
        case 'm':
          tgtNum *= 1e6;
        case 'k':
          tgtNum *= 1e3;
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

      return result;
    } catch (e) {
      return false;
    }
  }

  public toString(): string {
    return [this.field, this.op, this.target].join(' ');
  }
}

export class SimpleFilter extends Filter {
  rules: FilterRule[];
  constructor(rules: FilterRule[]) {
    super();
    this.rules = rules;
  }

  matchAll(datas: any[]) {
    let accepted = [];
    let rejected = [];
    for (const raw of datas) {
      const fr = this.match(raw);
      if (fr.accepted) {
        accepted.push(raw);
      } else {
        rejected.push(fr);
      }
    }
    return { accepted, rejected };
  }

  match(data: any): FilterResult {
    if (!data || !data.symbol) {
      return {
        symbol: data.symbol,
        accepted: false,
        rejectReason: 'missing data for analysis',
      } as FilterResult;
    }
    // console.log(symbol);
    for (const rule of this.rules) {
      if (!rule.match(data)) {
        return {
          symbol: data.symbol,
          accepted: false,
          rejectReason: `not matching rule: ${rule.toString()}, actual value: ${rule.value}`,
        };
      }
    }
    return { symbol: data.symbol, accepted: true, rejectReason: '' };
  }
}
