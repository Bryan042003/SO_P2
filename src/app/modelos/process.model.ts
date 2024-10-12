import { Page } from "./pagina.model";


export class Process {
    pid: number;
    size: number;
    pageTable: number[];
    color: [number, number, number];

    constructor(pid: number, size: number, color: [number, number, number]) {
      this.pid = pid;
      this.size = size;
      this.color = color;
      this.pageTable = [];
    }

  }
