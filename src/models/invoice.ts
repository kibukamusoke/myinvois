import { BaseModel } from './base-model';
import { Party } from './party';
import { InvoiceLine } from './invoice-line';
import { TaxTotal } from './tax-total';
import { InvoicePeriod } from './invoice-period';
import { DocumentReference } from './document-reference';
import moment from 'moment-timezone';

/**
 * Represents an invoice document
 */
export class Invoice extends BaseModel {
  // Document identification
  private _id: string = '';
  private _issueDate: Date = new Date();
  private _invoiceTypeCode: string = '';
  private _documentCurrencyCode: string = 'MYR';
  private _taxCurrencyCode: string = 'MYR';
  
  // Parties
  private _supplier: Party = new Party();
  private _customer: Party = new Party();
  
  // Document details
  private _invoicePeriod: InvoicePeriod = new InvoicePeriod();
  private _additionalDocumentReferences: DocumentReference[] = [];
  
  // Monetary totals
  private _lineExtensionAmount: number = 0;
  private _taxExclusiveAmount: number = 0;
  private _taxInclusiveAmount: number = 0;
  private _allowanceTotalAmount: number = 0;
  private _chargeTotalAmount: number = 0;
  private _payableRoundingAmount: number = 0;
  private _payableAmount: number = 0;
  
  // Tax information
  private _taxTotal: TaxTotal = new TaxTotal();
  
  // Line items
  private _invoiceLines: InvoiceLine[] = [];

  // Getter and Setter for ID
  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  // Getter and Setter for issueDate
  get issueDate(): Date {
    return this._issueDate;
  }

  set issueDate(value: Date) {
    this._issueDate = value;
  }

  // Getter and Setter for invoiceTypeCode
  get invoiceTypeCode(): string {
    return this._invoiceTypeCode;
  }

  set invoiceTypeCode(value: string) {
    this._invoiceTypeCode = value;
  }

  // Getter and Setter for documentCurrencyCode
  get documentCurrencyCode(): string {
    return this._documentCurrencyCode;
  }

  set documentCurrencyCode(value: string) {
    this._documentCurrencyCode = value;
  }

  // Getter and Setter for taxCurrencyCode
  get taxCurrencyCode(): string {
    return this._taxCurrencyCode;
  }

  set taxCurrencyCode(value: string) {
    this._taxCurrencyCode = value;
  }

  // Getter and Setter for supplier
  get supplier(): Party {
    return this._supplier;
  }

  set supplier(value: Party) {
    this._supplier = value;
  }

  // Getter and Setter for customer
  get customer(): Party {
    return this._customer;
  }

  set customer(value: Party) {
    this._customer = value;
  }

  // Getter and Setter for invoicePeriod
  get invoicePeriod(): InvoicePeriod {
    return this._invoicePeriod;
  }

  set invoicePeriod(value: InvoicePeriod) {
    this._invoicePeriod = value;
  }

  // Getter and Setter for additionalDocumentReferences
  get additionalDocumentReferences(): DocumentReference[] {
    return this._additionalDocumentReferences;
  }

  set additionalDocumentReferences(value: DocumentReference[]) {
    this._additionalDocumentReferences = value;
  }

  // Method to add a document reference
  addDocumentReference(reference: DocumentReference): void {
    this._additionalDocumentReferences.push(reference);
  }

  // Getters and Setters for monetary totals
  get lineExtensionAmount(): number {
    return this._lineExtensionAmount;
  }

  set lineExtensionAmount(value: number) {
    this._lineExtensionAmount = value;
  }

  get taxExclusiveAmount(): number {
    return this._taxExclusiveAmount;
  }

  set taxExclusiveAmount(value: number) {
    this._taxExclusiveAmount = value;
  }

  get taxInclusiveAmount(): number {
    return this._taxInclusiveAmount;
  }

  set taxInclusiveAmount(value: number) {
    this._taxInclusiveAmount = value;
  }

  get allowanceTotalAmount(): number {
    return this._allowanceTotalAmount;
  }

  set allowanceTotalAmount(value: number) {
    this._allowanceTotalAmount = value;
  }

  get chargeTotalAmount(): number {
    return this._chargeTotalAmount;
  }

  set chargeTotalAmount(value: number) {
    this._chargeTotalAmount = value;
  }

  get payableRoundingAmount(): number {
    return this._payableRoundingAmount;
  }

  set payableRoundingAmount(value: number) {
    this._payableRoundingAmount = value;
  }

