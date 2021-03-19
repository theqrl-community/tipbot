const Discord = require('discord.js');


function CheckValidChars(userName) {
// ^\u\]/.test()
  let test = false;
  // eslint-disable-next-line
  if(/[^\u0000-\u00FF][^a-zA-Z0-9]/.test(userName)) {
    test = true;
  }
  return test;
}


// use to send a reply to user with delay and stop typing
// ReplyMessage(' Check your DM\'s');
function ReplyMessage(content, message) {
  console.log(JSON.stringify(message));
  message.channel.startTyping();
  setTimeout(function() {
    message.reply(content);
    message.channel.stopTyping(true);
  }, 500);
}

// errorMessage({ error: 'Can\'t access faucet from DM!', description: 'Please try again from the main chat, this function will only work there.' });
function ErrorMessage(content, footer = '  .: Tipbot provided by The QRL Contributors :.', message) {
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


module.exports = {
  CheckValidChars : CheckValidChars,
  ReplyMessage : ReplyMessage,
  ErrorMessage : ErrorMessage
};