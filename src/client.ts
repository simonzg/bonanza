const js = require('jayson');

// create a client
const client = js.client.http({
  port: 3000,
});

// invoke "add"
client.request(
  'fetch',
  { symbols: ['MSFT', 'AXP'], source: 'finnhub', model: 'recommend' },
  function (err, response) {
    if (err) throw err;
    console.log(response.result); // 2
  }
);
