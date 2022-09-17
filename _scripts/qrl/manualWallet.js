const config = require('../../_config/config.json');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function CreateQRLWallet() {
  // console.log('createWallet file called\n');
    const { stdout, stderr } = await exec(`curl -s -XPOST http://127.0.0.1:5359/api/AddNewAddressWithSlaves -d'{  "height": ${config.wallet.height}, "number_of_slaves": ${config.wallet.num_slaves}, "hash_function": "${config.wallet.hash_function}"}'`);
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    // console.log(`qrlWallet: ${stdout}`);
    const state = stdout;
    return state;
}

CreateQRLWallet();