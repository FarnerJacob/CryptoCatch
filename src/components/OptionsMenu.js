import React, { Component } from 'react';
import { View, Text, Picker, AsyncStorage, Button } from 'react-native';
import { connect } from 'react-redux';

import { updateApiKey, updateApiSecret, updateExchange, updateFiat, updateOrderHistory, updateRetrievePortfolio } from '../actions';
import { Input } from './common';

class OptionsMenu extends Component {
  state = {
    api: null,
    apiKey: null,
    apiSecret: null,
    fiat: 'usd'
  }

  componentDidMount() {
    this.getApiKey();
  }

  onButtonPress() {
    this.props.updateRetrievePortfolio(this.props.retrievePortfolio);
    this.props.updateApiKey(this.state.apiKey, this.props.exchange);
    this.props.updateApiSecret(this.state.apiSecret, this.props.exchange);
  }

  async getApiKey() {
    const api = { key: null, secret: null };
    try {
        api.key = await AsyncStorage.getItem('@' + this.props.exchange + 'Api:key');
        this.props.updateApiKey(api.key);
        api.secret = await AsyncStorage.getItem('@' + this.props.exchange + 'Api:secret');
        this.props.updateApiSecret(api.secret);
    } catch (error) {
      console.log(error);
    }
    this.setState({ api, apiKey: api.key, apiSecret: api.secret });
  }

  render() {
      return (
          <View style={{ height: 200, backgroundColor: '#29293d' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ width: 80, fontWeight: 'bold', fontSize: 16, color: 'white', textAlign: 'left' }}>Fiat</Text>
              <Picker
                style={{ width: 150, height: 50, color: 'white' }}
                selectedValue={this.props.fiat}
                onValueChange={(itemValue) => this.props.updateFiat(itemValue)}
              >
                <Picker.Item label="USD" value="USD" />
                <Picker.Item label="BTC" value="BTC" />
              </Picker>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ width: 80, fontWeight: 'bold', fontSize: 16, color: 'white', textAlign: 'left' }}>Exchange</Text>
              <Picker
                style={{ width: 150, height: 50, color: 'white' }}
                selectedValue={this.props.exchange}
                onValueChange={(itemValue) => {
                  this.props.updateExchange(itemValue);
                  this.props.updateOrderHistory(true);
                  this.props.updateRetrievePortfolio(this.props.retrievePortfolio);
                }}
              >
                <Picker.Item label="BitTrex" value="BitTrex" />
                <Picker.Item label="Binance" value="Binance" />
              </Picker>
            </View>
            <Input
              label={this.props.exchange + ' Key'}
              placeholder={this.state.api != null ? this.state.api.key : '0'}
              onChangeText={apiKey => this.setState({ apiKey })}
              value={this.state.apiKey}
            />
            <Input
              label={this.props.exchange + ' Secret'}
              placeholder={this.state.api != null ? this.state.api.secret : '0'}
              onChangeText={apiSecret => this.setState({ apiSecret })}
              value={this.state.apiSecret}
            />
            <Button onPress={this.onButtonPress.bind(this)} title='Update API Key/Secret' />
          </View>
      );
  }
}

const mapStateToProps = ({ crypto }) => {
  const { exchange, fiat, retrievePortfolio } = crypto;
  return { exchange, fiat, retrievePortfolio };
};

export default connect(mapStateToProps, { updateApiKey, updateApiSecret, updateExchange, updateFiat, updateOrderHistory, updateRetrievePortfolio })(OptionsMenu);
