import { PageAlgorithm } from "../modelos/pageAlgorithm";
import { Page } from "../modelos/pagina.model";

export class SecondChance extends PageAlgorithm {
  constructor(memoryCapacity: number = 100) {
    super(memoryCapacity);
  }

  override referencePage(refPage: Page): [Page | null, number] {
    // Verificar si la página está en la memoria
    for (let page of this.memory) {
      if (page && page.pageId === refPage.pageId) {
        page.secondChance = 1;//Second Chance
        return [null, 1]; // No se reemplazó ninguna página
      }
    }

    let replacedPage: Page | null = null;

    // Si la memoria está llena, aplica Second Chance
    if (this.memory.length >= this.memoryCapacity) {
      while (true) {
        const page = this.memory[0]; // Verificamos la primera página en la memoria

        if (page && page.secondChance === 0) {
          // Si no tiene segunda oportunidad, se reemplaza
          replacedPage = this.memory.shift() || null; // Elimina la primera página
          break;
        } else if (page) {
          // Si tiene segunda oportunidad, le quitamos la oportunidad
          page.secondChance = 0;
          // Mueve la página al final de la memoria
          this.memory.push(this.memory.shift()!);
        }
      }
    }

    // Agrega la nueva página a la memoria
    refPage.secondChance = 0; // Nueva página comienza sin segunda oportunidad
    this.memory.push(refPage);

    return [replacedPage, 5]; // Retorna la página reemplazada y el costo
  }
}
