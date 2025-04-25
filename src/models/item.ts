import { BaseModel } from './base-model';

/**
 * Represents an item in an invoice line
 */
export class Item extends BaseModel {
  private _name: string = '';
  private _description: string = '';
  private _classificationCode: string = '';
  private _classificationScheme: string = 'CLASS';
  private _countryOfOrigin: string = 'MYS';

  // Getter and Setter for name
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  // Getter and Setter for description
  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  // Getter and Setter for classificationCode
  get classificationCode(): string {
    return this._classificationCode;
  }

  set classificationCode(value: string) {
    this._classificationCode = value;
  }

  // Getter and Setter for classificationScheme
  get classificationScheme(): string {
    return this._classificationScheme;
  }

  set classificationScheme(value: string) {
    this._classificationScheme = value;
  }

  // Getter and Setter for countryOfOrigin
  get countryOfOrigin(): string {
    return this._countryOfOrigin;
  }

  set countryOfOrigin(value: string) {
    this._countryOfOrigin = value;
  }

  /**
   * Converts the item to a JSON representation
   */
  toJSON(): any {
    return {
      "CommodityClassification": [
        {
          "ItemClassificationCode": [
            {
              "_": this._classificationCode,
              "listID": this._classificationScheme
            }
          ]
        }
      ],
      "Description": [
        {
          "_": this._description || this._name
        }
      ],
      "OriginCountry": [
        {
          "IdentificationCode": [
            {
              "_": this._countryOfOrigin
            }
          ]
        }
      ]
    };
  }
}