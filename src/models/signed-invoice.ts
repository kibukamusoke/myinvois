import { BaseModel } from './base-model';
import { Invoice } from './invoice';
import { SignatureInfo } from './signature-info';

/**
 * Represents a signed invoice
 */
export class SignedInvoice extends BaseModel {
  private _invoice: Invoice;
  private _signatureInfo: SignatureInfo;

  /**
   * Creates a new signed invoice
   * @param invoice The invoice to sign
   * @param signatureInfo The signature information
   */
  constructor(invoice: Invoice, signatureInfo: SignatureInfo) {
    super();
    this._invoice = invoice;
    this._signatureInfo = signatureInfo;
  }

  // Getter for invoice
  get invoice(): Invoice {
    return this._invoice;
  }

  // Getter for signatureInfo
  get signatureInfo(): SignatureInfo {
    return this._signatureInfo;
  }

  /**
   * Converts the signed invoice to a JSON representation
   */
  toJSON(): any {
    const invoiceJSON = this._invoice.toJSON();
    
    // Add UBLExtensions and Signature to the invoice
    invoiceJSON.Invoice[0].UBLExtensions = [
      {
        "UBLExtension": [
          {
            "ExtensionURI": [
              {
                "_": "urn:oasis:names:specification:ubl:dsig:enveloped:xades"
              }
            ],
            "ExtensionContent": [
              {
                "UBLDocumentSignatures": [
                  this._signatureInfo.toJSON()
                ]
              }
            ]
          }
        ]
      }
    ];

    invoiceJSON.Invoice[0].Signature = [
      {
        "ID": [
          {
            "_": "urn:oasis:names:specification:ubl:signature:Invoice"
          }
        ],
        "SignatureMethod": [
          {
            "_": "urn:oasis:names:specification:ubl:dsig:enveloped:xades"
          }
        ]
      }
    ];

    return invoiceJSON;
  }
}