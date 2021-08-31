import { Filter, FilterResult } from './filter';

export class PlungeFilter extends Filter {
  plungePct: number;
  days: number;
  constructor(withinDays: number, plungePct: number) {
    super();
    this.days = withinDays;
    this.plungePct = plungePct * 100;
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
    for (const i in data.last30Candles) {
      if (Number(i) == 0) {
        continue;
      }
      const pre = data.last30Candles[Number(i) - 1];
      const cur = data.last30Candles[Number(i)];
      if (cur && pre && cur - pre < 0 && (-(cur - pre) * 100) / pre >= this.plungePct) {
        return { symbol: data.symbol, accepted: true } as FilterResult;
      }
    }
    return { symbol: data.symbol, accepted: false, rejectReason: 'no matching discount' };
  }
}
