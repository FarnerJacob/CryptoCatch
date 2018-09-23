import React, { Component } from 'react';
import { FlatList, View } from 'react-native';
import { connect } from 'react-redux';

import NotificationItem from './NotificationItem';
import NavigationBar from './NavigationBar';
import { fetchNotifications } from '../actions';
import Header from './Header';

class Notifications extends Component {
  //TODO: add spot to check the last time the server finished a cycle
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      page: 1,
      seed: 1,
      error: null,
      refreshing: false,
    };
  }

  componentWillMount() {
    this.props.fetchNotifications();
  }

  render() {
    return (
      <View style={{ paddingTop: 0, flex: 1, backgroundColor: '#183016' }}>
        <Header />
        <FlatList
          data={this.props.notifications}
          keyExtractor={item => item.uuid}
          renderItem={({ item }) => <NotificationItem item={item} navigation={this.props.navigation} coinInfo={this.props.coinList[item.ticker]} />}
        />
        <NavigationBar navigation={this.props.navigation} activeTab={0} />
      </View>
    );
  }
}

const mapStateToProps = ({ crypto }) => {
  const { notifications, coinList } = crypto;
  return { notifications, coinList };
};

export default connect(mapStateToProps, { fetchNotifications })(Notifications);
