/*
CoinGecko Client used to get coin data into the system

Requires:

Rate Limit: 100 requests/minute
*/

// const schedule = require('node-schedule');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// set an async function to call ping
async function cgPing() {
  const { stdout, stderr } = await exec('curl -s -X GET "https://api.coingecko.com/api/v3/ping" -H "accept: application/json"');
  if (stderr) {
    console.error(`error: ${stderr}`);
    return stderr;
  }
  // console.log('stdout: ' + stdout);
    const ping = stdout;
  // console.log(`qrlState: ${ping}`);
  return ping;
}
// export the functiion for use
module.exports = {
  cgPing : cgPing,
};