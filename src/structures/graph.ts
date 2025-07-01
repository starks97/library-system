import { HashMap } from "./hashTable";
import { IGraph } from "../types";

export class Graph<T> implements IGraph<T> {
  private adyacents: HashMap<T, T[]>;

  constructor() {
    this.adyacents = new HashMap();
  }

  addNode(node: T) {
    this.adyacents.set(node, this.adyacents.get(node) || []);
  }

  addNodes(nodes: T[]) {
    nodes.forEach((node) => this.addNode(node));
  }

  addEdges(nodeA: T, nodeB: T): void {
    if (!this.adyacents.has(nodeA) || !this.adyacents.has(nodeB))
      return console.log("The nodes have to exist in the graph");

    this.adyacents.get(nodeA)?.push(nodeB);
    this.adyacents.get(nodeB)?.push(nodeA);
  }

  getNodes() {
    return [...this.adyacents.keys()];
  }

  deleteEdges(nodeA: T, nodeB: T) {
    if (!this.adyacents.has(nodeA) || !this.adyacents.has(nodeB))
      return console.log("The nodes have to exist in the graph");

    const adyacentA = this.adyacents.get(nodeA) || [];
    this.adyacents.set(
      nodeA,
      adyacentA.filter((n) => n !== nodeB),
    );

    const adyacentB = this.adyacents.get(nodeB) || [];
    this.adyacents.set(
      nodeB,
      adyacentB.filter((n) => n !== nodeA),
    );

    return true;
  }

  getNeighboor(node: T): T[] {
    return this.adyacents.get(node) || [];
  }

  deleteNode(node: T) {
    if (!this.adyacents.has(node))
      return console.log("The node has to exist in the graph");
    const neighboors = this.getNeighboor(node);

    for (const neighboor of neighboors) {
      const neighboorsAdjacents = this.adyacents.get(neighboor) || [];
      this.adyacents.set(
        neighboor,
        neighboorsAdjacents.filter((n) => n !== node),
      );
    }

    this.adyacents.delete(node);

    return true;
  }

  bfs(init: T): T[] {
    const visited: T[] = [];
    const tail: T[] = [init];
    const nodesVisited = new Set<T>();

    nodesVisited.add(init);

    while (tail.length > 0) {
      const currentNode = tail.shift()!;
      visited.push(currentNode);

      const neighboords = this.getNeighboor(currentNode);

      for (const neighboord of neighboords) {
        if (!nodesVisited.has(neighboord)) {
          nodesVisited.add(neighboord);
          tail.push(neighboord);
        }
      }
    }
    return visited;
  }

  dfs(init: T): T[] {
    const visited: T[] = [];
    const nodesVisited = new Set<T>();

    const dfsRecursive = (node: T) => {
      visited.push(node);
      nodesVisited.add(node);

      const neighboords = this.getNeighboor(node);

      for (const neighboord of neighboords) {
        if (!nodesVisited.has(neighboord)) {
          dfsRecursive(neighboord);
        }
      }
    };

    dfsRecursive(init);

    return visited;
  }

  existPath(initNode: T, nodeDestination: T): boolean {
    const tail: T[] = [initNode];
    const visited = new Set<T>();

    while (tail.length > 0) {
      const currentNode = tail.shift()!;
      if (currentNode === nodeDestination) return true;

      const neighboords = this.getNeighboor(currentNode);
      for (const neighboord of neighboords) {
        if (!visited.has(neighboord)) {
          visited.add(neighboord);
          tail.push(neighboord);
        }
      }
    }

    return false;
  }
}
