module.exports = {
  name: 'agree',
  description: 'Agree to the terms of the bot to use',
  args: false,
  guildOnly: false,
  cooldown: 0,
  aliases: ['Agree', 'AGREE', 'ok', 'confirm', 'consent'],
  usage: '',
  // execute(message, args) {
  execute(message) {
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    // const config = require('../../../_config/config.json');
    const username = `${message.author}`;
    const userID = username.slice(1, -1);



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

    // default reply message format
    // successReplyMessage({ title: 'You\ve Agreed!!', description: , term_1: , term_2: , term_3: , term_4: , footer: 'You can now use the Bot!' });
    function successReplyMessage(content, footer = '  .: Tipbot provided by The QRL Contributors :.') {
      setTimeout(function() {
        const embed = new Discord.MessageEmbed()
          .setColor(0x008A11)
          .setTitle(':white_check_mark: ' + content.title)
          .setDescription(content.description)
          .addField(content.term_1, content.term_1_description)
          .addField(content.term_2, content.term_2_description)
          .addField(content.term_3, content.term_3_description)
          .addField(content.term_4, content.term_4_description)
          .addField(content.term_5, content.term_5_description)
          .setFooter(content.footer || footer);
        message.author.send({ embed })
          .then(() => {
            if (message.channel.type === 'dm') return;
            message.channel.stopTyping(true);
            message.reply('Thanks for agreeing to the terms. :thumbsup:\nTry `+help` for a list of my commands.');
          })
          .catch(error => {
            errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });
            // console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
            // message.channel.stopTyping(true);
            // message.reply('It seems like I can\'t DM you! Do you have DMs disabled?');
          });
        message.channel.stopTyping(true);
      }, 1000);
    }

    // Get user info. Function expects { service: service, service_id: service_id } as usrInfo
    async function getUserInfo(usrInfo) {
      return new Promise(resolve => {
        // console.log('getUserInfo(usrInfo) ' + JSON.stringify(usrInfo));
        const data = dbHelper.GetAllUserInfo(usrInfo);
        resolve(data);
      });
    }

    // add user to agree db. Function expects { service: , user_id: } as usrAgree
    async function agreeDBWrite(botUserId) {
      return new Promise(resolve => {
      // console.log('agreeDBWrite(usrAgree) ' + JSON.stringify(botUserId));

        const addToAgreeDBinfo = { service: 'discord', user_id: botUserId };
        // console.log('tipDBWrite addToTipsDBinfo: ' + JSON.stringify(addToTipsDBinfo));
        const addToAgreeDBinfoWrite = dbHelper.agree(addToAgreeDBinfo);
        resolve(addToAgreeDBinfoWrite);
      });
    }

    // check if user exists
    async function main() {
      const userInfo = await getUserInfo({ service: 'discord', service_id: userID });
      // console.log('userInfo: ' + JSON.stringify(userInfo));
      return userInfo;
    }
    // Add agree flag to users_agree database
    async function userAgreeAdd(info) {
      const agreeAdd = await agreeDBWrite(info);
      return agreeAdd;
    }

    // check for user then if found check for already agreed, if not then set
    main().then(function(infoReturned) {

      // console.log('infoReturned' + JSON.stringify(infoReturned));
      const userFound = infoReturned[0].user_found;
      // console.log('userFound: ' + userFound);
      if (userFound) {
        const userAgreeStatus = infoReturned[0].user_agree;
        // console.log('userAgreeStatus: ' + userAgreeStatus);
        if (userAgreeStatus) {
          // console.log('User already agreed');
          errorMessage({ error: 'You\'ve already agreed...', description: 'No need to agree again. Enter `+help` for bot instructions' });
        }
        else {
          // console.log('Not yet agreed, add to DB and reply');
          
          // check for dm and fail if not in DM
          // console.log('message.channel.type: ' + message.channel.type)
          if (message.channel.type !== 'dm') {
            errorMessage({ error: 'Please see your DM to agree...', description: 'You must read my terms to use the bot, please see the private message.' });      
            return;
          }
          const botUserId = infoReturned[0].user_id;
          // console.log('botUserId: ' + botUserId);
          userAgreeAdd(botUserId).then(function() {
          // console.log('agreeReturn: ' + JSON.stringify(agreeReturn));
            successReplyMessage({ title: 'You\'ve Agreed!!', description: '**You can now use the tipbot**\nHere are the terms you agreed to:', term_1: 'Use at your own risk', term_1_description: 'You will not hold the tipbot accountable', term_2: 'You won\'t misuse the bot', term_2_description: 'be nice to the bot and others', term_3: 'You agree to share information with tipbot', term_3_description: 'usernames, tx details, wallet address etc.', term_4: 'You will not store QRL on the tipbot.', term_4_description: 'Transfer all excess funds to a wallet only you own!', term_5: 'To read the full terms, please enter:', term_5_description: 'Enter +terms for full agreement.'});
          });
        }
      }
      else {
        // console.log('userNotFound');
        errorMessage({ error: 'No Account Found!', description: 'You must signup to use the tipbot. enter `+help` for bot instructions' });
      }
    });
  },
};