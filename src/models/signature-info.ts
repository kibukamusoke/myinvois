import { BaseModel } from './base-model';
import { SignedProperties } from './signed-properties';

/**
 * Represents the signature information for a document
 */
export class SignatureInfo extends BaseModel {
  private _id: string = 'urn:oasis:names:specification:ubl:signature:1';
  private _referencedSignatureID: string = 'urn:oasis:names:specification:ubl:signature:Invoice';
  private _signatureValue: string = '';
  private _documentHash: string = '';
  private _signedPropertiesHash: string = '';
  private _signedProperties: SignedProperties = new SignedProperties();
  private _certificateInfo: any = {};

  // Getter and Setter for id
  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  // Getter and Setter for referencedSignatureID
  get referencedSignatureID(): string {
    return this._referencedSignatureID;
  }

  set referencedSignatureID(value: string) {
    this._referencedSignatureID = value;
  }

  // Getter and Setter for signatureValue
  get signatureValue(): string {
    return this._signatureValue;
  }

  set signatureValue(value: string) {
    this._signatureValue = value;
  }

  // Getter and Setter for documentHash
  get documentHash(): string {
    return this._documentHash;
  }

  set documentHash(value: string) {
    this._documentHash = value;
  }

  // Getter and Setter for signedPropertiesHash
  get signedPropertiesHash(): string {
    return this._signedPropertiesHash;
  }

  set signedPropertiesHash(value: string) {
    this._signedPropertiesHash = value;
  }

  // Getter and Setter for signedProperties
  get signedProperties(): SignedProperties {
    return this._signedProperties;
  }

  set signedProperties(value: SignedProperties) {
    this._signedProperties = value;
  }

  // Getter and Setter for certificateInfo
  get certificateInfo(): any {
    return this._certificateInfo;
  }

  set certificateInfo(value: any) {
    this._certificateInfo = value;
  }

  /**
   * Converts the signature information to a JSON representation
   */
  toJSON(): any {
    return {
      "SignatureInformation": [
        {
          "ID": [
            {
              "_": this._id
            }
          ],
          "ReferencedSignatureID": [
            {
              "_": this._referencedSignatureID
            }
          ],
          "Signature": [
            {
              "Id": "signature",
              "Object": [
                {
                  "QualifyingProperties": [
                    {
                      "Target": "signature",
                      "SignedProperties": this._signedProperties.toJSON()
                    }
                  ]
                }
              ],
              "KeyInfo": [
                {
                  "X509Data": [
                    this._certificateInfo
                  ]
                }
              ],
              "SignatureValue": [
                {
                  "_": this._signatureValue
                }
              ],
              "SignedInfo": [
                {
                  "SignatureMethod": [
                    {
                      "_": "",
                      "Algorithm": "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"
                    }
                  ],
                  "Reference": [
                    {
                      "Type": "http://uri.etsi.org/01903/v1.3.2#SignedProperties",
                      "URI": `#${this._signedProperties.id}`,
                      "DigestMethod": [
                        {
                          "_": "",
                          "Algorithm": "http://www.w3.org/2001/04/xmlenc#sha256"
                        }
                      ],
                      "DigestValue": [
                        {
                          "_": this._signedPropertiesHash
                        }
                      ]
                    },
                    {
                      "Type": "",
                      "URI": "",
                      "DigestMethod": [
                        {
                          "_": "",
                          "Algorithm": "http://www.w3.org/2001/04/xmlenc#sha256"
                        }
                      ],
                      "DigestValue": [
                        {
                          "_": this._documentHash
                        }
                      ]
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