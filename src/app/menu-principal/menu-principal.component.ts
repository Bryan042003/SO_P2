import { Component, OnInit } from '@angular/core';
import { MMU } from '../services/mmuservice.service';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
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

  semilla: number = 0;
  algoritmoSeleccionado: string = 'FIFO';
  cantidadProcesos: number = 10;
  cantidadOperaciones: number = 500;
  fileName: string = '';
  public operacionesLeidas: string[] = [];

  constructor(private memoryService: MMU, private router: Router) { }

  readShowFileName(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const contenidoArchivo = e.target.result;


        this.procesarArchivo(contenidoArchivo);
      };

      reader.readAsText(file);
    } else {
      this.fileName = 'Seleccionar archivo';
    }
  }

  procesarArchivo(contenido: string): void {
    this.operacionesLeidas = [];
    const lineas = contenido.split('\n');

    for (const linea of lineas) {
      const regex = /(\w+)\((\d+)(?:,(\d+))?\)/;
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

  }

  guardarDatos(): void {
    const datos = {
      semilla: this.semilla,
      algoritmoSeleccionado: this.algoritmoSeleccionado,
      cantidadProcesos: this.cantidadProcesos,
      cantidadOperaciones: this.cantidadOperaciones,
      fileName: this.fileName
    };

    this.memoryService.saveData(datos);
    this.memoryService.saveOperations(this.operacionesLeidas);
  }

  gotoSimulation(): void {
    this.router.navigate(['/simulacion']);
  }


  generateOperations(seed: number): string[] {

    const operations: string[] = [];

    const random = (min: number, max: number) => {
      seed = (seed * 48271) % 2147483647;
      return Math.floor(Math.abs(seed) % (max - min + 1)) + min;
    };

    const numProcesses = this.cantidadProcesos;
    const maxOperations = this.cantidadOperaciones;

    const randomProb = () => random(0, 100) / 100;

    const processes = new Map<number, { pointers: number[], deleted: boolean, killed: boolean }>();

    for (let i = 1; i <= numProcesses; i++) {
      processes.set(i, { pointers: [], deleted: false, killed: false });
    }

    let totalOperations = 0;

    while (totalOperations < maxOperations) {
      const processId = random(1, numProcesses);
      const processInfo = processes.get(processId)!;

      const probability = randomProb();

      if (probability <= 0.4) { // 40% de probabilidad para "new"
        if (!processInfo.killed && !processInfo.deleted) {
          const ptr = random(1, 10000);
          processInfo.pointers.push(ptr);
          operations.push(`new(${processId},${ptr})`);
        }

      } else if (probability <= 0.7) { // 30% de probabilidad para "use"
        if (!processInfo.killed && !processInfo.deleted && processInfo.pointers.length > 0) {
          const ptrToUse = processInfo.pointers[random(0, processInfo.pointers.length - 1)];
          operations.push(`use(${ptrToUse})`);

        }
      } else if (probability <= 0.9) { // 20% de probabilidad para "delete"
        if (!processInfo.killed && !processInfo.deleted && processInfo.pointers.length > 0) {
          const ptrToDelete = processInfo.pointers[random(0, processInfo.pointers.length - 1)];
          operations.push(`delete(${ptrToDelete})`);
          processInfo.deleted = true;

        }
      } else { // 10% de probabilidad para "kill"
        if (!processInfo.killed && processInfo.pointers.length > 0) {
          operations.push(`kill(${processId})`);
          processInfo.killed = true;

        }
      }
      totalOperations++;
    }
    processes.forEach((processInfo, processId) => {
      if (!processInfo.killed) {
        operations.push(`kill(${processId})`);
      }
    });

    this.rearArchivo(operations);

    return operations;
  }

  rearArchivo(operaciones: string[]): void {
    const texto = operaciones.join('\n');
    const blob = new Blob([texto], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'operaciones.txt';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }



}


