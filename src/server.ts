#!/usr/bin/env node

import express from 'express';
import { Source, toSource } from './const';
import { PROXY_PORT } from './config';
import { TaskOption, Task } from './task/task';
import { FetchTask } from './task/fetchTask';
import { FinvizFetchTask } from './task/finvizFetchTask';

const app = express();
const port = PROXY_PORT; // default port to listen
const bodyParser = require('body-parser');

app.use(bodyParser.json());

// define a route handler for the default home page
app.get('/hello', (req: express.Request, res: express.Response) => {
  res.send('Hello world!');
});

app.post('/fetch', async (req: express.Request, res: express.Response) => {
  console.log(req.body);
  const keys = Object.keys(req.body);
  if (!keys.includes('source') || !keys.includes('model') || !keys.includes('symbol') || !keys.includes('url')) {
    return res.json({ error: 'incomplete query' });
  }
  const source = toSource(req.body.source);
  const taskOption: TaskOption = {
    source: req.body.source,
    model: req.body.model,
    symbol: req.body.symbol,
    output: false,
  };
  let task: Task;
  switch (source) {
    case Source.finviz:
      task = new FinvizFetchTask(taskOption, req.body.url);
      break;
    default:
      task = new FetchTask(taskOption, req.body.url);
  }

  const result = await task.execute();
  const j = JSON.parse(result);
  res.json(j);
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
