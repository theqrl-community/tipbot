module.exports = {
  name: 'add',
  description: 'Signup to the QRL TipBot',
  args: false,
  aliases: ['join', 'signup', 'su', 'Add', 'ADD'],
  guildOnly: false,
  usage: '',
  cooldown: 0,

  execute(message, args) {
    const Discord = require('discord.js');
    // const QRCode = require('qrcode')
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    const wallet = require('../../qrl/walletTools');
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(25);
    const checkUser = dbHelper.CheckUser;
    const addUser = dbHelper.AddUser;
    const addTransaction = dbHelper.addTransaction;
    const MessageAuthorID = message.author.id;
    const MessageAuthorUsername = message.author.username;
    const username = `${message.author}`;
    const userName = username.slice(1, -1);
    const user_info = { service: 'discord', user_id: userName };
    const checkUserpromise = checkUser(user_info);
    const getBalance = wallet.GetBalance;
    const faucet = require('../../faucet/faucetDB_Helper.js');
    const faucetDrip = faucet.Drip;
    // use to send a reply to user with delay and stop typing
    // ReplyMessage(' Check your DM\'s');
    function ReplyMessage(content) {
      message.channel.startTyping();
      setTimeout(function() {
        message.reply(content);
        message.channel.stopTyping(true);
      }, 1000);
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
      }, 1000);
    }

    function toQuanta(number) {
      const shor = 1000000000;
      return number / shor;
    }
    function toShor(number) {
      const shor = 1000000000;
      return number * shor;
    }
    async function faucetBalance() {
      return new Promise(function(resolve) {
      // using the faucet address check for a balance
        const walletAddress = config.faucet.faucet_wallet_pub;
        getBalance(walletAddress).then(function(balance) {
          // console.log('faucet balance: ' + JSON.stringify(balance));
          // getBalance('Q000300636e629ad3f50791cb2bfb9ed28010f0b072ba1f860763ef634d51225e4e1782f686547e').then(function(balance) {
          resolve(balance);
        });
      });
    }

    // used for the new user signup. Add the new users address to the faucet and drip them some funds
    function dripAmount(min, max) {
      const minAmt = toShor(min);
      const maxAmt = toShor(max);
      // console.log('min: ' + minAmt + ' max: ' + maxAmt);
      const randomNumber = Math.floor(
        Math.random() * (maxAmt - minAmt) + minAmt,
      );
      const num = toQuanta(randomNumber);
      // console.log('Random number ' + num);
      return num;
    }
    let dripamt = dripAmount(config.faucet.min_payout, config.faucet.max_payout);

    if (args[0] == undefined) {



      checkUserpromise.then(function(result) {
        const output = JSON.parse(JSON.stringify(result));
        // console.log('checkUserpromise output: ' + JSON.stringify(result));
      // check for user banned here and fail if so
        const found = result.user_found;
        // console.log('user found: ' + found);
        // check for the user_found value returned from the promise
        if (found === 'true') {
          // user is found, have they been banned?
          if (result.banned) {
            errorMessage({ error: 'User is Banned...', description: 'The user has been banned from the tipbot and cannot use the service.\n User Banned on `' + result.banned_date + '`'})
            return;
          }

          const getUserWalletPub = dbHelper.GetUserWalletPub;
          const walletPub = getUserWalletPub({ user_id: result.user_id });
          walletPub.then(function(address) {
            return address;
          }).then(function(balanceReq) {
            const userAddress = balanceReq.wallet_pub;
            // should return { wallet_bal: wallet_bal }
            const walletBal = dbHelper.GetUserWalletBal({ user_id: result.user_id });
            walletBal.then(function(balance) {
              const returnData = { wallet_pub: userAddress, wallet_bal: balance.wallet_bal };
              return returnData;
            }).then(function(reply) {

              //  embed a message to the user with account details
              const userBalance = toQuanta(reply.wallet_bal);
              // console.log('userBalance ' + userBalance);
              const embed = new Discord.MessageEmbed()
                .setColor(0x000000)
                .setTitle('**TipBot Account Exists**')
                .setDescription('Here is your existing TipBot account information.')
                .setFooter('  .: Tipbot provided by The QRL Contributors :.')
                // .setFooter(`TipBot Donation Address: ${config.bot_details.bot_donationAddress}`)
                .addField('Your QRL Wallet Public Address::', '[' + reply.wallet_pub + '](' + config.bot_details.explorer_url + '/a/' + walletPub.wallet_pub + ')')
                .addField('Your QRL Wallet Balance:\t', `\`${userBalance}\``)
                .addField('For all of my commands:\t', '`+help`');
              message.author.send({ embed })
                .then(() => {
                  if (message.channel.type === 'dm') return;
                  // message.channel.stopTyping(true);
                  errorMessage({ error: 'User Found In System...', description: 'You\'re signed up already. :thumbsup:\nTry `+help`' });
                  // ReplyMessage('\nYou\'re signed up already. :thumbsup:\nTry `+help`');
                })
                .catch(error => {
                  errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });
                  // console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                  // message.channel.stopTyping(true);
                  // message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });
            });
          });
          // message.channel.stopTyping(true);
          return output;
        }
        else if (found === 'false') {
          // user is not found in database. Do things here to add them
          // Create user wallet
          // ReplyMessage('Adding your address to the system. This will take a bit.');
          const qrlWal = wallet.CreateQRLWallet;
          const WalletPromise = qrlWal();
          WalletPromise.then(function(address) {
            const QRLaddress = JSON.parse(address);
            const discord_id = '@' + MessageAuthorID;
            const wallet_pub = QRLaddress.address;

            faucetBalance().then(function(faucBal) {
              if (dripamt > faucBal.balance) {
                // console.log('Faucet is flat or less than needed for drip');
                dripamt = 0;
              }

              const userInfo = { service: 'discord', service_id: discord_id, user_name: MessageAuthorUsername, wallet_pub: wallet_pub, wallet_bal: 0, user_key: salt, user_auto_created: false, auto_create_date: new Date(), opt_out: false, optout_date: new Date(), drip_amt: dripamt, faucet_bal: faucBal.balance };
              // console.log('userInfo:' + JSON.stringify(userInfo));
              // message.channel.stopTyping();
              return userInfo;
            }).then(function(userInfo) {
            // add user to the database and create an account
              const AddUserPromise = addUser(userInfo);
              AddUserPromise.then(function(addUserResp) {
                const response = JSON.stringify(addUserResp);
                console.log('AddUserPromise response: ' + response);
                const future_tip_amount = addUserResp[3].future_tip_amount;
                // console.log('future_tip_amount: ' + future_tip_amount);

                if (future_tip_amount > 0) {
                  // console.log('futuretips found');

                  const tipToArray = [];
                  const tipToAddress = [userInfo.wallet_pub];
                  tipToArray.push(userInfo);
                  const fee = toShor(config.wallet.tx_fee);
                  const futureTipPretty = toQuanta(future_tip_amount);
                  const future_tip = { amount: future_tip_amount, fee: fee, address_from: config.wallet.hold_address, address_to: tipToAddress };
                  // console.log('future_tip data: ' + JSON.stringify(future_tip));
                  const send_future_tip = wallet.sendQuanta;
                  send_future_tip(future_tip).then(function(futureTip) {
                    // console.log('futureTip: ' + JSON.stringify(futureTip))
                    const futureTipOut = JSON.parse(futureTip);
                    // console.log(JSON.stringify(futureTipOut));
                    const tx_hash = futureTipOut.tx.transaction_hash;
                    ReplyMessage('Someone sent a tip before you signed up! `' + futureTipPretty + ' qrl` on the way, look for them once the transaction is confirmed by the network. `+bal` to check your wallet balance.');
                    // write to transactions db
                    const tip_id = 1337;
                    const txInfo = { tip_id: tip_id, tx_hash: tx_hash };
                    const addTransactionPromise = addTransaction(txInfo);
                    addTransactionPromise.then(function(txRes) {
                      return txRes;
                    });
                    const futureClear = { service_id: userInfo.service_id };
                    const clearFutureTips = dbHelper.newUserClearFutureTips;
                    clearFutureTips(futureClear).then(function(clearRes) {
                      return clearRes;
                    });

                    /* we do this in the adduser script, and send info above in the userinfo array
                    // send user faucet drip
                    if (dripamt > 0) {
                      // console.log('faucet Payout: ' + dripamt);
                      const dripInfo = { service: 'discord', user_id: addUserResp[0].user_id, drip_amt: dripamt };
                      faucetDrip(dripInfo).then(function(dripping) {
                        return dripping;
                      });
                    }
                    */

                  });
                }
                return response;
              }).then(function(userresponse) {
                const userAddress = userInfo.wallet_pub;

                const embed = new Discord.MessageEmbed()
                  .setColor(0x000000)
                  .setTitle('**TipBot Account Info**')
                  .setDescription('Here is your TipBot account information.')
                  .setFooter('  .: Tipbot provided by The QRL Contributors :.')
                  // .setFooter(`TipBot Donation Address: ${config.bot_details.bot_donationAddress}`)
                  .addField('Your QRL Wallet Public Address::', '[' + userAddress + '](' + config.bot_details.explorer_url + '/a/' + userAddress + ')')
                  .setImage(userInfo.wallet_qr)
                  .addField('**Bonus!** You\'ll receive some Quanta from the faucet. \**Faucet payments can take up to 5 min to reflect in a users wallet*', '`' + dripamt + ' qrl` faucet payout')
                  .addField('For all of my commands:\t', '`+help`. It will take a few minutes for your wallet to be created.')
                  .addField('You must agree to my terms:', 'Enter `+terms` to read the details and `+agree` to start using the tipbot');
                message.author.send({ embed })

                  .catch(error => {
                    // console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    // message.channel.stopTyping(true);
                    errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });
                    // ReplyMessage('it seems like I can\'t DM you! Enable DM and try `+add` again...');
                    // react to the users message for fun
                  }).then(() => {
                    // if (message.channel.type === 'dm') return;

                    message.author.send(`
__**TipBot Terms and Conditions**__
:small_orange_diamond: Use of this TipBot and any function it may provide to you, as the user, is at your risk.
:small_orange_diamond: By using this service you agree to not hold liable, for any reasons, the owner, operators, or any affiliates of the QRL TipBot or anyone associated with this service.
:small_orange_diamond: By using this service, you agree to not abuse or misuse the service and will follow the rules listed below.
:small_orange_diamond: Abuse of this service may result in a ban from the service and if warranted legal action may be taken.
:small_orange_diamond: By using this service you agree to share information about your social media account used for signup to the TipBot service including but not limited to, service user name(s), service user ID(s), all interactions and messages with the bot, and any other public information available through the social media API services.
:small_orange_diamond: At no point will this information be sold or used for any purpose other than this TipBot service, and is only stored for the purpose of managing your accounts.
:small_orange_diamond: All funds must be withdrawn to a user controlled account.
:small_orange_diamond: Any funds left on the bot may be lost at any time, and the user agrees that this is an acceptable loss.
:small_orange_diamond: Funds shall be withdrawn from the bot regularly into user controlled wallets.
:small_orange_diamond: Users will not store large amounts of funds in any tipbot wallet

__**You assume all risk by using this service**__

                    `)
                      .catch(error => {
                        errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });
                        // console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                        // ReplyMessage('It seems like I can\'t DM you! Enable DM and try again...');
                        // deleteMessage();
                      }).then(function() {

                        message.author.send(`
:exclamation: __**RULES**__ :exclamation:
:diamond_shape_with_a_dot_inside: *All tips are final once sent.*
:diamond_shape_with_a_dot_inside: *Tips will never be refunded or returned to a user, for any reason.*
:diamond_shape_with_a_dot_inside: *This service is for tipping or giving small amounts of QRL to other users.*
:diamond_shape_with_a_dot_inside: *You agree to not store or trade currency or for any other reason than tipping users.*
:diamond_shape_with_a_dot_inside: *You will not store large amounts of QRL in this address at any time.*
:diamond_shape_with_a_dot_inside: *You take full responsibility for transferring funds out of the Tipbot, using the \`+transfer\` function into a wallet you control.*
:diamond_shape_with_a_dot_inside: *You will not use this bot if it will in any way break any law, in any jurisdiction. \`+opt-out\` to disable your account.*
:diamond_shape_with_a_dot_inside: *You will not use this bot in any way that is not intended or identified in these rules.*
:diamond_shape_with_a_dot_inside: *Any tips sent to a user that has not signed up will be saved by the bot for that user. Failure of the user to collect tips may result in a loss of funds for that user. They will not be returned to the sender.*
:diamond_shape_with_a_dot_inside: *Any abuse of the service will result in a ban, and if warranted legal action may be taken accordingly. Funds will not be returned to banned users.*

**You must \`+agree\` with these terms to use the bot!**
                    `);
                      })
                      .catch(error => {
                        // console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                        errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });
                        // deleteMessage();
                      });



                    ReplyMessage(' :white_check_mark: You\'re signed up! :white_check_mark: \nPlease `+agree` to my terms in DM to begin using the bot. It will take a few minutes for your wallet to be created.');
                  })
                  .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    ReplyMessage('it seems like I can\'t DM you! Enable DM and try `+add` again...');
                  // react to the users message for fun
                  });
                message.react('🇶')
                  .then(() => message.react('🇷'))
                  .then(() => message.react('🇱'))
                  .catch(() => console.error('One of the emojis failed to react.'));
                return userresponse;
              });
            });
          });
        }
      });
    }
  },
};