import React, { Component } from 'react';
import { View, Text } from 'react-native';

import Chart from './Chart';

class Notification extends Component {

  componentWillMount() {
  }

  render() {
    return (
      <View>
        <Chart fsym={this.props.navigation.state.params.ticker} tsym='BTC' />
        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Estimated Price Change: {this.props.navigation.state.params.estimatedPriceChange}</Text>
        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>This notification is in response to the following tweet:</Text>
        <Text>{this.props.navigation.state.params.tweet}</Text>
      </View>
    );
  }
}

export default Notification;
