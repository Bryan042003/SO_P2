import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MMU } from '../services/mmuservice.service';

@Component({
  selector: 'app-simulacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulacion.component.html',
  styleUrl: './simulacion.component.css'
})
export class SimulacionComponent implements OnInit {

  columns: number[] = [];
  private datos: any = {};

  processIdCounter: number = 1;

  // Variables para guardar los datos de la simulación
  semilla: number = 0;
  algoritmoSeleccionado: string = 'FIFO';
  cantidadProcesos: number = 10;
  cantidadOperaciones: number = 500;
  nombreArchivo: string = '';


  constructor(private memoryService: MMU) { 

  }


  ngOnInit(): void {
    // Crear un arreglo de 100 elementos
    this.columns = Array.from({ length: 72 }, (_, index) => index + 1);
    this.datos = this.memoryService.obtenerDatos();
    console.log('Datos obtenidos desde MMU:', this.datos);
    
    //this.simularMMU();
  }

  


   
}
