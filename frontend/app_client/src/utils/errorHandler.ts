import { Alert } from 'react-native';

export class ApiError extends Error {
  code?: string;
  statusCode?: number;
  
  constructor(message: string, code?: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const handleApiError = (error: any): ApiError => {
  // Network error (no connection)
  if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
    return new ApiError(
      'Cannot connect to server. Please ensure backend services are running.',
      'NETWORK_ERROR'
    );
  }
  
  // Timeout error
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError(
      'Request timed out. Please try again.',
      'TIMEOUT'
    );
  }
  
  // HTTP errors
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    
    switch (status) {
      case 401:
        return new ApiError('Authentication failed. Please login again.', 'UNAUTHORIZED', 401);
      case 403:
        return new ApiError('You do not have permission to perform this action.', 'FORBIDDEN', 403);
      case 404:
        return new ApiError('The requested resource was not found.', 'NOT_FOUND', 404);
      case 500:
        return new ApiError('Server error. Please try again later.', 'SERVER_ERROR', 500);
      default:
        return new ApiError(message || 'An error occurred', 'API_ERROR', status);
    }
  }
  
  // Unknown error
  return new ApiError(
    error.message || 'An unexpected error occurred',
    'UNKNOWN_ERROR'
  );
};

export const showErrorAlert = (error: ApiError | Error) => {
  const message = error instanceof ApiError ? error.message : 'An unexpected error occurred';
  
  Alert.alert(
    'Error',
    message,
    [{ text: 'OK' }],
    { cancelable: true }
  );
};