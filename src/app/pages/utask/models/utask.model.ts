export class Task {
  _id: number;
  pay_type: string;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string | null;
  approved?: boolean | null;
  code?: string | null;
  job?: number | null;
  item?: string | null;
  user: number;

  constructor(
    id: number = 0,
    pay_type: string = '',
    date: string = '',
    start_time = '',
    end_time = '',
    note: string | null = null,
    approved: boolean | null = null,
    code: string | null = null,
    job: number | null = null,
    item: string | null = null,
    user = 0
  ) {
    this._id = id;
    this.pay_type = pay_type;
    this.date = date;
    this.start_time = start_time;
    this.end_time = end_time;
    this.notes = note;
    this.approved = approved;
    this.code = code;
    this.job = job;
    this.item = item;
    this.user = user;
  }
}

// export class Task2 {
//   _id: number;
//   pay_type: string;
//   date: string;
//   start_hour: string;
//   end_hour: string;
//   start_minute: string;
//   end_minute: string;
//   notes?: string | null;
//   approved?: boolean | null;
//   code?: string | null;
//   job?: number | null;

//   constructor(
//     pay_type: string = '',
//     date: string = '',
//     start_hour = '',
//     end_hour = '',
//     start_minute = '',
//     end_minute = '',
//     note: string | null = null,
//     approved: boolean | null = null,
//     code: string | null = null,
//     job: number | null = null
//   ) {
//     this._id = 0;
//     this.pay_type = pay_type;
//     this.date = date;
//     this.start_hour = start_hour;
//     this.end_hour = end_hour;
//     this.start_minute = start_minute;
//     this.end_minute = end_minute;
//     this.notes = note;
//     this.approved = approved;
//     this.code = code;
//     this.job = job;
//   }
//}
