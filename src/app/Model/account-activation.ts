export class AccountActivation {}
export class AccountVerification {
  verificationrequestid: string;
  clientid: string;
  subclientid: string;
  subclientexternalid: string;
  emailto: string;
  emailsendto: string;
  verificationduedate: string;
  verificationexpired: boolean = false;
  verificationsubmitdate: string;
  verificationsubmitted: boolean = false;
  ftpstatus: boolean = false;
  clientidentifierstatus: boolean = false;
  providerstatus: boolean = false;
  ftpstatuscomment: string;
  clientidentifierstatuscomment: string;
  providerstatuscomment: String;
}

export class SubclientExternalID {
  subclientexternalid: string = "";
}

export class AccountVerificationPost {
  verificationrequestid: string;
  verificationexpired: boolean = false;
  verificationsubmitdate: string;
  verificationsubmitted: boolean = false;
  ftpstatus: boolean = false;
  clientidentifierstatus: boolean = false;
  providerstatus: boolean = false;
  ftpstatuscomment: string;
  clientidentifierstatuscomment: string;
  providerstatuscomment: String;
}
