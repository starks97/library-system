class ListNode<T> {
  constructor(
    public value: T,
    public next: ListNode<T> | null = null,
  ) {}
}

//linked list simple.

export class LinkedList<T> {
  private head: ListNode<T> | null = null;
  private tail: ListNode<T> | null = null;
  private length: number = 0;

  //add to the final
  push(value: T) {
    const newNode = new ListNode(value);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail!.next = newNode;
      this.tail = newNode;
    }

    this.length++;

    return this.length;
  }

  //delete from the tail;
  pop(): T | null {
    if (!this.head) return null;
    let current = this.head;
    let newTail = current;

    while (current.next) {
      newTail = current;
      current = current.next;
    }

    this.tail = newTail;
    this.tail.next = null;
    this.length--;

    if (this.length === 0) {
      this.head = null;
      this.tail = null;
    }

    return current.value;
  }

  //add at the begining
  unshift(value: T): void {
    const newNode = new ListNode(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head = newNode;
    }

    this.length++;
  }

  //delete from the begining
  shift(): T | null {
    if (!this.head) return null;

    let currentHead = this.head;
    this.head = currentHead.next;
    this.length--;

    if (this.length === 0) {
      this.tail = null;
    }

    return currentHead.value;
  }

  //get value from index
  get(index: number): ListNode<T> | null {
    if (index < 0 || index >= this.length) return null;
    let counter = 0;
    let current = this.head;

    while (counter !== index) {
      current = current!.next;
      counter++;
    }

    return current;
  }

  //change the value of a index
  set(index: number, value: T) {
    //1. Obtenemos el valor por indice del nodo existente.
    const node = this.get(index); // (index = 1) => [B]

    //2. Si no existe el nodo en la lista devolvemos false
    if (!node) return false;

    //3. Actualizamos el valor del nodo actual de la lista, por el nuevo
    node.value = value; //(index = 1, value = [X]) => [X];

    //lista resultante quedaria [A] -> [X] -> [C] -> [D]

    return true;
  }

  //insert into a index
  insert(index: number, value: T): boolean {
    if (index < 0 || index > this.length) return false;
    if (index === 0) {
      this.unshift(value);
      return true;
    }
    if (index === this.length) {
      this.push(value);
      return true;
    }

    // 1. Creamos el nuevo nodo (todavía no conectado)
    const newNode = new ListNode(value); // [C]->null

    // 2. Obtenemos el nodo que estará ANTES del nuevo
    const prev = this.get(index - 1); // [B]->[D]

    // 3. El nuevo nodo debe apuntar al que era el siguiente del previo
    newNode.next = prev!.next; // [C]->[D] (ahora C sabe de D)

    // 4. El previo ahora debe apuntar al nuevo nodo
    prev!.next = newNode; // [B]->[C] (y como [C]->[D], la cadena queda completa)

    // Lista resultante: [A]->[B]->[C]->[D]->[E]
    this.length++;

    return true;
  }

  //remove from a index.
  remove(index: number): T | null {
    if (index < 0 || index > this.length) return null;
    if (index === 0) return this.shift();
    if (index === this.length - 1) return this.pop();

    //1. Buscamos el nodo anterior
    const prev = this.get(index - 1); // [B] -> C

    //2. Obtenemos el nodo siguiente al target ([C]);
    const removed = prev!.next; // [C] -> [D]

    //3. Conectamos los dos nodos despues de haber eliminado el target ([C])
    prev!.next = removed!.next; // [B] -> [D]

    //Lista resultante [A] -> [B] -> [D] -> [E]

    this.length--;

    //devolvemos el valor eliminado target([C])
    return removed!.value;
  }

  //reverse the list
  reverse() {
    let node = this.head;
    this.head = this.tail;
    this.tail = node;

    let prev: ListNode<T> | null = null;
    let next: ListNode<T> | null;

    for (let i = 0; i < this.length; i++) {
      next = node!.next;
      node!.next = prev;
      prev = node;
      node = next;
    }
  }

  toArray(): T[] {
    const arr: T[] = []; // 1. Creamos un array vacío

    let current = this.head; // 2. Empezamos desde la cabeza de la lista

    while (current) {
      // 3. Mientras exista un nodo actual
      arr.push(current.value); // 4. Añadimos su valor al array
      current = current.next; // 5. Movemos al siguiente nodo
    }

    return arr; // 6. Devolvemos el array completo
  }

  size() {
    return this.length;
  }
}
