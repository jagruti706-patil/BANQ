export class Login {}

export class AuthUserDetails {
  userid: number;
  firstname: string;
  lastname: string;
  username: string;
  token: string;
  roles: Roles[] = [];
  groups: string[];
  applications: Application[] = [];
  defaultnavigation: string;
  gcpuserid: number;
  visitorip: string = "";
  visitorbrowser: string = "";
  continent: string = "";
  country: string = "";
  countryCode: string = "";
  city: string = "";
  region: string = "";
}

export class Roles {
  roleid: number;
  rolename: string;
}

export class Application {
  applicationcode: number;
  applicationname: string;
}

export class GCPUser {
  ngcpuserid: number;
  userid: string;
  firstname: string;
  lastname: string;
  mobilenumber: string;
  homephone: string;
  email: string;
  birthdate: string;
  gender: string;
  isactive: string;
  isclientadmin: string;
  issuperadmin: string;
  published: string;
  updated: string;
  username: string;
  displayname: string;
  initials: string = "";
  pendingtask: number = 0;
  workavg: number = 0;
  errorrate: number = 0;
  rating: number = 0;
  roleid: number;
  rolename: string;
}
