# Backup and Recovery

> Backup all of the user information and wallet files needed for rebuilding the bot upon failure.

Script used to backup the bot data for later restoration.

## Backup System


from `crontab` run the `/_scripts/backup/backup.sh` script to copy the files over and encrypt them using the password in the configuration.

The encrypted files are sent to multiple off-server locations for safe keeping. If failure happens, one of these backups are restored on a newly build server to house the tipbot.

### Setup

Edit the scripts `backup.js` and `backup.sh` located in the `_scripts/backup/` directory. Both of these files have configuration settings that need to be modified, as well as the typical `_config/config.json` file under the "backup" settings.

Ensure the directory that you are backing up to exists and set crontab to execute the scripts at some time daily.

`0 01 * * *      /home/ubuntu/qrl-tipbot/_scripts/backup/backup.sh`

Executing the script will create both an un-encrypted backup tar and an encrypted one. Transfer the encrypted file off-site to backup.`TipBot_Backup.tar.gz.enc`


Send at minimum, daily, weekly, and monthly files out.

## Recovery Procedure

Decrypt the files using `openssl` and the password you provided in the config file back on the tipbot.

```bash
# decrypt with password in file
openssl enc -pbkdf2 -d -base64 -out hey_TipBot_Backup.tar.gz -in TipBot_Backup.tar.gz.enc -pass file:$HOME/qrl-tips/_scripts/backup/qrl-tipbotBackup/secret_pass.txt

# or with password passed through stdin

echo -n "password_here" | openssl enc -pbkdf2 -d -base64 -out hey1_TipBot_Backup.tar.gz -in TipBot_Backup.tar.gz.enc -pass stdin
```

Will decrypt the tar file, allowing you to un-tar and reinstate the tipbot.

