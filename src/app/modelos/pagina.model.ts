export class Page {
  pageId: number;
  physicalAddress: number;
  positionFlag: boolean; // true = real, false = virtual
  timestamp: number;
  lastAccess: number;
  secondChance: number;

  constructor(pageId: number, physicalAddress: number, positionFlag: boolean) {
    this.pageId = pageId;
    this.physicalAddress = physicalAddress;
    this.positionFlag = positionFlag;
    this.timestamp = 0;
    this.lastAccess = 0;
    this.secondChance = 1;
  }
}
