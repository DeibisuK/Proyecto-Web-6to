import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../core/components/navbar/navbar';
import { Footer } from '../../core/components/footer/footer';
import { ScrollTop } from '../../core/components/scroll-top/scroll-top';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, Navbar, Footer, ScrollTop],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.css'
})
export class ClientLayout {
  constructor() { }
}
