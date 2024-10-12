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
  public dataMMU1Real: Page[] = [];
  public dataMMU1Virtual: Page[] = [];
  public dataMMU2Real: Page[] = [];
  public dataMMU2Virtual: Page[] = [];
  //public dataMMU2: Page[][] = [];
  public dataMMU2: Page[] = [];
  public dataRam: number[] = [];
  public dataNumProcess: number = 0;
  public textOperations: string[] = [];
  public currentProcess: number = 0;
  public processDataMM1: Process[] = [];
  public processDataMM2: Process | undefined;
  public processByID: Process | undefined;
  public usedColors: [number, number, number][] | undefined
  public allData: Array<[Process, ...Page[]]> = [];
  public memoryLength: number = 0;

  processIdCounter: number = 1;

  // Variables para guardar los datos de la simulación
  semilla: number = 0;
  algoritmoSeleccionado: string = 'FIFO';
  cantidadProcesos: number = 10;
  cantidadOperaciones: number = 500;
  nombreArchivo: string = '';

  constructor(private memoryService: MMU,) {
    // Inicializa Computer en el constructor

    // Crea el objeto de sesión usando this.operations
    const sessionData = new Session(this.operations.length, this.operations);
    this.computer = new Computer(this.mmu1, this.mmu2, sessionData);
  }

  ngOnInit(): void {
    // Este código se ejecuta después de que la vista haya sido completamente cargada
     // Crear un arreglo de 100 elementos
     this.columns = Array.from({ length: 72 }, (_, index) => index + 1);
     this.datos = this.memoryService.getData();
     //console.log('Datos obtenidos desde MMU:', this.datos);
     // Simular procesos y accesos a la memoria


     //this.MMUsimulation();
     // Ejecutar prueba de la computadora
     this.computerSimulation();
  }

  // Simulación de la MMU
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
  }

  getDataMMU() {
    // Datos MM1

    // Datos MMU2
    this.dataMMU2Real = this.mmu2.getRealMemory().filter((page): page is Page => page !== null);
    this.dataMMU2Virtual = this.mmu2.getVirtualMemory().filter((page): page is Page => page !== null);
    this.dataMMU2 = this.dataMMU2Real.concat(this.dataMMU2Virtual);
    this.getPDataMM2();


    this.getPDataMM2();
    this.frontData();
    this.memoryLength = this.dataMMU2.length -1;

    // Datos generales
    this.dataRam = this.computer.getRAMPages();
    this.dataNumProcess = this.computer.getProcessNumber();
    this.currentProcess = this.computer.getCurrentProcess();
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
        this.getDataMMU();
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
    //console.log("memoryLength", this.memoryLength);
    //console.log("Ejecutando frontData...");
    this.processDataMM2 = this.computer.getProcessDataMM2(); // Último proceso
    const lastProcess = this.processDataMM2;
    //console.log("lastProcess", lastProcess);

    // Clonar el proceso para evitar la referencia compartida
    const clonedProcess = { ...lastProcess };

    // Asegurarse de que memoryLength no exceda el tamaño de dataMMU2
    if (this.memoryLength < this.dataMMU2.length) {
        // Obtener las páginas desde memoryLength hasta el final
        const pagesFromMemoryLength = this.dataMMU2.slice(this.memoryLength);

        // Clonar las páginas para evitar la referencia compartida
        const clonedPages = pagesFromMemoryLength.map(page => ({ ...page }));

        // Combinar el proceso clonado con las páginas desde memoryLength
        const lastProcessWithPages: [Process, ...Page[]] = [clonedProcess, ...clonedPages];

        // Agregar la combinación a allData sin sobrescribir los datos anteriores
        this.allData = [...this.allData, lastProcessWithPages];

        //console.log('allData actualizado:', this.allData);
      } else {
          //console.warn('memoryLength está fuera de los límites de dataMMU2.');
      }

  }

  computerSimulation() {
    console.log("Ejecutando prueba de la computadora...");
    this.executeOperations();

    // Simulando procesos
    //console.log(`New1`);
    //this.computer.executeInstruction("new(1, 500)"); // Crear un nuevo proceso
    //this.getDataMMU();
    //console.log(`Kill`);
    //this.computer.executeInstruction("kill(1)"); // Matar el proceso 2

    /*
    console.log(`New`);
    this.computer.executeInstruction("new(2, 16)"); // Crear un nuevo proceso

    // Usar procesos
    console.log(`Use`);
    this.computer.executeInstruction("use(1)"); // Usar el proceso 1
    console.log(`Use`);
    this.computer.executeInstruction("use(2)"); // Usar el proceso 2

    // Eliminar procesos
    console.log(`Delete`);
    this.computer.executeInstruction("delete(1)"); // Eliminar el proceso 1
    console.log(`Kill`);
    this.computer.executeInstruction("kill(2)"); // Matar el proceso 2


    // Mostrar información
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

}
