import { Component, OnInit } from '@angular/core';

import { MMUServiceService } from '../services/mmuservice.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [ FormsModule],
  templateUrl: './menu-principal.component.html',
  styleUrl: './menu-principal.component.css'
})
export class MenuPrincipalComponent implements OnInit {
  processIdCounter: number = 1;

  //variables para guardar los datos de la simulacion
  semilla: number = 0;
  algoritmoSeleccionado: string = 'FIFO';
  cantidadProcesos: number = 10;
  cantidadOperaciones: number = 500;
  nombreArchivo: string = '';



  constructor(private memoryService: MMUServiceService) { }

  ngOnInit(): void {
    // Simula la referencia de páginas
    this.memoryService.managePage(1, Date.now());
    this.memoryService.managePage(2, Date.now());
    this.memoryService.managePage(3, Date.now());
    this.memoryService.managePage(4, Date.now());
    this.memoryService.managePage(5, Date.now());
    this.memoryService.managePage(6, Date.now()); // Esto debería reemplazar la primera página
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
  
    
    // Aquí iría tu lógica para manejar estos datos
  }
}

