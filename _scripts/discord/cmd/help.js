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
      messagedata.push('Here are all of my commands.\n*If you need more help try:* `' + config.discord.prefix + 'help {COMMAND}`\n```diff\n');
      messagedata.push(commands.map(command => config.discord.prefix + command.name + ' - ' + command.description).join('\n'));
      messagedata.push('```');
      // add the adminCommands as well to the help file for mods and admin
      if (message.channel.type !== 'dm') {
        if(message.member.roles.cache.some(r=>[config.discord.admin_role, config.discord.mod_role].includes(r.name))) {
          // has one of the roles
          const { adminCommands } = message.client;
          messagedata.push('**Special User Commands -**\n```diff\n');
          messagedata.push(adminCommands.map(command => config.discord.prefix + command.name + ' - ' + command.description).join('\n'));
          messagedata.push('```');
        }
      }
      ReplyMessage(messagedata);
      return;
    }
    const name = args[0].toLowerCase();
    if (message.channel.type !== 'dm') {
      if (message.member.roles.cache.some(r=>[config.discord.admin_role, config.discord.mod_role].includes(r.name))) {
        // has a role, admin stuff here
        const { adminCommands } = message.client;
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name)) || adminCommands.get(name) || adminCommands.find(c => c.aliases && c.aliases.includes(name));
        if (!command) {
          errorMessage({ error: 'Not a valid command...', description: 'You have entered an invalid command for help' });
          return;
        }
        data.push(`\n**Name:** ${command.name}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${config.discord.prefix}${command.name} ${command.usage}`);
      }
      else {
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
        if (!command) {
          errorMessage({ error: 'Not a valid command...', description: 'You have entered an invalid command for help' });
          return;
        }
        data.push(`\n**Name:** ${command.name}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${config.discord.prefix}${command.name} ${command.usage}`);
      }
    }
    else {
      const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
      if (!command) {
        errorMessage({ error: 'Not a valid command...', description: 'You have entered an invalid command for help' });
        return;
      }
      data.push(`\n**Name:** ${command.name}`);
      if (command.description) data.push(`**Description:** ${command.description}`);
      if (command.usage) data.push(`**Usage:** ${config.discord.prefix}${command.name} ${command.usage}`);
    }
    ReplyMessage(data, { split: true });
  },
};