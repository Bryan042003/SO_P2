import { Page } from "./pagina.model";


export class Process {
    pid: number;
    size: number;
    pageTable: number[];
   
    constructor(pid: number, size: number, color: [number, number, number]) {
      this.pid = pid;
      this.size = size;
      this.pageTable = [];
    }

  }
  