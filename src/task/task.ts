export class TaskOption {
  source: string;
  model: string;
  symbol: string;
  url: string;
}

export abstract class Task {
  protected source: string;
  protected model: string;
  protected symbol: string;
  protected options: TaskOption;
  protected url: string;
  protected name: string;

  constructor(options: TaskOption) {
    this.source = options.source;
    this.model = options.model;
    this.symbol = options.symbol;
    this.url = options.url;
    this.options = options;
    this.name = `${options.source}.${options.model}.${options.symbol}`;
  }

  toString(): string {
    return `${this.name} with ${this.url}`;
  }

  async execute(): Promise<any> {}
}
