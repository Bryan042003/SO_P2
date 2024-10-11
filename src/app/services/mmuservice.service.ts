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
  fifoAlgorithm: FIFO; // Algoritmo FIFO para el reemplazo de páginas
  pageCount: number;
  pointerCount: number;
  totalTime: number;
  thrashingTime: number;
  private datos: any = {};

  constructor() {
    this.realMemory = Array(100).fill(null); // Memoria real con 100 espacios
    this.virtualMemory = [];
    this.memoryMap = new Map();
    this.pageCount = 0;
    this.pointerCount = 0;
    this.totalTime = 1;
    this.thrashingTime = 1;
    this.fifoAlgorithm = new FIFO(100); // Capacidad de memoria de 5 páginas
  }

  guardarDatos(datos: any): void {
    this.datos = datos;
    console.log('Datos guardados MMU:', this.datos);
  }

  obtenerDatos(): any {
    return this.datos;
  }

  setAlgorithm(algorithm: FIFO) {
    this.fifoAlgorithm = algorithm;
    this.fifoAlgorithm.memory = this.realMemory;
  }

  newProcess(pid: number, size: number): number {
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
          console.log(`Página ${page.pageId} agregada.`); // Registro de la página agregada
          break;
        }
      }

      if (!pageInserted) {
        const page = new Page(this.pageCount, -1, false); // Página en memoria virtual
        this.pageCount++;
        const [replacedPage, time] = this.fifoAlgorithm.referencePage(page);
        page.positionFlag = false;
        this.virtualMemory.push(page);
        createdPages.push(page);
        insertedPages++;
        this.totalTime += time;
        this.thrashingTime += time;
        //console.log(`Página reemplazada: ${replacedPage.pageId}`); // Registro de la página reemplazada
      }
    }

    console.log(`Proceso con ${pagesNeeded} páginas agregado.`); // Registro del proceso agregado
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
      const [newPage, time] = this.fifoAlgorithm.referencePage(page);
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
        this.fifoAlgorithm.delete(page);
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
    for (const pointer of process.pageTable) {
      this.deletePointer(pointer);
    }
    process.pageTable = [];
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
}
