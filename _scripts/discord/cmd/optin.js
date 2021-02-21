module.exports = {
  name: 'opt-in',
  description: 'Opt Into the QRL TipBot if you have opted out',
  args: false,
  guildOnly: false,
  aliases: ['oi'],
  cooldown: 0,
  usage: '\n**opt-in** - Opt in to the tipbot.',
  execute(message) {
    // use to send a reply to user with delay and stop typing
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    const wallet = require('../../qrl/walletTools');
    const config = require('../../../_config/config.json');
    const uuid = `${message.author}`;
    const userID = uuid.slice(1, -1);

    // ReplyMessage(' Check your DM\'s');
    function ReplyMessage(content) {
      message.channel.startTyping();
      setTimeout(function() {
        message.reply(content);
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

    // Get user info.
    async function getUserInfo(userInfo) {
      return new Promise(resolve => {
        const data = dbHelper.GetAllUserInfo(userInfo);
        resolve(data);
      });
    }

    async function clearFuture(args) {
      return new Promise(resolve => {
        const futureClear = { user_id: args };
        const clearFutureTipsDB = dbHelper.clearFutureTips(futureClear);
        resolve(clearFutureTipsDB);
      });
    }

    async function optIn(user_id) {
      return new Promise(resolve => {
        const optinInfo = { user_id: user_id };
        const optBackIn = dbHelper.OptIn(optinInfo);
        resolve(optBackIn);
      });
    }

    async function sendFutureTips(tipInfo) {
      return new Promise(resolve => {
        // const future_tip = { amount: tipInfo.future_tip_amount, fee: tipInfo.fee, address_from: config.wallet.hold_address, address_to: tipInfo.ToAddress };
        const send_future_tip = wallet.sendQuanta(tipInfo);
        resolve(send_future_tip);
      });
    }

    async function CheckFuture(args) {
      return new Promise(resolve => {
        const data = { service_id: args };
        const checkFuture = dbHelper.checkFutureTips(data);
        resolve(checkFuture);
      });
    }

    async function main() {
      let found = false;
      // eslint-disable-next-line
      let agree = false;
      // eslint-disable-next-line
      let optout = false;
      let future_tip_amount = 0;
      const fee = toShor(config.wallet.tx_fee);
      const user_info = await getUserInfo({ service: 'discord', service_id: userID });
      if (user_info[0].user_found) {
        // eslint-disable-next-line
        found = true;
      }
      else {
        errorMessage({ error: 'User Not Found', description: 'You need to sign up `+add`' });
        return;
      }

      if (user_info[0].user_agree) {
        // eslint-disable-next-line
        user_agree = true;
      }
      else {
        errorMessage({ error: 'User Has Not Agreed', description: 'You need to agree to my terms `+agree` or `+terms`' });
        return;
      }
      if (user_info[0].opt_out) {
        // eslint-disable-next-line
        opt_out = true;
      }
      else {
        errorMessage({ error: 'User Still Opted In...', description: 'You have not opted out, `+help` for a list of my functions.' });
        return;
      }

      // user passed checks, opt them back in and check for future tips
      const user_id = user_info[0].user_id;
      const checkFuture = await CheckFuture(user_id);
      future_tip_amount = checkFuture[0].future_tip_amount;
      const futureTipPretty = toQuanta(future_tip_amount);

      if (future_tip_amount > 0) {
        const address_array = [user_info[0].wallet_pub];
        // send the user their saved tips
        // eslint-disable-next-line
        const sendTips = await sendFutureTips({ amount: future_tip_amount, fee: fee, address_to: address_array, address_from: config.wallet.hold_address });
        // console.log(sendTips);
        ReplyMessage('Someone sent a tip while you were opted out! `' + futureTipPretty + ' qrl` on the way, look for them once the transaction is confirmed by the network. `+bal` to check your wallet balance.');
        // clear the saved tips in future_tips db, set to paid for user.
        // eslint-disable-next-line
        const wipeSaved = await clearFuture(user_id);
      }
      // eslint-disable-next-line
      const oi = await optIn(user_id);
    }
    // run thew main loop and notify the user upon success
    main().then(function(response, err) {
      if (err) {
        console.log('optin.js main() error: ', err);
        return;
      }
      ReplyMessage('You\'ve opted back in! :thumbsup:');
    });
  },
};