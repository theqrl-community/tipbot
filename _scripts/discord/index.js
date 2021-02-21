#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

'use strict';
const fs = require('fs');
const chalk = require('chalk');
const Discord = require('discord.js');
const wallet = require('../qrl/walletTools');
const explorer = require('../qrl/explorerTools');
// const cgTools = require('../coinGecko/cgTools'); /* Enable for Coin Data ticker */

// Require the config file. Create it from the example
const config = require('../../_config/config.json');
global.config = config;
const client = new Discord.Client();

// tells where to find the command config files
client.commands = new Discord.Collection();
client.adminCommands = new Discord.Collection();
// Read in the commands we listen for. FInd these in the ./cmd/ dir below this file
const commandFiles = fs.readdirSync(`${config.discord.cmd_dir}`).filter(file => file.endsWith('.js'));
const adminCommandFiles = fs.readdirSync(`${config.discord.admin_cmd_dir}`).filter(file => file.endsWith('.js'));
// for each file, assign values and command name
for (const file of commandFiles) {
  // this looks in the config file for the discord.cmd_dir setting
  const command = require(`${config.discord.cmd_dir}/${file}`);
  client.commands.set(command.name, command);
}

for (const file of adminCommandFiles) {
  // this looks in the config file for the discord.cmd_dir setting
  const adminCommand = require(`${config.discord.admin_cmd_dir}/${file}`);
  client.adminCommands.set(adminCommand.name, adminCommand);
}

