module.exports = {
  name: 'info',
  description: 'Information about this bot and the QRL Network',
  aliases: [ '??', 'stats', 'status', 'state'],
  args: false,
  usage: ' {ARG}\n`args: {market | exchange | faucet | bot | user | qrl}`\nGives details about the network, QRL Market, tipbot etc. Will also print your current tipbot details to DM',
  cooldown: 0,
  execute(message, args) {
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    const wallet = require('../../qrl/walletTools');
    const explorer = require('../../qrl/explorerTools');
    const cgTools = require('../../coinGecko/cgTools');

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

    function deleteMessage() {
      // Delete the previous message
      if(message.guild != null) {
        message.channel.stopTyping(true);
        message.delete();
      }
    }

    function toQuanta(number) {
      const shor = 1000000000;
      return number / shor;
    }

    function getHeight() {
      return new Promise(resolve => {
        const height = wallet.GetHeight();
        resolve(height);
      });
    }

    function count() {
      return new Promise(resolve => {
        const walcount = wallet.count();
        resolve(walcount);
      });
    }

    function totalBalance() {
      return new Promise(resolve => {
        const totBalance = wallet.totalBalance();
        resolve(totBalance);
      });
    }

    function getCgData() {
      return new Promise(resolve => {
        const cgdata = cgTools.cgData();
        resolve(cgdata);
      });
    }

    function getPoolInfo() {
      return new Promise(resolve => {
        const poolData = explorer.poolData();
        resolve(poolData);
      });
    }

    function faucetWalletBalance() {
      return new Promise(resolve => {
        const walletBal = wallet.GetBalance;
        resolve(walletBal(config.faucet.faucet_wallet_pub));
      });
    }

    function userWalletBalance(address) {
      return new Promise(resolve => {
        const walletBal = wallet.GetBalance;
        resolve(walletBal(address));
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

    function thousandths(number) {
      const splitNumber = number.toString().split('.');
      splitNumber[0] = splitNumber[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return splitNumber.join('.');
    }

    async function main() {
      const username = `${message.author}`;
      const userName = username.slice(1, -1);
      const userInfo = { service: 'discord', service_id: userName };
      const userData = await dbHelper.GetAllUserInfo(userInfo);
      const found = userData[0].userData;
      const optOut = userData[0].opt_out;
      const agree = userData[0].user_agree;

      // faucet data
      const FaucetWalletPub = config.faucet.faucet_wallet_pub;
      const faucetPayoutInterval = config.faucet.payout_interval;
      const faucetMinPayout = config.faucet.min_payout;
      const faucetMaxPayout = config.faucet.max_payout;
      const faucetBalShor = await faucetWalletBalance();
      const faucetBal = toQuanta(faucetBalShor.balance).toFixed(9);

      // general bot data
      const botUrl = config.bot_details.bot_url;
      const explorerURL = config.bot_details.explorer_url;
      // get updated bot wallet balance and faucet wallet balance
      const cgData = JSON.parse(await getCgData());
      const priceChange24hPercent = cgData.market_data.price_change_percentage_24h;
      const circulatingSupply = cgData.market_data.circulating_supply;
      const totalSupply = cgData.market_data.total_supply;

      // bittrex info from coinGecko
      const bittrexVolumeRaw = cgData.tickers[0].volume;
      const bittrexURL = cgData.tickers[0].trade_url;
      const usdValue = cgData.market_data.current_price.usd;
      const usdATH = cgData.market_data.ath.usd;
      const usdATL = cgData.market_data.atl.usd;
      const usdMarketCap = cgData.market_data.market_cap.usd;
      const usdTotalVolume = cgData.market_data.total_volume.usd;
      const usdHigh24h = cgData.market_data.high_24h.usd;
      const usdLow24h = cgData.market_data.low_24h.usd;
      const usdPriceChange24h = cgData.market_data.price_change_24h_in_currency.usd;
      const usdMarketCapChange24h = cgData.market_data.market_cap_change_24h_in_currency.usd;

      // BTC market data from CoinGecko
      const btcValue = cgData.market_data.current_price.btc;
      const btcATH = cgData.market_data.ath.btc;
      const btcATL = cgData.market_data.atl.btc;
      const btcMarketCap = cgData.market_data.market_cap.btc;
      const btcTotalVolume = cgData.market_data.total_volume.btc;
      const btcHigh24h = cgData.market_data.high_24h.btc;
      const btcLow24h = cgData.market_data.low_24h.btc;
      const btcPriceChange24h = cgData.market_data.price_change_24h_in_currency.btc;
      const btcMarketCapChange24h = cgData.market_data.market_cap_change_24h_in_currency.btc;

      // ///////////////////////////////
      // Market Request               //
      // ///////////////////////////////
      if (args[0] == 'market' || args[0] == 'markets' || args[0] == 'price' || args[0] == 'value' || args[0] == 'volume' || args[0] == '$$') {
        const embed = new Discord.MessageEmbed()
          .setColor('GREEN')
          .setTitle('**QRL Market Info**')
          .setURL('https://www.coingecko.com/en/coins/quantum-resistant-ledger')
          .setDescription('Market information from Coin Gecko for QRL. For general information only')
          .addFields(
            { name: 'QRL USD Value:', value: '`\u0024' + thousandths(usdValue) + '`', inline: true },
            { name: 'QRL BTC Value:', value: '`\u0024' + thousandths(btcValue) + '`', inline: true },
            { name: 'Volume USD / BTC', value: '`\u0024' + thousandths(usdTotalVolume) + ' / \u20BF' + thousandths(btcTotalVolume) + '`', inline: true },
            { name: 'Price Change USD / BTC 24h', value: '`\u0024' + (usdPriceChange24h).toFixed(4) + ' \u20BF' + (btcPriceChange24h).toFixed(9) + ' (%' + (priceChange24hPercent).toFixed(2) + ')`' },
            { name: 'Market Cap:', value: '`\u0024' + thousandths(usdMarketCap) + ' / \u20BF' + thousandths(btcMarketCap) + '`', inline: true },
            { name: 'Market Cap Change 24h: ', value: '`\u0024' + thousandths(usdMarketCapChange24h) + ' / \u20BF' + thousandths(btcMarketCapChange24h) + '`', inline: true },
            { name: '24hr USD Low/High', value: '`\u0024' + thousandths((usdLow24h).toFixed(3)) + ' / \u0024' + thousandths((usdHigh24h).toFixed(3)) + '`' },
            { name: '24hr BTC Low/High', value: '`\u20BF' + thousandths(btcLow24h) + ' / \u20BF' + thousandths(btcHigh24h) + '`' },
            { name: 'All TIme High:', value: '**USD:** `\u0024' + thousandths((usdATH).toFixed(2)) + '` **BTC:** `\u20BF' + thousandths((btcATH).toFixed(9)) + '`' },
            { name: 'All Time Low', value: '**USD:** `\u0024' + thousandths((usdATL).toFixed(2)) + '` **BTC:** `\u20BF' + thousandths((btcATL).toFixed(9)) + '`', inline: true },
            { name: 'Circulating / Total Supply', value: '`' + thousandths(circulatingSupply.toFixed(0)) + ' / ' + thousandths(totalSupply) + '`' },
          )
          .setTimestamp()
          .setFooter('  .: Tipbot provided by The QRL Contributors :. Market data provided by Coin Gecko');
        message.reply({ embed })
          .then(() => {
            message.channel.stopTyping(true);
          });
      }
      // ///////////////////////////////
      // Faucet Request               //
      // ///////////////////////////////
      else if (args[0] == 'faucet' || args[0] == 'drip' || args[0] == 'free' || args[0] == 'charity' || args[0] == 'giveaway') {
        const embed = new Discord.MessageEmbed()
          .setColor('GREEN')
          .setTitle('**QRL Faucet Info**')
          .setURL('https://faucet.qrl.tips')
          .setDescription('The QRL Tipbot has a faucet included that will give Quanta away to any user signed up to the tipbot. Faucet details below.')
          .addFields(
            { name: 'Tipbot Faucet Balance:', value: '`' + thousandths(faucetBal) + '`' },
            { name: 'Faucet Payout interval:', value: ':timer: `' + ((faucetPayoutInterval / 60) / 24).toFixed(4) + ' Day(s)`' },
            { name: 'Minimum Faucet Payout', value: ':small_red_triangle_down: ` ' + faucetMinPayout + ' quanta`', inline: true },
            { name: 'Maximum Faucet Payout', value: ':small_red_triangle: ` ' + faucetMaxPayout + ' quanta`', inline: true },
            { name: 'Faucet Wallet Address', value: '[' + FaucetWalletPub + '](' + config.bot_details.explorer_url + '/a/' + FaucetWalletPub + ')' },
          )
          .setTimestamp()
          .setFooter('Use the address above if you would like to contribute to the faucet   .: Tipbot provided by The QRL Contributors :.');
        message.reply({ embed })
          .then(() => {
            message.channel.stopTyping(true);
          });
      }
      // ///////////////////////////////
      // Exchange Request             //
      // ///////////////////////////////
      else if (args[0] == 'exchange' || args[0] == 'trade') {
        // #####################
        // Bittrex
        // #####################
        if (args[1] == 'bittrex') {
          const bittrexLastBTC = cgData.tickers[0].last;
          const bittrexBidAsk = cgData.tickers[0].bid_ask_spread_percentage;
          const bittrexConvertedVolumeBtc = cgData.tickers[0].converted_volume.btc;
          const bittrexConvertedVolumeEth = cgData.tickers[0].converted_volume.eth;
          const bittrexConvertedVolumeUsd = cgData.tickers[0].converted_volume.usd;
          const embed = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setTitle('**QRL Bittrex Information**')
            .setURL(bittrexURL)
            .setDescription(`QRL trading information for the [Bittrex](${bittrexURL}) exchange.`)
            .addFields(
              { name: 'Volume:', value: '`' + bittrexVolumeRaw + ' QRL`' },
              { name: 'Converted Volume Usd:', value: '`\u0024 ' + bittrexConvertedVolumeUsd + ' usd`', inline: true },
              { name: 'Converted Volume BTC:', value: '`\u20BF ' + bittrexConvertedVolumeBtc + ' btc`', inline: true },
              { name: 'Converted Volume ETH:', value: '`\u039E ' + bittrexConvertedVolumeEth + ' eth`', inline: true },
              { name: 'Last Trade: ', value: '\u20BF ` ' + bittrexLastBTC + '`', inline: true },
              { name: 'Bid / Ask Spread:', value: '` ' + bittrexBidAsk + ' %`', inline: true },
            )
            .setTimestamp()
            .setFooter('Market Data provided by Coin Gecko -   .: Tipbot provided by The QRL Contributors :. ');
          message.reply({ embed })
            .then(() => {
              message.channel.stopTyping(true);
            });
        }
        // if none with API endpoints then give this message.
        // FIX-ME: Need to integrate with additional services or direct from exchange

        /* else if (args[1] == 'biteeu' || args[1] == 'bitvoicex' || args[1] == 'cointiger' || args[1] == 'simpleswap' || args[1] == 'swapzone' || args[1] == 'stealthex') {
          const embed = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setTitle('**QRL Exchange Info**')
            .setURL('https://theqrl.org/markets/')
            .setDescription(`Exchange information where you can trade $QRL.
            [:small_blue_diamond: BITEEU](https://trade.biteeu.com/search)
            [:small_blue_diamond: Bitvoicex](https://bitvoicex.net/markets/qrl_btc)
            [:small_blue_diamond: CoinTiger](https://www.cointiger.com/en-us/#/trade_center?coin=qrl_btc)
            [:small_blue_diamond: SimpleSwap](https://simpleswap.io/coins/quantum-resistant-ledger)
            [:small_blue_diamond: SwapZone](https://swapzone.io/?to=qrl)
            [:small_blue_diamond: StealthEX](https://stealthex.io/coin/qrl)
            For listing inquires email: __info@theqrl.org__
            *Volume data provided by [Coin Gecko](https://www.coingecko.com/en/coins/quantum-resistant-ledger)*
            `)
            .addFields(
            )
            .setTimestamp()
            .setFooter('  .: Tipbot provided by The QRL Contributors :.');
          message.reply({ embed })
            .then(() => {
              message.channel.stopTyping(true);
            });
        } */
        else {
          // give default response with listing info
          const embed = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setTitle('**QRL Exchange Info**')
            .setURL('https://theqrl.org/markets/')
            .setDescription(`Exchange information where you can trade QRL can be found at the [main QRL webiste](https://theqrl.org/markets/).
  
            For listing inquires email: __info@theqrl.org__
            `)
            .addFields(
            )
            .setTimestamp()
            .setFooter('  .: Tipbot provided by The QRL Contributors :.');
          message.reply({ embed })
            .then(() => {
              message.channel.stopTyping(true);
            });
        }
      }

      // /////////////////////////////
      //  QRL Info
      // /////////////////////////////
      // list all information related to QRL
      else if (args[0] == 'QRL' || args[0] == 'qrl' || args[0] == 'project' || args[0] == 'economics' || args[0] == 'about' || args[0] == 'wallet') {
        // give default response with listing info
        const poolData = JSON.parse(await getPoolInfo());
        const poolBlockheight = poolData.lastblock.height;
        const hashrate = getHashRate(poolData.network.difficulty / poolData.config.coinDifficultyTarget) + '/sec';
        const embed = new Discord.MessageEmbed()
          .setColor('GREEN')
          .setTitle('**QRL Project Info**')
          .setURL('https://theqrl.org/')
          .addFields(
            { name: 'Quanta distribution: ', value: 'Exponential decay emission schedule over approximately 200 years', inline: false },
            { name: 'Emission: ', value: '`40,000,000 Quanta`', inline: true },
            { name: 'Initial public supply: ', value: '`52,000,000 Quanta`', inline: true },
            { name: 'Initial reserved supply: ', value: '`13,000,000 Quanta` 8,000,000 reserved for distribution by the QRL Foundation', inline: false },
            { name: 'Eventual total supply: ', value: '`105,000,000 Quanta`', inline: false },
            { name: 'Mining:: ', value: 'Proof-of-Work, RandomX (Proof-of-Stake development underway)', inline: false },
            { name: 'Block Height: ', value: '`' + poolBlockheight + '`', inline: true },
            { name: 'Network Hashrate:', value: '`' + hashrate + '`', inline: true },
          )
          .setDescription(`QRL Project Information, official links and Coin Economics
            
            **Links**
            [:low_brightness: Main Site](https://theqrl.org)
            [:low_brightness: QRL Web Wallet](${config.wallet.wallet_url})
            [:low_brightness: QRL Block Explorer](${config.bot_details.explorer_url})
            [:low_brightness: Documentation Site](https://docs.theqrl.org)
            [:low_brightness: Roadmap](https://www.theqrl.org/roadmap/)
            [:low_brightness: Whitepaper](https://github.com/theQRL/Whitepaper)
            [:low_brightness: Github](https://github.com/theqrl)
            [:low_brightness: Richlist](https://quantascan.io/wallet-rich-list)
              `)
          .addFields(
          )
          .setTimestamp()
          .setFooter('  .: Tipbot provided by The QRL Contributors :.');
        message.reply({ embed })
          .then(() => {
            message.channel.stopTyping(true);
          });
      }

      // ///////////////////////////////
      // Bot Request                  //
      // ///////////////////////////////

      else if (args[0] == 'help' || args[0] == 'info' || args[0] == 'use' || args[0] == 'what') {
        // serve the bot info here
        const embed = new Discord.MessageEmbed()
          .setColor('GREEN')
          .setTitle('**QRL Tipbot Info**')
          .setURL(botUrl)
          .setDescription('List of all tipbot commands. Enter `+help COMMAND` for more info on each command below.\n')
          .addFields(
            { name: 'add: ', value: 'Add user to tipbot, creating a wallet and account, `+help add`', inline: false },
            { name: 'agree: ', value: 'Agree to the terms and conditions, `+help agree`', inline: false },
            { name: 'balance: ', value: 'Print user QRL balance or QRL address balance to DM, `+help balance`', inline: false },
            { name: 'deposit: ', value: 'Deposit information to send funds to your tipbot address, `+help deposit`', inline: false },
            { name: 'drip: ', value: 'Receive a payout from the tipbot faucet, `+help drip`', inline: false },
            { name: 'help: ', value: 'Print help information for the tipbot commands, `+help`', inline: false },
            { name: 'info: ', value: 'This command, giving information on various topics, `+help info`', inline: false },
            { name: 'optin: ', value: 'Opt into the tipbot {default signup condition} after user has opt\'ed out, `+help optin`', inline: false },
            { name: 'optout: ', value: 'Opt out of the tipbot and all tipping functions including the faucet. `+help optout`', inline: false },
            { name: 'terms: ', value: 'Print the terms and conditions for using the bot, `+help terms`', inline: false },
            { name: 'tip: ', value: 'Tip another user QRL from your tipbot address, `+help tip`', inline: false },
            { name: 'withdraw: ', value: 'Send your tipbot funds to another address, `+help withdraw`', inline: false },
          )
          .setTimestamp()
          .setFooter('  .: Tipbot provided by The QRL Contributors :.');
        message.author.send({ embed })
          .then(() => {
            ReplyMessage('The tipbot enables sending QRL tips to other discord users. The bot will create an individual address for each bot user with the `+add` command. \n\n:small_blue_diamond: All tips are on chain and can be seen in the QRL Block Explorer - ' + explorerURL + '. \n:small_blue_diamond: `+transfer` your earned tips out of the tipbot.\n:small_blue_diamond: Use the QRL Web Wallet ' + config.wallet.wallet_url + ' if you need a new address\n\n**More details in your DM**');
            message.channel.stopTyping(true);
          });
      }

      else if (args[0] == 'bot' || args[0] == 'tipbot' || args[0] == 'details') {
        // get pool data from a pool
        const poolData = JSON.parse(await getPoolInfo());
        const hashrate = getHashRate(poolData.network.difficulty / poolData.config.coinDifficultyTarget) + '/sec';
        // serve the bot info here
        const nodeBlockHeight = JSON.parse(await getHeight());
        if (message.channel.type !== 'dm') {
          if (message.member.roles.cache.some(r=>[config.discord.admin_role, config.discord.mod_role].includes(r.name))) {
          // has a role, admin stuff here
            const wallet_count = JSON.parse(await count());
            const total_balance = JSON.parse(await totalBalance());
            const faucet_balance = await faucetWalletBalance();
            const embed = new Discord.MessageEmbed()
              .setColor('GREEN')
              .setTitle('**QRL Tipbot Info**')
              .setURL(botUrl)
              .setDescription('Tipbot **ADMIN** information.')
              .addFields(
                { name: 'Block Height: ', value: '`' + nodeBlockHeight.height + '`', inline: true },
                { name: 'Network Hashrate:', value: '`' + hashrate + '`', inline: true },
                { name: 'Wallet Count:', value: '`' + wallet_count + '`', inline: true },
                { name: 'Total Users Balance:', value: '`' + toQuanta(Number(total_balance) - Number(faucet_balance.balance)) + '`', inline: false },
                { name: 'Faucet Balance:', value: '`' + toQuanta(Number(faucet_balance.balance)) + ' QRL`', inline: false },
              )
              .setTimestamp()
              .setFooter('  .: Tipbot provided by The QRL Contributors :.');
            message.author.send({ embed })
              .then(() => {
                message.channel.stopTyping(true);
              });

          }
          // is not a DM and user is Not admin
          const embed = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setTitle('**QRL Tipbot Info**')
            .setURL(botUrl)
            .setDescription('Tipbot general information.')
            .addFields(
              { name: 'Block Height: ', value: '`' + nodeBlockHeight.height + '`', inline: true },
              { name: 'Network Hashrate:', value: '`' + hashrate + '`', inline: true },
              // FIX-ME:
              //    add more information about the bot
              //    including how many accounts signed up, total tips sent, servers and other bot stats.

            // { name: 'Bot Transaction Fees:', value: '`\u0024 ' + botFee + '`', in line: true },
            )
            .setTimestamp()
            .setFooter('  .: Tipbot provided by The QRL Contributors :.');
          message.reply({ embed })
            .then(() => {
              message.channel.stopTyping(true);
            });
        }
        else {
          // message is a DM
          const embed = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setTitle('**QRL Tipbot Info**')
            .setURL(botUrl)
            .setDescription('Tipbot general information.')
            .addFields(
              { name: 'Block Height: ', value: '`' + nodeBlockHeight.height + '`', inline: true },
              { name: 'Network Hashrate:', value: '`' + hashrate + '`', inline: true },
              // FIX-ME:
              //    add more information about the bot here
              //    including how many accounts signed up, total tips sent, servers and other bot stats.

            // { name: 'Bot Transaction Fees:', value: '`\u0024 ' + botFee + '`', in line: true },
            )
            .setTimestamp()
            .setFooter('  .: Tipbot provided by The QRL Contributors :.');
          message.reply({ embed })
            .then(() => {
              message.channel.stopTyping(true);
            });
        }
      }
      else if (args[0] == '?$' || args[0] == 'user' || args[0] == 'me' || args[0] == 'account' || args[0] == 'balance' || args[0] == 'bal' || args[0] == 'address') {
      // run through checks and fail if, else serve User info to the user
      // is user found?
        if (found === 'false') {
          // not found, give main message and end
          errorMessage({ error: 'Not Found In System...', description: 'You\'re not found in the System. Enter `+help add` for instructions' });
          // ReplyMessage('Your not found in the System. Try `+add` or `+help`');
          return;
        }
        // check for opt_out status
        if (optOut === 1) {
          // Opt Out, give main message and end
          errorMessage({ error: 'User Has Opted Out...', description: 'You have opted out of the tipbot. Enter `+help opt-in` for instructions' });
          // ReplyMessage('You have opted out of the tipbot. Please send `+opt-in` to opt back in!');
          return;
        }
        if (agree === 'false') {
          // not Agreed, give main message and end
          errorMessage({ error: 'User Has Not Agreed...', description: 'You have not agreed to the tipbot terms. Enter `+help agree` for instructions' });
          // ReplyMessage('You need to agree, please see the `+terms`');
          return;
        }
        else {
          deleteMessage();
          // user found and all checks pass Send them a message with tipbot account details
          //
          // FIX-ME
          //
          // Add more details for users here, tips sent, tips received, faucet withdraws etc fro DB
          //
          // if (message.channel.type === 'dm') return;
          const userWalletPub = userData[0].wallet_pub;
          const userBalShor = await userWalletBalance(userWalletPub);
          const userBal = toQuanta(userBalShor.balance).toFixed(9);
          const userBTCValue = (userBal * btcValue).toFixed(9);
          const userUSDValue = (userBal * usdValue).toFixed(3);
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .setTitle('**QRL Tipbot Info**')
            .setURL(botUrl)
            // .setDescription('Details from the balance query.')
            .addFields(
              { name: 'Your Tipbot Wallet Balance:', value: '`' + thousandths(userBal) + ' QRL`' },
              { name: 'Tipbot Balance - BTC:', value: '`\u20BF ' + thousandths(userBTCValue) + '`', inline: true },
              { name: 'Tipbot Balance - USD', value: '`\u0024 ' + thousandths(userUSDValue) + '`', inline: true },
              { name: 'Tipbot QRL Address:', value: '[' + userWalletPub + '](' + config.bot_details.explorer_url + '/a/' + userWalletPub + ')' },
            )
            .addField('QRL / USD', '`1 QRL = \u0024 ' + thousandths(usdValue) + '`', true)
            .setTimestamp()
            .setFooter('  .: Tipbot provided by The QRL Contributors :. Market data provided by Coin Gecko');
          message.author.send({ embed })
            .then(() => {
              message.channel.stopTyping(true);
              if (message.channel.type === 'dm') return;
            })
            .catch(e => {
              errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' + e.message});
              return;
            });
        }
      }
      // get block height from node
      else {
        ReplyMessage('Use this bot to send and receive tips on the QRL network. `+help info` for more commands.');
      }
    }
    main();
  },
};