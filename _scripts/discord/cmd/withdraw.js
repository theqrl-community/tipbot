const config = require('../../../_config/config.json');
module.exports = {
  name: 'withdraw',
  description: 'Withdraw QRL from your TipBot account to a QRL wallet.',
  args: false,
  guildOnly: false,
  cooldown: 0,
  aliases: ['wd', 'transfer', 'cashout', 'Withdraw', 'WD', 'extract'],
  usage: '\n__**withdraw** { ***wd***, ***transfer***, ***cashout***, ***send*** }__\nWithdraw QRL tips from your TIpBot account.\nRequires amount/all and a QRL address to send to.\n\nExample to withdraw all funds from the tipbot wallet: `' + config.discord.prefix + 'withdraw all QRLADDRESS`\nExample to transfer an amount of funds: `' + config.discord.prefix + 'withdraw 2.01 QRLADDRESS` ',
  execute(message, args) {
    // console.log('transfer called...' + JSON.stringify(args));
    const dbHelper = require('../../db/dbHelper');
    const wallet = require('../../qrl/walletTools');
    const Discord = require('discord.js');
    const uuid = `${message.author}`;
    const UUID = uuid.slice(1, -1);
    const toShor = 1000000000;
    const lowestWDValue = 0.000000001;
    const highestWDValue = 105000000;

    let userFound = false;
    let userAgree = false;
    let userOptOut = true;
    let pass = false;
    let transfer_to = '';
    let trans_amt = '';
    let wallet_pub = '';
    let wallet_bal = '';
    const fee = config.wallet.tx_fee * toShor;
    const amtArray = [];
    const addressArray = [];
    const userArray = [];

    // ReplyMessage(' Check your DM\'s');
    function ReplyMessage(content) {
      message.channel.startTyping();
      setTimeout(function() {
        message.reply(content);
        message.channel.stopTyping(true);
      }, 100);
    }

    // errorMessage({ error: 'Can\'t access faucet from DM!', description: 'Please try again from the main chat, this function will only work there.' });
    function errorMessage(content, footer = '  .: Tipbot provided by The QRL Contributors :.') {
      message.channel.startTyping();
      setTimeout(function() {
        const embed = new Discord.MessageEmbed()
          .setColor(0x000000)
          .setTitle(':warning:  ERROR: ' + content.error)
          .setDescription(content.description)
          .setFooter(footer);
        message.reply({ embed });
        message.channel.stopTyping(true);
      }, 100);
    }

    function deleteMessage() {
      // Delete the previous message
      if(message.guild != null) {
        message.delete();
      }
    }
   
    function isQRLValue(str) {
      // Fail immediately.
      let test = false;
      // Check if it's only numeric and periods (no spaces, etc)
      if(/^[0-9]{0,8}[.]?[0-9]{0,9}$/.test(str)) {
        // And check for a value between 0.000000001 and 105000000
        if(str >= lowestWDValue && str <= highestWDValue) {
          test = true;
        }
      }
      return test;
    }

    // test the address to the regex pattern
    function isQRLAddress(addy) {
      let test = false;
      if(/^(Q|q)[0-9a-fA-f]{78}$/.test(addy)) {
        test = true;
      }
      return test;
    }

    function toQuanta(number) {
      const shor = 1000000000;
      return number / shor;
    }

    function withdrawAmount(balance) {
      for (const arg of args) {
        const checkValue = isQRLValue(arg);
        if(checkValue) {
          return (arg * toShor) - fee;
        }
        else if (arg === 'all') {
          return balance - fee;
        }
      }
      // no valid amount given, return none
      return 0;
    }

    function withdrawAddress() {
      for (const arg of args) {
        const checkAddress = isQRLAddress(arg);
        if(checkAddress) {
          return arg;
        }
      }
    }

    // Get user info.
    async function getUserInfo(usrInfo) {
      return new Promise(resolve => {
        const data = dbHelper.GetAllUserInfo(usrInfo);
        resolve(data);
      });
    }

    // send the tx data to the transactions database
    async function transactionsDBWrite(txArgs) {
      return new Promise(resolve => {
        // {tip_id: fromTipDB, tx_hash: fromTX_HASH}
        const txInfo = { tip_id: txArgs.tip_id, tx_hash: txArgs.tx_hash, tx_type: 'withdraw' };
        const wdTxEntry = dbHelper.addTransaction(txInfo);
        resolve(wdTxEntry);
      });
    }

    // send the withdraw data to the withdraw database
    async function withdrawDBWrite(txArgs) {
      return new Promise(resolve => {
        // {service: 'discord', user_id: , tx_hash:, to_address:, amt: }
        const txInfo = { service: 'discord', user_id: txArgs.user_id, tx_hash: txArgs.tx_hash, to_address: txArgs.to_address, amt: txArgs.amt };
        const wdDbEntry = dbHelper.withdraw(txInfo);
        resolve(wdDbEntry);
      });
    }

    // send the funds
    async function sendFunds(sendArgs) {
      return new Promise(resolve => {
        const send = wallet.sendQuanta(sendArgs);
        resolve(send);
      });
    }
    // ########################################################
    //  Checks...
    // ########################################################
    async function commandChecks() {
      // Check args are not blank, as we need args to function
      if ((args[0] == undefined) || (args[1] == undefined)) {
        errorMessage({ error: 'Incorrect info given...', description: 'Use this function to withdraw funds from the Tipbot. `' + config.discord.prefix + 'help withdraw` for more' });
        const returnArray = [{ check: false }];
        return returnArray;
      }
      // Check for user in system, agree, opt out?
      const userInfo = await getUserInfo({ service: 'discord', service_id: UUID });
      // is user found?
      if (userInfo[0].user_found) {
        // eslint-disable-next-line
        userFound = true;
      }
      else {
        // fail on error
        errorMessage({ error: 'User Not Found...', description: 'You are not signed up yet!. `' + config.discord.prefix + 'add` to get started.' });
        const returnArray = [{ check: false }];
        return returnArray;
      }
      // has user agreed
      if (userInfo[0].user_agree) {
        // eslint-disable-next-line
        userAgree = true;
      }
      else {
        // fail on error
        errorMessage({ error: 'User Has Not Agreed...', description: 'You must agree to the terms and conditions. `' + config.discord.prefix + 'terms` to read them.' });
        const returnArray = [{ check: false }];
        return returnArray;
      }
      // has user opted out
      if (!userInfo[0].opt_out) {
        // eslint-disable-next-line
        userOptOut = false;
      }
      else {
        // fail on error
        errorMessage({ error: 'User Has Opted Out...', description: 'You have previously opted out of the tipbot. Enter `' + config.discord.prefix + 'opt-in` to start using the tipbot.' });
        const returnArray = [{ check: false }];
        return returnArray;
      }
      // get withdraw address from the message, regardless of where after +wd it is. Also checks for valid address
      transfer_to = withdrawAddress();
      // incorrect address
      if (!transfer_to) {
        // transfer address not given or incorrect
        errorMessage({ error: 'Incorrect Address Given...', description: 'Please enter a correct QRL Address. To donate to the bot use\n `' + config.discord.prefix + 'wd all ' + config.faucet.faucet_wallet_pub });
        const returnArray = [{ check: false }];
        return returnArray;
      }
      // SET THE WALLET_PUB TO USER LOOKUP WALLET_PUB address for transaction and balance lookup
      wallet_pub = userInfo[0].wallet_pub;
      // check for user address in wd cmd, cant send to self
      if (transfer_to === wallet_pub) {
        // user sending to self.. fail and return to the user
        errorMessage({ error: 'User Address Detected...', description: 'You cannot send funds to yourself. Please transfer ***out*** of the TipBot.' });
        const returnArray = [{ check: false }];
        return returnArray;
      }
      // set the wallet balance from the user lookup
      wallet_bal = userInfo[0].wallet_bal;
      // wallet is flat
      if (wallet_bal === 0) {
        // Wallet Balance is Flat
        errorMessage({ error: 'Wallet Balance is Flat...', description: 'You don\'t have any funds to withdraw. Get a tip or try the faucet `' + config.discord.prefix + 'drip`' });
        const returnArray = [{ check: false }];
        return returnArray;
      }
      trans_amt = await withdrawAmount(wallet_bal);
      // get the pending amount, if any from the database
      const pending = userInfo[0].pending;
      if (pending > 0) {
        errorMessage({ error: 'Pending Balance Found...', description: 'You\'ve recently sent funds that have not confirmed on the network. Please wait for all transactions to clear. More details in your DM.' });
        const embed = new Discord.MessageEmbed()
          .setColor(0x000000)
          .setTitle('Pending Balance - ' + toQuanta(pending) + ' QRL')
          .setDescription('You must wait for all transactions to clear before you can withdraw any funds. Check unconfirmed transactions on the [QRL Block Explorer](' + config.bot_details.explorer_url + '/unconfirmed). once cleared you can send your transaction.\n\n**Attempted transaction details below**')
          .addField('Attempted Amount:', '`' + toQuanta(trans_amt) + ' QRL`', true)
          .addField('Network Fee:', '`' + toQuanta(fee).toFixed(9) + ' QRL`', true)
          .addField('Receiving Address:', '[' + transfer_to + '](' + config.bot_details.explorer_url + '/a/' + transfer_to + ')')
          .addField('Pending Balance:', '[`' + toQuanta(wallet_bal - pending) + ' QRL`](' + config.bot_details.explorer_url + '/a/' + wallet_pub + ')', true)
          .addField('Pending Amount Found:', '`' + toQuanta(Number(pending)) + ' QRL`', true)
          .setFooter('  .: Tipbot provided by The QRL Contributors :.');
        message.author.send({ embed })
          .catch(error => {
            errorMessage({ error: 'Direct Message Disabled...', description: 'It seems you have DM\'s blocked, please enable and try again...' });
            if (error) return error;
          });
        const returnArray = [{ check: false }];
        return returnArray;
      }
      amtArray.push(trans_amt);
      addressArray.push(transfer_to);
      // incorrect info in the transfer command
      if (trans_amt === 0) {
        // no transfer or incorrect transfer amount given
        errorMessage({ error: 'Invalid Amount Given...', description: 'Please enter a valid number to withdraw or `' + config.discord.prefix + 'transfer all {QRL-ADDRESS}`.' });
        const returnArray = [{ check: false }];
        return returnArray;
      }
      // wallet balance is less than balance
      if (wallet_bal < trans_amt) {
        // trying to send more than you have
        errorMessage({ error: 'Wallet Balance Is Less Than Withdraw...', description: 'You Don\'t have enough finds for that, check you `' + config.discord.prefix + 'bal` and try again.' });
        const returnArray = [{ check: false }];
        return returnArray;
      }
      // user passed checks. return true
      userArray.push(userInfo);
      pass = true;
      const returnArray = [{ check: true, amtArray: amtArray, addressArray: addressArray, userArray: userArray }];
      return returnArray;
    }

    async function main() {
      deleteMessage();
      // run commandChecks and fail if not successful
      const check = await commandChecks();
      if (!pass) {
        // the check command failed
        return false;
      }
      else {
        ReplyMessage('Sending your withdraw transaction now, Be right back..');
        // check passed, do stuff
        const transferAmount = check[0].amtArray;
        const transferInfo = { address_to: check[0].addressArray, amount: transferAmount, fee: fee, address_from: check[0].userArray[0][0].wallet_pub };
        const transferFunds = await sendFunds(transferInfo);
        const transferFundsOut = JSON.parse(transferFunds);
        if (transferFundsOut.tx.transaction_hash != undefined) {
          const wdDbInfo = { user_id: check[0].userArray[0][0].user_id, tx_hash: transferFundsOut.tx.transaction_hash, to_address: check[0].addressArray[0], amt: (check[0].amtArray[0] / toShor) };
          const wdDbWrite = await withdrawDBWrite(wdDbInfo);
          const txDbInfo = { tip_id: wdDbWrite[0].transaction_db_id, tx_hash: transferFundsOut.tx.transaction_hash };
          // eslint-disable-next-line
          const txDbWrite = await transactionsDBWrite(txDbInfo);
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .setTitle('Withdraw Has Been Sent!')
            .setDescription('Your withdraw was posted on the network! It may take a few minutes to confirm and post. See the transaction on the [QRL Block Explorer](' + config.bot_details.explorer_url + '/tx/' + transferFundsOut.tx.transaction_hash + ')')
            .addField('Amount Sent:', '`' + toQuanta(check[0].amtArray) + ' QRL`', true)
            .addField('Network Fee:', '`' + toQuanta(fee).toFixed(9) + ' QRL`', true)
            .addField('Pending Amount:', '`' + toQuanta(Number(check[0].userArray[0][0].pending) + Number(transferAmount) + fee) + ' QRL`', true)
            .addField('Approx New Balance:', '`' + toQuanta((check[0].userArray[0][0].wallet_bal - check[0].userArray[0][0].pending) - transferAmount).toFixed(9) + ' QRL`', true)
            .addField('Address Sent to:', '[' + check[0].addressArray[0] + '](' + config.bot_details.explorer_url + '/a/' + check[0].addressArray[0] + ')')
            .addField('Transaction Hash:', '[```yaml\n' + transferFundsOut.tx.transaction_hash + '\n```](' + config.bot_details.explorer_url + '/tx/' + transferFundsOut.tx.transaction_hash + ')')
            .setFooter('  .: Tipbot provided by The QRL Contributors :.');
          message.author.send({ embed })
            .catch(error => {
              errorMessage({ error: 'Direct Message Disabled...', description: 'It seems you have DM\'s blocked, please enable and try again...' });
              if (error) return error;
            });
        }
        else {
          console.log('error thrown');
        }
      }
    }

    main().then(function() {
      if (pass) {
        if (message.channel.type !== 'dm' || message.channel.name !== config.bot_details.ban_channel) {
          ReplyMessage('Withdraw has been sent, please see you DM for details');
          return;
        }
      }
    });
  },
};