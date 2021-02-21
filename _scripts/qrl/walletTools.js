const config = require('../../_config/config.json');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function getWalletInfo() {
  const { stdout, stderr } = await exec('curl -s -XGET http://127.0.0.1:5359/api/GetWalletInfo');
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  return stdout;
}

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

async function sendQuanta(args) {
  // console.log('\n\nsendQuanta fired for: ' + JSON.stringify(args));
  // function to send QRL to an array of addresses
  // expects { amount: amount, fee: fee, address_from: QRL_ADR_FROM, address_to: QRL_ADDRESSES_TO,  }
  if (args !== null) {
    // args are not null, do things!
    const amount = args.amount;
    const fee = args.fee ;
    const addresses_to = JSON.stringify(args.address_to);
    const master_address = args.address_from;
    // console.log('Info prior to send tx command\n Amount: ' + amount + ' Fee: ' + fee + ' Addresses_to: ' +  addresses_to + ' masterAddress: ' + master_address)
    // console.log('curl -s -XPOST http://127.0.0.1:5359/api/RelayTransferTxnBySlave -d\'{ "addresses_to": ' + addresses_to + ', "amounts": [' + amount + '],  "fee": ' + fee + ', "master_address": "' + master_address + '"}')
    const { stdout, stderr } = await exec(`curl -s -XPOST http://127.0.0.1:5359/api/RelayTransferTxnBySlave -d'{ "addresses_to": ${addresses_to}, "amounts": [${amount}],  "fee": ${fee}, "master_address": "${master_address}"}'`);
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    // console.log(`sendQuanta stdout: ${stdout}`);
    // const sendStdout = JSON.parse(JSON.stringify(stdout));
    const sendStdout = stdout;
    return sendStdout;
  }
  else {
    // no args something is wrong
    // console.log('no args passed to sendQuanta... something is wrong. ');
    return ;
  }
}

// list all wallets
async function list() {
  const { stdout, stderr } = await exec('curl -s -XGET http://127.0.0.1:5359/api/ListAddresses |jq .addresses[]');
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  // console.log(`List of Wallets:\n\n${stdout}`);
  const addresses = stdout;
  return addresses;
}

async function listAll() {
  const { stdout, stderr } = await exec('curl -s -XGET http://127.0.0.1:5359/api/ListAddresses |jq .addresses');
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  // console.log(`List of Wallets:\n\n${stdout}`);
  const addresses = stdout;
  return addresses;
}

// Give count of all addresses in the wallet
async function count() {
  const { stdout, stderr } = await exec('curl -s -XGET http://127.0.0.1:5359/api/ListAddresses |jq .addresses[] |wc -l');
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  // console.log(`qrlWallet: ${stdout}`);
  const walletCount = stdout;
  return walletCount;
}

async function totalBalance() {
  const { stdout, stderr } = await exec('curl -s -XGET http://127.0.0.1:5359/api/GetTotalBalance |jq .balance ');
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  // console.log(`Wallet Balance: ${stdout}`);
  const walletBal = stdout;
  return walletBal;
}

async function GetBalance(args) {
  // using the wallet API get this info and return to script
  if (args !== null) {
    const { stdout, stderr } = await exec('curl -s -XPOST http://127.0.0.1:5359/api/GetBalance -d \'{"address": "' + args + '"}\' |jq .balance');
    // console.log('curl -s -XPOST http://127.0.0.1:5359/api/GetBalance -d \'{"address": "' + args + '"}\' |jq .balance')
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    const output = stdout.slice(1, -2);
    const returnData = { balance: output };
    return returnData;
  }
  else {
  // no args passed
    // console.log('no args passed... We need an address!');
    const returnData = { error: true };
    return returnData;
  }
}

async function checkBalance(args) {
  if (args !== null) {
    const { stdout, stderr } = await exec(`curl -s -XPOST http://127.0.0.1:5359/api/GetBalance -d '{  "address": "${args}" }'`);
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    // console.log(`Balance for:\t ${args} ${stdout}`);
    const balance = JSON.stringify(stdout);
    // console.log('balance: ' + JSON.stringify(balance.balance));
    return balance;
  }
  // no args passed, get the defaults from the config and create a wallet
  else {
    // console.log('no args passed... We need an address!');
    return;
  }
}


