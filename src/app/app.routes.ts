import { Routes } from '@angular/router';
import { MenuPrincipalComponent } from './menu-principal/menu-principal.component';
import { SimulacionComponent } from './simulacion/simulacion.component';

export const routes: Routes = [
    { path: 'menu', component: MenuPrincipalComponent },
    { path: 'simulacion', component: SimulacionComponent },
    { path: '**', redirectTo : '/menu' },
    { path: '', redirectTo : '/menu', pathMatch: 'full' }
  ]; 