/*/
Initialize the bot and create all wallets required for operation.
/*/

const readline = require("readline");
const chalk = require("chalk");
const dbHelper = require("./db/dbHelper");
const wallet = require("./qrl/walletTools");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(25);
const addUser = dbHelper.AddUser;
const walletInfoArray = [];
const infoArray = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const botDiscordID = () => {
  return new Promise((resolve) => {
    rl.question(
      chalk.cyan.bold("Provide Bot Discord ID: "),
      (bot_Discord_ID) => {
        infoArray.push({ bot_Discord_ID: bot_Discord_ID });
        resolve(infoArray);
      }
    );
  });
};

const botDiscordUserName = () => {
  return new Promise((resolve) => {
    rl.question(
      chalk.cyan.bold("Provide bot Discord User Name: "),
      (bot_Discord_Username) => {
        infoArray.push({ bot_Discord_Username: bot_Discord_Username });
        resolve(infoArray);
      }
    );
  });
};

const walletEncryptionPass = () => {
  return new Promise((resolve) => {
    rl.question(
      chalk.cyan.bold("Provide wallet Encryption password: "),
      (wallet_encryption_pass) => {
        infoArray.push({ wallet_encryption_pass: wallet_encryption_pass });
        resolve(infoArray);
      }
    );
  });
};

const main = async () => {
  await botDiscordID();
  await botDiscordUserName();
  await walletEncryptionPass();
  rl.close();
};

main().then(function () {
  const qrlWal = wallet.CreateQRLWallet;
  const secretKey = wallet.GetSecret;
  const faucetWalletPromise = qrlWal();
  const holdWalletPromise = qrlWal();
  const botWalletPromise = qrlWal();
  const plusoneWalletPromise = qrlWal();

  // create the faucet wallet
  console.log("Create the faucet wallet");

  faucetWalletPromise.then(function (faucet_Wallet_Info) {
    const faucetWalletInfo = JSON.parse(faucet_Wallet_Info);
    console.log("faucet_wallet_info: " + JSON.stringify(faucetWalletInfo));
    walletInfoArray.push({ faucetInfo: faucetWalletInfo });
    console.log("walletInfoArray: " + JSON.stringify(walletInfoArray));

    // print public key to terminal
    console.log(
      chalk.cyan.bold("\nFaucet Pub Address: ") +
        chalk.blue.bold(JSON.stringify(walletInfoArray[0].faucetInfo.address))
    );

    // get private key and print to terminal
    const faucetSecretKeyPromise = secretKey(
      walletInfoArray[0].faucetInfo.address
    );
    faucetSecretKeyPromise.then(function (faucetSecrets) {
      const faucetSec = JSON.stringify(JSON.parse(faucetSecrets));
      console.log(
        chalk.cyan.bold("Faucet Secret Keys: ") + chalk.red.bold(faucetSec)
      );

      // create hold wallet
      holdWalletPromise.then(function (hold_Wallet_Info) {
        const holdWalletInfo = JSON.parse(hold_Wallet_Info);
        walletInfoArray.push({ holdInfo: holdWalletInfo });
        console.log(
          chalk.cyan.bold("\nHold Pub Address: ") +
            chalk.blue.bold(JSON.stringify(walletInfoArray[1].holdInfo.address))
        );
        // get the private keys and print to the terminal
        const holdSecretKeyPromise = secretKey(
          walletInfoArray[1].holdInfo.address
        );
        holdSecretKeyPromise.then(function (holdSecrets) {
          const holdSec = JSON.stringify(JSON.parse(holdSecrets));
          console.log(
            chalk.cyan.bold("Hold Secret Keys: ") + chalk.red.bold(holdSec)
          );

          // create hold wallet
          plusoneWalletPromise.then(function (plusone_Wallet_Info) {
            const plusoneWalletInfo = JSON.parse(plusone_Wallet_Info);
            walletInfoArray.push({ plusoneInfo: plusoneWalletInfo });
            console.log(
              chalk.cyan.bold("\nPlusOne Pub Address: ") +
                chalk.blue.bold(JSON.stringify(walletInfoArray[2].plusoneInfo.address))
            );
            // get the private keys and print to the terminal
            const plusoneSecretKeyPromise = secretKey(
              walletInfoArray[2].plusoneInfo.address
            );
            plusoneSecretKeyPromise.then(function (plusoneSecrets) {
              const plusoneSec = JSON.stringify(JSON.parse(plusoneSecrets));
              console.log(
                chalk.cyan.bold("Hold Secret Keys: ") +
                  chalk.red.bold(plusoneSec)
              );

              // create the BOT wallet with the bot info from above
              botWalletPromise.then(function (address) {
                const QRLaddress = JSON.parse(address);
                // print public key to terminal
                // get the private keys and print to tthe terminal
                const discord_id = infoArray[0].bot_Discord_ID;
                const wallet_pub = QRLaddress.address;
                const dripamt = 0;
                const botInfo = {
                  service: "discord",
                  service_id: discord_id,
                  user_name: infoArray[1].bot_Discord_Username,
                  wallet_pub: wallet_pub,
                  wallet_bal: 0,
                  user_key: salt,
                  user_auto_created: false,
                  auto_create_date: new Date(),
                  opt_out: false,
                  optout_date: new Date(),
                  drip_amt: dripamt,
                };
                // console.log('botInfo: ' + JSON.stringify(botInfo));
                walletInfoArray.push({ botInfo: botInfo });
                console.log(
                  chalk.cyan.bold("\nBot Pub Address: ") +
                    chalk.blue.bold(
                      JSON.stringify(walletInfoArray[3].botInfo.wallet_pub)
                    )
                );
                const botSecretKeyPromise = secretKey(
                  walletInfoArray[3].botInfo.wallet_pub
                );
                botSecretKeyPromise.then(function (botSecrets) {
                  const botSec = JSON.stringify(JSON.parse(botSecrets));
                  console.log(
                    chalk.cyan.bold("Bot Secret Keys: ") +
                      chalk.red.bold(botSec)
                  );
                  // return walletInfoArray;
                  // console.log('userInfo: ' + JSON.stringify(userInfo));
                  const AddUserPromise = addUser(walletInfoArray[3].botInfo);
                  AddUserPromise.then(function () {
                    const encryptWallet = wallet.encrypt;
                    encryptWallet(infoArray[2].wallet_encryption_pass);
                  }).then(function () {
                    // console.log('Results:');
                    console.log(
                      chalk.cyan.bold("Wallet encryption key: ") +
                        chalk.red.bold(infoArray[2].wallet_encryption_pass) +
                        "\n"
                    );
                    process.exit();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
