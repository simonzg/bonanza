import { loadFinnhubAccounts, loadRemoteServers } from '../config';
import { TaskExecutor, TaskExecutorOption } from '../task/taskExecutor';
import { Action, Source } from '../const';

export const runCmd = async (action: Action, source: Source, models: string[], symbols: string[], proxyFetch: boolean, skipExisting: boolean) => {
  const servers = await loadRemoteServers();
  for (const model of models) {
    let options: TaskExecutorOption = {
      action,
      source,
      model,
      symbols,
      proxyFetch,
      skipExisting,
      extraParams: {},
      batchInterval: 3000,
    };
    if (action === Action.fetch && source === Source.finnhub) {
      const accts = await loadFinnhubAccounts();
      const tokens = accts.map((acct) => acct.Token);
      options.extraParams['tokens'] = tokens;
    }

    let executor = new TaskExecutor(servers, options);
    await executor.executeAll();
  }
};
