import { PageAlgorithm } from "../modelos/pageAlgorithm";
import { Page } from "../modelos/pagina.model";

export class FIFO extends PageAlgorithm {
  constructor(memoryCapacity: number = 100) {
    super(memoryCapacity);
  }

  override referencePage(refPage: Page): [Page | null, number] {
    // Verifica si la página ya está en la memoria
    for (let page of this.memory) {
      if (page?.pageId === refPage.pageId) {
        return [null, 0]; // No se reemplazó ninguna página
      }
    }

    let replacedPage: Page | null = null;

    // Si la memoria está llena, reemplaza la página más antigua
    if (this.memory.length >= this.memoryCapacity) {
      replacedPage = this.memory.pop() || null; // Elimina la primera página
    }
    this.memory.push(refPage);

    return [replacedPage, 1];
  }
}
