import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  OnChanges,
  OnDestroy,
} from "@angular/core";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CoreauthService } from "src/app/Services/coreauth.service";
import {
  GridDataResult,
  PageChangeEvent,
  SelectableSettings,
  DataStateChangeEvent,
} from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Api } from "./../../../Services/api";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { DatePipe } from "@angular/common";
import { Userclient } from "../../../Model/Configuration/Userclient";
import { process, State } from "@progress/kendo-data-query";
import { SubSink } from "subsink";
import { isNullOrUndefined } from "util";
import { Content } from "@angular/compiler/src/render3/r3_ast";
declare var $: any;

@Component({
  selector: "app-userclientmapping",
  templateUrl: "./userclientmapping.component.html",
  styleUrls: ["./userclientmapping.component.css"],
})
export class UserclientmappingComponent implements OnInit, OnDestroy {
  loginGCPUserID: string = "";
  private clsUtility: Utility;
  public userclientmappingEditid: any;
  public newUserclientmapping = true;
  frmuserclient: FormGroup;
  public groupList: any;
  public copygroupList: any;
  public userlist: any;
  public gridView: GridDataResult;
  public pageSize: number = 50;
  //public skip = 0;
  public clientList: any = [];
  public SelectAllClients: any = [];
  public SelectAllSubClients: any = [];
  public subClientList: any = [];
  public selectedValues: any[] = [];
  public MappingResponse: any[] = [];
  public AllMappingResponse: any[] = [];
  dropdownSettings = {};
  selectedItems = [];
  itemList = [];
  public userclientmappinggridData: any = [];
  public selectedclients: number = 0;
  public selectedgroups: number = 0;
  public clsUserClient: Userclient;
  public updatestatus: boolean = true;
  public disabledsave: boolean = false;
  public responsemessage: string = "";
  public bMessageopen: boolean = false;
  private subscription = new SubSink();
  private originalUserClientdetails: any;

  public sort: SortDescriptor[] = [
    {
      field: "firstname",
      dir: "asc",
    },
  ];

  public state: State = {
    skip: 0,
    take: 50,
  };

  public defaultItem: {
    groupdescription: string;
    groupid: number;
    groupname: string;
  } = { groupname: "Select Group...", groupid: 0, groupdescription: "" };

  public mySelection: any[] = [];
  public selectableSettings: SelectableSettings = {
    enabled: true,
    checkboxOnly: true,
  };

  // Received Input from parent component
  @Input() InputUserclientmappingEditid: any;

  // Send Output to parent component
  @Output() OutputUserclientmappingEditResult = new EventEmitter<boolean>();

  OutputuserclientmappingEditResult(data: any) {
    let outuserclientmappingEditResult = data;
    this.OutputUserclientmappingEditResult.emit(outuserclientmappingEditResult);
  }

  constructor(
    private toastr: ToastrService,
    fb: FormBuilder,
    private coreService: CoreauthService,
    public api: Api,
    private datatransfer: DatatransaferService
  ) {
    this.clsUtility = new Utility(toastr);

    this.frmuserclient = fb.group({
      groupid: [""],
      clientid: [""],
      subclientcode: [""],
    });
  }

  public selectedCallback = (args) => args.dataItem;

