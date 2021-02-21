#!/usr/bin/python3.6
# ****************************************************************
#                 FaucetPayout Script
#
# Script reads from the tipbot database to find any valid faucet requests. These
# requests will be in the DB.faucet_payments table. The request is marked {paid: false} to start
# Using the user_id from this table to lookup the wallet_pub
# and add it to a list of addresses to pay.
#
# Payout every few min.
# 
# ****************************************************************
import requests
import json
import mysql.connector
import datetime
import logging
from decimal import *
# load the config file (find it at "data['TOPIC']['SETTING'])"
with open('/home/fr1t2/mainnet-qrl-tipbot/_config/config.json') as json_data_file:
    conf = json.load(json_data_file)
# logging settings
logging.getLogger("requests").setLevel(logging.WARNING)
logging.basicConfig(format='%(asctime)s %(message)s', filename='/home/fr1t2/mainnet-qrl-tipbot/faucet.log', level=logging.INFO)

#logging.info('******************** payout script ************************')

# db settings from config file
host = conf['database']['db_host']
user = conf['database']['db_user']
passwd = conf['database']['db_pass']
database = conf['database']['db_name']

fee = conf['wallet']['tx_fee'] # in shor X/10^9=quanta
feeShor = (float(fee) * 1000000000)
current_time = datetime.datetime.now()

# SQL queries
addressInfo = "SELECT wallets.wallet_pub FROM wallets, faucet_payouts WHERE faucet_payouts.paid = 0 AND faucet_payouts.user_id = wallets.user_id"
amountInfo = "SELECT faucet_payouts.drip_amt AS drip_amt FROM wallets, faucet_payouts WHERE faucet_payouts.paid = 0 AND faucet_payouts.user_id = wallets.user_id"
#UpdateSQL = "UPDATE ADMIN SET PAID = 0 WHERE PAID = 1"
# DB Connection
mydb = mysql.connector.connect(
        host = host,
        user = user,
        passwd = passwd,
        database = database
)
# interact with the db and mysql.connector with details from above
mycursor = mydb.cursor()
# Collect the amount to send
mycursor.execute(amountInfo)

howMuch = mycursor.fetchall()

amount_toSend = []
for row in howMuch:
  userAmt = Decimal(row[0])
  sendAmt = float(userAmt) * 10**9
  amount_toSend.append(int(sendAmt))

# Collect the addresses to send to
mycursor.execute(addressInfo)
who = mycursor.fetchall()

addresses_to = []
for address in who:
        addresses_to.append(address[0])

if not who:
        #logging('\nno drips found, exit\n')
        exit()
else:
    master_address = conf['faucet']['faucet_wallet_pub']
    logging.info('drips found')

def relayTransferTxnBySlave(addresses_to, amounts, feeShor, master_address):
  payload = {'addresses_to': addresses_to, 'amounts': amounts, 'fee': int(feeShor), 'master_address': master_address }
  QRLrequest = requests.post("http://127.0.0.1:5359/api/RelayTransferTxnBySlave", json=payload)
  response = QRLrequest.text
  relayTransferTxnBySlaveResp = json.loads(response)
  jsonResponse = relayTransferTxnBySlaveResp
  logging.info('amount = %s payees = %s fee = %s  masterAddress = %s ', amounts, addresses_to, feeShor, master_address)
  #print(f'ADMIN test:\n   amount = {amounts} \n   payees = {addresses_to} \n   fee = {feeShor}\n   masterAddress = {master_address}\n{current_time} ADMIN test:\n')
  return(jsonResponse)

tx = relayTransferTxnBySlave(addresses_to, amount_toSend, feeShor, master_address)
tx_hash = tx['tx']['transaction_hash']
UpdateSQL = ("UPDATE faucet_payouts SET faucet_payouts.paid = 1, faucet_payouts.updated_at = '%s', faucet_payouts.tx_hash = '%s' WHERE faucet_payouts.paid = 0" % (current_time, tx_hash))

mycursor.execute(UpdateSQL)
mydb.commit()
mydb.close()
#logging.info('ADMIN test:\n   amount = %s \n   payees = %s \n   fee = %s\n   masterAddress = %s\n%s ADMIN test:\n', amount_toSend, addresses_to, feeShor, master_address, current_time)
exit()
