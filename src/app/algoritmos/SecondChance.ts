import { PageAlgorithm } from "../modelos/pageAlgorithm";
import { Page } from "../modelos/pagina.model";

export class SecondChance extends PageAlgorithm {
  constructor(memoryCapacity: number = 100) {
    super(memoryCapacity);
  }

  override referencePage(refPage: Page): [Page | null, number] {
    // Verificar si la página ya está en memoria
    for (const page of this.memory) {
      if (page && page.pageId === refPage.pageId) {
        page.secondChance = 1; // Si la página ya está en memoria, se le da una segunda oportunidad
        return [null, 1]; // No se necesita reemplazo
      }
    }
    // Si la memoria está llena, aplicar Second Chance
    if (this.memory.length >= this.memoryCapacity) {
      let replacedPage: Page | null = null;

      // Ciclo para encontrar una página con secondChance = 0
      while (replacedPage === null && this.memory.length > 0) { // Añadir verificación de que la memoria no esté vacía
        const oldestPage = this.memory[0]; // Ver la página más antigua

        if (oldestPage && oldestPage.secondChance === 0) {
          // Si no tiene segunda oportunidad, la reemplazamos
          replacedPage = this.memory.shift()!;
        } else if (oldestPage) {
          // Si tiene segunda oportunidad, la movemos al final y reseteamos su bit
          oldestPage.secondChance = 0;
          this.memory.push(this.memory.shift()!); // Movemos la página al final de la lista
        }
      }

      // Añadir la nueva página al final de la lista
      this.memory.push(refPage);
      return [replacedPage, 5]; // Devolver la página reemplazada
    }

    // Si aún hay espacio en memoria, simplemente agregar la nueva página
    this.memory.push(refPage);
    return [null, 0];
  }
}
