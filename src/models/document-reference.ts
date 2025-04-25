import { BaseModel } from './base-model';

/**
 * Represents a document reference
 */
export class DocumentReference extends BaseModel {
  private _id: string = '';
  private _documentType: string = '';
  private _documentDescription: string = '';

  // Getter and Setter for id
  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  // Getter and Setter for documentType
  get documentType(): string {
    return this._documentType;
  }

  set documentType(value: string) {
    this._documentType = value;
  }

  // Getter and Setter for documentDescription
  get documentDescription(): string {
    return this._documentDescription;
  }

  set documentDescription(value: string) {
    this._documentDescription = value;
  }

  /**
   * Converts the document reference to a JSON representation
   */
  toJSON(): any {
    const reference: any = {
      "ID": [
        {
          "_": this._id
        }
      ]
    };

    if (this._documentType) {
      reference["DocumentType"] = [
        {
          "_": this._documentType
        }
      ];
    }

    if (this._documentDescription) {
      reference["DocumentDescription"] = [
        {
          "_": this._documentDescription
        }
      ];
    }

    return reference;
  }
}