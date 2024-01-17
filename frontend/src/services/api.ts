import {
  ILoggedInUser,
  IPublicUser,
  IUser,
  IWorld,
  PaginatedResults,
} from "@/types/models";

import { callApi } from "./transport";

interface ICreateUser {
  name: string;
  emailAddress: string;
  password: string;
}

interface IAuthUser {
  emailAddress: string;
  password: string;
}

export class ApiService {
  user: ILoggedInUser | undefined;

  setCurrentUser(user: ILoggedInUser) {
    this.user = user;
  }

  createUser(userData: ICreateUser) {
    return callApi<IPublicUser>("POST", "/users", { data: userData });
  }

  authUser(userData: IAuthUser) {
    return callApi<ILoggedInUser>("POST", "/users/auth", {
      data: userData,
    });
  }

  updateUser(data: Record<string, unknown>) {
    return callApi<IUser>("PUT", "/users", { user: this.user, data });
  }

  getWorld() {
    return callApi<IWorld>("GET", "/world/", { user: this.user });
  }
}
