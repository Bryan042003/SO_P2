import { PageAlgorithm } from "../modelos/pageAlgorithm";
import { Page } from "../modelos/pagina.model";

export class OPT extends PageAlgorithm {
  constructor(memoryCapacity: number = 100) {
    super(memoryCapacity);
  }

  override referencePage(refPage: Page): [Page | null, number] {

    // Verificar si la página ya está en la memoria, se reinicia el tiempo desde el último acceso
    for (let page of this.memory) {
      if (page && page.pageId === refPage.pageId) {
        page.lastAccess = 0;
        return [null, 1];
      }
    }

    // Si la página no está en la memoria, reemplazar la página con el mayor tiempo desde el último acceso
    let maxTime = -1;
    let maxPage: Page | null = null;

    for (let page of this.memory) {
      if (page && page.lastAccess > maxTime) {
        maxTime = page.lastAccess;
        maxPage = page;
      }
    }

    let physicalAddress = maxPage ? maxPage.physicalAddress : -1; // dirección física de la página a reemplazar
    this.memory = this.memory.filter(page => page !== maxPage);   // Eliminar la página con mayor tiempo de acceso

    // Añadir la nueva página a la memoria con la dirección física de la página reemplazada
    refPage.physicalAddress = physicalAddress;
    this.memory.push(refPage); // Agregar la nueva página al arreglo memory

    return [maxPage, 5];
  }
}
