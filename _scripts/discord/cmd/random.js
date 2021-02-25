module.exports = {
  name: 'random',
  description: 'Get random data from drand',
  args: false,
  aliases: ['rand', 'Random'],
  guildOnly: false,
  usage: '',
  cooldown: 0,

  execute(message, args) {
  // random data retriever 

    const Discord = require('discord.js');
    const Random = require('../../drand/drand.js');
    // const config = require('../../../_config/config.json');
    // const wallet = require('../../qrl/walletTools');
    // const explorer = require('../../qrl/explorerTools');
    // const cgTools = require('../../coinGecko/cgTools');

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

    function random() {
      return new Promise(resolve => {
        const randomData = Random.random();
        resolve(randomData);
      });
    }

    async function main() {
      // main function 
      let rand = false;
      rand = await random();

      if (!rand) {
        errorMessage({ error: 'Something is wrong', description: 'no random data found' });
      }
      else {
        // random data found
        ReplyMessage(`Random Data ${rand.randomness}`);
      }
    }

    main();
  }
};