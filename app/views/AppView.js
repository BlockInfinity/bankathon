import React, { Component } from 'react';
import { Progress, Input } from 'reactstrap';
import { Circle } from 'rc-progress';
import Modal from 'react-modal';

const ENDPOINT_URL = 'http://52.232.41.117:8000'
//const ENDPOINT_URL = 'http://localhost:8000'

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    backgroundColor       : '#c6eaf9'
  }
};

class AppView extends Component {

    constructor(props) {
        super(props)
        this.state = {
            userAccount: 0,
            watchAccount: 0,
            distanceInCurrentPeriod: 0,
            percentageInCurrentPeriod: 0,
            coins: 0,
            coinsAuszahlen: 0,
            ether: 0,
            euro: 0,
            txhistory: [],
            totalRewardsInEther: 0,
            modalCryptoIsOpen: false,
            modalEuroIsOpen: false,
            regularity: 0,
            cheakWeeks: 0,
            modalCryptoConfirmIsOpen: false,
            modalEuroConfirmIsOpen: false,
            confirmationCrypto: '...',
            confirmationEuro: '...'
        }

        this.openEuroModal = this.openEuroModal.bind(this);
        this.closeEuroModal = this.closeEuroModal.bind(this);
        this.openCryptoModal = this.openCryptoModal.bind(this);
        this.closeCryptoModal = this.closeCryptoModal.bind(this);
        this.auszahlenInCrypto = this.auszahlenInCrypto.bind(this);
        this.auszahlenInEuro = this.auszahlenInEuro.bind(this);
        this.useCheatWeek = this.useCheatWeek.bind(this);
        this.closeCryptoConfirmModal = this.closeCryptoConfirmModal.bind(this);
        this.closeEuroConfirmModal = this.closeEuroConfirmModal.bind(this);
    }

    componentDidMount() {
        let self = this;
        setInterval(function() {
            return fetch(ENDPOINT_URL + '/state')
                .then((response) => response.json())
                .then((responseJson) => {
                    self.setState({
                        userAccount: responseJson.state.user_Account,
                        watchAccount: responseJson.state.watch_Account,
                        distanceInCurrentPeriod: responseJson.state.distance_In_Current_Period,
                        percentageInCurrentPeriod: responseJson.state.percentage_In_Current_Period,
                        coins: responseJson.state.coins,
                        ether: responseJson.state.ether,
                        euro: responseJson.state.euro,
                        txhistory: responseJson.state.txhistory,
                        totalRewardsInEther: responseJson.state.total_Rewards_in_Ether,
                        regularity: responseJson.state.regularity,
                        cheatWeeks: responseJson.state.cheat_Weeks
                    })
                })
                .catch((error) => {
                    console.log(error)
                });
            }, 5000);
    }

    openEuroModal() {
        if (this.state.coins > 0) {
            this.setState({
                coinsAuszahlen: 1,
                modalEuroIsOpen: true
            });
        }
    }

    closeEuroModal() {
        this.setState({modalEuroIsOpen: false});
    }

    openCryptoModal() {
        if (this.state.coins > 0) {
            this.setState({
                coinsAuszahlen: 1,
                modalCryptoIsOpen: true
            });
        }
    }

    closeCryptoModal() {
        this.setState({modalCryptoIsOpen: false});
    }

    closeCryptoConfirmModal() {
        this.setState({modalCryptoConfirmIsOpen: false});
    }

    closeEuroConfirmModal() {
        this.setState({modalEuroConfirmIsOpen: false});
    }

