import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
// import { useAppSelector } from '../src/store';

export default function Index() {
  // const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);

  const goToLogin = () => {
    router.push('/auth/login');
  };

  const goToTabs = () => {
    router.push('/(tabs)/feed');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚀 Ziririt App Test</Text>
      <Text style={styles.subtitle}>App is working!</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Auth Status:</Text>
        <Text style={styles.statusText}>Loading: false (temporarily disabled)</Text>
        <Text style={styles.statusText}>Authenticated: false (temporarily disabled)</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={goToLogin}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={goToTabs}>
          <Text style={styles.buttonText}>Go to Tabs (Test)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    minWidth: 200,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  buttonContainer: {
    gap: 15,
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
