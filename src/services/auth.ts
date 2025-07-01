import { HashMap } from "../structures/hashTable";
import { IAuth, IClient, INotificationEvent, Subject } from "../types";

export class Auth implements IAuth {
  private client: HashMap<string, IClient> = new HashMap(100);

  constructor(private notificationSystem: Subject<INotificationEvent>) {}
  register(clientData: IClient) {
    if (this.client.has(clientData.id)) {
      throw new Error(`User with ID ${clientData.id} already registered`);
    }

    // 2. Verificar unicidad del email
    const existingUser = this.findUserByEmail(clientData.email);
    if (existingUser) {
      throw new Error(`Email ${clientData.email} already registered`);
    }

    // 3. Registrar nuevo usuario
    this.client.set(clientData.id, clientData);

    // 4. Notificar el registro
    this.notificationSystem.publish({
      action: "REGISTER_USER",
      userId: clientData.id,
    });
  }

  login(email: string) {
    const userInDB = this.findUserByEmail(email);

    if (!userInDB) {
      throw new Error(`Email ${email} not registered`);
    }

    return {
      name: userInDB!.name,
      loanHistory: userInDB!.id,
      id: userInDB!.id,
    };
  }

  getHistoryOfLoanUser(clientID: string) {
    const userInDB = this._userInDB(clientID);

    if (!userInDB) {
      throw new Error(`Client with ID: ${clientID} doesn't exist`);
    }

    if (!userInDB.loanHistory) {
      return [];
    }

    return userInDB.loanHistory.getFullLoanHistory();
  }

  getAllUsers(): IClient[] {
    return [...this.client!.values()];
  }

  me(clientID: string): IClient {
    return this._userInDB(clientID);
  }

  private _userInDB(clientID: string) {
    if (!this.client.has(clientID)) {
      throw new Error(`Client with ID: ${clientID} doesn't exist`);
    }
    return this.client.get(clientID)!;
  }

  private findUserByEmail(email: string): IClient | undefined {
    return [...this.client.values()].find((user) => user.email === email);
  }
}
