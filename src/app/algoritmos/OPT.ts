import { PageAlgorithm } from "../modelos/pageAlgorithm";
import { Page } from "../modelos/pagina.model";

export class OPT extends PageAlgorithm {
  futureReferences: Page[];
  currentTime: number; // Contador interno para el tiempo

  constructor(memoryCapacity: number = 100, futureReferences: Page[] = []) {
    super(memoryCapacity);
    this.futureReferences = futureReferences;
    this.currentTime = 0;
  }

  override replacePage(refPage: Page): [Page | null, number] {
    // Verificar si la página ya está en memoria
    for (const page of this.memory) {
      if (page && page.pageId === refPage.pageId) {
        this.currentTime++;
        return [null, 1];
      }
    }

    // Si la memoria está llena, buscar la página óptima para reemplazar
    if (this.memory.length >= this.memoryCapacity) {
      const pageToReplace = this.findOptimalPage(this.currentTime);
      const replacedPage = pageToReplace ? this.deleteAndReturn(pageToReplace) : null;
      this.memory.push(refPage);
      this.currentTime++;
      return [replacedPage, 5];
    }

    // Si aún hay espacio en memoria, simplemente agregar la nueva página
    this.memory.push(refPage);
    this.currentTime++;
    return [null, 0];
  }

  private findOptimalPage(currentTime: number): Page | null {
    let farthestUse = -1;
    let pageToReplace: Page | null = null;


    for (const page of this.memory) {
      if (page) {
        const nextUse = this.findNextUse(page, currentTime);
        if (nextUse === -1) {
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

  private findNextUse(page: Page, currentTime: number): number {
    for (let i = currentTime + 1; i < this.futureReferences.length; i++) {
      if (this.futureReferences[i].pageId === page.pageId) {
        return i;
      }
    }
    return -1;
  }

  private deleteAndReturn(page: Page): Page {
    this.memory = this.memory.filter(p => p !== page);
    return page;
  }
}
