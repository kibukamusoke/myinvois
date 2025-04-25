import { HttpClient } from '../utils/http-client';
import { AuthService } from './auth-service';
import { MyInvoisConfig } from '../config';

/**
 * Service for document operations
 */
export class DocumentService {
  private httpClient: HttpClient;
  private authService: AuthService;
  private config: MyInvoisConfig;

  /**
   * Creates a new document service
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
   * Get document status
   * @param documentUuid The UUID of the document
   * @param taxpayerTIN The taxpayer's TIN (for whom the document was created)
   * @param authTIN The TIN to use for authentication
   * @returns A promise resolving to the document status
   */
  async getDocumentStatus(documentUuid: string, taxpayerTIN?: string, authTIN?: string): Promise<any> {
    // Use authTIN for authentication if provided, otherwise use taxpayerTIN
    const token = await this.authService.getToken(authTIN || taxpayerTIN);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const url = `${this.config.transactionUrl}/api/v1.0/documents/${documentUuid}/details`;

    try {
      const response = await this.httpClient.get(url, { headers });
      return response;
    } catch (error) {
      console.error('Failed to get document status:', error);
      throw new Error('Failed to get document status');
    }
  }

  /**
   * Get submission details
   * @param submissionUuid The UUID of the submission
   * @param taxpayerTIN The taxpayer's TIN (for whom the submission was made)
   * @param authTIN The TIN to use for authentication
   * @param pageNo The page number (default: 1)
   * @param pageSize The page size (default: 100)
   * @returns A promise resolving to the submission details
   */
  async getSubmissionDetails(
    submissionUuid: string,
    taxpayerTIN?: string,
    authTIN?: string,
    pageNo: number = 1,
    pageSize: number = 100
  ): Promise<any> {
    // Use authTIN for authentication if provided, otherwise use taxpayerTIN
    const token = await this.authService.getToken(authTIN || taxpayerTIN);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const url = `${this.config.transactionUrl}/api/v1.0/documentsubmissions/${submissionUuid}?pageNo=${pageNo}&pageSize=${pageSize}`;

    try {
      const response = await this.httpClient.get(url, { headers });
      return response;
    } catch (error) {
      console.error('Failed to get submission details:', error);
      throw new Error('Failed to get submission details');
    }
  }

  /**
   * List documents
   * @param taxpayerTIN The taxpayer's TIN (for whom the documents were created)
   * @param authTIN The TIN to use for authentication
   * @param options The query options
   * @returns A promise resolving to the list of documents
   */
  async listDocuments(taxpayerTIN?: string, authTIN?: string, options: {
    pageNo?: number;
    pageSize?: number;
    documentNumber?: string;
    fromDate?: string;
    toDate?: string;
    status?: string;
  } = {}): Promise<any> {
    // Use authTIN for authentication if provided, otherwise use taxpayerTIN
    const token = await this.authService.getToken(authTIN || taxpayerTIN);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (options.pageNo) queryParams.append('pageNo', options.pageNo.toString());
    if (options.pageSize) queryParams.append('pageSize', options.pageSize.toString());
    if (options.documentNumber) queryParams.append('documentNumber', options.documentNumber);
    if (options.fromDate) queryParams.append('fromDate', options.fromDate);
    if (options.toDate) queryParams.append('toDate', options.toDate);
    if (options.status) queryParams.append('status', options.status);

    const url = `${this.config.transactionUrl}/api/v1.0/documents?${queryParams.toString()}`;

    try {
      const response = await this.httpClient.get(url, { headers });
      return response;
    } catch (error) {
      console.error('Failed to list documents:', error);
      throw new Error('Failed to list documents');
    }
  }
}