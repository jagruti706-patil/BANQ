import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import { SortDescriptor, State, process } from "@progress/kendo-data-query";
import { ToastrService } from "ngx-toastr";
import { Utility } from "src/app/Model/utility";
import { SubSink } from "subsink";
import { Api } from "src/app/Services/api";
import {
  GridDataResult,
  DataStateChangeEvent,
  PageChangeEvent,
} from "@progress/kendo-angular-grid";
import { isNullOrUndefined } from "util";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { FileDetailsService } from "src/app/Services/file-details.service";
import { DatePipe } from "@angular/common";
declare var $: any;

@Component({
  selector: "app-selectsubclient",
  templateUrl: "./selectsubclient.component.html",
  styleUrls: ["./selectsubclient.component.css"],
})
export class SelectsubclientComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private toastr: ToastrService,
    private api: Api,
    private dataService: DatatransaferService,
    private cdr: ChangeDetectorRef,
    private filedetailService: FileDetailsService,
    private datePipe: DatePipe
  ) {
    this.clsUtility = new Utility(toastr);
  }

  private clsUtility: Utility;
  private subscription = new SubSink();
  public SelectsubclientLoading = false;
  public SelectsubclientList: any;
  public SelectsubclientGridView: GridDataResult;
  public Selectedsubclient: any[] = [];
  public SelectsubclientCallback = (args) => args.dataItem;
  public mode = "single";
  public pagesize = 50;
  public percentage: number = 0;
  public isFilesProcessing: boolean = false;
  public disbablesend: boolean = true;
  public rematchedvalidationresponse: any = [];
  public rematchedvalidationlist: any = [];
  public bkprematchedvalidationlist: any = [];
  public ConfirmationMessage: string = "";
  public allclaimrematched: boolean = false;
  public validationrematchedflag: boolean = false;
  public openeddia = false;

  // Received Input from parent component
  @Input() Inputclientid: any;
  @Input() InputGenerateUnmatchedClaim: any;
  @Input() InputAllClaimno: any;
  @Input() Inputcomponent: any = "";

  // Send Output to parent component
  @Output() OutputSelectSubclientResult = new EventEmitter<boolean>();

  OutputSelectSubclient(data: any) {    
    // this.validationrematchedflag = false;
    // $("#rematchedvalidationModal").modal("hide");
    let outSelectSubclient = data;
    this.OutputSelectSubclientResult.emit(outSelectSubclient);
  }

  public sort: SortDescriptor[] = [
    {
      field: "subclientname",
      dir: "asc",
    },
  ];
  public state: State = {
    skip: 0,
    take: this.pagesize,
  };

  ngOnInit() {
    try {
      this.SelectsubclientList = null;
      this.SelectsubclientGridView = null;
      this.state = {
        skip: 0,
        take: 50,
      };
      if (
        isNullOrUndefined(this.Inputclientid) &&
        isNullOrUndefined(this.InputGenerateUnmatchedClaim) &&
        isNullOrUndefined(this.InputAllClaimno)
      ) {
        this.ResetComponents();
      }
      this.getsubClientlist();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnChanges() {
    try {    
      // console.log(this.InputGenerateUnmatchedClaim);
      this.SelectsubclientList = null;
      this.SelectsubclientGridView = null;
      this.state = {
        skip: 0,
        take: this.pagesize,
      };
      if (
        (isNullOrUndefined(this.Inputclientid) &&
        isNullOrUndefined(this.InputGenerateUnmatchedClaim) &&
        isNullOrUndefined(this.InputAllClaimno)) && (this.Inputclientid == "" && this.InputGenerateUnmatchedClaim == "" && this.InputAllClaimno == "")
      ) {
        this.ResetComponents();
      } else {
        this.getsubClientlist();
      }      
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getsubClientlist(insertlog: boolean = true) {
    try {
      this.SelectsubclientLoading = true;
      let getsubclient: {
        clientid: string;
        // subclientcode: string;
        // subclientstatus: boolean;
      } = {
        clientid: this.Inputclientid,
        // subclientcode: "",
        // subclientstatus: true,
      };
      // let seq = this.api.post("SubClient/GetSubClient", getsubclient);
      let seq = this.api.post("SubClient/GetSubClientListByReporting", getsubclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.SelectsubclientGridView = null;
            this.SelectsubclientList = null;
            this.SelectsubclientList = res;

            if (
              this.SelectsubclientList != null &&
              this.SelectsubclientList != undefined &&
              this.SelectsubclientList.length > 0
            ) {
              this.SelectsubclientLoading = false;
              this.SelectsubclientloadItems();              
            } else {
              this.SelectsubclientLoading = false;
            }

            if (insertlog) {
              if(this.Inputcomponent == ""){
                this.api.insertActivityLog(
                  "Practice List Viewed",
                  "Unmatched Claims Select Practice",
                  "READ"
                );
              } else if (this.Inputcomponent == "ManuallyMatchedClaims"){
                this.api.insertActivityLog(
                  "Practice List Viewed",
                  "Re-Matched Claims Select Practice",
                  "READ"
                );
              }
              
            }
          },
          (err) => {
            this.SelectsubclientLoading = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.SelectsubclientLoading = false;
      this.clsUtility.LogError(error);
    }
  }

  private SelectsubclientloadItems(): void {
    try {
      if(this.SelectsubclientList != null && this.SelectsubclientList != undefined){
        this.SelectsubclientGridView = process(
          this.SelectsubclientList,
          this.state
        );
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public SelectsubclientdataStateChange(state: DataStateChangeEvent): void {
    try {      
      if(this.SelectsubclientList != null && this.SelectsubclientList != undefined){
        this.state = state;
        if (state.filter != undefined && state.filter != null) {
          state.filter.filters.forEach((f) => {
            if (
              f["field"] == "subclientcode" ||
              f["field"] == "subclientname" ||
              f["field"] == "subclientcontactname" ||
              f["field"] == "subclientdivisioncode"
            ) {
              if (f["value"] != null) {
                f["value"] = f["value"].trim();
              }
            }
          });
        }
        this.SelectsubclientGridView = process(
          this.SelectsubclientList,
          this.state
        );
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public ResetComponents() {
    try {
      this.Inputclientid = null;
      this.InputGenerateUnmatchedClaim = null;
      this.InputAllClaimno = null;
      this.Selectedsubclient = [];
      this.isFilesProcessing = false;
      this.disbablesend = true;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  async GenerateFile() {
    try {
      // console.log(this.InputAllClaimno);
      let allclaim: string;
      this.percentage = 0;
      var percentIncrease = 0;
      if (this.Selectedsubclient.length == 1) {
        this.isFilesProcessing = true;
        this.percentage = 0;
        percentIncrease = 100 / this.Selectedsubclient.length;
        this.cdr.detectChanges();
        if (
          !isNullOrUndefined(this.InputGenerateUnmatchedClaim) &&
          this.InputGenerateUnmatchedClaim != [] &&
          this.InputGenerateUnmatchedClaim != ""
        ) {
          for (
            let index = 0;
            index < this.InputGenerateUnmatchedClaim.recordslist.length;
            index++
          ) {
            (this.InputGenerateUnmatchedClaim.recordslist[
              index
            ].subclientname = this.Selectedsubclient[0]["subclientname"]),
            (this.InputGenerateUnmatchedClaim.recordslist[
              index
            ].subclientid = this.Selectedsubclient[0]["subclientid"]),
              (this.InputGenerateUnmatchedClaim.recordslist[
                index
              ].subclientcode = this.Selectedsubclient[0]["subclientcode"]);
          }
          this.InputGenerateUnmatchedClaim.clientid = this.Inputclientid;
        }
        // if (this.disbablesend == true)
        {
          var output: boolean = false;
          await this.api
            .post_edi(
              "api/Parser/youbucketfilecreation",
              this.InputGenerateUnmatchedClaim
            )
            .toPromise()
            .then(
              (data) => {
                if (!isNullOrUndefined(data)) {
                  if (data == true) {
                    this.api.insertActivityLog(
                      "EDI File generated for unmatched claims (" +
                        this.InputAllClaimno +
                        ") to PracticeCode : " +
                        this.Selectedsubclient[0]["subclientcode"] +
                        ", PracticeName : " +
                        this.Selectedsubclient[0]["subclientname"],
                      "Select Practice",
                      "READ"
                    );
                  }
                  output = true;
                  this.percentage = this.percentage + percentIncrease;
                  this.cdr.detectChanges();
                }
              },
              (error) => {
                output = false;
                this.percentage = this.percentage + percentIncrease;
                this.cdr.detectChanges();
                this.clsUtility.LogError(error);
              }
            );

          setTimeout(() => {
            this.isFilesProcessing = false;
            this.percentage = 0;
            this.cdr.detectChanges();
            if (output == true) {
              this.OutputSelectSubclient(true);
            } else {
              this.OutputSelectSubclient(false);
            }
          }, 3000);
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnGenerate() {    
    try {
      if(this.Inputcomponent == ""){
        this.disbablesend = false;
        if (
          !(
            isNullOrUndefined(this.Inputclientid) &&
            isNullOrUndefined(this.InputGenerateUnmatchedClaim) &&
            isNullOrUndefined(this.InputAllClaimno)
          )
        ) {
          this.GenerateFile();
        }
      } else if(this.Inputcomponent == "ManuallyMatchedClaims") {        
        this.disbablesend = false;
        if (
          !(
            isNullOrUndefined(this.Inputclientid) &&
            isNullOrUndefined(this.InputGenerateUnmatchedClaim) &&
            isNullOrUndefined(this.InputAllClaimno)
          )
        ) {
          this.ValidationRematched();
        }            
      } else if(this.Inputcomponent == "Re-Match Claim") {        
        this.disbablesend = false;
        if (
          !(
            isNullOrUndefined(this.Inputclientid) &&
            isNullOrUndefined(this.InputGenerateUnmatchedClaim) &&
            isNullOrUndefined(this.InputAllClaimno)
          )
        ) {
          this.ValidationRematched();
        }            
      }    
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnClose() {
    try {
      this.OutputSelectSubclient(false);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  validateSelectSubclient() {
    try {
      // console.log(this.Selectedsubclient.length);

      if (this.Selectedsubclient.length == 1) {
        return true;
      } else {
        return false;
      }
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

  async GenerateFileRematched() {
    try {      
      // console.log(this.InputAllClaimno);
      let allclaim: string;
      this.percentage = 0;
      var percentIncrease = 0;
      if (this.Selectedsubclient.length == 1) {
        this.isFilesProcessing = true;
        this.percentage = 0;
        percentIncrease = 100 / this.Selectedsubclient.length;
        this.cdr.detectChanges();
        if (
          !isNullOrUndefined(this.InputGenerateUnmatchedClaim) &&
          this.InputGenerateUnmatchedClaim != [] &&
          this.InputGenerateUnmatchedClaim != ""
        ) {
          for (
            let index = 0;
            index < this.InputGenerateUnmatchedClaim.recordslist.length;
            index++
          ) {
            (this.InputGenerateUnmatchedClaim.recordslist[
              index
            ].subclientid = this.Selectedsubclient[0]["subclientid"]),
              (this.InputGenerateUnmatchedClaim.recordslist[
                index
              ].subclientcode = this.Selectedsubclient[0]["subclientcode"]);
          }
          this.InputGenerateUnmatchedClaim.clientid = this.Inputclientid;
        }
        // if (this.disbablesend == true)
        {
          var output: boolean = false;
          await this.api
            .post_edi(
              "api/Parser/rematchyoubucketfilecreation",
              this.InputGenerateUnmatchedClaim
            )
            .toPromise()
            .then(
              (data) => {
                if (!isNullOrUndefined(data)) {
                  if (data == true) {
                    this.api.insertActivityLog(
                      "EDI File generated for Re-Matched claims (" +
                        this.InputAllClaimno +
                        ") to PracticeCode : " +
                        this.Selectedsubclient[0]["subclientcode"] +
                        ", PracticeName : " +
                        this.Selectedsubclient[0]["subclientname"],
                      "Select Practice",
                      "READ"
                    );
                  }
                  output = true;
                  this.percentage = this.percentage + percentIncrease;
                  this.cdr.detectChanges();
                }
              },
              (error) => {
                output = false;
                this.percentage = this.percentage + percentIncrease;
                this.cdr.detectChanges();
                this.clsUtility.LogError(error);
              }
            );

          setTimeout(() => {
            this.isFilesProcessing = false;
            this.percentage = 0;
            this.cdr.detectChanges();
            this.allclaimrematched = false;
            if (output == true) {
              this.OutputSelectSubclient(true);
            } else {
              this.OutputSelectSubclient(false);
            }
          }, 3000);
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  async ValidationRematched() {
    try {      
      if (this.Selectedsubclient.length == 1) { 
        if (
          !isNullOrUndefined(this.InputGenerateUnmatchedClaim) &&
          this.InputGenerateUnmatchedClaim != [] &&
          this.InputGenerateUnmatchedClaim != ""
        ) {
          for (
            let index = 0;
            index < this.InputGenerateUnmatchedClaim.recordslist.length;
            index++
          ) {
            (this.InputGenerateUnmatchedClaim.recordslist[
              index
            ].subclientname = this.Selectedsubclient[0]["subclientname"]),
            (this.InputGenerateUnmatchedClaim.recordslist[
              index
            ].subclientid = this.Selectedsubclient[0]["subclientid"]),
              (this.InputGenerateUnmatchedClaim.recordslist[
                index
              ].subclientcode = this.Selectedsubclient[0]["subclientcode"]);
          }
          this.InputGenerateUnmatchedClaim.clientid = this.Inputclientid;
          this.InputGenerateUnmatchedClaim.subclientid = this.Selectedsubclient[0]["subclientid"];

          this.bkprematchedvalidationlist = this.InputGenerateUnmatchedClaim; 
        }
       
        {
          var output: boolean = false;
          await this.api
            .post_edi(
              "api/Files/getRematchClaimValidation",
              this.InputGenerateUnmatchedClaim
            )
            .toPromise()
            .then(
              (data) => {                                
                if (!isNullOrUndefined(data)) {
                  this.allclaimrematched = false;  
                  this.rematchedvalidationresponse = data;  
                  if(!isNullOrUndefined(this.rematchedvalidationresponse.content)) {
                    this.rematchedvalidationlist = this.rematchedvalidationresponse.content; 
                  
                    if(this.rematchedvalidationlist.length > 0){
                      if(this.InputGenerateUnmatchedClaim.recordslist.length == this.rematchedvalidationlist.length){
                        this.allclaimrematched = true;
                        this.ConfirmationMessage = "Below claims are already mapped with " + this.Selectedsubclient[0]["subclientname"] + " practice "                        
                        // this.validationrematchedflag = false;
                        this.open();
                        // $("#rematchedvalidationModal").modal("show");
                      } else {
                        this.rematchedvalidationlist.forEach(obj => {                          
                          let redata = this.InputGenerateUnmatchedClaim.recordslist.find(ob => ob.clpid === obj.clpid);
                          var idx = this.InputGenerateUnmatchedClaim.recordslist.findIndex(ob => ob.clpid === obj.clpid);                         
                          if (redata != null || redata != undefined) {
                            this.InputGenerateUnmatchedClaim.recordslist.splice(idx, 1);
                          }
                        });

                        this.ConfirmationMessage = "Below claims are already mapped with " + this.Selectedsubclient[0]["subclientname"] + " practice "                       
                        // this.validationrematchedflag = false;
                        this.open();
                        // $("#rematchedvalidationModal").modal("show");                       
                      }
                    } else {
                      this.GenerateFileRematched();
                    }
                  } else {
                    this.GenerateFileRematched();
                  }
                }
              },
              (error) => {              
                this.clsUtility.LogError(error);
              }
            );
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onselectedYesClick(){
    if((this.InputGenerateUnmatchedClaim.recordslist.length == this.rematchedvalidationlist.length) && this.allclaimrematched == true){
      // this.validationrematchedflag = true;
      // $("#rematchedvalidationModal").modal("hide");
      this.allclaimrematched = false;
      this.disbablesend = true;
      this.InputGenerateUnmatchedClaim = this.bkprematchedvalidationlist ;
      // this.OutputSelectSubclient(false);
    } else {
      // this.validationrematchedflag = true;
      // $("#rematchedvalidationModal").modal("hide");
      this.GenerateFileRematched();
    }    
  }

  onselectedCloseClick(){
    if((this.InputGenerateUnmatchedClaim.recordslist.length == this.rematchedvalidationlist.length) && this.allclaimrematched == true){
      // this.validationrematchedflag = true;
      // $("#rematchedvalidationModal").modal("hide");
      this.allclaimrematched = false;
      this.disbablesend = true;
      this.InputGenerateUnmatchedClaim = this.bkprematchedvalidationlist ;
      // this.OutputSelectSubclient(false);
    } else {
      // this.validationrematchedflag = true;
      // $("#rematchedvalidationModal").modal("hide");
      this.GenerateFileRematched();
    }   
  }

  public closeWarning(status) {
    try {   
      if(status == 'Yes'){
        this.openeddia = false;
        if((this.InputGenerateUnmatchedClaim.recordslist.length == this.rematchedvalidationlist.length) && this.allclaimrematched == true){
          this.validationrematchedflag = true;        
          this.allclaimrematched = false;
          this.disbablesend = true;
          this.InputGenerateUnmatchedClaim = this.bkprematchedvalidationlist;         
        } else {
          this.validationrematchedflag = true;      
          this.GenerateFileRematched();
        }          
      } else {
        this.openeddia = false;
      }      
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public open() {
    try {   
      this.openeddia = true;
    } catch (error) {
      this.clsUtility.LogError(error);
    }   
  }

  // validationsubclient(){
  //   return false;
  //   // try {
  //   //   this.subscription.add(
  //   //     this.filedetailService
  //   //       .getmanuallymatchedclaimhistory(
  //   //         this.InputMastererafileid,
  //   //         this.InputTs835id,
  //   //         this.InputClpid               
  //   //       )
  //   //       .subscribe(
  //   //         (data) => {                
  //   //           if (
  //   //             !isNullOrUndefined(data)
  //   //           ) {
  //   //             this.SelectsubclientGridView = null;
  //   //             this.SelectsubclientList = null;
  //   //             this.SelectsubclientList = data;
  //   //             console.log(this.SelectsubclientList);

  //   //             if (
  //   //               this.SelectsubclientList != null &&
  //   //               this.SelectsubclientList != undefined &&
  //   //               this.SelectsubclientList.length > 0
  //   //             ) {
  //   //               this.SelectsubclientLoading = false;
  //   //               this.SelectsubclientloadItems();
  //   //             } else {
  //   //               this.SelectsubclientLoading = false;
  //   //             }
  //   //           } else {                 
  //   //             this.SelectsubclientLoading = false;                  
  //   //           }
  //   //         },
  //   //         (err) => {
  //   //           this.SelectsubclientLoading = false;
  //   //         }
  //   //       )
  //   //   );
  //   // } catch (error) {
  //   //   this.SelectsubclientLoading = false;
  //   //   this.clsUtility.LogError(error);
  //   // }
  // }

}
