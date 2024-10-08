import { Page } from "./pagina.model";


export class Process {
    pid: number;
    size: number;
    pageTable: Page[];  // O puedes definir el tipo específico de los elementos si sabes cuál será
   
    constructor(pid: number, size: number, color: [number, number, number]) {
      this.pid = pid;
      this.size = size;
      this.pageTable = [];
    }

  }
  