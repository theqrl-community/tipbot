'use strict';
const mysql = require('mysql');
const config = require('../../_config/config.json');

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
      return;
    }
    const user_id = args.user_id;
    const service = args.service;
    const drip_amt = args.drip_amt;
    let date = '';
    if (args.date) {
      date = args.date;
    }
    else {
      date = new Date();
    }

    const faucet_usersValues = [ [ user_id, service, drip_amt, new Date(), date]];

    const addTo_faucet_payments = 'INSERT INTO faucet_payouts(user_id, service, drip_amt, updated_at, time_stamp) VALUES ?';
    callmysqlTipBot.query(addTo_faucet_payments, [faucet_usersValues], function(err, result) {
      if (err) {
        console.log('[mysql error]', err);
        resultsArray.push({ error: err });
        resolve(resultsArray);
      }
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
    // console.log(`FaucetSearch: ${FaucetSearch}`);
    callmysqlTipBot.query(FaucetSearch, function(err, faucet_result) {
      if (err) {
        console.log('[mysql error]', err);
      }
      if (!faucet_result.length) {
        checkPaymentsArray.push({ drip_found: false });
        resolve(checkPaymentsArray);
        return;
      }
      // drip found in db for user Don't pay them.
      checkPaymentsArray.push({ drip_found: true, faucet_result });
      // returns for found { drip_found: true }
      // checkPaymentsArray.push(faucet_result);
      // returns for found { drip_found, drip_service, last_drip_amt, request_date, paid, tx_hash, paid_date }
      resolve(checkPaymentsArray);
    });
  });
}

async function lastDrip(args) {
  // expect { service: 'discord, service_id: service_id }
  return new Promise(resolve => {
    // check the faucet_oayments db for the last time user recieved a tip, if ever.
    // set all results to an array to respond to user.
    const lastDripArray = [];
    const service_id = args.service_id;
    const service = args.service;
    const FaucetSearch = 'SELECT faucet_payouts.* FROM faucet_payouts, ' + service + '_users, users WHERE users.' + service + '_user_id = ' + service + '_users.id AND users.id = faucet_payouts.user_id AND ' + service + '_users.' + service + '_id = "' + service_id + '" LIMIT 1';
    // console.log(`FaucetSearch: ${FaucetSearch}`);
    callmysqlTipBot.query(FaucetSearch, function(err, faucet_result) {
      if (err) {
        console.log('[mysql error]', err);
      }
      if (!faucet_result.length) {
        lastDripArray.push({ drip_found: false });
        resolve(lastDripArray);
      }
      // drip found in db
      lastDripArray.push({ drip_found: true, faucet_result });
      resolve(lastDripArray);
    });
  });
}


async function allDrips(args) {
  // expect { service: 'discord, service_id: service_id }
  return new Promise(resolve => {
    // check the faucet_oayments db for the last time user recieved a tip, if ever.
    // set all results to an array to respond to user.
    const lastDripArray = [];
    const service_id = args.service_id;
    const service = args.service;
    const FaucetSearch = 'SELECT faucet_payouts.* FROM faucet_payouts, ' + service + '_users, users WHERE users.' + service + '_user_id = ' + service + '_users.id AND users.id = faucet_payouts.user_id AND ' + service + '_users.' + service + '_id = "' + service_id + '"';
    // console.log(`FaucetSearch: ${FaucetSearch}`);
    callmysqlTipBot.query(FaucetSearch, function(err, faucet_result) {
      if (err) {
        console.log('[mysql error]', err);
      }
      if (!faucet_result.length) {
        lastDripArray.push({ drip_found: false });
        resolve(lastDripArray);
      }
      // drip found in db
      lastDripArray.push({ drip_found: true });
      // returns for found { drip_found: true }
      lastDripArray.push(faucet_result);
      // returns for all found { drip_found, drip_service, last_drip_amt, request_date, paid, tx_hash, paid_date }
      resolve(lastDripArray);
    });
  });
}

async function totalPaid(args) {
  // expect { service: 'discord, service_id: service_id }
  return new Promise(resolve => {
    // check the faucet_oayments db for the last time user recieved a tip, if ever.
    // set all results to an array to respond to user.
    const array = [];
    const service_id = args.service_id;
    const service = args.service;
    const FaucetSearch = 'SELECT sum(drip_amt) FROM faucet_payouts, ' + service + '_users, users WHERE ' + service + '_users.' + service + '_id = "' + service_id + '" AND ' + service + '_users.id = users.' + service + '_user_id AND faucet_payouts.user_id = users.id';
    // console.log(`FaucetSearch: ${FaucetSearch}`);
    callmysqlTipBot.query(FaucetSearch, function(err, result) {
      if (err) {
        console.log('[mysql error]', err);
      }
      const faucetTotal = result;

      const FaucetSearchTotal = 'SELECT count(*) FROM faucet_payouts, ' + service + '_users, users WHERE ' + service + '_users.' + service + '_id = "' + service_id + '" AND ' + service + '_users.id = users.' + service + '_user_id AND faucet_payouts.user_id = users.id';

      callmysqlTipBot.query(FaucetSearchTotal, function(err, total) {
        if (err) {
          console.log('[mysql error]', err);
        }
        array.push(total, faucetTotal);

        resolve(array);
      });
    });
  });
}

module.exports = {
  Drip : Drip,
  checkPayments : checkPayments,
  lastDrip : lastDrip,
  allDrips : allDrips,
  totalPaid : totalPaid,
};