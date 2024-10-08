
import { Page } from "./pagina.model";


export class PageAlgorithm {
    memoryCapacity: number;
    memory: Page[];
  
    constructor(memoryCapacity: number = 100) {
      this.memoryCapacity = memoryCapacity;
      this.memory = [];
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
        console.log(`Page ${page.pageId}`);
      });
    }
  }
  