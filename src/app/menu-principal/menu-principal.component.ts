import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MMU } from '../modelos/mmu.model';
import { Page } from '../modelos/pagina.model';


@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './menu-principal.component.html',
  styleUrl: './menu-principal.component.css'
})
export class MenuPrincipalComponent { mmu: MMU;
  processIdCounter: number = 1;

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
      console.error(error.message);
    }
  }

  deleteMemory(ptr: number) {
    try {
      this.mmu.delete(ptr);
      console.log(`Memory at ptr ${ptr} deleted`);
    } catch (error) {
      console.error(error.message);
    }
  }

  killProcess(pid: number) {
    this.mmu.kill(pid);
    console.log(`Process ${pid} killed and memory freed`);
  }

  printMemory() {
    this.mmu.printMemory();
  }
}

