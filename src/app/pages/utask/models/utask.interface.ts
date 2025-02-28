import { Job } from '../../../components/job/model/job.interface';
import { User } from '../../../components/user/models/user.model';

export interface ITask {
  _id: number;
  pay_type: string;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  approved?: boolean;
  code?: string;
  job?: Job;
  item?: string;
  user: User;
}

export class STask {
  job: string;
  item: string;
  hour: string;
  minutes: string;

  constructor(job: string, item: string, hour: string, minutes: string) {
    this.job = job;
    this.item = item;
    this.hour = hour;
    this.minutes = minutes;
  }
}
