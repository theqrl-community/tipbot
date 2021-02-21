# MySQL Tables Definition

## Tipbot Tables


Create a database for each service we extend the bot to.

Additionally we need a table to validate users across services. 

### `discord_users` Table

The `discord_users` table will store all discord user information at account sign up time.

- **id** *primary_key* is created at entry time  
- **user_name** Discord User Name
- **discord_id** Discord ID to identify the user uniquely
- **time_stamp** is created at entry time `NOW()`  

```sql
+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| id         | int(11)      | NO   | PRI | NULL    | auto_increment |
| user_name  | varchar(255) | NO   |     | NULL    |                |
| discord_id | varchar(255) | NO   |     | NULL    |                |
| time_stamp | datetime     | NO   |     | NULL    |                |
+------------+--------------+------+-----+---------+----------------+
```

### `discord_link` Table

The `discord_link` table will store all discord user linking additional services.

- **id** *primary_key* is created at entry time  
- **user_id** Initiator's User ID
- **service** user service intended to link
- **service_uuid** New service Unique User ID (must be unique)
- **generated_key** Key to link from alternative service - userkey+salt=generated key. User gets salt. 
- **validated** Alt service validated? boolean
- **expired** Is it expired? true if new key is written or if time expired
- **link_time_stamp** is created at entry time `NOW()`  
- **valid_time_stamp** is created at validation from alt service   
- **expired_time_stamp** is created only if key expires 


```sql
+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+

```



### `future_tips` Table

This table holds tips to users that have not signed up yet
We will keep these in memory for a set amount of time
after this time frame is up the bot will keep these tips in internal wallets.

- **id** *primary_key* auto generated at entry.
- **service** user service used to send tip
- **user_id** - Service user_id for the user to tip_to once signed up
- **user_name** - user name of the tip_to user
- **tip_from** - Service user_id of the tipped_from user
- **tip_amount** - exact amount to tip to the user
- **tip_paidout** - BOOLEAN used to track if the tip was paid or not. Default is 0
- **time_stamp** - time_stamp of when  the tip was sent. Used to track if funds still available to user


```sql
+--------------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
| Field              | Type                                                                                         | Null | Key | Default | Extra          |
+--------------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
| id                 | int(11)                                                                                      | NO   | PRI | NULL    | auto_increment |
| service            | enum('discord','keybase','github','reddit','trello','twitter','slack','telegram','whatsapp') | YES  |     | NULL    |                |
| user_id            | varchar(255)                                                                                 | NO   |     | NULL    |                |
| user_name          | varchar(255)                                                                                 | NO   |     | NULL    |                |
| tip_id             | int(11)                                                                                      | YES  |     | NULL    |                |
| tip_from           | varchar(255)                                                                                 | NO   |     | NULL    |                |
| tip_amount         | decimal(24,9)                                                                                | NO   |     | NULL    |                |
| tip_paidout        | tinyint(1)                                                                                   | YES  |     | 0       |                |
| tip_donated        | tinyint(1)                                                                                   | YES  |     | 0       |                |
| donated_time_stamp | datetime                                                                                     | YES  |     | NULL    |                |
| time_stamp         | datetime                                                                                     | NO   |     | NULL    |                |
+--------------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+

```
### `tips` Table

Store details from the tip transaction

- **id** *primary_key* is created at entry time 
- **tans_id** from `transactions.id` table.field to tip and transaction
- **from_user_id** the `users.id` that initiated the tip
- **tip_amount** amount to tip
- **from_service** the service that was used to tip from
- **time_stamp** is created at entry time `NOW()`  

```sql
+--------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
| Field        | Type                                                                                         | Null | Key | Default | Extra          |
+--------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
| id           | int(11)                                                                                      | NO   | PRI | NULL    | auto_increment |
| from_user_id | varchar(255)                                                                                 | NO   |     | NULL    |                |
| tip_amount   | decimal(24,9)                                                                                | NO   |     | NULL    |                |
| from_service | enum('discord','keybase','github','reddit','trello','twitter','slack','telegram','whatsapp') | YES  |     | NULL    |                |
| time_stamp   | datetime                                                                                     | NO   |     | NULL    |                |
+--------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+

```

### `tips_to` Table

- **id** *primary_key* is created at entry time 
- **tip_id** from `tips.id` table.field
- **user_id** the `users.id` that is receiving the tip. Send to their wallet
- **tip_amt** tip amount that was transfered to their wallet
- **time_stamp** is created at entry time `NOW()`  

