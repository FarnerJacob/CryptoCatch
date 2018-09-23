import React, { Component } from 'react';
import { Button, Text, View, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';
import { sha512 } from 'js-sha512';

import { CardSection } from './common';

// TODO: use a redux list of orders and delete the cancelled order, and add an animation for the deletion
class OrderItem extends Component {
  state = {
    cancelling: false,
    cancelled: false,
    price: 0,
    loading: true,
    showModal: false
  }

  onPress() {
    this.props.navigation.navigate('Order', this.props.item);
  }

  onPressCancel() {
    this.setState({ showModal: true });
  }

  async onPressConfirmCancel() {
    this.setState({ cancelling: true });
    if (this.props.exchange === 'BitTrex') {
      let uri = 'https://bittrex.com/api/v1.1/market/cancel?apikey=';
      uri += this.props.apiKey;
      uri += '&uuid=';
      uri += this.props.item.OrderUuid;
      uri += '&nonce=';
      uri += new Date().getTime();
      const secret = this.props.apiSecret;
      const encrypted = sha512.hmac.create(secret);
      encrypted.update(uri);
      encrypted.hex();
      fetch(uri, {
        headers: { apisign: encrypted }
      }).then(() => {
        this.setState({ cancelled: true });
        this.onPressHideModal();
      })
        .catch((error) => console.log(error));
    }
  }

  onPressHideModal() {
    this.setState({ showModal: false });
  }

  renderItem() {
    if (this.state.cancelled) {
      return <View />;
    }
    const { Closed, PricePerUnit, Quantity, OrderType, Exchange, Limit } = this.props.item;
    if (Closed !== null) {
      return (
        <View>
          <CardSection>
            <Text style={{ width: 80, paddingLeft: 0, fontSize: 16, textAlign: 'left', color: 'white' }}>{Exchange}</Text>
            <View>
              <Text style={{ width: 100, paddingLeft: 0, fontSize: 16, textAlign: 'left', color: 'white' }}>{OrderType}</Text>
              <Text style={{ width: 80, fontSize: 16, textAlign: 'center', color: 'white' }}>Closed</Text>
            </View>
            <Text style={{ width: 100, paddingLeft: 0, fontSize: 16, textAlign: 'left', color: 'white' }}>{PricePerUnit}</Text>
            <Text style={{ width: 100, paddingLeft: 0, fontSize: 16, textAlign: 'left', color: 'white' }}>{Quantity}</Text>
          </CardSection>
        </View>
      );
    }
    return (
      <View>
        <Modal isVisible={this.state.showModal} onBackdropPress={this.onPressHideModal.bind(this)}>
          <View style={{ height: 100, backgroundColor: 'white' }}>
            <View style={{ paddingTop: 10 }}>
              <Text style={{ textAlign: 'center' }}>Are you sure you want to cancel this order?</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 10 }}>
              <View style={{ paddingLeft: 50 }}>
                <Button title='Yes' onPress={this.onPressConfirmCancel.bind(this)} />
              </View>
              <View style={{ paddingRight: 50 }}>
                <Button title='No' color='red' style={{ paddingRight: 50 }} onPress={this.onPressHideModal.bind(this)} />
              </View>
            </View>
          </View>
        </Modal>
        <CardSection>
          <View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ width: 80, paddingLeft: 0, fontSize: 16, textAlign: 'left', color: 'white' }}>{Exchange}</Text>
              <View>
                <Text style={{ width: 100, paddingLeft: 0, fontSize: 16, textAlign: 'left', color: 'white' }}>{OrderType}</Text>
                <Text style={{ width: 80, fontSize: 16, textAlign: 'center', color: 'white' }}>Open</Text>
              </View>
              <Text style={{ width: 100, paddingLeft: 0, fontSize: 16, textAlign: 'left', color: 'white' }}>{Limit.toFixed(8)}</Text>
              <Text style={{ width: 100, paddingLeft: 0, fontSize: 16, textAlign: 'left', color: 'white' }}>{Quantity}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Button title='Cancel' onPress={this.onPressCancel.bind(this)} />
            </View>
          </View>
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

const mapStateToProps = ({ crypto }) => {
  const { apiKey, apiSecret, exchange } = crypto;
  return { apiKey, apiSecret, exchange };
};

export default connect(mapStateToProps)(OrderItem);
