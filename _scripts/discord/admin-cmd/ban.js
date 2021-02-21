module.exports = {
  name: 'ban',
  description: 'Bans a user from using the tipbot and sends their private keys to them in a DM',
  args: false,
  aliases: ['kick' ],
  guildOnly: false,
  usage: '@fr1t2 \nCommand will send a DM with TipBot private keys to the user mentioned. This will remove any access to the tipbot and should only be used if user is also banned from the server.',

  execute(message) {
  /*
    Take a user name and return the users private keys in DM to the user.
  */
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    const wallet = require('../../qrl/walletTools');
    const uuid = `${message.author}`;
    const UUID = uuid.slice(1, -1);
    const secretKey = wallet.GetSecretKeys;

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

    // Get user info.
    async function getUserInfo(usrInfo) {
      return new Promise(resolve => {
        const data = dbHelper.CheckUser(usrInfo);
        resolve(data);
      });
    }
    // Get all user info.
    async function getAllUserInfo(usrInfo) {
      return new Promise(resolve => {
        const data = dbHelper.GetAllUserInfo(usrInfo);
        resolve(data);
      });
    }
    // send the ban to the users_info database
    async function banDBWrite(userArgs) {
      return new Promise(resolve => {
        // {user_id: user_id} - id from database not discord suer uuid
        // {user_id: 1}
        // console.log('transactionsDbWrite args:' + JSON.stringify(txArgs));
        const user = userArgs;
        const banInfo = { user_id: user };
        const banEntry = dbHelper.addBan(banInfo);
        resolve(banEntry);
      });
    }

    // main function
    async function main() {
      // get the users info
      const user = message.mentions.users.first();
      if (user === undefined) {
        errorMessage({ error: 'No user mentioned', description: 'You must mention one user...' });
        return;
      }
      const service_id = '@' + user.id;
      // check for self mentioned and fail
      if (UUID === service_id) {
        // user is banning them self
        errorMessage({ error: 'Mentioned Self...', description: 'You cannot ban yourself. try again' });
        return;
      }

      const userInfo = await getUserInfo({ service: 'discord', user_id: service_id });
      // if the user is found then continue.
      if (userInfo.user_found) {
        if (userInfo.banned) {
          // user is not banned fail and return the user data
          errorMessage({ error: 'User Already Banned...', description: 'User is already banned. Try `+check user <' + service_id + '>`' });
          return;
        }
        const allUserInfo = await getAllUserInfo({ service: 'discord', service_id: service_id });



        const wallet_bal = Number(allUserInfo[0].wallet_bal);
        // check wallet balance and if flat, ban and quit
        if (wallet_bal === 0) {
          // write to the database that the user is banned
          // eslint-disable-next-line
          const banUser = await banDBWrite(allUserInfo[0].user_id);
          ReplyMessage('user banned. They have no funds in tipbot.');
          return;
        }
        const walletPub = allUserInfo[0].wallet_pub;
        const userSecretKeyPromise = secretKey(walletPub);
        // write to the database that the user is banned
        // eslint-disable-next-line
        const banUser = await banDBWrite(allUserInfo[0].user_id);
        userSecretKeyPromise.then(function(userSecrets) {
          const keys = JSON.parse(userSecrets);
          const embed = new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle('**TipBot Secret Keys**')
            .setDescription('You have been banned from the server. Because of this you cannot use this tipbot service.\n\n \
                Below are the private keys to the tipbot account you held, with a positive balance of `' + toQuanta(wallet_bal) + ' QRL`.\n \
                Please use the [QRL Web Wallet](' + config.wallet.wallet_url + ') to withdraw these funds into an address you own. \
                After **ONE Week** from ban the funds may be re-claimed by the service and forfeited by the user.')
            .addField('**__There is NO support offered Banned users__**:exclamation:', ' This bot will no longer reply to messages from you.')
            .addField('**__ANY FUNDS LEFT IN THE ADDRESS ARE SUBJECT TO LOSS__**:exclamation:', 'After **ONE Week** from ban the funds may be re-claimed by the service and forfeited by the user.')
            .addField('**__This is the last message you will receive from the tipbot__**:exclamation:', ' Goodbye.')
            .addField('Public Address: ', '`' + walletPub + '`')
            .addField('Hexseed: ', '||' + keys.hexseed + '||')
            .addField('Mnemonic: ', '||' + keys.mnemonic + '||')
            .addField('Use the QRL Web Wallet to withdraw funds from your Tipbot account with the secret details above', '__**[QRL Web Wallet Link](' + config.wallet.wallet_url + '/open)**__')
            .setFooter('.: Tipbot provided by The QRL Contributors :.');
          user.send({ embed })
            .then(() => {
              if (message.channel.type === 'dm') return;
              ReplyMessage('User has been banned.');
            })
            .catch(e => {
              errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' + e.message});
            });
          return;
        });
      }
      else {
        // fail on error
        errorMessage({ error: 'User Not Found...', description: 'The banned user is not in the tipbot, no keys to send!' });
        const returnArray = [{ check: false }];
        return returnArray;
      }

    }
    main();

  },
};