```sql
+---------------+---------------+------+-----+---------+----------------+
| Field         | Type          | Null | Key | Default | Extra          |
+---------------+---------------+------+-----+---------+----------------+
| id            | int(11)       | NO   | PRI | NULL    | auto_increment |
| tip_id        | int(11)       | YES  |     | NULL    |                |
| user_id       | int(11)       | NO   |     | NULL    |                |
| future_tip_id | int(11)       | YES  |     | NULL    |                |
| tip_amt       | decimal(24,9) | NO   |     | NULL    |                |
| time_stamp    | datetime      | NO   |     | NULL    |                |
+---------------+---------------+------+-----+---------+----------------+
```

### `transactions` Table

Store details from the actual QRL transaction here.

- **id** *primary_key* is created at entry time 
- **tip_id** from `tips.id` table.field
- **tx_hash** the transaction hash from the tip
- **time_stamp** is created at entry time `NOW()`  


```sql
+------------+---------------------------------+------+-----+---------+----------------+
| Field      | Type                            | Null | Key | Default | Extra          |
+------------+---------------------------------+------+-----+---------+----------------+
| id         | int(11)                         | NO   | PRI | NULL    | auto_increment |
| tip_id     | int(11)                         | NO   |     | NULL    |                |
| tx_type    | enum('faucet','tip','withdraw') | YES  |     | NULL    |                |
| tx_hash    | varchar(255)                    | NO   |     | NULL    |                |
| time_stamp | datetime                        | NO   |     | NULL    |                |
+------------+---------------------------------+------+-----+---------+----------------+
```

### `Users` Table

The `users` table is intended to be the main user_id used throughout the bot. This ID will be assigned to any user related entries.

- **id** *primary_key* is created at entry time  
- **discord_user_id** inserted from the `discord_users.id` table.field  
- **twitter_user_id** ambitious isn't it  
- **time_stamp** is created at entry time `NOW()`  
- **updated_at** is created at entry time  


```sql
+------------------+----------+------+-----+---------+----------------+
| Field            | Type     | Null | Key | Default | Extra          |
+------------------+----------+------+-----+---------+----------------+
| id               | int(11)  | NO   | PRI | NULL    | auto_increment |
| discord_user_id  | int(11)  | YES  |     | NULL    |                |
| keybase_user_id  | int(11)  | YES  |     | NULL    |                |
| github_user_id   | int(11)  | YES  |     | NULL    |                |
| reddit_user_id   | int(11)  | YES  |     | NULL    |                |
| trello_user_id   | int(11)  | YES  |     | NULL    |                |
| twitter_user_id  | int(11)  | YES  |     | NULL    |                |
| slack_user_id    | int(11)  | YES  |     | NULL    |                |
| telegram_user_id | int(11)  | YES  |     | NULL    |                |
| whatsapp_user_id | int(11)  | YES  |     | NULL    |                |
| time_stamp       | datetime | NO   |     | NULL    |                |
| updated_at       | datetime | NO   |     | NULL    |                |
+------------------+----------+------+-----+---------+----------------+
```

### `users_agree` Table

The `users_agree` table collects the user agreement from the user. This allows the bot to send user address and allows user to start tipping

- **id** - *primary_key* created at entry time
- **user_id**
- **agree** - boolean agree or not
- **time_stamp** - time agreed

```sql
+------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
| Field      | Type                                                                                         | Null | Key | Default | Extra          |
+------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
| id         | int(11)                                                                                      | NO   | PRI | NULL    | auto_increment |
| user_id    | int(11)                                                                                      | NO   |     | NULL    |                |
| agree      | tinyint(1)                                                                                   | NO   |     | NULL    |                |
| service    | enum('discord','keybase','github','reddit','trello','twitter','slack','telegram','whatsapp') | YES  |     | NULL    |                |
| time_stamp | datetime                                                                                     | NO   |     | NULL    |                |
+------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
```

### `users_info` Table

- **id** *primary_key* is created at entry time  
- **user_id** from `users.id` table.field to join user and wallet
- **user_key** bcrypt_salt created to use for hashing info in the database {future feature}
- **user_auto_created** BOOLEAN if the user was created automatically.
- **auto_created_date** date auto-create happened   
- **signed_up_from** enum value can be one of the services integrated with. 
  - if `NULL` or `0` the user has not signed up yet, but has received tips
- **signup_date** date account was signed up from a social media platform
- **opt_out** give users option to opt out of the service, BOOLEAN value
  - if true don't allow tips to be sent to the user, DEFAULT false.
- **optout_date** date optout was selected
- **updated_at** is modified every change here at entry time `NOW()`  

