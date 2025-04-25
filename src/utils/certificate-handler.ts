import * as fs from 'fs';
import * as crypto from 'crypto';
import * as forge from 'node-forge';
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);

/**
 * Certificate configuration interface
 */
interface CertificateConfig {
  certificatePath: string;
  privateKeyPath: string;
  privateKeyPassphrase: string;
}

/**
 * Certificate information interface
 */
export interface Certificate {
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: Date;
  validTo: Date;
  raw: Buffer;
}

/**
 * Handles certificate operations for document signing
 */
export class CertificateHandler {
  private certificates: Certificate[] = [];
  private config: CertificateConfig;
  private privateKey: forge.pki.rsa.PrivateKey | null = null;

  /**
   * Creates a new certificate handler
   * @param config The certificate configuration
   */
  constructor(config: CertificateConfig) {
    this.config = config;
  }

  /**
   * Initializes the certificate handler by loading the certificate chain and private key
   */
  async initialize(): Promise<void> {
    await this.loadCertificateChain();
    await this.loadPrivateKey();
  }

  /**
   * Formats a serial number
   * @param serialNumber The serial number to format
   * @returns The formatted serial number
   */
  formatSerialNumber(serialNumber: string): string {
    // Remove any colons, spaces, and convert to uppercase
    const cleanHex = serialNumber.replace(/[:\s]/g, '').toUpperCase();

    // Convert from hex to decimal string
    // Using BigInt because the serial number might be too large for regular Number
    return BigInt('0x' + cleanHex).toString();
  }

  /**
   * Loads the certificate chain from the certificate path
   */
  async loadCertificateChain(): Promise<void> {
    try {
      const certPem = await readFileAsync(this.config.certificatePath, 'utf8');

      // Split the PEM file into individual certificates
      const certRegex = /(-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----)/g;
      const matches = certPem.match(certRegex);

      if (!matches) {
        throw new Error('No certificates found in the file');
      }

      // Process each certificate in the chain
      this.certificates = matches.map(certString => {
        const cert = new crypto.X509Certificate(certString);
        return {
          subject: cert.subject,
          issuer: cert.issuer,
          serialNumber: cert.serialNumber,
          validFrom: new Date(cert.validFrom),
          validTo: new Date(cert.validTo),
          raw: cert.raw
        };
      });

      console.log(`Found ${this.certificates.length} certificates in chain`);

      this.validateCertificateChain();
    } catch (error) {
      console.error('Failed to load certificate chain:', error);
      throw error;
    }
  }

  /**
   * Validates the certificate chain
   */
  private validateCertificateChain(): void {
    for (let i = 0; i < this.certificates.length - 1; i++) {
      const current = this.certificates[i];
      const issuer = this.certificates[i + 1];

      // For LHDN certificates, we need to normalize the DN strings before comparison
      const normalizedIssuer = this.normalizeDN(current.issuer);
      const normalizedSubject = this.normalizeDN(issuer.subject);

      // Verify the certificate chain
      if (normalizedIssuer !== normalizedSubject) {
        console.error('Chain break detected!');
        console.error(`Certificate ${i} issuer doesn't match certificate ${i + 1} subject`);
        console.error('Expected: ' + normalizedIssuer);
        console.error('Found: ' + normalizedSubject);
        throw new Error(`Certificate chain broken between certificate ${i} and ${i + 1}`);
      }

      // Verify certificate dates
      const now = new Date();
      if (now < current.validFrom || now > current.validTo) {
        throw new Error(`Certificate ${i} is not currently valid (${current.validFrom} to ${current.validTo})`);
      }
    }

    console.log('Certificate chain validation successful');
  }

  /**
   * Normalizes a distinguished name for comparison
   * @param dn The distinguished name to normalize
   * @returns The normalized distinguished name
   */
  private normalizeDN(dn: string): string {
    // Split DN into components
    const parts = dn.split(',').map(part => part.trim());

    // Sort the components to ensure consistent ordering
    parts.sort();

    // Normalize spaces and case
    return parts
      .map(part => {
        const [key, ...values] = part.split('=');
        return `${key.trim().toUpperCase()}=${values.join('=').trim()}`;
      })
      .join(',');
  }

  /**
   * Gets the signing certificate
   * @returns The signing certificate
   */
  public getSigningCertificate(): Certificate {
    if (this.certificates.length === 0) {
      throw new Error('Certificates not loaded. Call initialize() first.');
    }
    return this.certificates[0];
  }

