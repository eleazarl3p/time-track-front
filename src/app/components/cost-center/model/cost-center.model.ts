export class CostCenter {
  _id: number;
  code: number;
  desc: string;

  constructor(_id: number = 0, code: number = 0, desc: string = '') {
    this._id = _id;
    this.code = code;
    this.desc = desc;
  }
}
