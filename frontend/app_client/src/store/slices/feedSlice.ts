import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../services/ApiClient';
import { handleApiError } from '../../utils/errorHandler';

export interface FeedItem {
  id: string;
  type: 'post';
  content: any;
  user: {
    id: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
  };
  timestamp: string;
  socialStats: {
    likesCount: number;
    commentsCount: number;
  };
}

interface FeedState {
  items: FeedItem[];
  hasMore: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastRefresh: Date | null;
  currentPage: number;
}

const initialState: FeedState = {
  items: [],
  hasMore: true,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastRefresh: null,
  currentPage: 1,
};

// Async thunks
export const loadFeed = createAsyncThunk(
  'feed/loadFeed',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await apiClient.getHomeFeed(page, limit);
      return {
        items: (response as any).items || [],
        hasMore: (response as any).hasMore || false,
        page,
      };
    } catch (error: any) {
      const apiError = handleApiError(error);
      return rejectWithValue(apiError.message);
    }
  }
);

export const refreshFeed = createAsyncThunk(
  'feed/refreshFeed',
  async (_, { rejectWithValue }) => {
    try {
      // First refresh the feed cache on server
      await apiClient.refreshFeed();
      
      // Then load fresh data
      const response = await apiClient.getHomeFeed(1, 20);
      return {
        items: (response as any).items || [],
        hasMore: (response as any).hasMore || false,
      };
    } catch (error: any) {
      const apiError = handleApiError(error);
      return rejectWithValue(apiError.message);
    }
  }
);

export const loadMoreFeed = createAsyncThunk(
  'feed/loadMoreFeed',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { feed: FeedState };
      const nextPage = state.feed.currentPage + 1;
      
      const response = await apiClient.getHomeFeed(nextPage, 20);
      return {
        items: (response as any).items || [],
        hasMore: (response as any).hasMore || false,
        page: nextPage,
      };
    } catch (error: any) {
      const apiError = handleApiError(error);
      return rejectWithValue(apiError.message);
    }
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    clearFeed: (state) => {
      state.items = [];
      state.hasMore = true;
      state.currentPage = 1;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addFeedItem: (state, action: PayloadAction<FeedItem>) => {
      // Add new item to the beginning of the feed
      state.items.unshift(action.payload);
    },
    updateFeedItem: (state, action: PayloadAction<{ id: string; updates: Partial<FeedItem> }>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
      }
    },
    removeFeedItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateSocialStats: (state, action: PayloadAction<{ postId: string; likesCount?: number; commentsCount?: number }>) => {
      const { postId, likesCount, commentsCount } = action.payload;
      const item = state.items.find(item => item.id === postId);
      if (item) {
        if (likesCount !== undefined) {
          item.socialStats.likesCount = likesCount;
        }
        if (commentsCount !== undefined) {
          item.socialStats.commentsCount = commentsCount;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Load feed
    builder
      .addCase(loadFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.hasMore = action.payload.hasMore;
        state.currentPage = action.payload.page;
        state.lastRefresh = new Date();
        state.error = null;
      })
      .addCase(loadFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh feed
    builder
      .addCase(refreshFeed.pending, (state) => {
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(refreshFeed.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.items = action.payload.items;
        state.hasMore = action.payload.hasMore;
        state.currentPage = 1;
        state.lastRefresh = new Date();
        state.error = null;
      })
      .addCase(refreshFeed.rejected, (state, action) => {
        state.isRefreshing = false;
        state.error = action.payload as string;
      });

    // Load more feed
    builder
      .addCase(loadMoreFeed.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadMoreFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = [...state.items, ...action.payload.items];
        state.hasMore = action.payload.hasMore;
        state.currentPage = action.payload.page;
      })
      .addCase(loadMoreFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearFeed, 
  clearError, 
  addFeedItem, 
  updateFeedItem, 
  removeFeedItem, 
  updateSocialStats 
} = feedSlice.actions;

export default feedSlice.reducer;