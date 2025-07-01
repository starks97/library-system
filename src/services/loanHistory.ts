import type { ILoanHistory, ILoanRecord } from "../types";
import { HashMap } from "../structures/hashTable";

export class LoanHistory implements ILoanHistory {
  private loanHistoryArray: ILoanRecord[] = []; //to have a sort history.
  private loanHistoryMap: HashMap<string, ILoanRecord> = new HashMap(); // to make efficient consultations.

  addLoanHistory(bookISBN: string) {
    const record: ILoanRecord = {
      bookId: bookISBN,
      borrowDate: new Date(),
      returnDate: null,
    };

    this.loanHistoryArray.push(record);
    this.loanHistoryMap.set(bookISBN, record);
    return true;
  }

  isBookLoan(isbn: string): boolean {
    const loan = this.loanHistoryMap.get(isbn);
    return !!loan && loan.returnDate === null;
  }

  updateLoanHistory(bookISBN: string) {
    // 1. Buscar el préstamo activo usando el Map (O(1))
    const activeLoan = this.loanHistoryMap.get(bookISBN);

    const returnDate = new Date();

    // 2. Si no existe o ya está devuelto, retornar false
    if (!activeLoan || activeLoan.returnDate !== null) {
      return false;
    }

    activeLoan.returnDate = returnDate;

    for (const book of this.loanHistoryArray) {
      if (book.bookId === bookISBN && book.returnDate === null) {
        book.returnDate = returnDate;
        break;
      }
    }

    return true;
  }

  getFullLoanHistory() {
    return [...this.loanHistoryArray];
  }

  deleteElementFromHistory(isbn: string) {
    const existedInMap = this.loanHistoryMap.delete(isbn);

    const index = this.loanHistoryArray.findIndex((i) => i.bookId === isbn);
    if (index !== -1) {
      this.loanHistoryArray.splice(index, 1);
    }

    return existedInMap && index !== -1;
  }
}
