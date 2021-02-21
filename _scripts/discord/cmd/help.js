const config = require('../../../_config/config.json');

module.exports = {
  name: 'help',
  description: 'This message...',
  aliases: ['?!', 'commands', 'Help', ''],
  usage: '[command name]',
  cooldown: 1,
  execute(message, args) {
    const Discord = require('discord.js');
    const data = [];
    const messagedata = [];
    const { commands } = message.client;
    // let admin = false;
        // let { adminCommands } = '';
    // console.log({ commands });

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

    if (!args.length) {
      // no args given give the list of commands
      messagedata.push('Here are all of my commands.\n*If you need more help try:* `+help {COMMAND}`\n```diff\n');
      messagedata.push(commands.map(command => config.discord.prefix + command.name + ' - ' + command.description).join('\n'));
      messagedata.push('```');
      // add the adminCommands as well to the help fiule for mods and admib
      if (message.channel.type !== 'dm') {
        if(message.member.roles.cache.some(r=>[config.discord.admin_role, config.discord.mod_role].includes(r.name))) {
          // has one of the roles
          // console.log('hey hey roles: ');
          const { adminCommands } = message.client;

          messagedata.push('**Special User Commands -**\n```diff\n');
          messagedata.push(adminCommands.map(command => config.discord.prefix + command.name + ' - ' + command.description).join('\n'));
          messagedata.push('```');

          // admin = true;
        // console.log({ adminCommands });
        }


      }

      ReplyMessage(messagedata);
      // message.reply(messagedata);
      return;
    }
        const name = args[0].toLowerCase();


    if (message.channel.type !== 'dm') {
      // console.log('not a DM')
      if (message.member.roles.cache.some(r=>[config.discord.admin_role, config.discord.mod_role].includes(r.name))) {
        // has a role, admin stuff here
        const { adminCommands } = message.client;
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name)) || adminCommands.get(name) || adminCommands.find(c => c.aliases && c.aliases.includes(name));
        if (!command) {
          errorMessage({ error: 'Not a valid command...', description: 'You have entered an invalid command for help' });
          // message.reply('that\'s not a valid command!');
          return;
        }

        data.push(`\n**Name:** ${command.name}`);

        // if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${config.discord.prefix}${command.name} ${command.usage}`);

      }
      else {
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
        if (!command) {
          errorMessage({ error: 'Not a valid command...', description: 'You have entered an invalid command for help' });
          // message.reply('that\'s not a valid command!');
          return;
        }
        data.push(`\n**Name:** ${command.name}`);
        // if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${config.discord.prefix}${command.name} ${command.usage}`);
      }

    }
    else {
      // console.log('a DM')
      const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
      if (!command) {
        errorMessage({ error: 'Not a valid command...', description: 'You have entered an invalid command for help' });
        // message.reply('that\'s not a valid command!');
        return;
      }
      data.push(`\n**Name:** ${command.name}`);

      // if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
      if (command.description) data.push(`**Description:** ${command.description}`);
      if (command.usage) data.push(`**Usage:** ${config.discord.prefix}${command.name} ${command.usage}`);


    }

    // data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
    ReplyMessage(data, { split: true });
    // message.channel.send(data, { split: true });
  },
};