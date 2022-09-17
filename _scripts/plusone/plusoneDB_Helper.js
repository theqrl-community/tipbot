'use strict';
const mysql = require('mysql');
const config = require('../../_config/config.json');
const wallet = require('../qrl/walletTools');
const faucet = require('../faucet/faucetDB_Helper.js');
const faucetDrip = faucet.Drip;
// connector to the database
const callmysql = mysql.createPool({
  connectionLimit: 10,
  host: `${config.database.db_host}`,
  user: `${config.database.db_user}`,
  password: `${config.database.db_pass}`,
  database: `${config.database.db_name}`,
});




// //////////////////////////////////
function toQuanta(number) {
  const shor = 1000000000;
  return number / shor;
}
function toShor(number) {
  const shor = 1000000000;
  return number * shor;
}
// ///////////////////////////////////

async function CountPlusOneSignup() {
  return new Promise(resolve => {
    const resultsArray = [];
    const count_stats = 'SHOW INDEXES FROM plusone WHERE Key_Name="PRIMARY"';
    callmysql.query(count_stats, function(err, result) {
      if (err) {
        console.log('[mysql error]', err);
        resultsArray.push({ error: err });
        resolve(resultsArray);
      }
      
      resultsArray.push(result[0].Cardinality);
      resolve(resultsArray);
    });
  });
}


async function CheckPlusOne(args) {
  /*
  Check if the user is in PlusOne table
  We expect to receive data about the service requesting { discord || twitter } and the user ID from that service as expected in the DB
  i.e.: { service: 'discord', user_id: userID }
  returns: 
  true: { plusone_found: 'true', user_id: id, paid: paid, key: key, hash: hash, updated_at: update, time_stamp: ts }
  false: { plusone_found: 'false' };
  */
  return new Promise(resolve => {
    if (args !== null) {
      // args passed, check for the service used
      const input = JSON.parse(JSON.stringify(args));
      const service = input.service;
      const input_user_id = input.user_id;
      const searchDB = 'SELECT plusone.user_id, plusone.service, plusone.one_paid, plusone.one_key, plusone.tx_hash, plusone.updated_at, plusone.time_stamp FROM plusone WHERE plusone.user_id = "' + input_user_id + '"';

      callmysql.query(searchDB, function(err, result) {
        if (err) {
          console.log('[mysql error]', err);
        }
        if (result.length) {
          if (result) {
            const id = result[0].user_id;
            const service = result[0].service;
            const paid = result[0].one_paid;
            const key = result[0].one_key;
            const hash = result[0].tx_hash;
            const update = result[0].updated_at;            
            const ts = result[0].time_stamp;

            // assign results to json and pass to return
            const searchResult = { plusone_found: 'true', user_id: id, paid: paid, key: key, hash: hash, updated_at: update, time_stamp: ts };
              const Results = JSON.parse(JSON.stringify(searchResult));
              resolve(Results);
              return Results;
          }
  
        }
        else {
          const searchResult = { plusone_found: 'false' };
          const Results = JSON.parse(JSON.stringify(searchResult));
          resolve(Results);
          return Results;
        }
      });
    }
  });
}



