import { PageAlgorithm } from "../modelos/pageAlgorithm";
import { Page } from "../modelos/pagina.model";

export class OPT extends PageAlgorithm {
  futureReferences: Page[];
  currentTime: number; // Contador interno para el tiempo

  constructor(memoryCapacity: number = 100, futureReferences: Page[] = []) {
    super(memoryCapacity);
    this.futureReferences = futureReferences;
    this.currentTime = 0; // Inicializar el contador de tiempo
  }

  override referencePage(refPage: Page): [Page | null, number] {
    // Verificar si la página ya está en memoria
    for (const page of this.memory) {
      if (page && page.pageId === refPage.pageId) {
        this.currentTime++; // Incrementar el contador de tiempo
        return [null, 1]; // La página ya está en memoria, no se necesita reemplazo
      }
    }

    // Si la memoria está llena, buscar la página óptima para reemplazar
    if (this.memory.length >= this.memoryCapacity) {
      const pageToReplace = this.findOptimalPage(this.currentTime);
      const replacedPage = pageToReplace ? this.deleteAndReturn(pageToReplace) : null;
      this.memory.push(refPage); // Añadir la nueva página al final de la lista
      this.currentTime++; // Incrementar el contador de tiempo
      return [replacedPage, 5]; // Devolver la página reemplazada
    }

    // Si aún hay espacio en memoria, simplemente agregar la nueva página
    this.memory.push(refPage);
    this.currentTime++; // Incrementar el contador de tiempo
    return [null, 0];
  }

  // Función para encontrar la página óptima para reemplazar
  private findOptimalPage(currentTime: number): Page | null {
    let farthestUse = -1;
    let pageToReplace: Page | null = null;

    // Recorrer las páginas en memoria y ver cuál se usará más tarde
    for (const page of this.memory) {
      if (page) {
        const nextUse = this.findNextUse(page, currentTime);
        if (nextUse === -1) { 
          // Si no se volverá a usar, esta es la página que debemos reemplazar
          return page;
        }
        if (nextUse > farthestUse) {
          farthestUse = nextUse;
          pageToReplace = page;
        }
      }
    }
    return pageToReplace;
  }

  // Función para encontrar cuándo se usará la página nuevamente
  private findNextUse(page: Page, currentTime: number): number {
    for (let i = currentTime + 1; i < this.futureReferences.length; i++) {
      if (this.futureReferences[i].pageId === page.pageId) {
        return i;
      }
    }
    return -1; // Si no se encuentra, significa que no se volverá a usar
  }

  // Función para eliminar y devolver la página reemplazada
  private deleteAndReturn(page: Page): Page {
    this.memory = this.memory.filter(p => p !== page);
    return page;
  }
}
