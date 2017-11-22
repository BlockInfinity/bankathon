import React, { Component } from 'react';
import { Progress, Input } from 'reactstrap';
import { Circle } from 'rc-progress';
import Modal from 'react-modal';

//const ENDPOINT_URL = 'http://52.232.41.117:8000'
const ENDPOINT_URL = 'http://localhost:8000'

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
            regularity: 0
        }

        this.openEuroModal = this.openEuroModal.bind(this);
        this.closeEuroModal = this.closeEuroModal.bind(this);
        this.openCryptoModal = this.openCryptoModal.bind(this);
        this.closeCryptoModal = this.closeCryptoModal.bind(this);
        this.auszahlenInCrypto = this.auszahlenInCrypto.bind(this);
        this.auszahlenInEuro = this.auszahlenInEuro.bind(this);
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
                        regularity: responseJson.state.regularity
                    })
                })
                .catch((error) => {
                    console.log(error)
                });
            }, 500);
    }

    openEuroModal() {
        if (this.state.coins > 0) {
            this.setState({modalEuroIsOpen: true});
        }
    }

    closeEuroModal() {
        this.setState({modalEuroIsOpen: false});
    }

    openCryptoModal() {
        if (this.state.coins > 0) {
            this.setState({modalCryptoIsOpen: true});
        }
    }

    closeCryptoModal() {
        this.setState({modalCryptoIsOpen: false});
    }

    auszahlenInCrypto() {
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
                })
            }
        });
    }

    auszahlenInEuro() {
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
                })
            }
        });
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
                <div className="progress-circle">
                    <div id="progress-value">2</div>
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
            </div>
        )
    }
}

export default AppView