// encrypts teh wallet
async function encrypt(args) {
  const { stdout, stderr } = await exec(`curl -s -XPOST http://127.0.0.1:5359/api/EncryptWallet -d '{ "passphrase": "${args}" }'`);
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  // console.log(`Wallet encrypted!: ${stdout}`);
  const walletEncrypt = stdout;
  return walletEncrypt;
}

async function lock() {
  const { stdout, stderr } = await exec('curl -s -XGET http://127.0.0.1:5359/api/LockWallet');
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  // console.log(`Wallet Locked: ${stdout}`);
  const walletLock = stdout;
  return walletLock;
}

async function unlock(args) {
  const { stdout, stderr } = await exec(`curl -s -XPOST http://127.0.0.1:5359/api/UnlockWallet -d '{ "passphrase": "${args}"}'`);
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  // console.log(`Wallet Unlocked: ${stdout}`);
  const walletUnlock = stdout;
  return walletUnlock;
}

async function GetHeight() {
  const { stdout, stderr } = await exec(`curl -s -XGET http://127.0.0.1:5359/api/GetHeight`);
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  // console.log(`Wallet Unlocked: ${stdout}`);
  const Height = stdout;
  return Height;
}

async function GetNodeInfo() {
  const { stdout, stderr } = await exec(`curl -s -XGET http://127.0.0.1:5359/api/GetNodeInfo`);
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  // console.log(`Wallet Unlocked: ${stdout}`);
  const NodeInfo = stdout;
  return NodeInfo;
}

async function IsValidAddress(args) {
  // using the wallet API get this info and return to script
  if (args !== null) {
    const { stdout, stderr } = await exec('curl -s -XPOST http://127.0.0.1:5359/api/IsValidAddress -d \'{"address": "' + args + '"}\'');
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    const output = stdout.slice(1, -2);
    const returnData = { balance: output };
    return returnData;
  }
  else {
  // no args passed
    // console.log('no args passed... We need an address!');
    const returnData = { error: true };
    return returnData;
  }
}

async function GetSecret(args) {
  // using the wallet API get this publicKeys secret keys
  if (args !== null) {
    const { stdout, stderr } = await exec('curl -s -XPOST http://127.0.0.1:5359/api/GetRecoverySeeds -d \'{"address": "' + args + '"}\'');
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    // console.log('stdout: ' + stdout)
    // const output = stdout.slice(1, -2);
    // const returnData = { balance: output };
    return stdout;
  }
  else {
  // no args passed
    // console.log('no args passed... We need an address!');
    return;
  }
}
async function GetSecretKeys(args) {
  // using the wallet API get this publicKeys secret keys
  if (args !== null) {
    const { stdout, stderr } = await exec('curl -s -XPOST http://127.0.0.1:5359/api/GetRecoverySeeds -d \'{"address": "' + args + '"}\'');
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    const output = JSON.stringify(JSON.parse(stdout));
    // const output = stdout.slice(1, -2);
    // console.log('output: ' + output)
    return output;
  }
  else {
  // no args passed
    // console.log('no args passed... We need an address!');
    return;
  }
}
async function GetTxInfo(args) {
  // console.log('GetTxInfo args: ' + args)
  const { stdout, stderr } = await exec('curl -s -XPOST http://127.0.0.1:5359/api/GetTransaction -d \'{"tx_hash": "' + args + '"}\'');
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  const NodeInfo = stdout;
  return NodeInfo;
}
// curl -s -XGET http://127.0.0.1:5359/api/GetWalletInfo

module.exports = {
  list : list,
  GetHeight: GetHeight,
  GetNodeInfo: GetNodeInfo,
  IsValidAddress: IsValidAddress,
  listAll: listAll,
  count : count,
  totalBalance : totalBalance,
  checkBalance : checkBalance,
  GetBalance : GetBalance,
  encrypt : encrypt,
  lock : lock,
  unlock : unlock,
  getWalletInfo : getWalletInfo,
  CreateQRLWallet : CreateQRLWallet,
  sendQuanta : sendQuanta,
  GetSecret : GetSecret,
  GetSecretKeys : GetSecretKeys,
  GetTxInfo : GetTxInfo,
};

