export class User {
  _id: number;
  first_name: string;
  second_name?: string;
  last_name: string;
  second_last_name?: string;
  username: string;
  password: string;
  role: string;

  constructor() {
    this._id = 0;
    this.first_name = '';
    this.last_name = '';
    this.second_name = '';
    this.second_last_name = '';
    this.username = '';
    this.password = '';
    this.role = 'EMPLOYEE';
  }

  fullName = () => {
    return `${this.first_name} ${this.last_name}`;
  };
}
