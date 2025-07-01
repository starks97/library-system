import { LibraryService } from "./services/libraryService";
import { ClientFactory, BookFactory } from "./patterns/factory";
import { Auth } from "./services/auth";
import { BookStore } from "./services/bookStore";
import { LibraryRecommendationSystem } from "./services/libraryGraph";
import { NotificationHub, RecommendationEngine } from "./patterns/observer";

import books from "./books.json";

import { writeFileSync } from "fs";
import { INotificationEvent } from "./types";

const notificationSystem = new NotificationHub<INotificationEvent>();
const recomendationSystem = new LibraryRecommendationSystem();
const notifySystem = new RecommendationEngine(recomendationSystem);

notificationSystem.subscribe(notifySystem);

const bookStore = new BookStore(notificationSystem);
const auth = new Auth(notificationSystem);

const library = new LibraryService(auth, bookStore, recomendationSystem);

const booksToAdd = books.map((book) => BookFactory.createBook(book));

const client1 = ClientFactory.createClient({
  id: "1",
  name: "jason",
  lastname: "momoa",
  email: "jason@hotmail.com",
});

const client2 = ClientFactory.createClient({
  id: "2",
  name: "Emma",
  lastname: "Watson",
  email: "watsonEmma@hotmail.com",
});
const client3 = ClientFactory.createClient({
  id: "3",
  name: "Tom",
  lastname: "Hanks",
  email: "iamtom@hotmail.com",
});

auth.register(client1);
auth.register(client2);
auth.register(client3);

const book1 = BookFactory.createBook({
  author: "García Márquez",
  title: "Cien años de soledad",
  category: "Novela",
  isbn: "9781234567897",
  totalCopies: 5,
  // No necesitamos especificar id, available, borrowedTo ni borrowDate
  // porque la factory los asigna automáticamente
});

const book2 = BookFactory.createBook({
  author: "George Orwell",
  title: "1984",
  category: "Ciencia Ficción",
  isbn: "9780451524935",
  totalCopies: 3,
});

const book3 = BookFactory.createBook({
  author: "J.R.R. Tolkien",
  title: "El Señor de los Anillos",
  category: "Fantasía",
  isbn: "9788445000667",
  totalCopies: 10,
});

bookStore.addBook(book1);
bookStore.addBook(book2);
bookStore.addBook(book3);
bookStore.addBooks(booksToAdd);

const searchBook = (query: string) => {
  return bookStore.searchBookByQuery(query);
};

const bookTarget1 = searchBook("La casa de los espíritus")[0];
const bookTarget2 = searchBook("Stephen King")[0];
const bookTarget3 = searchBook("J.R.R. Tolkien")[0];

library.loanBook(client1.id, book3.isbn);
library.loanBook(client1.id, book2.isbn);
library.loanBook(client1.id, book1.isbn);
library.loanBook(client2.id, book1.isbn);
library.loanBook(client3.id, book1.isbn);
library.loanBook(client3.id, bookTarget1.isbn);
library.loanBook(client3.id, bookTarget2.isbn);
library.loanBook(client2.id, bookTarget3.isbn);
//return BookFactory

const recomendation = recomendationSystem.getUserBookRecomendations(client1.id);

console.log("recomendation system ", recomendation);

library.returnBook(client1.id, book1.isbn);

function saveVisualization() {
  const visualization = library.visualize();
  writeFileSync("library_state.txt", visualization);
  console.log("✅ library state save in library_state.txt");
}

// Ejecutar después de cada operación importante
saveVisualization();
