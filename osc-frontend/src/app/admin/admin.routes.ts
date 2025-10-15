import { Routes } from "@angular/router";
import { Dashboard } from "./features/dashboard/dashboard";
import { Sedes } from "./features/sedes/sedes";

export const adminRoutes: Routes = [
  {
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full'
  },
  {
    path: 'dashboard', 
    component: Dashboard
  },
  {
    path: 'sedes', 
    component: Sedes
  },
  {
    path: '**', 
    redirectTo: 'dashboard'
  }
]
