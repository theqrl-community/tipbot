async function random(){

  const fetch = require('node-fetch');
  const AbortController = require('abort-controller');
  const { default: Client, HTTP } = await import('drand-client');

  global.fetch = fetch;
  global.AbortController = AbortController;

  const chainHash = '8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce'; // (hex encoded)
  const options = { chainHash };
  const client = await Client.wrap(
    HTTP.forURLs([
      'http://api.drand.sh',
      'http://api2.drand.sh',
      'http://api3.drand.sh',
      'https://drand.cloudflare.com',
    ], chainHash),
    options
  );
  const res = await client.get(); // gets the latest randomness round
  console.log(`random data: ${JSON.stringify(res)}`);
  return res;
}


module.exports = {
  random : random,
};