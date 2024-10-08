import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MMU } from '../modelos/mmu.model';
import { FIFO } from '../algoritmos/FIFO'; 



@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './menu-principal.component.html',
  styleUrl: './menu-principal.component.css'
})
export class MenuPrincipalComponent { mmu: MMU;
  processIdCounter: number = 1;

  //variables para guardar los datos de la simulacion
  semilla: number = 0;
  algoritmoSeleccionado: string = 'FIFO';
  cantidadProcesos: number = 10;
  cantidadOperaciones: number = 500;
  nombreArchivo: string = '';

  Llamarfifo() {
    const fifo = new FIFO(3);

    // Accedemos a las páginas en orden
    fifo.accessPage(1);  // Carga la página 1
    fifo.accessPage(2);  // Carga la página 2
    fifo.accessPage(3);  // Carga la página 3
    fifo.accessPage(1);  // Página 1 ya está en memoria
    fifo.accessPage(4);  // Evicta la página 1, carga la página 4
    fifo.accessPage(5);  // Evicta la página 2, carga la página 5

    // Mostramos el número total de fallos de página
    console.log("Total page faults:", fifo.getPageFaults());

    // Mostramos el estado actual de los marcos de memoria
    console.log("Current frames:", fifo.getFrames());
   }

  mostrarNombreArchivo(event: any): void {
    const archivo = event.target.files[0];
    if (archivo) {
      this.nombreArchivo = archivo.name;
    } else {
      this.nombreArchivo = 'Seleccionar archivo';
    }
  }

  constructor() {
    this.mmu = new MMU();
  }

  addProcess(size: number) {
    const pid = this.processIdCounter++;
    const ptr = this.mmu.newMemory(pid, size);
    console.log(`Process ${pid} allocated ${size} bytes at ptr ${ptr}`);
  }

  useMemory(ptr: number) {
    try {
      this.mmu.use(ptr);
      console.log(`Using memory at ptr ${ptr}`);
    } catch (error) {
      console.error((error as Error).message);
    }
  }

  deleteMemory(ptr: number) {
    try {
      this.mmu.delete(ptr);
      console.log(`Memory at ptr ${ptr} deleted`);
    } catch (error) {
      console.error((error as Error).message);
    }
  }

  killProcess(pid: number) {
    this.mmu.kill(pid);
    console.log(`Process ${pid} killed and memory freed`);
  }

  printMemory() {
    this.mmu.printMemory();
  }


  guardarDatos() {
    console.log('Semilla:', this.semilla);
    console.log('Algoritmo Seleccionado:', this.algoritmoSeleccionado);
    console.log('Cantidad de Procesos:', this.cantidadProcesos);
    console.log('Cantidad de Operaciones:', this.cantidadOperaciones);
    console.log('Archivo Seleccionado:', this.nombreArchivo);
    this.Llamarfifo();
    
    // Aquí iría tu lógica para manejar estos datos
  }
}

