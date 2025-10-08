export interface Article {
  id: number;
  title: string;
  description: string;
  date: string;
  image: string;
  category: string;
  content?: string;
  author?: string;
  tags?: string[];
}