  get payableAmount(): number {
    return this._payableAmount;
  }

  set payableAmount(value: number) {
    this._payableAmount = value;
  }

  // Getter and Setter for taxTotal
  get taxTotal(): TaxTotal {
    return this._taxTotal;
  }

  set taxTotal(value: TaxTotal) {
    this._taxTotal = value;
  }

  // Getter and Setter for invoiceLines
  get invoiceLines(): InvoiceLine[] {
    return this._invoiceLines;
  }

  set invoiceLines(value: InvoiceLine[]) {
    this._invoiceLines = value;
  }

  // Method to add an invoice line
  addInvoiceLine(line: InvoiceLine): void {
    this._invoiceLines.push(line);
  }

  /**
   * Calculate totals based on invoice lines
   */
  calculateTotals(): void {
    // Calculate line extension amount (sum of line amounts)
    this._lineExtensionAmount = this._invoiceLines.reduce(
      (sum, line) => sum + line.lineExtensionAmount,
      0
    );

    // Calculate tax totals
    this._taxTotal.calculateTotals(this._invoiceLines);

    // Set other amounts
    this._taxExclusiveAmount = this._lineExtensionAmount;
    this._taxInclusiveAmount = this._taxExclusiveAmount + this._taxTotal.taxAmount;
    this._payableAmount = this._taxInclusiveAmount + this._payableRoundingAmount;
  }

  /**
   * Converts the invoice to a JSON representation
   */
  toJSON(): any {
    return {
      "_D": "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
      "_A": "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
      "_B": "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
      "Invoice": [
        {
          "ID": [
            {
              "_": this._id
            }
          ],
          "IssueDate": [
            {
              "_": moment(this._issueDate).format('YYYY-MM-DD')
            }
          ],
          "IssueTime": [
            {
              "_": moment(this._issueDate).format('HH:mm:ss') + 'Z'
            }
          ],
          "InvoiceTypeCode": [
            {
              "_": this._invoiceTypeCode,
              "listVersionID": "1.1"
            }
          ],
          "DocumentCurrencyCode": [
            {
              "_": this._documentCurrencyCode
            }
          ],
          "TaxCurrencyCode": [
            {
              "_": this._taxCurrencyCode
            }
          ],
          "InvoicePeriod": this._invoicePeriod && typeof this._invoicePeriod.toJSON === 'function' ? this._invoicePeriod.toJSON() : [],
          "AdditionalDocumentReference": this._additionalDocumentReferences.map(ref => ref.toJSON()),
          "AccountingSupplierParty": [
            {
              "Party": [this._supplier && typeof this._supplier.toJSON === 'function' ? this._supplier.toJSON() : {}]
            }
          ],
          "AccountingCustomerParty": [
            {
              "Party": [this._customer && typeof this._customer.toJSON === 'function' ? this._customer.toJSON() : {}]
            }
          ],
          "TaxTotal": [this._taxTotal && typeof this._taxTotal.toJSON === 'function' ? this._taxTotal.toJSON() : {}],
          "LegalMonetaryTotal": [
            {
              "LineExtensionAmount": [
                {
                  "_": this._lineExtensionAmount,
                  "currencyID": this._documentCurrencyCode
                }
              ],
              "TaxExclusiveAmount": [
                {
                  "_": this._taxExclusiveAmount,
                  "currencyID": this._documentCurrencyCode
                }
              ],
              "TaxInclusiveAmount": [
                {
                  "_": this._taxInclusiveAmount,
                  "currencyID": this._documentCurrencyCode
                }
              ],
              "AllowanceTotalAmount": [
                {
                  "_": this._allowanceTotalAmount,
                  "currencyID": this._documentCurrencyCode
                }
              ],
              "ChargeTotalAmount": [
                {
                  "_": this._chargeTotalAmount,
                  "currencyID": this._documentCurrencyCode
                }
              ],
              "PayableRoundingAmount": [
                {
                  "_": this._payableRoundingAmount,
                  "currencyID": this._documentCurrencyCode
                }
              ],
              "PayableAmount": [
                {
                  "_": this._payableAmount,
                  "currencyID": this._documentCurrencyCode
                }
              ]
            }
          ],
          "InvoiceLine": this._invoiceLines && Array.isArray(this._invoiceLines) ? 
            this._invoiceLines.map(line => line && typeof line.toJSON === 'function' ? line.toJSON() : {}) : 
            []
        }
      ]
    };
  }
}