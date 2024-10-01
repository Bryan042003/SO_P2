import { Page } from "./pagina.model";

export class MMU {
  pageSizeKB = 4;
  maxPages: number;
  physicalMemory: (Page | null)[] = [];
  virtualMemory: Map<number, Page> = new Map();
  memoryMap: Map<number, { pid: number; pages: Page[] }> = new Map();
  pageCounter = 0;

  constructor(ramSizeKB = 400) {
    this.maxPages = ramSizeKB / this.pageSizeKB;
    this.physicalMemory = new Array(this.maxPages).fill(null);
  }

  private allocatePages(numPages: number): Page[] {
    const pages: Page[] = [];
    for (let i = 0; i < numPages; i++) {
      const pageId = this.pageCounter++;
      if (this.physicalMemory.includes(null)) {
        // Encuentra una página libre en RAM
        const physicalAddress = this.physicalMemory.indexOf(null);
        const page = new Page(pageId, true, physicalAddress);
        this.physicalMemory[physicalAddress] = page;
        pages.push(page);
      } else {
        // Si la RAM está llena, asigna en memoria virtual
        const page = new Page(pageId, false);
        this.virtualMemory.set(pageId, page);
        pages.push(page);
      }
    }
    return pages;
  }

  newMemory(pid: number, size: number): number {
    const numPages = Math.ceil(size / this.pageSizeKB);
    const pages = this.allocatePages(numPages);
    const ptr = this.memoryMap.size + 1;
    this.memoryMap.set(ptr, { pid, pages });
    return ptr;
  }

  use(ptr: number): void {
    const entry = this.memoryMap.get(ptr);
    if (!entry) {
      throw new Error("Pointer not found in memory map");
    }
    for (const page of entry.pages) {
      if (!page.isInPhysicalMemory) {
        this.loadPageToPhysicalMemory(page);
      }
    }
  }

  private loadPageToPhysicalMemory(page: Page): void {
    if (this.physicalMemory.includes(null)) {
      const physicalAddress = this.physicalMemory.indexOf(null);
      this.physicalMemory[physicalAddress] = page;
      page.isInPhysicalMemory = true;
      page.physicalAddress = physicalAddress;
    } else {
      const pageToRemove = this.physicalMemory[0];
      if (pageToRemove) {
        this.virtualMemory.set(pageToRemove.pageId, pageToRemove);
      }
      this.physicalMemory[0] = page;
      page.isInPhysicalMemory = true;
      page.physicalAddress = 0;
    }
  }

  delete(ptr: number): void {
    const entry = this.memoryMap.get(ptr);
    if (!entry) {
      throw new Error("Pointer not found in memory map");
    }
    for (const page of entry.pages) {
      if (page.isInPhysicalMemory && page.physicalAddress !== undefined) {
        this.physicalMemory[page.physicalAddress] = null;
      } else {
        this.virtualMemory.delete(page.pageId);
      }
    }
    this.memoryMap.delete(ptr);
  }

  kill(pid: number): void {
    for (const [ptr, entry] of this.memoryMap.entries()) {
      if (entry.pid === pid) {
        this.delete(ptr);
      }
    }
  }

  printMemory(): void {
    console.log("Physical Memory:");
    this.physicalMemory.forEach(page => {
      if (page) {
        console.log(`Page ID: ${page.pageId}, Physical Address: ${page.physicalAddress}`);
      }
    });

    console.log("Virtual Memory:");
    this.virtualMemory.forEach((page, pageId) => {
      console.log(`Page ID: ${pageId} (Virtual)`);
    });
  }
}
