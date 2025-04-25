import { BaseModel } from './base-model';
import { TaxSubtotal } from './tax-subtotal';
import { InvoiceLine } from './invoice-line';

/**
 * Represents tax total information
 */
export class TaxTotal extends BaseModel {
  private _taxAmount: number = 0;
  private _taxableAmount: number = 0;
  private _taxType: string = '';
  private _taxRate: number = 0;
  private _taxExemptionReason: string = '';
  private _taxSubtotals: TaxSubtotal[] = [];

  // Getter and Setter for taxAmount
  get taxAmount(): number {
    return this._taxAmount;
  }

  set taxAmount(value: number) {
    this._taxAmount = value;
  }

  // Getter and Setter for taxableAmount
  get taxableAmount(): number {
    return this._taxableAmount;
  }

  set taxableAmount(value: number) {
    this._taxableAmount = value;
  }

  // Getter and Setter for taxType
  get taxType(): string {
    return this._taxType;
  }

  set taxType(value: string) {
    this._taxType = value;
  }

  // Getter and Setter for taxRate
  get taxRate(): number {
    return this._taxRate;
  }

  set taxRate(value: number) {
    this._taxRate = value;
  }

  // Getter and Setter for taxExemptionReason
  get taxExemptionReason(): string {
    return this._taxExemptionReason;
  }

  set taxExemptionReason(value: string) {
    this._taxExemptionReason = value;
  }

  // Getter for taxSubtotals
  get taxSubtotals(): TaxSubtotal[] {
    return this._taxSubtotals;
  }

  /**
   * Add a tax subtotal
   * @param subtotal The tax subtotal to add
   */
  addTaxSubtotal(subtotal: TaxSubtotal): void {
    this._taxSubtotals.push(subtotal);
  }

  /**
   * Calculate tax totals based on invoice lines
   * @param invoiceLines The invoice lines to calculate tax totals from
   */
  calculateTotals(invoiceLines: InvoiceLine[]): void {
    // Group lines by tax type and rate
    const taxGroups = new Map<string, {
      taxType: string,
      taxRate: number,
      taxableAmount: number,
      taxAmount: number,
      exemptionReason?: string
    }>();

    // Calculate tax for each line and group by tax type/rate
    invoiceLines.forEach(line => {
      const taxTotal = line.taxTotal;
      const key = `${taxTotal.taxType}_${taxTotal.taxRate}`;
      
      if (!taxGroups.has(key)) {
        taxGroups.set(key, {
          taxType: taxTotal.taxType,
          taxRate: taxTotal.taxRate,
          taxableAmount: 0,
          taxAmount: 0,
          exemptionReason: taxTotal.taxExemptionReason
        });
      }
      
      const group = taxGroups.get(key)!;
      group.taxableAmount += taxTotal.taxableAmount;
      group.taxAmount += taxTotal.taxAmount;
    });

    // Clear existing subtotals
    this._taxSubtotals = [];

    // Create tax subtotals for each group
    let totalTaxAmount = 0;
    taxGroups.forEach((group) => {
      const subtotal = new TaxSubtotal();
      subtotal.taxableAmount = group.taxableAmount;
      subtotal.taxAmount = group.taxAmount;
      subtotal.taxType = group.taxType;
      subtotal.taxRate = group.taxRate;
      
      if (group.exemptionReason) {
        subtotal.taxExemptionReason = group.exemptionReason;
      }
      
      this._taxSubtotals.push(subtotal);
      totalTaxAmount += group.taxAmount;
    });

    // Set total tax amount
    this._taxAmount = totalTaxAmount;
  }

  /**
   * Converts the tax total to a JSON representation for the invoice level
   */
  toJSON(): any {
    return {
      "TaxAmount": [
        {
          "_": this._taxAmount,
          "currencyID": "MYR"
        }
      ],
      "TaxSubtotal": this._taxSubtotals.map(subtotal => subtotal.toJSON())
    };
  }

  /**
   * Converts the tax total to a JSON representation for the line level
   */
  toLineJSON(): any {
    return {
      "TaxAmount": [
        {
          "_": this._taxAmount,
          "currencyID": "MYR"
        }
      ],
      "TaxSubtotal": [
        {
          "TaxableAmount": [
            {
              "_": this._taxableAmount,
              "currencyID": "MYR"
            }
          ],
          "TaxAmount": [
            {
              "_": this._taxAmount,
              "currencyID": "MYR"
            }
          ],
          "Percent": [
            {
              "_": this._taxRate
            }
          ],
          "TaxCategory": [
            {
              "ID": [
                {
                  "_": this._taxType
                }
              ],
              "TaxExemptionReason": this._taxType === 'E' && this._taxExemptionReason ? [
                {
                  "_": this._taxExemptionReason
                }
              ] : null,
              "TaxScheme": [
                {
                  "ID": [
                    {
                      "_": "OTH",
                      "schemeID": "UN/ECE 5153",
                      "schemeAgencyID": "6"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  }
}