
import { Page } from "./pagina.model";

export class PageAlgorithm {
  sizeMemory: number;
  memory: (Page | null)[];
  totalTime: number;

  constructor(sizeMemory: number = 100) {
    this.sizeMemory = 100;
    this.memory = [];
    this.totalTime = 0;
  }

  replacePage(page: Page): [Page | null, number] {
    return [null, 0];
  }

  delete(page: Page): void {
    this.memory = this.memory.filter(p => p !== page);
  }

  printMemory(): void {
    this.memory.forEach(page => {
      if (page) {
        //console.log(`Page ${page.pageId}`, `loaded ${page.positionFlag}`);
      }
    });
  }
}
