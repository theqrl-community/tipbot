/*
CoinGecko Client used to get coin data into the system
Requires:
npm install node-schedule

Rate Limit: 100 requests/minute
*/
const schedule = require('node-schedule');

// const schedule = require('node-schedule');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// set an async function to call ping
async function cgPrice() {
  const { stdout, stderr } = await exec('curl -s -X GET "https://api.coingecko.com/api/v3/simple/price?ids=quantum-resistant-ledger&vs_currencies=btc%2Ceth%2Ceur%2Ccad%2Cusd" -H "accept: application/json"');
  if (stderr) {
    console.error(`error: ${stderr}`);
    return stderr;
  }
  // price = JSON.stringify(stdout);
  const price = JSON.parse(stdout);
  const QRLtoBTC = price['quantum-resistant-ledger'].btc;
  const QRLtoUSD = price['quantum-resistant-ledger'].usd;
  const QRLtoEUR = price['quantum-resistant-ledger'].eur;
  const QRLtoETH = price['quantum-resistant-ledger'].eth;
  const QRLtoCAD = price['quantum-resistant-ledger'].cad;
  return (`Latest QRL Price:\nBTC: ${QRLtoBTC}\nUSD: ${QRLtoUSD}\nEUR: ${QRLtoEUR}\nETH: ${QRLtoETH}\nCAD: ${QRLtoCAD}`);
}


// --------------------- //
// Schedule stuffs below...

const updatePrice = schedule.scheduleJob('*/1 * * * *', function() {
  // console.log('Update the Server...');
  // console.log(cgPrice());
});
// console.log('Start CG Server...');
const out = cgPrice();
// console.log(out);
updatePrice;
