import React, { Component } from 'react';
import { Text, View, TouchableHighlight, Image } from 'react-native';
import Timestamp from 'react-timestamp';

import { CardSection } from './common';

class NotificationItem extends Component {
  state = {
    price: 0,
    loading: true
  }

  componentWillMount() {
    let uri = 'https://min-api.cryptocompare.com/data/price?fsym=';
    uri += this.props.item.Currency;
    uri += '&tsyms=USD';
    fetch(uri)
      .then(response => response.json())
        .then(responseJson => this.setState({ price: responseJson.USD, loading: false }));
  }

  onPress() {
    this.props.navigation.navigate('Notification', this.props.item);
  }

  renderItem() {
    const { ticker, estimatedPriceChange, time } = this.props.item;
    const date = new Date();
    const offsetInSeconds = date.getTimezoneOffset() * 60;
    if (this.props.coinInfo != null) {
      let uri = 'https://www.cryptocompare.com';
      uri += this.props.coinInfo.ImageUrl;
      return (
        <View>
          <CardSection style={{ alignItems: 'center' }}>
            <View style={{ alignItems: 'center' }}>
              <Image
                style={{ width: 25, height: 25 }}
                source={{ uri }}
              />
              <Text style={{ width: 65, fontSize: 16, color: 'white', textAlign: 'center' }}>{ticker}</Text>
            </View>
            <Text style={{ width: 140, fontSize: 16, textAlign: 'right', color: 'white' }}>{estimatedPriceChange}%</Text>
            <Timestamp time={time - offsetInSeconds} autoUpdate={5} component={Text} style={{ flex: 1, textAlign: 'right', paddingRight: 10, color: 'white', fontSize: 16 }} />
          </CardSection>
        </View>
      );
    }
    return (
      <View>
        <CardSection>
          <Text style={{ width: 65, paddingLeft: 0, fontSize: 16, textAlign: 'center', color: 'white' }}>{ticker}</Text>
          <Text style={{ width: 140, textAlign: 'right', fontSize: 16, color: 'white' }}>{estimatedPriceChange}%</Text>
          <Timestamp time={time - offsetInSeconds} autoUpdate={5} component={Text} style={{ flex: 1, textAlign: 'right', paddingRight: 10, color: 'white', fontSize: 16 }} />
        </CardSection>
      </View>
    );
  }

  render() {
    return (
      <TouchableHighlight onPress={this.onPress.bind(this)}>
        {this.renderItem()}
      </TouchableHighlight>
    );
  }
}

export default NotificationItem;
