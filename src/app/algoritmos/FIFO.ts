import { PageAlgorithm } from "../modelos/pageAlgorithm";
import { Page } from "../modelos/pagina.model";

export class FIFO extends PageAlgorithm {
  constructor(sizeMemory: number = 100) {
    super(sizeMemory);
  }

  override replacePage(refPage: Page): [Page | null, number] {
    // Verificar si la página ya está en memoria
    for (const page of this.memory) {
      if (page && page.pageId === refPage.pageId) {
        return [null, 1];
      }
    }

    // memoria está llena, eliminar la primera página
    if (this.memory.length >= this.sizeMemory) {
      const oldestPage = this.memory.shift() || null;
      this.memory.push(refPage); // Añadir la nueva página al final de la lista
      return [oldestPage, 5];
    }

    this.memory.push(refPage);
    return [null, 0];
  }
}


