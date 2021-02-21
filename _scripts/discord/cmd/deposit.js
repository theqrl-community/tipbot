module.exports = {
  name: 'deposit',
  description: 'Print your tipbot wallet info',
  args: false,
  aliases: ['dep', 'fund', 'addfunds', 'Deposit', 'DEP', 'fill'],
  guildOnly: false,
  usage: ' \n## Add funds to your address. Will send a DM with Address and QR code to deposit funds to',
  cooldown: 0,

  execute(message) {
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    const username = `${message.author}`;
    const userName = username.slice(1, -1);
    const user_info = { service: 'discord', user_id: userName };
    const CheckUserPromise = dbHelper.CheckUser(user_info);
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

    CheckUserPromise.then(function(check) {
      const found = check.user_found;
      if (found !== 'true') {
        errorMessage({ error: 'User Not Found...', description: 'You\'re not found in the System. Try `+add` or `+help`' });
        // message.reply('Your not found in the System. Try `+add` or `+help`');
        return console.log('error, user not found');
      }
      // check for opt_out status
      const optOutCheck = dbHelper.CheckUserOptOut({ service: 'discord', user_id: check.user_id });
      optOutCheck.then(function(optout) {
        if (optout.opt_out == 'true') {
          errorMessage({ error: 'User Opted Out...', description: 'You have opted out of the tipbot. Please send `+opt-in` to opt back in!' });
          // message.reply('You have opted out of the tipbot. Please send `+opt-in` to opt back in!');
          return;
        }
        else {
          // user is not opted out. Continue with script
          const id = check.user_id;
          const userWalletPubCheck = { user_id: id };
          const CheckUserWalletPubPromise = dbHelper.GetUserWalletPub(userWalletPubCheck);
          CheckUserWalletPubPromise.then(function(result) {
            const wallet_pub = result.wallet_pub;
            const qr = result.wallet_qr;
            if (qr !== undefined) {
              const embed = new Discord.MessageEmbed()
                .setColor(0x000000)
                .setTitle('**TipBot Deposit Info**')
                .setDescription('Deposit funds to the address shown below to begin tipping. Please don\'t make large deposits or store funds here.')
                .setFooter('  .: Tipbot provided by The QRL Contributors :.')
                // .setFooter(`TipBot Donation Address: ${config.bot_details.bot_donationAddress}`)
                .addField('Your QRL Wallet Public Address::', '[' + wallet_pub + '](' + config.bot_details.explorer_url + '/a/' + wallet_pub + ')')
                // figure out how to attach the qr image here...
                .addField('For all of my commands:\t', '`+help`');
              message.author.send({ embed })
                .then(() => {
                  message.author.send(wallet_pub);
                  if (message.channel.type === 'dm') return;
                  message.reply('Details in your DM');
                  message.channel.stopTyping(true);
                })
                .catch(error => {
                  errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });
                  // console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                  // message.reply('it seems like I can\'t DM you! Enable DM and try again...');
                });
              message.react('🇶')
                .then(() => message.react('🇷'))
                .then(() => message.react('🇱'))
                .catch(() => console.error('One of the emojis failed to react.'));
              message.channel.stopTyping(true);
              return JSON.parse(JSON.stringify(result));
            }
            // move this to add.js
            const AddWalletQRPromise = dbHelper.AddWalletQR({ user_id: id, wallet_pub: wallet_pub });
            AddWalletQRPromise.then(function(UserResults) {
              return UserResults;
            }).then(function(userReturn) {
            // we should now have user results from the QR code, add them to the message and return
              const fileName = userReturn.fileName;
              // console.log(fileName);
              const embed = new Discord.MessageEmbed()
                .setColor(0x000000)
                .setTitle('**TipBot Deposit Info**')
                .setDescription('Deposit funds to your indivigual tipbot address shown below. All tips sent to your user will also be deposited into this address.')
                .setFooter('  .: Tipbot provided by The QRL Contributors :.')
                // .setFooter(`TipBot Donation Address: ${config.bot_details.bot_donationAddress}`)
                .addField('Your QRL Wallet Public Address::', '[' + wallet_pub + '](' + config.bot_details.explorer_url + '/a/' + wallet_pub + ')')
                // figure out how to attach the qr image here...
                .addField('For all of my commands:\t', '`+help`');
              message.author.send({ embed })
                .then(() => {
                  if (message.channel.type === 'dm') return;
                  message.reply('Details in your DM');
                  message.channel.stopTyping(true);
                })
                .catch(error => {
                  errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });
                  // console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                  // message.reply('it seems like I can\'t DM you! Enable DM and try again...');
                });
              message.react('🇶')
                .then(() => message.react('🇷'))
                .then(() => message.react('🇱'))
                .catch(() => console.error('One of the emojis failed to react.'));
              message.channel.stopTyping(true);
              return JSON.parse(JSON.stringify(result));
            });
          });
        }
      });
    });
  },
};