// Script to backup all of the files needed to run the bot
const fs = require('fs');
const config = require('../../_config/config.json');
const mysqldump = require('mysqldump');
const sha256Array = [];
const folderName = 'backup';
const fileName = '/tipBotDatabase_Backup.sql';
const dumpFilePath = config.backup.location + folderName + fileName;

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
    const results = [dumpFilePath, fileName];
    resolve(results);
  });
}

async function main() {
  // check for and make if not exist backup dir
  try {
    if (!fs.existsSync(config.backup.location + folderName)) {
      fs.mkdirSync(config.backup.location + folderName);
    }
  } catch (err) {
    console.error(err);
  }
  // get the sql database into a dump file.
  // eslint-disable-next-line
  const sqlDumpFile = await sqlBackup();
  fs.copyFile(config.backup.walletFile, config.backup.location + folderName + '/walletd.json', (err) => {
    if (err) throw err;
  });
  fs.copyFile(config.backup.walletdLog, config.backup.location + folderName + '/walletd.log', (err) => {
    if (err) throw err;
  });
  fs.copyFile(config.backup.nodeConfig, config.backup.location + folderName + '/config.yml', (err) => {
    if (err) throw err;
  });
  fs.copyFile(config.backup.faucetLog, config.backup.location + folderName + '/faucet.log', (err) => {
    if (err) throw err;
  });
  fs.copyFile(config.backup.botConfigFile, config.backup.location + folderName + '/config.json', (err) => {
    if (err) throw err;
  });
  // write the sha256 info to file
  fs.writeFile(config.backup.location + folderName + '/sha256sum.txt', JSON.stringify(sha256Array), function(err) {
    if (err) return console.log(err);
  });
}

main();