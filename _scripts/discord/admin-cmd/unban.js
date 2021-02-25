module.exports = {
  name: 'unban',
  description: 'Removes the ban status from a user and creates a new wallet for them.',
  args: false,
  aliases: ['unkick', 'un-ban', 'unBan', 'remove-ban', 'removeban' ],
  guildOnly: false,
  usage: '@fr1t2\nCommand will remove the ban on a user, and generate a new address to use. Use this if the user has been reinstated to the server or banned by accident',

  execute(message) {
  /*
    Take a user name and if found to be banned, remove the ban from the user and re-issue an address.
  write a new entry to the wallets db

    Once new address is setup send details to user
  */
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    const wallet = require('../../qrl/walletTools');
    const uuid = `${message.author}`;
    const UUID = uuid.slice(1, -1);

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

    // Get user info.
    async function getUserInfo(usrInfo) {
      return new Promise(resolve => {
        const data = dbHelper.CheckUser(usrInfo);
        resolve(data);
      });
    }

    // remove the ban from the users_info database
    async function removeBanDBWrite(userArgs) {
      return new Promise(resolve => {
        // {user_id: user_id} - id from database not discord suer uuid
        // {user_id: 1}
        // console.log('transactionsDbWrite args:' + JSON.stringify(txArgs));
        const user = userArgs;
        const removeBanInfo = { user_id: user };
        const removeBanEntry = dbHelper.removeBan(removeBanInfo);
        resolve(removeBanEntry);
      });
    }

    // add the new wallet address to the wallets database
    async function addUserWallet(walletArgs) {
      return new Promise(resolve => {
        // {user_id: user_id} - id from database not discord suer uuid
        // {user_id: 1}
        // console.log('transactionsDbWrite args:' + JSON.stringify(txArgs));
        const address = walletArgs.wallet_pub;
        const user_id = walletArgs.user_id;
        const addressInfo = { user_id: user_id, wallet_pub: address };
        const addAddressEntry = dbHelper.addWallet(addressInfo);
        resolve(addAddressEntry);
      });
    }

    async function addAddress() {
      return new Promise(resolve => {
        const qrlWal = wallet.CreateQRLWallet;
        const WalletPromise = qrlWal();
        WalletPromise.then(function(address) {
          const QRLaddress = JSON.parse(address);
          const wallet_pub = QRLaddress.address;
          resolve(wallet_pub);
        });
      });
    }

    async function main() {
      // get the users info
      // console.log('args sent: ' + JSON.stringify(args));
      const user = message.mentions.users.first();
      // console.log('user: ' + JSON.stringify(user));
      if (user === undefined) {
        errorMessage({ error: 'No user mentioned', description: 'You must mention one user...' });
        return false;
      }

      // const name = user.username;
      const service_id = '@' + user.id;
      // console.log('name: ' + name);
      // console.log('service_id: ' + service_id);
      // console.log('UUID: ' + UUID);

      // check for self mentioned and fail
      if (UUID === service_id) {
        // user is banning them self
        // console.log('Mentioned self in ban, fail and warn mod');
        errorMessage({ error: 'Mentioned Self...', description: 'You cannot ban yourself. try again' });
        return false;
      }

      const userInfo = await getUserInfo({ service: 'discord', user_id: service_id });
      // console.log('userInfo: ' + JSON.stringify(userInfo));
      // if the user is found then continue.
      if (userInfo.user_found) {
        if (!userInfo.banned) {
          // user is not banned fail and return the user data
          console.log('user is not banned');
          errorMessage({ error: 'User Not Banned...', description: 'User is found but not banned. Try `' + config.discord.prefix + 'check user <' + service_id + '>`'});
          return false;
        }
        // unban the user from the users_info database
        // eslint-disable-next-line
        const removeBan = await removeBanDBWrite(userInfo.user_id);
        // console.log('User ban removed: ' + JSON.stringify(removeBan));

        // generate a new address and set into database and return to user
        const addNewAddress = await addAddress();
        const walletPub = addNewAddress;
        // eslint-disable-next-line
        const addAddressToDb = await addUserWallet({ user_id: userInfo.user_id, wallet_pub: walletPub });
        // console.log('keys: ' + JSON.stringify(keys));
        const embed = new Discord.MessageEmbed()
          .setColor('RED')
          .setTitle('**TipBot Ban Removed**')
          .setDescription('The ban has been removed from the server.\n\n \
              Below is your new tipbot address.\n \
              Your old address has been retired and is no longer used. If there are any funds left in the old address they are lost and will be claimed by the faucet.')
          .addField('Public Address: ', '[`' + walletPub + '`](' + config.bot_details.explorer_url + ')')
          .setFooter('.: Tipbot provided by The QRL Contributors :.');
        user.send({ embed })
          .then(() => {
            if (message.channel.type === 'dm') return;
            ReplyMessage('User has been setup, their new address is in a DM or can be found with the user entering `' + config.discord.prefix + 'info me` or an Admin entering `' + config.discord.prefix + 'check user <' + service_id + '>`');
          })
          .catch(e => {
          // console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
            errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' + e.message});
            // ReplyMessage('it seems like I can\'t DM you! Enable DM and try again...');
          });
        const returnArray = [{ check: true }];
        return returnArray;
      }
      else {
        // fail on error
        // console.log('userFound: ' + userInfo.userFound);
        errorMessage({ error: 'User Not Found...', description: 'The user is not found in the tipbot, Have them signup `' + config.discord.prefix + 'add`' });
        const returnArray = [{ check: false }];
        return returnArray;
      }

    }
    main();

  },
};