// define cooldowns const
const cooldowns = new Discord.Collection();
// start the bot
const NOW = new Date();
const nownow = NOW.toDateString();
client.on('ready', () => {
  console.log(chalk`
{cyan ==========================================}
{cyan Discord TipBot Started: {green {dim ${nownow}}}}
  {blue {cyan {bold !}} Connected to {grey ${client.guilds.cache.size}} guilds }
  {blue {cyan {bold !}} Connected to {grey ${client.users.cache.size}} users } 
  {blue {cyan {bold !}} Connected to {grey ${client.channels.cache.size}} channels }
{cyan ==========================================}
    `);


  function getHeight() {
    return new Promise(resolve => {
      const height = wallet.GetHeight();
      resolve(height);
    });
  }

  /* Enable for Coin Data ticker
function getCgData() {
  return new Promise(resolve => {
    const cgdata = cgTools.cgData();
    resolve(cgdata);
  });
}
*/

  function getPoolInfo() {
    return new Promise(resolve => {
      const poolData = explorer.poolData();
      resolve(poolData);
    });
  }

  function faucetWalletBalance() {
    return new Promise(resolve => {
      const walletBal = wallet.GetBalance;
      // console.log('faucet Address: ' + config.faucet.faucet_wallet_pub);
      resolve(walletBal(config.faucet.faucet_wallet_pub));
    });
  }

  function getHashRate(hashrate) {
    if (!hashrate) hashrate = 0;
    let i = 0;
    const byteUnits = [' H', ' kH', ' MH', ' GH', ' TH', ' PH' ];
    if (hashrate > 0) {
      while (hashrate > 1000) {
        hashrate = hashrate / 1000;
        i++;
      }
    }
    return parseFloat(hashrate).toFixed(2) + byteUnits[i];
  }

  /* Enable for Coin Data ticker
async function cgData() {
  const data = await getCgData();
  const array = [];
  array.push({ cgData: data });
  return array;
  }
*/
  async function Height() {
    const data = await getHeight();
    const array = [];
    array.push({ height: data });
    return array;
  }

  async function poolInfo() {
    const data = await getPoolInfo();
    const array = [];
    array.push({ poolInfo: data });
    return array;
  }

  async function faucetBal() {
    const data = await faucetWalletBalance();
    const array = [];
    array.push({ faucetBal: data });
    return array;
  }

  // set initial status for duiscord bot
  client.user.setPresence({ activity: { name: 'for tips', type: 'WATCHING', url: 'https://qrl.tips', details: 'QRL TipBot sending quanta, and giving away funds in the faucet.', state: 'active and awake', applicationID: 'v1.0.0' }, status: 'online' })
    .catch(console.error);

  // how long in seconds before scrolling the status message.
  const seconds = 10;
  const int_interval = seconds * 1000;
  // counter to track what to show
  let counter = 0;
  // const i = setInterval(function() {
  setInterval(function() {
    counter++;
    /*
  if(counter === 1) {
    // call the function and get the results
    cgData().then(function(usdResp) {
      // console.log(JSON.stringify(usdResp[0].cgData))
      const data = JSON.parse(usdResp[0].cgData);
      // console.log(data)
      const qrlusd = data.market_data.current_price.usd;
      client.user.setPresence({ activity: { name: 'QRL/USD: $' + qrlusd.toFixed(3), type: 'WATCHING', url: 'https://qrl.tips', details: 'QRL TipBot sending quanta, and giving away funds in the faucet.', state: 'active and awake', applicationID: 'v1.0.0' }, status: 'online' })
        .catch(console.error);
    });
  }
  if(counter === 2) {
    // call the function and get the results
    cgData().then(function(btcResp) {
      // console.log(JSON.stringify(usdResp[0].cgData))
      const data = JSON.parse(btcResp[0].cgData);
      // console.log(data)
      const qrlbtc = data.market_data.current_price.btc;
      client.user.setPresence({ activity: { name: 'BTC: ' + qrlbtc.toFixed(8), type: 'WATCHING', url: 'https://qrl.tips', details: 'QRL TipBot sending quanta, and giving away funds in the faucet.', state: 'active and awake', applicationID: 'v1.0.0' }, status: 'online' })
        .catch(console.error);
    });
  }
  if(counter === 3) {
    // call the function and get the results
    cgData().then(function(ethResp, err) {
      if (err) throw err;
      // console.log(JSON.stringify(usdResp[0].cgData))
      const data = JSON.parse(ethResp[0].cgData);
      // console.log(data)
      const qrleth = data.market_data.current_price.eth;
      client.user.setPresence({ activity: { name: 'ETH: ' + qrleth.toFixed(8), type: 'WATCHING', url: 'https://qrl.tips', details: 'QRL TipBot sending quanta, and giving away funds in the faucet.', state: 'active and awake', applicationID: 'v1.0.0' }, status: 'online' })
        .catch(console.error);
    });
  }
  */
    if(counter === 1) {
    // call the function and get the results
      poolInfo().then(function(poolInfoResp) {
      // console.log(JSON.stringify(usdResp[0].cgData))
        const data = JSON.parse(poolInfoResp[0].poolInfo);
        const hashrate = getHashRate(data.network.difficulty / data.config.coinDifficultyTarget) + '/sec';
        // console.log(data)
        client.user.setPresence({ activity: { name: 'HashRate: ' + hashrate, type: 'WATCHING', url: 'https://qrl.tips', details: 'QRL TipBot sending quanta, and giving away funds in the faucet.', state: 'active and awake', applicationID: 'v1.0.0' }, status: 'online' })
          .catch(console.error);
      });
    }
    if(counter === 2) {
    // call the function and get the results
      faucetBal().then(function(faucetBalResp) {
      // console.log(JSON.stringify(faucetBalResp[0].faucetBal))
        const data = faucetBalResp[0].faucetBal;
        const faucetBalQuanta = (data.balance / 1000000000).toFixed(1);
        // console.log(faucetBalQuanta)
        if (faucetBalQuanta > 0) {
        // console.log('there is a balance');
        // client.user.setPresence({ activity: { name: 'Faucet: ' + faucetBalQuanta + 'QRL', type: 'WATCHING', url: 'https://qrl.tips', details: 'QRL TipBot sending quanta, and giving away funds in the faucet.', state: 'active and awake', applicationID: 'v1.0.0' }, status: 'online' })
          client.user.setPresence({ activity: { name: ' the faucet drip!', type: 'WATCHING', url: 'https://qrl.tips', details: 'QRL TipBot sending quanta, and giving away funds in the faucet.', state: 'active and awake', applicationID: 'v1.0.0' }, status: 'online' })
            .catch(console.error);
        }
        else {
          client.user.setPresence({ activity: { name: ', the faucet is Dry', type: 'WATCHING', url: 'https://qrl.tips', details: 'QRL TipBot sending quanta, and giving away funds in the faucet.', state: 'active and awake', applicationID: 'v1.0.0' }, status: 'online' })
            .catch(console.error);

        }
      });
    }
    if(counter === 3) {
      Height().then(function(heightResp) {
        const height = JSON.parse(heightResp[0].height);
        // console.log('print blockheight');
        client.user.setPresence({ activity: { name: 'BlockHeight: ' + height.height, type: 'WATCHING', url: 'https://qrl.tips', details: 'QRL TipBot sending quanta, and giving away funds in the faucet.', state: 'active and awake', applicationID: 'v1.0.0' }, status: 'online' })
        // .then(console.log)
          .catch(console.error);
      });
    }
    if(counter === 4) {
    // reset to initial message
      client.user.setPresence({ activity: { name: 'for tips', type: 'WATCHING', url: 'https://qrl.tips', details: 'QRL TipBot sending quanta, and giving away funds in the faucet.', state: 'active and awake', applicationID: 'v1.0.0' }, status: 'online' })
        .catch(console.error);
      // reset the counter and start again
      return counter = 0;
    }
  }, int_interval);
});


