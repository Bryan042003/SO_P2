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
  public dataNumProcess: number = 0;
  public textOperations: string[] = [];
  public currentProcess: number = 0;
  public processDataMM1: Process[] = [];
  public processDataMM2: Process | undefined;
  public processByID: Process | undefined;
  public usedColors: [number, number, number][] | undefined

  public simTime: number = 0;
   public ramUsedKB: number = 0;
   public ramPercentage: number = 0;
   public vramUsedKB: number = 0;
   public vramPercentage: number = 0;
   public pagesLoaded: number[] = [];
   public pagesUnloaded: number = 0;
   public trashingTime: number = 0;
   public trashingPercentage: number = 0;
   public fragmentation: number = 0;


  public alldataMMUOPT: (number | [number, number, number] | Page)[][] = [];
  public alldataMMUNormal: (number | [number, number, number] | Page)[][] = [];

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
     this.columns = Array.from({ length: 72 }, (_, index) => index + 1);
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

  // Simulación de la MMU
  /*
  MMUsimulation() {
    // Crear procesos según la cantidad especificada
    for (let i = 0; i < this.cantidadProcesos; i++) {
      const processSize = Math.floor(Math.random() * 20) + 5; // Tamaño del proceso aleatorio
      const pid = this.processIdCounter++;
      const pointer = this.memoryService.newProcess(pid, processSize); // Crear un nuevo proceso
      //console.log(`Proceso creado: PID=${pid}, Tamaño=${processSize}, Pointer=${pointer}`);
    }

    // Realizar accesos a la memoria
    for (let i = 0; i < this.cantidadOperaciones; i++) {
      const randomPointer = Math.floor(Math.random() * this.processIdCounter); // Seleccionar un proceso aleatorio
      this.memoryService.usePointer(randomPointer); // Simular el uso del puntero
    }

    // Mostrar el estado final de la memoria
    //this.memoryService.showMemoryState();
  }*/

  updateData() {
    this.getPDataMM2();
    this.frontData();

    // Datos generales
    this.dataRam = this.computer.getRAMPages();
    this.dataNumProcess = this.computer.getProcessNumber();
    this.currentProcess = this.computer.getCurrentProcess();

    this.simTime = this.computer.getTime(); // Obtener el tiempo de simulación
    this.ramUsedKB = this.computer.getRAMUsed(); // RAM utilizada en KB
    this.ramPercentage = this.computer.getRAMUsagePercentage(); // RAM utilizada en porcentaje
    this.vramUsedKB = this.computer.getVRAMUsed(); // V-RAM utilizada en KB
    this.vramPercentage = this.computer.getVRAMUsagePercentage(); // V-RAM utilizada en porcentaje
    this.pagesLoaded = this.computer.getRAMPages(); // Páginas cargadas
    //this.pagesUnloaded = this.computer.getPagesUnloaded(); // Páginas descargadas
    this.trashingTime = this.computer.getThrashingTime(); // Tiempo de thrashing
    this.trashingPercentage = this.computer.getThrashingPercentage();
    this.fragmentation = this.computer.getFragmentation(); // Fragmentación

  }

  executeOperations() {
    this.textOperations = [];
    this.textOperations = this.memoryService.getOperations();

    let i = 0;

    const ejecutarInstruccion = () => {
      if (i < this.textOperations.length) {
        this.computer.getCurrentProcess();
        this.computer.executeInstruction(this.textOperations[i]);
        console.log(`Ejecutando operación: ${this.textOperations[i]}`);
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

    // mmu OPt
    this.alldataMMUOPT = [];

  }

  computerSimulation() {
    console.log("Ejecutando prueba de la computadora...");
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

  isColorArray(value: any): value is [number, number, number] {
    return Array.isArray(value) && value.length === 3 && value.every(v => typeof v === 'number');
  }


}
