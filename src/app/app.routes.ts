import { Routes } from '@angular/router';
import { SimulacionComponent } from './simulacion/simulacion.component';
import { MenuPrincipalComponent } from './menu-principal/menu-principal.component';

export const routes: Routes = [
    {path: "", component: MenuPrincipalComponent},
    {path: "simulacion", component: SimulacionComponent}];
