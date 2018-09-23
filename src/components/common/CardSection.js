import React from 'react';
import { View } from 'react-native';

const CardSection = (props) => {
  return (
    <View style={styles.containerStyle}>
      {props.children}
    </View>
  );
};

const styles = {
  containerStyle: {
    borderBottomWidth: 1,
    padding: 5,
    backgroundColor: '#183016',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    borderColor: '#00994d',
    position: 'relative',
    flex: 1
  }
};

export { CardSection };
