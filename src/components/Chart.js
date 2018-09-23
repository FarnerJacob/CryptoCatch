import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { VictoryCandlestick, VictoryChart, VictoryTheme } from 'victory-native';

import { Spinner } from './common';

class Chart extends Component {
  state = { data: [], xLabels: [], loading: true }

  componentWillMount() {
    let uri = 'https://min-api.cryptocompare.com/data/histominute?fsym=';
    uri += this.props.fsym;
    uri += '&tsym=';
    uri += this.props.tsym;
    uri += '&limit=60&e=Bittrex';
    fetch(uri)
      .then(response => response.json())
        .then(responseJson => {
          const data = [];
          for (let i = 0; i < responseJson.Data.length; i++) {
            const hour = Math.floor((responseJson.Data[i].time % 86400) / 3600);
            const minute = (responseJson.Data[i].time % 3600) / 60;
            if (minute % 5 === 0) {
              const temp = this.state.xLabels;
              temp.push(hour + ':' + minute);
              this.setState({ xLabels: temp });
            }
            data.push({ x: hour + ':' + minute, open: responseJson.Data[i].open, close: responseJson.Data[i].close, high: responseJson.Data[i].high, low: responseJson.Data[i].low });
          }
          this.setState({ data, loading: false });
        });
  }

  refresh() {
    let uri = 'https://min-api.cryptocompare.com/data/histominute?fsym=';
    uri += this.props.fsym;
    uri += '&tsym=';
    uri += this.props.tsym;
    uri += '&limit=60&e=Bittrex';
    fetch(uri)
      .then(response => response.json())
        .then(responseJson => {
          const data = [];
          for (let i = 0; i < responseJson.Data.length; i++) {
            const hour = Math.floor((responseJson.Data[i].time % 86400) / 3600);
            const minute = (responseJson.Data[i].time % 3600) / 60;
            if (minute % 5 === 0) {
              const temp = this.state.xLabels;
              temp.push(hour + ':' + minute);
              this.setState({ xLabels: temp });
            }
            data.push({ x: hour + ':' + minute, open: responseJson.Data[i].open, close: responseJson.Data[i].close, high: responseJson.Data[i].high, low: responseJson.Data[i].low });
          }
          this.setState({ data, loading: false });
        });
  }

  render() {
    if (this.props.refresh) {
      this.setState({ loading: true });
      this.refresh();
    }
    if (this.state.loading) {
      return (
        <View style={{ height: 350, alignItems: 'center', backgroundColor: '#ffffff' }}>
          <Spinner />
        </View>
      );
    }
    if (this.state.data.length <= 0) {
      return (
        <View style={{ height: 350, backgroundColor: '#ffffff' }}>
          <Text style={{ textAlign: 'center' }}>This trading pair is unavailable</Text>
          <VictoryChart theme={VictoryTheme.material} padding={{ right: 15, left: 90, top: 30, bottom: 40 }} />
        </View>
      );
    }
    return (
      <View style={{ height: 350, backgroundColor: '#ffffff' }}>
        <VictoryChart theme={VictoryTheme.material} padding={{ right: 15, left: 90, top: 30, bottom: 40 }}>
          <VictoryCandlestick candleColors={{ positive: '#1dfc00', negative: '#fc0000' }} data={this.state.data} x={0} />
        </VictoryChart>
      </View>
    );
  }
}

export default Chart;
