import { BinarySearchTree } from "../structures/binaryTree";
import { HashMap } from "../structures/hashTable";
import {
  IBook,
  IBookStoreService,
  INotificationEvent,
  Subject,
} from "../types";

export class BookStore implements IBookStoreService {
  private inventory: HashMap<string, IBook>;
  private categoryIndex: BinarySearchTree<IBook["category"], IBook["isbn"]>;

  constructor(private notificationSystem: Subject<INotificationEvent>) {
    this.inventory = new HashMap(100);
    this.categoryIndex = new BinarySearchTree();
  }

  addBook(book: IBook) {
    const isInStock = this.inventory.get(book.isbn);
    if (isInStock) {
      return this.updateBook(book.isbn, book.totalCopies as Partial<IBook>);
    } else {
      this.inventory.set(book.isbn, { ...book });
      this.categoryIndex.insert(book.category, book.isbn);

      this.notificationSystem.publish({
        bookAuthor: book.author,
        bookCtg: book.category,
        bookISBN: book.isbn,
        action: "ADD_BOOK",
      });

      return book;
    }
  }

  addBooks(books: IBook[]) {
    if (books.length === 0) return [];
    let results = [];
    if (books.length > 0) {
      for (const book of books) {
        const isInStock = this.inventory.get(book.isbn);
        if (isInStock) {
          this.updateBook(book.isbn, book.totalCopies as Partial<IBook>);
          results.push(book);
        } else {
          this.inventory.set(book.isbn, { ...book });
          this.categoryIndex.insert(book.category, book.isbn);
          this.notificationSystem.publish({
            bookAuthor: book.author,
            bookCtg: book.category,
            bookISBN: book.isbn,
            action: "ADD_BOOK",
          });
          results.push(book);
        }
      }
    }

    return results;
  }

  removeBook(isbn: string): boolean {
    const book = this.inventory.get(isbn);
    if (!book) false;

    this.categoryIndex.delete(isbn);

    return this.inventory.delete(isbn);
  }

  updateBook(isbn: string, updates: Partial<IBook>) {
    const book = this.inventory.get(isbn);
    if (!book) throw new Error("Book not found in the store.");

    const bookUpdated = { ...book, ...updates };

    this.inventory.set(isbn, bookUpdated);

    if (updates.category && updates.category !== book.category) {
      this.categoryIndex.delete(book.category);
      this.categoryIndex.insert(updates.category, updates.isbn!);
    }

    return bookUpdated;
  }

  getBook(isbn: string): IBook {
    const book = this.inventory.get(isbn);
    if (!book) throw new Error("Book not found in the store.");

    return book;
  }

  getBookByCategory(category: string): IBook | null {
    const target = this.categoryIndex.search(category);

    if (!target)
      throw new Error(`The category: ${category} is not in the tree.`);

    return this.getBook(target);
  }

  getAllBooksByCategories() {
    return this.categoryIndex.treeToArray();
  }

  getAllBooks(): IBook[] {
    return [...this.inventory.values()];
  }

  searchBookByQuery(query: string) {
    const target = query.toLowerCase();
    return this.getAllBooks()!.filter(
      (book) =>
        book.author.toLowerCase().includes(target) ||
        book.title.toLowerCase().includes(target) ||
        book.category.toLowerCase().includes(target) ||
        book.isbn.toLowerCase().includes(target),
    );
  }
}
