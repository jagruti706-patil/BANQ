import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { DatePipe } from "@angular/common";
import {
  SortDescriptor,
  orderBy,
  GroupDescriptor,
  process
} from "@progress/kendo-data-query";
import { FormBuilder, Validators } from "@angular/forms";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { FileDetailsService } from "src/app/Services/file-details.service";
import { SubSink } from "subsink";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Api } from "src/app/Services/api";
import { clsPermission } from "src/app/Services/settings/clspermission";
declare var $: any;
import { EobreportComponent } from '../eobreport/eobreport.component';
import { Subclient } from "src/app/Model/subclient";
import { isNullOrUndefined } from "util";
import { Client } from "src/app/Model/client";
import { SelectsubclientComponent } from "../selectsubclient/selectsubclient.component";
import { ManuallymatchedclaimhistoryComponent } from "../manuallyunmatchedclaimdetails/manuallymatchedclaimhistory.component";

@Component({
  selector: 'app-matchedanypracticetoanyclaim',
  templateUrl: './matchedanypracticetoanyclaim.component.html',
  styleUrls: ['./matchedanypracticetoanyclaim.component.css']
})
export class MatchedanypracticetoanyclaimComponent implements OnInit {

  public clsUtility: Utility;
  public subscription = new SubSink();

  public SplitFilesGridView: GridDataResult;
  private SplitFilesItems: any[] = [];
  private SplitFilesResponse: any[] = [];
  public SplitFilesSkip = 0;
  public SplitFilesPageSize = 0;
  public SplitFilesdisplaytotalrecordscount: number = 0;
  public loadingSplitFilesGrid = false;
  public startDate: Date = new Date();
  public endDate: Date = new Date();
  public sSelectedSearchBy: string = "Check #";
  public disabledsearchBy: boolean = false;
  public sSelectedSplitParameter: string = "";
  public disabledsplitparameter: boolean = false;
  public sSearchText: string = "";

  public EOBReportItems: any[] = [];
  public EOBReportSVC: any[] = [];
  public EOBReportSVCGridView: GridDataResult;
  public EOBReportSVClineSkip = 0;
  public EOBReportSVClinepagesize: number = 50;
  public sclaimno: string = "";
  public clsPermission: clsPermission;
  public claimsearchgroups: GroupDescriptor[] = [];
  public sortMaster: SortDescriptor[] = [
    {
      field: "clientid",
      dir: "asc"
    }
  ];

  public sort: SortDescriptor[] = [
    {
      field: "matcheddate",
      dir: "desc"
    }
  ];

  public ssplitfilesSearchBy: any = [
    { value: "Check #", text: "Check #" },
    { value: "Claim #", text: "Claim #" },   
    // { value: "Master Filename", text: "Master Filename" },    
    { value: "Practice Split File Name", text: "Practice Split File Name" }  
  ];
  // { value: "Divisional Split Filename", text: "Divisional Split Filename" },

  public ssplitparamtername: any = [
    { value: "", text: "All" },
    { value: "Claim Prefix", text: "Claim Prefix" },
    { value: "Claim Suffix", text: "Claim Suffix" },
    { value: "Claim Pattern", text: "Claim Pattern" },
    { value: "RenderingNPI", text: "RenderingNPI" },
    { value: "RenderingName", text: "RenderingName" },
    // { value: "Not Matched", text: "Not Matched" },
    { value: "NA", text: "NA" }
  ];

  public exportfilename: string = "";  
  public echeckno: string = "";
  public eclaimno: string = "";
  public displayreport: boolean = false;
  public disabledbutton: boolean = false;

  @ViewChild("EobreportChild")
  private EobreportChild: EobreportComponent;
  public inputmastererafileid: any;
  public inputtsid: any;
  public inputclpid: any;
  public inputsplitfileid: any;
  public inputcomponentname: any = "Re-Match Claim";

  public sSubClients: any;
  public SelectAllSubClients: any;
  public sSelectedSubClientCode: any = "0";
  public showpracticedropdown: boolean = false;

  public currentuserid: string = "0";    
  public sAllClients: any;
  public SelectAllClients: any;
  public sSelectedClientID: string = "0";
  public mySelection: any[] = [];
  public selectedCallback = (args) => args.dataItem.clpid;
  public DownloadConfirmationMessage: any;
  public opened = false;

