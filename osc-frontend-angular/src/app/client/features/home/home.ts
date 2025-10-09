import { Component } from '@angular/core';
import { ArticlesCarouselComponent } from '../../shared/components/articles-carousel/articles-carousel';
import { Contact } from '../contact/contact';
import { HoverGalleryComponent } from '../../shared/components/hover-gallery/hover-gallery';
import { PreguntasFrecuentes } from "./preguntas-frecuentes/preguntas-frecuentes";

@Component({
  selector: 'app-home',
  imports: [ArticlesCarouselComponent, Contact, HoverGalleryComponent, PreguntasFrecuentes],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
