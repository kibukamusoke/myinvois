import { BaseModel } from './base-model';
import moment from 'moment-timezone';

/**
 * Represents the signed properties for a document
 */
export class SignedProperties extends BaseModel {
  private _id: string = 'id-xades-signed-props';
  private _signingTime: Date = new Date();
  private _certificateHash: string = '';
  private _issuerName: string = '';
  private _serialNumber: string = '';

  // Getter and Setter for id
  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  // Getter and Setter for signingTime
  get signingTime(): Date {
    return this._signingTime;
  }

  set signingTime(value: Date) {
    this._signingTime = value;
  }

  // Getter and Setter for certificateHash
  get certificateHash(): string {
    return this._certificateHash;
  }

  set certificateHash(value: string) {
    this._certificateHash = value;
  }

  // Getter and Setter for issuerName
  get issuerName(): string {
    return this._issuerName;
  }

  set issuerName(value: string) {
    this._issuerName = value;
  }

  // Getter and Setter for serialNumber
  get serialNumber(): string {
    return this._serialNumber;
  }

  set serialNumber(value: string) {
    this._serialNumber = value;
  }

  /**
   * Converts the signed properties to a JSON representation
   */
  toJSON(): any {
    return [
      {
        "Id": this._id,
        "SignedSignatureProperties": [
          {
            "SigningTime": [
              {
                "_": moment(this._signingTime).format("YYYY-MM-DDTHH:mm:ss") + "Z"
              }
            ],
            "SigningCertificate": [
              {
                "Cert": [
                  {
                    "CertDigest": [
                      {
                        "DigestMethod": [
                          {
                            "_": "",
                            "Algorithm": "http://www.w3.org/2001/04/xmlenc#sha256"
                          }
                        ],
                        "DigestValue": [
                          {
                            "_": this._certificateHash
                          }
                        ]
                      }
                    ],
                    "IssuerSerial": [
                      {
                        "X509IssuerName": [
                          {
                            "_": this._issuerName
                          }
                        ],
                        "X509SerialNumber": [
                          {
                            "_": this._serialNumber
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
      }
    ];
  }
}