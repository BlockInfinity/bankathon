'use strict';

const DEBUG = true;

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const contract = require("truffle-contract");
const path = require("path");
const request = require('request');

const fs = require('fs');
const config = require('../config/configuration.json');
const VisaAPIClient = require('../libs/visaapiclient.js');
const assert = require('chai').assert;
const randomstring = require('randomstring');

const userId = config.userId;
const password = config.password;
const keyFile = config.key;
const certificateFile = config.cert;

const visaAPIClient = new VisaAPIClient();

if (!process.env.NODE_URL) {
    process.env.NODE_URL = 'https://ropsten.infura.io/';
    console.log("Using default node: 'https://ropsten.infura.io/' as node.")
}

const PERIOD_LENGTH = 300000;
const DISTANCE_PER_PERIOD = 10;
const REWARD_IN_ETHER_PER_PERIOD = 0.001;
let ETHER_EXCHANGE = 0.000583;
let EURO_EXCHANGE = 1.0;
let REGULARITY_RATIO = 0.1;
let INITIAL_NUM_COINS = 10;
let INITIAL_NUM_CHEAT_WEEKS = 2;
let INITIAL_DISTANCE_IN_CURRENT_PERIOD = 1;
let INITIAL_PERCENTAGE_IN_CURRENT_PERIOD = 0.1;

let web3;

const STATIC_PUB_KEY_WATCH = "0x290CEE9385cE6DdcC4FFfb59C607D4B2E740b951";
const STATIC_PRIVATE_KEY_WATCH = "cf1e1d95cd862418b2138a6b018e5a5129693ca3c3e17332e1ccd0503a7c5ab8";
const STATIC_PUB_KEY_USER = '0xf0433Ad2cddA1179D764a1d2410aB90cFB124B35';
const STATIC_PRIVATE_KEY_USER = "96b31a3253b8c18141b202c847043f92adac3d2d4d8f6a55037421028fa7f6fa"
const CONTRACT_ADDRESS = "0x97DA8E3F252fA836FFDD2bd2AaC572342222CEFF"

let state = {
    user_Account: STATIC_PUB_KEY_USER,
    link_to_user_account: `https://ropsten.etherscan.io/token/0x97da8e3f252fa836ffdd2bd2aac572342222ceff?a=${STATIC_PUB_KEY_USER}`,
    watch_Account: STATIC_PUB_KEY_WATCH,
    distance_In_Current_Period: INITIAL_DISTANCE_IN_CURRENT_PERIOD,
    percentage_In_Current_Period: INITIAL_PERCENTAGE_IN_CURRENT_PERIOD,
    coins: INITIAL_NUM_COINS,
    txhistory: [],
    regularity: 0.35,
    total_Rewards_in_Ether: 0,
    total_Rewards_in_Euro: 0,
    cheat_Weeks: INITIAL_NUM_CHEAT_WEEKS
}

let coins_Received = false;
let old_Distance = 0;
let balance = 0;

/* ############## execute */

connect();
setInterval(reset, PERIOD_LENGTH);
setInterval(getBalance, 10000);
setInterval(update_Exchange_Rate, 10000);
let initial = false;

const pushFundsRequest = {
    "acquirerCountryCode": "840",
    "acquiringBin": "408999",
    "amount": null,
    "businessApplicationId": "AA",
    "cardAcceptor": {
        "address": {
            "country": "USA",
            "county": "San Mateo",
            "state": "CA",
            "zipCode": "94404"
        },
        "idCode": "CA-IDCode-77765",
        "name": "Visa Inc. USA-Foster City",
        "terminalId": "TID-9999"
    },
    "localTransactionDateTime": "2017-11-22T17:01:17",
    "recipientName": "rohan",
    "recipientPrimaryAccountNumber": "4957030420210462",
    "retrievalReferenceNumber": "412770451018",
    "senderAccountNumber": "4957030420210454",
    "senderAddress": "901 Metro Center Blvd",
    "senderCity": "Foster City",
    "senderCountryCode": "124",
    "senderName": "Mohammed Qasim",
    "senderStateCode": "CA",
    "systemsTraceAuditNumber": "451018",
    "transactionCurrencyCode": "USD",
};

const baseUri = 'visadirect/';
const resourcePath = 'fundstransfer/v1/pushfundstransactions';

/* ############## exposed function */

module.exports.sendeBewegungsdaten = function(request, response) {
    let new_Distance = request.body.distance;
    let diff = new_Distance - old_Distance;

    state.distance_In_Current_Period = new_Distance;
    state.percentage_In_Current_Period = diff / DISTANCE_PER_PERIOD;

    if (state.percentage_In_Current_Period >= 1 && coins_Received == false) {
        state.percentage_In_Current_Period = 1;
        state.coins++;
        send_Token(1, "user");
        state.regularity += REGULARITY_RATIO;
        coins_Received = true;
        old_Distance = state.distance_In_Current_Period;
    }

    response.json({ state });
}

module.exports.zahleInKryptoAus = function(request, response) {
    let value = request.body.value;
    let ether = value * ETHER_EXCHANGE;

    if (state.coins < value) {
        response.json({ message: "Not enough coins left." })
    } else {
        state.coins -= value;
        console.log("before send token")
        send_Token(value, "watch");
        state.total_Rewards_in_Ether += ether;
        send_Ether(ether).then(_hash => {
            state.txhistory.push({ txhash: _hash, date: new Date(), value: value, link: `https://ropsten.etherscan.io/tx/${_hash}` })
            response.json({ txhash: _hash, date: new Date(), value: value, link: `https://ropsten.etherscan.io/tx/${_hash}` });
        })
    }
}

