module.exports = {
  name: 'tip',
  description: 'Send QRL to other users on Discord',
  guildOnly: false,
  args: false,
  cooldown: 1,
  aliases: ['!$', 'send', 'Tip', 'give', 'gift', 'TIP'],
  usage: '\n<tip amount> <user1> <user2> <user3> <etc.> \nEXAMPLE: `+tip 1 @CoolUser`',
  execute(message, args) {
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    const wallet = require('../../qrl/walletTools');
    const futureTippedUserInfo = [];
    const futureTippedUserIDs = [];
    const futureTippedUserServiceIDs = [];
    const tippedUserInfo = [];
    const tippedUserWallets = [];
    const tippedUserTipAmt = [];
    const tippedUserUsernames = [];
    const tippedUserIDs = [];
    const bannedUsersArray = [];
    const tippedUserServiceIDs = [];
    const futureTippedUserUsernames = [];
    const fee = toShor(config.wallet.tx_fee);
    const username = `${message.author}`;
    const userID = username.slice(1, -1);
    let tippingUserUser_Found = false;
    let tippingUserUser_agree = false;
    let tippingUserOpt_Out = true;
    let tippingUserBanned = true;
    // let tippingUserBannedDate = '';
    // message.channel.startTyping();

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

    // check if this is a DM and if so, block forcing user into the chat room
    if (message.channel.type === 'dm') {
      errorMessage({ error: 'Can\'t access this function from DM!', description: 'Please try again from the main chat, this function will only work there.' });
      return;
    }

    function toShor(number) {
      const shor = 1000000000;
      return number * shor;
    }

    function toQuanta(number) {
      const shor = 1000000000;
      return number / shor;
    }

    function isQRLValue(str) {
      // receive amount in shor, do accordingly
      // Fail immediately.
      let test = false;
      // Check if it's only numeric and periods (no spaces, etc)
      if(/^[0-9]{0,8}[.]?[0-9]{0,9}$/.test(str)) {
        // And check for a value between 0.000000001 and 105000000
        const min = toShor(0.000000001);
        const max = toShor(105000000);
        if(str >= min && str <= max) {
          test = true;
        }
      }
      return test;
    }

    // Get user info.
    async function getUserInfo(usrInfo) {
      return new Promise(resolve => {
        const data = dbHelper.GetAllUserInfo(usrInfo);
        resolve(data);
      });
    }

    // send the users data to future_tips for when they sign up
    async function futureTipsDBWrite(futureTipInfo) {
      return new Promise(resolve => {
        const infoToSubmit = { service: 'discord', user_id: futureTipInfo.user_id, service_id: futureTipInfo.service_id, user_name: futureTipInfo.user_name, tip_id: futureTipInfo.tip_id, tip_from: futureTipInfo.tip_from, tip_amount: toQuanta(futureTipInfo.tip_amount), time_stamp: new Date() };
        const addToFutureTipsDBinfoWrite = dbHelper.addFutureTip(infoToSubmit);
        resolve(addToFutureTipsDBinfoWrite);
      });
    }

    async function tipDBWrite(tipInfo) {
      // send the users data to future_tips for when they sign up
      return new Promise(resolve => {
        const addToTipsDBinfo = { from_user_id: tipInfo.from_user_id, tip_amount: toQuanta(tipInfo.tip_amount), from_service: 'discord', time_stamp: new Date() };
        const addToTipsDBinfoWrite = dbHelper.addTip(addToTipsDBinfo);
        resolve(addToTipsDBinfoWrite);
      });
    }


    async function tipToDBWrite(tipToInfo) {
      // send the users data to future_tips for when they sign up
      return new Promise(resolve => {
        const addToTipsToDBinfo = { tip_id: tipToInfo.tip_id, user_id: tipToInfo.user_id, from_user_id: tipToInfo.from_user_id, tip_amt: toQuanta(tipToInfo.tip_amt), future_tip_id: tipToInfo.future_tip_id, time_stamp: new Date() };
        const addToTipsToDBinfoWrite = dbHelper.addTipTo(addToTipsToDBinfo);
        resolve(addToTipsToDBinfoWrite);
      });
    }

    function tipAmount() {
      for (const arg of args) {
        const checkValue = isQRLValue(toShor(arg));
        if(checkValue) {
          return toShor(arg);
        }
      }
    }

    async function tipbotInfo(ID) {
      // FIX ME HERE!!!
      return new Promise(resolve => {
        const userInfo = getUserInfo({ service: 'discord', service_id: ID });
        resolve(userInfo);
      });
    }

    async function checkUserInfo(ID) {
      return new Promise(resolve => {
        const userInfo = dbHelper.CheckUser({ service: 'discord', user_id: ID });
        resolve(userInfo);
      });
    }

    function Count(list) {
      const arrayCount = list.length;
      return arrayCount;
    }

    // check if user mentioned another user to tip
    if (!message.mentions.users.size) {
      errorMessage({ error: 'No User(s) Mentioned...', description: 'Who are you tipping? enter `+help tip` for instructions' });
      return ;
    }
    // check if mentioned group and fail if so
    if (args.includes('@here') || args.includes('@everyone') || args.includes('@developer') || args.includes('@founder')) {
      errorMessage({ error: 'Can\'t Tip Groups...', description: 'Please send to individual user(s), up to 100 users in a tip.' });
      return;
    }
    // set tip amount here. Pulls the args and checks until it finds a good tip amount
    // iterates through the list of args given and looks for a number, first found wins.
    // This also checks the number to validate its a qrl amount isQRLValue()
    const givenTip = tipAmount();
    // check if amount is NaN
    if (isNaN(givenTip)) {
      errorMessage({ error: 'Invalid Amount Given...', description: 'Please enter a valid amount to tip! `+tip {AMOUNT} @USER(\'s)`' });
      return ;
    }
    // Check that tip amount is above fee
    if (givenTip < fee) {
      message.channel.stopTyping(true);
      errorMessage({ error: 'Invalid Amount Given...', description: 'Tip must be more than TX Fee: `{' + config.wallet.tx_fee + '}`' });
      return ;
    }
    
    checkUserInfo(userID).then(function(userInfo) {
      tippingUserBanned = JSON.stringify(userInfo.banned);
      // check for tipping user is banned
      if (tippingUserBanned === '1') {
        errorMessage({ error: 'User is Banned...', description: 'You have been banned from using the bot, please contact a moderator if you think this is an error.' });
        return;
      }  
      // Get user info into scope from database
      tipbotInfo(userID).then(function(tipingUserInfo) {
        tippingUserUser_Found = JSON.stringify(tipingUserInfo[0].user_found);
        tippingUserUser_agree = JSON.stringify(tipingUserInfo[0].user_agree);
        tippingUserOpt_Out = JSON.stringify(tipingUserInfo[0].opt_out);
        // check for tipping user in the system
        if (tippingUserUser_Found == 'false') {
          errorMessage({ error: 'User Not Found...', description: 'Please sign up to the tipbot. Enter `+add` to create a wallet then `+agree` to use the bot' });
          return;
        }
        // check for tipping user agree
        if (tippingUserUser_agree == 'false') {
          errorMessage({ error: 'User Has Not Agreed to Terms...', description: 'Please agree to the terms to start using the bot. Enter `+terms` to read or `+agree`' });
          return;
        }
        // check for tipping user opt-out
        if (tippingUserOpt_Out == 'true') {
          const tippingUserOptOut_Date = JSON.stringify(tipingUserInfo[0].optout_date);
          errorMessage({ error: 'User Has `Opt-Out` Status...', description: 'You opted out on ' + tippingUserOptOut_Date + '. Please opt back in to use the bot. `+opt-in`' });
          return;
        }
        // user found in database and passes initial checks.
        const tippingUserWallet_Pub = JSON.stringify(tipingUserInfo[0].wallet_pub);
        const tippingUserWallet_PendingBal = JSON.stringify(tipingUserInfo[0].pending);
        const tippingUserUser_Id = JSON.stringify(tipingUserInfo[0].user_id);
        // check balance to tip amount
        if (Number(tipingUserInfo[0].wallet_bal) <= 0) {
          errorMessage({ error: 'User Wallet Empty...', description: 'No funds to tip. Transfer funds with `+deposit` or pull from the faucet if full with `+drip`' });
          return;
        }
        // check balance to tip amount pending balance
        if (Number(tipingUserInfo[0].wallet_bal) - tippingUserWallet_PendingBal < 0) {
          errorMessage({ error: 'Pending Balance Found...', description: 'You have a pending balance that is less than you are sending. Wait for the transactions to confirm and try again.' });
          return;
        }
        // Get the tipList (send tip to) without bots in the array
        const tipList = message.mentions.users.map(user => {
          const userName = user.username;
          const output = '@' + JSON.parse(JSON.stringify(userName));
          const service_user_ID = user.id;
          const userid = '@' + user.id;
          const bot = user.bot;
          const discriminator = user.discriminator;
          const lastMessageID = user.lastMessageID;
          const lastMessageChannelID = user.lastMessageChannelID;
          const avatar = user.avatar;
          const verified = user.verified;
          const mfaEnabled = user.mfaEnabled;
          // check if mentioned user is a bot
          if (bot) {
          // don't do anything for the bot.. silly bot
            return;
          }
          if (userid === userID) {
          // user mentioned self, do not count and move on
            errorMessage({ error: 'User Tipped Self...', description: 'You can\'t tip yourself! Removing you from the tip and proceeding' });
            return;
          }
          // Not a bot, return details
          const details = { userName: output, service_id: service_user_ID, userid: userid, bot: bot, discriminator: discriminator, avatar: avatar, lastMessageID: lastMessageID, lastMessageChannelID: lastMessageChannelID, verified: verified, mfaEnabled: mfaEnabled };
          return details;
        });
        // remove any null or empty contents
        const filteredTipList = tipList.filter(function(el) {
          return el != null;
        });
        // get the bots into array
        const botList = message.mentions.users.map(user => {
          const userName = user.username;
          const output = '@' + JSON.parse(JSON.stringify(userName));
          const userid = '<@!' + user.id + '>';
          const bot = user.bot;
          if (!bot) {
            // if not a bot don't do anything
            return;
          }
          // bot found, return the bot info
          const botListOutput = JSON.parse(JSON.stringify({ userName: output, userid: userid, bot: bot }));
          return botListOutput;

        });
        const filteredBotList = botList.filter(function(el) {
          return el != null;
        });
        const botListJSON = JSON.parse(JSON.stringify(filteredBotList));
        const bots = [];
        const botUserCount = Count(botListJSON);
        // if bot count is positive warn user and continue
        const botId = config.bot_details.bot_id;
        if (botUserCount > 0) {
          if (botUserCount == 1 && message.mentions.users.first() == botId) {
            // do  nothing
          }
          else {
            errorMessage({ error: 'Bot Tipped!', description: 'You have tipped a bot, and that\'s not allowed. Please check your tip and try again.\nIf you would like to donate to the tipbot please send a withdraw to the faucet address `+info faucet` for more.' });
          }
          for(let i = 0, l = filteredBotList.length; i < l; i++) {
            bots.push(' ' + filteredBotList[i].userid);
          }
        }
        const tipListJSON = JSON.parse(JSON.stringify(filteredTipList));
        const tipUserCount = Count(tipListJSON);
        // get the total tip amount plus the fee
        const tipTotal = ((givenTip * tipUserCount) + fee);
        if (Number(tipingUserInfo[0].wallet_bal) - tippingUserWallet_PendingBal < tipTotal) {
          errorMessage({ error: 'Tipping more than you have...', description: 'Enter `+bal` to get your current balance.' });
          return;
        }

        async function userInfo() {
          for(let i = 0, l = filteredTipList.length; i < l; i++) {
          // check for user in the tipbot database and grab addresses etc. for them.
          // first check for user ban
            const tipToUserBanned = await checkUserInfo(filteredTipList[i].userid);
            if (tipToUserBanned.banned === 1 ) {
            // this user is banned, do not tip them
              bannedUsersArray.push(filteredTipList[i].userid);
              continue;
            }
            const tipToUserInfo = await tipbotInfo(filteredTipList[i].userid);
            const tipToUserFound = tipToUserInfo[0].user_found;
            const tipToUserOptOut = tipToUserInfo[0].opt_out;
            // If tipped user is found then...
            if (tipToUserFound) {
              // If tipped user Opt-Out true...
              if (tipToUserOptOut) {
                // user found and opted out. Add to the future_tips table and set the wallet address to the hold address...
                futureTippedUserInfo.push(filteredTipList[i]);
                const futureTippedUserId = JSON.stringify(tipToUserInfo[0].user_id);
                const futureTippedUserUsername = filteredTipList[i].userName;
                const futureTippedUserServiceID = filteredTipList[i].userid;
                futureTippedUserIDs.push(futureTippedUserId);
                futureTippedUserUsernames.push(futureTippedUserUsername);
                futureTippedUserServiceIDs.push(futureTippedUserServiceID);
                // assign the config.hold.address here for future tips payout
                tippedUserWallets.push(config.wallet.hold_address);
                tippedUserTipAmt.push(givenTip);
                continue;
              }
              else {
              // user found and not opted out, add to array and move on
                const tipToUserUserId = tipToUserInfo[0].user_id;
                const tippedUserServiceID = filteredTipList[i].userid;
                const tippedUserUsername = filteredTipList[i].userName;
                const tipToUserUserWalletPub = tipToUserInfo[0].wallet_pub;
                // push user data to arrays for tipping
                tippedUserIDs.push(tipToUserUserId);
                tippedUserServiceIDs.push(tippedUserServiceID);
                tippedUserUsernames.push(tippedUserUsername);
                tippedUserWallets.push(tipToUserUserWalletPub);
                tippedUserInfo.push(tipToUserInfo);
                tippedUserTipAmt.push(givenTip);
                continue;
              }
            }
            else {
              // the user is not in the database yet, add to the future_tips table and set the wallet address to the hold address
              futureTippedUserInfo.push(filteredTipList[i]);
              const futureTippedUserServiceID = filteredTipList[i].userid;
              futureTippedUserIDs.push('000');
              futureTippedUserServiceIDs.push(futureTippedUserServiceID);
              // assign the config.hold.address here for future tips payout
              tippedUserWallets.push(config.wallet.hold_address);
              tippedUserTipAmt.push(givenTip);
            }
          // arrays are full, now send the transactions and set database.
          }
          // add users to the tips db and create a tip_id to track this tip through
          const addTipInfo = { from_user_id: tippingUserUser_Id, tip_amount: givenTip };
          const addTipResults = await tipDBWrite(addTipInfo);
          const tip_id = addTipResults[0].tip_id;
          // check for tx_id to be created...
          const check_tip_id = function() {
            if(tip_id == undefined) {
            // check again in a second
              setTimeout(check_tip_id, 1000);
            }
          };
          check_tip_id();
          // ///////// Found Tipped Users Database Entry ///////// //
          // looks through all users in the tippedUserInfo array assigned above.
          // For each user found, adds their info to the tips_to database. One entry each user
          // /////////////////////////////////////////////// //
          for(let i = 0, l = tippedUserInfo.length; i < l; i++) {
          // add tip info to the database. Will take the values assigned above and for each found in the tip results will add to the database,
          // tipped user id here is the tipbot user ID since they are found in the system.
            const addTipToInfo = { tip_id: tip_id, tip_amt: givenTip, user_id: tippedUserIDs[i], from_user_id: tippingUserUser_Id };
            // this writes to the tips_to database
            // eslint-disable-next-line
          const addTipToCall = await tipToDBWrite(addTipToInfo);
          }
          // ///////// Future Users Database Entry ///////// //
          // looks through all users in the futureTippedUserInfo array assigned above.
          // For each user found, adds their info to the future_tips_to database. One entry each user to be paid out in the future
          // /////////////////////////////////////////////// //
          for(let i = 0, l = futureTippedUserInfo.length; i < l; i++) {
            const addFutureTipToInfo = { user_id: futureTippedUserIDs[i], service_id: futureTippedUserServiceIDs[i], user_name: futureTippedUserInfo[i].userName, tip_id: tip_id, tip_from: tippingUserUser_Id, tip_amount: givenTip };
            const addFutureTipToCall = await futureTipsDBWrite(addFutureTipToInfo);
            const future_tip_id = addFutureTipToCall[0].tip_id;
            const addTipToInfo = { tip_id: tip_id, tip_amt: givenTip, user_id: futureTippedUserIDs[i], from_user_id: tippingUserUser_Id,  future_tip_id: future_tip_id };
            // eslint-disable-next-line
          const addTipToCall = await tipToDBWrite(addTipToInfo);
          }
          return [filteredTipList, tippedUserWallets, tippedUserTipAmt, tip_id];
        }
        // get all tippedToUser info from the database
        userInfo().then(function(FinalInfo) {
          // using details above enter the transactions into the node and respond to users.
          // ///////// Send the transaction ///////// //
          const tipToInfo = { amount: tippedUserTipAmt, fee: fee, address_from: JSON.parse(tippingUserWallet_Pub), address_to: tippedUserWallets };
          wallet.sendQuanta(tipToInfo).then(function(sendData) {
            const transferOutPut = JSON.parse(sendData);
            if (transferOutPut.code !== 1) {
              const tx_hash = transferOutPut.tx.transaction_hash;
              const txInfo = { tip_id: FinalInfo[3], tx_type: 'tip', tx_hash: tx_hash };
              dbHelper.addTransaction(txInfo).then(function() {
              // ///////// Add to database and write the tx_id to the tip record ///////// //
              // ///////// DM User tip details and address balance after the TX ///////// //
              // get address balance after tx
                const embed = new Discord.MessageEmbed()
                  .setColor(0x000000)
                  .setTitle('QRL Tip Sent!')
                  .setDescription('Your tip was posted on the network! It may take a few minutes to confirm\nSee the transaction info in the [QRL Block Explorer](' + config.bot_details.explorer_url + '/tx/' + tx_hash + ')')
                  .addField('Tip Amount', '`' + toQuanta(givenTip).toFixed(9) + ' QRL`', true)
                  .addField('Tipped User Count', '`' + tipUserCount + ' User(s)`', true)
                  .addField('Network Fee', '`' + toQuanta(fee).toFixed(9) + ' QRL`', true)
                  .addField('Total Transfer', '`' + toQuanta(tipTotal).toFixed(9) + ' QRL`', true)
                  .addField('Transaction Hash', '[```yaml\n' + tx_hash + '\n```](' + config.bot_details.explorer_url + '/tx/' + tx_hash + ')')
                  .setFooter('.: The QRL TipBot :. ');
                message.author.send({ embed })
                  .then(() => {
                    if (message.channel.type !== 'dm') return;
                  })
                  .catch(e => {
                    errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' + e.message });
                  });

                ReplyMessage('your tip was sent! Thanks for using the tipbot :smiley: \n*All tips are on-chain, and will take some time to process...*');
              });
            }
            if (bannedUsersArray.length > 0) {
              ReplyMessage('Some users in your tip are banned. They will not receive any funds...*');
            }
          });
        });
      });
    });
  },
};
