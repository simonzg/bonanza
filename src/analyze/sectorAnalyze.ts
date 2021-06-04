import { writeAnalysisCSV } from '../utils';
const formatPercent = (num: number): string => {
  return `${Math.round(10000 * num) / 100}%`;
};
export const sectorAnalyze = async (rawMerged: any[]) => {
  let e20: { [key: string]: number[] } = {};
  let e60: { [key: string]: number[] } = {};
  let result = [];
  for (const row of rawMerged) {
    let ind = row.industry;
    if (!(ind in e20)) {
      e20[ind] = [];
      e60[ind] = [];
    }
    e20[ind].push(Number(row['upEMA20'].slice(0, -1)));
    e60[ind].push(Number(row['upEMA60'].slice(0, -1)));
  }
  for (const sec in e20) {
    if (sec in e60) {
      const ema60 = e60[sec];
      const ema20 = e20[sec];
      const aboveEMA60Rate = formatPercent(ema60.filter((item) => item > 0).length / ema60.length);
      const aboveEMA20Rate = formatPercent(ema20.filter((item) => item > 0).length / ema20.length);
      const strength = formatPercent(ema20.reduce((s, val) => s + val, 0) / ema20.length / 100);
      result.push({
        industry: sec,
        aboveEMA20Rate,
        aboveEMA60Rate,
        strength,
      });
    }
  }

  await writeAnalysisCSV(
    'sector-strength.csv',
    [
      { id: 'industry', title: 'ind' },
      { id: 'aboveEMA20Rate', title: '#>ema20' },
      { id: 'aboveEMA60Rate', title: '#>ema60' },
      { id: 'strength', title: 's' },
    ],
    result
  );
};
