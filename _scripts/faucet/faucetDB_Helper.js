'use strict';
const mysql = require('mysql');
const config = require('../../_config/config.json');
// const wallet = require('../qrl/walletTools');

// connector to the database
// const callmysqlFaucet = mysql.createPool({
  // connectionLimit: 10,
  // host: `${config.faucet_db.db_host}`,
  // user: `${config.faucet_db.db_user}`,
  // password: `${config.faucet_db.db_pass}`,
  // database: `${config.faucet_db.db_name}`,
// });

const callmysqlTipBot = mysql.createPool({
  connectionLimit: 10,
  host: `${config.database.db_host}`,
  user: `${config.database.db_user}`,
  password: `${config.database.db_pass}`,
  database: `${config.database.db_name}`,
});

async function Drip(args) {
  return new Promise(resolve => {
  const resultsArray = [];
  // send a payment request to the faucet for users address.
  // expects { service: service, user_id: user_id, drip_amt: drip_amt }
  if (args == null) {
    // console.log('No args given to DRIP:');
    return;
  }
  // console.log('args into Drip function: ' + JSON.stringify(args));

  // INSERT INTO faucet_payouts(user_id, service, drip_amt, updated_at, time_stamp)   VALUES(1, 'discord', .002, NOW(), NOW());
  const user_id = args.user_id;
  const service = args.service;
  const drip_amt = args.drip_amt;
  const faucet_usersValues = [ [ user_id, service, drip_amt, new Date(), new Date()]];
  const addTo_faucet_payments = 'INSERT INTO faucet_payouts(user_id, service, drip_amt, updated_at, time_stamp) VALUES ?';
  callmysqlTipBot.query(addTo_faucet_payments, [faucet_usersValues], function(err, result) {
      if (err) {
        console.log('[mysql error]', err);
        resultsArray.push({ error: err });
        resolve(resultsArray);
      }
      // console.log('result from sql entry: ' + JSON.stringify(result));
      resultsArray.push(result);
      resolve(resultsArray);
    });
  });
}

async function checkPayments(args) {
  // expect { service: 'discord, service_id: service_id }
  return new Promise(resolve => {
    // check the faucet_oayments db for the last time user recieved a tip, if ever.
    // check to curent time and if less than config.faucet.payout_interval no tip...
    // set all results to an array to respond to user.
    const checkPaymentsArray = [];
    const service_id = args.service_id;
    const service = args.service;
    // search for user mentionend in the last config.faucer.payout_interval time. set in the config file
    const FaucetSearch = 'SELECT faucet_payouts.* FROM faucet_payouts, ' + service + '_users, users WHERE users.' + service + '_user_id = ' + service + '_users.id AND users.id = faucet_payouts.user_id AND ' + service + '_users.' + service + '_id = "' + service_id + '" AND faucet_payouts.time_stamp >= NOW() - INTERVAL ' + config.faucet.payout_interval + ' MINUTE';
    // console.log('FaucerSearch' + FaucetSearch);
    callmysqlTipBot.query(FaucetSearch, function(err, faucet_result) {
      if (err) {
        console.log('[mysql error]', err);
      }
      // console.log('fauces_result: ' + JSON.stringify(faucet_result));
      // console.log('faucet_result.length: ' + faucet_result.length);

      if (!faucet_result.length) {
        // console.log('empty results');
        checkPaymentsArray.push({ drip_found: false });
        resolve(checkPaymentsArray);
        return;
      }
      // drip found in db for user
      checkPaymentsArray.push({ drip_found: true });
      checkPaymentsArray.push(faucet_result);
      // console.log('found checkPaymentsArray: ' + JSON.stringify(checkPaymentsArray));
      // returns for found { drip_found, drip_service, last_drip_amt, request_date, paid, tx_hash, paid_date }
      // returns for not found { drip_found }
      resolve(checkPaymentsArray);
    });
  });
}


module.exports = {
  Drip : Drip,
  checkPayments: checkPayments,
};
//
/*
INSERT INTO faucet_payouts('user_id, service, drip_amt, updated_at, time_stamp)
  VALUES(1, 'discord', .002, NOW(), NOW());

SELECT * FROM faucet_payouts WHERE user_id="1";


SELECT faucet_payouts.* FROM faucet_payouts, discord_users, users WHERE users.discord_user_id = discord_users.id AND users.id = faucet_payouts.user_id AND discord_users.discord_id = "@328611434177101835";


*/