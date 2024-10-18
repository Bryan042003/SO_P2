import { Injectable } from '@angular/core';
import { FIFO } from '../algoritmos/FIFO';
import { Page } from '../modelos/pagina.model';
import { Process } from '../modelos/process.model';
import { OPT } from '../algoritmos/OPT';
import { RND } from '../algoritmos/RND';
import { SecondChance } from '../algoritmos/SecondChance';
import { MRU } from '../algoritmos/MRU';

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
  public pointerDelete: number = 0;
  public totalFragmentationWaste: number = 0;
  algorithmSelected: string = '';
  algorithm: any;

  public alldataAlt: (number | [number, number, number] | Page)[][] = [];

  constructor() {
    this.realMemory = Array(100).fill(null); // Memoria real con 100 espacios
    //this.virtualMemoryNew = Array(100).fill(null).map(() => new Page());
    this.virtualMemory = [];
    this.memoryMap = new Map();
    this.pageCount = 0;
    this.pointerCount = 1;
    this.totalTime = 1;
    this.thrashingTime = 1;
    //this.fifoAlgorithm = new FIFO(100);
    this.algorithm = this.setAlgorithm();

  }

  saveData(data: any): void {
    this.data = data;
    //console.log('Datos guardados MMU:', this.data);
  }

  setAlgorithm(algorithmNew: string = '') {
    this.algorithmSelected = algorithmNew;
    //console.log("algoritmo EN MMU3", this.algorithmSelected)

    if (this.algorithmSelected === 'FIFO') {
      console.log("fifo selecionado");
      this.algorithm = new FIFO();
    } else if (this.algorithmSelected === 'SC') {
      console.log("sc selecionado");
      this.algorithm = new SecondChance();
    } else if (this.algorithmSelected === 'MRU') {
      console.log("mru selecionado");
      this.algorithm = new MRU();
    } else if (this.algorithmSelected === 'RND') {
      console.log("rnd selecionado");
      this.algorithm = new RND();
    } else if (this.algorithmSelected === 'OPT') {
      this.algorithm = new OPT();
      console.log("opt selecionado");
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
      const [replacedPage, time] = this.algorithm.referencePage(page);

      if (replacedPage !== null) {
        // Solo intenta acceder a replacedPage si no es nulo
        replacedPage.positionFlag = false;
        this.virtualMemory.push(replacedPage); // Mueve la página reemplazada a la memoria virtual
        page.positionFlag = true; // Marca la nueva página como en memoria real
        page.physicalAddress = replacedPage.physicalAddress; // Asigna la dirección física de la página reemplazada
        createdPages.push(page); // Agrega la nueva página creada
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
    //console.log("new Real actual:", this.realMemory);
    //console.log("new Virtual actual", this.virtualMemory);

    return currentPointer;
  }

  usePointer(pointer: number) {
    if (this.memoryMap.size === 0 || !this.memoryMap.has(pointer)) {
      return;
    }

    const pages = this.memoryMap.get(pointer);

    if (!pages) return;
    for (const page of pages) {
      const [replacedPage, time] = this.algorithm.referencePage(page);
      page.lastAccess = this.totalTime;
      if (replacedPage !== null) {
        this.virtualMemory.push(replacedPage);
        page.timestamp = this.totalTime;
        this.realMemory[replacedPage.physicalAddress] = page;
        this.thrashingTime += time;

        //console.log("memoria Real actual:", this.realMemory);
        //console.log("memoria Virtual actual", this.virtualMemory);
      }
      this.totalTime += time;
    }
  }

  deletePointer(pointer: number) {
    this.pointerDelete = pointer;

    // Verificar si el puntero existe en memoryMap
    if (this.memoryMap.size === 0 || !this.memoryMap.has(pointer)) {
        return;
    }

    const pagesDelete = this.memoryMap.get(pointer);

    // Filtrar las páginas que no están asociadas al puntero que se está eliminando
    const pages = Array.from(this.memoryMap.entries())
        .filter(([key]) => key !== pointer)  // Filtra entradas que no coinciden con el puntero
        .flatMap(([, pages]) => pages);  // Combina todas las páginas en un solo array

    console.log("pages", pages);

    // Comprobar que las páginas para eliminar existen
    if (!pages) return;
    if (!pagesDelete) return;

    // Eliminar las páginas asociadas al puntero
    for (const page of pagesDelete) {
        if (page.positionFlag) {
            this.algorithm.delete(page);
            this.totalTime++;
        } else {
            this.totalTime += 5;
            this.thrashingTime += 5;
        }
    }

    // Inicializar las memorias
    this.virtualMemory = [];
    this.realMemory = Array(100).fill(null);

    // Actualizar virtualMemory y realMemory con las páginas restantes
    pages.forEach((page) => {
        if (page.positionFlag) {
            this.realMemory[page.physicalAddress] = page;
        } else {
            this.virtualMemory.push(page);
        }
    });

    // Actualizar alldataAlt con las páginas restantes
    this.alldataAlt = this.alldataAlt.filter((data) => {
        const pid = data[0]; // Obtener el PID
        const remainingPages = data.slice(1).filter((page): page is Page => page instanceof Page && pagesDelete.indexOf(page) === -1); // Filtrar las páginas eliminadas

        // Retener el PID solo si aún tiene páginas
        return remainingPages.length > 0 ? [pid, ...remainingPages] : null;
    });

    // Eliminar el puntero del memoryMap
    this.memoryMap.delete(pointer);

}


  killProcess(process: Process) {
    this.processIDKill = process.pid;
    const size = process.size;
    //Eliminar fragmentacion interna de este proceso
    const fragmentationInternal = size % 4;
    this.totalFragmentationWaste -= fragmentationInternal;

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

  getFragmentation(): number {
    return this.totalFragmentationWaste;
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


    //console.log("alldata en kill", this.alldataAlt);
  }


  getAllDataAlt() {
    return this.alldataAlt;
  }

}
