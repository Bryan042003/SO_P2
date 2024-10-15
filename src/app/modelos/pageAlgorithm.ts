
import { Page } from "./pagina.model";

export class PageAlgorithm {
  memoryCapacity: number;
  memory: (Page | null)[];  // Acepta valores null
  totalTime: number;

  constructor(memoryCapacity: number = 100) {
    this.memoryCapacity = memoryCapacity;
    this.memory = [];
    this.totalTime = 0;
  }

  referencePage(page: Page): [Page | null, number] {
    return [null, 0];
  }

  delete(page: Page): void {
    this.memory = this.memory.filter(p => p !== page);
  }

  printMemory(): void {
    console.log("Memory content:");
    this.memory.forEach(page => {
      if (page) {
        console.log(`Page ${page.pageId}`, `loaded ${page.positionFlag}`);
      }
    });
  }
}
