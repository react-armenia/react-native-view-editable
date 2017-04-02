# react-native-view-editable

[![Build Status](https://travis-ci.org/react-armenia/react-native-view-editable.svg?branch=master)](https://travis-ci.org/react-armenia/rreact-native-view-editable) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=plastic)](https://github.com/semantic-release/semantic-release)

### The one of the missing piece of react-native.
### Highly performant view transformation with gestures ✋.
### This library makes ANY views editable using gestures like pinch, double tap or pull. You can scale/rotate/move any view

### Getting Started
```sh
$ npm install react-native-view-editable --save
```
or
```sh
$ yarn add react-native-view-editable
```

### Usage
```javascript
/**
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { ViewEditor } from 'react-native-view-editable';

export default class App extends Component {
  render() {
    return (
        <ViewEditor
          style={styles.container}
          scaleBounds={{ min: 1, max: 10 }}
          onMove={() => console.log('move')}
          onMoveEnd={() => console.log('move end')}
        >
            <View>
                <Text style={styles.welcome}>
                    Welcome to React Native!
                </Text>
                <Text style={styles.instructions}>
	            To get started, edit index.ios.js
	            </Text>
	            <Text style={styles.instructions}>
	            Press Cmd+R to reload,{'\n'}
	            Cmd+D or shake for dev menu
	            </Text>
            </View>
        </ViewEditor>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('App', () => App);
```
