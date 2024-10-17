import { AfterViewChecked, AfterViewInit, Component, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MMU } from '../services/mmuservice.service';
import { Computer } from '../services/computer.service';
import { Session } from '../modelos/session.model';
import { Page } from '../modelos/pagina.model';
import { Process } from '../modelos/process.model';

@Component({
  selector: 'app-simulacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulacion.component.html',
  styleUrl: './simulacion.component.css'
})
export class SimulacionComponent {
  columns: number[] = [];
  private datos: any = {};
  operations: string[] = []; // Array para almacenar las operaciones (instrucciones)
  private computer: Computer;
  private mmu1 = new MMU();
  private mmu2 = new MMU();
  public dataRam: number[] = [];
  public dataNumProcess: number[] = [];
  public textOperations: string[] = [];
  public currentProcess: number = 0;
  public processDataMM1: Process[] = [];
  public processDataMM2: Process | undefined;
  public processByID: Process | undefined;
  public usedColors: [number, number, number][] | undefined;

  public simTime: number[] = [];
  public ramUsedKB: number[] = [];
  public ramPercentage: number[] = [];
  public vramUsedKB: number[] = [];
  public vramPercentage: number[] = [];
  public pagesLoaded: number[] = [];
  public pagesUnloaded: number[] = [];
  public trashingTime: number[] = [];
  public trashingPercentage: number[] = [];
  public fragmentation: number[] = [];
  public fragmentationOpt: number[] = [];

  public alldataMMUOPT: (number | [number, number, number] | Page)[][] = [];
  public alldataMMUNormal: (number | [number, number, number] | Page)[][] = [];

  public dataRAMColorMMUOPT: ([number, number, number] | Page)[][] = [];
  public dataRAMColorMMUNormal: ([number, number, number] | Page)[][] = [];

  processIdCounter: number = 1;

  // Variables para guardar los datos de la simulación
  semilla: number = 0;
  algoritmoSeleccionado: string = 'FIFO';
  cantidadProcesos: number = 10;
  cantidadOperaciones: number = 500;
  nombreArchivo: string = '';

  // Variable para controlar la pausa
  public isPaused: boolean = false;

  constructor(private memoryService: MMU) {
    // Crea el objeto de sesión usando this.operations
    const sessionData = new Session(this.operations.length, this.operations);
    this.computer = new Computer(this.mmu1, this.mmu2, sessionData);
  }

  ngOnInit(): void {
    // Crear un arreglo de 100 elementos
    this.columns = Array.from({ length: 100 }, (_, index) => index + 1);
    this.datos = this.memoryService.getData();
    this.computer.saveAlgorithmComputer(this.datos.algoritmoSeleccionado);
    this.computerSimulation();
  }

  updateData() {
    this.getPDataMM2();
    this.frontData();
    this.updateRamColorMMUNormal();
    this.updateRamColorMMUOPT();

    const ramPages = this.computer.getRAMPages();
    this.dataRam = [ramPages.mainMMU.loaded, ramPages.otherMMU.loaded, ramPages.mainMMU.unloaded, ramPages.otherMMU.unloaded];

    const processNum = this.computer.getProcessNumber();
    this.dataNumProcess = [processNum.mainMMU, processNum.otherMMU];

    this.currentProcess = this.computer.getCurrentProcess();

    const time = this.computer.getTime();
    this.simTime = [time.mainMMU, time.otherMMU];

    const ramUsed = this.computer.getRAMUsed();
    this.ramUsedKB = [ramUsed.mainMMU, ramUsed.otherMMU];

    const ramPercentage = this.computer.getRAMUsagePercentage();
    this.ramPercentage = [ramPercentage.mainMMU, ramPercentage.otherMMU];

    const vramUsed = this.computer.getVRAMUsed();
    this.vramUsedKB = [vramUsed.mainMMU, vramUsed.otherMMU];

    const vramPercentage = this.computer.getVRAMUsagePercentage();
    this.vramPercentage = [vramPercentage.mainMMU, vramPercentage.otherMMU];

    const trashingTime = this.computer.getThrashingTime();
    this.trashingTime = [trashingTime.mainMMU, trashingTime.otherMMU];

    const trashingPercentage = this.computer.getThrashingPercentage();
    this.trashingPercentage = [trashingPercentage.mainMMU, trashingPercentage.otherMMU];

    const fragmentation = this.computer.getFragmentation();
    this.fragmentation = [fragmentation.mainMMU, fragmentation.otherMMU];
  }

