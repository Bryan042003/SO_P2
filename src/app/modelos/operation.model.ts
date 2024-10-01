export class Operation {
    operationType: string; // 'new', 'use', 'delete', 'kill'
    ptr?: number; // Pointer for 'use', 'delete', 'kill'
    size?: number; // Size for 'new'
    pid?: number; // Process ID for 'kill'
  
    constructor(operationType: string, ptr?: number, size?: number, pid?: number) {
      this.operationType = operationType;
      this.ptr = ptr;
      this.size = size;
      this.pid = pid;
    }
  }