async function random(){

  const fetch = require('node-fetch');
  const AbortController = require('abort-controller');
  const { default: Client, HTTP } = await import('drand-client');

  global.fetch = fetch;
  global.AbortController = AbortController;

  const chainHash = '138a324aa6540f93d0dad002aa89454b1bec2b6e948682cde6bd4db40f4b7c9b'; // (hex encoded)
  const options = { chainHash };
  const client = await Client.wrap(
    HTTP.forURLs(['http://drand.network'], chainHash),
    options
  );
  const res = await client.get(); // gets the latest randomness round
  console.log(`random data: ${res}`);
  return res;
}


module.exports = {
  random : random,
};