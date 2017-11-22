import React, { Component } from 'react';
import { Progress, Input } from 'reactstrap';
import { Circle } from 'rc-progress';
import Modal from 'react-modal';

const ENDPOINT_URL = 'http://52.232.41.117:8000'

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '40%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    width                 : '60%'
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
            modalIsOpen: false,
            regularity: 0
        }

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.okModal = this.okModal.bind(this);
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
                        coinsAuszahlen: responseJson.state.coins,
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

    openModal() {
        if (this.state.coins > 0) {
            this.setState({modalIsOpen: true});
        }
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    okModal() {
        this.setState({
          modalIsOpen: !this.state.modalIsOpen
        }, () => {
            if (!this.state.modalIsOpen && this.state.coinsAuszahlen && this.state.coinsAuszahlen > 0 && this.state.coins > 0) {
                return fetch(ENDPOINT_URL + '/zahleAus', {
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
                    <div id="euro-value">{this.state.euro} &euro;</div>
                    <div id="ether-value" onClick={this.openModal}>{this.state.ether}</div>
                    <div id="debicoins">{this.state.coins}</div>
                </div>
                <div className="progressbar">
                    <Progress bar color="success" value={this.state.percentageInCurrentPeriod * 100}>{this.state.percentageInCurrentPeriod * 100} %</Progress>
                </div>
                <div className="progressCircle">
                    <div id="progress-value">2</div>
                    <Circle percent={this.state.regularity * 100} strokeWidth="10" strokeColor="#22ace3" trailWidth="10" trailColor="#77d1ed"/>
                </div>

               <Modal
                  isOpen={this.state.modalIsOpen}
                  onRequestClose={this.closeModal}
                  style={customStyles}
                  contentLabel="Auszahlen"
                >
                  <h2>Auszahlen</h2>
                  <div>DebiCoins als Ether auszahlen:</div>
                  <form>
                    <Input type="number" step="1" value={this.state.coinsAuszahlen} onChange={() => { console.log() }}/>
                    <button onClick={this.closeModal}>Abbrechen</button>
                    <button onClick={this.okModal}>Ok</button>
                  </form>
                </Modal>
            </div>
        )
    }
}

export default AppView
