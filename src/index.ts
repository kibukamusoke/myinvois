import { MyInvoisClient } from './client';
import { MyInvoisConfig, DefaultUrls } from './config';

// Export client
export { MyInvoisClient };

// Export config interfaces
export { MyInvoisConfig, DefaultUrls };

// Export models
export * from './models';

// Export services
export * from './services';

// Export utilities
export * from './utils';

/**
 * Create a complete configuration object from a partial one
 * @param config The base configuration
 * @returns A complete configuration with all required fields
 */
export function createConfig(config: {
  clientId: string;
  clientSecret: string;
  tin: string;
  certificatePath: string;
  privateKeyPath: string;
  privateKeyPassphrase: string;
  environment?: 'production' | 'sandbox';
  authUrl?: string;
  transactionUrl?: string;
}): MyInvoisConfig {
  // Create a base configuration
  const completeConfig: MyInvoisConfig = {
    ...config,
    environment: config.environment || 'sandbox'
  };
  
  // Set default URLs based on environment
  const environment = completeConfig.environment;
  const urls = DefaultUrls[environment as keyof typeof DefaultUrls];
  
  if (!completeConfig.authUrl) {
    completeConfig.authUrl = urls.authUrl;
  }
  
  if (!completeConfig.transactionUrl) {
    completeConfig.transactionUrl = urls.transactionUrl;
  }
  
  return completeConfig;
}

/**
 * Create a new MyInvois client
 * @param config The configuration for the client
 * @returns A new MyInvois client
 */
export function createClient(config: {
  clientId: string;
  clientSecret: string;
  tin: string;
  certificatePath: string;
  privateKeyPath: string;
  privateKeyPassphrase: string;
  environment?: 'production' | 'sandbox';
  authUrl?: string;
  transactionUrl?: string;
}): MyInvoisClient {
  const completeConfig = createConfig(config);
  return new MyInvoisClient(completeConfig);
}