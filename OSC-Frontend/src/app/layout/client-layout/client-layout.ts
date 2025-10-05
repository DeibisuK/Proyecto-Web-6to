import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../core/components/navbar/navbar';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.css'
})
export class ClientLayout {

}
