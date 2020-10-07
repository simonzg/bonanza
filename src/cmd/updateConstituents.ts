import { loadFinnhubAccounts } from '../config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// generate an ignored listing for any stock in these situations:
// 1. missing data
// 2. eps next 5 year <= 0%
// 3. market cap < 100m

const configs = [
  {
    url:
      'https://finnhub.io/api/v1/index/constituents?token={token}&symbol=^GSPC',
    name: 'SP500',
  },
  {
    url:
      'https://finnhub.io/api/v1/index/constituents?token={token}&symbol=^NDX',
    name: 'NDX',
  },
  {
    url:
      'https://finnhub.io/api/v1/index/constituents?token={token}&symbol=^DJI',
    name: 'DJI',
  },
];

(async () => {
  const accounts = await loadFinnhubAccounts();
  let i = 0;
  for (const item of configs) {
    console.log(accounts[i].Token);
    i++;
    const res = await axios.get(item.url.replace('{token}', accounts[i].Token));
    if (res.status === 200 && res.data) {
      fs.writeFileSync(
        path.join(__dirname, '..', '..', 'config', `${item.name}.json`),
        JSON.stringify(res.data, null, 2)
      );
    }
  }
})();
