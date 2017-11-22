var request = require('request');

update_Exchange_Rate().then(data => {
    console.log(data);
})

function update_Exchange_Rate() {
    return new Promise((resolve, reject) => {
        request('https://api.coinmarketcap.com/v1/ticker/', function(error, response, body) {
            if (error) reject(error);
            resolve(JSON.parse(body)[1].price_usd);
        })
    });
}
