import { Injectable, inject } from "@angular/core";
import { IDataAdapter, Params } from "../adapters/IDataAdapter";
import { environment } from "../../environments/environment";
import { HttpAdapter } from "../adapters/HttpAdapter";
import { IUser } from "../../domain/model/IUser";

const URL = `${environment.url}/users`;

@Injectable({
    providedIn: "root",
})
export class UsersRepoService {
    private dataSource: IDataAdapter<IUser> = inject(HttpAdapter<IUser>);
    private _users: IUser[] = [];
    get users(): IUser[] {
        return this._users;
    }

    getUsers = (arg?: string | Params) => this.dataSource.get(URL, arg);
    putUser = (user: IUser) => this.dataSource.put(URL, user);
    addUser = (user: IUser) => this.dataSource.post(URL, user);
    deleteUser = (id: string) => this.dataSource.delete(URL, id);
}
