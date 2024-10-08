import { Injectable } from '@angular/core';
import { FIFO } from '../algoritmos/FIFO';
import { Page } from '../modelos/pagina.model';

@Injectable({
  providedIn: 'root'
})
export class MMUServiceService {

  fifoAlgorithm: FIFO;

  constructor() {
    this.fifoAlgorithm = new FIFO(5); // Capacidad de memoria de 5 páginas
  }

  managePage(pageId: number, timestamp: number) {
    const page = new Page(pageId, 0, true); // Asume dirección física inicial 0 y en memoria real
    page.timestamp = timestamp;
    const [replacedPage, result] = this.fifoAlgorithm.referencePage(page);
    console.log(`Página reemplazada: ${replacedPage?.pageId || 'Ninguna'}`);
    console.log(`Resultado: ${result}`);
    this.fifoAlgorithm.printMemory();
  }
}
