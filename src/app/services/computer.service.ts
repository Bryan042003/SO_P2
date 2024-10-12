

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
    public operacionesLeidas: string[] = [];

    constructor(mainMMU: MMU, otherMMU: MMU, session: Session) {
        this.instructionsPerSecond = 1;
        this.diskAccessTime = 5;
        this.RAMSize = 400; // KB
        this.hardDrive = 999999;
        this.pageSize = 4; // KB
        this.session = session;
        this.mainMMU = mainMMU;
        this.otherMMU = otherMMU;
        this.mainProcesses = [];
        this.otherProcesses = [];
        this.usedColors = [];
    }

    executeInstruction(operation: string) {
        const op = operation.trim();

        if (op.startsWith('new(')) {
            const args = op.slice(4, -1).split(',').map(arg => arg.trim());
            this.runNew(Number(args[0]), Number(args[1]));
        } else if (op.startsWith('use(')) {
            const ptr = Number(op.slice(4, -1).trim());
            this.runUse(ptr);
        } else if (op.startsWith('delete(')) {
            const ptr = Number(op.slice(7, -1).trim());
            this.runDelete(ptr);
        } else if (op.startsWith('kill(')) {
            const pid = Number(op.slice(5, -1).trim());
            this.runKill(pid);
        } else {
            console.log('Invalid operation');
        }

    }

    async executeOperations(operaciones: string[]) {
      this.operations = [];
      this.operations = operaciones;
      console.log("operations", this.operations);
      for (let i = 0; i < this.operations.length; i++) {
        //console.log("operacion", this.operations[i]);
        this.executeInstruction(this.operations[i]);
        await delay(3000);
      }
  }

    runNew(pid: number, size: number) {
        const color = this.generateRandomColor();
        this.usedColors.push(color);

        console.log("process Op");
        const optPointer = this.mainMMU.newProcess(pid, size);
        console.log("process normal");
        const otherPointer = this.otherMMU.newProcess(pid, size);

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

        this.otherMMU.printVirtualMemory();
    }

    runUse(ptr: number) {
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
    }

    getTime() {
        return this.mainMMU.getTime();
    }

    getThrashingTime() {
        return this.mainMMU.getThrashingTime();
    }

    getVRAMSize() {
        return [
            this.mainMMU.virtualMemory.length,
            this.otherMMU.virtualMemory.length
        ];
    }

    getProcessNumber() {
      return this.mainProcesses.length;
    }

    getRAMPages() {
        const optPagesCount = this.mainMMU.realMemory.filter(page => page !== null).length;
        const otherPagesCount = this.otherMMU.realMemory.filter(page => page !== null).length;
        return [optPagesCount, otherPagesCount];
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

    getDate() {
      // nos vamos a traer todos los datos desde aqui
    }
}

export { Computer };
