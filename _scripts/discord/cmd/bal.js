module.exports = {
  name: 'balance',
  description: 'Get a QRL wallet balance',
  args: false,
  aliases: ['?$', 'Bal', 'BAL', 'Balance', 'bal', 'funds'],
  guildOnly: false,
  cooldown: 0,
  usage: ' or \n+balance {QRL_ADDRESS}',
  execute(message, args) {
    const Discord = require('discord.js');
    const walletTools = require('../../qrl/walletTools');
    const dbHelper = require('../../db/dbHelper');
    const cgTools = require('../../coinGecko/cgTools');
    const config = require('../../../_config/config.json');
    const emojiCharacters = require('../../emojiCharacters');
    const Balance = walletTools.GetBalance;
    const username = `${message.author}`;
    const userName = username.slice(1, -1);

    // ReplyMessage(' Check your DM\'s');
    function ReplyMessage(content) {
      message.channel.startTyping();
      setTimeout(function() {
        message.channel.stopTyping(true);
        message.reply(content)
          // delete the message after a bit
          .then(msg => {
            setTimeout(() => msg.delete(), 10000)
          })
          .catch( );
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
      }, 500);
    }

    // test the address to the regex pattern
    function isQRLAddress(addy) {
      let test = false;
      if(/^(Q|q)[0-9a-fA-f]{78}$/.test(addy)) {
        test = true;
      }
      return test;
    }

    function deleteMessage() {
      // Delete the previous message
      if(message.guild != null) {
        message.delete();
      }
    }
  
    function thousandths(number) {
      const splitNumber = number.toString().split('.');
      splitNumber[0] = splitNumber[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return splitNumber.join('.');
    }
  
    function toQuanta(number) {
      const shor = 1000000000;
      return number / shor;
    }
  
    function getCgData() {
      return new Promise(resolve => {
        const cgdata = cgTools.cgData();
        resolve(cgdata);
      });
    }

    // check for args and if found give that wallet balance
    if (args.length) {
      // given a user not an address we just fail.
      if (message.mentions.users.size > 0) {
        errorMessage({ error: 'Invalid entry given...', description: 'Enter an address to query, or simply `' + config.discord.prefix + 'bal` to get your balance.' });
        deleteMessage();
        return;
      }
      // wallet address given, look up the given address
      const givenAddress = args[0];
      const checkAddress = isQRLAddress(givenAddress);
      if(!checkAddress) {
        errorMessage({ error: 'Invalid entry given...', description: 'Enter an address to query, or simply `' + config.discord.prefix + 'bal` to get your balance.' });
        deleteMessage();
        return;
      }
      else {
        const BalancePromise = Balance(givenAddress);
        // assign this to a promise and get the function into a result
        BalancePromise.then(function(balanceResult) {
          getCgData().then(function(cg) {
            const data = JSON.parse(cg);
            const usdValue = data.market_data.current_price.usd;
            const btcValue = data.market_data.current_price.btc;
            const results = balanceResult.balance;
            const res = toQuanta(results).toFixed(9);
            const userBTCValue = (res * btcValue).toFixed(9);
            const userUSDValue = (res * usdValue).toFixed(3);
            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .setTitle('Address Balance - ' + res + ' QRL')
              .setDescription('Details from the balance query. \n*Transactions may take a some time to post. Please be patient*')
              .addField('QRL Address Balance:', `\`${res}\``, false)
              .addField('QRL/USD Balance:', '`\u0024' + thousandths(userUSDValue) + '`', true)
              .addField('QRL/BTC Balance:', '`\u0024' + thousandths(userBTCValue) + '`', true)
              .addField('QRL Address:', '[' + givenAddress + '](' + config.bot_details.explorer_url + '/a/' + givenAddress + ')')
              .setFooter('  .: Tipbot provided by The QRL Contributors :.');
            message.author.send({ embed })
              .then(() => {
                if (message.channel.type === 'dm') return;
                deleteMessage();
                message.channel.stopTyping(true);
                ReplyMessage('\n:moneybag: Balance is in your DM :moneybag:');
              })
              .catch(e => {
                // console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' + e.message });
                // ReplyMessage('it seems like I can\'t DM you! Do you have DMs disabled?');
                return;
              });
            message.channel.stopTyping(true);
          });
        });
      }
    }
    else {
      // check for user in database
      const checkUser = dbHelper.GetAllUserInfo;
      const checkUserPromise = checkUser({ service: 'discord', service_id: userName });
      checkUserPromise.then(function(result) {
        const output = JSON.parse(JSON.stringify(result));
        const found = output[0].user_found;
        if (!found) {
          errorMessage({ error: 'User Not Found...', description: 'You\'re not found in the System. Try `' + config.discord.prefix + 'add` or `' + config.discord.prefix + 'help`' });
          return;
        }
        const opt_out = output[0].opt_out;
        if (opt_out) {
          message.channel.stopTyping(true);
          errorMessage({ error: 'User Opted Out...', description: 'You\'ve previously opted out of the tipbot. Please send `' + config.discord.prefix + 'opt-in` to opt back in!' });
          return;
        }
        const user_agree = result[0].user_agree;
        if (!user_agree) {
          message.channel.stopTyping(true);
          errorMessage({ error: 'User Has Not Agreed...', description: 'You must agree to the tipbot terms, type `' + config.discord.prefix + 'terms` to read them and then `' + config.discord.prefix + 'agree`' });
          return;
        }
        const UserAddress = result[0].wallet_pub;
        // assign this to a promise and get the function into a result
        const res = toQuanta(output[0].wallet_bal).toFixed(9);
        const pending = toQuanta(output[0].pending).toFixed(9);
        getCgData().then(function(cg) {
          const data = JSON.parse(cg);
          const usdValue = data.market_data.current_price.usd;
          const btcValue = data.market_data.current_price.btc;
          const userBTCValue = (res * btcValue).toFixed(9);
          const userUSDValue = (res * usdValue).toFixed(3);
          if (pending > 0) {
            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .setTitle('Tipbot Balance - ' + res + ' QRL')
              .setDescription('Details from the balance query. \n*Transactions may take a some time to post. Please be patient*')
              .addField('Balance:', `\`${res} QRL\``, false)
              .addField('QRL/USD Balance:', '`\u0024' + thousandths(userUSDValue) + '`', true)
              .addField('QRL/BTC Balance:', '`\u0024' + thousandths(userBTCValue) + '`', true)
              .addField('Approx Pending TXn\'s:', '`' + pending + ' QRL`', true)
              .addField('QRL Address:', '[' + UserAddress + '](' + config.bot_details.explorer_url + '/a/' + UserAddress + ')')
              .setFooter('  .: Tipbot provided by The QRL Contributors :.');
            message.author.send({ embed })
              .then(() => {
                if (message.channel.type === 'dm') return;
                message.channel.stopTyping(true);
              })
              .catch(e => {
                errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' + e.message });
              });
          }
          else {
            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .setTitle('Tipbot Balance - ' + res + ' QRL')
              .setDescription('Details from the balance query. \n*Transactions may take a some time to post. Please be patient*')
              .addField('Balance:', `\`${res} QRL\``, false)
              .addField('QRL/USD Balance:', '`\u0024' + thousandths(userUSDValue) + '`', true)
              .addField('QRL/BTC Balance:', '`\u0024' + thousandths(userBTCValue) + '`', true)
              .addField('QRL Address:', '[' + UserAddress + '](' + config.bot_details.explorer_url + '/a/' + UserAddress + ')')
              .setFooter('  .: Tipbot provided by The QRL Contributors :.');
            message.author.send({ embed })
              .then(() => {
                if (message.channel.type === 'dm') return;
                message.channel.stopTyping(true);
              })

              .catch(e => {
                errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' + e.message });
              });
          }
          ReplyMessage('\n:moneybag: Balance is in your DM :moneybag:');
          message.react(emojiCharacters.q)
            .then(() => message.react(emojiCharacters.r))
            .then(() => message.react(emojiCharacters.l))
            .catch(() => console.error('One of the emojis failed to react.'));
        });
      });
    }
  },
};