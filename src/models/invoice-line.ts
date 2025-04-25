import { BaseModel } from './base-model';
import { Item } from './item';
import { Price } from './price';
import { TaxTotal } from './tax-total';

/**
 * Represents an invoice line
 */
export class InvoiceLine extends BaseModel {
  private _id: number = 0;
  private _quantity: number = 0;
  private _unitCode: string = 'C62'; // Default unit code
  private _lineExtensionAmount: number = 0;
  private _discountRate: number = 0;
  private _discountAmount: number = 0;
  private _item: Item = new Item();
  private _price: Price = new Price();
  private _taxTotal: TaxTotal = new TaxTotal();

  // Getter and Setter for id
  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  // Getter and Setter for quantity
  get quantity(): number {
    return this._quantity;
  }

  set quantity(value: number) {
    this._quantity = value;
    this.updateCalculations();
  }

  // Getter and Setter for unitCode
  get unitCode(): string {
    return this._unitCode;
  }

  set unitCode(value: string) {
    this._unitCode = value;
  }

  // Getter and Setter for lineExtensionAmount
  get lineExtensionAmount(): number {
    return this._lineExtensionAmount;
  }

  // Getter and Setter for discountRate
  get discountRate(): number {
    return this._discountRate;
  }

  set discountRate(value: number) {
    this._discountRate = value;
    this.updateCalculations();
  }

  // Getter and Setter for discountAmount
  get discountAmount(): number {
    return this._discountAmount;
  }

  // Getter and Setter for item
  get item(): Item {
    return this._item;
  }

  set item(value: Item) {
    this._item = value;
  }

  // Getter and Setter for price
  get price(): Price {
    return this._price;
  }

  set price(value: Price) {
    this._price = value;
    this.updateCalculations();
  }

  // Getter and Setter for taxTotal
  get taxTotal(): TaxTotal {
    return this._taxTotal;
  }

  set taxTotal(value: TaxTotal) {
    this._taxTotal = value;
  }

  /**
   * Updates the calculations for the invoice line
   */
  private updateCalculations(): void {
    // Calculate line amount before discount
    const grossAmount = this._quantity * this._price.priceAmount;
    
    // Calculate discount amount
    this._discountAmount = grossAmount * this._discountRate;
    
    // Calculate line amount after discount
    this._lineExtensionAmount = grossAmount - this._discountAmount;
    
    // Update tax calculation based on tax rate
    const taxRate = this._taxTotal.taxRate;
    const taxAmount = this._lineExtensionAmount * (taxRate / 100);
    
    // Update tax total
    this._taxTotal.taxableAmount = this._lineExtensionAmount;
    this._taxTotal.taxAmount = taxAmount;
  }

  /**
   * Sets the tax rate and updates calculations
   * @param taxRate The tax rate to set
   * @param taxType The tax type (e.g., 'S', 'Z', 'E', etc.)
   * @param taxExemptionReason The reason for tax exemption (if applicable)
   */
  setTax(taxRate: number, taxType: string, taxExemptionReason?: string): void {
    this._taxTotal.taxRate = taxRate;
    this._taxTotal.taxType = taxType;
    
    if (taxExemptionReason) {
      this._taxTotal.taxExemptionReason = taxExemptionReason;
    }
    
    this.updateCalculations();
  }

  /**
   * Converts the invoice line to a JSON representation
   */
  toJSON(): any {
    return {
      "ID": [
        {
          "_": this._id.toString()
        }
      ],
      "InvoicedQuantity": [
        {
          "_": this._quantity,
          "unitCode": this._unitCode
        }
      ],
      "LineExtensionAmount": [
        {
          "_": this._lineExtensionAmount,
          "currencyID": "MYR"
        }
      ],
      "AllowanceCharge": [
        {
          "ChargeIndicator": [
            {
              "_": false
            }
          ],
          "AllowanceChargeReason": [
            {
              "_": "Discount"
            }
          ],
          "MultiplierFactorNumeric": this._discountRate > 0 ? [
            {
              "_": this._discountRate
            }
          ] : null,
          "Amount": [
            {
              "_": this._discountAmount,
              "currencyID": "MYR"
            }
          ]
        }
      ],
      "TaxTotal": [this._taxTotal.toLineJSON()],
      "Item": [this._item.toJSON()],
      "Price": [this._price.toJSON()],
      "ItemPriceExtension": [
        {
          "Amount": [
            {
              "_": this._lineExtensionAmount,
              "currencyID": "MYR"
            }
          ]
        }
      ]
    };
  }
}