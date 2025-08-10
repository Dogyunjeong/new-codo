import authReducer, {
  clearError,
  setAuthToken,
  clearAuth,
  loginWithGoogle,
  loginWithApple,
  getCurrentUser,
  logout,
} from '../slices/authSlice';

// Mock API client
jest.mock('../../services/ApiClient', () => ({
  apiClient: {
    loginWithGoogle: jest.fn(),
    loginWithApple: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    setAuthToken: jest.fn(),
    clearAuthToken: jest.fn(),
  },
}));

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle clearError', () => {
    const previousState = { ...initialState, error: 'Some error' };
    expect(authReducer(previousState, clearError())).toEqual({
      ...initialState,
      error: null,
    });
  });

  it('should handle setAuthToken', () => {
    const user = { id: '1', username: 'testuser', email: 'test@test.com', displayName: 'Test User' };
    const token = 'test-token';
    
    expect(authReducer(initialState, setAuthToken({ user, token }))).toEqual({
      ...initialState,
      user,
      token,
      isAuthenticated: true,
      error: null,
    });
  });

  it('should handle clearAuth', () => {
    const authenticatedState = {
      user: { id: '1', username: 'testuser', email: 'test@test.com', displayName: 'Test User' },
      token: 'test-token',
      isLoading: false,
      isAuthenticated: true,
      error: null,
    };
    
    expect(authReducer(authenticatedState, clearAuth())).toEqual(initialState);
  });

  describe('async thunks', () => {
    it('should handle loginWithGoogle.pending', () => {
      const action = { type: loginWithGoogle.pending.type };
      const state = authReducer(initialState, action);
      
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle loginWithGoogle.fulfilled', () => {
      const user = { id: '1', username: 'testuser', email: 'test@test.com', displayName: 'Test User' };
      const token = 'test-token';
      
      const action = {
        type: loginWithGoogle.fulfilled.type,
        payload: { user, token },
      };
      
      const state = authReducer(initialState, action);
      
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(user);
      expect(state.token).toBe(token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle loginWithGoogle.rejected', () => {
      const action = {
        type: loginWithGoogle.rejected.type,
        payload: 'Login failed',
      };
      
      const state = authReducer(initialState, action);
      
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Login failed');
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle logout.fulfilled', () => {
      const authenticatedState = {
        user: { id: '1', username: 'testuser', email: 'test@test.com', displayName: 'Test User' },
        token: 'test-token',
        isLoading: false,
        isAuthenticated: true,
        error: null,
      };
      
      const action = { type: logout.fulfilled.type };
      const state = authReducer(authenticatedState, action);
      
      expect(state).toEqual(initialState);
    });
  });
});