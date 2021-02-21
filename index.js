#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

'use strict';
const wallet = require('./_scripts/qrl/walletTools');
const listAddresses = wallet.listAll;
const fs = require('fs');
const mysql = require('mysql');
const chalk = require('chalk');
const now = new Date();
const { spawn } = require('child_process');

console.log(chalk`{cyan Starting the QRL TipBot 
Time is: {green {dim ${now}}}}
{green Running Checks...}`);


const configStats = function() {
  return new Promise(function(resolve, reject) {
    fs.stat('_config/config.json', function(err, stat) {
      if(err == null) {
          const configFound = true;
          resolve(configFound);
      }
      else if(err.code === 'ENOENT') {
          reject(new Error('config file not found...'));
          // file does not exist
      }
      else {
          console.log('Some other error: ', err.code);
      }
    });
  });
};
 // check for the config file
configStats()
.then(function(configStatsRes) {
  if (!configStatsRes) {
    console.log(chalk`  {red {bold ℹ} Config NOT Found...}{grey Copy from /_config.config.json.example and fill out}`);
  }
  else {
    console.log(chalk`{green Config File found!!}`);
  }
  const config = require('./_config/config.json');
  console.log(chalk`{cyan Bot Details from COnfig FIle}
 {blue {cyan {bold ℹ}} bot_name: {grey ${config.bot_details.bot_name}}}
 {blue {cyan {bold ℹ}} bot_url: {grey ${config.bot_details.bot_url}}}
 {blue {cyan {bold ℹ}} bot_donationAddress: {grey ${config.bot_details.bot_donationAddress}}}
{cyan Wallet Details}
 {blue {cyan {bold ℹ}} tx_fee: {grey ${config.wallet.tx_fee}}}
 {blue {cyan {bold ℹ}} hold_address: {grey ${config.wallet.hold_address}}}
{cyan TipBot Database Details}
 {blue {cyan {bold ℹ}} db_name: {grey ${config.database.db_name}}}
 {blue {cyan {bold ℹ}} db_host: {grey ${config.database.db_host}}}
 {blue {cyan {bold ℹ}} db_user: {grey ${config.database.db_user}}}
 {blue {cyan {bold ℹ}} db_port: {grey ${config.database.db_port}}}
{cyan Discord Bot Details}
 {blue {cyan {bold ℹ}} prefix: {grey ${config.discord.prefix}}}
 {blue {cyan {bold ℹ}} bot_admin: {grey ${config.discord.bot_admin}}}  
{cyan Faucet Details}
 {blue {cyan {bold ℹ}} faucet_wallet_pub: {grey ${config.faucet.faucet_wallet_pub}}}
 {blue {cyan {bold ℹ}} payout_interval: {grey ${config.faucet.payout_interval}}}  
 {blue {cyan {bold ℹ}} min_payout: {grey ${config.faucet.min_payout}}}  
 {blue {cyan {bold ℹ}} max_payout: {grey ${config.faucet.max_payout}}}`);
// database connection info found in the config file
  const callmysql = mysql.createConnection({
    host: `${config.database.db_host}`,
    user: `${config.database.db_user}`,
    password: `${config.database.db_pass}`,
    database: `${config.database.db_name}`,
  });
  const BotWalPubQuery = function() {
    return new Promise(function(resolve, reject) {
      callmysql.query(
        'select wallets.wallet_pub AS wallet_pub from wallets where user_id=1',
        function(err, rows) {
          if(rows === undefined) {
            reject(new Error('Error rows is undefined'));
          }
          else {
            resolve(rows);
          }
        }
      );
      callmysql.end();
    });
  };
  const FaucetCheckReq = function() {
    return new Promise(function(resolve, reject) {
      listAddresses().then(function(addresses) {
        const addressArray = JSON.parse(JSON.stringify(addresses));
        // sconsole.log('faucet wallet pub check: ' + addressArray.indexOf(config.faucet.faucet_wallet_pub));
        const faucetPubCheck = addressArray.indexOf(config.faucet.faucet_wallet_pub);
        if (faucetPubCheck === -1) {
          reject(new Error('faucet address not found in wallets.json'));
        }
        else {
          const faucetAddyFound = true;
          resolve(faucetAddyFound);
        }
      });
    });
  };
  const HoldCheckReq = function() {
    return new Promise(function(resolve, reject) {
      listAddresses().then(function(addresses) {
        const addressArray = JSON.parse(JSON.stringify(addresses));
        // sconsole.log('faucet wallet pub check: ' + addressArray.indexOf(config.faucet.faucet_wallet_pub));
        const HoldPubCheck = addressArray.indexOf(config.wallet.hold_address);
        if (HoldPubCheck === -1) {
          reject(new Error('Hold address not found in wallets.json'));
        }
        else {
          const HoldPubFound = true;
          resolve(HoldPubFound);
          console.log(chalk`  {blue {cyan {bold ℹ}} Hold Address Set Correct!}`);
        }
      });
    });
  };
  BotWalPubQuery()
  .then(function(WalPubQueryresults) {
    // the query should find the same address in the config.bot_details.bot_donationAddress
    // console.log(JSON.stringify(WalPubQueryresults));
    console.log(chalk`{green Database Connected!!}`);
    const bot_wallet_pub = WalPubQueryresults[0].wallet_pub;
    if (bot_wallet_pub !== config.bot_details.bot_donationAddress) {
      console.log(chalk`  {red {bold ℹ} Bot Address and config address don't match... }{grey ensure the bot is user 1 in the database and has the same address as the bot_donationAddress}`);
      // return;
    }
    else {
      console.log(chalk`  {blue {cyan {bold ℹ}} Bot Address Set Correct!}`);
    }
    // query the list of addresses and make sure both faucet and hold address exist in the list
    FaucetCheckReq()
    .then(function(FaucetCheckReqRes) {
      // console.log('FaucetCheckReqRes: ' + FaucetCheckReqRes);
      if (!FaucetCheckReqRes) {
        console.log(chalk`  {red {bold ℹ} Failed to find the config.faucet.faucet_wallet_pub address you have set in the config.json in the walletd.json file... }{grey This address must exist in the walletd.json!!}`);
      }
      else {
        console.log(chalk`  {blue {cyan {bold ℹ}} Faucet Address Set Correct!}`);
      }
      // check the hold address
      HoldCheckReq()
      .then(function(HoldCheckReqRes) {
        if (!HoldCheckReqRes) {
          console.log(chalk`  {red {bold ℹ} Failed to find the config.wallet.hold_address you have set in the config.json in the walletd.json file... }{grey This address must exist in the walletd.json!!}`);
        }
        else {
          console.log(chalk`  {blue {cyan {bold ℹ}} Hold Address Set Correct!}`);
        }
        // check QRL Node
        const homeDir = require('os').homedir();
        // console.log(homeDir);
        fs.access(homeDir + '/.qrl/qrl.log', error => {
          if (error) {
            console.log(chalk`  {red {bold ℹ} QRL Dir NOT Found...}{grey Copy from /_config.config.json.example and fill out}`);
            return;
          }
        });
        console.log(chalk`{green {cyan {bold ℹ}} QRL Dir Found!!}`);
        /*
        Spawn bots here.
      Functions for each bot here. Using the healthcheck script add checks here to run for each bot
      Give output like
        console.log(chalk`  {blue {cyan {bold ℹ}} Discord Bot Started!}
        {blue {cyan {bold ℹ}} Discord Bot PID: {grey ${spawnDiscord.pid}}}`);
        */
        function spawnDiscordBot() {
          const service = 'discord';
          const out = fs.openSync('./' + service + '_bot.log', 'a');
          const err = fs.openSync('./' + service + '_bot.log', 'a');
          const spawnDiscord = spawn('./_scripts/discord/index.js', {
            detached: true,
            stdio: [ 'ignore', out, err ],
          });
          spawnDiscord.on('error', (err) => {
            console.error(chalk.red(' ! ') + chalk.bgRed(' Failed to start Discord Bot.' + err));
          });
          spawnDiscord.unref();
          // console.log('PID: ' + spawnDiscord.pid);
          console.log(chalk`  {blue {cyan {bold ℹ}} Discord Bot Started!}
          {blue {cyan {bold ℹ}} Discord Bot PID: {red ${spawnDiscord.pid}}}`);
        }

        //
        //
        //
        //
        //
        // spawn all bots here into background processes
        //
        //
        //
        //
        spawnDiscordBot();
        console.log(chalk`  {blue {cyan {bold ℹ}} Checks Complete... {cyan All Services started}}`);
      });
    });
  });
});