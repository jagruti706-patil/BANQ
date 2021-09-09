import {   Component, OnInit, Input, OnChanges, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
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
import { clsPermission } from "./../../Services/settings/clspermission";

@Component({
  selector: 'app-manuallymatchedclaimhistory',
  templateUrl: './manuallymatchedclaimhistory.component.html',
  styleUrls: ['./manuallymatchedclaimhistory.component.css']
})
export class ManuallymatchedclaimhistoryComponent implements OnInit, OnDestroy {

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
    public clsPermission: clsPermission;

    // Received Input from parent component
    @Input() InputMastererafileid: any;
    @Input() InputTs835id: any;
    @Input() InputClpid: any;
    @Input() InputClaimnumber: any;
    @Input() InputChecknumber: any;  
    @Input() InputComponentName: any = "";
  
    // Send Output to parent component
    @Output() OutputSelectHistoryResult = new EventEmitter<boolean>();
  
    OutputSelectHistory(data: any) {
      let outSelecthistoryid = data;
      this.OutputSelectHistoryResult.emit(outSelecthistoryid);
    }

    public historysort: SortDescriptor[] = [
      {
        field: "mapped_date",
        dir: "desc",
      },
    ];

  constructor( private toastr: ToastrService,
    private api: Api,
    private dataService: DatatransaferService,
    private cdr: ChangeDetectorRef, private filedetailService: FileDetailsService,) { 
      this.clsUtility = new Utility(toastr);
    }

    ngOnInit() {
      try {
        this.subscription.add(
          this.dataService.newpermission.subscribe(
            (value) => (this.clsPermission = value)
          )
        );
        
        this.SelectsubclientList = null;
        this.SelectsubclientGridView = null;       
        if (
          isNullOrUndefined(this.InputMastererafileid) &&
          isNullOrUndefined(this.InputTs835id) &&
          isNullOrUndefined(this.InputClpid) &&
          isNullOrUndefined(this.InputClaimnumber) &&
          isNullOrUndefined(this.InputChecknumber) 
        ) {
          this.ResetComponents();
        }
        this.ResetComponents();
      } catch (error) {
        this.clsUtility.LogError(error);
      }
    }
  
    ngOnChanges() {
      try { 
        this.SelectsubclientList = null;
        this.SelectsubclientGridView = null;       
        if (
          isNullOrUndefined(this.InputMastererafileid) &&
          isNullOrUndefined(this.InputTs835id) &&
          isNullOrUndefined(this.InputClpid) &&
          isNullOrUndefined(this.InputClaimnumber) &&
          isNullOrUndefined(this.InputChecknumber) 
        ) {
          this.ResetComponents();
        } else {
          this.gethistorylist();
        }
      } catch (error) {
        this.clsUtility.LogError(error);
      }
    }

    public ResetComponents() {
      try {
        this.InputMastererafileid = null;
        this.InputTs835id = null;
        this.InputClpid = null;
        this.InputClaimnumber = null;
        this.InputChecknumber = null;      
        this.Selectedsubclient = [];
        this.isFilesProcessing = false;
        this.disbablesend = true;
      } catch (error) {
        this.clsUtility.LogError(error);
      }
    }

    gethistorylist(){
      try {
        this.subscription.add(
          this.filedetailService
            .getmanuallymatchedclaimhistory(
              this.InputMastererafileid,
              this.InputTs835id,
              this.InputClpid               
            )
            .subscribe(
              (data) => {                
                if (
                  !isNullOrUndefined(data)
                ) {
                  this.SelectsubclientGridView = null;
                  this.SelectsubclientList = null;
                  this.SelectsubclientList = data;
                  // console.log(this.SelectsubclientList);

                  if (
                    this.SelectsubclientList != null &&
                    this.SelectsubclientList != undefined &&
                    this.SelectsubclientList.length > 0
                  ) {
                    this.SelectsubclientLoading = false;

                    if (this.InputComponentName == ""){
                      this.api.insertActivityLog(
                        "Re-Matched Claim History Viewed For Claim: (" + this.InputClaimnumber + ")",
                        "Re-Matched Claim History",
                        "READ",
                        "0"
                      );
                    } else {
                      this.api.insertActivityLog(
                        "Re-Match Claim History Viewed For Claim: (" + this.InputClaimnumber + ")",
                        "Re-Match Claim History",
                        "READ",
                        "0"
                      );
                    }


                    this.SelectsubclientloadItems();
                  } else {
                    this.SelectsubclientLoading = false;
                  }
                } else {                 
                  this.SelectsubclientLoading = false;                  
                }
              },
              (err) => {
                this.SelectsubclientLoading = false;
              }
            )
        );
      } catch (error) {
        this.SelectsubclientLoading = false;
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

    private SelectsubclientloadItems(): void { 
      this.SelectsubclientGridView = null;
      try {
        if (!isNullOrUndefined(this.SelectsubclientList)) {
          if (this.SelectsubclientList.length > 0) {
            this.SelectsubclientGridView = {
              data: orderBy(this.SelectsubclientList, this.historysort),
              total: this.SelectsubclientList.length,
            };
          }
        }
      } catch (error) {
        this.clsUtility.LogError(error);
      }
    }

    OnClose() {
      try {
        this.OutputSelectHistory(false);
      } catch (error) {
        this.clsUtility.LogError(error);
      }
    }

}
