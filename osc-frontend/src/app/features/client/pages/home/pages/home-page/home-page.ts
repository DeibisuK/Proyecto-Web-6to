import { Component } from '@angular/core';
import { Contact } from '../../../contact/contact';
import { HoverGalleryComponent } from '../../components/hover-gallery/hover-gallery';
import { PreguntasFrecuentes } from "../../components/preguntas-frecuentes/preguntas-frecuentes";
import { CaracteristicasPrincipales } from "../../components/caracteristicas-principales/caracteristicas-principales";
import { ArticlesCarouselComponent } from '../../components/articles-carousel/articles-carousel';

@Component({
  selector: 'app-home',
  imports: [ArticlesCarouselComponent, Contact, HoverGalleryComponent, PreguntasFrecuentes, CaracteristicasPrincipales],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class Home {

}
