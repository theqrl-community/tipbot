/*
CoinGecko Client used to get coin data into the system
Requires:
npm install node-schedule

Rate Limit: 100 requests/minute
*/
// const schedule = require('node-schedule');

// const schedule = require('node-schedule');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// set an async function to call ping
async function cgData() {
  const { stdout, stderr } = await exec('curl -s -X GET "https://api.coingecko.com/api/v3/coins/quantum-resistant-ledger?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=false" -H "accept: application/json"');
  if (stderr) {
    console.error(`error: ${stderr}`);
    return stderr;
  }
  // price = JSON.stringify(stdout);
  const data = JSON.parse(stdout);
  const id = data['id'];
  // console.log('id: ' + id);
  const symbol = data['symbol'];
  // console.log('symbol: ' + symbol);
  const market_cap_rank = data['market_cap_rank'];
  // console.log('market_cap_rank: ' + market_cap_rank);
  const coingecko_rank = data['coingecko_rank'];
  // console.log('coingecko_rank: ' + coingecko_rank);
  const market_data = data['market_data'];
  // console.log('market_data USD price: ' + market_data['current_price'].usd);
  /* eslint-disable */
  const aed = market_data['current_price'].aed;
  const ars = market_data['current_price'].ars;
  const aud = market_data['current_price'].aud;
  const bch = market_data['current_price'].bch;
  const bdt = market_data['current_price'].bdt;
  const bhd = market_data['current_price'].bhd;
  const bmd = market_data['current_price'].bmd;
  const bnb = market_data['current_price'].bnb;
  const brl = market_data['current_price'].brl;
  const btc = market_data['current_price'].btc;
  const cad = market_data['current_price'].cad;
  const chf = market_data['current_price'].chf;
  const clp = market_data['current_price'].clp;
  const cny = market_data['current_price'].cny;
  const czk = market_data['current_price'].czk;
  const dkk = market_data['current_price'].dkk;
  const eos = market_data['current_price'].eos;
  const eth = market_data['current_price'].eth;
  const eur = market_data['current_price'].eur;
  const gbp = market_data['current_price'].gbp;
  const hkd = market_data['current_price'].hkd;
  const huf = market_data['current_price'].huf;
  const idr = market_data['current_price'].idr;
  const ils = market_data['current_price'].ils;
  const inr = market_data['current_price'].inr;
  const jpy = market_data['current_price'].jpy;
  const krw = market_data['current_price'].krw;
  const kwd = market_data['current_price'].kwd;
  const lkr = market_data['current_price'].lkr;
  const ltc = market_data['current_price'].ltc;
  const mmk = market_data['current_price'].mmk;
  const mxn = market_data['current_price'].mxn;
  const myr = market_data['current_price'].myr;
  const nok = market_data['current_price'].nok;
  const nzd = market_data['current_price'].nzd;
  const php = market_data['current_price'].php;
  const pkr = market_data['current_price'].pkr;
  const pln = market_data['current_price'].pln;
  const rub = market_data['current_price'].rub;
  const sar = market_data['current_price'].sar;
  const sek = market_data['current_price'].sek;
  const sgd = market_data['current_price'].sgd;
  const thb = market_data['current_price'].thb;
  const Try = market_data['current_price'].Try;
  const twd = market_data['current_price'].twd;
  const uah = market_data['current_price'].uah;
  const usd = market_data['current_price'].usd;
  const vef = market_data['current_price'].vef;
  const vnd = market_data['current_price'].vnd;
  const xag = market_data['current_price'].xag;
  const xau = market_data['current_price'].xau;
  const xdr = market_data['current_price'].xdr;
  const xlm = market_data['current_price'].xlm;
  const xrp = market_data['current_price'].xrp;
  const zar = market_data['current_price'].zar;
  
  /* eslint-enable */

  // console.log('aed: ' + aed);
  /*
  const QRLtoBTC = price['quantum-resistant-ledger'].btc;
  const QRLtoUSD = price['quantum-resistant-ledger'].usd;
  const QRLtoEUR = price['quantum-resistant-ledger'].eur;
  const QRLtoETH = price['quantum-resistant-ledger'].eth;
  const QRLtoCAD = price['quantum-resistant-ledger'].cad;
  return (`Latest QRL Price:\nBTC: ${QRLtoBTC}\nUSD: ${QRLtoUSD}\nEUR: ${QRLtoEUR}\nETH: ${QRLtoETH}\nCAD: ${QRLtoCAD}`);
*/

  return (`Some data...\n\n${id}\n\n${symbol}\n\n${market_cap_rank}\n\n${coingecko_rank}\n\n${market_data}\n\n${current_prices}\n`);
}
cgData();

// --------------------- //
// Schedule stuffs below...
// const updatePrice = schedule.scheduleJob('*/1 * * * *', function() {
// console.log('Update the Server...');
// console.log(cgPrice());
// });
// console.log('Start CG Server...');
// const out = cgPrice();
// console.log(out);
// updatePrice;