import { Injectable } from '@angular/core';
import { FIFO } from '../algoritmos/FIFO';
import { Page } from '../modelos/pagina.model';
import { Process } from '../modelos/process.model';
import { OPT } from '../algoritmos/OPT';
import { RND } from '../algoritmos/RND';
import { SecondChance } from '../algoritmos/SecondChance';
import { MRU } from '../algoritmos/MRU';
import { producerIncrementEpoch } from '@angular/core/primitives/signals';

@Injectable({
  providedIn: 'root'
})
export class MMU {

  realMemory: (Page | null)[];
  virtualMemory: Page[];
  memoryMap: Map<number, Page[]>;
  pageCount: number;
  pointerCount: number;
  totalTime: number;
  thrashingTime: number;
  private data: any = {};
  public operations: string[] = [];
  public usedColors: [number, number, number][] | undefined;
  public virtualMemoryNew: Page[] = [];
  public realMemoryNew: Page[] = [];
  public processIDKill: number = 0;
  public pointerDelete: number = 0;
  public totalFragmentationWaste: number = 0;
  algorithmSelected: string = '';
  algorithm: any;


  public alldataAlt: (number | [number, number, number] | Page)[][] = [];

  constructor() {
    this.realMemory = Array(100).fill(null); // Memoria real con 100 espacios
    this.virtualMemory = [];
    this.memoryMap = new Map();
    this.pageCount = 0;
    this.pointerCount = 1;
    this.totalTime = 1;
    this.thrashingTime = 1;
    this.algorithm = this.setAlgorithm();
  }

  saveData(data: any): void {
    this.data = data;
  }

  setAlgorithm(algorithmNew: string = '') {
    this.algorithmSelected = algorithmNew;

    if (this.algorithmSelected === 'FIFO') {
      this.algorithm = new FIFO();
    } else if (this.algorithmSelected === 'SC') {
      this.algorithm = new SecondChance();
    } else if (this.algorithmSelected === 'MRU') {
      this.algorithm = new MRU();
    } else if (this.algorithmSelected === 'RND') {
      this.algorithm = new RND();
    } else if (this.algorithmSelected === 'OPT') {
      this.algorithm = new OPT();
    }

    return this.algorithm;
  }

  getData(): any {
    return this.data;
  }

  newProcess(pid: number, size: number, color: [number, number, number]): number {
    const pages = Math.ceil(size / 4);
    let insertedPages = 0;
    const createdPages: Page[] = [];

    const fragmentationInternal = size % 4;

    // Acumular la fragmentación interna
    this.totalFragmentationWaste += fragmentationInternal;

    for (let pageCounter = 0; pageCounter < pages; pageCounter++) {
      for (let spaceInRealMemory = 0; spaceInRealMemory < this.realMemory.length; spaceInRealMemory++) {
        if (this.realMemory[spaceInRealMemory] === null) {
          const page = new Page(this.pageCount, spaceInRealMemory, true);
          page.timestamp = this.totalTime;
          this.pageCount++;
          this.realMemory[spaceInRealMemory] = page;
          createdPages.push(page);
          this.algorithm.memory.push(page);
          insertedPages++;
          this.totalTime++;
          break;
        }
      }
    }

    while (insertedPages < pages) {
      const page = new Page(this.pageCount, -1, false);
      this.pageCount++;
      const [replacedPage, time] = this.algorithm.replacePage(page);

      if (replacedPage !== null) {
        replacedPage.positionFlag = false;
        this.virtualMemory.push(replacedPage);
        page.positionFlag = true;
        page.physicalAddress = replacedPage.physicalAddress;
        this.realMemory[page.physicalAddress] = page;
        createdPages.push(page);
      }

      insertedPages++;
      this.totalTime += time;
      this.thrashingTime += time;
    }

    const pagesArray = [pid, color, ...createdPages];
    this.alldataAlt.push(pagesArray);

    const currentPointer = this.pointerCount;
    this.memoryMap.set(currentPointer, createdPages);
    this.pointerCount++;
    return currentPointer;
  }

