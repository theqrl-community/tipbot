/*
CoinGecko Client used to get coin data into the system

Requires:

Rate Limit: 100 requests/minute
*/

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
  /*
  // console.log('QRL to BTC: ' + QRLtoBTC);
  // console.log('QRL to USD: ' + QRLtoUSD);
  // console.log('QRL to EUR: ' + QRLtoEUR);
  // console.log('QRL to ETH: ' + QRLtoETH);
  // console.log('QRL to CAD: ' + QRLtoCAD);
  */
  return (`Latest QRL Price:\nBTC: ${QRLtoBTC}\nUSD: ${QRLtoUSD}\nEUR: ${QRLtoEUR}\nETH: ${QRLtoETH}\nCAD: ${QRLtoCAD}`);
}
// export the functiion for use
module.exports = {
  cgPrice : cgPrice,
};