'use strict';
const mysql = require('mysql');
const chalk = require('chalk');
const config = require('../../_config/config.json');

console.log(chalk.cyan('\nCreate All Databases Called') + chalk.grey('./_scripts/db/dbCreate.js\n'));
// connector to the database
const callmysql = mysql.createConnection({
  host: `${config.database.db_host}`,
  user: `${config.database.db_user}`,
  password: `${config.database.db_pass}`,
  database: `${config.database.db_name}`,
});
console.log(`database info
  DB Host: ${config.database.db_host}
  DB User: ${config.database.db_user}
  DB Pass: ${config.database.db_pass}
  DB Name: ${config.database.db_name}
  `);

// connect to the MySQL server
callmysql.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
  // create `users` table to store various user account data
  const createUsers = `create table if not exists users(
                          id int primary key auto_increment,
                          discord_user_id int,
                          keybase_user_id int, 
                          github_user_id int, 
                          reddit_user_id int, 
                          trello_user_id int, 
                          twitter_user_id int,
                          slack_user_id int,
                          telegram_user_id int,
                          whatsapp_user_id int,
                          time_stamp DATETIME not null,
                          updated_at DATETIME not null
                      )`;
  callmysql.query(createUsers, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createUsers results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createUsers results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createUsers...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });
  // create `users_info` table to store various user account data
  const createUsersInfo = `create table if not exists users_info(
                          id int primary key auto_increment,
                          user_id int not null,
                          user_key varchar(255) not null,
                          user_auto_created BOOLEAN,
                          auto_create_date varchar(255),
                          signed_up_from ENUM('discord', 'keybase', 'github', 'reddit', 'trello', 'twitter', 'slack', 'telegram', 'whatsapp'),
                          signup_date DATETIME,
                          opt_out BOOLEAN default 0,
                          optout_date DATETIME,
                          banned BOOLEAN default 0,
                          banned_date DATETIME,
                          updated_at DATETIME not null

                      )`;
  callmysql.query(createUsersInfo, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createUsersInfo results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createUsersInfo results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createUsersInfo...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });
  // Create the 'discord_users' table to store to users info from Discord
  const createDiscordUsers = `create table if not exists discord_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               discord_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createDiscordUsers, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createDiscordUsers results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createDiscordUsers results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createDiscordUsers...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });



  // Create the 'discord_users' table to store to users info from Discord
  const createDiscordLink = `create table if not exists discord_link(
                               id int primary key auto_increment,
                               user_id int not null,
                               service ENUM('keybase', 'github', 'reddit', 'trello', 'twitter', 'slack', 'telegram', 'whatsapp'),
                               service_uuid varchar(255) not null,
                               generated_key varchar(255) not null,
                               validated BOOLEAN default 0,
                               expired BOOLEAN default 0,
                               link_time_stamp DATETIME not null,
                               valid_time_stamp DATETIME,
                               expired_time_stamp DATETIME 
                             )`;
  callmysql.query(createDiscordLink, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createDiscordLink results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createDiscordLink results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createDiscordLink...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });



  // Create the 'twitter_users' table to store to users info from Twitter
  const createTwitterUsers = `create table if not exists twitter_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               twitter_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createTwitterUsers, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createTwitterUsers results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createTwitterUsers results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createTwitterUsers...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });
  // Create the 'reddit_users' table to store to users info from Twitter
  const createRedditUsers = `create table if not exists reddit_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               reddit_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createRedditUsers, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createRedditUsers results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createRedditUsers results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createRedditUsers...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });
  // Create the 'keybase_users' table to store to users info from Twitter
  const createKeybaseUsers = `create table if not exists keybase_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               keybase_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createKeybaseUsers, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createKeybaseUsers results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createKeybaseUsers results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createKeybaseUsers...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });
  // Create the 'github_users' table to store to users info from Twitter
  const createGithubUsers = `create table if not exists github_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               github_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createGithubUsers, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createGithubUsers results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createGithubUsers results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createGithubUsers...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });
  // Create the 'trello_users' table to store to users info from Twitter
  const createTrelloUsers = `create table if not exists trello_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               trello_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createTrelloUsers, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createTrelloUsers results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createTrelloUsers results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createTrelloUsers...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });
  // Create the 'slack_users' table to store to users info from Twitter
  const createSlackUsers = `create table if not exists slack_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               slack_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createSlackUsers, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createSlackUsers results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createSlackUsers results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createSlackUsers...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });
  // Create the 'slack_users' table to store to users info from Twitter
  const createTelegramUsers = `create table if not exists telegram_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               telegram_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createTelegramUsers, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createTelegramUsers results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createTelegramUsers results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createTelegramUsers...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });
  // Create the 'whatsapp_users' table to store to users info from Twitter
  const createWhatsAppUsers = `create table if not exists whatsapp_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               whatsap_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createWhatsAppUsers, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createWhatsAppUsers results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createWhatsAppUsers results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createWhatsAppUsers...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });

  // create `wallet` table to store user wallet info
  const createWallets = `create table if not exists wallets(
                          id int primary key auto_increment,
                          user_id int not null,
                          wallet_pub varchar(80) not null,
                          wallet_bal DECIMAL(24,9) not null default 0,
                          wallet_qr blob,
                          retired BOOLEAN default 0,
                          retired_time_stamp DATETIME,
                          time_stamp DATETIME not null,
                          updated_at DATETIME not null
                        )`;
  callmysql.query(createWallets, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createWallets results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createWallets results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createWallets...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });
  // create the `tips` table to hold all info from a tip event
  const createTips = `create table if not exists tips(
                              id int primary key auto_increment,
                              from_user_id varchar(255) not null,
                              tip_amount DECIMAL(24,9) not null,
                              from_service ENUM('discord', 'keybase', 'github', 'reddit', 'trello', 'twitter', 'slack', 'telegram', 'whatsapp'),
                              time_stamp DATETIME not null
                      )`;
  callmysql.query(createTips, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createTips results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createTips results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createTips...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });
  // create the `tips` table to hold all info from a tip event
  const createFutureTips = `create table if not exists future_tips(
                              id int primary key auto_increment,
                              service ENUM('discord', 'keybase', 'github', 'reddit', 'trello', 'twitter', 'slack', 'telegram', 'whatsapp'),
                              service_id varchar(255),
                              user_id int,
                              user_name varchar(255) not null,
                              tip_id int,
                              tip_from varchar(255) not null,
                              tip_amount DECIMAL(24,9) not null,
                              tip_paidout BOOLEAN default 0,
                              tip_donated BOOLEAN default 0,
                              donated_time_stamp DATETIME,
                              time_stamp DATETIME not null
                      )`;
  callmysql.query(createFutureTips, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createFutureTips results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createFutureTips results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createFutureTips...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });
  // Create the 'tips_to' table to store to users info from Twitter
  const createTipsTo = `create table if not exists tips_to(
                        id int primary key auto_increment,
                        tip_id int,
                        user_id varchar(255) not null,
                        from_user_id int not null,
                        future_tip_id int,
                        tip_amt DECIMAL(24,9) not null,
                        time_stamp DATETIME not null
                      )`;
  callmysql.query(createTipsTo, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createTipsTo results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createTipsTo results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('createTipsTo else happened with createTipsTo...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });
  // Create the 'transactions' table to store to users info from Twitter
  const createTransactions = `create table if not exists transactions(
                                id int primary key auto_increment,
                                tip_id int not null,
                                tx_type ENUM('faucet', 'tip', 'withdraw'),
                                tx_hash varchar(255) not null,
                                pending BOOLEAN default 1 not null,
                                time_stamp DATETIME not null
                             )`;


  callmysql.query(createTransactions, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createTransactions results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createTransactions results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createTransactions...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });

// Create the 'user_agree' table to store to users info from Twitter
const createUserAgree = `create table if not exists users_agree(
                          id int primary key auto_increment,
                          user_id int not null,
                          agree BOOLEAN not null,
                          service ENUM('discord', 'keybase', 'github', 'reddit', 'trello', 'twitter', 'slack', 'telegram', 'whatsapp'),
                          time_stamp DATETIME not null
                          )`;
  callmysql.query(createUserAgree, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createUserAgree results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createUserAgree results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createUserAgree...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });
    // Create the 'withdrawls' table to store to users info from Twitter
  const createWithdrawls = `create table if not exists withdrawls(
                                id int primary key auto_increment,
                                user_id int not null,
                                tx_hash varchar(255) not null,
                                service ENUM('discord', 'keybase', 'github', 'reddit', 'trello', 'twitter', 'slack', 'telegram', 'whatsapp'),
                                to_address varchar(80) not null,
                                amt DECIMAL(24,9) not null,
                                time_stamp DATETIME not null
                             )`;


  callmysql.query(createWithdrawls, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createWithdrawls results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createWithdrawls results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createWithdrawls...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });
  // Create the 'fauccet_payouts' table to store to users info from Twitter
    const createFaucetPayouts = `create table if not exists faucet_payouts(
                                id int primary key auto_increment,
                                user_id int not null,
                                service ENUM('discord', 'keybase', 'github', 'reddit', 'trello', 'twitter', 'slack', 'telegram', 'whatsapp'),
                                drip_amt DECIMAL(24,9) not null,
                                paid BOOLEAN default 0,
                                tx_hash varchar(255), 
                                updated_at DATETIME not null,
                                time_stamp DATETIME not null
                             )`;


  callmysql.query(createFaucetPayouts, function(err, results) {
    if (err) {
      console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
    // log the output of sql command
    if (results.warningCount == '0') {
      console.log(chalk.cyan(' ✔ ') + chalk.blue(' createFaucetPayouts results: ') + chalk.green(' SQL Table created!'));
    }
    else if (results.warningCount == '1') {
      console.log(chalk.yellow(' ⚠ ') + chalk.blue(' createFaucetPayouts results: ') + chalk.grey(' Table exists'));
    }
    else {
      console.log(chalk.red('! ') + chalk.bgRed('Something else happened with createFaucetPayouts...') + chalk.grey(' SQL warningCount: ' + results.warningCount));
    }
  });

  // close the sql connection
  callmysql.end(function(err) {
    if (err) {
      return console.log(chalk.red('! ') + chalk.bgRed(err.message));
    }
  });
});