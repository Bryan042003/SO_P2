import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simulacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulacion.component.html',
  styleUrl: './simulacion.component.css'
})
export class SimulacionComponent {

  columns: number[] = [];

  ngOnInit(): void {
    // Crear un arreglo de 100 elementos
    this.columns = Array.from({ length: 72 }, (_, index) => index + 1);
  }

}
