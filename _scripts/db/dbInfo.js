'use strict';
const mysql = require('mysql');
const config = require('../../_config/config.json');
const wallet = require('../qrl/walletTools');

function toQuanta(number) {
  const shor = 1000000000;
  return number / shor;
}
function toShor(number) {
  const shor = 1000000000;
  return number * shor;
}


// connector to the database
const callmysql = mysql.createPool({
  connectionLimit: 10,
  host: `${config.database.db_host}`,
  user: `${config.database.db_user}`,
  password: `${config.database.db_pass}`,
  database: `${config.database.db_name}`,
});

async function updateWalletBal(args) {
  // expects { user_id: user_id, new_bal: new_bal }
  // get the balance from the node and send here
  const wallet_bal = args.new_bal;
  callmysql.query('UPDATE wallets SET wallet_bal = ?, updated_at = ? WHERE user_id = ?', [wallet_bal, new Date(), args.user_id], function(err, result) {
    if (err) {
      console.log('[mysql error]', err);
    }
    return result;
  });
}

async function GetUserWalletBal(args) {
  // GetUserBal
  // expcts { user_id: user_id }
  // returns { wallet_bal: 100.000 }
  return new Promise(resolve => {
    if (args !== null) {
      // args passed, check for the service used
      const input = JSON.parse(JSON.stringify(args));
      const id = input.user_id;
      const searchDB = 'SELECT wallets.wallet_bal AS wallet_bal, wallets.wallet_pub AS wallet_pub FROM users INNER JOIN wallets ON users.id = wallets.user_id WHERE wallets.user_id = "' + id + '"';
      callmysql.query(searchDB, function(err, result) {
        if (err) {
          console.log('[mysql error]', err);
        }
        const wallet_bal = result[0].wallet_bal;
        const wallet_pub = result[0].wallet_pub;
        // now check the network for ths balance info and compaire.
        const NetBalance = wallet.GetBalance;
        NetBalance(wallet_pub).then(function(NetBal) {
          // should have netBal value from the network now, compare them
          const balance = toQuanta(NetBal.balance);
          const OldBal = toQuanta(wallet_bal);
          // console.log('balance\'s returned. NetBal: ' + JSON.stringify(NetBal) + ' wallet_bal: ' + wallet_bal+ ' balance: ' + balance + ' OldBal: ' + OldBal);
          if (balance != OldBal) {
            // the balances are different, update the DB
            const updateInfo = { user_id: id, new_bal: balance };
            updateWalletBal(updateInfo).then(function(UpdateBalance) {
              return UpdateBalance;
            });
          }
          // const return_bal = balance;
          const return_bal = NetBal.balance;
          const searchResult = { wallet_bal: return_bal };
          const Results = JSON.parse(JSON.stringify(searchResult));
          resolve(Results);
          return Results;
        });
      });
    }
    else {
      console.log('error somewhere');
    }
  });
}

async function tipBotInfo(args) {
  return new Promise(resolve => {
    // get info from database here and return in an array




    const searchDB = 'SELECT wallets.wallet_bal AS wallet_bal, \
    wallets.wallet_pub AS wallet_pub \
    FROM users \
    INNER JOIN wallets \
    ON users.id = wallets.user_id \
    WHERE wallets.user_id = "' + args.id + '"';
    return searchDB;
  });
}


async function getSentTips(args) {
  // from user id get user tip info
  // count of all tips sent, count of all tips recieved, users tipped to & from, total tipped, last 10 tips
  // expect { user_id: 1 , service_user_id: @734267018701701242}
  const array = [];
  const id = args.user_id;
  const sumTipsSent = 'SELECT sum(tip_amount)  FROM users, tips, transactions, tips_to WHERE tips.from_user_id = "' + id + '" AND transactions.tip_id = tips.id AND tips_to.tip_id = tips.id';
  const countTipsSent = 'SELECT count(tip_amount)  FROM users, tips, transactions, tips_to WHERE tips.from_user_id = "' + id + '" AND transactions.tip_id = tips.id AND tips_to.tip_id = tips.id';
  return new Promise(resolve => {

    callmysql.query(sumTipsSent, function(err, sumResult) {
      if (err) {
        console.log('[mysql error]', err);
      }
      callmysql.query(countTipsSent, function(err, countResult) {
        if (err) {
          console.log('[mysql error]', err);
        }
        // push found results to the array and resolve to the call
        array.push({ sum: sumResult, count: countResult });
        resolve(array);
      });
    });
  });
}

async function getReceivedTips(args) {
  // from user id get user tip info
  // count of all tips sent, count of all tips received, users tipped to & from, total tipped, last 10 tips
  // expect { user_id: 1 , service_user_id: @734267018701701242}
  const array = [];
  const id = args.user_id;
  const sumTipsSent = 'SELECT sum(tip_amount)  FROM users, tips, transactions, tips_to WHERE tips.from_user_id = "' + id + '" AND transactions.tip_id = tips.id AND tips_to.tip_id = tips.id';
  const countTipsSent = 'SELECT count(tip_amount)  FROM users, tips, transactions, tips_to WHERE tips.from_user_id = "' + id + '" AND transactions.tip_id = tips.id AND tips_to.tip_id = tips.id';
  return new Promise(resolve => {

    callmysql.query(sumTipsSent, function(err, sumResult) {
      if (err) {
        console.log('[mysql error]', err);
      }
      callmysql.query(countTipsSent, function(err, countResult) {
        if (err) {
          console.log('[mysql error]', err);
        }
        // push found results to the array and resolve to the call
        array.push({ sum: sumResult, count: countResult });
        resolve(array);
      });
    });
  });
}

module.exports = {
  GetUserWalletBal : GetUserWalletBal,
  getSentTips : getSentTips,
  tipBotInfo : tipBotInfo,
  getReceivedTips : getReceivedTips,
};