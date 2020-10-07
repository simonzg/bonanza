export abstract class Filter {
  abstract match(data: any): FilterResult;
}
export interface FilterResult {
  symbol: string;
  accepted: boolean;
  rejectReason: string;
}
