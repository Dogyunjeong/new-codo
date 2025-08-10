const React = require('react');

// Create proper React Native mock components
const View = ({ children, style, testID, ...props }) => 
  React.createElement('div', { 'data-testid': testID, style, ...props }, children);

const Text = ({ children, style, testID, ...props }) => 
  React.createElement('span', { 'data-testid': testID, style, ...props }, children);

const TouchableOpacity = ({ children, onPress, style, testID, ...props }) =>
  React.createElement('button', { 
    'data-testid': testID,
    onClick: onPress,
    style,
    ...props 
  }, children);

const ActivityIndicator = ({ testID, ...props }) =>
  React.createElement('div', { 'data-testid': testID, ...props }, 'Loading...');

// Mock React Native modules as ES6 exports
module.exports = {
  StyleSheet: {
    create: (styles) => styles,
  },
  View,
  Text, 
  TouchableOpacity,
  ActivityIndicator,
  Alert: {
    alert: jest.fn(),
  },
};