  public Inputclientid: any;
  public InputGenerateUnmatchedClaim: any;
  @ViewChild("SelectsubclientChild")
  private SelectsubclientChild: SelectsubclientComponent;
  public InputAllClaimno: string = "";
  public Inputcomponent: string = "Re-Match Claim";
  public disabledsubclient: boolean = false;

  public InputhMastererafileid: any;
  public InputhTs835id: any;
  @ViewChild("SelecthistoryChild")
  private SelecthistoryChild: ManuallymatchedclaimhistoryComponent;
  public InputhClpid: any;
  public InputClaimnumber: any;
  public InputChecknumber: any;   
  public Inputsubclientid: any;
  public Inputcomponentname: any = "Re-Match Claim";
  
  constructor(
    public toastr: ToastrService,
    private filedetailService: FileDetailsService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private dataService: DatatransaferService,
    public api: Api
  ) {
    this.clsUtility = new Utility(toastr);
    this.SplitFilesPageSize = this.clsUtility.pagesize;
  }

  DropDownGroup = this.fb.group({
    fcSearch: [""],
    fcsplitfilesSearchBy: [""],
    fcsplitparamtername: [""],
    fcSubClientName: [""],
    fcClientName: [""]
  });

  get ClientName() {
    return this.DropDownGroup.get("fcClientName");
  }

  get fbcFilterSearch() {
    return this.DropDownGroup.get("fcSearch");
  }

  get SplitFilesSearchBy() {
    return this.DropDownGroup.get("fcsplitfilesSearchBy");
  }

  get SplitParameterName() {
    return this.DropDownGroup.get("fcsplitparamtername");
  }

  get SubClientName() {
    return this.DropDownGroup.get("fcSubClientName");
  }

  ngOnInit() {
    this.dataService.newpermission.subscribe(
      value => (this.clsPermission = value)
    );
    this.currentuserid = this.dataService.SelectedUserid;
    this.startDate.setMonth(this.startDate.getMonth() - 6);
    this.disabledsubclient = true;
    this.RetriveAllClient();
    this.RetriveSubClient();  
    // this.RetriveSplitFilesData();
  }

  ngAfterViewInit() {
    try {
      if (
        this.sSearchText != null &&
        this.sSearchText != undefined &&
        this.sSearchText == ""
      ) {
        setTimeout(() => {
          this.clsUtility.showWarning(
            "Please enter search value to retrieve data"
          );
        }, 0);
      }
    } catch (error) {}
  }

