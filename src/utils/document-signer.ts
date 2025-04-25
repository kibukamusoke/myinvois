import * as crypto from 'crypto';
import { CertificateHandler } from './certificate-handler';
import { Invoice } from '../models/invoice';
import { SignedInvoice } from '../models/signed-invoice';
import { SignatureInfo } from '../models/signature-info';
import { SignedProperties } from '../models/signed-properties';

/**
 * Handles document signing operations
 */
export class DocumentSigner {
  private certificateHandler: CertificateHandler;

  /**
   * Creates a new document signer
   * @param certificateHandler The certificate handler to use
   */
  constructor(certificateHandler: CertificateHandler) {
    this.certificateHandler = certificateHandler;
  }

  /**
   * Signs an invoice
   * @param invoice The invoice to sign
   * @returns A signed invoice
   */
  async signInvoice(invoice: Invoice): Promise<SignedInvoice> {
    // Make sure the certificate handler is initialized
    await this.certificateHandler.initialize();

    // Get the invoice JSON
    const invoiceJson = invoice.toJSON();

    // Transform the JSON for signing
    const transformedJson = this.transformForSigning(invoiceJson);

    // Generate the document hash
    const documentHash = this.generateDocumentHash(transformedJson);

    // Generate the signature
    const signature = this.certificateHandler.signData(transformedJson);

    // Create signed properties
    const signedProperties = this.createSignedProperties();

    // Generate the signed properties hash
    const signedPropertiesHash = this.generateSignedPropertiesHash(signedProperties);

    // Create the signature information
    const signatureInfo = this.createSignatureInfo(signature, documentHash, signedProperties, signedPropertiesHash);

    // Create and return the signed invoice
    return new SignedInvoice(invoice, signatureInfo);
  }

  /**
   * Transforms the document for signing
   * @param document The document to transform
   * @returns The transformed document as a string
   */
  private transformForSigning(document: any): string {
    const transformedDoc = JSON.parse(JSON.stringify(document));
    
    // Remove UBLExtensions and Signature from the invoice
    if (transformedDoc.Invoice && transformedDoc.Invoice[0]) {
      delete transformedDoc.Invoice[0].UBLExtensions;
      delete transformedDoc.Invoice[0].Signature;
    }

    // Convert to string for hashing
    return JSON.stringify(transformedDoc);
  }

  /**
   * Generates a document hash
   * @param document The document to hash
   * @returns The document hash
   */
  private generateDocumentHash(document: string): string {
    return crypto.createHash('sha256').update(document).digest('base64');
  }

  /**
   * Creates signed properties
   * @returns The signed properties
   */
  private createSignedProperties(): SignedProperties {
    const certificateHash = this.certificateHandler.generateCertificateHash();
    const signingCert = this.certificateHandler.getSigningCertificate();
    const formattedIssuerName = this.certificateHandler.formatDistinguishedName(signingCert.issuer);
    const formattedSerialNumber = this.certificateHandler.formatSerialNumber(signingCert.serialNumber);

    const signedProperties = new SignedProperties();
    signedProperties.certificateHash = certificateHash;
    signedProperties.issuerName = formattedIssuerName;
    signedProperties.serialNumber = formattedSerialNumber;

    return signedProperties;
  }

  /**
   * Generates a hash for the signed properties
   * @param signedProperties The signed properties
   * @returns The signed properties hash
   */
  private generateSignedPropertiesHash(signedProperties: SignedProperties): string {
    const signedPropertiesString = JSON.stringify({
      "Target": "signature",
      "SignedProperties": signedProperties.toJSON()
    });
    
    return crypto.createHash('sha256').update(signedPropertiesString, 'utf8').digest('base64');
  }

  /**
   * Creates signature information
   * @param signature The signature
   * @param documentHash The document hash
   * @param signedProperties The signed properties
   * @param signedPropertiesHash The signed properties hash
   * @returns The signature information
   */
  private createSignatureInfo(
    signature: string,
    documentHash: string,
    signedProperties: SignedProperties,
    signedPropertiesHash: string
  ): SignatureInfo {
    const certInfo = this.certificateHandler.generateCertificateInfo();
    
    const signatureInfo = new SignatureInfo();
    signatureInfo.signatureValue = signature;
    signatureInfo.documentHash = documentHash;
    signatureInfo.signedProperties = signedProperties;
    signatureInfo.signedPropertiesHash = signedPropertiesHash;
    signatureInfo.certificateInfo = certInfo;
    
    return signatureInfo;
  }
}