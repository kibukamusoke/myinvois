import moment from 'moment-timezone';
import { HttpClient } from '../utils/http-client';
import { MyInvoisConfig } from '../config';
import { TokenManager } from '../utils/token-manager';

/**
 * Authentication service for MyInvois API
 */
export class AuthService {
  private httpClient: HttpClient;
  private config: MyInvoisConfig;
  private tokenManager: TokenManager;

  /**
   * Creates a new authentication service
   * @param httpClient The HTTP client to use
   * @param config The MyInvois configuration
   */
  constructor(httpClient: HttpClient, config: MyInvoisConfig) {
    this.httpClient = httpClient;
    this.config = config;
    this.tokenManager = new TokenManager();
  }

  /**
   * Authenticate with the MyInvois system
   * @returns A promise resolving to the authentication token
   */
  async authenticateSystem(): Promise<string> {
    // Check if we have a valid token
    const token = this.tokenManager.getDefaultToken();
    if (token) {
      return token;
    }

    // Need to get a new token
    const params = new URLSearchParams();
    params.append('client_id', this.config.clientId);
    params.append('client_secret', this.config.clientSecret);
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'InvoicingAPI');

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    try {
      const response = await this.httpClient.post(this.config.authUrl!, params, { headers });
      this.tokenManager.setDefaultToken(response.access_token, response.expires_in);
      return response.access_token;
    } catch (error) {
      console.error('Failed to authenticate with MyInvois:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Authenticate on behalf of a taxpayer
   * @param taxpayerTIN The taxpayer's TIN
   * @returns A promise resolving to the authentication token
   */
  async authenticateAsIntermediary(taxpayerTIN: string): Promise<string> {
    // Check if we have a valid token for this TIN
    const token = this.tokenManager.getTokenForTIN(taxpayerTIN);
    if (token) {
      return token;
    }

    // Need to get a new token
    const params = new URLSearchParams();
    params.append('client_id', this.config.clientId);
    params.append('client_secret', this.config.clientSecret);
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'InvoicingAPI');

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'onbehalfof': taxpayerTIN
    };

    try {
      const response = await this.httpClient.post(this.config.authUrl!, params, { headers });
      this.tokenManager.setTokenForTIN(taxpayerTIN, response.access_token, response.expires_in);
      return response.access_token;
    } catch (error) {
      console.error(`Failed to authenticate as intermediary for TIN ${taxpayerTIN}:`, error);
      throw new Error('Authentication as intermediary failed');
    }
  }

  /**
   * Get a valid token for a specific TIN or the system
   * @param authTIN The TIN to get a token for, or null for system token
   * @returns A promise resolving to the authentication token
   */
  async getToken(authTIN?: string): Promise<string> {
    if (authTIN) {
      return this.authenticateAsIntermediary(authTIN);
    } else {
      return this.authenticateSystem();
    }
  }

  /**
   * Get all TINs with valid tokens
   * @returns An array of TINs with valid tokens
   */
  getAllAuthenticatedTINs(): string[] {
    return this.tokenManager.getAllTINs();
  }

  /**
   * Validate a taxpayer's TIN
   * @param taxpayerTIN The taxpayer's TIN
   * @param idType The type of ID
   * @param idValue The value of the ID
   * @param authTIN The TIN to use for authentication
   * @returns A promise resolving to the validation result with consistent format
   */
  async validateTaxpayerTIN(taxpayerTIN: string, idType: string, idValue: string, authTIN?: string): Promise<{
    isValid: boolean;
    statusCode: number;
    message: string;
    data?: any;
  }> {
    const token = await this.getToken(authTIN);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const url = `${this.config.transactionUrl}/api/v1.0/taxpayer/validate/${taxpayerTIN}?idType=${idType}&idValue=${idValue}`;

    try {
      const response = await this.httpClient.get(url, { headers });
      // If we get here, the TIN is valid (API returns empty 200 response for valid TINs)
      return {
        isValid: true,
        statusCode: 200,
        message: "Valid taxpayer TIN",
        data: response
      };
    } catch (error: any) {
      if (error.statusCode === 404) {
        // TIN is invalid
        return {
          isValid: false,
          statusCode: 404,
          message: "Invalid taxpayer TIN"
        };
      }

      // Other errors
      console.error('Error validating taxpayer TIN:', error);
      return {
        isValid: false,
        statusCode: error.statusCode || 500,
        message: error.message || "TIN validation failed"
      };
    }
  }
}