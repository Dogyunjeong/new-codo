import { API_CONFIG } from '../config/api.config';

export interface ServiceStatus {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'checking';
  error?: string;
}

export const testServiceConnections = async (): Promise<ServiceStatus[]> => {
  const services = [
    { name: 'Auth Service', url: `${API_CONFIG.authServiceUrl}/health` },
    { name: 'Profile Service', url: `${API_CONFIG.profileServiceUrl}/health` },
    { name: 'Post Service', url: `${API_CONFIG.postServiceUrl}/health` },
    { name: 'Feed Service', url: `${API_CONFIG.feedServiceUrl}/health` },
  ];
  
  const results: ServiceStatus[] = [];
  
  for (const service of services) {
    try {
      const response = await fetch(service.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      results.push({
        name: service.name,
        url: service.url,
        status: response.ok ? 'online' : 'offline',
        error: !response.ok ? `Status: ${response.status}` : undefined,
      });
    } catch (error: any) {
      results.push({
        name: service.name,
        url: service.url,
        status: 'offline',
        error: error.message || 'Connection failed',
      });
    }
  }
  
  return results;
};

export const logConnectionStatus = async () => {
  console.log('Testing service connections...');
  console.log('API Configuration:', API_CONFIG);
  
  const results = await testServiceConnections();
  
  console.log('\n=== Service Connection Status ===');
  results.forEach(service => {
    const statusEmoji = service.status === 'online' ? '✅' : '❌';
    console.log(`${statusEmoji} ${service.name}: ${service.status}`);
    if (service.error) {
      console.log(`   Error: ${service.error}`);
    }
    console.log(`   URL: ${service.url}`);
  });
  console.log('=================================\n');
  
  return results;
};