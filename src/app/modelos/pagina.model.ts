export class Page {
  pageId: number;
  isInPhysicalMemory: boolean;
  physicalAddress?: number;

  constructor(pageId: number, isInPhysicalMemory: boolean, physicalAddress?: number) {
    this.pageId = pageId;
    this.isInPhysicalMemory = isInPhysicalMemory;
    this.physicalAddress = physicalAddress;
  }
}