  executeOperations() {
    this.textOperations = this.memoryService.getOperations();
    let i = 0;

    const ejecutarInstruccion = () => {
      if (i < this.textOperations.length) {
        if (!this.isPaused) { // Solo ejecuta si no está en pausa
          this.computer.getCurrentProcess();
          this.computer.executeInstruction(this.textOperations[i]);
          i++;
          this.updateData();
        }
        setTimeout(ejecutarInstruccion, 2000); // Repite cada 2 segundos
      }
    };

    ejecutarInstruccion();
  }

  // Alternar entre pausar y reanudar la simulación
  togglePause() {
    this.isPaused = !this.isPaused;
  }

  isPage(obj: any): obj is Page {
    return obj && (obj as Page).pageId !== undefined;
  }

  getPDataMM2() {
    this.usedColors = this.computer.getColors() || [];
  }

  getColorStyle(color: [number, number, number]): string {
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  }

  frontData(): void {
    this.alldataMMUNormal = [];
    this.getALLDataMMUNormal();

    this.alldataMMUOPT = [];
    this.getALLDataMMUOpt();
  }

  computerSimulation() {
    this.executeOperations();
  }

  getALLDataMMUNormal() {
    this.alldataMMUNormal = this.mmu2.getAllDataAlt();
  }

  getALLDataMMUOpt() {
    this.alldataMMUOPT = this.mmu1.getAllDataAlt();
  }

  updateRamColorMMUNormal() {
    const pagesWithColors: { color: [number, number, number], page: Page }[] = [];
    this.dataRAMColorMMUNormal = [];

    for (let i = 0; i < this.alldataMMUNormal.length; i++) {
      const entry = this.alldataMMUNormal[i];
      const color = entry[1];

      if (Array.isArray(color) && this.isColorArray(color)) {
        for (let j = 0; j < entry.length; j++) {
          const item = entry[j];
          if (item instanceof Page && item.positionFlag === true) {
            pagesWithColors.push({ color: color, page: item });
          }
        }
      }
    }

    pagesWithColors.sort((a, b) => a.page.physicalAddress - b.page.physicalAddress);

    for (let i = 0; i < pagesWithColors.length; i++) {
      const pageColorArray: ([number, number, number] | Page)[] = [pagesWithColors[i].color, pagesWithColors[i].page];
      this.dataRAMColorMMUNormal.push(pageColorArray);
    }
  }

  updateRamColorMMUOPT() {
    const pagesWithColors: { color: [number, number, number], page: Page }[] = [];
    this.dataRAMColorMMUOPT = [];

    for (let i = 0; i < this.alldataMMUOPT.length; i++) {
      const entry = this.alldataMMUOPT[i];
      const color = entry[1];

      if (Array.isArray(color) && this.isColorArray(color)) {
        for (let j = 0; j < entry.length; j++) {
          const item = entry[j];
          if (item instanceof Page && item.positionFlag === true) {
            pagesWithColors.push({ color: color, page: item });
          }
        }
      }
    }

    pagesWithColors.sort((a, b) => a.page.physicalAddress - b.page.physicalAddress);

    for (let i = 0; i < pagesWithColors.length; i++) {
      const pageColorArray: ([number, number, number] | Page)[] = [pagesWithColors[i].color, pagesWithColors[i].page];
      this.dataRAMColorMMUOPT.push(pageColorArray);
    }
  }

  isColorArray(value: any): value is [number, number, number] {
    return Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number');
  }
}
