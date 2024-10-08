import { Injectable } from '@angular/core';
import { FIFO } from '../algoritmos/FIFO';
import { Page } from '../modelos/pagina.model';

@Injectable({
  providedIn: 'root'
})
export class MMU {

  fifoAlgorithm: FIFO;
  processIdCounter: number = 1;

  constructor() {
    this.fifoAlgorithm = new FIFO(5); // Capacidad de memoria de 5 páginas
  }

  // Simulación de agregar un proceso
  newProcess(size: number) {
    const pagesNeeded = Math.ceil(size / 4); // Dividir en bloques de 4KB
    for (let i = 0; i < pagesNeeded; i++) {
      this.managePage(this.processIdCounter++);
    }
    console.log(`Proceso con ${pagesNeeded} páginas agregado.`);
  }

  // Método para gestionar páginas
  managePage(pageId: number) {
    const page = new Page(pageId, 0, true); // Asume dirección física inicial 0 y en memoria real
    const [replacedPage, result] = this.fifoAlgorithm.referencePage(page);
    console.log(`Página ${page.pageId} agregada.`);
    if (replacedPage) {
      console.log(`Página reemplazada: ${replacedPage.pageId}`);
    }
    this.fifoAlgorithm.printMemory();
  }

  // Simulación de accesos a la memoria
  simulateMemoryAccess() {
    this.managePage(Math.floor(Math.random() * 10) + 1); // Simulación de acceso a páginas aleatorias
  }

  // Método para mostrar el estado de la memoria
  showMemoryState() {
    this.fifoAlgorithm.printMemory();
  }
}
