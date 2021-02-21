# Installation Instructions


## Server Setup

Grab a server from [DigitalOcean here](https://m.do.co/c/139fae3d80b5) for as low as $5 a month. Simple interface and great documentation to get you started.

Ubuntu 18.04 Server was used for the setup and configuration documentation. 

At the time of writing the server used was the $10/Mo or $0.015/hr with 2 GB / 1 CPU, 50 GB SSD disk, and 2 TB transfer


### Create new user

```bash
# add new user and add them to the sudo group
adduser {USERNAME}
adduser {USERNAME} sudo
```

### Configure FQDN & Hostname

Edit both hosts and hostname to add your hostname and domain name for the bot

```
# /etc/hostname

HOSTNAME.EXAMPLE.COM
```

```
# /etc/hosts

# add your ipv4 and ipv6 info and FQDN

10.10.10.10 HOSTNAME.EXAMPLE.COM HOSTNAME
127.0.0.1 HOSTNAME HOSTNAME
127.0.1.1 HOSTNAME.DOMAINNAME.COM HOSTNAME

```


### Update

```bash
apt-get update && apt-get upgrade -y
```
### Install Base Packages

```bash
sudo apt-get install -y mysql-server-5.7 git screen fail2ban ufw
```

#### Nodejs

Install node using NVM. See the latest install details for that NVM package.

### Configure Base Packages

#### mysql

```bash
## Set password and configure securely {defaults}
sudo mysql_secure_installation

# login with root user and setup database for the bot
sudo mysql -u root
# You will need to store this next password in the config file later, save it
CREATE USER 'qrltips'@'localhost' IDENTIFIED BY 'password';
CREATE DATABASE qrl_tips;
GRANT ALL PRIVILEGES ON qrl_tips.* TO 'qrltips'@'localhost';
FLUSH PRIVILEGES;
```

### fail2ban

copy `fail2ban.conf` to `fail2ban.local`
copy `jail.conf` to `jail.local`
edit both `.local` files.

- Configure to defend the server from ssh attacks
- Configure to use ufw `banaction = ufw`
- Configure sshd

```bash
service fail2ban restart
```

### Setup ufw

```bash
# open required ports only
sudo ufw allow Openssh
sudo ufw enable
sudo ufw status
```

### Install go

Install the latest go from source. [Install instructions here](https://golang.org/doc/install)

### Install QRL Node 

This will install 2gb swap file if not found and install a qrl node for ubuntu 18.04

```bash
wget https://gist.githubusercontent.com/fr1t2/39ab618cef3ad16e7a5833e87d0eeaf1/raw/6e72d38cbdfd7b2d2b2f44efb2b431f4ac484a46/qrl_python_ubuntu_18.04 && chmod +x qrl_python_ubuntu_18.04 && sudo ./qrl_python_ubuntu_18.04
```

> **Optional** grab the state files from backup to save on the sync time.

> You may also want to configure the node to be testnet while you set things up. Do that here..


### Install QRL Wallet-api

```bash
go get github.com/theQRL/walletd-rest-proxy
cd $GOPATH/src/github.com/theQRL/walletd-rest-proxy
go build
```

### Start `qrl_walletd` and walletAPI

#### Script start

> You must have a running, synced node for the walletAPI to function. The script below will start the node automatically. It will take some time to sync.

There is a script located in the `/_scripts/qrl/start_qrl.sh` that will start all required qrl tools. This script will run these tools in separate screen sessions, `walletd` and `qrl`.

Add this to your crontab file to start at boot

```bash
crontab -e

## Add the following line to the bottom of the file
@reboot		/home/$USER/qrl-tips/_scripts/qrl/start_qrl.sh
```

Now test the script with `/home/$USER/qrl-tips/_scripts/qrl/start_qrl.sh` which should start both the node and the walletAPI in separate screen sessions. 

> Check your path in the above code, as well as the script to ensure correct details.


#### Manual start

If you want to test each individual feature out for error testing run these commands to get this running. 

> This will not persist after a reboot. You will need to restart everything here.

##### Start the QRL Node

```bash
start_qrl
```

> If running testnet, add the `network-type=testnet` flag to the above command. THis will create a qrl-testnet directory to store the testnet state files.

##### walletd
open a screen and start the `qrl_walletd`

```bash
screen -R walletAPI

## in screen session
qrl_walletd
```

> If running testnet, add the `network-type=testnet` flag to the above command. THis will create a qrl-testnet directory to store the testnet state files.


Change to the go directory and start the API

```bash
cd $GOPATH/src/github.com/theQRL/walletd-rest-proxy

# now start the API on default port
./walletd-rest-proxy -serverIPPort 127.0.0.1:5359 -walletServiceEndpoint 127.0.0.1:19010

# "ctl+a d" to exit leaving the screen running
```

Refer to [The Docs](https://docs.theqrl.org/developers/walletAPI/) for more commands using the walletAPI

## Install the Bot

Install the bot, setup the database, generate wallets, config file and start!

### Get the Bot Code and build

Grab the code from the project repository.

```bash
git clone https://github.com/fr1t2/qrl-tipbot.git
```

Change into that directory and install node requirements.

```bash
cd qrl-tips

npm install
## Should install all required packages
```

### Config file

You must have a config file located in the `/_config` directory. Copy the example found there and fill in the relevant details for the bot.

All need to be filled in, and most are important.

### Create databases

run the database initialization script to setup all of the database tables and what not.

```bash
# from the main project directory, probably at /home/$USER/qrl-tipbot
npm run initDB
```

This will output various details on the database setup.

### Generate Bot wallets

The bot needs 3 wallets. We have a script for that.

**You will need:**

- Bot Discord ID
- Bot Name
- Encryption Passphrase

The script will generate 3 wallets, and store the bot in the database so it can receive tips.

> Save the information that prints out, you will need it again
> ! DO NOT LOSE THE ENCRYPTION PASSPHRASE!!! THis is needed each time the server reboots...















Start the bot in a screen session

```bash
screen -R Discord
## cd to the _script/discord dir
# in screen session
npm DiscordBot
```

Should see a printout of config found and confirm gilds etc.