```sql
+-------------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
| Field             | Type                                                                                         | Null | Key | Default | Extra          |
+-------------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
| id                | int(11)                                                                                      | NO   | PRI | NULL    | auto_increment |
| user_id           | int(11)                                                                                      | NO   |     | NULL    |                |
| user_key          | varchar(255)                                                                                 | NO   |     | NULL    |                |
| user_auto_created | tinyint(1)                                                                                   | YES  |     | NULL    |                |
| auto_create_date  | varchar(255)                                                                                 | YES  |     | NULL    |                |
| signed_up_from    | enum('discord','keybase','github','reddit','trello','twitter','slack','telegram','whatsapp') | YES  |     | NULL    |                |
| signup_date       | datetime                                                                                     | YES  |     | NULL    |                |
| opt_out           | tinyint(1)                                                                                   | YES  |     | 0       |                |
| optout_date       | datetime                                                                                     | YES  |     | NULL    |                |
| updated_at        | datetime                                                                                     | NO   |     | NULL    |                |
+-------------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
```

### `wallets` Table

Store wallet details here

> ToDo
> - protect the user data here using the salt and server salt to generate secure storage?.

- **id** *primary_key* is created at entry time 
- **user_id** from `users.id` table.field to join user and wallet
- **wallet_pub** example QRL wallet address `Q020500269080119667eb86fb8623beebdf3bd65d484c30ac0ac15d234a40bff788189a344af1a7`
- **wallet_bal** the last known balance of the wallet. Update every check or function that needs it
- **wallet_qr** QR code generated for the given address, shown to user to aid in deposit...
- **time_stamp** is created at entry time `NOW()`  
- **updated_at** updated every bal update?

```sql
+------------+---------------+------+-----+-------------+----------------+
| Field      | Type          | Null | Key | Default     | Extra          |
+------------+---------------+------+-----+-------------+----------------+
| id         | int(11)       | NO   | PRI | NULL        | auto_increment |
| user_id    | int(11)       | NO   |     | NULL        |                |
| wallet_pub | varchar(80)   | NO   |     | NULL        |                |
| wallet_bal | decimal(24,9) | NO   |     | 0.000000000 |                |
| wallet_qr  | blob          | YES  |     | NULL        |                |
| time_stamp | datetime      | NO   |     | NULL        |                |
| updated_at | datetime      | NO   |     | NULL        |                |
+------------+---------------+------+-----+-------------+----------------+
```


### `withdraws` Table

store info related to withdraw and transfers from the bot addresses. 

- **id** *primary_key* is created at entry time
- **user_id** from `users.id` the user sending the tx
- **tx_hash** The tx_hash from the QRL transaction
- **service** service that initiated the transfer
- **time_stamp** when the tx happened


```sql
+------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
| Field      | Type                                                                                         | Null | Key | Default | Extra          |
+------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
| id         | int(11)                                                                                      | NO   | PRI | NULL    | auto_increment |
| user_id    | int(11)                                                                                      | NO   |     | NULL    |                |
| tx_hash    | varchar(255)                                                                                 | NO   |     | NULL    |                |
| service    | enum('discord','keybase','github','reddit','trello','twitter','slack','telegram','whatsapp') | YES  |     | NULL    |                |
| to_address | varchar(80)                                                                                  | NO   |     | NULL    |                |
| amt        | decimal(24,9)                                                                                | NO   |     | NULL    |                |
| time_stamp | datetime                                                                                     | NO   |     | NULL    |                |
+------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
```



## Faucet Tables

### `faucet_payouts` Table

Used to track the payouts from the faucet. This will store all of the transaction details including the user_id, tx_hash from the qrl transaction, total amount transfered and the time it all happened.

- **id** *primary_key* is created at entry time
- **user_ids** the user id from `users.id`
- **tx_hash** tx hash from the qrl tx
- **total_payout_amt** - total amount sent through the faucet
- **time_stamp** the timestamp of entry

```sql
+------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
| Field      | Type                                                                                         | Null | Key | Default | Extra          |
+------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
| id         | int(11)                                                                                      | NO   | PRI | NULL    | auto_increment |
| user_id    | int(11)                                                                                      | NO   |     | NULL    |                |
| service    | enum('discord','keybase','github','reddit','trello','twitter','slack','telegram','whatsapp') | YES  |     | NULL    |                |
| drip_amt   | decimal(24,9)                                                                                | NO   |     | NULL    |                |
| paid       | tinyint(1)                                                                                   | YES  |     | 0       |                |
| tx_hash    | varchar(255)                                                                                 | YES  |     | NULL    |                |
| updated_at | datetime                                                                                     | NO   |     | NULL    |                |
| time_stamp | datetime                                                                                     | NO   |     | NULL    |                |
+------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
```
