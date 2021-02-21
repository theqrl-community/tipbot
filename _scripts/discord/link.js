/*
Link social accounts

Issue this script to link a social media account to this discord account.

User requests linking giving
service to link, indivigual username

bot generates a hash and passes the user the salt to send from new account
if it matches from new account and username is right assume its the user and connect in DB

command flow - 
  check if discord user has account
    if so check if alt_service username is found in $service_users database
      if so is $user_salt given
        if so and matches connect services users, merge the younger user into the older, sending funds and modifying the database as needed so the user can share balance on both
        if not fail with instructions
      if not GENERATE $link_salt and $hash with the user key, send the user the salt and save the salted hash. wait for verification or expiration
    if not check if alt account exists
      if so did they pass the salt? is the link request in the database?
        if so and salt matches, link $service_users in database linking accounts to the same wallet
        if not fail with instructions
      if not fail and ask user to sign up from one of the accounts



*/

module.exports = {
  name: 'link',
  description: 'Link Social Accounts',
  args: false,
  aliases: ['connect', 'pair', 'join', 'combine' ],
  guildOnly: false,
  usage: '{*alias*: connect || pair || join || combine }\nLink various social media account to the same address in the tipbot',

  execute(message, args) {
    // const config = require('../../../_config/config.json');


  },
};