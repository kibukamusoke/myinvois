/**
 * Interface for certificate information
 */
export interface CertificateInfo {
  /**
   * The subject of the certificate
   */
  subject: string;
  
  /**
   * The issuer of the certificate
   */
  issuer: string;
  
  /**
   * The serial number of the certificate
   */
  serialNumber: string;
  
  /**
   * The date from which the certificate is valid
   */
  validFrom: Date;
  
  /**
   * The date until which the certificate is valid
   */
  validTo: Date;
  
  /**
   * The number of days until the certificate expires
   */
  daysUntilExpiry: number;
  
  /**
   * Whether the certificate is currently valid
   */
  isValid: boolean;
}

/**
 * Interface for the complete certificate chain details
 */
export interface CertificateChainInfo {
  /**
   * Information about the signing certificate
   */
  signing: CertificateInfo;
  
  /**
   * Information about the intermediate certificate
   */
  intermediate: CertificateInfo;
  
  /**
   * Information about the root certificate
   */
  root: CertificateInfo;
} 