  ngOnInit() {
    try {
      this.userlist = [];
      this.itemList = [];
      this.gridView = null;
      this.subscription.add(
        this.datatransfer.loginGCPUserID.subscribe((data) => {
          this.loginGCPUserID = data;
        })
      );
      this.getGroupList();
      this.getClientlist();
      if (
        this.InputUserclientmappingEditid != null &&
        this.InputUserclientmappingEditid != 0
      ) {
        this.newUserclientmapping = false;
        this.userclientmappingEditid = this.InputUserclientmappingEditid;
        this.getuserclientmappingById(this.userclientmappingEditid);
      } else {
        this.newUserclientmapping = true;
      }

      this.dropdownSettings = {
        singleSelection: false,
        text: "Select Practice Name",
        selectAllText: "Select All",
        unSelectAllText: "UnSelect All",
        enableSearchFilter: true,
        classes: "myclass custom-class-example",
        noDataLabel: "No practice is active",
        badgeShowLimit: 2,
        disabled: true,
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnChanges() {
    try {
      this.userlist = [];
      this.itemList = [];
      this.gridView = null;
      if (
        this.InputUserclientmappingEditid != null &&
        this.InputUserclientmappingEditid != 0
      ) {
        this.newUserclientmapping = false;
        this.userclientmappingEditid = this.InputUserclientmappingEditid;
        this.getuserclientmappingById(this.userclientmappingEditid);
      } else {
        this.newUserclientmapping = true;
        this.state = {
          skip: 0,
          take: 50,
        };
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnClose() {
    try {
      this.bMessageopen = false;
      this.userlist = [];
      this.itemList = [];
      this.loadItems();
      this.frmuserclient.reset();
      this.disabledsave = false;
      this.state = {
        skip: 0,
        take: 50,
      };

      this.dropdownSettings = {
        singleSelection: false,
        text: "Select Practice Name",
        selectAllText: "Select All",
        unSelectAllText: "UnSelect All",
        enableSearchFilter: true,
        classes: "myclass custom-class-example",
        noDataLabel: "No practice is active",
        badgeShowLimit: 2,
        disabled: true,
      };

      this.OutputuserclientmappingEditResult(true);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getGroupList() {
    try {
      this.coreService.getGroupList().subscribe(
        (data) => {
          if (!isNullOrUndefined(data) && !isNullOrUndefined(data["content"])) {
            this.groupList = data["content"];
            if (
              !isNullOrUndefined(this.groupList) &&
              this.groupList.length > 0
            ) {
              this.copygroupList = this.groupList.slice();
            } else {
              this.copygroupList = [];
            }
            this.selectedgroups = 0;
          }
        },
        (err) => {
          this.clsUtility.LogError(err);
        }
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnchangeGroup(event: any) {
    try {
      if (
        this.frmuserclient.controls.groupid.value == null ||
        this.frmuserclient.controls.groupid.value == ""
      ) {
        this.mySelection = [];
        this.userlist = [];
        this.selectedgroups = 0;
        // this.skip = 0;
        this.state.skip = 0;
        this.state = {
          skip: 0,
          take: 50,
        };
        this.loadItems();
        this.toastr.warning("Please Select Group");
      } else {
        this.mySelection = [];
        this.userlist = [];
        this.state.skip = 0;
        this.state = {
          skip: 0,
          take: 50,
        };
        // this.skip = 0;
        this.getgroupwiseuser(this.frmuserclient.controls.groupid.value);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    if (this.userlist != undefined && this.userlist != null) {
      if (this.userlist.length > 0) {
        this.state = state;
        if (state.filter != undefined && state.filter != null) {
          state.filter.filters.forEach((f) => {
            if (
              f["field"] == "firstname" ||
              f["field"] == "lastname" ||
              f["field"] == "email"
            ) {
              if (f["value"] != null) {
                f["value"] = f["value"].trim();
              }
            }
          });
        }
        this.gridView = process(this.userlist, this.state);
      } else {
        this.state = state;
      }
    }
  }

  handleFilter(value) {
    this.copygroupList = this.groupList.filter(
      (s) => s.groupname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  getgroupwiseuser(groupID) {
    try {
      this.coreService.getgroupwiseuser(groupID).subscribe(
        (data) => {
          if (data != null && data != undefined) {
            this.userlist = [];
            this.userlist = data;
            if (this.userlist != null || this.userlist != undefined) {
              if (this.userlist.length == 0) {
                this.gridView = null;
                this.state = {
                  skip: 0,
                  take: 50,
                  filter: null,
                };

                this.toastr.info("No user present in group");
              } else {
                if (this.newUserclientmapping != true) {
                  if (
                    this.userclientmappinggridData[0].groupid ==
                    this.frmuserclient.controls.groupid.value
                  ) {
                    if (this.userclientmappinggridData.length > 0) {
                      this.mySelection = this.userlist.filter(
                        (y) =>
                          y.userid.toString() ==
                          this.userclientmappinggridData[0].userid.toString()
                      );
                    }
                    this.userlist.splice(
                      this.userlist.indexOf(this.mySelection[0]),
                      1
                    );
                    this.userlist.unshift(this.mySelection[0]);
                  } else {
                  }
                }
              }
            }
            this.loadItems();
            // this.loading = false;
          }
        },
        (err) => {
          // this.loading = false;
          this.clsUtility.LogError(err);
        }
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadItems(): void {
    try {
      if (this.userlist != undefined && this.userlist != null) {
        if (this.userlist.length > 0) {
          this.gridView = process(this.userlist, this.state);
        }
      } else {
        this.gridView = null;
      }
      // if (this.userlist != undefined && this.userlist != null) {
      //   if (this.userlist.length > 0) {
      //     this.gridView = {
      //       data: orderBy(
      //         this.userlist.slice(
      //           this.state.skip,
      //           this.state.skip + this.state.take
      //         ),
      //         this.sort
      //       ),
      //       total: this.userlist.length
      //     };
      //     // this.gridView = process(this.userlist, this.state);
      //   } else {
      //     this.gridView = this.userlist;
      //     // this.gridView = process(this.userlist, this.state);
      //   }
      // }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChange(event: PageChangeEvent): void {
    try {
      this.state.skip = event.skip;
      this.loadItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public sortChange(sort: SortDescriptor[]): void {
    try {
      this.sort = sort;
      this.loadItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getClientlist() {
    try {
      // this.loading = true;
      let getclient: { clientid: string; clientstatus: boolean } = {
        clientid: "0",
        clientstatus: true,
      };
      let seq = this.api.post("GetClient", getclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.clientList = res;
            if (
              this.clientList != null &&
              this.clientList != undefined &&
              this.clientList.length > 0
            ) {
              this.SelectAllClients = this.clientList;
              // this.loading = false;
            } else {
              this.clientList = [];
              this.SelectAllClients = [];
              // this.loading = false;
              this.clsUtility.showInfo("No group is active");
            }
          },
          (err) => {
            // this.loading = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  cmbclientchange() {
    try {
      this.frmuserclient.controls["subclientcode"].setValue("");
      this.state.skip = 0;
      this.state.take = 50;

      if (
        this.frmuserclient.controls.clientid.value == undefined ||
        this.frmuserclient.controls.clientid.value == ""
      ) {
        this.subClientList = [];
        this.itemList = [];
        this.selectedValues = [];
        this.SelectAllSubClients = [];
        this.selectedclients = 0;
        this.dropdownSettings = {
          singleSelection: false,
          text: "Select Practice Name",
          selectAllText: "Select All",
          unSelectAllText: "UnSelect All",
          enableSearchFilter: true,
          classes: "myclass custom-class-example",
          noDataLabel: "No practice is active",
          badgeShowLimit: 2,
          disabled: true,
        };

        $(".custom-class-example")
          .find(".filter-select-all")
          .css("display", "none");
      } else {
        this.dropdownSettings = {
          singleSelection: false,
          text: "Select Practice Name",
          selectAllText: "Select All",
          unSelectAllText: "UnSelect All",
          enableSearchFilter: true,
          classes: "myclass custom-class-example",
          noDataLabel: "No practice is active",
          badgeShowLimit: 2,
          disabled: false,
        };

        this.getsubClientlist(this.frmuserclient.controls.clientid.value);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getsubClientlist(clientid: any) {
    try {
      this.dropdownSettings = {
        singleSelection: false,
        text: "Select Practice Name",
        selectAllText: "Select All",
        unSelectAllText: "UnSelect All",
        enableSearchFilter: true,
        classes: "myclass custom-class-example",
        noDataLabel: "No practice is active",
        badgeShowLimit: 2,
        disabled: false,
      };

      let getsubclient: {
        clientid: string;
        subclientcode: string;
        subclientstatus: boolean;
      } = {
        clientid: clientid,
        subclientcode: "",
        subclientstatus: true,
      };
      let seq = this.api.post("SubClient/GetSubClient", getsubclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            if (res != null || res != undefined) {
              this.subClientList = res;
            } else {
              this.subClientList = [];
            }

            this.SelectAllSubClients = this.subClientList;

            this.itemList = [];
            this.selectedValues = [];
            if (this.subClientList.length > 0) {
              this.subClientList.forEach((obj) => {
                let data = {
                  id: obj.subclientcode,
                  itemName: obj.subclientname,
                };

                this.itemList.push(data);
              });

              if (this.itemList.length > 0) {
                $(".custom-class-example")
                  .find(".filter-select-all")
                  .css("display", "block");
              }

              if (this.newUserclientmapping != true) {
                if (this.userclientmappinggridData.length > 0) {
                  let arrUsers1 = [];

                  this.subClientList.filter((y) => {
                    if (
                      y.subclientcode ==
                      this.userclientmappinggridData[0].subclientcode
                    ) {
                      arrUsers1.push({
                        id: y.subclientcode,
                        itemName: y.subclientname,
                      });
                    }

                    this.selectedValues = arrUsers1;
                  });
                }
              }
            } else {
              this.itemList = [];
              this.subClientList = [];
              this.selectedValues = [];
              $(".custom-class-example")
                .find(".filter-select-all")
                .css("display", "none");
            }
          },
          (err) => {
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleClientFilter(value) {
    this.clientList = this.SelectAllClients.filter(
      (s) => s.clientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  getuserclientmappingById(userclientid: any) {
    try {
      let param: {
        v_userclientmappingid: string;
        v_clientid: string;
        v_subclientid: string;
        searchtext: string;
        pageno: number;
        pagesize: number;
      } = {
        v_userclientmappingid: userclientid,
        v_clientid: "0",
        v_subclientid: "0",
        searchtext: "",
        pageno: 0,
        pagesize: 50,
      };

      let seq = this.api.post("UserClientMapping", param);
      this.subscription.add(
        seq.subscribe(
          (data) => {
            if (data != null || data != undefined) {
              this.userclientmappinggridData = data["content"];
              if (
                this.userclientmappinggridData != null ||
                this.userclientmappinggridData != undefined
              ) {
                this.originalUserClientdetails = null;
                this.originalUserClientdetails = {
                  ...this.userclientmappinggridData,
                };

                this.clsUserClient = this.userclientmappinggridData;
                this.updatestatus = this.userclientmappinggridData[0].status;
                this.selectedgroups = Number(
                  this.userclientmappinggridData[0].groupid
                );
                this.getgroupwiseuser(this.selectedgroups);
                this.selectedclients = Number(
                  this.userclientmappinggridData[0].clientid
                );
                this.getsubClientlist(this.selectedclients);
              } else {
              }
            }
          },
          (error) => {
            this.clsUtility.LogError(error);
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  saveuserclientmapping() {
    try {
      this.disabledsave = true;
      if (this.mySelection.length > 0) {
        let client = "";
        let subclient = "";
        let subclientcode = "";
        let clientname = "";
        let username = "";

        if (
          this.frmuserclient.controls.clientid.value == undefined ||
          this.frmuserclient.controls.clientid.value == ""
        ) {
          client = "0";
        } else {
          client = this.frmuserclient.controls.clientid.value;
          clientname = this.clientList.find(
            (x) => x.clientid == this.frmuserclient.controls.clientid.value
          ).clientname;
        }

        if (
          (this.frmuserclient.controls.subclientcode.value == undefined ||
            this.frmuserclient.controls.subclientcode.value == "") &&
          this.selectedValues.length > 0
        ) {
          subclient = "0";
        } else {
          subclient = Array.prototype.map
            .call(
              this.frmuserclient.controls.subclientcode.value,
              (s) => s.itemName + " - " + s.id
            )
            .toString();
        }

        if (this.mySelection.length > 0) {
          username = Array.prototype.map
            .call(this.mySelection, (s1) => s1.firstname + " " + s1.lastname)
            .toString();
        }

        const datepipe = new DatePipe("en-US");
        const currentDate = datepipe.transform(
          Date.now(),
          "yyyy-MM-ddTHH:mm:ss.SSSZ"
        );

        if (this.validateUserClientmapping()) {
          if (this.newUserclientmapping) {
            let arrUsers = {
              userclientmapping: [],
            };

            if (this.selectedValues.length > 0) {
              for (var i in this.mySelection) {
                for (var j in this.selectedValues) {
                  this.clsUserClient = new Userclient();
                  this.clsUserClient.id = "";
                  this.clsUserClient.userid = this.mySelection[i].userid;
                  (this.clsUserClient.firstname = this.mySelection[
                    i
                  ].firstname),
                    (this.clsUserClient.lastname = this.mySelection[
                      i
                    ].lastname),
                    (this.clsUserClient.username = this.mySelection[i].email),
                    (this.clsUserClient.clientid = Number(client)),
                    (this.clsUserClient.clientname = clientname),
                    (this.clsUserClient.subclientcode = this.selectedValues[
                      j
                    ].id),
                    (this.clsUserClient.subclientname = this.selectedValues[
                      j
                    ].itemName),
                    (this.clsUserClient.createdon = currentDate),
                    (this.clsUserClient.createdby = this.loginGCPUserID),
                    (this.clsUserClient.groupid = this.frmuserclient.controls.groupid.value);
                  this.clsUserClient.status = true;

                  arrUsers.userclientmapping.push(this.clsUserClient);
                }
              }
            } else {
              for (var i in this.mySelection) {
                this.clsUserClient = new Userclient();
                this.clsUserClient.id = "";
                (this.clsUserClient.userid = this.mySelection[i].userid),
                  (this.clsUserClient.firstname = this.mySelection[
                    i
                  ].firstname),
                  (this.clsUserClient.lastname = this.mySelection[i].lastname),
                  (this.clsUserClient.username = this.mySelection[i].email),
                  (this.clsUserClient.clientid = Number(client)),
                  (this.clsUserClient.clientname = clientname),
                  (this.clsUserClient.subclientcode = subclient),
                  (this.clsUserClient.subclientname = subclient),
                  (this.clsUserClient.createdon = currentDate),
                  (this.clsUserClient.createdby = this.loginGCPUserID),
                  (this.clsUserClient.groupid = this.frmuserclient.controls.groupid.value);
                this.clsUserClient.status = true;

                arrUsers.userclientmapping.push(this.clsUserClient);
              }
            }

            let seq = this.api.post("UserClientMapping/Save", arrUsers);
            this.subscription.add(
              seq.subscribe(
                (data1) => {
                  let response: { message: string; status: string };
                  response = <any>data1;

                  if (response.message == "" && response.status == "1") {
                    this.clsUtility.showSuccess(
                      "User mapping saved successfully."
                    );
                    this.userlist = [];
                    this.state.skip = 0;
                    this.loadItems();
                    this.disabledsave = false;
                    this.selectedclients = 0;
                    this.selectedgroups = 0;
                    this.selectedValues = [];
                    this.itemList = [];
                    this.frmuserclient.reset();
                    this.OutputuserclientmappingEditResult(true);
                  } else if (response.message != "" && response.status == "1") {
                    //this.clsUtility.showWarning(response.message);
                    this.responsemessage = response.message
                      .toString()
                      .replace(/,/g, "\n");
                    this.bMessageopen = true;
                    $("#messagesubclientmodal").modal("show");

                    this.userlist = [];
                    this.state.skip = 0;
                    this.loadItems();
                    this.disabledsave = false;
                    this.selectedclients = 0;
                    this.selectedgroups = 0;
                    this.selectedValues = [];
                    this.itemList = [];
                    this.frmuserclient.reset();
                    this.OutputuserclientmappingEditResult(true);
                  } else if (response.message != "" && response.status == "2") {
                    //this.clsUtility.showWarning(response.message);
                    this.responsemessage = response.message
                      .toString()
                      .replace(/,/g, "\n");
                    this.bMessageopen = true;
                    $("#messagesubclientmodal").modal("show");
                    this.disabledsave = false;
                    this.OutputuserclientmappingEditResult(false);
                  } else if (response.message == "" && response.status == "0") {
                    this.clsUtility.showError(
                      "Error while saving user mapping"
                    );
                    this.disabledsave = false;
                    this.OutputuserclientmappingEditResult(false);
                  }

                  this.api.insertActivityLog(
                    "Added User Mapping for Group name: " +
                      clientname +
                      ", Practice : " +
                      (subclient.toString() == "0"
                        ? ""
                        : subclient.toString() + "") +
                      ", Username : " +
                      (username.toString() == "0" ? "" : username.toString()) +
                      "",
                    "User Mapping",
                    "ADD"
                  );
                },
                (err) => {
                  this.clsUtility.LogError(err);
                }
              )
            );
          } else {
            let arrUsers = {
              userclientmapping: [],
            };

            if (this.selectedValues.length > 0) {
              for (var i in this.mySelection) {
                for (var j in this.selectedValues) {
                  this.clsUserClient = new Userclient();
                  this.clsUserClient.id = this.InputUserclientmappingEditid;
                  (this.clsUserClient.userid = this.mySelection[i].userid),
                    (this.clsUserClient.firstname = this.mySelection[
                      i
                    ].firstname),
                    (this.clsUserClient.lastname = this.mySelection[
                      i
                    ].lastname),
                    (this.clsUserClient.username = this.mySelection[i].email),
                    (this.clsUserClient.clientid = Number(client)),
                    (this.clsUserClient.clientname = clientname),
                    (this.clsUserClient.subclientcode = this.selectedValues[
                      j
                    ].id),
                    (this.clsUserClient.subclientname = this.selectedValues[
                      j
                    ].itemName),
                    (this.clsUserClient.createdon = currentDate),
                    (this.clsUserClient.createdby = this.loginGCPUserID),
                    (this.clsUserClient.groupid = this.frmuserclient.controls.groupid.value);
                  this.clsUserClient.status = this.updatestatus;

                  arrUsers.userclientmapping.push(this.clsUserClient);
                }
              }
            } else {
              for (var i in this.mySelection) {
                this.clsUserClient = new Userclient();
                this.clsUserClient.id = this.InputUserclientmappingEditid;
                (this.clsUserClient.userid = this.mySelection[i].userid),
                  (this.clsUserClient.firstname = this.mySelection[
                    i
                  ].firstname),
                  (this.clsUserClient.lastname = this.mySelection[i].lastname),
                  (this.clsUserClient.username = this.mySelection[i].email),
                  (this.clsUserClient.clientid = Number(client)),
                  (this.clsUserClient.clientname = clientname),
                  (this.clsUserClient.subclientcode = subclient),
                  (this.clsUserClient.subclientname = subclient),
                  (this.clsUserClient.createdon = currentDate),
                  (this.clsUserClient.createdby = this.loginGCPUserID),
                  (this.clsUserClient.groupid = this.frmuserclient.controls.groupid.value);
                this.clsUserClient.status = this.updatestatus;

                arrUsers.userclientmapping.push(this.clsUserClient);
              }
            }

            //#region "Get Modified Items of UserClientMapping"

            let oldusermappingchangeditems = {};
            let ModifiedUsermappingItems = "";
            let changedusermappingitems: any = this.clsUtility.jsondiff(
              this.originalUserClientdetails,
              JSON.parse(JSON.stringify(arrUsers["userclientmapping"]))
            );

            if (
              !isNullOrUndefined(changedusermappingitems) &&
              changedusermappingitems != {}
            ) {
              let count = Object.keys(changedusermappingitems).length;
              for (let i = 0; i < count; i++) {
                {
                  if (
                    JSON.stringify(changedusermappingitems[i]["groupid"]) ==
                    this.originalUserClientdetails[0]["groupid"]
                  ) {
                    delete changedusermappingitems[i]["groupid"];
                  }

                  if (
                    JSON.stringify(changedusermappingitems[i]["clientid"]) ==
                    this.originalUserClientdetails[0]["clientid"]
                  ) {
                    delete changedusermappingitems[i]["clientid"];
                  }

                  if (
                    isNullOrUndefined(
                      JSON.stringify(
                        changedusermappingitems["subclientdivisioncode"]
                      )
                    ) &&
                    isNullOrUndefined(
                      this.originalUserClientdetails[0]["subclientdivisioncode"]
                    )
                  ) {
                    delete changedusermappingitems[i]["subclientdivisioncode"];
                  }
                }

                if (
                  !isNullOrUndefined(changedusermappingitems) &&
                  JSON.stringify(changedusermappingitems[i]) != "{}"
                ) {
                  for (
                    let index = 0;
                    index < Object.keys(this.originalUserClientdetails).length;
                    index++
                  ) {
                    if (
                      this.originalUserClientdetails[index]["groupid"] ==
                        changedusermappingitems[i]["groupid"] &&
                      this.originalUserClientdetails[index]["clientid"] ==
                        changedusermappingitems[i]["clientid"] &&
                      this.originalUserClientdetails[index]["firstname"] ==
                        changedusermappingitems[i]["firstname"] &&
                      this.originalUserClientdetails[index]["lastname"] ==
                        changedusermappingitems[i]["lastname"] &&
                      this.originalUserClientdetails[index]["clientname"] ==
                        changedusermappingitems[i]["clientname"] &&
                      this.originalUserClientdetails[index]["subclientcode"] ==
                        changedusermappingitems[i]["subclientcode"] &&
                      this.originalUserClientdetails[index]["subclientname"] ==
                        changedusermappingitems[i]["subclientname"] &&
                      this.originalUserClientdetails[index]["username"] ==
                        changedusermappingitems[i]["username"]
                    ) {
                      delete changedusermappingitems[i];
                    }
                  }
                } else {
                  delete changedusermappingitems[i];
                }
              }

              for (let key of Object.keys(changedusermappingitems)) {
                let oldvalue: string = this.originalUserClientdetails[key];
                oldusermappingchangeditems[key] = oldvalue;
              }

              if (
                !isNullOrUndefined(changedusermappingitems) &&
                JSON.stringify(changedusermappingitems) != "{}"
              ) {
                ModifiedUsermappingItems =
                  "OLD : " +
                  JSON.stringify(oldusermappingchangeditems) +
                  ",NEW : " +
                  JSON.stringify(changedusermappingitems);
              }
            }

            //#endregion "Get Modified Items of UserClientMapping"

            let seq = this.api.post("UserClientMapping/Update", arrUsers);
            this.subscription.add(
              seq.subscribe(
                (data1) => {
                  let response: { message: string; status: string };
                  response = <any>data1;

                  if (response.message == "" && response.status == "1") {
                    this.clsUtility.showSuccess(
                      "User mapping updated successfully."
                    );
                    this.userlist = [];
                    this.state.skip = 0;
                    this.loadItems();
                    this.disabledsave = false;
                    this.selectedclients = 0;
                    this.selectedgroups = 0;
                    this.selectedValues = [];
                    this.itemList = [];
                    this.frmuserclient.reset();
                    this.OutputuserclientmappingEditResult(true);
                  } else if (response.message != "" && response.status == "1") {
                    //this.clsUtility.showWarning(response.message);
                    this.responsemessage = response.message
                      .toString()
                      .replace(/,/g, "\n");
                    this.bMessageopen = true;
                    $("#messagesubclientmodal").modal("show");
                    this.userlist = [];
                    this.state.skip = 0;
                    this.loadItems();
                    this.disabledsave = false;
                    this.selectedclients = 0;
                    this.selectedgroups = 0;
                    this.selectedValues = [];
                    this.itemList = [];
                    this.frmuserclient.reset();
                    this.OutputuserclientmappingEditResult(true);
                  } else if (response.message != "" && response.status == "2") {
                    //this.clsUtility.showWarning(response.message);
                    this.responsemessage = response.message
                      .toString()
                      .replace(/,/g, "\n");
                    this.bMessageopen = true;
                    $("#messagesubclientmodal").modal("show");
                    this.disabledsave = false;
                    this.OutputuserclientmappingEditResult(false);
                  } else if (response.message == "" && response.status == "0") {
                    this.clsUtility.showError(
                      "Error while saving user mapping"
                    );
                    this.disabledsave = false;
                    this.OutputuserclientmappingEditResult(false);
                  }

                  this.api.insertActivityLogPostcall(
                    "Updated User Mapping for Group name: " +
                      clientname +
                      ", Practice : " +
                      (subclient.toString() == "0"
                        ? ""
                        : subclient.toString() + "") +
                      ", Username : " +
                      (username.toString() == "0" ? "" : username.toString()) +
                      ModifiedUsermappingItems,
                    "User Mapping",
                    "UPDATE"
                  );
                },
                (err) => {
                  this.clsUtility.LogError(err);
                }
              )
            );
          }
        }
      } else {
        this.clsUtility.showWarning(
          "Plese select atleast one user for mapping"
        );
        this.disabledsave = false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  validateUserClientmapping() {
    try {
      if (
        this.mySelection.length != 0 &&
        this.selectedclients != 0 &&
        this.selectedclients != null &&
        this.selectedclients != undefined &&
        this.selectedgroups != 0 &&
        this.selectedgroups != null &&
        this.selectedgroups != undefined
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ResetComponents() {
    try {
      this.userlist = [];
      this.state.skip = 0;
      this.itemList = [];
      this.loadItems();
      this.disabledsave = false;
      this.selectedclients = 0;
      this.selectedgroups = 0;
      this.selectedValues = [];
      this.frmuserclient.reset();
      this.InputUserclientmappingEditid = null;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnMessageModel() {
    try {
      this.bMessageopen = false;
      $("#messagesubclientmodal").modal("hide");
      // this.userlist = [];
      // this.skip = 0;
      // this.itemList = [];
      // this.loadItems();
      // this.frmuserclient.reset();
      // this.disabledsave = false;

      // this.dropdownSettings = {
      //   singleSelection: false,
      //   text: "Select Sub Client Name",
      //   selectAllText: "Select All",
      //   unSelectAllText: "UnSelect All",
      //   enableSearchFilter: true,
      //   classes: "myclass custom-class-example",
      //   noDataLabel: "No subclient is active",
      //   badgeShowLimit: 2,
      //   disabled: true
      // };

      // this.OutputuserclientmappingEditResult(true);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onDeSelectAll(items: any) {
    try {
      this.selectedValues = [];
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
}
