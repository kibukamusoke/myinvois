import { AuthService } from './services/auth-service';
import { InvoiceService } from './services/invoice-service';
import { DocumentService } from './services/document-service';
import { HttpClient } from './utils/http-client';
import { CertificateHandler } from './utils/certificate-handler';
import { DefaultUrls, MyInvoisConfig } from './config';
import { CodeService } from './services/code-service';
import { CertificateInfo, CertificateChainInfo } from './models/certificate-info';

/**
 * Main client for interacting with the MyInvois API
 */
export class MyInvoisClient {
  private config: MyInvoisConfig;
  private httpClient: HttpClient;
  private authService: AuthService;
  private invoiceService: InvoiceService;
  private documentService: DocumentService;
  private certificateHandler: CertificateHandler;
  private codeService: CodeService;
  /**
   * Creates a new MyInvois client
   * @param config Configuration for the MyInvois client
   */
  constructor(config: MyInvoisConfig) {
    // Ensure config has all required properties
    this.config = {
      ...config,
      environment: config.environment || 'sandbox'
    };
    
    // Set default URLs if not provided
    if (!this.config.authUrl || !this.config.transactionUrl) {
      const environment = this.config.environment;
      const urls = DefaultUrls[environment as keyof typeof DefaultUrls];
      
      if (!this.config.authUrl) {
        this.config.authUrl = urls.authUrl;
      }
      
      if (!this.config.transactionUrl) {
        this.config.transactionUrl = urls.transactionUrl;
      }
    }
    
    this.httpClient = new HttpClient();
    this.certificateHandler = new CertificateHandler({
      certificatePath: this.config.certificatePath,
      privateKeyPath: this.config.privateKeyPath,
      privateKeyPassphrase: this.config.privateKeyPassphrase
    });
    
    this.authService = new AuthService(this.httpClient, this.config);
    this.invoiceService = new InvoiceService(
      this.httpClient, 
      this.authService,
      this.certificateHandler,
      this.config
    );
    this.documentService = new DocumentService(
      this.httpClient, 
      this.authService,
      this.config
    );
    this.codeService = new CodeService(
      this.httpClient,
      this.authService,
      this.config
    );
  }

  /**
   * Authenticate with the MyInvois system
   * @returns A promise resolving to the authentication token
   */
  async authenticate(): Promise<string> {
    return this.authService.authenticateSystem();
  }

  /**
   * Authenticate on behalf of a taxpayer
   * @param taxpayerTIN The taxpayer's TIN
   * @returns A promise resolving to the authentication token
   */
  async authenticateAsIntermediary(taxpayerTIN: string): Promise<string> {
    return this.authService.authenticateAsIntermediary(taxpayerTIN);
  }

  /**
   * Get a valid token for authentication
   * @param authTIN The TIN to use for authentication (optional)
   * @returns A promise resolving to the authentication token
   */
  async getToken(authTIN?: string): Promise<string> {
    return this.authService.getToken(authTIN);
  }

  /**
   * Get all TINs that have valid authentication tokens
   * @returns An array of TINs
   */
  getAllAuthenticatedTINs(): string[] {
    return this.authService.getAllAuthenticatedTINs();
  }

  /**
   * Get details about the certificate chain
   * @returns A promise resolving to the certificate details
   */
  async getCertificateDetails(): Promise<CertificateChainInfo> {
    try {
      // Ensure the certificate handler is initialized
      await this.certificateHandler.initialize();

      const now = new Date();
      const formatCertInfo = (cert: any): CertificateInfo => {
        const daysUntilExpiry = Math.ceil((cert.validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          subject: cert.subject,
          issuer: cert.issuer,
          serialNumber: cert.serialNumber,
          validFrom: cert.validFrom,
          validTo: cert.validTo,
          daysUntilExpiry,
          isValid: now >= cert.validFrom && now <= cert.validTo
        };
      };

      return {
        signing: formatCertInfo(this.certificateHandler.getSigningCertificate()),
        intermediate: formatCertInfo(this.certificateHandler.getIntermediateCertificate()),
        root: formatCertInfo(this.certificateHandler.getRootCertificate())
      };
    } catch (error: any) {
      console.error('Error fetching certificate details:', error);
      throw new Error(error.message || 'An error occurred while fetching certificate details');
    }
  }

  /**
   * Validate a taxpayer's TIN
   * @param taxpayerTIN The taxpayer's TIN
   * @param idType The type of ID
   * @param idValue The value of the ID
   * @param authTIN The TIN to use for authentication (optional)
   * @returns A promise resolving to the validation result with consistent format
   */
  async validateTaxpayerTIN(taxpayerTIN: string, idType: string, idValue: string, authTIN?: string): Promise<{
    isValid: boolean;
    statusCode: number;
    message: string;
    data?: any;
  }> {
    return this.authService.validateTaxpayerTIN(taxpayerTIN, idType, idValue, authTIN);
  }

  /**
   * Get the invoice service for creating and managing invoices
   * @returns The invoice service
   */
  get invoices(): InvoiceService {
    return this.invoiceService;
  }

  /**
   * Get the document service for managing documents
   * @returns The document service
   */
  get documents(): DocumentService {
    return this.documentService;
  }

  /**
   * Get the code service for retrieving code tables
   * @returns The code service
   */
  get codes(): CodeService {
    return this.codeService;
  }
}