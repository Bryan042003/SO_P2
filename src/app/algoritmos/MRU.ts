import { PageAlgorithm } from "../modelos/pageAlgorithm";
import { Page } from "../modelos/pagina.model";

export class MRU extends PageAlgorithm {
  constructor(memoryCapacity: number = 100) {
    super(memoryCapacity);
  }

  override replacePage(refPage: Page): [Page | null, number] {

    this.memory.forEach(page => {
      if (page) {
        page.lastAccess += 1;
      }
    });

    // Verifica si la página ya está en memoria
    for (let page of this.memory) {
      if (page?.pageId === refPage.pageId) {
        page.lastAccess = 0;
        return [null, 1];
      }
    }

    // Si la página no está en memoria, reemplaza la página más recientemente utilizada
    let maxTime = Number.MAX_SAFE_INTEGER;
    let maxPage: Page | null = null;

    for (let page of this.memory) {
      if (page && page.lastAccess < maxTime) {
        maxTime = page.lastAccess;
        maxPage = page;
      }
    }

    if (maxPage) {
      const physicalAddress = maxPage.physicalAddress;
      this.delete(maxPage);

      refPage.physicalAddress = physicalAddress;
      this.memory.push(refPage);
    }

    return [maxPage, 5];
  }
}
