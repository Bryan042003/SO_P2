import { Component, OnInit } from '@angular/core';
import { MMU } from '../services/mmuservice.service';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Computer } from '../services/computer.service';
import { Session } from '../modelos/session.model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [FormsModule, RouterOutlet],
  templateUrl: './menu-principal.component.html',
  styleUrls: ['./menu-principal.component.css']
})
export class MenuPrincipalComponent {
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




  mostrarNombreArchivo(event: any): void {
    const archivo = event.target.files[0];
    if (archivo) {
      this.nombreArchivo = archivo.name;
    } else {
      this.nombreArchivo = 'Seleccionar archivo';
    }
  }


  // Esta función se ejecuta cuando el usuario hace clic en "Ejecutar"
  guardarDatos(): void {
    const datos = {
      semilla: this.semilla,
      algoritmoSeleccionado: this.algoritmoSeleccionado,
      cantidadProcesos: this.cantidadProcesos,
      cantidadOperaciones: this.cantidadOperaciones,
      nombreArchivo: this.nombreArchivo
    };
    console.log('Datos capturados:', datos);
    this.memoryService.guardarDatos(datos);
    
    
  }

  irASimulacion(): void {
    this.router.navigate(['/simulacion']);
  }


}

