import { Task } from './task';
import { deleteData } from '../utils';

export class CleanTask extends Task {
  async execute() {
    console.log(`Exec clean: ${this.name}`);
    deleteData(this.source, this.model, this.symbol);
  }
}
