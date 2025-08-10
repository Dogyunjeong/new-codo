import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { loadFeed, refreshFeed, loadMoreFeed } from '../../src/store/slices/feedSlice';

export default function FeedScreen() {
  const dispatch = useAppDispatch();
  const { items, isLoading, isRefreshing, error, hasMore } = useAppSelector(state => state.feed);

  useEffect(() => {
    // Load initial feed
    dispatch(loadFeed({ page: 1 }));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(refreshFeed());
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      dispatch(loadMoreFeed());
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.feedItem}>
      <Text style={styles.userName}>{item.user?.displayName || 'Unknown User'}</Text>
      <Text style={styles.content}>{JSON.stringify(item.content)}</Text>
      <View style={styles.stats}>
        <Text>Likes: {item.socialStats?.likesCount || 0}</Text>
        <Text>Comments: {item.socialStats?.commentsCount || 0}</Text>
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.centerContainer}>
              <Text>No posts in your feed yet</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && items.length > 0 ? (
            <ActivityIndicator style={styles.loader} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  feedItem: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  content: {
    fontSize: 14,
    marginBottom: 10,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
});