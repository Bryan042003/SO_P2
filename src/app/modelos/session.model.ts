export class Session {
  n_instructions: number;
  instructions: string[];

  constructor(n_instructions: number, instructions: string[]) {
      this.n_instructions = n_instructions;
      this.instructions = [];
  }

  addInstruction(instruction: string): void {
      this.instructions.push(instruction);
  }
}
