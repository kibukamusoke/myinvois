import { BaseModel } from './base-model';

/**
 * Represents a tax subtotal
 */
export class TaxSubtotal extends BaseModel {
  private _taxableAmount: number = 0;
  private _taxAmount: number = 0;
  private _taxType: string = '';
  private _taxRate: number = 0;
  private _taxExemptionReason: string = '';

  // Getter and Setter for taxableAmount
  get taxableAmount(): number {
    return this._taxableAmount;
  }

  set taxableAmount(value: number) {
    this._taxableAmount = value;
  }

  // Getter and Setter for taxAmount
  get taxAmount(): number {
    return this._taxAmount;
  }

  set taxAmount(value: number) {
    this._taxAmount = value;
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

  /**
   * Converts the tax subtotal to a JSON representation
   */
  toJSON(): any {
    return {
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
      "TaxCategory": [
        {
          "ID": [
            {
              "_": this._taxType
            }
          ],
          "Percent": [
            {
              "_": this._taxRate
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
    };
  }
}