  /**
   * Gets the intermediate certificate
   * @returns The intermediate certificate
   */
  public getIntermediateCertificate(): Certificate {
    if (this.certificates.length < 2) {
      throw new Error('Intermediate certificate not found in chain');
    }
    return this.certificates[1];
  }

  /**
   * Gets the root certificate
   * @returns The root certificate
   */
  public getRootCertificate(): Certificate {
    if (this.certificates.length === 0) {
      throw new Error('Certificates not loaded. Call initialize() first.');
    }
    return this.certificates[this.certificates.length - 1];
  }

  /**
   * Formats a distinguished name according to LHDN format
   * @param dn The distinguished name to format
   * @returns The formatted distinguished name
   */
  formatDistinguishedName(dn: string): string {
    // Split on newlines and commas
    const parts = dn.split(/[\n,]/)
      .map(part => part.trim())
      .filter(part => part.length > 0); // Remove empty parts

    // Create a map of DN components
    const dnMap = new Map<string, string>();
    parts.forEach(part => {
      const [key, ...values] = part.split('=');
      dnMap.set(key.trim().toUpperCase(), values.join('=').trim());
    });

    // Construct the DN in the required order with proper formatting
    const orderedParts = [];

    // Order: CN, OU, O, C (matching LHDN's format)
    if (dnMap.has('CN')) orderedParts.push(`CN=${dnMap.get('CN')}`);
    if (dnMap.has('OU')) orderedParts.push(`OU=${dnMap.get('OU')}`);
    if (dnMap.has('O')) orderedParts.push(`O=${dnMap.get('O')}`);
    if (dnMap.has('C')) orderedParts.push(`C=${dnMap.get('C')}`);

    // Join with ", " to match LHDN's format
    return orderedParts.join(', ');
  }

  /**
   * Generates certificate information for document signing
   * @returns The certificate information
   */
  public generateCertificateInfo(): {
    X509Certificate: Array<{_: string}>;
    X509SubjectName: Array<{_: string}>;
    X509IssuerSerial: Array<{
      X509IssuerName: Array<{_: string}>;
      X509SerialNumber: Array<{_: string}>;
    }>;
  } {
    const signingCert = this.getSigningCertificate();

    // Format the issuer name to match the LHDN format
    const formattedIssuerName = this.formatDistinguishedName(signingCert.issuer);

    return {
      X509Certificate: [
        {
          "_": signingCert.raw.toString('base64')
        }
      ],
      X509SubjectName: [
        {
          "_": this.formatDistinguishedName(signingCert.subject)
        }
      ],
      X509IssuerSerial: [
        {
          X509IssuerName: [
            {
              "_": formattedIssuerName
            }
          ],
          X509SerialNumber: [
            {
              "_": this.formatSerialNumber(signingCert.serialNumber)
            }
          ]
        }
      ]
    };
  }

  /**
   * Generates a certificate hash for document signing
   * @returns The certificate hash
   */
  public generateCertificateHash(): string {
    const signingCert = this.getSigningCertificate();
    const certificatePem = forge.pki.certificateFromPem(
      `-----BEGIN CERTIFICATE-----\n${signingCert.raw.toString('base64')}\n-----END CERTIFICATE-----`
    );
    const derBytes = forge.asn1.toDer(forge.pki.certificateToAsn1(certificatePem)).getBytes();
    return crypto.createHash('sha256').update(derBytes, 'binary').digest('base64');
  }

  /**
   * Loads the private key
   */
  private async loadPrivateKey(): Promise<void> {
    try {
      const keyContent = await readFileAsync(this.config.privateKeyPath, 'utf8');
      
      if (!this.config.privateKeyPassphrase) {
        throw new Error('Private key passphrase is not set');
      }

      this.privateKey = forge.pki.decryptRsaPrivateKey(keyContent, this.config.privateKeyPassphrase);
      
      if (!this.privateKey) {
        throw new Error('Failed to decrypt private key');
      }
    } catch (error) {
      console.error('Failed to read or decrypt private key:', error);
      throw new Error('Failed to load private key');
    }
  }

  /**
   * Signs data with the private key
   * @param data The data to sign
   * @returns The signature
   */
  public signData(data: string): string {
    if (!this.privateKey) {
      throw new Error('Private key not loaded. Call initialize() first.');
    }
    
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    const signature = this.privateKey.sign(md);
    
    return forge.util.encode64(signature);
  }
}