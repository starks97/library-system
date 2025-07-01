import { LibraryRecommendationSystem } from "../services/libraryGraph";

import { Subject, Observer, INotificationEvent } from "../types";

export class NotificationHub<T> implements Subject<T> {
  private subscribers: Observer<T>[] = [];
  private lastEvent?: T;

  subscribe(o: Observer<T>): void {
    if (!this.subscribers.includes(o)) {
      this.subscribers.push(o);
      console.log(`Observer registrado: ${o.constructor.name}`);
    }
  }

  unsubscribe(o: Observer<T>): void {
    const index = this.subscribers.indexOf(o);
    if (index >= 0) {
      this.subscribers.splice(index, 1);
      console.log(`Observer removido: ${o.constructor.name}`);
    }
  }

  publish(data: T): void {
    this.lastEvent = data;
    console.log(`Notificando a ${this.subscribers.length} observers...`);

    for (const observer of this.subscribers) {
      try {
        observer.onEvent(data);
      } catch (error) {
        console.error(`Error en observer ${observer.constructor.name}:`, error);
      }
    }
  }

  getLastEvent(): T | undefined {
    return this.lastEvent;
  }
}

export class RecommendationEngine implements Observer<INotificationEvent> {
  constructor(private recomendationSys: LibraryRecommendationSystem) {}

  onEvent(event: INotificationEvent) {
    switch (event.action) {
      case "ADD_BOOK":
        this._handleBookAddition(event);
        break;
      case "REGISTER_USER":
        this._handleUserRegistration(event);
        break;
      case "DELETE_BOOK":
        this._handleBookRemoval(event);
        break;
    }
  }

  private _handleBookAddition(
    event: Pick<
      INotificationEvent,
      "action" | "bookAuthor" | "bookCtg" | "bookISBN"
    >,
  ) {
    if (!event.bookAuthor || !event.bookCtg || !event.bookISBN) {
      throw new Error(`data incomplete for ADD_BOOK`);
    }

    this.recomendationSys.addBookNode({
      isbn: event.bookISBN,
      author: event.bookAuthor,
      category: event.bookCtg,
    });

    this.logEvent(event);
  }

  private _handleBookRemoval(
    event: Pick<
      INotificationEvent,
      "action" | "bookAuthor" | "bookCtg" | "bookISBN"
    >,
  ) {
    if (!event.bookAuthor || !event.bookCtg || !event.bookISBN) {
      throw new Error(`data incomplete for REMOVE_BOOK`);
    }

    //2.5 find users related with the book
    const users = this.recomendationSys.getBookUserRelation(event.bookISBN);

    if (users.length > 0) {
      //delete edges between users and book
      for (const user of users) {
        this.recomendationSys.deleteEdges(user, event.bookISBN);
      }
    }
    //2. Delete edges associated with the book.
    this.recomendationSys.deleteEdges(event.bookISBN, event.bookAuthor);
    this.recomendationSys.deleteEdges(event.bookISBN, event.bookCtg);

    //3. Delete the nodes associated with the book.
    if (this.recomendationSys.getNeighboor(event.bookAuthor).length === 0) {
      this.recomendationSys.deleteNode(event.bookAuthor);
    }
    if (this.recomendationSys.getNeighboor(event.bookCtg).length === 0) {
      this.recomendationSys.deleteNode(event.bookCtg);
    }

    //5. delete the book node
    this.recomendationSys.deleteNode(event.bookISBN);

    this.logEvent(event);
  }

  private _handleUserRegistration(
    event: Pick<INotificationEvent, "userId" | "action">,
  ) {
    if (!event.userId) throw new Error(`data incomplete for REGISTER_USER`);
    this.recomendationSys.addUserNode(event.userId);
    this.logEvent(event);
  }

  private logEvent(event: INotificationEvent): void {
    console.log(`[${new Date().toISOString()}] Evento procesado:`, event);
  }
}
