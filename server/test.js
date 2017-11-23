'use strict';

const contract = require("truffle-contract");
const path = require("path");
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

const STATIC_PUB_KEY_WATCH = "0x290CEE9385cE6DdcC4FFfb59C607D4B2E740b951";
const STATIC_PRIVATE_KEY_WATCH = "cf1e1d95cd862418b2138a6b018e5a5129693ca3c3e17332e1ccd0503a7c5ab8";
const STATIC_PUB_KEY_USER = '0xf0433Ad2cddA1179D764a1d2410aB90cFB124B35';


let bcUrl = "https://ropsten.infura.io/";
// let bcUrl = 'http://localhost:8001/api/v1/namespaces/blockchain/services/geth-ropsten:8545/proxy/';

let web3 = new Web3(new Web3.providers.HttpProvider(bcUrl));
if (web3 && !web3.isConnected()) {
	throw new Error("web3 is not connected. Please execute connect function if not already done. ")
} else {
	console.log(`Connected to Node at ${bcUrl}`)
}



const HumanStandardToken_json = require(path.join('..', 'Tokens', 'build', 'contracts', 'HumanStandardToken.json'));
const HumanStandardToken = contract(HumanStandardToken_json);

HumanStandardToken.setProvider(new Web3.providers.HttpProvider('http://localhost:8001/api/v1/namespaces/blockchain/services/geth-ropsten:8545/proxy/'));

// HumanStandardToken.setProvider(new Web3.providers.HttpProvider(bcUrl));




/* ################ Deploy script */ 
let _initialAmount = 100000
let _tokenName = "HealthCoin"
let _decimalUnits = 0
let _tokenSymbol = "HC"

HumanStandardToken.new(
         _initialAmount,
         _tokenName,
         _decimalUnits,
         _tokenSymbol,
        { from: "0x290cee9385ce6ddcc4fffb59c607d4b2e740b951", gas: 4600000 });



// let instance = HumanStandardToken.at("0xbF0F633dE6844Fc52d4B857277FBb036fa5814e5")


// let balance = instance.balanceOf(STATIC_PUB_KEY_WATCH).then(res => {
// 	console.log(res.toNumber());
// })


// let number = web3.eth.getTransactionCount(STATIC_PUB_KEY_WATCH);


// // instance.transfer.getData(STATIC_PUB_KEY_WATCH, 1);

// let truffleMethodData = instance.transfer.request(STATIC_PUB_KEY_USER, 1);
// let data = truffleMethodData.params[0].data;

// console.log(data);



// let rawTx = {
// 	nonce: number,
// 	gasPrice: '0x09184e72a000',
// 	gasLimit: '0x10710',
// 	from: STATIC_PUB_KEY_WATCH,
// 	to: "0xbF0F633dE6844Fc52d4B857277FBb036fa5814e5",
// 	data: data
// }

// let tx = new Tx(rawTx);

// let privateKey = new Buffer(STATIC_PRIVATE_KEY_WATCH, 'hex')
// tx.sign(privateKey);

// let serializedTx = tx.serialize();

// web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
// 	if (!err) {
// 		console.log(hash)
// 	} else {
// 		console.log(err);
// 	}
// });