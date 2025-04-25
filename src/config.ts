/**
 * Configuration interface for the MyInvois client
 */
export interface MyInvoisConfig {
    /**
     * The client ID for authentication with MyInvois
     */
    clientId: string;
    
    /**
     * The client secret for authentication with MyInvois
     */
    clientSecret: string;
    
    /**
     * The TIN (Tax Identification Number) of the system owner
     */
    tin: string;
    
    /**
     * The authentication URL for the MyInvois API
     * If not provided, it will be derived from the environment
     */
    authUrl?: string;
    
    /**
     * The transaction URL for the MyInvois API
     * If not provided, it will be derived from the environment
     */
    transactionUrl?: string;
    
    /**
     * The path to the certificate file
     */
    certificatePath: string;
    
    /**
     * The path to the private key file
     */
    privateKeyPath: string;
    
    /**
     * The passphrase for the private key
     */
    privateKeyPassphrase: string;
    
    /**
     * The environment (production or sandbox)
     * Defaults to 'sandbox' if not provided
     */
    environment?: 'production' | 'sandbox';
  }
  
  /**
   * Default URLs for different environments
   */
  export const DefaultUrls = {
    production: {
      authUrl: 'https://identity.myinvois.hasil.gov.my/connect/token',
      transactionUrl: 'https://api.myinvois.hasil.gov.my'
    },
    sandbox: {
      authUrl: 'https://preprod-api.myinvois.hasil.gov.my/connect/token',
      transactionUrl: 'https://preprod-api.myinvois.hasil.gov.my'
    }
  };