module.exports = {
  name: 'terms',
  description: 'Prints the terms and rules for using the tipbot',
  args: false,
  aliases: ['term', 'legal', 'conditions', 'rules', 'Terms', 'Term'],
  guildOnly: false,
  usage: '',
  cooldown: 0,
  execute(message) {
    const Discord = require('discord.js');

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
        // console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
        errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });
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
                    `).then(function() {
          ReplyMessage(' Check your DM\'s');
        }).catch((e) => {
          // console.log('Failed!', e);
          // Do something else instead...
        });
      })
      .catch(error => {
        // console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
        // ReplyMessage('It seems like I can\'t DM you! Enable DM and try again...');
        errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });

      // deleteMessage();
      });
    if(message.guild != null) {
      message.delete();
    }
  },


};