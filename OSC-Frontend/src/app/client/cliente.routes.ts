import { Routes } from "@angular/router";
import { Contact } from "./features/contact/contact";
import { Home } from "./features/home/home";

export const clienteRoutes: Routes = [
  {
    path: '', redirectTo: '/inicio', pathMatch: 'full',
  },
  {
    path: 'inicio', component: Home
  },
{
    path: 'contacto', component: Contact
  },
  {
    path: '**', redirectTo: 'inicio'
  }
]