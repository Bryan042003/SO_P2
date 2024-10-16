import { PageAlgorithm } from "../modelos/pageAlgorithm";
import { Page } from "../modelos/pagina.model";

export class MRU extends PageAlgorithm {
  constructor(memoryCapacity: number = 100) {
    super(memoryCapacity);
  }

  override referencePage(refPage: Page): [Page | null, number] {
    // Incrementa el tiempo de uso de todas las páginas en memoria
    this.memory.forEach(page => {
      if (page) {
        page.lastAccess += 1; // Incrementa el tiempo de acceso
      }
    });

    // Verifica si la página ya está en memoria
    for (let page of this.memory) {
      if (page?.pageId === refPage.pageId) {
        page.lastAccess = 0; // Reinicia el tiempo de uso
        return [null, 1]; // No se reemplazó ninguna página
      }
    }

    // Si la página no está en memoria, reemplaza la página más recientemente utilizada
    let maxTime = Number.MAX_SAFE_INTEGER;
    let maxPage: Page | null = null;

    for (let page of this.memory) {
      if (page && page.lastAccess < maxTime) {
        maxTime = page.lastAccess; // Mayor tiempo indica que se usó más recientemente
        maxPage = page; // Guarda la página con el mayor tiempo
      }
    }

    // Reemplaza la página más recientemente utilizada
    if (maxPage) {
      const physicalAddress = maxPage.physicalAddress;
      this.delete(maxPage); // Elimina la página de la memoria

      // Añade la nueva página a la memoria
      refPage.physicalAddress = physicalAddress; // Asigna la dirección física de la página eliminada
      this.memory.push(refPage); // Agrega la nueva página
    }

    return [maxPage, 1]; // Devuelve la página reemplazada y un código de estado
  }
}
