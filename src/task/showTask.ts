import { Task } from './task';
import { readData } from '../utils';

export class ShowTask extends Task {
  async execute() {
    console.log(`exec show: ${this.name}`);
    const content = readData(this.source, this.model, this.symbol);
    console.log('-'.repeat(40));
    console.log(
      ' '.repeat(10),
      `DATA for ${this.source}.${this.model} of ${this.symbol}:`
    );
    console.log(content);
    console.log('-'.repeat(40));
  }
}
