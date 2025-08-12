import { AuthController } from '@base/shared-api-controllers';

interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    username?: string;
    avatar?: string;
  };
}

interface SignupResponse extends LoginResponse {}

export class AuthService {
  private authController: AuthController;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:4101') {
    this.baseURL = baseURL;
    this.authController = new AuthController({ baseURL });
  }

  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    // For now, we'll mock the login since the backend uses OAuth
    // In production, this would call a proper email/password endpoint
    console.log('Login attempt with:', credentials.email);

    // Mock response for development
    return {
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: '1',
        email: credentials.email,
        name: 'Test User',
        username: '@testuser',
        avatar: 'https://i.pravatar.cc/150?img=5',
      },
    };
  }

  async signup(data: { email: string; password: string; name: string }): Promise<SignupResponse> {
    // Mock response for development
    console.log('Signup attempt with:', data.email);

    return {
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: '1',
        email: data.email,
        name: data.name,
        username: `@${data.name.toLowerCase().replace(/\s/g, '')}`,
        avatar: 'https://i.pravatar.cc/150?img=5',
      },
    };
  }

  async googleLogin(idToken: string): Promise<LoginResponse> {
    const response = await this.authController.googleAuth({
      idToken,
      deviceId: 'mobile-device',
    });
    return response as LoginResponse;
  }

  async appleLogin(idToken: string): Promise<LoginResponse> {
    const response = await this.authController.appleAuth({
      idToken,
      deviceId: 'mobile-device',
    });
    return response as LoginResponse;
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ token: string; refreshToken?: string; user?: any }> {
    const response = await this.authController.refreshToken(refreshToken);
    return response as { token: string; refreshToken?: string; user?: any };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.authController.logout(refreshToken);
    }
  }

  async verifyToken(): Promise<boolean> {
    try {
      await this.authController.verifyToken();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getCurrentUser(): Promise<any> {
    return await this.authController.getCurrentUser();
  }

  setAccessToken(token: string): void {
    this.authController.setAccessToken(token);
  }
}