async function InsertPlusOne(args) {
  // Add user to the plusone table 
  // send a request to the plusone promotion for payout.
  return new Promise(resolve => {
    const resultsArray = [];
    // expects { service: service, user_id: user_id, one_key: key, one_amt: 1 }
    if (args == null) {
      return;
    }
    const user_id = args.user_id;
    const service = args.service;
    const one_key = args.one_key;
    const one_amt = args.one_amt;
    let date = '';
    if (args.date) {
      date = args.date;
    }
    else {
      date = new Date();
    }
    const plusone_usersValues = [[ user_id, service, one_key, one_amt, new Date(), date]];
    const addTo_plusone = 'INSERT INTO plusone(user_id, service, one_key, one_amt, updated_at, time_stamp) VALUES ?';
    callmysql.query(addTo_plusone, [plusone_usersValues], function(err, result) {
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

async function UpdatePlusOne(args) {
  // Update after transaction is paid out with tx_hash
  // expects { user_id: user_id, tx_hash: hash }
  return new Promise(resolve => {
    const resultsArray = [];
    if (args == null) {
      return;
    }
    callmysql.query('UPDATE plusone SET paid = ?, one_amt = ?, tx_hash = ?, updated_at = ? WHERE user_id = ?', [ 1, 1, args.tx_hash, new Date(), args.user_id], function(err) {
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



async function UpdatePlusOneKey(args) {
  // update the key hash when called. Used when user requests a new key
  // expects: { user_id: user_id, one_key: key }
  return new Promise(resolve => {
    const updateKey_plusone = 'UPDATE plusone SET one_key = ' + args.one_key + ' WHERE user_id = "' + args.user_id + '"';
    callmysql.query(updateKey_plusone, function(err, result) {
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




//// expects { service: service, service_id: service_id }
//// returns { user_found, wallet_pub, wallet_bal, user_id, user_name, opt_out optout_date
//async function GetAllUserInfo(args) {
//  return new Promise(resolve => {
//    const input = JSON.parse(JSON.stringify(args));
//    const service_id = input.service_id;
//    const service = input.service;
//    // eslint-disable-next-line
//    let foundResArray = [];
//    let has_user_found = false;
//    let has_user_agree = false;
//    let has_opt_out = false;
//    // get all users_info data here...
//
//    const getAllInfoSearch = 'SELECT wallets.wallet_pub AS wallet_pub, wallets.wallet_bal AS wallet_bal, users.id AS user_id, ' + service + '_users.user_name AS user_name, users_info.opt_out AS opt_out, users_info.optout_date AS optout_date, users_agree.agree AS agree, users_info.banned AS banned, users_info.banned_date AS banned_date FROM wallets, users, ' + service + '_users, users_info, users_agree WHERE users.id = wallets.user_id AND users.' + service + '_user_id = ' + service + '_users.id AND users.id = users_info.user_id AND ' + service + '_users.' + service + '_id = "' + service_id + '" AND users.id = users_agree.user_id AND wallets.retired = "0"';
//
////  SELECT wallets.wallet_pub AS wallet_pub, \
////    wallets.wallet_bal AS wallet_bal, 
////    users.id AS user_id, \
////    discord_users.user_name AS user_name, \
////    users_info.opt_out AS opt_out, \
////    users_info.optout_date AS optout_date, \
////    users_agree.agree AS agree, \
////    users_info.banned AS banned, \
////    users_info.banned_date AS banned_date \
////  FROM wallets, users, discord_users, users_info, users_agree, plusone\
////  WHERE users.id = wallets.user_id AND \
////    users.discord_user_id = discord_users.id AND \
////    users.id = users_info.user_id AND \
////    discord_users.discord_id = "' + service_id + '" AND \
////    users.id = users_agree.user_id AND \
////    wallets.retired = "0"'
//
//    callmysql.query(getAllInfoSearch, function(err, user_info) {
//      if (err) {
//        console.log('[mysql error]', err);
//      }
//      // check for user, if length is 0 they are not found
//      if(user_info.length > 0) {
//        has_user_found = true;
//      }
//      else {
//        // user not found. Exit and return array
//        foundResArray.push({ user_found: has_user_found, user_agree: has_user_agree, opt_out: has_opt_out });
//        resolve(foundResArray);
//        return;
//      }
//      // user found, set user variables
//      const user_agree = user_info[0].agree;
//      const user_id = user_info[0].user_id;
//      const opt_out = user_info[0].opt_out;
//      const user_name = user_info[0].user_name;
//      const optout_date = user_info[0].optout_date;
//      const wallet_pub = user_info[0].wallet_pub;
//      const U_id = user_info[0].user_id;
//      const banned = user_info[0].banned;
//      const banned_date = user_info[0].banned_date;
//      if(opt_out) {
//        has_opt_out = true;
//      }
//      // chck if user has already agreed
//      if (user_agree) {
//        has_user_agree = true;
//      }
//      if (has_opt_out || !user_agree) {
//        // user opted out or is not found in DB. Return values
//        foundResArray.push({ user_found: has_user_found, user_agree: has_user_agree, opt_out: has_opt_out, wallet_pub: wallet_pub, user_id: U_id, user_name: user_name, optout_date: optout_date, banned: banned, banned_date: banned_date });
//        resolve(foundResArray);
//        return;
//      }
//      CheckPendingTx({ user_id: user_id }).then(function(pendingBal) {
//        // update the balance in the wallet database and refresh info
//        GetUserWalletBal({ user_id: user_id }).then(function(balance) {
//          // check for pending tx's
//          const wallet_bal = balance.wallet_bal;
//          foundResArray.push({ user_found: has_user_found, user_agree: has_user_agree, opt_out: has_opt_out, wallet_pub: wallet_pub, wallet_bal: wallet_bal, user_id: U_id, user_name: user_name, optout_date: optout_date, pending: pendingBal });
//          resolve(foundResArray);
//          return foundResArray;
//        });
//      });
//    });
//  });
//}

module.exports = {
  CountPlusOneSignup: CountPlusOneSignup,
  CheckPlusOne: CheckPlusOne,
  InsertPlusOne: InsertPlusOne,
  UpdatePlusOne: UpdatePlusOne,
  UpdatePlusOneKey: UpdatePlusOneKey
}