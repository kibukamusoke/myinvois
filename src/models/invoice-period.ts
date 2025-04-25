import { BaseModel } from './base-model';
import moment from 'moment-timezone';

/**
 * Represents an invoice period
 */
export class InvoicePeriod extends BaseModel {
  private _startDate: Date | null = null;
  private _endDate: Date | null = null;
  private _description: string = '';

  // Getter and Setter for startDate
  get startDate(): Date | null {
    return this._startDate;
  }

  set startDate(value: Date | null) {
    this._startDate = value;
  }

  // Getter and Setter for endDate
  get endDate(): Date | null {
    return this._endDate;
  }

  set endDate(value: Date | null) {
    this._endDate = value;
  }

  // Getter and Setter for description
  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  /**
   * Converts the invoice period to a JSON representation
   */
  toJSON(): any {
    if (!this._startDate && !this._endDate && !this._description) {
      return [];
    }

    return [
      {
        "StartDate": this._startDate ? [
          {
            "_": moment(this._startDate).format('YYYY-MM-DD')
          }
        ] : [],
        "EndDate": this._endDate ? [
          {
            "_": moment(this._endDate).format('YYYY-MM-DD')
          }
        ] : [],
        "Description": this._description ? [
          {
            "_": this._description
          }
        ] : []
      }
    ];
  }
}