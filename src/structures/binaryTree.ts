export class TreeNode<K, V> {
  constructor(
    public key: K,
    public value: V,
    public right: TreeNode<K, V> | null = null,
    public left: TreeNode<K, V> | null = null,
  ) {}
}

export class BinarySearchTree<K, V> {
  constructor(public root: TreeNode<K, V> | null = null) {}

  insert(key: K, value: V) {
    const newNode = new TreeNode(key, value);
    if (!this.root) {
      this.root = newNode;
      return;
    }

    let current = this.root;

    while (true) {
      if (key < current.key) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      }
    }
  }

  delete(key: K) {
    let current = this.root;
    let parent: TreeNode<K, V> | null = null;
    let isLeftChild = false;

    while (current && current.key !== key) {
      parent = current;
      if (key < current.key) {
        current = current.left;
        isLeftChild = true;
      } else {
        current = current.right;
        isLeftChild = false;
      }
    }

    if (!current) return null;

    if (current.left === null && current.right === null) {
      if (parent === null) this.root = null;
      else if (isLeftChild) parent.left = null;
      else parent.right = null;
    } else if (current.left === null || current.right === null) {
      const child = current.left ?? current.right; // Obtiene el hijo no nulo
      if (parent === null) this.root = child;
      else if (isLeftChild) parent.left = child;
      else parent.right = child;
    } else {
      const successor = this._findMinNode(current.right);
      current.key = successor.key; // Copia los datos
      current.value = successor.value;
      this.delete(successor.key);
    }
  }

  search(key: K): V | null {
    let current = this.root;
    while (current) {
      if (key === current.key) return current.value;
      if (key < current.key) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return null;
  }

  inOrderTransversal(node: TreeNode<K, V> | null = this.root): void {
    if (node) {
      this.inOrderTransversal(node.left);
      this.inOrderTransversal(node.right);
    }
  }

  treeToArray() {
    if (!this.root) [];

    const result = [];
    const queue = [this.root];

    while (queue.length > 0) {
      const node = queue.shift();
      result.push(node!.value);

      if (node!.left) {
        queue.push(node!.left);
      }

      if (node!.right) {
        queue.push(node!.right);
      }
    }
    return result;
  }

  private _findMinNode(node: TreeNode<K, V>): TreeNode<K, V> {
    while (node.left) node = node.left;
    return node;
  }
}
