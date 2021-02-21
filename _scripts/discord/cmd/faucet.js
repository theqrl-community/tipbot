module.exports = {
  name: 'faucet',
  description: 'Collect some free qrl from the tipbot faucet',
  args: false,
  aliases: ['Faucet', 'drip', 'Drip', 'payme', 'freeqrl', 'free', 'drop'],
  guildOnly: false,
  usage: ' ',
  cooldown: 0,

  execute(message) {
    const Discord = require('discord.js');
    const chalk = require('chalk');
    const dbHelper = require('../../db/dbHelper');
    const faucetHelper = require('../../faucet/faucetDB_Helper');
    const wallet = require('../../qrl/walletTools');
    const config = require('../../../_config/config.json');
        const uuid = `${message.author}`;
    const service_id = uuid.slice(1, -1);
    const GetAllUserInfo = dbHelper.GetAllUserInfo;
    const checkFaucetPayouts = faucetHelper.checkPayments;
    const getBalance = wallet.GetBalance;
    const faucetDrip = faucetHelper.Drip;
    const userInfoArray = [];

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
    // check if this is a DM and if so, block forcing user into the chatroom
    if (message.channel.type === 'dm') {
      errorMessage({ error: 'Can\'t access faucet from DM!', description: 'Please try again from the main chat, this function will only work there.' });
      return;
    }

    // check for a balance in the faucet wallet first
    async function faucetBalance() {
      return new Promise(function(resolve) {
      // using the faucet address check for a balance
        const walletAddress = config.faucet.faucet_wallet_pub;
        getBalance(walletAddress).then(function(balance) {
        // getBalance('Q000300636e629ad3f50791cb2bfb9ed28010f0b072ba1f860763ef634d51225e4e1782f686547e').then(function(balance) {
          resolve(balance);
        });
      });
    }
    faucetBalance()
      .then(function(balanceRes) {
      // console.log(chalk.cyan(' ! ') + chalk.blue(' Funds positive! Drip on...'));
      // console.log(chalk.cyan('faucetBalance: ') + chalk.green(JSON.stringify(balanceRes)));
        if (balanceRes.balance <= '0') {
          console.log(chalk.red('!!! ') + chalk.bgRed(' The Faucet is flat... ') + chalk.red('Add funds to: ') + chalk.bgRed(config.faucet.faucet_wallet_pub));
          errorMessage({ error: 'faucet is dry...', description: 'Until a deposit is made to the faucet address, no more donations possible. **Faucet Donation Address:** `' + config.faucet.faucet_wallet_pub + '`' });
          // message.reply('**the faucet is dry**...\nUntil a deposit is made to the faucet address, no more withdraws allowed. **Faucet Donation Address:** `' + config.faucet.faucet_wallet_pub + '`');
          return;
        }


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
        // generate a randm number from a range set in the config file.
        }

        async function checkUser(user) {
          return new Promise(resolve => {
            const check_info = { service: 'discord', service_id: user };
            const checkPromise = GetAllUserInfo(check_info);
            // fail from the start
            let checkUserPassed = false;
            checkPromise.then(function(results) {
            // console.log('results: ' + JSON.stringify(results));
              userInfoArray.push(results);
              const user_found = results[0].user_found;
              const opt_out = results[0].opt_out;
              const agree = results[0].user_agree;
              // check if user found
              if (user_found) {
                // console.log('user found: ' + user_found);

              }
              else{
                // user not found
                // console.log('user is not found');
                userInfoArray.push({ checkUserPassed: false, checkUserPassedError: 'not_found' });
                // message.reply('Are you signed up?');
                errorMessage({ error: 'User Not Found...', description: 'Please enter `+add` to sign-up then `+agree` to start using the bot' });
                return;
              }
              // check if agreed
              if (agree) {
                // console.log('user has agreed ' + agree);
                // set checkUserPassed to true and return
                let checkUserPassed = true;
                userInfoArray.push({ checkUserPassed: true });
                // return userInfoArray;
              }
              else {
                // not agreed to terms
                // console.log('need to agree to terms');
                userInfoArray.push({ checkUserPassed: false, checkUserPassedError: 'not_agreed' });
                // message.reply('You will need to agree to my `+terms` to use the bot. `+agree`');
                errorMessage({ error: 'User Has Not Agreed to Terms...', description: 'You must agree to the terms, enter `+terms` to read the terms and conditions, `+agree` to start using the bot.' });
                return;
              }
              // check if opt out
              if (!opt_out) {
              // console.log('user is not opted out:  ' + opt_out);
              }
              else{
              // user has opted out
              // console.log('User Opted out');
                userInfoArray.push({ checkUserPassed: false, checkUserPassedError: 'opted_out' });
                errorMessage({ error: 'User Has Opted Out...', description: 'Please `+opt-in` to use the bot.' });
                // message.reply('I see you have opted out. Please `+opt-in` to receive faucet funds');
                return;
              }
              resolve(userInfoArray);
              return;
            });
          });
        }

        async function checkFaucet(user_id) {
          return new Promise(resolve => {
            const check_info = { service: 'discord', service_id: user_id };
            const checkFaucetPromise = checkFaucetPayouts(check_info);
            // fail from the start
            let checkUserPassed = false;
            checkFaucetPromise.then(function(results) {
              // console.log('checkFaucetPromise results ' + JSON.stringify(results));
              // faucetInfoArray.push(results);
              resolve(results);
            });
          });
        }


        async function drip(DripArgs) {
          return new Promise(resolve => {
            const drip_info = DripArgs;
            faucetDrip(drip_info).then(function(dripReturn) {
              // console.log(JSON.stringify(dripReturn));
              resolve(dripReturn);
            });
          });
        }

        checkUser(service_id).then(function() {

          checkFaucet(service_id).then(function(faucetCheck) {
            // console.log('faucetCheck results' + JSON.stringify(faucetCheck));
            if (faucetCheck[0].drip_found === true) {
              // console.log('user has been found recently, no drips');
              errorMessage({ error: 'User is already Wet...', description: 'You have pulled from the faucet recently\n*Faucet will pay out every  **' + config.faucet.payout_interval + '*** minute(s).' });
              // message.reply(':no_entry_sign: You have pulled from the faucet recently :no_entry_sign:\n*Faucet will pay out once every  **' + config.faucet.payout_interval + ' minutes***.');
              return;
            }
            else if (faucetCheck[0].drip_found === false) {
              // no drip found. Do things here.
              // insert into faucet_payments to request a payment
              const user_id = userInfoArray[0][0].user_id;
              const Drip = dripAmount(config.faucet.min_payout, config.faucet.max_payout);
              // console.log('no drips found. Adding to db and sending a drip');
              const dripInfo = { user_id: user_id, service: 'discord', drip_amt: Drip };
              drip(dripInfo).then(function() {
                // console.log('all done, dripped and returned values\n' + JSON.stringify(ResDrip));
              });
              message.channel.stopTyping(true);
              ReplyMessage(':droplet: ' + Drip + ' Quanta sent! :droplet:\n*Funds take up to 5 min to deposit.*');
            }
          });
        });
      });
  },
};
