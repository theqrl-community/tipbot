// https://explorer.theqrl.org/api/status

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const config = require('../../_config/config.json');

// set an async function to call ping
async function explorerData() {
  const { stdout, stderr } = await exec('curl -H "Expect: 100-continue" -s -f -XGET "' + config.bot_details.explorer_url + '/api/status"');
  if (stderr) {
    console.error(`error: ${stderr}`);
    return stderr;
  }
  // console.log(stdout)
  return stdout;
}

async function poolData() {
  // pulls stats from pool identified here
  const { stdout, stderr } = await exec('curl -H "Expect: 100-continue" -s -f -XGET "http://pool.qrlmining.com:8117/stats"');
  if (stderr) {
    console.error(`error: ${stderr}`);
    return stderr;
  }
  // console.log(stdout)
  return stdout;
}

  module.exports = {
    explorerData: explorerData,
    poolData: poolData,
  };