module.exports = {
  name: 'check',
  description: 'Check various admin functions',
  args: false,
  guildOnly: false,
  aliases: ['check', 'ch'],
  cooldown: 0,
  usage: ' user @fr1t2\n__**user** ***usr***__ :\t`Check for user`\n__**id**__ :\t`get user_id`\n__**optout** ***oo***__ :\t`Check if user has set opt_out`\n__**signup** ***su***__ :\t`check if user is signed up`\n__**walletPub** ***wp***__ :\t`Get wallet address`\n__**walletBal** ***wb***__\t`Get users wallet balance`',

  // execute(message, args) {
  execute(message, args) {
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    const checkUser = dbHelper.CheckUser;
    const config = require('../../../_config/config.json');
    const walletTools = require('../../qrl/walletTools');
    // const getUserId = dbHelper.GetUserID;
    const checkOptOut = dbHelper.CheckUserOptOut;
    const checkSignedup = dbHelper.CheckUserSignup;
    const checkUserWalletPub = dbHelper.GetUserWalletPub;
    const checkUserWalletBal = dbHelper.GetUserWalletBal;
    const checkUserWalletQr = dbHelper.GetUserWalletQR;
    const getNodeInfo = walletTools.GetNodeInfo;
    const username = `${message.author}`;
    const userID = username.slice(1, -1);
    const userToCheck = { service: 'discord', user_id: userID };
    const CheckUserPromise = checkUser(userToCheck);


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
    // checkForUser function returns results and outputs user info to discord
    async function checkForUser(userargs) {
      // console.log('hmmm userargs ' + userargs);
      if (userargs != undefined) {
        const uuid = userargs;
        const UUID = uuid.slice(1, -1);
        const utCheck = { service: 'discord', user_id: UUID };
        const CUPromise = checkUser(utCheck);

        // console.log('check_usr args: ' + JSON.stringify(utCheck));
        CUPromise.then(function(result) {
          const found = result.user_found;
          // console.log('found: ' + found);
          if (found === 'true') {
            // GetAllUserInfo

            const getUserData = dbHelper.CheckUser(utCheck);
            getUserData.then(function(user_data) {
              // console.log('user_data: ' + JSON.stringify(user_data));
              const id = result.user_id;
              let banned = result.banned;
              let banned_date = result.banned_date;
              let opt_out = result.opt_out;
              let opt_out_date = result.optout_date;
              if (!opt_out) {
                opt_out = false;
                opt_out_date = false;
              }
              else {
                opt_out = true;
              }

              if (!banned) {
                banned = false;
                if (banned_date === null) {
                  banned_date = false;
                }
                // get all user info now that we know user is not banned
                const getAllUserData = dbHelper.GetAllUserInfo({ service: 'discord', service_id: UUID });
                getAllUserData.then(function(all_user_data) {
                  // console.log('allUserData: ' + JSON.stringify(all_user_data));

                  const embed = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('**TipBot ADMIN User Info**')
                    .setDescription('This information is provided as a privilege to moderators and administrators. Please do not abuse it.\
                      \n**User Information for:**\n<@' + message.mentions.users.first() + '> User_ID: ' + message.mentions.users.first())
                    .addField('User_found: ', '`' + found + '`', true)
                    .addField('User_id: ', '`' + id + '`', true)
                    .addField('wallet_bal: ', '`' + toQuanta(all_user_data[0].wallet_bal) + '`', true)
                    .addField('wallet_pub: ', '[`' + all_user_data[0].wallet_pub + '`](' + config.bot_details.explorer_url + '/a/' + all_user_data[0].wallet_pub + ')', false)
                    .addField('user_agree: ', '`' + all_user_data[0].user_agree + '`', true)
                    .addField('pending balance: ', '`' + toQuanta(all_user_data[0].pending) + '`', true)
                    .addField('signup_date: ', '`' + result.signup_date + '`', false)
                    .addField('banned: ', '`' + banned + '`', true)
                    .addField('last banned_date: ', '`' + banned_date + '`', true)
                    .addField('signed_up_from: ', '`' + result.signed_up_from + '`', false)
                    .addField('opt_out: ', '`' + opt_out + '`', true)
                    .addField('optout_date: ', '`' + opt_out_date + '`', true)
                    .addField('User last updated_at: ', '`' + result.updated_at + '`', false);
                  message.author.send({ embed })
                    .catch(console.error);
                  message.react('🇶')
                    .then(() => message.react('🇷'))
                    .then(() => message.react('🇱'))
                    .catch(() => console.error('One of the emojis failed to react.'));
                });
              }
              else {
                banned = true;
                const embed = new Discord.MessageEmbed()
                  .setColor('RED')
                  .setTitle('**TipBot ADMIN User Info**')
                  .setDescription('This information is provided as a privilege to moderators and administrators. Please do not abuse it.\
                  \n\n```css\nUSER IS BANNED```\n\n \
                  **User Information for:**\n<@' + message.mentions.users.first() + '> User_ID: ' + message.mentions.users.first())
                  .addField('User_found: ', '`' + found + '`', true)
                  .addField('User_id: ', '`' + id + '`', true)
                  .addField('signup_date: ', '`' + result.signup_date + '`', false)
                  .addField('banned: ', '`' + banned + '`', true)
                  .addField('banned_date: ', '`' + banned_date + '`', true)
                  .addField('signed_up_from: ', '`' + result.signed_up_from + '`', false)
                  .addField('opt_out: ', '`' + opt_out + '`', true)
                  .addField('optout_date: ', '`' + opt_out_date + '`', true)
                  .addField('User last updated_at: ', '`' + result.updated_at + '`', false);
                message.author.send({ embed })
                  .catch(console.error);
                message.react('🇶')
                  .then(() => message.react('🇷'))
                  .then(() => message.react('🇱'))
                  .catch(() => console.error('One of the emojis failed to react.'));

              }

              // console.log('id: ' + id);
              // user found, return the results
              // console.log('result\t' + id + ' has been found ' + found);
              ReplyMessage('user found, details in your DM.');


              const returnData = { found: 'true', user_id: id };
              const RETURNDATA = JSON.parse(JSON.stringify(returnData));
              return RETURNDATA;
            });
          }
          else {
            // user not found
            const returnData = { found: 'false' };
            errorMessage({ error: 'User Not Found...', description: 'The user has not been found in the tipbot.' });
            return JSON.parse(JSON.stringify(returnData));
          }
        });
        return;
      }
    }

    async function getUserID() {
      CheckUserPromise.then(function(check) {
        const found = check.user_found;
        // console.log('found = ' + found)
        if (found !== 'true') {
          // user not found
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .setDescription('Looks like you are not found.\n`+add` to add and account `+help` for the rest.')
            .addField('User Found:\t', `\`${found}\``);
          message.channel.send({ embed })
            .then(guid => guid.channel.stopTyping())
            .catch(console.error);
          message.channel.stopTyping(true);
          return console.log('error, user not found');
        }
        else {
          const id = check.user_id;
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .addField('User id:\t', `\`${id}\``);
          message.author.send({ embed })
            .then(guid1 => guid1.channel.stopTyping())
            .catch(console.error);
          message.react('🇶')
            .then(() => message.react('🇷'))
            .then(() => message.react('🇱'))
            .catch(() => console.error('One of the emojis failed to react.'));
          message.channel.stopTyping(true);
          // return JSON.parse(JSON.stringify(result));
        }
      });
    }
    async function checkUserOptOut() {
      CheckUserPromise.then(function(check) {
        const found = check.user_found;
        // console.log('found = ' + found)
        if (found !== 'true') {
          // user not found
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .setDescription('Looks like you are not found.\n`+add` to add and account `+help` for the rest.')
            .addField('User Found:\t', `\`${found}\``);
          message.author.send({ embed })
            .then(cuoo => cuoo.channel.stopTyping())
            .catch(console.error);
          message.react('🇶')
            .then(() => message.react('🇷'))
            .then(() => message.react('🇱'))
            .catch(() => console.error('One of the emojis failed to react.'));
          message.channel.stopTyping(true);
          return console.log('error, user not found');
        }
        const id = check.user_id;
        // console.log('id = ' + id)
        const optoutCheck = { service: 'discord', user_id: id };
        const CheckUserOptOutPromise = checkOptOut(optoutCheck);
        CheckUserOptOutPromise.then(function(result) {
          const opt_out = result.opt_out;
          if (opt_out == 'true') {
            // user opted out
            const optout_date = result.optout_date;
            // console.log('opt_out = ' + opt_out + ' On ' + optout_date);
            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .addField('User Opt-Out:\t', `\`${opt_out}\``)
              .addField('Opt-Out Date:\t', `\`${optout_date}\``);
            message.author.send({ embed })
              .then(cuoo1 => cuoo1.channel.stopTyping())
              .catch(console.error);
            message.react('🇶')
              .then(() => message.react('🇷'))
              .then(() => message.react('🇱'))
              .catch(() => console.error('One of the emojis failed to react.'));
            return JSON.parse(JSON.stringify(result));
          }
          else {
            // user not opted out
            // console.log('opt_out = ' + opt_out);
            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .addField('User Opt-Out:\t', `\`${opt_out}\``);
            message.channel.send({ embed })
              .then(cuoo2 => cuoo2.channel.stopTyping())
              .catch(console.error);
            return JSON.parse(JSON.stringify(result));
          }
        });
      });
    }


    // CheckUserSignup
    async function checkUserSignup() {
      CheckUserPromise.then(function(check) {
        const found = check.user_found;
        // console.log('found = ' + found)
        if (found !== 'true') {
          // user not found
          message.reply('Your not found in the System. Try `+add` or `+help`');
          message.channel.stopTyping(true);
          return console.log('error, user not found');
        }
        const id = check.user_id;
        // console.log('id = ' + id)

        const signedupCheck = { user_id: id };
        const CheckUserSignedUpPromise = checkSignedup(signedupCheck);
        CheckUserSignedUpPromise.then(function(result) {
          const user_signup = result.user_signup;
          if (user_signup == 'true') {
            // user opted out
            const signup_date = result.signup_date.slice(0, -14);
            const signup_service = result.signed_up_from;
            // console.log('opt_out = ' + opt_out + ' On ' + optout_date);
            message.author.send('\nYou Signed up on:\n:calendar: `' + signup_date + '` :calendar:\nFrom service:\n`' + signup_service + '`');
            message.react('🇶')
              .then(() => message.react('🇷'))
              .then(() => message.react('🇱'))
              .catch(() => console.error('One of the emojis failed to react.'));
            message.channel.stopTyping();
            return JSON.parse(JSON.stringify(result));
          }
          else {
            // user not opted out
            // console.log('opt_out = ' + opt_out);
            message.author.send('You were automaticaly enrolled when you recieved some tips! To claim them type `+add` or `+help` form more info.');
            message.react('🇶')
              .then(() => message.react('🇷'))
              .then(() => message.react('🇱'))
              .catch(() => console.error('One of the emojis failed to react.'));
            message.channel.stopTyping();
            return JSON.parse(JSON.stringify(result));
          }
        });
      });
    }


    // GetUserWallet


    async function checkUserWalletpub() {
      CheckUserPromise.then(function(check) {
        const found = check.user_found;
        if (found !== 'true') {
          message.reply('Your not found in the System. Try `+add` or `+help`');
          message.channel.stopTyping();
          return console.log('error, user not found');
        }
        const id = check.user_id;
        const userWalletPubCheck = { user_id: id };
        const CheckUserWalletPubPromise = checkUserWalletPub(userWalletPubCheck);
        CheckUserWalletPubPromise.then(function(result) {
          const wallet_pub = result.wallet_pub;
          message.author.send('`' + wallet_pub + '`');
          message.react('🇶')
            .then(() => message.react('🇷'))
            .then(() => message.react('🇱'))
            .catch(() => console.error('One of the emojis failed to react.'));
          message.channel.stopTyping();
          return JSON.parse(JSON.stringify(result));
        });
      });
    }
    async function checkUserWalletbal() {
      CheckUserPromise.then(function(check) {
        const found = check.user_found;
        if (found !== 'true') {
          message.reply('Your not found in the System. Try `+add` or `+help`');
          message.channel.stopTyping();
          return console.log('error, user not found');
        }
        const id = check.user_id;
        const userWalletBalCheck = { user_id: id };
        const CheckUserWalletBalPromise = checkUserWalletBal;
        CheckUserWalletBalPromise(userWalletBalCheck).then(function(result) {
          const wallet_bal = result.wallet_bal;
          message.author.send('Your wallet ballance:\n`' + wallet_bal + '`');
          message.react('🇶')
            .then(() => message.react('🇷'))
            .then(() => message.react('🇱'))
            .catch(() => console.error('One of the emojis failed to react.'));
          message.channel.stopTyping();
          return JSON.parse(JSON.stringify(result));
        });
      });
    }

    async function checkUserWalletqr() {
      CheckUserPromise.then(function(check) {
        const found = check.user_found;
        if (found !== 'true') {
          message.reply('Your not found in the System. Try `+add` or `+help`');
          message.channel.stopTyping();
          return console.log('error, user not found');
        }
        const id = check.user_id;
        const userWalletQrCheck = { user_id: id };
        const CheckUserWalletQrPromise = checkUserWalletQr(userWalletQrCheck);
        CheckUserWalletQrPromise.then(function(result) {
          // console.log('results of the add and search: ' + JSON.stringify(result));
          const newBuff = Buffer.from(result.wallet_qr);
          // console.log('Buffer data is now: ' + newBuff);


          // const wallet_qr = result.wallet_qr;
          // console.log('checkUserWalletqr: ' + newBuff);


          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .setTitle('**TipBot Account Info**')
            .setDescription('Wallet QR attached.')
            .setFooter(`TipBot Donation Address: ${config.bot_details.bot_donationAddress}`)
            .attachFile(newBuff)
            .setImage('attachment://' + result.fileName)

            .addField('For all of my commands:\t', '`+help`');
          message.author.send({ embed })
            .then(() => {
              if (message.channel.type === 'dm') return;
              message.reply('\nYou\'re details are in DM. :thumbsup:');
              message.channel.stopTyping();
            })
            .catch(error => {
              console.error(`Could not send DM to ${message.author.tag}.\n`, error);
              message.reply('Issues with the command! Do you have DMs disabled?');
            });
          // message.author.send('Your wallet QR:\n`' + wallet_qr + '`');
          message.react('🇶')
            .then(() => message.react('🇷'))
            .then(() => message.react('🇱'))
            .catch(() => console.error('One of the emojis failed to react.'));
          message.channel.stopTyping();
          return JSON.parse(JSON.stringify(result));
        });
      });
    }
    //
    // get args and do things
    //


    if (args != undefined) {
      // console.log('args: ' + args);
      if (args[0] === 'user' || args[0] === 'usr') {
        if (args[1] != undefined) {
          checkForUser(args[1]).then(function(result) {
            // console.log('result: ' + result);
            message.channel.stopTyping(true);
            return result;
          });
          return;
        }
        checkForUser().then(function(result) {
          // console.log('result: ' + result);
          return result;
        });
        message.channel.stopTyping();
      }



      else if (args[0] === 'id') {
        // const { user_id } = GetUserID();
        // console.log('User id');
        getUserID().then(function(result) {
          // console.log('result: ' + result);
          return result;
        });
        // console.log(foud + ', ' + user_id);
        message.channel.stopTyping();
        // return console.log('return');
      }


      else if (args[0] === 'optout' || args[0] === 'oo') {
        // const { user_id } = GetUserID();
        // console.log('Opt Out Called');
        checkUserOptOut().then(function(result) {
          // console.log('result: ' + result);
          return result;
        });
        // console.log(foud + ', ' + user_id);
        message.channel.stopTyping();
      }



      else if (args[0] === 'signup' || args[0] === 'su') {
        // console.log('Signup');
        checkUserSignup().then(function(result) {
          // console.log('result: ' + result);
          return result;
        });
      }


      else if (args[0] === 'walletPub' || args[0] === 'wp') {
        // console.log('Wallet Pub');
        checkUserWalletpub().then(function(result) {
          // console.log('result: ' + result);
          return result;
        });
      }


      else if (args[0] === 'walletBal' || args[0] === 'wb') {
        // console.log('Wallet Bal');
        checkUserWalletbal().then(function(result) {
          // console.log('result: ' + result);
          return result;
        });
      }


      else if (args[0] === 'walletQR' || args[0] === 'wq') {
        // console.log('Wallet QR');
        checkUserWalletqr().then(function(result) {
          // console.log('result: ' + result);
          return result;
        });
      }

      
      else {
        // no args given, show state and quit
        getNodeInfo().then(function(info) {
          // console.log('info: ' + info);
          const parsedInfo = JSON.parse(info);
          // console.log(parsedInfo.version + ', ' + parsedInfo.num_connections + ', ' + parsedInfo.num_known_peers + ', ' + parsedInfo.uptime + ', ' + parsedInfo.block_height + ', ' + parsedInfo.block_last_hash + ', ' + parsedInfo.network_id);
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .setTitle('Tipbot Node State')
            .setDescription('Details from the QRL Node running the tipbot')
            .addField('Version', '```yaml\n' + parsedInfo.version + '```', false)
            .addField('Node Uptime', '```yaml\n' + parsedInfo.uptime + '```', true)
            .addField('Block Height', '```yaml\n' + parsedInfo.block_height + '```', true)
            .addField('Network ID', '```yaml\n' + parsedInfo.network_id + '```', false)
            .addField('Number of Connections', '```yaml\n' + parsedInfo.num_connections + '```', true)
            .addField('Number of Known Peers', '```yaml\n' + parsedInfo.num_known_peers + '```', true)
            .addField('Block Last Hash', '```yaml\n' + parsedInfo.block_last_hash + '```', false)
            .setFooter('  .: Tipbot provided by The QRL Contributors :.');
          message.reply({ embed })
            .then(() => {
              message.channel.stopTyping(true);
            })
            .catch(error => {
              console.error('Could not send message\n', error);
              // ReplyMessage('it seems like I can\'t DM you! Do you have DMs disabled?');
            });
        });
      }
    }
  },
};