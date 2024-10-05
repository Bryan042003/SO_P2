import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuPrincipalComponent } from "./menu-principal/menu-principal.component";
import { SimulacionComponent } from "./simulacion/simulacion.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuPrincipalComponent, SimulacionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SO_P2';
}
