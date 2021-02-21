// const config = require('../../_config/config.json');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
// pull all data for QRL coin from coingecko
async function cgData() {
  const { stdout, stderr } = await exec('curl -s -XGET "https://api.coingecko.com/api/v3/coins/quantum-resistant-ledger?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=false" -H "accept: application/json"');
  if (stderr) {
    console.error(`error: ${stderr}`);
    return stderr;
  }
  return stdout;
}

module.exports = {
  cgData : cgData,
};