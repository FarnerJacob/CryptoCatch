import React from 'react';
import { Text, View } from 'react-native';

const OrdersHeader = () => {
  const { viewStyle } = styles;
  return (
    <View style={viewStyle}>
      <Text style={{ fontSize: 14, width: 90, textAlign: 'center', paddingLeft: 10, color: 'white' }}>Market</Text>
      <Text style={{ fontSize: 14, paddingLeft: 40, width: 110, textAlign: 'left', color: 'white' }}>Type</Text>
      <Text style={{ fontSize: 14, width: 100, textAlign: 'center', paddingRight: 10, color: 'white' }}>Price Per Unit</Text>
      <Text style={{ fontSize: 14, paddingLeft: 10, width: 100, textAlign: 'left', paddingRight: 10, color: 'white' }}>Quantity</Text>
    </View>
  );
};

const styles = {
  viewStyle: {
    backgroundColor: '#00600e',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 2,
    position: 'relative'
  },
  textStyle: {
    fontSize: 14,
    color: 'white'
  }
};

export default OrdersHeader;
