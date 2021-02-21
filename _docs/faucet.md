# Faucet Setup and Configuration

> Give away coins to users who ask. Track the user so double takes are not available and configure amount low enough that it is not worth hacking multiple accounts to pull from the faucet.

Setup the faucet to work with a user from social media. Track the users faucet rewards and drip to the user a limited amount per day. This will allow giving a distributed group a small reward while requiring they participate in the social media channels the bot is deployed to.

## Operation

`_scripts/discord/cmd/faucet.js` is where all the magic happens from an end user perspective.

1. user requests a *drip* from the faucet
2. Bot checks the `faucet_payouts` table for the user ID within the last config set interval. `faucet_payouts.time_stamp >= NOW() - INTERVAL ' + config.faucet.payout_interval + ' MINUTE';`
3. If user is not found within the last *interval* bot adds user to the `faucet_payouts` table with `paid` boolean set to false.
4. Bot runs the `_scripts/faucet/payout.py` script every so often via a crontab job to check for any unpaid faucet payouts in the table.
5. If found, bot transfers from the faucet wallet funds and pays users their tip.
6. Bot marks the `faucet_payout.paid` field to true, and records the transaction ID from the payout there.


## Setup


### QRL automatic OTS Address
The faucet requires a wallet address in the server to store and send faucet payouts from. This is configured when the bot is initialized first run. See the [install docs](/install.md) for more info here.

This address needs to be added to the `_config/config.json` file under faucet settings. there are a few other important details to work out there. 

### Payout Script

You will also need to modify the `_scripts/faucet/payout.py` file so the script knows where to look for dependencies. `L-21 & L-26`
