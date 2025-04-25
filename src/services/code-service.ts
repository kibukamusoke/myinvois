import { HttpClient } from '../utils/http-client';
import { AuthService } from './auth-service';
import { MyInvoisConfig, DefaultUrls } from '../config';

/**
 * Service for retrieving code tables from MyInvois API
 */
export class CodeService {
  private httpClient: HttpClient;
  private authService: AuthService;
  private config: MyInvoisConfig;
  
  // Cache the code tables to avoid multiple API calls
  private codeTablesCache: Map<string, any> = new Map();

  /**
   * Creates a new code service
   * @param httpClient The HTTP client to use
   * @param authService The authentication service to use
   * @param config The MyInvois configuration
   */
  constructor(
    httpClient: HttpClient,
    authService: AuthService,
    config: MyInvoisConfig
  ) {
    this.httpClient = httpClient;
    this.authService = authService;
    this.config = config;
  }

  /**
   * Get the transaction URL
   * @returns The transaction URL
   */
  private getTransactionUrl(): string {
    if (!this.config.transactionUrl) {
      const environment = this.config.environment || 'sandbox';
      return DefaultUrls[environment as keyof typeof DefaultUrls].transactionUrl;
    }
    return this.config.transactionUrl;
  }

  /**
   * Get a code table from the API
   * @param codeType The type of code table to retrieve
   * @returns A promise resolving to the code table
   */
  async getCodeTable(codeType: string): Promise<any> {
    // Check if we have the code table in cache
    if (this.codeTablesCache.has(codeType)) {
      return this.codeTablesCache.get(codeType);
    }

    const headers = {
      'Content-Type': 'application/json'
    };

    const url = `https://sdk.myinvois.hasil.gov.my/files/${codeType}.json`;

    try {
      const response = await this.httpClient.get(url, { headers });
      
      // Cache the response
      this.codeTablesCache.set(codeType, response);
      
      return response;
    } catch (error) {
      console.error(`Failed to get code table for ${codeType}:`, error);
      throw new Error(`Failed to get code table for ${codeType}`);
    }
  }

  /**
   * Get all document types
   * @param authTIN The TIN to use for authentication (optional)
   * @returns A promise resolving to the document types
   */
  async getDocumentTypes(authTIN?: string): Promise<any> {
    const token = await this.authService.getToken(authTIN);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const url = `${this.config.transactionUrl}/api/v1.0/codes/documenttypes`;

    try {
      const response = await this.httpClient.get(url, { headers });
      return response;
    } catch (error) {
      console.error('Failed to get document types:', error);
      throw new Error('Failed to get document types');
    }
  }

  /**
   * Get all currency codes
   * @param authTIN The TIN to use for authentication (optional)
   * @returns A promise resolving to the currency codes
   */
  async getCurrencyCodes(authTIN?: string): Promise<any> {
    const token = await this.authService.getToken(authTIN);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const url = `${this.config.transactionUrl}/api/v1.0/codes/currencies`;

    try {
      const response = await this.httpClient.get(url, { headers });
      return response;
    } catch (error) {
      console.error('Failed to get currency codes:', error);
      throw new Error('Failed to get currency codes');
    }
  }

  /**
   * Get all state codes
   * @returns A promise resolving to the state codes
   */
  async getStateCodes(): Promise<any> {
    return this.getCodeTable('StateCodes');
  }

  /**
   * Get all country codes
   * @param authTIN The TIN to use for authentication (optional)
   * @returns A promise resolving to the country codes
   */
  async getCountryCodes(authTIN?: string): Promise<any> {
    const token = await this.authService.getToken(authTIN);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const url = `${this.config.transactionUrl}/api/v1.0/codes/countries`;

    try {
      const response = await this.httpClient.get(url, { headers });
      return response;
    } catch (error) {
      console.error('Failed to get country codes:', error);
      throw new Error('Failed to get country codes');
    }
  }

  /**
   * Get all tax types
   * @returns A promise resolving to the tax types
   */
  async getTaxTypes(): Promise<any> {
    return this.getCodeTable('TaxTypes');
  }

  /**
   * Get all industry codes (MSIC)
   * @returns A promise resolving to the industry codes
   */
  async getMSICCodes(): Promise<any> {
    return this.getCodeTable('MSICSubCategoryCodes');
  }

  /**
   * Get all unit codes
   * @returns A promise resolving to the unit codes
   */
  async getUnitCodes(): Promise<any> {
    return this.getCodeTable('UnitTypes');
  }

  /**
   * Get all payment means codes
   * @returns A promise resolving to the payment means codes
   */
  async getPaymentMethods(): Promise<any> {
    return this.getCodeTable('PaymentMethods');
  }

  /**
   * Get all commodity classification codes
   * @returns A promise resolving to the commodity classification codes
   */
  async getClassificationCodes(): Promise<any> {
    return this.getCodeTable('ClassificationCodes');
  }

  /**
   * Get all tax codes
   * @param authTIN The TIN to use for authentication (optional)
   * @returns A promise resolving to the tax codes
   */
  async getTaxCodes(authTIN?: string): Promise<any> {
    const token = await this.authService.getToken(authTIN);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const url = `${this.config.transactionUrl}/api/v1.0/codes/taxcodes`;

    try {
      const response = await this.httpClient.get(url, { headers });
      return response;
    } catch (error) {
      console.error('Failed to get tax codes:', error);
      throw new Error('Failed to get tax codes');
    }
  }
  

  /**
   * Clear the code tables cache
   */
  clearCache(): void {
    this.codeTablesCache.clear();
  }
}