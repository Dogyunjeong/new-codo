import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../services/ApiClient';
import { handleApiError } from '../../utils/errorHandler';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Async thunks
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.loginWithGoogle(code);
      if (response && (response as any).user && (response as any).accessToken) {
        const { user, accessToken } = response as any;
        apiClient.setAuthToken(accessToken);
        return { user, token: accessToken };
      }
      throw new Error('Invalid login response');
    } catch (error: any) {
      const apiError = handleApiError(error);
      return rejectWithValue(apiError.message);
    }
  }
);

export const loginWithApple = createAsyncThunk(
  'auth/loginWithApple',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.loginWithApple(code);
      if (response && (response as any).user && (response as any).accessToken) {
        const { user, accessToken } = response as any;
        apiClient.setAuthToken(accessToken);
        return { user, token: accessToken };
      }
      throw new Error('Invalid login response');
    } catch (error: any) {
      const apiError = handleApiError(error);
      return rejectWithValue(apiError.message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getCurrentUser();
      return response;
    } catch (error: any) {
      const apiError = handleApiError(error);
      return rejectWithValue(apiError.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.logout();
      return null;
    } catch (error: any) {
      // Even if logout fails on server, clear local state
      apiClient.clearAuthToken();
      return null;
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.refreshToken();
      if (response && (response as any).accessToken) {
        const { accessToken } = response as any;
        apiClient.setAuthToken(accessToken);
        return { token: accessToken };
      }
      throw new Error('Token refresh failed');
    } catch (error: any) {
      const apiError = handleApiError(error);
      return rejectWithValue(apiError.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuthToken: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      apiClient.setAuthToken(action.payload.token);
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      apiClient.clearAuthToken();
    },
  },
  extraReducers: (builder) => {
    // Login with Google
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Login with Apple
    builder
      .addCase(loginWithApple.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithApple.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithApple.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload as User;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
      });

    // Refresh token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
      })
      .addCase(refreshToken.rejected, (state) => {
        // Token refresh failed, logout user
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setAuthToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;