# Faucet Setup and Configuration

> Give away coins to users who ask. Track the user so double takes are not available and configure amount low enough that it is not worth hacking multiple accounts to pull from the faucet.

Setup the faucet to work with a user from social media. Track the users faucet rewards and drip to the user a limited amount per day. This will allow giving a distributed group a small reward while requiring they participate in the social media channels the bot is deployed to.

## Operation

Bot is listening for the (+drip || +faucet || +free...) command to be sent from a user. 

- Once received the bot will check for users account. 
- If signed up the bot will check for resent faucet withdraws in the `last_drip` table, 
  - if none then add user to the `faucet_payouts` table and last_drip.
- script job watches the table `faucet_payouts` for changes and adds all payees to the TX once every 10 min or whatever.
  - this job changes a boolean from false to true once paid in the faucet_payouts and adds the tx_id to a table..


### Database tracking

There are 2 databases for the faucet

`faucet_requests` `faucet_payouts`

these will track all of the various faucet payments and when the uses last requested.


### Payout Script

script to payout the users on a schedule starts something like

```js
//snip
var minutes = 5, the_interval = minutes * 60 * 1000;
setInterval(function() {
  console.log("check for payout");
  // do your stuff here
  const searchSql = 'SELECT * FROM faucet_payouts WHERE paid 0';
  mysql.query(searchSql, (function (err, result));

}, the_interval);
```