// attempt to open the prefix
const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wallet_Info = wallet.getWalletInfo;

wallet_Info().then(function(Info) {
  const info = JSON.parse(Info);
  // console.log('info: ' + JSON.stringify(info));
  if (info.code === 1) {
    console.log(chalk.cyan.bold('wallet Locked!: ') + chalk.red.bold(JSON.stringify(info)));
    console.log(chalk.bold.red.underline('\nThe Bot wont run without an unlocked wallet.') + chalk.red.bold('\n\nRun -  npm run unlockBot '));
    return;
  }
  else {
    console.log(chalk.cyan.bold('wallet Unlocked!'));
    console.log(chalk.cyan('wallet info: ') + JSON.stringify(info));
  }
});

// check for messages and if received with the prefix, do stuff
client.on('message', message => {
  /*
  // use to send a reply to user with delay and stop typing
  // ReplyMessage(' Check your DM\'s');
  function ReplyMessage(content) {
    message.channel.startTyping();
    setTimeout(function() {
      message.reply(content);
      message.channel.stopTyping(true);
    }, 1000);
  }
  */
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

  /*

  async function channelUsers() {
    const messageGuild = message.guild;
    console.log('message.guild.members: ' + JSON.stringify(messageGuild.members));
    console.log('message.guild.members.length: ' + (message.guild.members).length);
    for(let i = 0, l = (messageGuild.guild.members).length; i < l; i++) {
      console.log('user: ' + messageGuild.guild.members[i]);
    }
    // const channels = await client.channels.cache.get(config.bot_details.ban_channel_id);
    // console.log('channels: ' + JSON.stringify(channels));

  }
  channelUsers();
  const channels = message.guild.channels.filter(c => c.parentID === config.bot_details.ban_channel_id && c.name === config.bot_details.ban_channel);

  for (const [channelID, channel] of channels) {
    console.log('channelID: ' + channelID)
    for (const [memberID, member] of channel.members) {

      console.log('member: ' + JSON.stringify(member));
      console.log('memberID: ' + memberID)
        .then(() => console.log(`Moved ${member.user.tag}.`))
        .catch(console.error);
    }
  }
*/
  // check that the message starts with our prefix called out in the config file or direct to the bot
  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(config.discord.prefix)})\\s*`);
  // test message content for prefex or client id of the bot. Fail if not found
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);
  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);

  // const now = Date.now();
  const now = new Date().getTime();
  const now1 = Date(now * 1000);
  const commandName = args.shift().toLowerCase();
  //  if (!client.commands.has(commandName)) return;
  //    const command = client.commands.get(commandName);

  /*
    if(message.member.roles.find(r => r.name === config.discord.admin_role) || message.member.roles.find(r => rname === config.discord.mod_role)){
        //Rest of your code
        console.log('admin or mod calling functions');
    }
  */
  let command = '';

  if (message.channel.type !== 'dm') {
    // Check if they have one of many roles
    if(message.member.roles.cache.some(r=>[config.discord.admin_role, config.discord.mod_role].includes(r.name)) ) {
      // has one of the roles
      // console.log('hey hey roles: ')
      command = (client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))) || (client.adminCommands.get(commandName) || client.adminCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName)));
    }
    else {
    // has none of the roles
    // console.log('boo roles: ')
    command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    }
  }
  else {
    // Is not a DM
    command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
  }
  // get the command name set to command either from admin commands or user commands.
  // const command = (client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))) || (client.adminCommands.get(commandName) || client.adminCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName)));
  // console.log('command: ' + JSON.stringify(command));
  if (!command) return;
  // ///////////////////////////////////////////////////////
  //
  // LOG ALL THE THINGS
  //
  // ///////////////////////////////////////////////////////
  // log everthing with ${config.discord.prefix} or BOT user mention to console
  // ///////////////////////////////////////////////////////
  if (message.channel.type === 'dm') {
    console.log(chalk.yellow('Message Recieved:..') +
      chalk.cyan('\nTime:\t') + chalk.green(now1) +
      chalk.cyan('\nGuild:\t') + chalk.green('Private Message') +
      chalk.cyan('\nChan:\t') + chalk.green(message.channel.name) +
      chalk.cyan('\nAuth:\t') + chalk.green(message.author.username + chalk.dim(' <@' + message.author.id + '>')) +
      chalk.cyan('\nMesg:\t') + chalk.green(message.content));
  }
  else {
    console.log(chalk.yellow('Message Recieved:..') +
      chalk.cyan('\nTime:\t') + chalk.green(now1) +
      chalk.cyan('\nGuild:\t') + chalk.green(message.guild.name) +
      chalk.cyan('\nChan:\t') + chalk.green(message.channel.name) +
      chalk.cyan('\nAuth:\t') + chalk.green(message.author.username + chalk.dim(' <@' + message.author.id + '>')) +
      chalk.cyan('\nCMD:\t') + chalk.green(command.name) +
      chalk.cyan('\nMesg:\t') + chalk.green(message.content));
  }

  // console.log(chalk.cyan('\command array:\t') + chalk.green(JSON.stringify(command)))
  if (message.channel.type !== 'dm') {

    if (command.name !== 'withdraw' && message.channel.name === config.bot_details.ban_channel) {
      console.log('sent from limbo... Fail this command since not withdraw');
      console.log('command: ' + JSON.stringify(command));
      errorMessage({ error: 'Function Not Allowed...', description: 'You have been banned or kicked from this server. The only working function is `+withdraw` which will require an external adresss to transfer your funds to.\n\n**Example:**\nSend all funds to the facuet address - `+withdraw all ' + config.faucet.faucet_wallet_pub + '`\nUse an address you have created at ' + config.wallet.wallet_url });
      return;
    }

  }

  if (command.guildOnly && message.channel.type !== 'text') {
    errorMessage({ error: 'Can\'t access ' + command + ' from DM!', description: 'Please try again from the main chat, this function will only work there.' });
    // message.reply('I can\'t execute that command inside DMs!');
    return;
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments ${message.author}!`;
    // help if not used properly
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${config.discord.prefix}${command.name} ${command.usage}\``;
    }
    // send the reply from above
    return message.channel.send(reply);
  }
  // cooldown period
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expirationTime) {
      // const timeLeft = (expirationTime - now) / 1000;
      errorMessage({ error: 'Cooldown Time Limit Hit...', description: 'Please try again later' });
      // message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
      return;
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {

    // iterate through ${command} found in ./cmd/ dir
    command.execute(message, args);
  }
  catch (error) {
    console.error(error);
    errorMessage({ error: 'It appears I have been observed...', description: ' My superposition has collapsed and I landed in another state. Please reach out to my bot owner <@' + config.discord.bot_admin + '> for assistance.' });
    // message.reply('there was an error trying to execute that command!');
  }

});

client.login(config.discord.token);