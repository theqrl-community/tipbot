module.exports = {
  name: 'random',
  description: 'Get random data from the League of Entropy and the drand network',
  args: false,
  aliases: ['rand', 'Random', 'drand', 'DRAND', 'loe', 'LoE', 'entropy'],
  guildOnly: false,
  usage: '',
  cooldown: 0,

  execute(message) {
  // random data retriever 

    const Discord = require('discord.js');
    const Random = require('../../drand/drand.js');
    // const config = require('../../../_config/config.json');
    // const wallet = require('../../qrl/walletTools');
    // const explorer = require('../../qrl/explorerTools');
    // const cgTools = require('../../coinGecko/cgTools');
    message.channel.startTyping();

    // errorMessage({ error: 'Can\'t access faucet from DM!', description: 'Please try again from the main chat, this function will only work there.' });
    function errorMessage(content, footer = '  .: Tipbot provided by The QRL Contributors :.') {
      // message.channel.startTyping();
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

    function randomMessage(content, footer = '  .: Tipbot provided by The QRL Contributors :.') {
      // message.channel.startTyping();
      const embed = new Discord.MessageEmbed()
        // .setColor(0x000000)
        .setColor('GREEN')
        .setTitle('Randomness from the League of Entropy')
        .setURL('https://www.cloudflare.com/leagueofentropy/')
        .setDescription(content.description)
        .setThumbnail('https://github.com/drand/website/raw/master/docs/.vuepress/public/images/logo-drand-text-right-dark.png')
        .addFields(
          { name: 'Current Round:', value: '```css\n' + content.round + '```', inline: true },
          { name: 'Random Data:', value: '```yaml\n' + content.randomness + '```', inline: false },
          { name: 'Current Signature:', value: '```yaml\n' + content.signature + '```', inline: false },
          { name: 'Previous Signature:', value: '```yaml\n' + content.previous_signature + '```', inline: false },
        )
        .setFooter(footer);
      message.reply({ embed });
      message.channel.stopTyping(true);
    }
    
    function personalRandomMessage(content, footer = '  .: Tipbot provided by The QRL Contributors :.') {
      // message.channel.startTyping();
      const embed = new Discord.MessageEmbed()
        // .setColor(0x000000)
        .setColor('BLUE')
        .setTitle('League Of Entropy Information')
        .setURL('https://www.cloudflare.com/leagueofentropy/')
        .setDescription('The QRL submits entropy from the public blockchain to the [drand network](https://drand.love), helping make the random data more random. We thought this was really cool and wanted to share!')
        .setThumbnail('https://github.com/drand/website/raw/master/docs/.vuepress/public/images/logo-drand-text-right-dark.png')
        .addFields(
          { name: 'About LoE', value: 'The League of Entropy is tackling one of the more difficult problems with cryptography, *randomness*. To learn more have a look at the links below to see how this technology hopes to make the world a little more random.', inline: false },
          { name: 'Main Site:', value: '[drand.love](https://drand.love)', inline: false },
          { name: 'Introduction Blog:', value: '[League of Entropy](https://blog.cloudflare.com/league-of-entropy/)', inline: false },
          { name: 'DRAND Github:', value: '[github.com/drand/drand](https://github.com/drand/drand)', inline: false },
          { name: 'Developer Documentation:', value: '[drand Developer Docs](https://drand.love/developer/)', inline: false },
          { name: 'QRL LoE Blog:', value: '[QRL Joins Forces with the League of Entropy](https://www.theqrl.org/blog/the-qrl-foundation-joins-forces-with-the-league-of-entropy/)', inline: false },
          { name: 'LoE QRL Announcement:', value: '[drand Announcement](https://drand.love/blog/2021/01/11/qrl-joins-league-of-entropy/)', inline: false },
        )
        .setFooter(footer);
      message.author.send({ embed });
      message.channel.stopTyping(true);
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
        return;
      }
      else {
        // random data found
        // ReplyMessage('Have some random data!');
        randomMessage({ round: rand.round, description: 'Verifiable, unpredictable and unbiased random numbers as a service. Here is the latest random data generated by the [drand network *(drand.love)*](https://drand.love/)', randomness: rand.randomness, signature: rand.signature, previous_signature: rand.previous_signature });
        personalRandomMessage();
      }
      message.channel.stopTyping(true);
    }

    main();
  }
};