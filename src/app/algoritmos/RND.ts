import { Page } from "../modelos/pagina.model";
import { PageAlgorithm } from "../modelos/pageAlgorithm";

export class RND extends PageAlgorithm {
  constructor(memoryCapacity: number = 100) {
    super(memoryCapacity);
  }

  override referencePage(refPage: Page): [Page | null, number] {
    // Incrementar el tiempo de uso de todas las páginas en memoria
    for (const page of this.memory) {
      if (page) {
        page.lastAccess += 1; // Aumentar el tiempo de acceso
      }
    }

    // Verificar si la página ya está en memoria
    for (const page of this.memory) {
      if (page && page.pageId === refPage.pageId) {
        page.lastAccess = 0; // Reiniciar el tiempo de acceso
        return [null, 1]; // No se reemplaza ninguna página
      }
    }

    // Si la página no está en memoria, reemplazar una página aleatoria
    // Generar un índice aleatorio usando Math.random()
    const randomIndex = Math.floor(Math.random() * this.memory.length); // Índice aleatorio
    const pageToReplace = this.memory[randomIndex]; // Elegir una página aleatoria

    const physicalAddress = pageToReplace?.physicalAddress ?? -1; // Dirección física de la página a reemplazar

    // Eliminar la página seleccionada
    this.memory = this.memory.filter(page => page !== pageToReplace);

    // Añadir la nueva página a la memoria
    refPage.physicalAddress = physicalAddress; // Asignar dirección física de la página reemplazada
    this.memory.push(refPage); // Agregar la nueva página al arreglo memory

    return [pageToReplace, 5]; // Retornar la página reemplazada y el tiempo de operación
  }
}
