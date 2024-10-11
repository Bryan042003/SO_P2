import { AfterViewChecked, AfterViewInit, Component, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MMU } from '../services/mmuservice.service';
import { Computer } from '../services/computer.service';
import { Session } from '../modelos/session.model';
import { Page } from '../modelos/pagina.model';

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
  public datosm1_Real: Page[] = [];
  public datosm1_Virtual: Page[] = [];
  public datosm2_Real: Page[] = [];
  public datosm2_Virtual: Page[] = [];
  public datosm2: Page[] = [];

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
     this.datos = this.memoryService.obtenerDatos();
     console.log('Datos obtenidos desde MMU:', this.datos);
     // Simular procesos y accesos a la memoria


     //this.simularMMU();
     // Ejecutar prueba de la computadora
     this.probarComputer();
  }

  // Simulación de la MMU
  simularMMU() {
    // Crear procesos según la cantidad especificada
    for (let i = 0; i < this.cantidadProcesos; i++) {
      const processSize = Math.floor(Math.random() * 20) + 5; // Tamaño del proceso aleatorio
      const pid = this.processIdCounter++;
      const pointer = this.memoryService.newProcess(pid, processSize); // Crear un nuevo proceso
      console.log(`Proceso creado: PID=${pid}, Tamaño=${processSize}, Pointer=${pointer}`);
    }

    // Realizar accesos a la memoria
    for (let i = 0; i < this.cantidadOperaciones; i++) {
      const randomPointer = Math.floor(Math.random() * this.processIdCounter); // Seleccionar un proceso aleatorio
      this.memoryService.usePointer(randomPointer); // Simular el uso del puntero
    }

    // Mostrar el estado final de la memoria
    //this.memoryService.showMemoryState();
  }

  traerDatosmm2(){
    this.datosm2_Real = this.mmu2.getRealMemory().filter((page): page is Page => page !== null);
    this.datosm2_Virtual = this.mmu2.getVirtualMemory().filter((page): page is Page => page !== null);

    this.datosm2 = this.datosm2_Real.concat(this.datosm2_Virtual);
  }


  // Método para probar la computadora
  probarComputer() {
    console.log("Ejecutando prueba de la computadora...");

    // Simulando procesos
    console.log(`New1`);
    this.computer.executeInstruction("new(1, 500)"); // Crear un nuevo proceso
    this.traerDatosmm2();




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
