import { BaseModel } from './base-model';

/**
 * Represents a postal address
 */
export class Address extends BaseModel {
  private _addressLine1: string = '';
  private _addressLine2: string = '';
  private _city: string = '';
  private _postalCode: string = '';
  private _stateCode: string = '';
  private _countryCode: string = 'MYS';

  // Getter and Setter for addressLine1
  get addressLine1(): string {
    return this._addressLine1;
  }

  set addressLine1(value: string) {
    this._addressLine1 = value;
  }

  // Getter and Setter for addressLine2
  get addressLine2(): string {
    return this._addressLine2;
  }

  set addressLine2(value: string) {
    this._addressLine2 = value;
  }

  // Getter and Setter for city
  get city(): string {
    return this._city;
  }

  set city(value: string) {
    this._city = value;
  }

  // Getter and Setter for postalCode
  get postalCode(): string {
    return this._postalCode;
  }

  set postalCode(value: string) {
    this._postalCode = value;
  }

  // Getter and Setter for stateCode
  get stateCode(): string {
    return this._stateCode;
  }

  set stateCode(value: string) {
    this._stateCode = value;
  }

  // Getter and Setter for countryCode
  get countryCode(): string {
    return this._countryCode;
  }

  set countryCode(value: string) {
    this._countryCode = value;
  }

  /**
   * Converts the address to a JSON representation
   */
  toJSON(): any {
    return {
      "CityName": [
        {
          "_": this._city
        }
      ],
      "PostalZone": [
        {
          "_": this._postalCode
        }
      ],
      "CountrySubentityCode": [
        {
          "_": this._stateCode
        }
      ],
      "AddressLine": [
        {
          "Line": [
            {
              "_": this._addressLine1
            }
          ]
        },
        {
          "Line": [
            {
              "_": this._addressLine2
            }
          ]
        }
      ],
      "Country": [
        {
          "IdentificationCode": [
            {
              "_": this._countryCode,
              "listID": "ISO3166-1",
              "listAgencyID": "6"
            }
          ]
        }
      ]
    };
  }
}