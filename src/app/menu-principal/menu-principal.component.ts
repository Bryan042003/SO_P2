import { Component, OnInit } from '@angular/core';
import { MMU } from '../services/mmuservice.service';
import { FormsModule } from '@angular/forms';

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

  constructor(private memoryService: MMU) { }

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
    //this.memoryService.showMemoryState(); // Asegúrate de que este método esté definido en tu servicio
  }
}
