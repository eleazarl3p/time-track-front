export class Job {
  _id: number;

  name: string;

  items: string[];

  constructor() {
    this._id = 0;
    this.name = '';
    this.items = [];
  }
}

// export class Item {
//   _id: number;

//   no: string;

//   constructor(id = 0, no = '') {
//     this._id = id;
//     this.no = no;
//   }
// }
