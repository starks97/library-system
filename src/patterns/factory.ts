import { IClient, IBook } from "../types";

export class ClientFactory {
  static createClient(
    data: Omit<IClient, "id" | "loanHistory"> & { id?: string },
  ): IClient {
    return {
      id: data.id || this.generateId(),
      name: data.name,
      lastname: data.lastname,
      email: data.email,
      loanHistory: null,
    };
  }

  private static generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}

export class BookFactory {
  static createBook(
    data: Omit<
      IBook,
      "id" | "borrowedTo" | "borrowDate" | "availableCopies"
    > & {
      id?: string;
    },
  ): IBook {
    return {
      id: data.id || this.generateId(),
      author: data.author,
      title: data.title,
      category: data.category,
      isbn: data.isbn,
      availableCopies: data.totalCopies,
      totalCopies: data.totalCopies,
      borrowedTo: null,
      borrowDate: null,
    };
  }

  private static generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
