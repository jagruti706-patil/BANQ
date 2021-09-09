import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { FileDetailsService } from "src/app/Services/file-details.service";
import {
  GridDataResult,
  PageChangeEvent,
  SelectableSettings,
  SelectAllCheckboxState,
  GridComponent,
} from "@progress/kendo-angular-grid";
import { DatePipe } from "@angular/common";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { Api } from "src/app/Services/api";
import { BreadcrumbService } from "src/app/Services/breadcrumb.service";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Router } from "@angular/router";
import { FormBuilder, Validators } from "@angular/forms";
import { isNullOrUndefined } from "util";
import { Observable } from "rxjs";
import * as moment from "moment";
import { Workbook } from "@progress/kendo-angular-excel-export";
import { SearchfiltersService } from "src/app/Services/searchfilters.service";
import { CoreauthService } from "src/app/Services/coreauth.service";
import { SubSink } from "subsink";
import { MailSend } from "../Configurations/emailconfiguration/clsemail";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { parseNumber } from "@progress/kendo-angular-intl";
import { Client } from "src/app/Model/client";
declare var $: any;
import { SelectsubclientComponent } from "../selectsubclient/selectsubclient.component";

@Component({
  selector: 'app-unmatchedplbdetails',
  templateUrl: './unmatchedplbdetails.component.html',
  styleUrls: ['./unmatchedplbdetails.component.css']
})
export class UnmatchedplbdetailsComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private filedetailService: FileDetailsService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    public api: Api,
    private breadcrumbService: BreadcrumbService,
    private dataService: DatatransaferService,
    private router: Router,
    private authService: CoreauthService,
    public searchfiltersvr: SearchfiltersService
  ) {
    this.clsUtility = new Utility(toastr);
    this.UnmatchedPLBsPageSize = this.clsUtility.pagesize;
    this.allData = this.allData.bind(this);
    this.ExportData = this.ExportData.bind(this);
  }

  private clsUtility: Utility;
  private subscription = new SubSink();

  public emailloading = false;
  loading = false;
  loadingUnmatchedFilesGrid = false;
  neraMasterFileid: any = "0";
  nclientid: any = "0";
  public sUnmatchedclaims: any;
  public nSelectedClientID: string = "0";

  public UnmatchedPLBsGridData: {};
  public UnmatchedPLBsGridView: GridDataResult;
  private UnmatchedPLBsItems: any[] = [];
  private UnmatchedPLBsResponse: any[] = [];
  public UnmatchedPLBsSkip = 0;
  public UnmatchedPLBsPageSize = 0;
  public ExportExcelDownloadConfirmationMessage: any;

  public stitleUnmatchedplb = "UnMatched PLBs";
  public sUnmatchedPLBsBreadCrumb: string = "UnMatchedPLBs";
  public UnmatchedPLBsdisplaytotalrecordscount: number = 0;
  public sSearchText: string = "";
  public clsPermission: clsPermission;

  result: any = [];
  resultarray: any = [];
  public startDate: Date = new Date();
  public endDate: Date = new Date();
  public exportFilename: string =
    "UnmatchedPLBsList_" + this.datePipe.transform(new Date(), "MMddyyyy");
  selectedFiles: File;
  public disabledsearchBy: boolean = false;

  public sUnmatchedPLBSearchBy: any = [
    // { value: "Filename", text: "Filename" },
    { value: "Check", text: "Check" },
    { value: "Payer", text: "Payer" }
  ];
  public sSelectedUnmatchedPLBSearchBy: string = "Check";

  public mySelection: any[] = [];
  public selectedCallback = (args) => args.dataItem.c042id;
  public selectAllState: SelectAllCheckboxState = "unchecked";
  public selectableSettings: SelectableSettings = {
    enabled: true,
  };
  public checkboxOnly = false;
  public mode = "multiple";
  public selectallflag: boolean = false;
  public currentuserid: string = "0";
  public currentusername: string = "";
  public exportresponse: any = [];
  public exportgridresult: GridDataResult;
  public recordselectioncount: number = 0;
  public myremove: any[] = [];
  public sSendemailfilter: any = [
    { value: "All", text: "All" },
    { value: "Send", text: "Send" },
    { value: "Unsend", text: "Unsend" },
  ];
  public sSelectedsendemailfilter: string = "All";
  public disabledsendemail: boolean = false;

  public sAllClients: any;
  public SelectAllClients: any;
  public sSelectedClientID: string = "0";

  public disabledclient: boolean = false;
  public disabledstartdate: boolean = false;
  public disabledenddate: boolean = false;
  public disabledapplybtn: boolean = false;
  public disabledclearbtn: boolean = false;
  public disabledsearch: boolean = false;
  private bOninit = false;
  public bHidebtn = false;

  public Inputclientid: any;
  public InputGenerateUnmatchedClaim: any;
  @ViewChild("SelectsubclientChild")
  private SelectsubclientChild: SelectsubclientComponent;
  public InputAllClaimno: string = "";
  public Inputcomponent: string = "ManuallyMatchedPLB";

  public recordslist: {
    c042id: any;
    nfileid: any;
  } = {
    c042id: 0,
    nfileid: 0,
  };

  public sortUnmatchedPLBs: SortDescriptor[] = [
    {
      field: "importdate",
      dir: "desc",
    },
  ];
  // public sortMaster: SortDescriptor[] = [
  //   {
  //     field: "clientid",
  //     dir: "asc"
  //   }
  // ];

  DropDownGroup = this.fb.group({
    fcSearch: [""],
    fcUnmatchedSearchBy: [""],
    fcSendEmailfilter: [""],
    fcClientName: [""],
  });

  get fbcFilterSearch() {
    return this.DropDownGroup.get("fcSearch");
  }

  get UnmatchedSearchBy() {
    return this.DropDownGroup.get("fcUnmatchedSearchBy");
  }

  get SendEmailFilter() {
    return this.DropDownGroup.get("fcSendEmailfilter");
  }

  get ClientName() {
    return this.DropDownGroup.get("fcClientName");
  }

  ngOnInit() {
    try {      
      this.bOninit = true;
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );
      this.neraMasterFileid = this.dataService.mastererafileid;
      this.startDate.setMonth(this.startDate.getMonth() - 3);
      this.currentuserid = this.dataService.SelectedUserid;
      this.currentusername = this.dataService.loginName["_value"];
      this.nclientid = this.dataService.clientid;
      if (
        this.neraMasterFileid != null &&
        this.neraMasterFileid != undefined &&
        this.neraMasterFileid != "" &&
        this.neraMasterFileid != "0"
      ) {   
          this.UnmatchedPLBsdisplaytotalrecordscount = 0;
          this.loadingUnmatchedFilesGrid = true;
          this.Enabledisablebtn(true);       
          this.RetriveUnmatchedPLBs();
          this.api.insertActivityLog(
            "Unmatched PLB Viewed for File (" +
              this.dataService.mastererafilename +
            ") ",
            "Unmatched PLB",
            "READ",
            this.neraMasterFileid
          );
          this.breadcrumbService.showhideFilesbreadcrumb(
            true,
            this.sUnmatchedPLBsBreadCrumb
          );        
        } else {
          this.router.navigate(["/Files"]);
        }
    } catch (error) {
      this.loadingUnmatchedFilesGrid = false;
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
              if (
                this.sAllClients[0]["nclientcount"] == this.sAllClients.length
              ) {
                const Allclt = new Client();
                Allclt.clientid = "0";
                Allclt.clientcode = "";
                Allclt.clientname = "All";
                this.sAllClients.unshift(Allclt);
                this.SelectAllClients = this.sAllClients;

                this.sSelectedClientID = "0";
              } else {
                this.SelectAllClients = this.sAllClients;
                this.sSelectedClientID = this.sAllClients[0]["clientid"];
              }

              if (this.sSelectedClientID != "0") {
                this.bHidebtn = true;
              } else {
                this.bHidebtn = false;
              }

              if (this.bOninit) {
                this.RetriveUnmatchedPLBs();
                this.bOninit = false;
              } else {
                this.Enabledisablebtn(false);
              }
            } else {
              this.sAllClients = [];
              this.Enabledisablebtn(true);
              this.bOninit = false;

              this.UnmatchedPLBsResponse = [];
              this.UnmatchedPLBsItems = [];
              this.loading = false;
              this.loadingUnmatchedFilesGrid = false;
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
      this.loadingUnmatchedFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  onClientChange(event: any) {
    try {
      if (this.ClientName.value == undefined || this.ClientName.value == "") {
        this.toastr.warning("Please Select Group");
      } else {
        this.mySelection = [];
        this.myremove = [];
        this.selectallflag = false;
        this.selectAllState = "unchecked";
        this.sSelectedClientID = event;
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

  public pageChangeUnmatchedPLBs(event: PageChangeEvent): void {
    try {
      this.UnmatchedPLBsSkip = event.skip;
      this.RetriveUnmatchedPLBs();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortUnmatchedPLBsChange(sort: SortDescriptor[]): void {
    try {
      this.sortUnmatchedPLBs = sort;
      this.loadItemsUnmatchedPLBs_v2();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveUnmatchedPLBs() {
    this.UnmatchedPLBsGridView = null;
    this.UnmatchedPLBsItems = [];
    try {
      this.loadingUnmatchedFilesGrid = true;
      this.subscription.add(
        this.filedetailService
          .getUnmatchedPLBsList(
            this.neraMasterFileid,
            this.UnmatchedPLBsSkip,
            this.UnmatchedPLBsPageSize,
            this.sSelectedUnmatchedPLBSearchBy,
            this.sSearchText,
            null,
            null,
            this.sSelectedsendemailfilter,
            this.sSelectedClientID
          )
          .subscribe(
            (data) => {
              if (!isNullOrUndefined(data)) {
                this.UnmatchedPLBsResponse = data;
                this.UnmatchedPLBsItems = this.UnmatchedPLBsResponse["content"];
                if (this.UnmatchedPLBsItems != null) {
                  if (this.UnmatchedPLBsItems.length > 0) {
                    this.UnmatchedPLBsdisplaytotalrecordscount = this.UnmatchedPLBsResponse[
                      "totalelements"
                    ];

                    this.UnmatchedPLBsItems.map((obj) => {
                      obj["adjustmentamount"] = parseNumber(
                        !isNullOrUndefined(obj["adjustmentamount"])
                          ? obj["adjustmentamount"]
                              .replace("$", "")
                              .replace(",", "")
                          : "$0.00"
                      );
                    });

                    this.loadItemsUnmatchedPLBs_v2();
                    this.loadingUnmatchedFilesGrid = false;
                    this.Enabledisablebtn(false);

                    if (
                      (this.selectallflag == true &&
                        this.selectAllState == "checked") ||
                      (this.selectallflag == false &&
                        this.selectAllState == "indeterminate" &&
                        this.recordselectioncount > 0)
                    ) {
                      this.mySelection = [];
                      this.UnmatchedPLBsItems.forEach((item) => {
                        // if (this.mySelection.indexOf(item.c042id) === -1) {
                        //   this.mySelection.push(item.c042id);

                        //   this.recordslist.c042id = item.c042id;
                        //   this.exportresponse.push(this.recordslist);
                        // }
                        if (this.myremove.length > 0) {
                          let rdata = this.myremove.find(
                            (x) => x == item.c042id
                          );
                          if (rdata == null || rdata == undefined) {
                            this.mySelection.push(item.c042id);
                          }
                        } else {
                          let data = this.mySelection.find(
                            (obj) => obj === item.c042id
                          );
                          if (data == null || data == undefined) {
                            this.mySelection.push(item.c042id);
                          }
                        }
                      });
                    } else if (
                      this.selectallflag == false &&
                      this.selectAllState == "unchecked"
                    ) {
                      this.mySelection = [];
                    } else if (
                      this.selectallflag == false &&
                      this.selectAllState == "indeterminate"
                    ) {
                      var data: any = this.mySelection;
                      this.mySelection = [];
                      this.mySelection = data;
                    }
                  } else {
                    this.loadingUnmatchedFilesGrid = false;
                    this.UnmatchedPLBsdisplaytotalrecordscount = 0;
                    this.Enabledisablebtn(false);
                  }
                } else {
                  this.loadingUnmatchedFilesGrid = false;
                  this.UnmatchedPLBsdisplaytotalrecordscount = 0;
                  this.Enabledisablebtn(false);
                }
              } else {
                this.UnmatchedPLBsItems = [];
                this.UnmatchedPLBsGridView = null;
                this.UnmatchedPLBsdisplaytotalrecordscount = 0;
                this.Enabledisablebtn(false);
              }
            },
            (err) => {
              this.loadingUnmatchedFilesGrid = false;
              this.Enabledisablebtn(false);
            }
          )
      );
    } catch (error) {
      this.loadingUnmatchedFilesGrid = false;
      this.Enabledisablebtn(false);
      this.clsUtility.LogError(error);
    }
  }

  private loadItemsUnmatchedPLBs_v2(): void {
    this.UnmatchedPLBsGridView = null;
    try {
      if (
        this.UnmatchedPLBsItems != null &&
        this.UnmatchedPLBsItems != undefined
      ) {
        if (this.UnmatchedPLBsItems && this.UnmatchedPLBsItems.length > 0) {
          this.UnmatchedPLBsGridView = {
            data: orderBy(this.UnmatchedPLBsItems, this.sortUnmatchedPLBs),
            total: this.UnmatchedPLBsResponse["totalelements"],
          };
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public allData = (): Observable<any> => {
    try {
      this.emailloading = true;
      if (this.UnmatchedPLBsdisplaytotalrecordscount != 0) {
        var result = this.filedetailService.SelectedallunmatchedplbexportData(
          this.neraMasterFileid,
          0,
          this.UnmatchedPLBsdisplaytotalrecordscount,
          "Unmatched PLBs",
          this.sSearchText,
          this.sSelectedUnmatchedPLBSearchBy,
          this.datePipe.transform(this.startDate, "yyyyMMdd"),
          this.datePipe.transform(this.endDate, "yyyyMMdd"),
          this.mySelection,
          this.myremove,
          this.selectallflag,
          this.sSelectedsendemailfilter,
          this.sSelectedClientID
        );

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

  public ExportData = (): Observable<any> => {
    try {
      this.emailloading = true;
      if (this.UnmatchedPLBsdisplaytotalrecordscount != 0) {
        var result = this.filedetailService.SelectedallunmatchedplbexportData(
          this.neraMasterFileid,
          0,
          this.UnmatchedPLBsdisplaytotalrecordscount,
          "Unmatched PLBs",
          this.sSearchText,
          this.sSelectedUnmatchedPLBSearchBy,
          this.datePipe.transform(this.startDate, "yyyyMMdd"),
          this.datePipe.transform(this.endDate, "yyyyMMdd"),
          [],
          [],
          true,
          this.sSelectedsendemailfilter,
          this.sSelectedClientID
        );

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

  public onExcelExport(args: any): void {
    try {
      this.emailloading = true;
      args.preventDefault();
      const workbook = args.workbook;

      new Workbook(workbook).toDataURL().then((dataUrl: string) => {
        dataUrl = dataUrl.replace(
          "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,",
          ""
        );
        const blobltext = this.b64toBlob(
          dataUrl,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        var filename =
          "UnmatchedPLBsList_" +
          moment(new Date()).format("MMDDYYYY") +
          ".xlsx";

        var testFile = new File([blobltext], filename, {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        this.selectedFiles = testFile;

        this.getMailConfigurationByTitle("Unmatched plb details");
      });
    } catch (error) {
      this.clsUtility.showError(error);
    }
  }

  b64toBlob = (
    b64Data,
    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    sliceSize = 512
  ) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blobpdf = new Blob(byteArrays, { type: contentType });
    return blobpdf;
  };

  getMailConfigurationByTitle(Title: String) {
    var date = moment(new Date()).format("MM/DD/YYYY");
    var objMailSend = new MailSend();

    let seq = this.api.get_email("EmailConfigurationByTitle/" + Title);
    this.subscription.add(
      seq.subscribe((res) => {
        let response = res;
        if (response != null && response != undefined) {
          this.resultarray = response["content"];

          if (this.resultarray != null || this.resultarray != undefined) {
            this.result = this.resultarray[0];
            objMailSend.FromEmail = this.result.emailfrom.toString();
            objMailSend.FromPassword = "";

            if (
              this.result.emailsubject == null ||
              this.result.emailsubject == undefined ||
              this.result.emailbody == null ||
              this.result.emailbody == undefined
            ) {
              this.clsUtility.showError(
                "Email Configuration not proper. Please contact system administrator."
              );
              this.emailloading = false;
              return;
            } else {
              objMailSend.Subject = this.result.emailsubject.replace(
                "{{date}}",
                date
              );
              objMailSend.Body = this.result.emailbody.replace(
                "{{date}}",
                date
              );
            }

            if (
              this.result.emailtoreceive != null ||
              this.result.emailtoreceive != undefined
            ) {
              objMailSend.To = this.result.emailtoreceive
                .toString()
                .replace(/,/g, ";");
            }
            if (
              this.result.emailccreceive != null ||
              this.result.emailccreceive != undefined
            ) {
              objMailSend.Cc = this.result.emailccreceive
                .toString()
                .replace(/,/g, ";");
            }

            this.subscription.add(
              this.authService
                .sendMailwithAttachment(objMailSend, this.selectedFiles)
                .subscribe(
                  (response) => {
                    if (response) {
                      this.clsUtility.showSuccess(response.status);
                      this.emailloading = false;
                      this.mySelection = [];
                      this.myremove = [];
                      this.recordselectioncount = 0;
                      this.selectallflag = false;
                      this.selectAllState = "unchecked";
                      this.UnmatchedPLBsSkip = 0;

                      this.recordslist = this.filedetailService.exportresponsedataplb;
                      this.filedetailService.exportresponsedataplb.forEach(
                        (obj) => {
                          this.recordslist.c042id = obj.c042id;
                          this.recordslist.nfileid = obj.nfileid;
                          this.exportresponse.push(this.recordslist);
                        }
                      );

                      this.subscription.add(
                        this.filedetailService
                          .UpdatePLBSendEmailData(
                            this.exportresponse,
                            this.currentuserid,
                            this.currentusername
                          )
                          .subscribe(
                            (data) => {
                              if (data != null && data != undefined) {
                                if (data == 1) {
                                  this.filedetailService.exportresponsedataplb = [];
                                  this.exportresponse = [];
                                  this.recordslist.c042id = 0;
                                  this.recordslist.nfileid = 0;
                                  this.UnmatchedPLBsSkip = 0;
                                  this.RetriveUnmatchedPLBs();
                                  this.api.insertActivityLog(
                                    "Email sended",
                                    "Unmatched PLB",
                                    "READ",
                                    this.neraMasterFileid
                                  );
                                }
                              }
                            },
                            (err) => {
                              this.clsUtility.showError(err);
                            }
                          )
                      );
                    }
                  },
                  (err) => {
                    this.clsUtility.showError("Error in mail send");
                    this.emailloading = false;
                    this.mySelection = [];
                    this.myremove = [];
                    this.recordselectioncount = 0;
                    this.UnmatchedPLBsSkip = 0;
                    this.selectallflag = false;
                    this.selectAllState = "unchecked";
                  }
                )
            );
          } else {
            this.clsUtility.showInfo(
              "Title 'Unmatched plb details' is not registered in email configuration."
            );
            this.emailloading = false;
          }
        }
      })
    );
  }

  onUnmatchedSearchByChange(event: any) {
    try {
      this.sSelectedUnmatchedPLBSearchBy = event;
      this.searchfiltersvr.setalluplbsfilter(
        this.sSearchText,
        this.sSelectedUnmatchedPLBSearchBy
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

  applyFilters() {
    try {
      if (this.sSelectedClientID != "0") {
        this.bHidebtn = true;
      } else {
        this.bHidebtn = false;
      }
      this.mySelection = [];
      this.myremove = [];
      this.recordselectioncount = 0;
      this.selectallflag = false;
      this.selectAllState = "unchecked";

      if (
        this.fbcFilterSearch.value != null &&
        this.fbcFilterSearch.value != undefined
      ) {
        this.sSearchText = "";
        this.sSearchText = this.fbcFilterSearch.value.trim();
      } else {
        this.sSearchText = "";
        this.sSearchText = this.fbcFilterSearch.value.trim();
      }

      if (
        this.neraMasterFileid != null &&
        this.neraMasterFileid != undefined &&
        this.sSearchText != null &&
        this.sSearchText != undefined &&
        this.startDate != null &&
        this.startDate != undefined &&
        this.endDate != null &&
        this.endDate != undefined
      ) {
        this.UnmatchedPLBsSkip = 0;
        this.UnmatchedPLBsdisplaytotalrecordscount = 0;
        this.loadingUnmatchedFilesGrid = true;

        this.searchfiltersvr.setalluplbsfilter(
          this.sSearchText,
          this.sSelectedUnmatchedPLBSearchBy
        );
        this.Enabledisablebtn(true);
        this.RetriveUnmatchedPLBs();
      } else {
        this.UnmatchedPLBsSkip = 0;
        this.UnmatchedPLBsdisplaytotalrecordscount = 0;
        this.loadingUnmatchedFilesGrid = false;
        this.UnmatchedPLBsResponse = [];
        this.UnmatchedPLBsItems = [];
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  clearFilters() {
    try {
      this.mySelection = [];
      this.myremove = [];
      this.recordselectioncount = 0;
      this.selectallflag = false;
      this.selectAllState = "unchecked";

      this.sSelectedClientID = "0";
      this.bHidebtn = false;
      this.nSelectedClientID = "0";
      this.sSearchText = "";
      this.sSelectedUnmatchedPLBSearchBy = "Check";
      this.fbcFilterSearch.setValue(this.sSearchText);
      this.startDate = new Date();
      this.startDate.setMonth(this.startDate.getMonth() - 3);
      this.endDate = new Date();
      this.sSelectedsendemailfilter = "All";

      this.searchfiltersvr.clearalluplbsilter();

      this.UnmatchedPLBsSkip = 0;
      this.UnmatchedPLBsdisplaytotalrecordscount = 0;
      this.loadingUnmatchedFilesGrid = true;
      this.Enabledisablebtn(true);
      this.bOninit = true;
      // this.RetriveAllClient();
      this.RetriveUnmatchedPLBs();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public onSelectedKeysChange(e) {
    try {
      const len = this.mySelection.length;

      if (len === 0) {
        if (this.recordselectioncount > 0) {
          this.UnmatchedPLBsItems.forEach((obj1) => {
            let removeitem = this.mySelection.find(
              (obj2) => obj2 === obj1.c042id
            );
            if (removeitem == null || removeitem == undefined) {
              let redata = this.myremove.find((ob) => ob === obj1.c042id);
              if (redata == null || redata == undefined) {
                this.myremove.push(obj1.c042id);
              }
            } else {
              let redata = this.myremove.find((ob) => ob === obj1.c042id);
              var idx = this.myremove.findIndex((ob) => ob === obj1.c042id);
              if (redata != null || redata != undefined) {
                this.myremove.splice(idx, 1);
              }
            }
          });
        }

        if (this.recordselectioncount == 0) {
          this.selectAllState = "unchecked";
          this.selectallflag = false;
          this.recordselectioncount = 0;
          this.myremove = [];
          this.mySelection = [];
        } else if (
          this.recordselectioncount != 0 &&
          this.myremove.length != this.recordselectioncount
        ) {
          this.selectAllState = "indeterminate";
          this.selectallflag = false;
        } else if (
          this.recordselectioncount != 0 &&
          this.myremove.length == this.recordselectioncount
        ) {
          this.selectAllState = "unchecked";
          this.selectallflag = false;
          this.recordselectioncount = 0;
          this.myremove = [];
          this.mySelection = [];
        }
      } else if (
        (len > 0 && len < this.UnmatchedPLBsItems.length) ||
        (len > this.UnmatchedPLBsItems.length &&
          len < this.UnmatchedPLBsdisplaytotalrecordscount)
      ) {
        this.selectAllState = "indeterminate";
        this.selectallflag = false;

        if (this.recordselectioncount > 0) {
          this.UnmatchedPLBsItems.forEach((obj1) => {
            let removeitem = this.mySelection.find(
              (obj2) => obj2 === obj1.c042id
            );
            if (removeitem == null || removeitem == undefined) {
              let redata = this.myremove.find((ob) => ob === obj1.c042id);
              if (redata == null || redata == undefined) {
                this.myremove.push(obj1.c042id);
              }
            } else {
              let redata = this.myremove.find((ob) => ob === obj1.c042id);
              var idx = this.myremove.findIndex((ob) => ob === obj1.c042id);
              if (redata != null || redata != undefined) {
                this.myremove.splice(idx, 1);
              }
            }
          });
        }
      } else if (
        (len == this.UnmatchedPLBsItems.length &&
          len == this.UnmatchedPLBsPageSize &&
          len == this.recordselectioncount) ||
        len == this.UnmatchedPLBsdisplaytotalrecordscount ||
        (this.recordselectioncount > 0 &&
          this.recordselectioncount ==
            this.UnmatchedPLBsdisplaytotalrecordscount)
      ) {
        this.myremove = [];
        this.selectAllState = "checked";
        this.selectallflag = true;
        this.recordselectioncount = this.UnmatchedPLBsdisplaytotalrecordscount;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public onSelectAllChange(checkedState: SelectAllCheckboxState) {
    try {
      if (checkedState === "checked") {
        this.selectallflag = true;
        this.selectAllState = "checked";
        this.myremove = [];
        this.recordselectioncount = this.UnmatchedPLBsdisplaytotalrecordscount;
      } else {
        this.selectallflag = false;
        this.mySelection = [];
        this.selectAllState = "unchecked";
        this.myremove = [];
        this.recordselectioncount = 0;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnDestroy() {
    try {
      this.searchfiltersvr.clearalluplbsilter();
      this.subscription.unsubscribe();
      this.breadcrumbService.showhideFilesbreadcrumb();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSendEmailfilterchange(event: any) {
    try {
      this.sSelectedsendemailfilter = event;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  Enabledisablebtn(status: boolean = false) {
    try {
      this.disabledclient = status;
      this.disabledstartdate = status;
      this.disabledenddate = status;
      this.disabledsearch = status;
      this.disabledapplybtn = status;
      this.disabledclearbtn = status;
      this.disabledsearchBy = status;
      this.disabledsendemail = status;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onPLBExcelExportClick() {
    try {
      if (this.UnmatchedPLBsdisplaytotalrecordscount > 0) {
        this.ExportExcelDownloadConfirmationMessage =
          this.UnmatchedPLBsdisplaytotalrecordscount +
          " records will be Exported, Do you want to continue ?";
        $("#ExportExcelPLBconfirmationModal").modal("show");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  async exportToExcelEmail(sgrid: GridComponent) {
    try {
      this.emailloading = true;

      await this.filedetailService
        .getUnmatchedPLBsList(
          this.neraMasterFileid,
          0,
          this.UnmatchedPLBsdisplaytotalrecordscount,
          this.sSelectedUnmatchedPLBSearchBy,
          this.sSearchText,
          this.datePipe.transform(this.startDate, "yyyyMMdd"),
          this.datePipe.transform(this.endDate, "yyyyMMdd"),
          this.sSelectedsendemailfilter,
          this.sSelectedClientID
        )
        .toPromise()
        .then(
          async (data) => {
            sgrid.data = data["content"];
            await sgrid.saveAsExcel();
            this.emailloading = false;
          },
          (err) => {
            this.emailloading = false;
          }
        );

      // this.subscription.add(
      //   this.filedetailService
      //     .getUnmatchedPLBsList(
      //       0,
      //       this.UnmatchedPLBsdisplaytotalrecordscount,
      //       this.sSelectedUnmatchedPLBSearchBy,
      //       this.sSearchText,
      //       this.datePipe.transform(this.startDate, "yyyyMMdd"),
      //       this.datePipe.transform(this.endDate, "yyyyMMdd"),
      //       this.sSelectedsendemailfilter,
      //       this.sSelectedClientID
      //     )
      //     .subscribe(
      //       (data) => {
      //         console.log(data);

      //         sgrid.data = data["content"];
      //         sgrid.saveAsExcel();
      //         this.emailloading = false;
      //       },
      //       (err) => {
      //         this.emailloading = false;
      //       }
      //     )
      // );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onExportExcelCloseConfirmationClick() {
    try {
      $("#ExportExcelPLBconfirmationModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onExportExcelYesConfirmationClick() {
    this.ClickExportExcel();
  }

  public ClickExportExcel() {
    try {
      document.getElementById("hbtnExportExcel").click();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  PLBExcelExport(args: any): void {
    try {
      this.emailloading = true;
      args.preventDefault();
      const workbook = args.workbook;

      new Workbook(workbook).toDataURL().then((dataUrl: string) => {
        saveAs(dataUrl, this.exportFilename + ".xlsx");
        this.api.insertActivityLog(
          "Unmatched PLB exported to excel for File (" +
            this.dataService.mastererafilename +
          ") ",
          "Unmatched PLB",
          "READ"
        );
        this.emailloading = false;
      });
    } catch (error) {
      this.clsUtility.showError(error);
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
            c042id: string;
            masterfileid: string;
            clientid: string;
            subclientid: string;
            subclientcode: string;
            userid: string;
            username: string;
          } = {
            tsid: "",
            c042id: "",
            masterfileid: "",
            clientid: "",
            subclientid: "",
            subclientcode: "",
            userid: "",
            username: "",
          };

          if (
            this.UnmatchedPLBsItems.find(
              (x) => x.c042id == this.mySelection[index]
            )
          ) {
            let SelectedClaimindex = this.UnmatchedPLBsItems.findIndex(
              (x) => x.c042id == this.mySelection[index]
            );
            this.Inputclientid = this.sSelectedClientID;

            GenerateUnmatchedClaim.tsid = this.UnmatchedPLBsItems[
              SelectedClaimindex
            ].tsid;
            GenerateUnmatchedClaim.c042id = this.UnmatchedPLBsItems[
              SelectedClaimindex
            ].c042id;
            GenerateUnmatchedClaim.masterfileid = this.UnmatchedPLBsItems[
              SelectedClaimindex
            ].nfileid;
            GenerateUnmatchedClaim.clientid = this.UnmatchedPLBsItems[
              SelectedClaimindex
            ].clientid;
            GenerateUnmatchedClaim.userid = this.dataService.SelectedUserid;
            GenerateUnmatchedClaim.username = this.dataService.loginName[
              "_value"
            ];

            allrecordslist.recordslist.push(GenerateUnmatchedClaim);
            if (this.InputAllClaimno.length > 0) {
              this.InputAllClaimno =
                this.InputAllClaimno +
                "," +
                this.UnmatchedPLBsItems[SelectedClaimindex].c042id;
            } else {
              this.InputAllClaimno = this.UnmatchedPLBsItems[
                SelectedClaimindex
              ].c042id;
            }
            console.log(this.InputAllClaimno);
          }
        }
        this.InputGenerateUnmatchedClaim = allrecordslist;
      }

      console.log(this.InputGenerateUnmatchedClaim);
      $("#selectsubclientModal").modal("show");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputSelectSubclientResult($event) {
    try {
      this.mySelection = [];
      this.myremove = [];
      this.recordselectioncount = 0;
      this.selectallflag = false;
      this.selectAllState = "unchecked";
      this.Inputclientid = null;
      this.SelectsubclientChild.ResetComponents();
      if ($event == true) {
        this.UnmatchedPLBsSkip = 0;       
        this.RetriveUnmatchedPLBs();
      }
      $("#selectsubclientModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

}
