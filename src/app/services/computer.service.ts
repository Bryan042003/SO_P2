import { delay } from 'rxjs';
import { Process } from '../modelos/process.model';
import { Session } from '../modelos/session.model';
import { MMU } from '../services/mmuservice.service';

class Computer {
    instructionsPerSecond: number;
    diskAccessTime: number;
    RAMSize: number; // KB
    hardDrive: number;
    pageSize: number; // KB
    session: Session;
    mainMMU: MMU;
    otherMMU: MMU;
    mainProcesses: Process[];
    otherProcesses: Process[];
    usedColors: [number, number, number][]; // Usar un array de colores RGB
    operations: string[] = [];
    currentProcess: number = 0;
    algorithm: string = '';
    ramUsedKB: number = 0;
    ramPercentage: number = 0;
    vramUsedKB: number = 0;
    vramPercentage: number = 0;

    constructor(mainMMU: MMU, otherMMU: MMU, session: Session) {
        this.instructionsPerSecond = 1;
        this.diskAccessTime = 5;
        this.RAMSize = 400; // KB
        this.hardDrive = 999999;
        this.pageSize = 4; // KB
        this.session = session;
        this.mainMMU = mainMMU; // opT
        this.otherMMU = otherMMU;  // normal
        this.mainProcesses = [];
        this.otherProcesses = [];
        this.usedColors = [];
    }

    saveAlgorithmComputer(algorithm: string) {
      this.algorithm = algorithm;
      this.mainMMU.setAlgorithm("OPT"); // mmu Optima
      this.otherMMU.setAlgorithm(algorithm);
      //console.log("algoritmo computer", this.algorithm);
    }

    executeInstruction(operation: string) {
        const op = operation.trim();

        if (op.startsWith('new(')) {
            this.currentProcess = this.mainProcesses.length;
            const args = op.slice(4, -1).split(',').map(arg => arg.trim());
            this.runNew(Number(args[0]), Number(args[1]));
        } else if (op.startsWith('use(')) {
            this.currentProcess = this.mainProcesses.length;
            const ptr = Number(op.slice(4, -1).trim());
            this.runUse(ptr);
        } else if (op.startsWith('delete(')) {
            this.currentProcess = this.mainProcesses.length;
            const ptr = Number(op.slice(7, -1).trim());
            this.runDelete(ptr);
        } else if (op.startsWith('kill(')) {
           this.currentProcess = this.mainProcesses.length;
            const pid = Number(op.slice(5, -1).trim());
            this.runKill(pid);
        } else {
            console.log('Invalid operation');
        }
    }

    getCurrentProcess() {
      return this.currentProcess;
    }

    async executeOperations(ops: string[]) {
      this.operations = [];
      this.operations = ops;
      //console.log("operations", this.operations);
      for (let i = 0; i < this.operations.length; i++) {
        //console.log("operacion", this.operations[i]);
        this.executeInstruction(this.operations[i]);
        await delay(3000);
      }
  }

    runNew(pid: number, size: number) {
        const color = this.generateRandomColor();
        this.usedColors.push(color);

        //console.log("process Op");
        const optPointer = this.mainMMU.newProcess(pid, size, color);
        //console.log("process normal");
        const otherPointer = this.otherMMU.newProcess(pid, size, color);

        let exists = false;
        for (const process of this.mainProcesses) {
            if (process.pid === pid) {
                process.pageTable.push(optPointer);
                exists = true;
                break;
            }
        }
        for (const process of this.otherProcesses) {
            if (process.pid === pid) {
                process.pageTable.push(otherPointer);
                exists = true;
                break;
            }
        }
        if (!exists) {
            const optProcess = new Process(pid, size, color);
            const otherProcess = new Process(pid, size, color);
            optProcess.pageTable.push(optPointer);
            otherProcess.pageTable.push(otherPointer);
            this.mainProcesses.push(optProcess);
            this.otherProcesses.push(otherProcess);
        }

        //this.otherMMU.printVirtualMemory();
        this.checkData();
    }

    runUse(ptr: number) {
      console.log("entramos a use en computer")
        this.mainMMU.usePointer(ptr);
        this.otherMMU.usePointer(ptr);
    }

    runDelete(ptr: number) {
        this.mainMMU.deletePointer(ptr);
        this.otherMMU.deletePointer(ptr);
        this.removeProcessByPointer(ptr, this.mainProcesses);
        this.removeProcessByPointer(ptr, this.otherProcesses);
    }

