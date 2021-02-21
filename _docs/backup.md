# Backup the Bot

To provide redundancy and failsafe any catastrophes the bot needs to be backed up. We have peoples funds at risk and any compromise of them is unacceptable.

> A backup is not truly a backup until it is stored in at least 3 separate physical locations!

We will run the backup frequently, saving the latest data and pushing out to multiple locations. All data must be encrypted and the encryption phrase should be stored on other media.

**Backup Requirements**

- Data saved frequently
- Backed-up data is never stored in plain text
- Backups are stored on multiple platforms in separate locations
- Validation of the backup and successful transmission. Notify on failure

## Backup System

We need to backup any of the user information and wallet files needed for rebuilding the bot upon failure.

### Backup Data 

| Data | Location | Description | 
| ---- | ---------| ----------- |
| Wallet File | ~/.qrl | The main wallet file used by the bot. File is encrypted already from setup for extra security. 
| Config File | {BOT_DIR}/_config/config.json | The bot main configuration file. |
| Bot Database | MySQL database | The bot database, containing user info and transaction details (Public keys and amounts) all info is public. |
| Node State Files | ~/.qrl/data/state | The QRL Blockchain. Will save time on the re-sync however is large. |


### Backup Locations

Uploading the synced and tar'd files to multiple locations helps guarantee that things are recoverable

| Service | Setup | Notes | 
| ------- | ----- | ----------- |
| Dropbox | Install dropbox to server and link to account | symlink the backup directory to the default dropbox folder, and make sure it is not syncing the entire dropbox account!|
| Amazon S3 Bucket | Using the node AWS SDK | | 
| NextCloud Server | `npm install webdav` | uses webdav node package |
| rsync server location | ssh key to remote server | Send files to remote server using rsync |


### Backup Details

The backup system uses Rsync to incrementally update any changes to the files we are interested in, as well as `mysqldump` to get the latest database info from MySQL. This will backup all of these files into a single location in the `/_script/backup/incremental/` directory

The system is run from Cron and the frequency of backup is set in the configuration file `/_config/config.json`


#### Amazon


Send tar file with all backup data? or multiple tar files

#### Dropbox


#### NextCloud WebDav

To sync to a NextCloud (NC) server the config file will need to be modified to meet WebDav users information.

> Be cautious of security implications of sharing access keys to the NC server. Configure a new tipbot user to hold these files to limit exposure there.

**Config Setup**

In the `config.backup` section add you user details to connect to the Nextcloud server. 

**Nextcloud Configuration Directives**

| Setting | Information |
| --- | --- |
| `config.backup.nextcloud_server` | Server FQDN |
| `config.backup.nextcloud_user` | NextCloud User Name |
| `config.backup.nextcloud_pass` | NextCloud User Password *(strong)* |


**Backup Procedure**

The system will keep files for a few versions to ensure backup corruption is prevented.

Files will be saved -

- Last Backup taken every hour from TipBot
- Last 24 hours (24 Backups)
- Every day for last week (7 Backups)
- Weekly Backup for last month
- Monthly Backup

##### Examples

**Bash code**

Using curl to interact with webdav server

```bash
# Upload file error.log...
curl -u user:pass -T error.log "https://example.com/nextcloud/remote.php/dav/files/USERNAME/$(date '+%d-%b-%Y')/error.log"

# Move a file
curl -u user:pass -X MOVE --header 'Destination: https://example.com/nextcloud/remote.php/dav/files/USERNAME/target.jpg' https://example.com/nextcloud/remote.php/dav/files/USERNAME/source.jpg

```


**NPM webdav**

> https://www.npmjs.com/package/webdav

`npm install webdav --save`


#### Rsync Server



