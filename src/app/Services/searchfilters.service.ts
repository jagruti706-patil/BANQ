import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class SearchfiltersService {
  filesdata_mastererafileid: string = "0";
  filesdata_TS835id: string = "0";
  filesdata_spliterafileid: string = "0";
  filesdata_spliteflag: boolean = false;
  filesdatasplit_mastererafileid: string = "0";
  filesdatasplit_TS835id: string = "0";

  files_mastererafileid: string = "0";

  //File Data - file summary tab
  public filedatafilter: boolean = false;
  public filedataSelectedClientID: string = "0";
  public filedatastartDate: any;
  public filedataendDate: any;
  public filedataselectedStatus: string = "3";
  public filedatasSearchText: string = "";
  public filedataselectedSearchby: string = "Filename";

  //File Data - check summary tab
  public checkdatafilter: boolean = false;
  public checksSearchText: string = "";
  public checksSearchBy: string = "Check";

  //File Data - claim summary tab
  public claimdatafilter: boolean = false;
  public claimsSearchText: string = "";

  //File Data - split file tab
  public splitfiledatafilter: boolean = false;
  public splitfiledataSelectedSubclientID: string = "0";
  public splitfiledataselectedStatus: string = "3";
  public splitfiledatasSearchText: string = "";
  public splitfiledataselectedSearchBy: string = "Filename";
  public splitfiledataselectedDivisionCode: string = "All";

  //Split file Data - check summary tab
  public splitcheckdatafilter: boolean = false;
  public splitchecksSearchText: string = "";
  public splitchecksSearchBy: string = "Check";

  //Split file Data - claim summary tab
  public splitclaimdatafilter: boolean = false;
  public splitclaimsSearchText: string = "";

  //File tab
  public filefilter: boolean = false;
  public fileSelectedClientID: string = "0";
  public filestartDate: any;
  public fileendDate: any;
  public fileselectedStatus: string = "3";
  public filesSearchText: string = "";
  public fileselectedSearchBy: string = "Filename";

  //File tab - payer details
  public payerfilter: boolean = false;
  public payersSearchText: string = "";
  public payersSearchBy: string = "Check";

  //File tab - unmatched claim details
  public uclaimsfilter: boolean = false;
  public uclaimsSearchText: string = "";
  public uclaimsSearchBy: string = "Claim";
  public usendemailfilter: string = "All";

  //File tab - split files
  public splitfilefilter: boolean = false;
  public splitfileSelectedSubclientID: string = "0";
  public splitfileselectedStatus: string = "3";
  public splitfilesSearchText: string = "";
  public splitfileselectedSearchBy: string = "Filename";
  public splitfileselectedDivisionCode: string = "All";

  //Allunmatchedclaims tab - all unmatched claim details
  public alluclaimsfilter: boolean = false;
  public alluclaimsSearchText: string = "";
  public alluclaimsSearchBy: string = "";
  public allusendemailfilter: string = "All";

  //Allunmatchedplbs tab - all unmatched plb details
  public alluplbsfilter: boolean = false;
  public alluplbsSearchText: string = "";
  public alluplbsSearchBy: string = "";

  //Master Files Unprocess Data
  public masterfileunprocessfilter: boolean = false;
  public masterfileunprocessSelectedClientID: string = "0";
  public masterfileunprocessstartDate: any;
  public masterfileunprocessendDate: any;
  public masterfileunprocessselectedStatus: string = "2";
  public masterfileunprocesssSearchText: string = "";

  constructor() {}

  //File Data - file summary tab
  setfiledatafilter(
    clientid: string,
    startdate: any,
    enddate: any,
    status: string,
    searchby: string,
    searchtext: string
  ) {
    this.filedatafilter = true;
    this.filedataSelectedClientID = clientid;
    this.filedatastartDate = startdate;
    this.filedataendDate = enddate;
    this.filedataselectedStatus = status;
    this.filedataselectedSearchby = searchby;
    this.filedatasSearchText = searchtext;
  }

  clearfiledatafilter() {
    this.filedatafilter = false;
    this.filedataSelectedClientID = "0";
    this.filedatastartDate = "";
    this.filedataendDate = "";
    this.filedataselectedStatus = "3";
    this.filedatasSearchText = "";
    this.filedataselectedSearchby = "Filename";
  }

  getfiledataSelectedClientID() {
    return this.filedataSelectedClientID;
  }

  getfiledatastartDate() {
    return this.filedatastartDate;
  }

  getfiledataendDate() {
    return this.filedataendDate;
  }

  getfiledataselectedStatus() {
    return this.filedataselectedStatus;
  }

  getfiledataselectedSearchby() {
    return this.filedataselectedSearchby;
  }

  getfiledatasSearchText() {
    return this.filedatasSearchText;
  }

  //File Data - check summary tab
  setcheckfilter(searchtext: string, searchby: string) {
    this.checkdatafilter = true;
    this.checksSearchText = searchtext;
    this.checksSearchBy = searchby;
  }

  clearcheckfilter() {
    this.checkdatafilter = false;
    this.checksSearchText = "";
    this.checksSearchBy = "Check";
  }

  getchecksSearchText() {
    return this.checksSearchText;
  }

  getchecksSearchBy() {
    return this.checksSearchBy;
  }

  //File Data - claim summary tab
  setclaimfilter(searchtext: string) {
    this.claimdatafilter = true;
    this.claimsSearchText = searchtext;
  }

  clearclaimfilter() {
    this.claimdatafilter = false;
    this.claimsSearchText = "";
  }

  getclaimsSearchText() {
    return this.claimsSearchText;
  }

  //File Data - split file tab
  setsplitfiledatafilter(
    subclientid: string,
    status: string,
    searchby: string,
    searchtext: string,
    divisioncode: string
  ) {
    this.splitfiledatafilter = true;
    this.splitfiledataSelectedSubclientID = subclientid;
    this.splitfiledataselectedStatus = status;
    this.splitfiledataselectedSearchBy = searchby;
    this.splitfiledatasSearchText = searchtext;
    this.splitfiledataselectedDivisionCode = divisioncode;
  }

  clearsplitfiledatafilter() {
    this.splitfiledataSelectedSubclientID = "0";
    this.splitfiledataselectedStatus = "3";
    this.splitfiledatasSearchText = "";
    this.splitfiledataselectedSearchBy = "Filename";
    this.splitfiledataselectedDivisionCode = "All";
  }

  getsplitfiledataSelectedSubclientID() {
    return this.splitfiledataSelectedSubclientID;
  }

  getsplitfiledataselectedStatus() {
    return this.splitfiledataselectedStatus;
  }

  getsplitfiledataselectedSearchBy() {
    return this.splitfiledataselectedSearchBy;
  }

  getsplitfiledatasSearchText() {
    return this.splitfiledatasSearchText;
  }

  getsplitfiledatasDivisionCode() {
    return this.splitfiledataselectedDivisionCode;
  }

  //File Data - split check summary tab
  setsplitcheckfilter(searchtext: string, searchby: string) {
    this.splitcheckdatafilter = true;
    this.splitchecksSearchText = searchtext;
    this.splitchecksSearchBy = searchby;
  }

  clearsplitcheckfilter() {
    this.splitcheckdatafilter = false;
    this.splitchecksSearchText = "";
    this.splitchecksSearchBy = "Check";
  }

  getsplitchecksSearchText() {
    return this.splitchecksSearchText;
  }

  getsplitchecksSearchBy() {
    return this.splitchecksSearchBy;
  }

  //File Data - split claim summary tab
  setsplitclaimfilter(searchtext: string) {
    this.splitclaimdatafilter = true;
    this.splitclaimsSearchText = searchtext;
  }

  clearsplitclaimfilter() {
    this.splitclaimdatafilter = false;
    this.splitclaimsSearchText = "";
  }

  getsplitclaimsSearchText() {
    return this.splitclaimsSearchText;
  }

  //File tab
  setfilefilter(
    clientid: string,
    startdate: any,
    enddate: any,
    status: string,
    searchby: string,
    searchtext: string
  ) {
    this.filefilter = true;
    this.fileSelectedClientID = clientid;
    this.filestartDate = startdate;
    this.fileendDate = enddate;
    this.fileselectedStatus = status;
    this.fileselectedSearchBy = searchby;
    this.filesSearchText = searchtext;
  }

  clearfilefilter() {
    this.filefilter = false;
    this.fileSelectedClientID = "0";
    this.filestartDate = "";
    this.fileendDate = "";
    this.fileselectedStatus = "3";
    this.filesSearchText = "";
    this.fileselectedSearchBy = "Filename";
  }

  getfileSelectedClientID() {
    return this.fileSelectedClientID;
  }

  getfilestartDate() {
    return this.filestartDate;
  }

  getfileendDate() {
    return this.fileendDate;
  }

  getfileselectedStatus() {
    return this.fileselectedStatus;
  }

  getfileselectedSearchBy() {
    return this.fileselectedSearchBy;
  }

  getfilesSearchText() {
    return this.filesSearchText;
  }

  //File tab - payer details
  setpayerfilter(searchtext: string, searchby: string) {
    this.payerfilter = true;
    this.payersSearchText = searchtext;
    this.payersSearchBy = searchby;
  }

  clearpayerfilter() {
    this.payerfilter = false;
    this.payersSearchText = "";
    this.payersSearchBy = "Check";
  }

  getpayersSearchText() {
    return this.payersSearchText;
  }

  getpayersSearchBy() {
    return this.payersSearchBy;
  }

  //File tab - unmatched claims details
  setuclaimsfilter(
    searchtext: string,
    searchby: string,
    sendemailfilter: string
  ) {
    this.uclaimsfilter = true;
    this.uclaimsSearchText = searchtext;
    this.uclaimsSearchBy = searchby;
    this.usendemailfilter = sendemailfilter;
  }

  clearuclaimsilter() {
    this.uclaimsfilter = false;
    this.uclaimsSearchText = "";
    this.uclaimsSearchBy = "Claim";
    this.usendemailfilter = "All";
  }

  getuclaimssSearchText() {
    return this.uclaimsSearchText;
  }

  getuclaimssSearchBy() {
    return this.uclaimsSearchBy;
  }

  getusendemailfilter() {
    return this.usendemailfilter;
  }

  //Allunmatchedplbs tab - all unmatched plb details
  setalluplbsfilter(searchtext: string, searchby: string) {
    this.alluplbsfilter = true;
    this.alluplbsSearchText = searchtext;
    this.alluplbsSearchBy = searchby;
  }

  clearalluplbsilter() {
    this.alluplbsfilter = false;
    this.alluplbsSearchText = "";
    this.alluplbsSearchBy = "Filename";
  }

  getalluplbssSearchText() {
    return this.alluplbsSearchText;
  }

  getalluplbssSearchBy() {
    return this.alluplbsSearchBy;
  }

  //Allunmatchedclaims tab - all unmatched claim details
  setalluclaimsfilter(
    searchtext: string,
    searchby: string,
    sendemailfilter: string
  ) {
    this.alluclaimsfilter = true;
    this.alluclaimsSearchText = searchtext;
    this.alluclaimsSearchBy = searchby;
    this.allusendemailfilter = sendemailfilter;
  }

  clearalluclaimsilter() {
    this.alluclaimsfilter = false;
    this.alluclaimsSearchText = "";
    this.alluclaimsSearchBy = "Filename";
    this.allusendemailfilter = "All";
  }

  getalluclaimssSearchText() {
    return this.alluclaimsSearchText;
  }

  getalluclaimssSearchBy() {
    return this.alluclaimsSearchBy;
  }

  getallusendemailfilter() {
    return this.allusendemailfilter;
  }

  //File tab - split files
  setsplitfilefilter(
    subclientid: string,
    status: string,
    searchby: string,
    searchtext: string,
    divisioncode: string
  ) {
    this.splitfilefilter = true;
    this.splitfileSelectedSubclientID = subclientid;
    this.splitfileselectedStatus = status;
    this.splitfileselectedSearchBy = searchby;
    this.splitfilesSearchText = searchtext;
    this.splitfileselectedDivisionCode = divisioncode;
  }

  clearsplitfilefilter() {
    this.splitfileSelectedSubclientID = "0";
    this.splitfileselectedStatus = "3";
    this.splitfileselectedSearchBy = "Filename";
    this.splitfilesSearchText = "";
    this.splitfileselectedDivisionCode = "All";
  }

  getsplitfileSelectedSubclientID() {
    return this.splitfileSelectedSubclientID;
  }

  getsplitfileselectedStatus() {
    return this.splitfileselectedStatus;
  }

  getsplitfileselectedSearchBy() {
    return this.splitfileselectedSearchBy;
  }

  getsplitfilesSearchText() {
    return this.splitfilesSearchText;
  }

  getsplitfilesSelectedDivisionCode() {
    return this.splitfileselectedDivisionCode;
  }

  //Master Files Unprocess Data
  setmasterfileunprocessfilter(
    clientid: string,
    startdate: any,
    enddate: any,
    status: string,
    searchtext: string
  ) {
    this.masterfileunprocessfilter = true;
    this.masterfileunprocessSelectedClientID = clientid;
    this.masterfileunprocessstartDate = startdate;
    this.masterfileunprocessendDate = enddate;
    this.masterfileunprocessselectedStatus = status;
    this.masterfileunprocesssSearchText = searchtext;
  }

  clearmasterfileunprocessfilter() {
    this.masterfileunprocessfilter = false;
    this.masterfileunprocessSelectedClientID = "0";
    this.masterfileunprocessstartDate = "";
    this.masterfileunprocessendDate = "";
    this.masterfileunprocessselectedStatus = "2";
    this.masterfileunprocesssSearchText = "";
  }
}