    runKill(pid: number) {
        const mainProcessIndex = this.mainProcesses.findIndex(p => p.pid === pid);
        if (mainProcessIndex !== -1) {
            this.mainProcesses.splice(mainProcessIndex, 1);
        }

        const otherProcessIndex = this.otherProcesses.findIndex(p => p.pid === pid);
        if (otherProcessIndex !== -1) {
            const processToKill = this.otherProcesses[otherProcessIndex];
            this.otherProcesses.splice(otherProcessIndex, 1);
            this.mainMMU.killProcess(processToKill);
            this.otherMMU.killProcess(processToKill);
        }
        //console.log("vemos vm");
        //this.mainMMU.printVirtualMemory();
        //console.log("vemos vm2");
    }

    getTime() {
        return {
            mainMMU: this.mainMMU.getTime(),
            otherMMU: this.otherMMU.getTime(),
        };
    }
    
    getFragmentation() {
        return {
            mainMMU: this.mainMMU.getFragmentation(),
            otherMMU: this.otherMMU.getFragmentation(),
        };
    }
    
    getThrashingTime() {
        return {
            mainMMU: this.mainMMU.getThrashingTime(),
            otherMMU: this.otherMMU.getThrashingTime(),
        };
    }
    
    getThrashingPercentage(): { mainMMU: number, otherMMU: number } {
        return {
            mainMMU: (this.mainMMU.getThrashingTime() / this.mainMMU.getTime()) * 100,
            otherMMU: (this.otherMMU.getThrashingTime() / this.otherMMU.getTime()) * 100,
        };
    }
    
    getVRAMSize() {
        return {
            mainMMU: this.mainMMU.virtualMemory.length,
            otherMMU: this.otherMMU.virtualMemory.length,
        };
    }
    
    getRAMUsed() {
        return {
            mainMMU: this.mainMMU.realMemory.length * this.pageSize,
            otherMMU: this.otherMMU.realMemory.length * this.pageSize,
        };
    }
    
    getRAMUsagePercentage() {
        return {
            mainMMU: (this.mainMMU.realMemory.length * this.pageSize) / this.RAMSize * 100,
            otherMMU: (this.otherMMU.realMemory.length * this.pageSize) / this.RAMSize * 100,
        };
    }
    
    getVRAMUsed() {
        return {
            mainMMU: this.mainMMU.virtualMemory.length * this.pageSize,
            otherMMU: this.otherMMU.virtualMemory.length * this.pageSize,
        };
    }
    
    getVRAMUsagePercentage() {
        return {
            mainMMU: (this.mainMMU.virtualMemory.length * this.pageSize) / this.RAMSize * 100,
            otherMMU: (this.otherMMU.virtualMemory.length * this.pageSize) / this.RAMSize * 100,
        };
    }
    
    getProcessNumber() {
        return {
            mainMMU: this.mainProcesses.length,
            otherMMU: this.otherProcesses.length,
        };
    }
    
    getRAMPages() {
        const totalPages = this.RAMSize / this.pageSize;  // Total de páginas disponibles en la RAM
    
        // Páginas cargadas en mainMMU y otherMMU
        const mainPagesLoaded = this.mainMMU.realMemory.filter(page => page !== null).length;
        const otherPagesLoaded = this.otherMMU.realMemory.filter(page => page !== null).length;
    
        // Páginas no cargadas en mainMMU y otherMMU
        const mainPagesUnloaded = totalPages - mainPagesLoaded;
        const otherPagesUnloaded = totalPages - otherPagesLoaded;
    
        return {
            mainMMU: {
                loaded: mainPagesLoaded,
                unloaded: mainPagesUnloaded
            },
            otherMMU: {
                loaded: otherPagesLoaded,
                unloaded: otherPagesUnloaded
            }
        };
    }

    private generateRandomColor(): [number, number, number] {
        let color: [number, number, number];
        do {
            color = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
        } while (this.usedColors.some(usedColor => this.isSameColor(usedColor, color)));
        return color;
    }

    private isSameColor(color1: [number, number, number], color2: [number, number, number]): boolean {
        return color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2];
    }

    private removeProcessByPointer(ptr: number, processList: Process[]) {
        processList.forEach(process => {
            if (process.pid === ptr) {
                process.pageTable = [];
            }
        });
    }

    getProcessDataMM2() {
      return this.otherProcesses[this.otherProcesses.length - 1];
    }

    getColors(): [number, number, number][] | undefined {
      return this.usedColors;
    }

    getDate() {
      // nos vamos a traer todos los datos desde aqui
    }

    checkData(){
      console.log("tamooooo")
      console.log("Datos en MMU OPT:", this.mainMMU.alldataAlt);
      console.log("Datos en MMU FIFO:", this.otherMMU.alldataAlt);

    }
}

export { Computer };
