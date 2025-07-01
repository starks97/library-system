import { Graph } from "../structures/graph";
import { HashMap } from "../structures/hashTable";
import { IBook } from "../types";

export class LibraryRecommendationSystem extends Graph<string> {
  private nodeTypes = new HashMap<
    string,
    "user" | "book" | "category" | "author"
  >(100);
  addUserNode(userId: string) {
    this.addNode(userId);
    this.nodeTypes.set(userId, "user");
  }

  addBookNode(options: Pick<IBook, "isbn" | "category" | "author">) {
    if (!this.nodeTypes.has(options.isbn)) {
      // Añadir nodo del libro
      this.addNode(options.isbn);
      this.nodeTypes.set(options.isbn, "book");

      // Añadir categoría con prefijo para evitar colisiones
      const categoryNode = `cat_${options.category}`;
      if (!this.nodeTypes.has(categoryNode)) {
        this.addNode(categoryNode);
        this.nodeTypes.set(categoryNode, "category");
      }
      this.addEdges(options.isbn, categoryNode);

      // Añadir autor con prefijo para evitar colisiones
      const authorNode = `auth_${options.author}`;
      if (!this.nodeTypes.has(authorNode)) {
        this.addNode(authorNode);
        this.nodeTypes.set(authorNode, "author");
      }
      this.addEdges(options.isbn, authorNode);
    }
  }

  addRelation(userId: string, bookISBN: string) {
    if (
      this.nodeTypes.get(userId) !== "user" ||
      this.nodeTypes.get(bookISBN) !== "book"
    ) {
      throw new Error("Solo se pueden conectar usuarios con libros");
    }

    return this.addEdges(userId, bookISBN);
  }

  getUserBookRecomendations(userId: string, limit: number = 5) {
    //get loans books by the user;
    const borrowedBooks = this.getNeighboor(userId).filter(
      (id) => this.nodeTypes.get(id) === "book",
    );

    //Find similar users that borrowed the same books.
    const similarUsers = new Set<string>();

    for (const bookISBN of borrowedBooks) {
      const usersWhoBorrowed = this.getNeighboor(bookISBN).filter(
        (id) => this.nodeTypes.get(id) === "user" && id !== userId,
      );
      usersWhoBorrowed.forEach((user) => similarUsers.add(user));
    }

    //get books borrowed by similar users

    const recomendations = new Map<string, number>();

    for (const similarUser of similarUsers) {
      const userBooks = this.getNeighboor(similarUser).filter(
        (id) => this.nodeTypes.get(id) === "book",
      );

      userBooks.forEach((bookISBN) => {
        if (!borrowedBooks.includes(bookISBN)) {
          recomendations.set(bookISBN, (recomendations.get(bookISBN) || 0) + 1);
        }
      });
    }

    return Array.from(recomendations.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([bookISBN]) => bookISBN)
      .slice(0, limit);
  }

  getContentBasedRecomendations(bookISBN: string, limit: number = 5) {
    const categories = this.getNeighboor(bookISBN).filter((id) =>
      this.nodeTypes.get(id)!.startsWith("cat_"),
    );
    const author = this.getNeighboor(bookISBN).filter((id) =>
      this.nodeTypes.get(id)!.startsWith("auth_"),
    );

    //find books relations;

    const relatedBooks = new Set<string>();

    categories.forEach((category) => {
      this.getNeighboor(category)
        .filter((id) => id !== bookISBN && this.nodeTypes.get(id) === "book")
        .forEach((book) => relatedBooks.add(book));
    });

    if (author) {
      author.forEach((author) => {
        this.getNeighboor(author)
          .filter((id) => id !== bookISBN && this.nodeTypes.get(id) === "book")
          .forEach((book) => relatedBooks.add(book));
      });
    }

    return Array.from(relatedBooks).slice(0, limit);
  }
}
