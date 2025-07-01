import { IAuth, IBook, IBookStoreService } from "../types";
import { LibraryRecommendationSystem } from "./libraryGraph";
import { LoanHistory } from "./loanHistory";

export class LibraryService {
  constructor(
    private auth: IAuth,
    private bookStore: IBookStoreService,
    private libraryGraph: LibraryRecommendationSystem,
  ) {}

  loanBook(clientId: string, isbn: string) {
    const book = this.bookStore.getBook(isbn);
    const client = this.auth.me(clientId);

    //2.- check if the book and the client are in the system
    if (!book)
      throw new Error("Libro no existe o no se encuentra en el sistema");
    if (!client) throw new Error("Cliente no registrado");

    //2.5.- check how many books are in stock
    if (book.availableCopies <= 0) throw new Error("No hay libros disponibles");

    //3.- if the client is in the system, the system updates the aviability of the book.
    if (!book.borrowedTo) {
      book.borrowedTo = [];
    }
    book.borrowedTo!.push(client.id);
    book.borrowDate = new Date();
    book.availableCopies -= 1;

    //4.- We update the client info to adding the loan;

    if (client.loanHistory === null) client.loanHistory = new LoanHistory();
    client.loanHistory.addLoanHistory(isbn);

    //5.- we add the nodes in the graph to build the relations between them.
    if (client.id !== clientId || book.isbn !== isbn)
      throw Error("the book and client are not in the system.");

    //6.- we add the relation between them
    this.libraryGraph.addEdges(clientId, isbn);
  }

  returnBook(clientId: string, isbn: string) {
    const book = this.bookStore.getBook(isbn) as IBook;
    const client = this.auth.me(clientId);

    if (!book) throw new Error("Libro no disponible");
    if (!client) throw new Error("Cliente no registrado");

    if (!book.borrowedTo?.includes(client.id)) {
      throw new Error("El libro no esta prestado a este cliente");
    }

    if (!client.loanHistory?.isBookLoan(isbn))
      throw new Error("El cliente no tiene un prestamo activo con este libro");
    book.borrowedTo!.splice(
      book.borrowedTo!.findIndex((id: string) => id === client.id),
      1,
    );
    book.borrowDate = null;

    if (book.availableCopies >= book.totalCopies)
      throw new Error("No se pueden devolver mas copias de las que existen");
    book.availableCopies += 1;

    client.loanHistory.updateLoanHistory(isbn);

    this.libraryGraph.deleteEdges(clientId, isbn);

    return false;
  }

  removeBookFromInventory(isbn: string) {
    const book = this.bookStore.getBook(isbn);
    if (!book) throw new Error("Libro no disponible");

    if (book.availableCopies !== book.totalCopies)
      throw new Error(
        "No se puede eliminar el libro del inventario hasta obtener todas las copias, por favor devuelvan todas las copias",
      );

    this.bookStore.removeBook(isbn);
  }

  visualize(): string {
    let output = "📚 Estado Actual de la Biblioteca 📚\n\n";

    // 1. Visualizar libros por ISBN
    output += "🔖 Libros por ISBN:\n";
    output +=
      this.bookStore
        .getAllBooks()!
        .map(
          (book) =>
            `  ${book.isbn}: ${book.title} [${
              (book.borrowedTo || []).length > 0
                ? "Prestado a " + (book.borrowedTo || []).join(", ")
                : "Disponible"
            }], copias disponibles en stock ${book.availableCopies}, libros totales en stock:${book.totalCopies}`,
        )
        .join("\n") + "\n\n";

    //2. Visualize Category Tree
    output += "🔖 Libros por categoría:\n";

    output += this.bookStore.getAllBooksByCategories().join("\n");

    // 3. Visualizar clientes
    output += "👥 Clientes Registrados:\n";
    output +=
      this.auth
        .getAllUsers()
        .map(
          (client) =>
            `  ${client.id}: ${client.name} ${client.lastname} (Historial de prestamos: ${client.loanHistory
              ?.getFullLoanHistory()
              .map(
                (record) =>
                  `Libro: ${record.bookId}, Fecha: ${record.borrowDate.toLocaleDateString()}`,
              )
              .join("; ")})`,
        )
        .join("\n") + "\n\n";

    // 4. Visualizar grafo de préstamos
    output += "🕸️ Grafo de Préstamos:\n";
    output += this._visualizeGraph();

    return output;
  }

  private _visualizeGraph() {
    const nodes = this.libraryGraph.getNodes();
    let output = "";
    nodes.forEach((node) => {
      const nodeStr = node.toString();
      if (!nodeStr.startsWith("cat_") && !nodeStr.startsWith("auth_")) {
        output += `  ${nodeStr}: ${this.libraryGraph.getNeighboor(node).join(", ")}\n`;
      }
    });

    return output;
  }
}
