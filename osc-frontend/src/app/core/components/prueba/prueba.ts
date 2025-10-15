import { Component } from '@angular/core';
import { ReactWrapperComponent } from '../../../share/react-wrapper/react-wrapper.component';
import PruebaReact from '../../react-components/pruebas/prueba-react';

@Component({
  selector: 'app-prueba',
  imports: [ReactWrapperComponent],
  templateUrl: './prueba.html',
  styleUrl: './prueba.css'
})
export class Prueba {
   pruebaReact = PruebaReact;
}
