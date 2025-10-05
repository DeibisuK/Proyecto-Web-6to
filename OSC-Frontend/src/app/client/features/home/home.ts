import { Component } from '@angular/core';
import { ArticlesCarouselComponent } from '../../shared/components/articles-carousel/articles-carousel';
import { Contact } from '../contact/contact';
import { HoverGalleryComponent } from '../../shared/components/hover-gallery/hover-gallery';

@Component({
  selector: 'app-home',
  imports: [ArticlesCarouselComponent, Contact, HoverGalleryComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
