#!/bin/bash

###############################
#							  #
# Backup Tipbot Files		  #
#							  #
###############################

# Run this script from crontab.

# This will tar, and move the files to specific directories for syncing to additional services. See backup.js 
# places backup tar file in $HOME/qrl-tips/_scripts/backup/qrl-tipbotBackup/

# get latest files into dir 
/usr/bin/nodejs "$HOME/qrl-tipbot/_scripts/backup/backup.js"
# location defined in config file
FileLocation=`< "$HOME/qrl-tipbot/_config/config.json" jq -r .backup.location`
cd $FileLocation
# Tar the files to location defined in BackupLocation
tar -czf TipBot_Backup.tar.gz -C "$FileLocation/backup" . >/dev/null 2>&1

openssl enc -pbkdf2 -e -base64 \
        -in TipBot_Backup.tar.gz -out TipBot_Backup.tar.gz.enc \
        -pass file:"$HOME/qrl-tipbot/_scripts/backup/qrl-tipbotBackup/secret_pass.txt"

# decrypt with 
#openssl enc -pbkdf2 -d -base64 -out hey_TipBot_Backup.tar.gz -in TipBot_Backup.tar.gz.enc -pass file:$HOME/qrl-tips/_scripts/backup/qrl-tipbotBackup/secret_pass.txt
# or 
#echo -n "password_here" | openssl enc -pbkdf2 -d -base64 -out hey1_TipBot_Backup.tar.gz -in TipBot_Backup.tar.gz.enc -pass stdin
