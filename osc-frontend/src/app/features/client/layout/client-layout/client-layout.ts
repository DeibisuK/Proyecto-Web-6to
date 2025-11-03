import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '@shared/components/navbar/navbar';
import { Footer } from '@shared/components/footer/footer';
import { ScrollTop } from '@shared/components/scroll-top/scroll-top';

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