  usePointer(pointer: number) {
    if (this.memoryMap.size === 0 || !this.memoryMap.has(pointer)) {
      return;
    }

    const pages = this.memoryMap.get(pointer);

    if (!pages) return;
    for (const page of pages) {
      const [replacedPage, time] = this.algorithm.replacePage(page);
      page.lastAccess = this.totalTime;
      if (replacedPage !== null) {
        this.virtualMemory.push(replacedPage);
        page.timestamp = this.totalTime;
        this.realMemory[replacedPage.physicalAddress] = page;
        this.thrashingTime += time;
      }
      this.totalTime += time;
    }
  }

  deletePointer(pointer: number) {
    this.pointerDelete = pointer;
    if (this.memoryMap.size === 0 || !this.memoryMap.has(pointer)) {
        return;
    }
    const pagesDelete = this.memoryMap.get(pointer);

    const pages = Array.from(this.memoryMap.entries())
        .filter(([key]) => key !== pointer)
        .flatMap(([, pages]) => pages);

    if (!pages) return;
    if (!pagesDelete) return;

    for (const page of pagesDelete) {
        if (page.positionFlag) {
            this.algorithm.delete(page);
            this.totalTime++;
        } else {
            this.totalTime += 5;
            this.thrashingTime += 5;
        }
    }

    this.virtualMemory = [];
    this.realMemory = Array(100).fill(null);

    pages.forEach((page) => {
        if (page.positionFlag) {
            this.realMemory[page.physicalAddress] = page;
        } else {
            this.virtualMemory.push(page);
        }
    });

    this.alldataAlt = this.alldataAlt.filter((data) => {
        const pid = data[0];
        const remainingPages = data.slice(1).filter((page): page is Page => page instanceof Page && pagesDelete.indexOf(page) === -1); // Filtrar las páginas eliminadas

        return remainingPages.length > 0 ? [pid, ...remainingPages] : null;
    });

    this.memoryMap.delete(pointer);
}


  killProcess(process: Process) {

    console.log("el mapa", this.memoryMap);

    this.processIDKill = process.pid;
    const size = process.size;
    const fragmentationInternal = size % 4;
    this.totalFragmentationWaste -= fragmentationInternal;

    for (const pointer of process.pageTable) {
      console.log("buenas" + pointer);
      this.deletePointer(pointer);
    }
    process.pageTable = [];
    this.updateKILLMemoryRandV();
    console.log("el mapa final", this.memoryMap);
  }

  getTime(): number {
    return this.totalTime;
  }

  getThrashingTime(): number {
    return this.thrashingTime;
  }

  getRealMemory(): (Page | null)[] {
    return this.realMemory;
  }

  getVirtualMemory(): Page[] {
    return this.virtualMemory;
  }

  getFragmentation(): number {
    return this.totalFragmentationWaste;
  }

  saveOperations(operaciones: string[]): void {
    this.operations = [];
    this.operations = operaciones;
  }

  getOperations(): string[] {
    return this.operations;
  }

  saveColors(colors: [number, number, number][]): void {
    this.usedColors = [];
    this.usedColors = colors;
  }

  getColors(): [number, number, number][] | undefined {
    return this.usedColors;
  }

  updateKILLMemoryRandV() {
    const pidToRemove = this.processIDKill;

    // Filtrar para eliminar el subarreglo que comienza con el PID a eliminar
    this.alldataAlt = this.alldataAlt.filter((pages) => pages[0] !== pidToRemove);

    this.virtualMemory = [];
    this.realMemory = Array(100).fill(null);

    // actualizar virtualMemory y realMemory
    this.alldataAlt.forEach((pages) => {
      const pid = pages[0];
      const pageList = pages.slice(1);

      pageList.forEach((page) => {
        page = page as Page;
        if (page.positionFlag) {
          this.realMemory[page.physicalAddress] = page;
        } else {
          this.virtualMemory.push(page);
        }
      });
    });

    this.virtualMemoryNew = this.virtualMemory.filter((page): page is Page => page !== null);
    this.realMemoryNew = this.realMemory.filter((page): page is Page => page !== null);

  }


  getAllDataAlt() {
    return this.alldataAlt;
  }

}
