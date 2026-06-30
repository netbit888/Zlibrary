export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  publisher: string;
  year: number;
  pages: number;
  language: string;
  rating: number;
  downloads: number;
  category: string;
  formats: ("pdf" | "epub" | "mobi")[];
  description: string;
}

const books: Book[] = [

];

export default books;
