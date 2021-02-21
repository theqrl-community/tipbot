'use strict';
const mysql = require('mysql');
// check for config file where we expect it


// config file location from here...
const config = require('../../_config/config.json');
const now = new Date();

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
    // add test data to the database
    // users data
    const addDisUsersTestData = 'INSERT INTO users(discord_user_id, time_stamp, updated_at) VALUES ?';
    const DisUsersvalues = [
      ['1', now, now ],
      ['2', now, now ],
      ['3', now, now ],
    ];
    callmysql.query(addDisUsersTestData, [DisUsersvalues], function(err, results) {
    if (err) {
          // console.log(err.message);
    }
      // log the output of sql command
        // console.log('addDisUsersTestData results:');
        // console.log(results);
  });

    const addTwitUsersTestData = 'INSERT INTO users(twitter_user_id, time_stamp, updated_at) VALUES ?';
    const TwitUsersvalues = [
    ['1', now, now ],
    ['2', now, now ],
    ['3', now, now ],
  ];
    callmysql.query(addTwitUsersTestData, [TwitUsersvalues], function(err, results) {
    if (err) {
        // console.log(err.message);
    }
    // log the output of sql command
          // console.log('addTwitUsersTestData results:');
      // console.log(results);
  });

    // createUsersInfo data
    const createUsersInfoData = 'INSERT INTO users_info(user_id, user_key, user_auto_created, auto_create_date, signed_up_from, signup_date, opt_out, optout_date, updated_at) VALUES ?';
    const createUsersInfovalues = [
      ['1', '$2a$25$C4vmgNUyZKgW3mBLtazpMO', '0', now, 'discord', now, '1', now, now ],
      ['2', '$2a$25$RLDMO8OD3Yuxm0qyg.mOme', '1', now, 'discord', now, '1', now, now ],
      ['3', '$2a$25$QRahS9/IWNPyb5nwpaZb.O', '0', now, 'discord', now, '1', now, now ],
      ['4', 'pvifjodinusd7hvnsd7222222', '1', now, 'discord', now, '0', now, now ],
      ['5', 'pvifjodinusd7hvnsd7333333', '0', now, 'discord', now, '1', now, now ],
      ['6', 'pvifjodinusd7hvnsd7444444', '0', now, 'discord', now, '0', now, now ],
  ];

  callmysql.query(createUsersInfoData, [createUsersInfovalues], function(err, results) {
    if (err) {
        // console.log(err.message);
    }
    // log the output of sql command
      // console.log('createUsersInfoData results:');
      // console.log(results);
  });

    // discord_users data
    const addDiscordUsersTestData = 'INSERT INTO discord_users(user_name, discord_id, time_stamp) VALUES ?';
    const DiscordUsersvalues = [
      ['fr1t2', '@3286114177101835', now ],
      ['QRL_TIP_BOT', '@610522468456857631', now ],
      ['tip-bot', '@516270974501519401', now ],
  ];

    callmysql.query(addDiscordUsersTestData, [DiscordUsersvalues], function(err, results) {
    if (err) {
        // console.log(err.message);
    }
    // log the output of sql command
          // console.log('addDiscordUsersTestData results:');
          // console.log(results);
  });


  // twitter_users data
  const addTwitterUsersTestData = 'INSERT INTO twitter_users(user_name, twitter_id, time_stamp) VALUES ?';
  const TwitterUsersvalues = [
    ['fr1t2', '@000000000', now ],
    ['bob', '@111111111', now ],
    ['alice', '@222222222', now ],
  ];

  callmysql.query(addTwitterUsersTestData, [TwitterUsersvalues], function(err, results) {
    if (err) {
        // console.log(err.message);
    }
    // log the output of sql command
      // console.log('addTwitterUsersTestData results:');
      // console.log(results);
  });

  // wallets data
  const addWalletsTestData = 'INSERT INTO wallets(user_id, wallet_pub, wallet_bal, time_stamp, updated_at) VALUES ?';
  const Walletsvalues = [
    ['1', 'Q010500778c6ff5fdf8e5ac833a3825c16f1d77dc18763b2c25267fe869e9ed3b355bf1292f37fe', '15', now, now ],
    ['2', 'Q000300463fb01592f5376e13171baec0c8c13fa7bea10595ac7c1f237ebb8680aa6f7362629286', '15', now, now ],
    ['3', 'Q000300ff3bb48e8c8de59ea4fb6a9732b263f7ffd157b106533c54882978665b6cb32ac9b6eb9f', '15', now, now ],
  ];
  callmysql.query(addWalletsTestData, [Walletsvalues], function(err, results) {
    if (err) {
        // console.log(err.message);
    }
    // log the output of sql command
      // console.log('addWalletsTestData results:');
      // console.log(results);
  });


  // tips data
  const addTipsTestData = 'INSERT INTO tips(trans_id, from_user_id, to_users_id, tip_amount, from_service, time_stamp) VALUES ?';
  const Tipsvalues = [
    ['11111', '@3286114177101835', '@610522468456857631', '0.00001', 'discord', now ],
    ['222222', '@3286114177101835', '610522468456857631', '0.00002', 'discord', now ],
    ['3333333', '@3286114177101835', '@516270974501519401,@616280013221789707,@594312893986766849', '0.00003', 'discord', now ],
  ];

  callmysql.query(addTipsTestData, [Tipsvalues], function(err, results) {
    if (err) {
        // console.log(err.message);
    }
    // log the output of sql command
      // console.log('addTipsTestData results:');
      // console.log(results);
  });

  // tips_from data
  const addTipsFromTestData = 'INSERT INTO tips_from(tip_id, user_id, total_tip, tip_to_count, time_stamp) VALUES ?';
  const TipsFromvalues = [
    ['1', '1', '0.00001', '1', now ],
    ['2', '1', '0.00002', '1', now ],
    ['3', '1', '0.00006', '2', now ],
    ['4', '2', '0.00008', '2', now ],
  ];
  callmysql.query(addTipsFromTestData, [TipsFromvalues], function(err, results) {
    if (err) {
        // console.log(err.message);
    }
    // log the output of sql command
      // console.log('addTipsFromTestData results:');
      // console.log(results);
  });

  // tips_to data, transactions
  const addTipsToTestData = 'INSERT INTO tips_to(tip_id, user_id, tip_amt, time_stamp) VALUES ?';
  const TipsTovalues = [
    ['1', '2', '0.00001', now ],
    ['2', '3', '0.00002', now ],
    ['3', '2', '0.00003', now ],
    ['3', '3', '0.00003', now ],
    ['4', '1', '0.00004', now ],
    ['4', '3', '0.00004', now ],
  ];

  callmysql.query(addTipsToTestData, [TipsTovalues], function(err, results) {
    if (err) {
        // console.log(err.message);
    }
    // log the output of sql command
      // console.log('addTipsToTestData results:');
      // console.log(results);
  });

  // future_tips data, transactions
  const addFutureTipsToTestData = 'INSERT INTO future_tips(service, user_id, user_name, tip_id, tip_from, tip_amount, tip_paidout, tip_donated, time_stamp) VALUES ?';
  const FutureTipsTovalues = [
    ['discord',  '@328611434177101835', '@fr1t2', 1, '@734267018701701242', 0.01, 0, 0, now ],
    ['discord',  '@328611434177101835', '@fr1t2', 1, '@734267018701701242', 0.1, 0, 0, now ],
    ['discord',  '@328611434177101835', '@fr1t2', 1, '@734267018701701242', 0.111, 0, 0, now ],
    ['discord',  '@328611434177101835', '@fr1t2', 1, '@734267018701701242', 0.22, 0, 0, now ],
  ];

  callmysql.query(addFutureTipsToTestData, [FutureTipsTovalues], function(err, results) {
    if (err) {
        // console.log(err.message);
    }
    // log the output of sql command
      // console.log('addFutureTipsToTestData results:');
      // console.log(results);
  });
  // transactions data
  const addTransactionsTestData = 'INSERT INTO transactions(tip_id, tx_hash, time_stamp) VALUES ?';
  const Transactionsvalues = [
    ['1', 'fb8b325999d9beb3a7b31e892babaf5d0ad54d628db4931dd041cf1a7bd04377', now ],
    ['2', 'fb8b325999d9beb3a7b31e892babaf5d0ad54d628db4931dd041cf1a70000000', now ],
    ['3', 'fb8b325999d9beb3a7b31e892babaf5d0ad54d628db4931dd041cf1a71111111', now ],
    ['4', 'fb8b325999d9beb3a7b31e892babaf5d0ad54d628db4931dd041cf1a72222222', now ],
  ];
  callmysql.query(addTransactionsTestData, [Transactionsvalues], function(err, results, fields) {
    if (err) {
        // console.log(err.message);
    }
    // log the output of sql command
      // console.log('addTransactionsTestData results:');
      // console.log(results);
      // console.log(fields);
  });

  // close the sql connection
  callmysql.end(function(err) {
    if (err) {
      return console.log(err.message);
    }
  });
});
