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
    const faucetResponse = require('../faucet-response.json');
    const uuid = `${message.author}`;
    const service_id = uuid.slice(1, -1);
    const GetAllUserInfo = dbHelper.GetAllUserInfo;
    const checkFaucetPayouts = faucetHelper.checkPayments;
    const getBalance = wallet.GetBalance;
    const faucetDrip = faucetHelper.Drip;
    const userInfoArray = [];

    // ReplyMessage(' Check your DM\'s');
    function ReplyMessage(content) {
      message.channel.startTyping();
      setTimeout(function() {
        message.reply(content);
        message.channel.stopTyping(true);
      }, 500);
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
      }, 500);
    }

    function dripMessage(content, footer = '  .: Tipbot Tidbits provided by The QRL Contributors :.') {
      message.channel.startTyping();
      setTimeout(function() {
        const embed = new Discord.MessageEmbed()
          .setColor('BLUE')
          .setURL(content.source)
          .setTitle(content.title)
          .setDescription(`${content.message} \n[More info here](${content.source})`)
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
    // check if this is a DM and if so, block forcing user into the chat room
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
          resolve(balance);
        });
      });
    }
    faucetBalance()
      .then(function(balanceRes) {
        if (balanceRes.balance <= '0') {
          console.log(chalk.red('!!! ') + chalk.bgRed(' The Faucet is flat... ') + chalk.red('Add funds to: ') + chalk.bgRed(config.faucet.faucet_wallet_pub));
          errorMessage({ error: 'faucet is dry...', description: 'Until a deposit is made to the faucet address, no more donations possible. **Faucet Donation Address:** `' + config.faucet.faucet_wallet_pub + '`' });
          return;
        }

        function dripAmount(min, max) {
          const minAmt = toShor(min);
          const maxAmt = toShor(max);
          const randomNumber = Math.floor(
            // generate a random number from a range set in the config file passed as min and max.
            Math.random() * (maxAmt - minAmt) + minAmt,
          );
          const num = toQuanta(randomNumber);
          return num;
        }

        function chooseMessage() {
          const messageCount = faucetResponse.length;
          const randomNumber = Math.floor(
            // generate a random number from a range set in the config file passed as min and max.
            Math.random() * (messageCount - 0) + 0,
          );
          const messageArray = faucetResponse;
          const finalMessage = messageArray[randomNumber];
          // console.log(JSON.stringify(finalMessage));
          return finalMessage;
        }

        async function checkUser(user) {
          return new Promise(resolve => {
            const check_info = { service: 'discord', service_id: user };
            const checkPromise = GetAllUserInfo(check_info);
            // fail from the start
            let checkUserPassed = false;
            checkPromise.then(function(results) {
              userInfoArray.push(results);
              const user_found = results[0].user_found;
              const opt_out = results[0].opt_out;
              const agree = results[0].user_agree;
              // check if user found
              if (user_found) {
                checkUserPassed = true;
                userInfoArray.push({ checkUserPassed: checkUserPassed });

              }
              else{
                // user not found
                userInfoArray.push({ checkUserPassed: false, checkUserPassedError: 'not_found' });
                errorMessage({ error: 'User Not Found...', description: 'Please enter `' + config.discord.prefix + 'add` to sign-up then `' + config.discord.prefix + 'agree` to start using the bot' });
                return;
              }
              // check if agreed
              if (agree) {
                // set checkUserPassed to true and return
                let checkUserPassed = true;
                userInfoArray.push({ checkUserPassed: checkUserPassed });
              }
              else {
                // not agreed to terms
                userInfoArray.push({ checkUserPassed: false, checkUserPassedError: 'not_agreed' });
                errorMessage({ error: 'User Has Not Agreed to Terms...', description: 'You must agree to the terms, enter `' + config.discord.prefix + 'terms` to read the terms and conditions, `' + config.discord.prefix + 'agree` to start using the bot.' });
                return;
              }
              // check if opt out
              if (opt_out) {
              // user has opted out
                userInfoArray.push({ checkUserPassed: false, checkUserPassedError: 'opted_out' });
                errorMessage({ error: 'User Has Opted Out...', description: 'Please `' + config.discord.prefix + 'opt-in` to use the bot.' });
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
            checkFaucetPromise.then(function(results) {
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

            console.log(JSON.stringify(faucetCheck));

            if (faucetCheck[0].drip_found === true) {
              const updated = faucetCheck[0].faucet_result[0].updated_at;
              const now = new Date();
              const itsBeen = Date.parse(now) - Date.parse(updated);
              console.log(itsBeen);
              const timetill = (config.faucet.payout_interval - itsBeen) + Date.parse(now);
              errorMessage({ error: 'Already Recieved Faucet Payout...', description: 'Please come back after ' + new Date(timetill) + '\n*Faucet will only pay out once every  **' + config.faucet.payout_interval / 60 + '*** hours.' });
              return;
            }
            else if (faucetCheck[0].drip_found === false) {
              // no drip found. Do things here.
              // insert into faucet_payments to request a payment
              const user_id = userInfoArray[0][0].user_id;
              const Drip = dripAmount(config.faucet.min_payout, config.faucet.max_payout);
              const dripInfo = { user_id: user_id, service: 'discord', drip_amt: Drip };
              drip(dripInfo).then(function() {
              });
              const userMessage = chooseMessage();
              // console.log(JSON.stringify(userMessage));
              ReplyMessage(':droplet: ' + Drip + ' Quanta sent from the faucet! :droplet:\n*Funds take up to 5 min to deposit.*');
              dripMessage(userMessage);
            }
          });
        });
      });
  },
};
