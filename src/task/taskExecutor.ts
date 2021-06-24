import { Task, TaskOption } from './task';
import { CleanTask } from './cleanTask';
import { ShowTask } from './showTask';
import { readData } from '../utils';
import { FinvizFetchTask } from './finvizFetchTask';
import { FetchTask } from './fetchTask';
import { getUrlPattern, loadRemoteServers } from '../config';
import { Action, Source } from '../const';
import { ProxyFetchTask } from './proxyFetchTask';
export class TaskExecutorOption {
  action: Action;
  source: Source;
  model: string;
  symbols: string[];
  proxyFetch?: boolean;
  proxyServers?: string[];
  skipExisting?: boolean;
  updateInterval?: number;
  extraParams?: { [key: string]: any };
  batchInterval: number; // interval in ms (used for rate limit)
}

const sleep = (ms) => {
  const s = Math.floor((ms / 1000.0) * 100) / 100.0;
  console.log(`sleep for ${s}s`);
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export class TaskExecutor {
  tasks: Task[] = [];
  options: TaskExecutorOption;
  servers: any[];

  constructor(options: TaskExecutorOption) {
    this.options = options;
    this.servers = loadRemoteServers();
    let index = 0;
    for (const [i, symbol] of options.symbols.entries()) {
      let taskOption: TaskOption = {
        source: Source[options.source],
        model: options.model,
        symbol,
        urlParams: { symbol: symbol },
        output: true,
      };
      switch (options.action) {
        case Action.clean:
          this.tasks.push(new CleanTask(taskOption));
          break;
        case Action.show:
          this.tasks.push(new ShowTask(taskOption));
          break;
        case Action.fetch:
          // skip existing data
          if (options.skipExisting) {
            const content = readData(Source[options.source], options.model, symbol);
            if (content && content.length > 0) {
              console.log(`skip ${symbol} due to existing ${options.model} data from ${Source[options.source]}`);
              continue;
            }
          }

          // prepare token for finnhub task
          const tokens = this.options.extraParams!.tokens as any[];
          if (options.source === Source.finnhub) {
            const token = tokens[index % tokens.length];
            taskOption.urlParams['token'] = token;
          }

          // if (!this.options.remoteFetch) {
          if (!this.options.proxyFetch) {
            switch (options.source) {
              case Source.finviz:
                this.tasks.push(new FinvizFetchTask(taskOption));
                break;
              default:
                this.tasks.push(new FetchTask(taskOption));
            }
          } else {
            this.tasks.push(new ProxyFetchTask(taskOption, this.servers[index % this.servers.length]));
          }
      }
      index++;
    }
  }

  public async executeAll() {
    if (this.options.proxyFetch) {
      await this.executeAsync();
    } else {
      await this.executeInSequence();
    }
  }

  private async executeInSequence() {
    console.log(`Execute ${this.tasks.length} in sequence`);

    for (const task of this.tasks) {
      await task.execute();
    }
  }

  private async executeAsync() {
    console.log(`Execute ${this.tasks.length} asynchronously`);
    let promises: Promise<void>[] = [];
    let batchSize = this.servers.length;
    let i = 0;
    let start: number, end: number;
    while (this.tasks && this.tasks.length > 0) {
      if (promises.length === 0) {
        start = new Date().getTime();
      }
      const task = this.tasks.shift();
      if (task) {
        promises.push(task.execute());
      } else {
        console.log(`waiting for ${promises.length} tasks ...`);
        await Promise.all(promises);
        break;
      }

      i++;
      if (i === batchSize) {
        console.log(`waiting for ${promises.length} tasks ...`);
        await Promise.all(promises);
        i = 0;
        promises = [];
        end = new Date().getTime();
        const msUsed = end - start;
        const delta = this.options.batchInterval - msUsed;
        if (delta > 0) {
          await sleep(delta);
        }
      }
    }
  }
}
