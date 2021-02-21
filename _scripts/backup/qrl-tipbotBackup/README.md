# Backup

This is where the backup files will be once the backup.sh script is run.

## Backup Proceedure

Set backup.sh in crontab to run daily `0 01 * * * $HOME/qrl-tips/_scripts/backup/backup.sh`
this will create a encrypted file ready to be transfered to another backup location

### Encrypted Tar File

this is the encryption script that secures the backup files.

```bash
openssl enc -pbkdf2 -e -base64 \
        -in TipBot_Backup.tar.gz -out TipBot_Backup.tar.gz.enc \
        -pass file:$HOME/qrl-tips/_scripts/backup/qrl-tipbotBackup/secret_pass.txt
```
**Decrypt** 

to decrypt you either need to pass the password in a file or in stdin.

```bash
# With a password file
openssl enc -pbkdf2 -d -base64 -out hey_TipBot_Backup.tar.gz -in TipBot_Backup.tar.gz.enc -pass file:$HOME/qrl-tips/_scripts/backup/qrl-tipbotBackup/secret_pass.txt

# or in stdin

echo -n "password_here" | openssl enc -pbkdf2 -d -base64 -out hey1_TipBot_Backup.tar.gz -in TipBot_Backup.tar.gz.enc -pass stdin
```

Inside the archive you will find;

  - config.json  
  - config.yml
  - faucet.log
  - sha256sum.txt
  - tipBotDatabase_Backup.sql
  - walletd.json
  - walletd.log

Using the tipBotDatabase_Backup.sql to restore the database with

The walletd.json file is the key to the funds and is encrypted upon initializin the bot, This is not the same encryption pass as the backup tar file here.

The config.json file is for the tipbot, the config.yml is for the node
