import { PageAlgorithm } from "../modelos/pageAlgorithm";
import { Page } from "../modelos/pagina.model";

export class OPT extends PageAlgorithm {
  constructor(memoryCapacity: number = 100) {
    super(memoryCapacity);
  }

  override referencePage(refPage: Page): [Page | null, number] {
    // Comprobar si la página ya está en memoria
    for (const page of this.memory) {
      if (page && page.pageId === refPage.pageId) {
        page.lastAccess = 0; // Reiniciar el tiempo de uso
        return [null, 1];
      }
    }

    // Si la página no está en memoria, reemplazar la página que no se usará durante más tiempo
    let maxTime = -1;
    let maxPage: Page | null = null;

    for (const page of this.memory) {
      if (page && page.lastAccess > maxTime) {
        maxTime = page.lastAccess;
        maxPage = page;
      }
    }

    if (maxPage) {
      const physicalAddress = maxPage.physicalAddress;

      this.delete(maxPage); // Eliminar la página que será reemplazada

      // Añadir la nueva página a la memoria
      refPage.physicalAddress = physicalAddress; // Asignar la dirección física de la página que se está reemplazando
      this.memory.push(refPage); // Agregar la nueva página

      return [maxPage, 5]; // Devolver la página reemplazada y un valor indicativo
    }

    return [null, 0]; // En caso de que no haya páginas que reemplazar
  }
}
