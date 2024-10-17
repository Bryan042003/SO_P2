import { PageAlgorithm } from "../modelos/pageAlgorithm";
import { Page } from "../modelos/pagina.model";

export class OPT extends PageAlgorithm {
  constructor(memoryCapacity: number = 100) {
    super(memoryCapacity);
  }

  override referencePage(refPage: Page): [Page | null, number] {
    // Verificar si la página ya está en la memoria
    for (let page of this.memory) {
      if (page && page.pageId === refPage.pageId) {
        return [null, 1]; // No se reemplazó ninguna página
      }
    }

    // Si la página no está en la memoria y la memoria está llena, debemos reemplazar una página
    if (this.memory.length >= this.memoryCapacity) {
      let pageToReplace: Page | null = null;
      let farthestUseIndex = -1;

      for (let i = 0; i < this.memory.length; i++) {
        const page = this.memory[i];
        const nextUseIndex = this.findNextUseIndex(page, this.memory.filter(p => p !== null));

        // Si la página no se usará más en el futuro
        if (nextUseIndex === -1) {
          pageToReplace = page;
          break; // No necesitamos seguir buscando
        }

        // Encontrar la página que será utilizada más tarde
        if (nextUseIndex > farthestUseIndex) {
          farthestUseIndex = nextUseIndex;
          pageToReplace = page;
        }
      }

      // Si se ha encontrado una página para reemplazar, la eliminamos de la memoria
      if (pageToReplace) {
        this.delete(pageToReplace);
      }
    }

    // Añadir la nueva página a la memoria
    this.memory.push(refPage);
    return [null, 1]; // Retorna que no se reemplazó ninguna página
  }

  private findNextUseIndex(page: Page | null, futureReferences: Page[]): number {
    if (!page) return -1; // Si la página es nula, retornar -1

    // Buscar el índice del siguiente uso de la página en futuras referencias
    for (let i = 0; i < futureReferences.length; i++) {
        if (futureReferences[i].pageId === page.pageId) {
            return i; // Retornar el índice del siguiente uso
        }
    }

    return -1; // Retornar -1 si la página no será utilizada más
  }
}
