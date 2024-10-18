import { Page } from "../modelos/pagina.model";
import { PageAlgorithm } from "../modelos/pageAlgorithm";

export class RND extends PageAlgorithm {
  constructor(sizeMemory: number = 100) {
    super(sizeMemory);
  }

  override replacePage(refPage: Page): [Page | null, number] {

    for (const page of this.memory) {
      if (page) {
        page.lastAccess += 1;
      }
    }

    // Verificar si la página ya está en memoria
    for (const page of this.memory) {
      if (page && page.pageId === refPage.pageId) {
        page.lastAccess = 0;
        return [null, 1];
      }
    }

    // Si la página no está en memoria, reemplazar una página aleatoria con un indice altorio
    const randomIndex = Math.floor(Math.random() * this.memory.length);
    const pageToReplace = this.memory[randomIndex];
    const physicalAddress = pageToReplace?.physicalAddress ?? -1;
    this.memory = this.memory.filter(page => page !== pageToReplace);
    refPage.physicalAddress = physicalAddress;
    this.memory.push(refPage);

    return [pageToReplace, 5];
  }
}
