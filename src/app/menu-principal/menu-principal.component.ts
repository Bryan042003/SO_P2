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
  fileName: string = '';
  public operacionesLeidas: string[] = [];


  constructor(private memoryService: MMU, private router:Router) {}

  // leer el archivo
  readShowFileName(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const contenidoArchivo = e.target.result;
        //console.log('Contenido del archivo:', contenidoArchivo);

        this.procesarArchivo(contenidoArchivo);
      };

      reader.readAsText(file);
    } else {
      this.fileName = 'Seleccionar archivo';
    }
  }

  procesarArchivo(contenido: string): void {
    this.operacionesLeidas = [];
    const lineas = contenido.split('\n'); // Separamos por líneas

    for (const linea of lineas) {
      const regex = /(\w+)\((\d+)(?:,(\d+))?\)/; // capturar la operación y los números
      const coincidencias = linea.match(regex);

      if (coincidencias) {
        const Op = coincidencias[1]; // nombre op
        const dat1 = parseInt(coincidencias[2], 10); // Primer num
        const dat2 = coincidencias[3] ? parseInt(coincidencias[3], 10) : 0; // Segundo num

        let operacionAlt = `${Op}(${dat1}`;
        if (dat2 !== 0) {
          operacionAlt += `,${dat2}`;
        }
        operacionAlt += ')';
        this.operacionesLeidas.push(operacionAlt);
      }
    }
    console.log('Operaciones leídas:', this.operacionesLeidas);
  }

  // Esta función se ejecuta cuando el usuario hace clic en "Ejecutar"
  guardarDatos(): void {
    const datos = {
      semilla: this.semilla,
      algoritmoSeleccionado: this.algoritmoSeleccionado,
      cantidadProcesos: this.cantidadProcesos,
      cantidadOperaciones: this.cantidadOperaciones,
      fileName: this.fileName
    };
    console.log('Datos capturados:', datos);
    this.memoryService.saveData(datos);
    this.memoryService.saveOperations(this.operacionesLeidas);
  }

  gotoSimulation(): void {
    this.router.navigate(['/simulacion']);
  }


}

