// Script to backup all of the files needed to run the bot
const fs = require('fs');
// const crypto2 = require('crypto');
const config = require('../../_config/config.json');
const mysqldump = require('mysqldump');
const sha256Array = [];
// const date1 = Date.now();
const folderName = 'backup';
    const fileName = '/tipBotDatabase_Backup.sql';
    const dumpFilePath = config.backup.location + folderName + fileName;
    // console.log('dumpFilePath: ' + dumpFilePath);

// backup database into a and save in the backup folder
async function sqlBackup() {
  return new Promise(function(resolve) {
    // dump the result straight to a compressed file
     mysqldump({
      connection: {
        host: config.database.db_host,
        user: config.database.db_user,
        password: config.database.db_pass,
        database: config.database.db_name,
      },
      dumpToFile: dumpFilePath,
      compressFile: false,
    });
    // console.log('SQL Backup File written');
    const results = [dumpFilePath, fileName];
    resolve(results);
  });
}

async function main() {
  // check for and make if not exist backup dir
  try {
    if (!fs.existsSync(config.backup.location + folderName)) {
      // console.log('backup dir not found');
      fs.mkdirSync(config.backup.location + folderName);
    }
  } catch (err) {
    console.error(err);
  }
  // get the sql database into a dump file.
  const sqlDumpFile = await sqlBackup();
  //console.log('sqlDumpFile: ' + JSON.stringify(sqlDumpFile));
  fs.copyFile(config.backup.walletFile, config.backup.location + folderName + '/walletd.json', (err) => {
    // console.log('walletd.json has been copied');

    if (err) throw err;
  });
  fs.copyFile(config.backup.walletdLog, config.backup.location + folderName + '/walletd.log', (err) => {
    // console.log('walletd.log has been copied');

    if (err) throw err;
  });
  fs.copyFile(config.backup.nodeConfig, config.backup.location + folderName + '/config.yml', (err) => {
    // console.log('config.yml');

    if (err) throw err;
  });
  fs.copyFile(config.backup.faucetLog, config.backup.location + folderName + '/faucet.log', (err) => {
    // console.log('faucet.loghas been copied');

    if (err) throw err;
  });
  // fs.copyFile(config.backup.botLogFile, config.backup.location + folderName + 'discord_bot.log', (err) => {
    // console.log('discord_bot.log has been copied');

  // if (err) throw err;
  // });
  fs.copyFile(config.backup.botConfigFile, config.backup.location + folderName + '/config.json', (err) => {
    // console.log('config.json has been copied');

    if (err) throw err;
  });

  // write the sha256 info to file
  fs.writeFile(config.backup.location + folderName + '/sha256sum.txt', JSON.stringify(sha256Array), function(err) {
    // console.log('sha256sum.txt has been copied');

    if (err) return console.log(err);
  });
}

main();