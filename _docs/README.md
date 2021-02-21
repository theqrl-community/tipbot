# TipBot Documentation

> This is a work in progress. 

## Bot Flow


Tip-Bot is created to allow users to create a QRL address to send and recieve tips from. This account is interacted throughh the social interface however all transactions and tips are stored on the server.


### User signup

A user can be sigend up in a number of diferent ways. Regardless they will need to add themselves to the server and agree to the trems before the bot can be used. 

You can send tips to a user that has not signedup. These tips will be held in a Bot controlled address availabe to the user when they sign up. If they have passed the timeframe for holding these funds they may be lost. This is in an effort to keep the total worth of the bot down.


**New Users** are associated with a newly created wallet through a social media interface.

1. User initiated account creation
   a. `@tip-bot add` or `+add`, `+join`, `+signup`, `+su`, all work as aliases.
2. Add the user id and all important user info the the database.
3. A QRL address is created and associated to the user.
4. The user is sent a DM with acount info and terms, asking to agree.
5. The user agrees to terms and acount is unlocked and ready to tip.

---

### Deposit

After user has signed up and agreed to the terms they can deposit funds into their acount. `+deposit` will send a message tot he user in a DM with the address they can deposit to. This is a typical QRL address and you will need funds to interact with most bot functions.



### Tipping

> User must have funds in {tipAddress} to send tips to other users

1. User initiates tip to another user `+tip 1 user_name`
   a. Message format `@tipbot tip {TIP_AMOUNT} @TIP_TO_USER` is the same as `+tip {TIP_AMOUNT} @TIP_TO_USER`
   b. `+tip 1 @fr1t2 for being awesome!` is ine as well as long as the format is correct.
2. Bot receives message from user {message.author}
 a. *Is user signed up?* **Yes**
 b. *Does user have enough funds?* **Yes**
 c. *OTS keys available* **Yes** || **no** *create new wallet, transfer funds and notify user of new deposit address*
 c. *Is tippie signed up?*  
d. If **No** > adds to future tips and sends funds to hold address
d. If **Yes** > Sends funds to tippie in pool tx. 
e. Notify tippie that tip is sent in service.

---

## Administrative Interaction

> Provide a facility for users to manage their accounts. Check balance, withdraw funds, see who has tipped them etc.

**Check Balance**
1. User issues message or dm to bot for balance
 @tipbot bal
2. Tipbot responds with wallet address balance lookup.

**Withdraw**
1. User interacts with bit to initiate a withdrawal
@tipbot withdraw {opt. qty} {ToQRLAddress} 
2. Bot confirms the available funds exist in tipAddress
3. Bot looks for 2FA or additional account to confirm withdrawal.
*If found* awaiting confirm
*If not found*, proceed
4. Bot confirms the {ToQRLAddress} before sending.
5. Bot sends tx to user

**Opt-Out**

**Opt-In**

**Terms**

