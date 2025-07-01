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
    }
  }

  private _handleBookAddition(
    event: Pick<
      INotificationEvent,
      "action" | "bookAuthor" | "bookCtg" | "bookISBN"
    >,
  ) {
    if (!event.bookAuthor || !event.bookCtg || !event.bookISBN) {
      throw new Error(`data incompplete for ADD_BOOK`);
    }

    this.recomendationSys.addBookNode({
      isbn: event.bookISBN,
      author: event.bookAuthor,
      category: event.bookCtg,
    });

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
