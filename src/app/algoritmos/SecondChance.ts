import { PageAlgorithm } from "../modelos/pageAlgorithm";
import { Page } from "../modelos/pagina.model";

export class SecondChance extends PageAlgorithm {
  constructor(memoryCapacity: number = 100) {
    super(memoryCapacity);
  }

  override replacePage(refPage: Page): [Page | null, number] {
    // Verificar si la página ya está en memoria
    for (const page of this.memory) {
      if (page && page.pageId === refPage.pageId) {
        page.secondChance = 1; // Dar segunda oportunidad
        return [null, 1];
      }
    }
    // Si la memoria está llena
    if (this.memory.length >= this.memoryCapacity) {
      let replacedPage: Page | null = null;

      while (replacedPage === null && this.memory.length > 0) {
        const oldestPage = this.memory[0]; // pag antigua

        if (oldestPage && oldestPage.secondChance === 0) {
          // Si no tiene segunda oportunidad, la reemplazamos
          replacedPage = this.memory.shift()!;
        } else if (oldestPage) {
          // Si tiene segunda oportunidad, la movemos al final y reseteamos su bit
          oldestPage.secondChance = 0;
          this.memory.push(this.memory.shift()!);
        }
      }

      this.memory.push(refPage);
      return [replacedPage, 5];
    }

    // en caso de que haya espacio en memoria
    this.memory.push(refPage);
    return [null, 0];
  }
}
