export class clsemail {
  configid: number;
  title: string;
  emailfrom: string = "noreply@triarqhealth.com";
  frompassword: string = "";
  emailto: MailInput[];
  emailtoreceive: [] = [];
  emailcc: MailInput[];
  emailccreceive: [] = [];
  userid: string;
  username: string;
  createdon: string;
  modifiedon: string;
  emailsubject: string;
  emailbody: string;
}

export class MailInput {
  Id: number;
  Email: string;
}

export class MailSave {
  configid: number = 0;
  title: string;
  emailfrom: string = "noreply@triarqhealth.com";
  frompassword: string = "";
  emailto: MailInput[];
  emailcc: MailInput[];
  userid: string;
  username: string;
  createdon: string;
  modifiedon: string;
  emailsubject: string;
  emailbody: string;
}

export class MailSend {
  FromEmail: string = "noreply@triarqhealth.com";
  FromPassword: string = "";
  To: string;
  Body: string;
  Cc: string;
  Subject: string;
}
