import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { FileDetailsService } from "src/app/Services/file-details.service";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { DatePipe } from "@angular/common";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Client } from "src/app/Model/client";
import { Subclient } from "src/app/Model/subclient";
import { FormBuilder, Validators } from "@angular/forms";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "../../../../node_modules/subsink";
import { Api } from "src/app/Services/api";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { isNullOrUndefined } from "util";
import { clsPermission } from "./../../Services/settings/clspermission";
import { parseNumber } from "@progress/kendo-angular-intl";
declare var $: any;
import { EobreportComponent } from "../eobreport/eobreport.component";
import { Observable } from "rxjs";
import { Workbook } from "@progress/kendo-angular-excel-export";
import { SelectsubclientComponent } from "../selectsubclient/selectsubclient.component";
import { ManuallymatchedclaimhistoryComponent } from "./manuallymatchedclaimhistory.component";

@Component({
  selector: 'app-manuallyunmatchedclaimdetails',
  templateUrl: './manuallyunmatchedclaimdetails.component.html',
  styleUrls: ['./manuallyunmatchedclaimdetails.component.css']
})
export class ManuallyunmatchedclaimdetailsComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private filedetailService: FileDetailsService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    public api: Api,
    private dataService: DatatransaferService
  ) {
    this.clsUtility = new Utility(toastr);
    this.SplitFilesPageSize = this.clsUtility.pagesize;   
    this.allData = this.allData.bind(this);
  }
    
  private clsUtility: Utility;
  private subscription = new SubSink();
  loading = false;
  loadingSplitFilesGrid = true;
  neraMasterFileid: any = "0"; 
  public sSelectedClientID: string = "0";
  public sSelectedDivisionID: string = "All";   
  public SplitFilesGridView: GridDataResult;
  private SplitFilesItems: any[] = [];
  public SplitFilesResponse: any[] = [];
  public SplitFilesSkip = 0;
  public SplitFilesPageSize = 0;
  public sSubClients: any;
  public SelectAllSubClients: any;
  public sSelectedSubClientCode: any = "0";
  public SplitFilesdisplaytotalrecordscount: number = 0; 
  
  public sSearchText: string = "";
  public disabledclient: boolean = false;
  public disableddivision: boolean = false;
  public disabledsubclient: boolean = false;
  public disabledsplitstatus: boolean = false;
  public disabledsplitsearch: boolean = false;
  public disabledstartdate: boolean = false;
  public disabledenddate: boolean = false;
  public disabledapplybtn: boolean = false;
  public disabledclearbtn: boolean = false;
  public disabledusers: boolean = false;

  public clsPermission: clsPermission; 
  public startDate: Date = new Date();
  public endDate: Date = new Date();
  public currentuserid: string = "0";    
  public disabledsearchBy: boolean = false;
  
  public sAllClients: any;
  public sAllDivision: any;
  public SelectAllClients: any;
  public SelectAllDivision: any;
  private bOninit = false;
  public sAllmappedusers: any;
  public SelectAllmappedusers: any;
  public sSelectedmappeduserid: string = "0";
  public sDivisionalSplitSearchBy: any = [  
    { value: "Check", text: "Check" }, 
    { value: "Claim", text: "Claim" },  
    { value: "Filename", text: "Filename" },
    { value: "Practice Filename", text: "Practice Filename" }
  ];
  public sSelectedDivisionalSplitSearchBy: string = "Check";  
  public sortSplit: SortDescriptor[] = [
    {
      field: "matcheddate",
      dir: "desc",
    },
  ];

  @ViewChild("EobreportChild")
  private EobreportChild: EobreportComponent;
  public inputmastererafileid: any;
  public inputtsid: any;
  public inputclpid: any;
  public inputsplitfileid: any;
  public inputcomponentname: any = "Manually Matched Claim";
  public emailloading = false;
  public exportFilename: string =
    "ManuallyMatchedClaimsList_" + this.datePipe.transform(new Date(), "MMddyyyy");
  public ExportExcelDownloadConfirmationMessage: any;
  public mySelection: any[] = [];
  public selectedCallback = (args) => args.dataItem.clpid;

  public Inputclientid: any;
  public InputGenerateUnmatchedClaim: any;
  @ViewChild("SelectsubclientChild")
  private SelectsubclientChild: SelectsubclientComponent;
  public InputAllClaimno: string = "";
  public Inputcomponent: string = "ManuallyMatchedClaims";

  public InputhMastererafileid: any;
  public InputhTs835id: any;
  @ViewChild("SelecthistoryChild")
  private SelecthistoryChild: ManuallymatchedclaimhistoryComponent;
  public InputhClpid: any;
  public InputClaimnumber: any;
  public InputChecknumber: any;   
  public Inputsubclientid: any
  public DownloadConfirmationMessage: any;
  public opened = false;

  DropDownGroup = this.fb.group({
    fcClientName: [""],
    fcSubClientName: [""],
    fcSplitSearch: [""],
    fcSplitStatus: [""],
    fcDivisionalSplitSearchBy: ["", Validators.required],   
    fcmappedusers: [""],
  });

  get ClientName() {
    return this.DropDownGroup.get("fcClientName");
  }

  get SubClientName() {
    return this.DropDownGroup.get("fcSubClientName");
  }

  get fbcSplitFilterSearch() {
    return this.DropDownGroup.get("fcSplitSearch");
  }

  get DivisionalSplitSearchBy() {
    return this.DropDownGroup.get("fcDivisionalSplitSearchBy");
  }
 
  get MappedUsers() {
    return this.DropDownGroup.get("fcmappedusers");
  }

  ngOnInit() {
    try {  
      this.bOninit = true;
      this.startDate.setMonth(this.startDate.getMonth() - 3);
      this.currentuserid = this.dataService.SelectedUserid;

      this.dataService.newpermission.subscribe(
        (value) => (this.clsPermission = value)
      );

      this.SplitFilesdisplaytotalrecordscount = 0;
      this.loadingSplitFilesGrid = true;
      this.Enabledisablebtn(true);
      this.RetriveAllClient();  
   
      this.api.insertActivityLog(
        "Manually Matched Claim List Viewed",
        "Manually Matched Claim",
        "READ",
        "0"
      );
        
    } catch (error) {
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  RetriveAllClient() {
    try {
      let getclient: {
        clientid: string;
        clientstatus: boolean;
        v_userid: string;
      } = {
        clientid: "0",
        clientstatus: true,
        v_userid: this.currentuserid,
      };
      let seq = this.api.post("GetClient", getclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.sAllClients = res;
            if (
              !isNullOrUndefined(this.sAllClients) &&
              this.sAllClients.length > 0
            ) { 
              if(this.sAllClients.length == 1)          {
                this.SelectAllClients = this.sAllClients;
                this.sSelectedClientID = this.sAllClients[0].clientid;
                this.RetriveSubClient();
              } else {
                const Allclt = new Client();
                Allclt.clientid = "0";
                Allclt.clientcode = "";
                Allclt.clientname = "All";
                this.sAllClients.unshift(Allclt);
                this.SelectAllClients = this.sAllClients;
                this.sSelectedClientID = "0";
                this.RetriveSubClient();          
              }                
            } else {
              this.sAllClients = [];            
              this.bOninit = false;           
              this.SplitFilesResponse = [];
              this.SplitFilesItems = [];
              this.loading = false;
              this.loadingSplitFilesGrid = false;
              this.neraMasterFileid = "0";           
              this.clsUtility.showInfo("No group is active");
            }
          },
          (err) => {
            this.loading = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  RetriveAllDivision(client: string = "0") {
    try {
      class division {
        subclientdivisioncode: string;
      }
      let getdivision: { clientid: string; v_userid: string } = {
        clientid: client,
        v_userid: this.currentuserid,
      };
      let seq = this.api.post("GetDivisionCode", getdivision);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.sAllDivision = res;
            if (
              !isNullOrUndefined(this.sAllDivision) &&
              this.sAllDivision.length > 0
            ) {             
              const Alldiv = new division();
              Alldiv.subclientdivisioncode = "All";
              this.sAllDivision.unshift(Alldiv);
              this.SelectAllDivision = this.sAllDivision;
              this.sSelectedDivisionID = "All";              
              this.RetriveSubClient();
            } else {
              this.sAllDivision = [];
              this.Enabledisablebtn(true);
              this.bOninit = false;             
              this.SplitFilesResponse = [];
              this.SplitFilesItems = [];
              this.loading = false;
              this.loadingSplitFilesGrid = false;
              this.neraMasterFileid = "0";
              this.clsUtility.showInfo("No Divisioncode/Practice is available");
            }
          },
          (err) => {
            this.loading = false;
            this.loadingSplitFilesGrid = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  RetriveSubClient() {
    try {
      let getsubclient: {
        userid: string;
        status: boolean;
        v_clientid: string;
        v_divisioncode: string;
      } = {
        userid: this.currentuserid,
        status: true,
        v_clientid: this.sSelectedClientID,
        v_divisioncode: this.sSelectedDivisionID,
      };
      let seq = this.api.post("SubClient/GetSubClientByUserId", getsubclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.sSubClients = res;
            if (
              !isNullOrUndefined(this.sSubClients) &&
              this.sSubClients.length > 0
            ) {
              if(this.sSubClients.length == 1){                
                this.SelectAllSubClients = this.sSubClients;
                this.sSelectedSubClientCode = this.sSubClients[0].subclientid;
              } else {
                const Subclt = new Subclient();
                Subclt.subclientid = "0";
                Subclt.subclientcode = "0";
                Subclt.subclientname = "All";
                this.sSubClients.unshift(Subclt);
                this.SelectAllSubClients = this.sSubClients;
                this.sSelectedSubClientCode = "0";
              }              
              this.Retrivemappedusers();  
            } else {              
              this.sSubClients = [];
              const Subclt = new Subclient();
              Subclt.subclientid = "0";
              Subclt.subclientcode = "0";
              Subclt.subclientname = "All";
              this.sSubClients.unshift(Subclt);
              this.sSelectedSubClientCode = "0";             
              this.sAllmappedusers = [];             
              const user: {userid: any, username: any}=
              {
                userid: '0',
                username: 'All'
              };              
              this.sAllmappedusers.unshift(user);
              this.sSelectedmappeduserid = "0";
              this.SelectAllmappedusers = []; 
              this.SelectAllSubClients = [];
              this.loading = false;
              this.loadingSplitFilesGrid = false;             
              this.bOninit = false;                         
              this.neraMasterFileid = "0";     
              this.Enabledisablebtn(false);
              this.clsUtility.showInfo("No practice is active");
            }
          },
          (err) => {
            this.loading = false;
            this.loadingSplitFilesGrid = false;
            this.clsUtility.LogError(err);
            this.bOninit = false;
          }
        )
      );
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
      this.bOninit = false;
    }
  }

  RetriveSplitFiles() {
    this.SplitFilesGridView = null;
    this.SplitFilesItems = [];
    try {
      this.subscription.add(
        this.filedetailService
          .getmanuallyunmatchedclaims(
            this.sSelectedClientID,
            this.sSelectedSubClientCode,
            this.currentuserid,
            this.sSelectedmappeduserid,
            this.sSearchText,
            this.datePipe.transform(this.startDate, "yyyyMMdd"),
            this.datePipe.transform(this.endDate, "yyyyMMdd"),           
            this.sSelectedDivisionalSplitSearchBy,
            this.SplitFilesSkip,
            this.SplitFilesPageSize  
          )
          .subscribe(
            (data) => {
              if (
                !isNullOrUndefined(data) &&
                !isNullOrUndefined(data.content)
              ) {
                this.SplitFilesResponse = data;
                this.SplitFilesItems = data.content;
                console.log(this.SplitFilesResponse);
                if (this.SplitFilesItems != null) {
                  if (this.SplitFilesItems.length > 0) {
                    this.SplitFilesdisplaytotalrecordscount = this.SplitFilesResponse[
                      "totalelements"
                    ];

                    this.SplitFilesItems.map((obj) => {
                      obj["checkamt"] = parseNumber(
                        !isNullOrUndefined(obj["checkamt"])
                          ? obj["checkamt"].replace("$", "").replace(",", "")
                          : "$0.00"
                      );
                    });

                    this.loadItemsSplit();
                    this.loadingSplitFilesGrid = false;
                    this.loading = false;
                    
                    this.Enabledisablebtn(false);
                  } else {
                    this.SplitFilesItems = [];
                    this.loading = false;
                    this.SplitFilesdisplaytotalrecordscount = 0;
                    this.loadingSplitFilesGrid = false;
                    this.Enabledisablebtn(false);
                  }
                } else {
                  this.loading = false;
                  this.SplitFilesdisplaytotalrecordscount = 0;
                  this.loadingSplitFilesGrid = false;
                  this.Enabledisablebtn(false);
                }
              } else {
                this.loading = false;
                this.loadingSplitFilesGrid = false;
                this.Enabledisablebtn(false);
              }
            },
            (err) => {
              this.loading = false;
              this.SplitFilesdisplaytotalrecordscount = 0;
              this.loadingSplitFilesGrid = false;
              this.Enabledisablebtn(false);
            }
          )
      );
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
      this.Enabledisablebtn(false);
    }
  }

  private loadItemsSplit(): void {
    this.SplitFilesGridView = null;
    try {
      if (!isNullOrUndefined(this.SplitFilesItems)) {
        if (this.SplitFilesItems.length > 0) {
          this.SplitFilesGridView = {
            data: orderBy(this.SplitFilesItems, this.sortSplit),
            total: this.SplitFilesResponse["totalelements"],
          };
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  Enabledisablebtn(status: boolean = false, callfrom: string = "All") {
    try {      
        this.disabledclient = status;
        this.disableddivision = status;
        this.disabledsubclient = status;
        this.disabledstartdate = status;
        this.disabledenddate = status;
        this.disabledsplitsearch = status;
        this.disabledapplybtn = status;
        this.disabledclearbtn = status;
        this.disabledsearchBy = status;
        this.disabledusers = status;      
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onClientChange(event: any) {
    try {
      if (this.ClientName.value == undefined || this.ClientName.value == "") {
        this.toastr.warning("Please Select Group");
      } else {       
        this.sSelectedClientID = event;
        this.sSelectedSubClientCode = '0';
        this.sSelectedmappeduserid = "0"; 
       
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = true;        
        this.Enabledisablebtn(true);

        this.SplitFilesGridView = null;
        this.SplitFilesItems = [];
        this.SplitFilesResponse = [];
        this.loadItemsSplit();

        this.RetriveSubClient();
        // this.applySplitFilters();
        // this.Retrivemappedusers();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleClientFilter(value) {
    this.sAllClients = this.SelectAllClients.filter(
      (s) => s.clientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  onSubClientChange(event: any) {
    try {
      this.sSelectedSubClientCode = event;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleSubclientFilter(value) {
    this.sSubClients = this.SelectAllSubClients.filter(
      (s) => s.subclientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }
  
  onMappeduserChange(event: any) {
    try {
      this.sSelectedmappeduserid = event;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleMappeduserFilter(value) {
    this.sAllmappedusers = this.SelectAllmappedusers.filter(
      (s) => s.username.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  Retrivemappedusers(){
    try {
      this.subscription.add(
        this.filedetailService
          .getMappedUserList(this.currentuserid, this.sSelectedClientID)
          .subscribe(
            (data) => {              
              this.sAllmappedusers = data;
              if (
                !isNullOrUndefined(this.sAllmappedusers) &&
                this.sAllmappedusers.length > 0
              ) { 
                if(this.sAllmappedusers.length == 1){                               
                  this.SelectAllmappedusers = this.sAllmappedusers;
                  this.sSelectedmappeduserid = this.sAllmappedusers[0].userid;   
                } else {
                  const user: {userid: any, username: any}=
                  {
                    userid: '0',
                    username: 'All'
                  };              
                  this.sAllmappedusers.unshift(user);
                  this.SelectAllmappedusers = this.sAllmappedusers;
                  this.sSelectedmappeduserid = "0";   
                }               
                  this.RetriveSplitFiles();
                  this.Enabledisablebtn(true);
              } else {
                this.sAllmappedusers = [];
                const user: {userid: any, username: any}=
                {
                  userid: '0',
                  username: 'All'
                };              
                this.sAllmappedusers.unshift(user);
                this.sSelectedmappeduserid = "0";
                this.SelectAllmappedusers = [];   
                this.SplitFilesResponse = [];
                this.SplitFilesItems = [];
                this.loading = false;
                this.loadingSplitFilesGrid = false;
                this.neraMasterFileid = "0";   
                this.Enabledisablebtn(false);               
                this.clsUtility.showInfo("No user is present");
              }
            },
            (err) => {
              this.loading = false;
              this.clsUtility.LogError(err);
            }
          )
      );
    } catch (error) {   
      this.clsUtility.LogError(error);   
    }
  }

  public onDateChange(value: Date, date: string): void {
    try {
      if (value != null) {
        if (date == "start date" && value > this.endDate) {
          this.clsUtility.showWarning("Start date must be less than end date");
          this.startDate = new Date();
        } else if (date == "end date" && value < this.startDate) {
          this.clsUtility.showWarning(
            "End date must be greater than start date"
          );
          this.endDate = new Date();
        }
      } else {
        if (date == "start date") {
          this.startDate = new Date();
        } else if (date == "end date") {
          this.endDate = new Date();
        }
        this.clsUtility.LogError("Select valid date");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeSplit(event: PageChangeEvent): void {
    try {
      this.loadingSplitFilesGrid = true;
      this.SplitFilesGridView = null;
      this.SplitFilesSkip = event.skip;   
      
      this.RetriveSplitFiles();
    } catch (error) {
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  sortSplitChange(sort: SortDescriptor[]): void {
    try {
      this.sortSplit = sort;
      this.loadItemsSplit();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  applySplitFilters(){
    try {
      this.mySelection = [];
      if (
        this.fbcSplitFilterSearch.value != null &&
        this.fbcSplitFilterSearch.value != undefined
      ) {
        this.sSearchText = "";
        this.sSearchText = this.fbcSplitFilterSearch.value.trim();
      } else {
        this.sSearchText = "";
        this.sSearchText = this.fbcSplitFilterSearch.value.trim();
      }

      if (
        this.sSelectedSubClientCode != null &&
        this.sSelectedSubClientCode != undefined &&
        this.sSearchText != null &&
        this.sSearchText != undefined
      ) {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = true;        
        this.Enabledisablebtn(true);
        this.RetriveSplitFiles();
      } else {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = false;
        this.SplitFilesResponse = [];
      }
    } catch (error) {
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  clearSplitFilters() {
    try {
      this.sSelectedClientID = "0";    
      this.sSelectedSubClientCode = "0";
      this.sSelectedmappeduserid = "0";
      this.sSearchText = "";
      this.sSelectedDivisionalSplitSearchBy = "Check";
      this.fbcSplitFilterSearch.setValue(this.sSearchText);
      this.startDate = new Date();
      this.startDate.setMonth(this.startDate.getMonth() - 3);
      this.endDate = new Date();

      this.SplitFilesSkip = 0;
      this.SplitFilesdisplaytotalrecordscount = 0;
      this.loadingSplitFilesGrid = true; 
      this.Enabledisablebtn(true);
      this.bOninit = true;
      this.mySelection = [];
      this.RetriveAllClient();
      // this.Retrivemappedusers();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnDestroy() {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onViewEOBClick(record: any) {
    try {
      this.inputmastererafileid = record.fileid;
      this.inputtsid = record.ts835id;
      this.inputclpid = record.clpid;     
      this.inputsplitfileid = 0;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputResult($event) {
    try {
      let IsSaved = $event;

      if (IsSaved == true) {
        this.inputmastererafileid = 0;
        this.inputtsid = 0;
        this.inputclpid = 0;
        this.inputsplitfileid = 0;
        this.InputClaimnumber = "0";
        this.InputChecknumber = "0";
        this.EobreportChild.ResetComponents();
        $("#viewEOBReportModal").modal("hide");
      } else {
        this.inputmastererafileid = 0;
        this.inputtsid = 0;
        this.inputclpid = 0;
        this.inputsplitfileid = 0;
        this.InputClaimnumber = "0";
        this.InputChecknumber = "0";
        this.EobreportChild.ResetComponents();
        $("#viewEOBReportModal").modal("hide");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onDivisionalSplitSearchByChange(event: any) {
    try {
      this.sSelectedDivisionalSplitSearchBy = event;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public allData = (): Observable<any> => {
    try {
      this.emailloading = true;

      let para: {
        clientid: any,
        subclientid: any,
        userid: any,
        mappeduserid: any,
        searchtext: any,
        startdate: any,
        enddate: any,
        searchby: any
      } = {
        clientid: this.sSelectedClientID,
        subclientid: this.sSelectedSubClientCode,
        userid: this.currentuserid,
        mappeduserid: this.sSelectedmappeduserid,
        searchtext: this.sSearchText,
        startdate:  this.datePipe.transform(this.startDate, "yyyyMMdd"),
        enddate:  this.datePipe.transform(this.endDate, "yyyyMMdd"),
        searchby:  this.sSelectedDivisionalSplitSearchBy
      };
      
      if (this.SplitFilesdisplaytotalrecordscount != 0) {
        var result = this.filedetailService.exporttoexceldata("api/Files/getManuallyMatchedClaimDetails", para, this.SplitFilesdisplaytotalrecordscount);
        return result;
      } else {
        this.clsUtility.showInfo("No records available for export");
        this.emailloading = false;
        return Observable.empty();
      }
    } catch (error) {
      this.emailloading = false;
      this.clsUtility.showError(error);
    }
  };

  onClaimExcelExportClick() {
    try {
      if (this.SplitFilesdisplaytotalrecordscount > 0) {
        this.ExportExcelDownloadConfirmationMessage =
          this.SplitFilesdisplaytotalrecordscount +
          " records will be Exported, Do you want to continue ?";
        $("#ExportExcelClaimconfirmationModal").modal("show");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onExportExcelCloseConfirmationClick() {
    try {
      $("#ExportExcelClaimconfirmationModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onExportExcelYesConfirmationClick() {
    try {
      this.ClickExportExcel();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public ClickExportExcel() {
    try {
      document.getElementById("hbtnExportExcel").click();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onExcelExport(args: any): void {
    try {
      this.emailloading = true;
      args.preventDefault();
      const workbook = args.workbook;

      new Workbook(workbook).toDataURL().then((dataUrl: string) => {
        saveAs(dataUrl, this.exportFilename + ".xlsx");
        this.api.insertActivityLog(
          "Manually Matched Claim exported excel",
          "Manually Matched Claim",
          "READ"
        );
        this.emailloading = false;
      });
    } catch (error) {
      this.clsUtility.showError(error);
    }
  }

  public onSelectedKeysChange(e) {
    try {
      const len = this.mySelection.length;           
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public onSelectSuclientClick() {
    try {      
      // this.matchedtopractice = true;
      const len = this.mySelection.length;

      let allrecordslist: {
        recordslist: any;
      } = { recordslist: [] };

      if (!isNullOrUndefined(this.mySelection) && this.mySelection != []) {
        for (let index = 0; index < this.mySelection.length; index++) {         
          let GenerateUnmatchedClaim: {
            tsid: string;
            clpid: string;
            masterfileid: string;
            clientid: string;
            subclientid: string;
            subclientcode: string;
            userid: string;
            username: string;
            claimnumber: string;
          } = {
            tsid: "",
            clpid: "",
            masterfileid: "",
            clientid: "",
            subclientid: "",
            subclientcode: "",
            userid: "",
            username: "",
            claimnumber: ""
          };

          if (
            this.SplitFilesItems.find(
              (x) => x.clpid == this.mySelection[index]
            )
          ) {
            let SelectedClaimindex = this.SplitFilesItems.findIndex(
              (x) => x.clpid == this.mySelection[index]
            );
            this.Inputclientid = this.sSelectedClientID;
            // this.Inputclientid = this.UnmatchedClaimsItems[
            //   SelectedClaimindex
            // ].clientid;

            GenerateUnmatchedClaim.tsid = this.SplitFilesItems[
              SelectedClaimindex
            ].ts835id;
            GenerateUnmatchedClaim.clpid = this.SplitFilesItems[
              SelectedClaimindex
            ].clpid;
            GenerateUnmatchedClaim.masterfileid = this.SplitFilesItems[
              SelectedClaimindex
            ].fileid;
            GenerateUnmatchedClaim.clientid = this.SplitFilesItems[
              SelectedClaimindex
            ].clientid;
            GenerateUnmatchedClaim.userid = this.dataService.SelectedUserid;
            GenerateUnmatchedClaim.username = this.dataService.loginName[
              "_value"
            ];
            GenerateUnmatchedClaim.claimnumber = this.SplitFilesItems[SelectedClaimindex].claimnumber;

            allrecordslist.recordslist.push(GenerateUnmatchedClaim);
            if (this.InputAllClaimno.length > 0) {
              this.InputAllClaimno =
                this.InputAllClaimno +
                "," +
                this.SplitFilesItems[SelectedClaimindex].claimnumber;
            } else {
              this.InputAllClaimno = this.SplitFilesItems[
                SelectedClaimindex
              ].claimnumber;
            }
            // console.log(this.InputAllClaimno);
          }
        }        
        this.InputGenerateUnmatchedClaim = allrecordslist;
      }

      $("#selectsubclientModal").modal("show");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputSelectSubclientResult($event) {
    try {      
      this.mySelection = [];
      // this.myremove = [];
      // this.recordselectioncount = 0;
      // this.selectallflag = false;
      // this.selectAllState = "unchecked";
      this.Inputclientid = null;
      this.SelectsubclientChild.ResetComponents();
      if ($event == true) {
        this.SplitFilesSkip = 0;
        this.RetriveSplitFiles();       
      }     
      $("#selectsubclientModal").modal("hide");     
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputSelectHistoryResult($event) {
    try { 
      console.log("OutputSelectHistoryResult : ", $event)  ;
      this.InputhMastererafileid = null;
      this.InputhTs835id = null;
      this.InputhClpid = null;
      this.InputClaimnumber = null;
      this.InputChecknumber = null;     
      this.SelecthistoryChild.ResetComponents();      
      $("#historyInfoModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onhistoryinfoclick(record: any){
    try {      
      this.InputhMastererafileid = record.fileid;
      this.InputhTs835id = record.ts835id;
      this.InputhClpid = record.clpid; 
      this.InputClaimnumber = record.claimnumber;
      this.InputChecknumber = record.checknumber;          
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onrematchedclick(){
    try {
      if (this.mySelection != null) {
        if (this.mySelection.length > 0) {  
          if(this.mySelection.length > 1 )       {
            this.DownloadConfirmationMessage =
            "Do you want to re-matched all " +
            this.mySelection.length +
            " claims ?";
          } else {
            this.DownloadConfirmationMessage =
            "Do you want to re-matched claim ?";
          }
          this.open();
          // $("#rematchedconfirmationModal").modal("show");
          } 
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onselectedCloseConfirmationClick(){
    try {
      this.close(false);
      // $("#rematchedconfirmationModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onselectedYesConfirmationClick(){
    try {
      this.close(false);
      // $("#rematchedconfirmationModal").modal("hide");
      this.onSelectSuclientClick();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public close(status) {
    try {   
      if(status == 'Yes'){
        this.opened = false;
        this.onSelectSuclientClick();
      } else {
        this.opened = false;
      }      
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public open() {
    try {   
      this.opened = true;
    } catch (error) {
      this.clsUtility.LogError(error);
    }   
  }
}
