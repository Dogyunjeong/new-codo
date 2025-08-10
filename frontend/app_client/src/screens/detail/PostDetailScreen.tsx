import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/MainNavigator';

type PostDetailRouteProp = RouteProp<MainStackParamList, 'PostDetail'>;

const PostDetailScreen: React.FC = () => {
  const route = useRoute<PostDetailRouteProp>();
  const { postId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Post Detail</Text>
        <Text style={styles.subtitle}>Post ID: {postId}</Text>
        <Text style={styles.placeholder}>
          Post detail view will be implemented here
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default PostDetailScreen;