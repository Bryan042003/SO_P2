import { PageAlgorithm } from "../modelos/pageAlgorithm";
import { Page } from "../modelos/pagina.model";

export class FIFO extends PageAlgorithm {
  constructor(memoryCapacity: number = 100) {
    super(memoryCapacity);
  }

  override referencePage(refPage: Page): [Page | null, number] {
    // Incrementa el tiempo de uso de todas las páginas en la memoria
    this.memory.forEach(page => page.lastAccess += 1);

    // Verifica si la página ya está en la memoria
    for (let page of this.memory) {
      if (page.pageId === refPage.pageId) {
        page.lastAccess = 0; // Reinicia el tiempo de uso
        return [null, 0]; // No se reemplazó ninguna página
      }
    }

    // Si la página no está en la memoria, reemplaza la página con más tiempo en memoria
    let maxTime = Number.MAX_SAFE_INTEGER;
    let maxPage: Page | null = null;

    this.memory.forEach(page => {
      if (page.timestamp < maxTime) {
        maxTime = page.timestamp;
        maxPage = page;
      }
    });

    // Almacena la dirección física de la página que será reemplazada
    let physicalAddress = (maxPage as unknown as Page)?.physicalAddress;

    // Elimina la página que será reemplazada
    if (maxPage) {
        console.log(`Reemplazando página`);
      this.memory = this.memory.filter(p => p !== maxPage);
    }

    // Agrega la nueva página a la memoria
    refPage.physicalAddress = physicalAddress;
    this.memory.push(refPage);

    // Retorna la página reemplazada y el código de resultado
    return [maxPage, 1]; // Se reemplazó una página
  }
}
