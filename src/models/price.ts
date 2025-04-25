import { BaseModel } from './base-model';

/**
 * Represents a price for an item
 */
export class Price extends BaseModel {
  private _priceAmount: number = 0;
  private _currencyID: string = 'MYR';

  // Getter and Setter for priceAmount
  get priceAmount(): number {
    return this._priceAmount;
  }

  set priceAmount(value: number) {
    this._priceAmount = value;
  }

  // Getter and Setter for currencyID
  get currencyID(): string {
    return this._currencyID;
  }

  set currencyID(value: string) {
    this._currencyID = value;
  }

  /**
   * Converts the price to a JSON representation
   */
  toJSON(): any {
    return {
      "PriceAmount": [
        {
          "_": this._priceAmount,
          "currencyID": this._currencyID
        }
      ]
    };
  }
}