import { Injectable } from '@angular/core';
import { FIFO } from '../algoritmos/FIFO';
import { Page } from '../modelos/pagina.model';
import { Process } from '../modelos/process.model';

@Injectable({
  providedIn: 'root'
})
export class MMU {

  realMemory: (Page | null)[]; // La memoria real contiene páginas o espacios vacíos (null)
  virtualMemory: Page[]; // Memoria virtual para páginas no cargadas en memoria real
  memoryMap: Map<number, Page[]>; // Mapa de punteros a tablas de páginas
  //fifoAlgorithm: FIFO; // Algoritmo FIFO para el reemplazo de páginas
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
  algorithmSelected: string = '';
  algorithm: any;

  public alldataAlt: (number | [number, number, number] | Page)[][] = [];

  constructor() {
    this.realMemory = Array(100).fill(null); // Memoria real con 100 espacios
    //this.virtualMemoryNew = Array(100).fill(null).map(() => new Page());
    this.virtualMemory = [];
    this.memoryMap = new Map();
    this.pageCount = 0;
    this.pointerCount = 0;
    this.totalTime = 1;
    this.thrashingTime = 1;
    //this.fifoAlgorithm = new FIFO(100);
    this.algorithm = this.setAlgorithm();
  }

  saveData(data: any): void {
    this.data = data;
    console.log('Datos guardados MMU:', this.data);
  }

  setAlgorithm(algorithmNew: string = '') {
    this.algorithmSelected = algorithmNew;
    //console.log("algoritmo EN MMU3", this.algorithmSelected)

    if (this.algorithmSelected === 'FIFO') {
      console.log("fifo selecionado");
      this.algorithm = new FIFO();
    } else if (this.algorithmSelected === 'SC') {
      console.log("sc selecionado");

    } else if (this.algorithmSelected === 'MRU') {
      console.log("mru selecionado");

    } else if (this.algorithmSelected === 'RND') {
      console.log("rnd selecionado");
    }

    return this.algorithm;
  }

  getData(): any {
    return this.data;
  }

  newProcess(pid: number, size: number, color: [number, number, number]): number {
    const pagesNeeded = Math.ceil(size / 4); // Se requieren las páginas necesarias para el proceso
    let insertedPages = 0;
    const createdPages: Page[] = [];

    for (let pageCounter = 0; pageCounter < pagesNeeded; pageCounter++) {
      let pageInserted = false;

      for (let i = 0; i < this.realMemory.length; i++) {
        if (this.realMemory[i] === null) {
          const page = new Page(this.pageCount, i, true); // Página en memoria real
          page.timestamp = this.totalTime;
          this.pageCount++;
          this.realMemory[i] = page;
          createdPages.push(page);
          insertedPages++;
          this.totalTime++;
          pageInserted = true;
          //console.log(`Página ${page.pageId} agregada.`); // Registro de la página agregada
          break;
        }
      }

      if (!pageInserted) {
        const page = new Page(this.pageCount, -1, false); // Página en memoria virtual
        this.pageCount++;
        const [replacedPage, time] = this.algorithm.referencePage(page);
        page.positionFlag = false;
        this.virtualMemory.push(page);
        createdPages.push(page);
        insertedPages++;
        this.totalTime += time;
        this.thrashingTime += time;
        //console.log(`Página reemplazada: ${replacedPage.pageId}`); // Registro de la página reemplazada
      }
    }

    const pagesArray = [pid, color, ...createdPages];
    this.alldataAlt.push(pagesArray);
    console.log("proceso creado", this.alldataAlt);

    //console.log(`Proceso con ${pagesNeeded} páginas agregado.`); // Registro del proceso agregado
    //this.printVirtualMemory(); // Imprimir estado de la memoria virtual después de agregar el proceso

    const currentPointer = this.pointerCount;
    this.memoryMap.set(currentPointer, createdPages);
    this.pointerCount++;

    return currentPointer;
  }

  printVirtualMemory() {
    console.log('Estado de la memoria virtual:');
    this.virtualMemory.forEach(page => {
      console.log(`Página ID: ${page.pageId}, Cargada: ${page.positionFlag}`);
    });
  }

  usePointer(pointer: number) {
    if (!this.memoryMap.has(pointer)) return;

    const pages = this.memoryMap.get(pointer) || [];

    for (const page of pages) {
      const [newPage, time] = this.algorithm.referencePage(page);
      page.lastAccess = this.totalTime;

      if (newPage) {
        this.virtualMemory.push(newPage);
        page.timestamp = this.totalTime;
        this.realMemory[newPage.physicalAddress] = page;
        this.thrashingTime += time;
      }
      this.totalTime += time;
    }

    ////this.printVirtualMemory(); // Imprimir estado de la memoria virtual después de usar un puntero
  }

  deletePointer(pointer: number) {
    if (!this.memoryMap.has(pointer)) return;

    const pages = this.memoryMap.get(pointer) || [];

    for (const page of pages) {
      if (page.positionFlag) {
        this.algorithm.delete(page);
        this.realMemory[page.physicalAddress] = null;
        this.totalTime++;
      } else {
        this.virtualMemory = this.virtualMemory.filter(p => p.pageId !== page.pageId);
        this.totalTime += 5;
        this.thrashingTime += 5;
      }
    }

    this.memoryMap.delete(pointer);
    //this.printVirtualMemory(); // Imprimir estado de la memoria virtual después de eliminar un puntero
  }

  killProcess(process: Process) {
    this.processIDKill = process.pid;
    for (const pointer of process.pageTable) {
      this.deletePointer(pointer);
    }
    process.pageTable = [];
    this.updateKILLMemoryRandV();
    //console.log("limiando procso vmos")
    //this.printVirtualMemory(); // Imprimir estado de la memoria virtual después de eliminar un proceso
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

  saveOperations(operaciones: string[]): void {
    this.operations = [];
    this.operations = operaciones;
    //console.log('Operaciones guardadas MMU:', this.operations);
  }

  getOperations(): string[] {
    return this.operations;
  }

  saveColors(colors: [number, number, number][]): void {
    this.usedColors = [];
    this.usedColors = colors;
    //console.log('Colores guardados MMU:', this.usedColors);
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
    console.log("alldata en kill", this.alldataAlt);
  }

  getAllDataAlt() {
    return this.alldataAlt;
  }

}
