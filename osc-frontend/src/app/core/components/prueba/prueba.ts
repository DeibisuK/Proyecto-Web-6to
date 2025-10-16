import { Component } from '@angular/core';
import PruebaReact from '../../react-components/pruebas/prueba-react';
import { ReactWrapperComponent } from '../../../shared/react-wrapper/react-wrapper.component';

@Component({
  selector: 'app-prueba',
  imports: [ReactWrapperComponent],
  templateUrl: './prueba.html',
  styleUrl: './prueba.css'
})
export class Prueba {
   pruebaReact = PruebaReact;
}
