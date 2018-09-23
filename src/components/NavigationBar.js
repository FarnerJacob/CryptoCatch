import React, { Component } from 'react';
import BottomNavigation, { Tab } from 'react-native-material-bottom-navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

class NavigationBar extends Component {
  state = {
  }

  componentDidMount() {

  }

  switchTabs(newTabIndex) {
    const { navigation } = this.props;
    if (newTabIndex === 0) {
      navigation.navigate('News');
    } else if (newTabIndex === 1) {
      navigation.navigate('Main');
    }
  }

  render() {
    return (
      <BottomNavigation
        labelColor="white"
        rippleColor="white"
        activeTab={this.props.activeTab}
        style={{ height: 56, elevation: 8, position: 'absolute', left: 0, bottom: 0, right: 0 }}
        onTabChange={(newTabIndex) => this.switchTabs(newTabIndex)}
      >
        <Tab
          barBackgroundColor="#37474F"
          label="News"
          icon={<Icon size={24} color="white" name="newspaper" />}
        />
        <Tab
          barBackgroundColor="#00796B"
          label="Portfolio"
          icon={<Icon size={24} color="white" name="account-card-details" />}
        />
        <Tab
          barBackgroundColor="#5D4037"
          label="Trade"
          icon={<Icon size={24} color="white" name="coins" />}
        />
        <Tab
          barBackgroundColor="#3E2723"
          label="Newsstand"
          icon={<Icon size={24} color="white" name="menu" />}
        />
      </BottomNavigation>
    );
  }
}

export default NavigationBar;
