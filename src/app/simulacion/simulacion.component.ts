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
export class SimulacionComponent  {
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
  public usedColors: [number, number, number][] | undefined

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

  //public alldataAlt: ([number, number, number] | Page)[][] = [];

  processIdCounter: number = 1;

  // Variables para guardar los datos de la simulación
  semilla: number = 0;
  algoritmoSeleccionado: string = 'FIFO';
  cantidadProcesos: number = 10;
  cantidadOperaciones: number = 500;
  nombreArchivo: string = '';

  constructor(private memoryService: MMU) {
    // Crea el objeto de sesión usando this.operations
    const sessionData = new Session(this.operations.length, this.operations);
    this.computer = new Computer(this.mmu1, this.mmu2, sessionData);

  }

  ngOnInit(): void {
     // Crear un arreglo de 100 elementos
     this.columns = Array.from({ length: 100 }, (_, index) => index + 1);
     this.datos = this.memoryService.getData();
     //console.log("en simulation", this.datos);
     //console.log('Datos obtenidos desde MMU:', this.datos);
     // Simular procesos y accesos a la memoria
     //this.MMUsimulation();
     // Ejecutar prueba de la computadora
     this.computer.saveAlgorithmComputer(this.datos.algoritmoSeleccionado);
     this.computerSimulation();
     //console.log("algoritmo", this.datos.algoritmoSeleccionado);
     //this.computer.mainMMU.chooseAlgorithm(this.datos.algorithm);
  }

  updateData() {
    this.getPDataMM2();
    this.frontData();
    this.updateRamColorMMUNormal();
    this.updateRamColorMMUOPT();

    // Datos de RAM
    const ramPages = this.computer.getRAMPages();
    this.dataRam = [ramPages.mainMMU.loaded, ramPages.otherMMU.loaded, ramPages.mainMMU.unloaded, ramPages.otherMMU.unloaded];

    // Número de procesos
    const processNum = this.computer.getProcessNumber();
    this.dataNumProcess = [processNum.mainMMU, processNum.otherMMU];

    // Proceso actual
    this.currentProcess = this.computer.getCurrentProcess();

    // Tiempo de simulación
    const time = this.computer.getTime();
    this.simTime = [time.mainMMU, time.otherMMU];

    // RAM usada
    const ramUsed = this.computer.getRAMUsed();
    this.ramUsedKB = [ramUsed.mainMMU, ramUsed.otherMMU];

    // Porcentaje de RAM usada
    const ramPercentage = this.computer.getRAMUsagePercentage();
    this.ramPercentage = [ramPercentage.mainMMU, ramPercentage.otherMMU];

    // VRAM usada
    const vramUsed = this.computer.getVRAMUsed();
    this.vramUsedKB = [vramUsed.mainMMU, vramUsed.otherMMU];

    // Porcentaje de VRAM usada
    const vramPercentage = this.computer.getVRAMUsagePercentage();
    this.vramPercentage = [vramPercentage.mainMMU, vramPercentage.otherMMU];

    // Tiempo de thrashing
    const trashingTime = this.computer.getThrashingTime();
    this.trashingTime = [trashingTime.mainMMU, trashingTime.otherMMU];

    // Porcentaje de thrashing
    const trashingPercentage = this.computer.getThrashingPercentage();
    this.trashingPercentage = [trashingPercentage.mainMMU, trashingPercentage.otherMMU];

    // Fragmentación
    const fragmentation = this.computer.getFragmentation();
    this.fragmentation = [fragmentation.mainMMU, fragmentation.otherMMU];
  }

  executeOperations() {
    this.textOperations = [];
    this.textOperations = this.memoryService.getOperations();

    let i = 0;

    const ejecutarInstruccion = () => {
      if (i < this.textOperations.length) {
        this.computer.getCurrentProcess();
        this.computer.executeInstruction(this.textOperations[i]);
        //console.log(`Ejecutando operación: ${this.textOperations[i]}`);
        i++;
        this.updateData();
        this.computer.getCurrentProcess();
        setTimeout(ejecutarInstruccion, 2000); // 2s
      }
    };

    ejecutarInstruccion();
  }

  isPage(obj: any): obj is Page {
    return obj && (obj as Page).pageId !== undefined;
  }

  getPDataMM2() {
    this.usedColors = this.computer.getColors() || [];
    //console.log("processNEEEEEEE", this.processDataMM2);
    //console.log('Datos de procesos MM2:', this.processDataMM2);
  }

  getColorStyle(color: [number, number, number]): string {
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  }

  frontData(): void {

    // mmu Normal
    this.alldataMMUNormal = [];
    this.getALLDataMMUNormal();
    //console.log("alldataMMUNormal", this.alldataMMUNormal);
    //console.log("alldataMMUNormal", this.alldataMMUNormal);

    // mmu OPt
    this.alldataMMUOPT = [];
    this.getALLDataMMUOpt();
    //console.log("alldataMMUOPT", this.alldataMMUOPT);

  }

  computerSimulation() {
    //console.log("Ejecutando prueba de la computadora...");
    this.executeOperations();

    // Mostrar información
    /*
    const time = this.computer.getTime();
    console.log(`Tiempo total: ${time}`);

    const thrashingTime = this.computer.getThrashingTime();
    console.log(`Tiempo de thrashing: ${thrashingTime}`);

    const vramSize = this.computer.getVRAMSize();
    console.log(`Tamaño de VRAM: ${vramSize}`);

    const ramPages = this.computer.getRAMPages();
    console.log(`Páginas en RAM: ${ramPages}`);
    */

  }

  getALLDataMMUNormal() {
    this.alldataMMUNormal = this.mmu2.getAllDataAlt();
  }

  getALLDataMMUOpt() {
    this.alldataMMUOPT = this.mmu1.getAllDataAlt();
  }

  isColorArray(value: any): value is [number, number, number] {
    return Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number');
  }

  updateRamColorMMUNormal() {
    //console.log("Memoria real simulada", this.mmu2.getRealMemory());
    //console.log("Memoria completa mmu normal", this.alldataMMUNormal);

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

    pagesWithColors.sort((a, b) => a.page.physicalAddress - b.page.physicalAddress); // ordenamos por dirección física

    for (let i = 0; i < pagesWithColors.length; i++) {
      const pageColorArray: ([number, number, number] | Page)[] = [pagesWithColors[i].color, pagesWithColors[i].page];
      this.dataRAMColorMMUNormal.push(pageColorArray);
    }

    //console.log("Colores y páginas ordenadas por physicalAddress", this.dataRAMColorMMUNormal);
  }

  updateRamColorMMUOPT() {
    //console.log("Memoria real simulada", this.mmu1.getRealMemory());
    //console.log("Memoria completa mmu normal", this.alldataMMUOPT);

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

    pagesWithColors.sort((a, b) => a.page.physicalAddress - b.page.physicalAddress); // ordenamos por dirección física

    for (let i = 0; i < pagesWithColors.length; i++) {
      const pageColorArray: ([number, number, number] | Page)[] = [pagesWithColors[i].color, pagesWithColors[i].page];
      this.dataRAMColorMMUOPT.push(pageColorArray);
    }

    //console.log("Colores y páginas ordenadas por physicalAddress", this.dataRAMColorMMUOPT);
  }

}
