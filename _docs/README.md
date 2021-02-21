# TipBot Documentation

## TOC


* [Backup/restore](/backup.md)
* [Database setup](/databaseSetup.md)
* [Faucet install](/faucet.md)
* [Install tipbot](/install/md)
* [Tipbot tables](/tables.md)

## Bot Flow

Tip-Bot is created to allow users to create a QRL address to send and receive tips from. This account is interacted through the social interface however all transactions and tips are stored on the server.


### User signup

A user can be signed through the `+add` command. hey will need to add themselves to the server and agree to the terms before the bot can be used for more than information. 

> You can send tips to a user that has not signed up. These tips will be held in a Bot controlled address available to the user when they sign up. 

**New Users** are associated with a newly created wallet the tipbot controls, and are only allowed to transact through the social media platform they signed up through.

1. User initiated account creation `@tip-bot add` or (`+add`, `+join`, `+signup`, `+su`) aliases.
2. Tipbot Adds the user info, generates a new address, verifies the user is not waiting for some *"future tips"*.
3. if faucet funds exist, the user is given a drip from the faucet.
4. The user is sent a DM with account info and terms, asking to agree.
5. The user agrees to terms and account is unlocked and ready to use.

---

### Deposit

After user has signed up and agreed to the terms they can deposit funds into their account. `+deposit` will send a message to the user in DM with their address. This is a typical QRL address and you will need funds to interact with most bot functions.

Transfer funds here from an outside wallet or request another drip from the faucet.


### Tipping

> User must have funds in their `{tipAddress}` to send tips to other users

1. User initiates tip using the `+tip` or `@tip-bot tip`, giving amount to tip, and all users to send this amount to. Any additional input will be ignored and the tip will succeed. Amount and users to tip order doesn't matter. 
2. Bot checks that tipping user has funds and is not opt-ed out or banned.
3. Is *tipped to user* found? If **No** > adds to future tips and sends funds to hold address tipbot controls.
4. Is *tipped to user* found? If **Yes** > Sends funds to users mentioned in pool tx. 
5. Notify *tipped to user* that tip is sent in service, and serve the tipping user transaction details in DM.

---


