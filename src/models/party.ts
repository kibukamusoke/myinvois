import { BaseModel } from './base-model';
import { Address } from './address';

/**
 * Represents a party (supplier, customer, etc.)
 */
export class Party extends BaseModel {
  // Party identification
  private _name: string = '';
  private _taxId: string = '';
  private _registrationId: string = ''; // MANDATORY: Business Registration Number or other ID
  private _registrationType: string = 'BRN'; // MANDATORY: BRN, SST, NRIC, etc.
  private _sstRegistrationNo: string = '';
  private _msicCode: string = '';
  private _msicDescription: string = '';
  
  // Contact details
  private _phone: string = '';
  private _email: string = '';
  
  // Address
  private _address: Address = new Address();

  // Getter and Setter for name
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  // Getter and Setter for taxId
  get taxId(): string {
    return this._taxId;
  }

  set taxId(value: string) {
    this._taxId = value;
  }

  // Getter and Setter for registrationId
  get registrationId(): string {
    return this._registrationId;
  }

  set registrationId(value: string) {
    this._registrationId = value;
  }

  // Getter and Setter for registrationType
  get registrationType(): string {
    return this._registrationType;
  }

  set registrationType(value: string) {
    this._registrationType = value;
  }

  // Getter and Setter for sstRegistrationNo
  get sstRegistrationNo(): string {
    return this._sstRegistrationNo;
  }

  set sstRegistrationNo(value: string) {
    this._sstRegistrationNo = value;
  }

  // Getter and Setter for msicCode
  get msicCode(): string {
    return this._msicCode;
  }

  set msicCode(value: string) {
    this._msicCode = value;
  }

  // Getter and Setter for msicDescription
  get msicDescription(): string {
    return this._msicDescription;
  }

  set msicDescription(value: string) {
    this._msicDescription = value;
  }

  // Getter and Setter for phone
  get phone(): string {
    return this._phone;
  }

  set phone(value: string) {
    this._phone = value;
  }

  // Getter and Setter for email
  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  // Getter and Setter for address
  get address(): Address {
    return this._address;
  }

  set address(value: Address) {
    this._address = value;
  }

  /**
   * Converts the party to a JSON representation
   * Requires registrationId and registrationType to be set
   * @throws Error if mandatory fields are not provided
   */
  toJSON(): any {
    // Validate mandatory fields
    if (!this._registrationId) {
      throw new Error('Party registrationId is mandatory and must be provided');
    }
    
    if (!this._registrationType) {
      throw new Error('Party registrationType is mandatory and must be provided');
    }

    const partyIdentifications: any[] = [];

    // Add TIN (tax id)
    if (this._taxId) {
      partyIdentifications.push({
        "ID": [
          {
            "_": this._taxId,
            "schemeID": "TIN"
          }
        ]
      });
    }

    // Add registration ID (now mandatory)
    partyIdentifications.push({
      "ID": [
        {
          "_": this._registrationId,
          "schemeID": this._registrationType
        }
      ]
    });

    // Add SST registration number if available
    if (this._sstRegistrationNo) {
      partyIdentifications.push({
        "ID": [
          {
            "_": this._sstRegistrationNo,
            "schemeID": "SST"
          }
        ]
      });
    }

    const partyObj: any = {
      "PostalAddress": [this._address.toJSON()],
      "PartyLegalEntity": [
        {
          "RegistrationName": [
            {
              "_": this._name
            }
          ]
        }
      ],
      "PartyIdentification": partyIdentifications,
      "Contact": [
        {
          "Telephone": [
            {
              "_": this._phone
            }
          ],
          "ElectronicMail": [
            {
              "_": this._email
            }
          ]
        }
      ]
    };

    // Add MSIC code if available (for suppliers)
    if (this._msicCode) {
      partyObj["IndustryClassificationCode"] = [
        {
          "_": this._msicCode,
          "name": this._msicDescription
        }
      ];
    }

    return partyObj;
  }
}