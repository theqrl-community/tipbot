# TipBot Database Setup

Each service will have a table for associating to a {users.user_id} to the social name/ID. 

You will set the configuration for the database in the main configuration file. We use mysql as the database. 

Look for the [#database] section there and add your details.


## DB Install

We have chosen MySQL for this project.

```bash
## Install the database
sudo apt-get install mysql-server-5.7

## Configure the database
sudo mysql_secure_installation
```

Follow along and accept the defaults, setting the new root Password

#### DB Config

> MYSQL Database needs to exist prior to running this script. You will also need a config file `/_config/config.json` with the connection details for the script to work!

MySQL requires a user be allowed privileges for the database you want to use. We create a user, a database, and give all access to this user. 

Replace anything in a `{  }` with your info

```bash
# since we have restricted the root account su to root
sudo su 
# enter mysql shell
mysql
# create user and database
CREATE DATABASE [IF NOT EXISTS] {DATABASE_NAME}
CREATE USER '{DATABASE_USER}'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON {DATABASE_NAME} . * TO '{DATABASE_USER}'@'localhost';
FLUSH PRIVILEGES;

```

With a database setup, create the bot tables using the `/_scripts/db/dbCreate.js` script. this will create all of the tables found in [The Tables Doc](tables.md)


```bash
npm run build_database
```

## Configuration

The `_config/config.js.example` file is meant to give a framework of all of the configuration directives required to run the various services. We are only concerned with the `{database}` section

```json
  "database" : {
    "db_name" : "DATABASE_NAME",
    "db_host" : "DATABASE_HOST",
    "db_pass" : "DATABASE_SECRET_PASSWORD_CHANGE_ME!!",
    "db_user" : "DATABASE_USER",
    "db_port" : "3006"
  },
```


# DB Clean

Run the below command and get a list of tables to DROP, then drop them...

```sql
mysql> SELECT concat('DROP TABLE IF EXISTS `', table_name, '`;') FROM information_schema.tables WHERE table_schema = 'qrltips_prod';
+----------------------------------------------------+
| concat('DROP TABLE IF EXISTS `', table_name, '`;') |
+----------------------------------------------------+

DROP TABLE IF EXISTS `discord_users`; 
DROP TABLE IF EXISTS `discord_link`; 
DROP TABLE IF EXISTS `faucet_payouts`;
DROP TABLE IF EXISTS `future_tips`;   
DROP TABLE IF EXISTS `github_users`;  
DROP TABLE IF EXISTS `keybase_users`; 
DROP TABLE IF EXISTS `reddit_users`;  
DROP TABLE IF EXISTS `slack_users`;   
DROP TABLE IF EXISTS `telegram_users`;
DROP TABLE IF EXISTS `tips`;          
DROP TABLE IF EXISTS `tips_to`;       
DROP TABLE IF EXISTS `transactions`;  
DROP TABLE IF EXISTS `trello_users`;  
DROP TABLE IF EXISTS `twitter_users`; 
DROP TABLE IF EXISTS `users`;         
DROP TABLE IF EXISTS `users_agree`;   
DROP TABLE IF EXISTS `users_info`;    
DROP TABLE IF EXISTS `wallets`;       
DROP TABLE IF EXISTS `whatsapp_users`;
DROP TABLE IF EXISTS `withdrawls`;    


+----------------------------------------------------+
19 rows in set (0.00 sec)
```