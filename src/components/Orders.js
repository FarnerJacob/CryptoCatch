import React, { Component } from 'react';
import { FlatList, View, Text } from 'react-native';
import { sha512 } from 'js-sha512';
import { sha256 } from 'js-sha256';
import { FloatingAction } from 'react-native-floating-action';
import { connect } from 'react-redux';

import OrderItem from './OrderItem';
import OrdersHeader from './OrdersHeader';
import { Spinner } from './common';

class Orders extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      load: true,
      loading: false,
      page: 1,
      receivedOrderHistory: false,
      seed: 1,
      error: null,
      refreshing: false,
    };
  }

  componentDidUpdate() {
    this.getOrders();
  }

  onRefresh() {
    this.setState({ receivedOrderHistory: false, refreshing: true });
    this.getOrders();
  }

  async getOrders() {
    console.log(this.props.exchange + ' getOrders');
    if (this.props.apiKey !== null && this.props.apiKey !== null && !this.state.receivedOrderHistory) {
      if (this.props.exchange === 'BitTrex') {
        console.log('gets into the refresh');
        let uri = 'https://bittrex.com/api/v1.1/account/getorderhistory?apikey=';
        uri += this.props.apiKey;
        uri += '&nonce=';
        uri += new Date().getTime();
        const secret = this.props.apiSecret;
        const encrypted = sha512.hmac.create(secret);
        encrypted.update(uri);
        encrypted.hex();
        const closedOrders = await fetch(uri, {
          headers: { apisign: encrypted }
        }).then(response => response.json())
          .then(responseJson => {
            return responseJson.result;
          })
          .catch((error) => console.log(error));
        uri = 'https://bittrex.com/api/v1.1/market/getopenorders?apikey=';
        uri += this.props.apiKey;
        uri += '&nonce=';
        uri += new Date().getTime();
        const newEncrypted = sha512.hmac.create(secret);
        newEncrypted.update(uri);
        newEncrypted.hex();
        fetch(uri, {
          headers: { apisign: newEncrypted }
        }).then(openOrdersResult => openOrdersResult.json())
          .then(openOrdersJson => {
            const openOrders = openOrdersJson.result;
            closedOrders.forEach((item) => {
              openOrders.push(item);
            });
            console.log(openOrders);
            this.setState({ data: openOrders, load: false, receivedOrderHistory: true, refreshing: false });
          })
          .catch((error) => console.log(error));
      } else if (this.props.exchange === 'Binance') {
        console.log('Binance');
        let uri = 'https://api.binance.com/api/v1/time';
        const time = await fetch(uri, {
          headers: { 'X-MBX-APIKEY': this.props.apiKey, verbose: true },
        })
          .then(response => response.json())
            .then(responseJson => responseJson.serverTime);
        const base = 'https://api.binance.com/api/v3/openOrders?';
        uri = 'timestamp=';
        uri += time;
        const secret = this.props.apiSecret;
        const encrypted = sha256.hmac.create(secret);
        encrypted.update(uri);
        encrypted.hex();
        uri += '&signature=';
        uri += encrypted;
        uri = base + uri;
        //fetch the portfolio
        await fetch(uri, {
          headers: { 'X-MBX-APIKEY': this.props.apiKey, verbose: true },
        }).then(response => response.json())
          .then(responseJson => this.setState({ data: responseJson, receivedOrderHistory: true, refreshing: false }))
          .catch((error) => console.log(error));
      }
    }
  }

  makeOrder = (type) => {
    this.props.navigation.navigate('OrderForm', type);
  }

  render() {
    if (this.state.load) {
      return (
        <Spinner />
      );
    }
    const actions = [
      {
        icon: require('./images/bIcon.png'),
        name: 'buy',
        position: 1
      },
      {
        icon: require('./images/sIcon2.png'),
        name: 'sell',
        position: 2
      }
    ];

    if (this.state.data.length > 0) {
      return (
        <View style={{ paddingTop: 0, flex: 1, backgroundColor: '#183016' }}>
          <OrdersHeader />
          <FlatList
            data={this.state.data}
            refreshing={this.state.refreshing}
            onRefresh={() => this.onRefresh()}
            keyExtractor={item => item.OrderUuid}
            renderItem={({ item }) => <OrderItem item={item} navigation={this.props.navigation} />}
          />
          <FloatingAction
            actions={actions}
            onPressItem={
              (name) => {
                this.makeOrder(name);
              }
            }
          />
        </View>
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: '#183016', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white' }}>Your order history is empty.</Text>
        <FloatingAction
          actions={actions}
          onPressItem={
            (name) => {
              this.makeOrder(name);
            }
          }
        />
      </View>
    );
  }
}

const mapStateToProps = ({ crypto }) => {
  const { apiKey, apiSecret, cancelModal, exchange, fiat, retrievePortfolio, refreshOrderHistory } = crypto;
  return { apiKey, apiSecret, cancelModal, exchange, fiat, retrievePortfolio, refreshOrderHistory };
};

export default connect(mapStateToProps)(Orders);
