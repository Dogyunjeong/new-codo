import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Required', 'Please enter some content for your post');
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Create post via API
      console.log('Creating post:', content);
      Alert.alert('Success', 'Post created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity onPress={handlePost} disabled={!content.trim() || isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={[styles.postButton, !content.trim() && styles.disabledButton]}>
              Post
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Share your progress..."
          value={content}
          onChangeText={setContent}
          maxLength={500}
          textAlignVertical="top"
          autoFocus
        />
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="camera-outline" size={24} color="#666" />
            <Text style={styles.actionText}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="location-outline" size={24} color="#666" />
            <Text style={styles.actionText}>Location</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.characterCount}>{content.length}/500</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  postButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  disabledButton: {
    color: '#ccc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#1a1a1a',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    color: '#666',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'flex-end',
  },
  characterCount: {
    fontSize: 14,
    color: '#666',
  },
});

export default CreatePostScreen;