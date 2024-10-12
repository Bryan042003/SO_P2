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
  public operacionesLeidas: string[] = [];


  constructor(private memoryService: MMU, private router:Router) {}

  // leer el archivo
  mostrarNombreArchivo(event: any): void {
    const archivo = event.target.files[0];
    if (archivo) {
      this.nombreArchivo = archivo.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const contenidoArchivo = e.target.result;
        //console.log('Contenido del archivo:', contenidoArchivo);

        this.procesarArchivo(contenidoArchivo);
      };

      reader.readAsText(archivo);
    } else {
      this.nombreArchivo = 'Seleccionar archivo';
    }
  }

  // Función para procesar el contenido del archivo
  procesarArchivo(contenido: string): void {
    this.operacionesLeidas = [];
    const lineas = contenido.split('\n'); // Separamos el contenido por líneas

    // Iteramos sobre cada línea para procesar la información
    for (const linea of lineas) {
      const regex = /(\w+)\((\d+)(?:,(\d+))?\)/; // Expresión regular para capturar la operación y los números
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
      nombreArchivo: this.nombreArchivo
    };
    console.log('Datos capturados:', datos);
    this.memoryService.guardarDatos(datos);
    this.memoryService.guardarOperaciones(this.operacionesLeidas);
  }

  irASimulacion(): void {
    this.router.navigate(['/simulacion']);
  }


}

