import { PageAlgorithm } from "../modelos/pageAlgorithm";
import { Page } from "../modelos/pagina.model";

export class FIFO extends PageAlgorithm {
  constructor(memoryCapacity: number = 100) {
    super(memoryCapacity);
  }

  override referencePage(refPage: Page): [Page | null, number] {
    // Verificar si la página ya está en memoria
    for (const page of this.memory) {
      if (page && page.pageId === refPage.pageId) {
        return [null, 1]; // La página ya está en memoria, no se necesita reemplazo
      }
    }

    // Si la memoria está llena, eliminar la primera página (FIFO)
    if (this.memory.length >= this.memoryCapacity) {
      const oldestPage = this.memory.shift() || null;
      this.memory.push(refPage); // Añadir la nueva página al final de la lista
      return [oldestPage, 5]; // Devolver la página reemplazada
    }

    // Si aún hay espacio en memoria, simplemente agregar la nueva página
    this.memory.push(refPage);
    return [null, 0];
  }
}