  RetriveSplitFilesData() {
    try {
      this.loadingSplitFilesGrid = true;
      this.subscription.add(
        this.filedetailService
          .getMatchedtAnyPracticeToAnyClaimDataList(
            this.sSelectedClientID,
            this.sSelectedSubClientCode,
            this.currentuserid,
            this.datePipe.transform(this.startDate, "yyyyMMdd"),
            this.datePipe.transform(this.endDate, "yyyyMMdd"),
            this.sSearchText,
            this.sSelectedSearchBy,   
            this.sSelectedSplitParameter,   
            this.SplitFilesSkip,
            this.SplitFilesPageSize
          )
          .subscribe(
            data => {
              if (data != null && data != undefined) {
                this.SplitFilesResponse = data;
                if (
                  this.SplitFilesResponse != null &&
                  this.SplitFilesResponse != undefined
                ) {
                  this.SplitFilesItems = this.SplitFilesResponse["content"];

                  if (
                    this.SplitFilesSkip == 0 &&
                    this.SplitFilesResponse["totalelements"] != 0
                  ) {
                    this.SplitFilesdisplaytotalrecordscount = this.SplitFilesResponse[
                      "totalelements"
                    ];
                  }
                  this.loadItemsSplitFiles();

                  this.api.insertActivityLog(
                    "Re-Match Claim List Viewed",
                    "Re-Match Claim",
                    "READ"
                  );
                }
              }
              this.loadingSplitFilesGrid = false;
            },
            err => {
              this.loadingSplitFilesGrid = false;
            }
          )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadItemsSplitFiles(): void {
    this.SplitFilesGridView = null;
    try {
      if (this.SplitFilesItems != null && this.SplitFilesItems != undefined) {
        if (this.SplitFilesItems.length > 0) {
          this.SplitFilesGridView =
            (this.SplitFilesItems,
            {
              data: orderBy(this.SplitFilesItems, this.sort),
              total: this.SplitFilesdisplaytotalrecordscount
            });
          // this.SplitFilesGridView = process(this.SplitFilesItems, {
          //   group: this.claimsearchgroups
          //   // data: orderBy(this.SplitFilesItems, this.sort),
          //   // total: this.SplitFilesdisplaytotalrecordscount
          // });
        }
      } else {
        this.SplitFilesItems = [];
        // this.SplitFilesGridView = process(this.SplitFilesItems, {
        //   group: this.claimsearchgroups
        // });
        this.SplitFilesGridView = {
          data: orderBy(this.SplitFilesItems, this.sort),
          total: this.SplitFilesdisplaytotalrecordscount
        };
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeevent(event: PageChangeEvent): void {
    try {
      this.SplitFilesSkip = event.skip;
      this.RetriveSplitFilesData();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortChangeevent(sort: SortDescriptor[]): void {
    try {
      this.sort = sort;
      this.loadItemsSplitFiles();
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

  applyFilters() {
    try {
      this.mySelection = [];
      this.SplitFilesSkip = 0;
      this.SplitFilesdisplaytotalrecordscount = 0;
      this.loadingSplitFilesGrid = false;
      this.SplitFilesResponse = [];
      this.SplitFilesItems = [];
      this.loadItemsSplitFiles();
      
      if(this.sSelectedSearchBy != 'Practice Name'){
        if (
          this.fbcFilterSearch.value != null &&
          this.fbcFilterSearch.value != undefined &&
          this.fbcFilterSearch.value != ""
        ) {
          this.sSearchText = "";
          this.sSearchText = this.fbcFilterSearch.value.trim();
        } else {
          this.clsUtility.showInfo("Please enter search value to retrieve data");
          this.sSearchText = "";
          this.sSearchText = this.fbcFilterSearch.value.trim();
        }
      } else {
        if(this.sSelectedSubClientCode == '0'){
          this.clsUtility.showInfo("Please select practice to retrive data");
        }
      }     

      if (
        this.startDate != null &&
        this.startDate != undefined &&
        this.endDate != null &&
        this.endDate != undefined &&
        this.sSearchText != null &&
        this.sSearchText != undefined &&
        this.sSearchText != "" &&
        this.sSelectedSearchBy != null &&
        this.sSelectedSearchBy != undefined &&
        this.sSelectedSplitParameter != null &&
        this.sSelectedSplitParameter != undefined
      ) {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = true;
        this.RetriveSplitFilesData();
      } else {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = false;
        this.SplitFilesResponse = [];
        this.SplitFilesItems = [];
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  clearFilters() {
    try {
      this.startDate = new Date();
      // this.startDate.setDate(this.startDate.getDate() - 1);
      this.startDate.setMonth(this.startDate.getMonth() - 6);
      this.endDate = new Date();
      this.sSearchText = "";
      this.fbcFilterSearch.setValue(this.sSearchText);
      this.sSelectedSearchBy = "Check #";
      this.sSelectedSplitParameter = "";
      this.showpracticedropdown = false;     
      this.sSelectedSubClientCode = "0";   

      this.sSelectedClientID = "0";
      this.RetriveAllClient();
      this.RetriveSubClient();

      this.SplitFilesSkip = 0;
      this.SplitFilesdisplaytotalrecordscount = 0;
      this.loadingSplitFilesGrid = false;
      this.SplitFilesResponse = [];
      this.SplitFilesItems = [];
      this.loadItemsSplitFiles();

      if (
        this.startDate != null &&
        this.startDate != undefined &&
        this.endDate != null &&
        this.endDate != undefined &&
        this.sSearchText != null &&
        this.sSearchText != undefined &&
        this.sSearchText != "" &&
        this.sSelectedSearchBy != null &&
        this.sSelectedSearchBy != undefined &&
        this.sSelectedSplitParameter != null &&
        this.sSelectedSplitParameter != undefined
      ) {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = true;
        this.RetriveSplitFilesData();
      } else {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = false;
        this.SplitFilesResponse = [];
        this.SplitFilesItems = [];
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSearchByChange(event: any) {
    try {
      this.sSelectedSearchBy = event;
      if(this.sSelectedSearchBy != null && this.sSelectedSearchBy != undefined){
        if(this.sSelectedSearchBy == 'Practice Name'){
          this.showpracticedropdown = true;
          this.sSelectedSubClientCode = "0";
          this.sSearchText = "";
          this.fbcFilterSearch.setValue(this.sSearchText);
        } else {
          this.showpracticedropdown = false;
          this.sSelectedSubClientCode = "0";
          this.sSearchText = ""; 
          this.fbcFilterSearch.setValue(this.sSearchText);          
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSplitParameterNameChange(event: any) {
    try {
      this.sSelectedSplitParameter = event;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public claimsearchgroupChange(groups: GroupDescriptor[]): void {
    this.claimsearchgroups = groups;
    this.loadItemsSplitFiles();
  }  

  onViewEOBClick(record: any) {  
    try {
      this.inputmastererafileid = record.fileid;     
      this.inputtsid = record.tsid;
      this.inputclpid = record.clpid;
      this.inputsplitfileid = record.nerafileid;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputResult($event) {
    try {
        let IsSaved = $event;

        if(IsSaved == true){
          this.inputmastererafileid = 0;     
          this.inputtsid = 0;
          this.inputclpid = 0;
          this.inputsplitfileid = 0;
          this.EobreportChild.ResetComponents();
          $("#viewEOBReportModal").modal("hide");      
        } else {
          this.inputmastererafileid = 0;     
          this.inputtsid = 0;
          this.inputclpid = 0;
          this.inputsplitfileid = 0;
          this.EobreportChild.ResetComponents();
          $("#viewEOBReportModal").modal("hide");      
        }
       
    } catch (error) {
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
        v_divisioncode: 'All',
      };
      let seq = this.api.post("SubClient/GetSubClientByUserId", getsubclient);
      this.subscription.add(
        seq.subscribe(
          res => {
            this.sSubClients = res;

            if (this.sSubClients != null && this.sSubClients.length > 0) {     
              if(this.sSubClients.length == 1){                
                this.SelectAllSubClients = this.sSubClients;
                this.sSelectedSubClientCode = this.sSubClients[0].subclientid;
              } else {
                const Subclt = new Subclient();     
                Subclt.subclientid = "0";        
                Subclt.subclientcode = "0";
                Subclt.subclientname = "All";
                Subclt.displayname = "All";
                this.sSubClients.unshift(Subclt);
                this.SelectAllSubClients = this.sSubClients;
                this.sSelectedSubClientCode = "0"; 
                this.disabledsubclient = false;
              }  
            } else {
              this.sSubClients = [];  
              const Subclt = new Subclient();     
              Subclt.subclientid = "0";        
              Subclt.subclientcode = "0";
              Subclt.subclientname = "All";
              Subclt.displayname = "All";
              this.sSubClients.unshift(Subclt);
              this.clsUtility.showInfo("No practice is active");
              this.sSelectedSubClientCode = "0"; 
              this.disabledsubclient = true;
            }
          },
          err => {           
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSubClientChange(event: any) {
    try { 
      this.sSelectedSubClientCode = event;    
      this.sSearchText = this.sSelectedSubClientCode.toString(); 
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleSubclientFilter(value) {
    this.sSubClients = this.SelectAllSubClients.filter(
      s => s.displayname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
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
              this.SplitFilesResponse = [];
              this.SplitFilesItems = [];           
              this.loadingSplitFilesGrid = false;                   
              this.clsUtility.showInfo("No group is active");
            }
          },
          (err) => {          
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {     
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  onClientChange(event: any) {
    try {
      if (this.ClientName.value == undefined || this.ClientName.value == "") {
        this.toastr.warning("Please Select Group");
      } else {       
        this.sSelectedClientID = event;       
        // this.SplitFilesSkip = 0;
        // this.SplitFilesdisplaytotalrecordscount = 0;
             
        // this.SplitFilesGridView = null;
        // this.SplitFilesItems = [];
        // this.SplitFilesResponse = [];
        this.RetriveSubClient();
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

  public onSelectedKeysChange(e) {
    try {
      const len = this.mySelection.length;           
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
            "Do you want to re-match all " +
            this.mySelection.length +
            " claims ?";
          } else {
            this.DownloadConfirmationMessage =
            "Do you want to re-match claim ?";
          }
          this.open();
          // $("#rematchedconfirmationModal").modal("show");
          } 
      }
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

  public onSelectSuclientClick() {
    try { 
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
            ].tsid;
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
        this.RetriveSplitFilesData();       
      }     
      $("#selectsubclientModal").modal("hide");     
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onhistoryinfoclick(record: any){
    try {      
      this.InputhMastererafileid = record.fileid;
      this.InputhTs835id = record.tsid;
      this.InputhClpid = record.clpid; 
      this.InputClaimnumber = record.claimnumber;
      this.InputChecknumber = record.checknumber;          
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputSelectHistoryResult($event) {
    try {     
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

}
