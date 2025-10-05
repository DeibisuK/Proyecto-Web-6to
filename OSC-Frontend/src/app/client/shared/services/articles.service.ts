import { Injectable } from '@angular/core';
import { Article } from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {
  private articles: Article[] = [
    {
      id: 1,
      title: 'Medidas de una cancha...',
      description: 'Todo lo que necesitas saber sobre las dimensiones oficiales de las canchas de fútbol.',
      date: 'Sept 19, 2024',
      image: '/assets/images/cancha-futbol.jpg',
      category: 'Fútbol'
    },
    {
      id: 2,
      title: 'Estudio de no se que blabla...',
      description: 'Análisis detallado sobre las tendencias deportivas actuales.',
      date: 'Sept 21, 2024',
      image: '/assets/images/equipo-deportivo.jpg',
      category: 'General'
    },
    {
      id: 3,
      title: 'Nuevas instalaciones de pádel',
      description: 'Conoce nuestras modernas pistas de pádel con tecnología LED.',
      date: 'Oct 1, 2024',
      image: '/assets/images/padel-court.jpg',
      category: 'Pádel'
    }
  ];

  getArticles(): Article[] {
    return this.articles;
  }

  getFeaturedArticles(): Article[] {
    return this.articles.slice(0, 3);
  }
}