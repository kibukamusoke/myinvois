import { HttpClient } from '../utils/http-client';
import { AuthService } from './auth-service';
import { CertificateHandler } from '../utils/certificate-handler';
import { DocumentSigner } from '../utils/document-signer';
import { Invoice } from '../models/invoice';
import { SignedInvoice } from '../models/signed-invoice';
import { MyInvoisConfig } from '../config';
import * as crypto from 'crypto';

/**
 * Service for invoice operations
 */
export class InvoiceService {
  private httpClient: HttpClient;
  private authService: AuthService;
  private certificateHandler: CertificateHandler;
  private documentSigner: DocumentSigner;
  private config: MyInvoisConfig;

  /**
   * Creates a new invoice service
   * @param httpClient The HTTP client to use
   * @param authService The authentication service to use
   * @param certificateHandler The certificate handler to use
   * @param config The MyInvois configuration
   */
  constructor(
    httpClient: HttpClient,
    authService: AuthService,
    certificateHandler: CertificateHandler,
    config: MyInvoisConfig
  ) {
    this.httpClient = httpClient;
    this.authService = authService;
    this.certificateHandler = certificateHandler;
    this.documentSigner = new DocumentSigner(certificateHandler);
    this.config = config;
  }

  /**
   * Sign an invoice
   * @param invoice The invoice to sign
   * @returns A promise resolving to the signed invoice
   */
  async signInvoice(invoice: Invoice): Promise<SignedInvoice> {
    return this.documentSigner.signInvoice(invoice);
  }

  /**
   * Submit a signed invoice
   * @param signedInvoice The signed invoice to submit
   * @param taxpayerTIN The taxpayer's TIN (for whom the invoice is created)
   * @param authTIN The TIN to use for authentication
   * @returns A promise resolving to the submission result
   */
  async submitInvoice(signedInvoice: SignedInvoice, taxpayerTIN?: string, authTIN?: string): Promise<any> {
    console.log('signedInvoice', JSON.stringify(signedInvoice, null, 2));
    let documentB64: string = Buffer.from(JSON.stringify(signedInvoice)).toString('base64');
    
    let documentToSubmit = {
      format: 'JSON',
      document: documentB64,
      documentHash: this.calculateSHA256Hex(JSON.stringify(signedInvoice)),
      codeNumber: signedInvoice.invoice.id,
      //signature: signature
    };

    // Use authTIN for authentication if provided, otherwise use taxpayerTIN
    const token = await this.authService.getToken(authTIN || taxpayerTIN);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const url = `${this.config.transactionUrl}/api/v1.0/documentsubmissions/`;
    const payload = {
      documents: [documentToSubmit]
    };

    console.log('payload', JSON.stringify(payload, null, 2));
      // get the payload size in KB ::
      //console.log('payload', JSON.stringify(signedDocuments[0]));
      console.log('payload size', JSON.stringify(payload).length / 1024);

    try {
      console.log('Submitting invoice to MyInvois:', payload);
      const response = await this.httpClient.post(url, payload, { headers });
      return response;
    } catch (error) {
      console.error('Failed to submit invoice to MyInvois:', error);
      console.log('error', JSON.stringify(error, null, 2));
      throw new Error('Invoice submission failed');
    }
  }

  /**
   * Submit multiple signed invoices
   * @param signedInvoices The signed invoices to submit
   * @param taxpayerTIN The taxpayer's TIN (for whom the invoices are created)
   * @param authTIN The TIN to use for authentication
   * @returns A promise resolving to the submission result
   */
  async submitInvoices(signedInvoices: SignedInvoice[], taxpayerTIN?: string, authTIN?: string): Promise<any> {
    // Use authTIN for authentication if provided, otherwise use taxpayerTIN
    const token = await this.authService.getToken(authTIN || taxpayerTIN);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const url = `${this.config.transactionUrl}/api/v1.0/documentsubmissions/`;
    const payload = {
      documents: signedInvoices.map(invoice => invoice.toJSON())
    };

    try {
      const response = await this.httpClient.post(url, payload, { headers });
      return response;
    } catch (error) {
      console.error('Failed to submit invoices to MyInvois:', error);
      throw new Error('Invoice submission failed');
    }
  }

  /**
   * Create a builder for an invoice
   * @returns An invoice instance for building
   */
  createInvoice(): Invoice {
    return new Invoice();
  }

  public calculateSHA256Hex(input: string): string {
    try {
      // Create a hash object for SHA-256
      const hash = crypto.createHash('sha256');

      // Update the hash object with the input string
      hash.update(input, 'utf8');

      // Calculate the digest and return it as a hexadecimal string
      return hash.digest('hex');
    } catch (error) {
      throw new Error(`Failed to calculate SHA256 hash: ${error}`);
    }
  }


  /**
   * Cancel an invoice
   * @param documentUuid The UUID of the document to cancel
   * @param reason The reason for cancellation
   * @param taxpayerTIN The taxpayer's TIN (for whom the invoice was created)
   * @param authTIN The TIN to use for authentication
   * @returns A promise resolving to the cancellation result
   */
  async cancelInvoice(documentUuid: string, reason: string, taxpayerTIN?: string, authTIN?: string): Promise<any> {
    // Use authTIN for authentication if provided, otherwise use taxpayerTIN
    const token = await this.authService.getToken(authTIN || taxpayerTIN);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const url = `${this.config.transactionUrl}/api/v1.0/documents/state/${documentUuid}/state`;
    const payload = {
      status: 'cancelled',
      reason: reason.substring(0, 300) // Limit to 300 chars as per docs
    };

    try {
      const response = await this.httpClient.put(url, payload, { headers });
      return response;
    } catch (error: any) {
      if (error.statusCode === 400) {
        const errorCode = error.responseData?.error?.code;
        
        switch (errorCode) {
          case 'OperationPeriodOver':
            throw new Error('Cancellation period has expired (72 hours)');
          case 'IncorrectState':
            throw new Error('Invoice cannot be cancelled in its current state');
          case 'ActiveReferencingDocuments':
            throw new Error('Invoice has active referencing documents');
          default:
            throw new Error(error.responseData?.error?.message || 'Error cancelling invoice');
        }
      }

      console.error('Failed to cancel invoice:', error);
      throw new Error('Invoice cancellation failed');
    }
  }
}