    auszahlenInCrypto() {
        let self = this
        this.setState({
          modalCryptoIsOpen: !this.state.modalCryptoIsOpen
        }, () => {
            if (!this.state.modalCryptoIsOpen && this.state.coinsAuszahlen && this.state.coinsAuszahlen > 0 && this.state.coins > 0) {
                return fetch(ENDPOINT_URL + '/zahleInKryptoAus', {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    value: this.state.coinsAuszahlen
                  })
                }).then(function(response) {
                    return response.json();
                  })
                  .then(function(json) {
                    console.log('Request successful', json);
                    self.setState({
                        modalCryptoConfirmIsOpen: true,
                        confirmationCrypto: json.link
                    })
                  })
            }
        });
    }

    auszahlenInEuro() {
        let self = this
        this.setState({
          modalEuroIsOpen: !this.state.modalEuroIsOpen
        }, () => {
            if (!this.state.modalEuroIsOpen && this.state.coinsAuszahlen && this.state.coinsAuszahlen > 0 && this.state.coins > 0) {
                return fetch(ENDPOINT_URL + '/zahleInEuroAus', {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    value: this.state.coinsAuszahlen
                  })
                }).then(function(response) {
                return response.json();
                  })
                  .then(function(json) {
                    console.log('Request successful', json);
                    self.setState({
                        modalEuroConfirmIsOpen: true,
                        confirmationEuro: json.transactionId
                    })
                  })
            }
        });
    }

    useCheatWeek() {
        let value = 1;
        if (this.state.cheatWeeks > 0) {
            this.setState({
              cheatWeeks: this.state.cheatWeeks-value
            }, () => {
                return fetch(ENDPOINT_URL + '/benutzeCheatWeek', {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    value: value
                  })
                })
            });
        }
    }

    render() {
        return (
            <div>
                <div>
                    <div id="euro-value" onClick={this.openEuroModal}>{this.state.euro} &euro;</div>
                    <div id="health-coins">{this.state.coins}</div>
                    <div id="ether-value" onClick={this.openCryptoModal}>{this.state.ether.toString().substring(0, 5)}</div>
                </div>
                <div className="progress-bar-wrapper">
                    <Progress bar color="success" value={this.state.percentageInCurrentPeriod * 100}>{this.state.percentageInCurrentPeriod * 100} %</Progress>
                </div>
                <div className="progress-circle" onClick={this.useCheatWeek}>
                    <div id="progress-value">{this.state.cheatWeeks}</div>
                    <Circle percent={this.state.regularity * 100} strokeWidth="10" strokeColor="#22ace3" trailWidth="10" trailColor="#77d1ed"/>
                </div>

                <Modal
                  isOpen={this.state.modalCryptoIsOpen}
                  onRequestClose={this.closeCryptoModal}
                  style={customStyles}
                  contentLabel="Auszahlen (Ether)"
                >
                  <h2>Auszahlen</h2>
                  <div>HealthCoins in Ether auszahlen:</div>
                  <form>
                    <Input type="text" value={this.state.coinsAuszahlen} onChange={(ev) => { this.setState({ coinsAuszahlen: ev.target.value }) }}/>
                    <button onClick={this.closeCryptoModal}>Abbrechen</button>
                    <button onClick={this.auszahlenInCrypto}>Ok</button>
                  </form>
                </Modal>

                <Modal
                  isOpen={this.state.modalCryptoConfirmIsOpen}
                  onRequestClose={this.closeCryptoConfirmModal}
                  style={customStyles}
                  contentLabel="Auszahlung in Ether Erfolgreich"
                >
                  <h2>Transkation ID:</h2>
                  <a href={this.state.confirmationCrypto}>Etherscan</a>
                  <form>
                    <button onClick={this.closeCryptoConfirmModal}>Ok</button>
                  </form>
                </Modal>

                <Modal
                  isOpen={this.state.modalEuroIsOpen}
                  onRequestClose={this.closeEuroModal}
                  style={customStyles}
                  contentLabel="Auszahlen (Euro)"
                >
                  <h2>Auszahlen</h2>
                  <div>HealthCoins in EUR auszahlen:</div>
                  <form>
                    <Input type="text" maxValue={10} value={this.state.coinsAuszahlen} onChange={(ev) => { this.setState({ coinsAuszahlen: ev.target.value }) }}/>
                    <button onClick={this.closeEuroModal}>Abbrechen</button>
                    <button onClick={this.auszahlenInEuro}>Ok</button>
                  </form>
                </Modal>

                <Modal
                  isOpen={this.state.modalEuroConfirmIsOpen}
                  onRequestClose={this.closeEuroConfirmModal}
                  style={customStyles}
                  contentLabel="Auszahlung in Euro Erfolgreich"
                >
                  <h2>Transkation ID:</h2>
                  <span>{this.state.confirmationEuro}</span>
                  <form>
                    <button onClick={this.closeEuroConfirmModal}>Ok</button>
                  </form>
                </Modal>
            </div>
        )
    }
}

export default AppView
