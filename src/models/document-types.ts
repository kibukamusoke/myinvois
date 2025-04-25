/**
 * Enum for document types supported by MyInvois
 * Based on official documentation
 */
export enum DocumentType {
    // Standard document types
    INVOICE = '01', // Invoice issued by Supplier to Buyer
    CREDIT_NOTE = '02', // Credit note to correct errors, apply discounts, or account for returns
    DEBIT_NOTE = '03', // Debit note to indicate additional charges
    REFUND_NOTE = '04', // Refund note to confirm refund of Buyer's payment
    
    // Self-billed document types
    SELF_BILLED_INVOICE = '05', // Self-billed invoice issued by Buyer
    SELF_BILLED_CREDIT_NOTE = '06', // Self-billed credit note
    SELF_BILLED_DEBIT_NOTE = '07', // Self-billed debit note
    SELF_BILLED_REFUND_NOTE = '08' // Self-billed refund note
  }
  
  /**
   * Map of document type codes to human-readable descriptions
   */
  export const DocumentTypeDescriptions: Record<string, string> = {
    '01': 'Invoice',
    '02': 'Credit Note',
    '03': 'Debit Note',
    '04': 'Refund Note',
    '05': 'Self-Billed Invoice',
    '06': 'Self-Billed Credit Note',
    '07': 'Self-Billed Debit Note',
    '08': 'Self-Billed Refund Note'
  };
  
  /**
   * Returns true if the document type is a standard (non-self-billed) document
   * @param documentType The document type to check
   */
  export function isStandardDocument(documentType: string): boolean {
    return [
      DocumentType.INVOICE,
      DocumentType.CREDIT_NOTE,
      DocumentType.DEBIT_NOTE,
      DocumentType.REFUND_NOTE
    ].includes(documentType as DocumentType);
  }
  
  /**
   * Returns true if the document type is a self-billed document
   * @param documentType The document type to check
   */
  export function isSelfBilledDocument(documentType: string): boolean {
    return [
      DocumentType.SELF_BILLED_INVOICE,
      DocumentType.SELF_BILLED_CREDIT_NOTE,
      DocumentType.SELF_BILLED_DEBIT_NOTE,
      DocumentType.SELF_BILLED_REFUND_NOTE
    ].includes(documentType as DocumentType);
  }
  
  /**
   * Returns true if the document is an invoice (standard or self-billed)
   * @param documentType The document type to check
   */
  export function isInvoice(documentType: string): boolean {
    return documentType === DocumentType.INVOICE || 
           documentType === DocumentType.SELF_BILLED_INVOICE;
  }
  
  /**
   * Returns true if the document is a credit note (standard or self-billed)
   * @param documentType The document type to check
   */
  export function isCreditNote(documentType: string): boolean {
    return documentType === DocumentType.CREDIT_NOTE || 
           documentType === DocumentType.SELF_BILLED_CREDIT_NOTE;
  }
  
  /**
   * Returns true if the document is a debit note (standard or self-billed)
   * @param documentType The document type to check
   */
  export function isDebitNote(documentType: string): boolean {
    return documentType === DocumentType.DEBIT_NOTE || 
           documentType === DocumentType.SELF_BILLED_DEBIT_NOTE;
  }
  
  /**
   * Returns true if the document is a refund note (standard or self-billed)
   * @param documentType The document type to check
   */
  export function isRefundNote(documentType: string): boolean {
    return documentType === DocumentType.REFUND_NOTE || 
           documentType === DocumentType.SELF_BILLED_REFUND_NOTE;
  }