import { Component, OnInit } from '@angular/core';
import { MMU } from '../services/mmuservice.service';
import { FormsModule } from '@angular/forms';
import { Computer } from '../services/computer.service';
import { Session } from '../modelos/session.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './menu-principal.component.html',
  styleUrls: ['./menu-principal.component.css']
})
export class MenuPrincipalComponent implements OnInit {
  processIdCounter: number = 1;

  // Variables para guardar los datos de la simulación
  semilla: number = 0;
  algoritmoSeleccionado: string = 'FIFO';
  cantidadProcesos: number = 10;
  cantidadOperaciones: number = 500;
  nombreArchivo: string = '';

  operations: string[] = []; // Array para almacenar las operaciones (instrucciones)
  private computer: Computer;

  constructor(private memoryService: MMU, private router:Router) {
    // Inicializa Computer en el constructor
    const mmu1 = new MMU();
    const mmu2 = new MMU();
    
    // Crea el objeto de sesión usando this.operations
    const sessionData = new Session(this.operations.length, this.operations);
    this.computer = new Computer(mmu1, mmu2, sessionData);
  }


  ngOnInit(): void {
  }

  mostrarNombreArchivo(event: any): void {
    const archivo = event.target.files[0];
    if (archivo) {
      this.nombreArchivo = archivo.name;
    } else {
      this.nombreArchivo = 'Seleccionar archivo';
    }
  }

  guardarDatos() {
    console.log('Semilla:', this.semilla);
    console.log('Algoritmo Seleccionado:', this.algoritmoSeleccionado);
    console.log('Cantidad de Procesos:', this.cantidadProcesos);
    console.log('Cantidad de Operaciones:', this.cantidadOperaciones);
    console.log('Archivo Seleccionado:', this.nombreArchivo);

    // Simular procesos y accesos a la memoria
    this.simularMMU();

    this.router.navigate(['/simulacion'])
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

   // Método para probar la computadora
 probarComputer() {
  console.log("Ejecutando prueba de la computadora...");

  // Simulando procesos
  console.log(`New`);
  this.computer.executeInstruction("new(1, 8)"); // Crear un nuevo proceso
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
}
}