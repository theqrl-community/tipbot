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
  // GetUserBal
  // expcts { user_id: user_id }
  // returns { wallet_bal: 100.000 }
  return new Promise(resolve => {
  	// get info from database here and return in an array
    const searchDB = 'SELECT wallets.wallet_bal AS wallet_bal, wallets.wallet_pub AS wallet_pub FROM users INNER JOIN wallets ON users.id = wallets.user_id WHERE wallets.user_id = "' + id + '"';
    
  });
}




async function getUserTips(args) {
  // from user id get user tip info
  // count of all tips sent, count of all tips recieved, users tipped to & from, total tipped, last 10 tips
  // expect { user_id: 1 , service_user_id: @734267018701701242}
  const id = args.user_id;
  const searchDB = 'SELECT tips.*, transactions.*, tips_to.*  FROM users, tips, transactions, tips_to WHERE tips.from_user_id = "' + id + '" AND transactions.tip_id = tips.id AND tips_to.tip_id = tips.id';
  'SELECT tips.*, transactions.*, discord_users.*, users_info.* FROM tips, transactions, discord_users, users_info WHERE tips.from_user_id = "1" AND transactions.tip_id = tips.id and discord_users.discord_id = "@328611434177101835" AND users_info.user_id = "1";'
  const tips_recievedSearch = 'SELECT tips_to.*, transactions.* FROM tips_to, transactions WHERE tips_to.user_id = "@734267018701701242" AND transactions.tip_id = tips_to.tip_id';
  const users_tip_sum = ' SELECT SUM(tip_amount) FROM tips, transactions WHERE tips.from_user_id = "' + args.user_id + '" AND transactions.tip_id = tips.id';
  return new Promise(resolve => {
    callmysql.query(searchDB, function(err, result) {
      if (err) {
        console.log('[mysql error]', err);
      }
      // console.log('result: ' + JSON.stringify(result));
      // console.log('result.length: ' + JSON.stringify(result.length));
      // console.log('result: ' + JSON.stringify(result));
      for (let i = 0; i < results.length; i++) {
      }

    })
  });
}







module.exports = {
  GetUserWalletBal : GetUserWalletBal,
  tipBotInfo : tipBotInfo,

};