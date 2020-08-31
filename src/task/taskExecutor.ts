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
  extraParams?: { [key: string]: any };
}

export class TaskExecutor {
  tasks: Task[] = [];
  options: TaskExecutorOption;
  servers: any[];

  constructor(options: TaskExecutorOption) {
    this.options = options;
    this.servers = loadRemoteServers();
    let extraParams: { [key: string]: string } = {};
    for (const [index, symbol] of options.symbols.entries()) {
      let taskOption: TaskOption = {
        source: Source[options.source],
        model: options.model,
        symbol,
        url: '',
      };
      switch (options.action) {
        case Action.clean:
          this.tasks.push(new CleanTask(taskOption));
        case Action.show:
          this.tasks.push(new ShowTask(taskOption));
        case Action.fetch:
          if (options.skipExisting) {
            const content = readData(
              Source[options.source],
              options.model,
              symbol
            );
            if (content && content.length > 0) {
              continue;
            }
          }

          // prepare token for finnhub task
          const tokens = this.options.extraParams!.tokens as any[];
          if (options.source === Source.finnhub) {
            const token = tokens[index % tokens.length];
            extraParams['token'] = token;
          }
          taskOption.url = this.getUrl(symbol, extraParams);

          // if (!this.options.remoteFetch) {
          if (false) {
            switch (options.source) {
              case Source.finviz:
                this.tasks.push(new FinvizFetchTask(taskOption));
                break;
              default:
                this.tasks.push(new FetchTask(taskOption));
            }
          } else {
            this.tasks.push(
              new ProxyFetchTask(
                taskOption,
                this.servers[index % this.servers.length]
              )
            );
          }
      }
    }
  }

  public async executeInSequence() {
    for (const task of this.tasks) {
      console.log(task.toString());
    }

    for (const task of this.tasks) {
      await task.execute();
    }
  }

  public async executeAsync() {
    let promises: Promise<void>[] = [];
    let batchSize = 10;
    let i = 0;
    for (const task of this.tasks) {
      if (i < batchSize) {
        promises.push(task.execute());
      } else {
        await Promise.all(promises);
        i = 0;
        promises = [];
      }
    }
  }

  private getUrl(symbol: string, extraParams: { [key: string]: string }) {
    let urlPattern = getUrlPattern(this.options.source, this.options.model);
    let url = urlPattern.replace('{symbol}', symbol);
    if (this.options && this.options.extraParams) {
      for (const key of Object.keys(extraParams)) {
        const val = extraParams[key];
        url = url.replace(`{${key}}`, val.toString());
      }
    }
    return url;
  }
}