module.exports.zahleInEuroAus = function(request, response) {
    let value = request.body.value;

    if (state.coins < value) {
        response.json({ message: "Not enough coins left." })
    } else {
        state.coins -= value;
        console.log("before send token")
        send_Token(value, "watch");
        state.total_Rewards_in_Euro += value;
        // process visa pay out
        pushFundsRequest.amount = value.toString();
        visaAPIClient.doMutualAuthRequest(baseUri + resourcePath, JSON.stringify(pushFundsRequest), 'POST', {},
            function(err, responseCode, data) {
                if (!err) {
                    console.log(data);
                    let json = JSON.parse(data)
                    response.json({ date: new Date(), value: value, transactionId: json.transactionIdentifier });
                } else {
                    console.log(true);
                }
            });
    }
}

module.exports.benutzeCheatWeek = function(request, response) {
    let value = request.body.value;

    if (state.cheat_Weeks < value) {
        response.json({ message: "Not enough cheat weeks left." })
    } else {
        state.cheat_Weeks -= value;
        state.regularity += value * REGULARITY_RATIO;
        response.json({ date: new Date(), value: value });
    }
}

module.exports.getState = function(request, response) {
    getBalance().then(_balance => {
        state.coins = _balance;
        state.ether = state.coins * ETHER_EXCHANGE;
        state.euro = state.coins * EURO_EXCHANGE;
        console.log(`state: ${JSON.stringify(state)}`)
        response.json({ state });
    })
}

module.exports.getBalance = function(request, response) {
    getBalance().then(_balance => {
        response.json({ balance: _balance });
    }).catch(err => {
        response.status.json({ message: err });
    })
}

/* ############## internal functions */

function reset() {
    if (!initial) {
        initial = true
        return
    }
    state.distance_In_Current_Period = INITIAL_DISTANCE_IN_CURRENT_PERIOD;
    state.percentage_In_Current_Period = INITIAL_PERCENTAGE_IN_CURRENT_PERIOD;
    coins_Received = false;
    state.cheat_Weeks = INITIAL_NUM_CHEAT_WEEKS;
}

function getBalance() {
    return new Promise((resolve, reject) => {
        const HumanStandardToken_json = require("../Tokens/build/contracts/HumanStandardToken.json");
        const HumanStandardToken = contract(HumanStandardToken_json);
        HumanStandardToken.setProvider(new Web3.providers.HttpProvider(process.env.NODE_URL));
        let instance = HumanStandardToken.at(CONTRACT_ADDRESS)

        instance.balanceOf(STATIC_PUB_KEY_USER).then(res => {
            state.coins = res.toNumber();
            resolve(res.toNumber())
        })
    })
}

function send_Ether(_value) {
    return new Promise((resolve, reject) => {
        var nonce = web3.eth.getTransactionCount(STATIC_PUB_KEY_WATCH);
        var privateKey = new Buffer(STATIC_PRIVATE_KEY_WATCH, 'hex')

        var rawTx = {
            nonce: nonce,
            gasPrice: '0x09184e72a000',
            gasLimit: '0x10710',
            to: state.user_Account,
            value: web3.toHex(web3.toWei(_value, 'ether')),
            data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057'
        }

        var tx = new Tx(rawTx);
        tx.sign(privateKey);

        var serializedTx = tx.serialize();
        web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
            if (!err) {
                console.log("hash", hash)
                resolve(hash);
            } else {
                console.log(err);
                reject(err);
            }
        });
    })
}

function send_Token(_value, _to) {
    return new Promise((resolve, reject) => {
        let fromPub;
        let fromPriv;
        let toPub;

        switch (_to) {
            case "user":
                console.log("in user");
                fromPub = STATIC_PUB_KEY_WATCH;
                fromPriv = STATIC_PRIVATE_KEY_WATCH;
                toPub = STATIC_PUB_KEY_USER;
                break;
            case "watch":
                console.log("in watch")
                fromPub = STATIC_PUB_KEY_USER;
                fromPriv = STATIC_PRIVATE_KEY_USER;
                toPub = STATIC_PUB_KEY_WATCH;
                break;
        }

        const HumanStandardToken_json = require(path.join('..', 'Tokens', 'build', 'contracts', 'HumanStandardToken.json'));
        const HumanStandardToken = contract(HumanStandardToken_json);
        HumanStandardToken.setProvider(new Web3.providers.HttpProvider(process.env.NODE_URL));
        let instance = HumanStandardToken.at(CONTRACT_ADDRESS);

        let nonce = web3.eth.getTransactionCount(fromPub);
        let truffleMethodData = instance.transfer.request(toPub, _value);
        let data = truffleMethodData.params[0].data;

        let rawTx = {
            nonce: nonce,
            gasPrice: '0x09184e72a000',
            gasLimit: '0x10710',
            from: fromPub,
            to: CONTRACT_ADDRESS,
            data: data
        }

        let tx = new Tx(rawTx);

        let privateKey = new Buffer(fromPriv, 'hex')
        tx.sign(privateKey);

        let serializedTx = tx.serialize();
        console.log("executing sendRawTransaction")
        web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
            if (!err) {
                console.log(hash)
            } else {
                console.log(err);
            }
        });
    })
}

function connect(_node_Url = process.env.NODE_URL) {
    web3 = new Web3(new Web3.providers.HttpProvider(process.env.NODE_URL));
    if (web3 && !web3.isConnected()) {
        throw new Error("web3 is not connected. Please execute connect function if not already done. ")
    } else {
        console.log(`Connected to Node at ${process.env.NODE_URL}`)
    }
}

function update_Exchange_Rate() {
    request('https://api.coinmarketcap.com/v1/ticker/', function(error, response, body) {
        if (!error)
            ETHER_EXCHANGE = 1 / JSON.parse(body)[1].price_usd;
        console.log("Exchange Rate updated: ", ETHER_EXCHANGE)
    })
}