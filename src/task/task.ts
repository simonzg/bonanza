export class TaskOption {
  source: string;
  model: string;
  symbol: string;
  urlParams?: { [key: string]: string };
  output: boolean;
}

export abstract class Task {
  protected source: string;
  protected model: string;
  protected symbol: string;
  protected options: TaskOption;
  protected urlParams: { [key: string]: string };
  protected url: string;
  protected name: string;

  constructor(options: TaskOption) {
    this.source = options.source;
    this.model = options.model;
    this.symbol = options.symbol;
    this.options = options;
    this.urlParams = { symbol: options.symbol };
    if (options.urlParams) {
      for (const key in options.urlParams) {
        this.urlParams[key] = options.urlParams[key];
      }
    }
    this.name = `${options.source}.${options.model}.${options.symbol}`;
  }

  public toString(): string {
    return `Task ${this.name}`;
  }

  abstract async execute(): Promise<any>;
}
