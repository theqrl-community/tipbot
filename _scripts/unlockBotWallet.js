/*/
Script to unlock the bot wallet after power cycle.

This equies manual intervention to re-enable the bot wallet as it is encrypted.

/*/

const readline = require('readline');
const wallet = require('./qrl/walletTools');
const infoArray = [];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const encPass = () => {
 return new Promise((resolve) => {
    rl.question('\nPlease enter wallet encryption passphrase: ', (enc_pass) => {
      infoArray.push({ encPass: enc_pass });
      resolve(infoArray);
    });
  });
};

const main = async () => {
  await encPass();
  rl.close();
};

main().then(function() {
  // unlock the wallet
  const passphrase = infoArray[0].encPass;
  const unlockWallet = wallet.unlock;
  const unlock = unlockWallet(passphrase);
  unlock.then(function(UnlockResp) {
    if(UnlockResp === '{}') {
      console.log('Wallet unlocked: ' + UnlockResp);
    }
    else {
      console.log('\nBad passphrase??\n\n' + UnlockResp);
    }
  });
});

