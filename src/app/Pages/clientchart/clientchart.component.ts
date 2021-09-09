import { Component, OnInit } from "@angular/core";
import { GoogleChartInterface } from "ng2-google-charts/google-charts-interfaces";
import { ChartSelectEvent } from "ng2-google-charts";
import { isNullOrUndefined } from "util";
import { ChartdataService } from "src/app/Services/chartdata.service";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import * as c3 from "c3";
import * as d3 from "d3";
import * as $ from "jquery";
import { Api } from "./../../Services/api";
import { from } from "rxjs";
import "rxjs/Rx";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from "@angular/forms";

@Component({
  selector: "app-clientchart",
  templateUrl: "./clientchart.component.html",
  styleUrls: ["./clientchart.component.css"]
})
export class ClientchartComponent implements OnInit {
  public cardexpand: boolean = false;
  public currentclient: string = "";
  public tilesummary: any;
  public frmclient: FormGroup;
  private clsUtility: Utility;
  public groupList: any;
  public copygroupList: any;
  public copysubclientlist: any;
  public subClientList: any = [];
  public loading = false;
  public currentclientid: any;
  public currentsubclientid: any;
  public yearlist = new Array();
  constructor(
    fb: FormBuilder,
    public api: Api,
    private dataService: ChartdataService,
    private toastr: ToastrService
  ) {
    this.clsUtility = new Utility(toastr);

    this.frmclient = fb.group({
      c_client: ["", Validators.required],
      c_subclient: [""]
    });
  }

  Client = [
    { clientid: 252, name: "THG26: KYLE ANDERSON MD PLC" },
    { clientid: 259, name: "THG4: Michigan Healthcare Professionals" }
  ];
  Subclient = [
    {
      clientid: 259,
      subclientcode: "THG4S3",
      subclientname: "Oakland Family Practice"
    },
    {
      clientid: 259,
      subclientcode: "THG4S7",
      subclientname:
        "Millennium Medical Group West - Long Term Care of Michigan"
    }
  ];

  SubclientGroup = [];
  cardsData = [];
  cardclientid = "0";
  chartAllData: any;
  chartData: any;
  clientPayments: any;
  ClientMonthlyPayment: any;
  subclientMonthlyPayment: any;
  clientchartName: "";
  selectedYear: "";
  selectedMonth: "";
  isSubClientSelected = false;
  month: any = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC"
  ];
  public clientYearlyChart: GoogleChartInterface = {
    chartType: "ColumnChart",
    // dataTable: this.clientPayments,
    options: { title: "Yearly Payment Summary" }
  };

  public clientMonthlyChart: GoogleChartInterface = {
    chartType: "ColumnChart",
    // dataTable: this.ClientMonthlyPayment,
    options: { title: "" }
  };

  public subClientChart: GoogleChartInterface = {
    chartType: "BarChart",
    // dataTable: this.ClientMonthlyPayment,
    options: { title: "" }
  };

  public revenueTrend: GoogleChartInterface = {
    chartType: "LineChart",
    // dataTable: this.ClientMonthlyPayment,
    options: { title: "" }
  };
  SelectedClientId = 0;

  public pieChartDataPayment: any = {
    chartType: "PieChart",
    dataTable: [
      ["Payment Distribution", "Top 10 Division"],
      ["Oakland Family", 30],
      ["Downriver Oncology", 18],
      ["Womens Health", 12],
      ["Eastpointe", 9],
      ["Premier Internist", 8],
      ["Internal Medicine", 7],
      ["Westland Clinic", 6],
      ["Westland Diagnositic", 4],
      ["Biotech Lab", 3],
      ["Kritzer", 3]
    ],
    options: {
      is3D: true,
      //height:400,
      //legend: 'bottom'
      legend: { position: "right", maxLines: 10 },
      chartArea: { left: 5, top: 5, width: "100%", height: "100%" }
      //title: 'Tasks',
      //colors: ['#1862c6','#DEE4E8','#3a84eb'],
    }
  };

  public pieChartDataAdjustment: any = {
    chartType: "PieChart",
    dataTable: [
      ["Adjustment Distribution", "Top 10 Division"],
      ["Oakland Family", 22],
      ["Downriver Oncology", 20],
      ["Womens Health", 9],
      ["Eastpointe", 20],
      ["Premier Internist", 7],
      ["Internal Medicine", 8],
      ["Westland Clinic", 4],
      ["Westland Diagnositic", 4],
      ["Biotech Lab", 3],
      ["Kritzer", 3]
    ],
    options: {
      is3D: false,
      //height:400,
      //legend: 'bottom'
      legend: { position: "right", maxLines: 10 },
      chartArea: { left: 5, top: 5, width: "100%", height: "100%" },
      //title: 'Tasks',
      colors: ["#1862c6", "#DEE4E8", "#3a84eb", "red", "green"]
    }
  };

  public pieChartDataDenial: any = {
    chartType: "PieChart",
    dataTable: [
      ["Payment Denial", "Top 10 Division"],
      ["Oakland Family", 15],
      ["Downriver Oncology", 33],
      ["Womens Health", 1],
      ["Eastpointe", 1],
      ["Premier Internist", 9],
      ["Internal Medicine", 5],
      ["Westland Clinic", 6],
      ["Westland Diagnositic", 4],
      ["Biotech Lab", 21],
      ["Kritzer", 3]
    ],
    options: {
      is3D: true,
      //height:400,
      //legend: 'bottom'
      legend: { position: "right", maxLines: 10 },
      chartArea: { left: 5, top: 5, width: "100%", height: "100%" }
      //title: 'Tasks',
      //colors: ['#1862c6','#DEE4E8','#3a84eb'],
    }
  };

  public mixtop10: any = {
    chartType: "ComboChart",
    dataTable: [
      ["Month", "Paid", "Adjustment"],
      ["Oakland Family", 3689620, 662500],
      ["Downriver Oncology", 2233626.6, 610464.61],
      ["Womens Health", 1498419.88, 278545.05],
      ["Eastpointe", 1147719.33, 605922.41],
      ["Premier Internist", 964502.66, 204295.97],
      ["Internal Medicine", 817937.88, 246480.48],
      ["Westland Clinic", 722250.52, 113190.24],
      ["Westland Diagnositic", 468932.26, 118641.14],
      ["Biotech Lab", 358734.45, 104721.51],
      ["Kritzer", 335662.74, 79418.79]
    ],
    options: {
      legend: { position: "right", maxLines: 10 },
      //  title : 'Monthly Coffee Production by Country',
      colors: ["orange", "#DEE4E8", "#3a84eb"],
      //vAxis: {title: 'Cups'},
      //hAxis: {title: 'Month'},
      seriesType: "bars",
      series: { 5: { type: "line" } }
    }
  };

  public select(event: ChartSelectEvent) {
    try {
      this.selectedYear = event.selectedRowValues[0];
      if (isNullOrUndefined(this.selectedYear) == false) {
        this.generateMonthlyChart(event.selectedRowValues[0]);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public selectSubClient(event: ChartSelectEvent) {
    try {
      this.selectedMonth = event.selectedRowValues[0];
      if (isNullOrUndefined(this.selectedMonth) == false) {
        this.generateSubclientBarChart(this.isSubClientSelected);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
  generateSubclientBarChart(isFromClient: boolean): any {
    try {
      // alert(JSON.stringify(this.selectedMonth));
      this.subclientMonthlyPayment = [["Code", "Amount"]];
      // console.log('isFromClient'+isFromClient);

      if (isFromClient) {
        // alert('in for');

        // console.log(this.chartData);
        // console.log(subclient.subclientcode);
        // for (const subclient of this.chartData.subclient) {

        // console.log(subclient);
        // console.log(subclient.subclientcode);
        const subclient = this.chartData;
        for (const payment of subclient.payments) {
          if (payment.paymentyear == this.selectedYear) {
            // console.log('payment.paymentyear' + payment.paymentyear);
            const monthlyDistribution = payment.paymentmonthlydistribution;
            // console.log(monthlyDistribution);
            const selectedMonthID = this.month.indexOf(this.selectedMonth);
            // console.log('selectedMonthID' + selectedMonthID);

            if (monthlyDistribution !== "") {
              const splited = monthlyDistribution.split(",");
              let count = 0;
              for (const monthPayment of splited) {
                if (count == selectedMonthID) {
                  this.subclientMonthlyPayment.push([
                    subclient.subclientcode,
                    +monthPayment
                  ]);
                }
                count++;
              }
            }
          }
        }

        // }
      } else {
        for (const subclient of this.chartData.subclient) {
          // console.log(subclient);
          // console.log(subclient.subclientcode);

          for (const payment of subclient.payments) {
            if (payment.paymentyear == this.selectedYear) {
              // console.log(payment.paymentyear);
              const monthlyDistribution = payment.paymentmonthlydistribution;
              // console.log(monthlyDistribution);
              const selectedMonthID = this.month.indexOf(this.selectedMonth);
              // console.log(selectedMonthID);

              if (monthlyDistribution != "") {
                const splited = monthlyDistribution.split(",");
                let count = 0;
                for (const monthPayment of splited) {
                  if (count === selectedMonthID) {
                    this.subclientMonthlyPayment.push([
                      subclient.subclientcode,
                      +monthPayment
                    ]);
                  }
                  count++;
                }
              }
            }
          }
        }
      }

      if (this.subclientMonthlyPayment.length > 0) {
        // console.log(this.subclientMonthlyPayment);
        this.drawChart(
          this.subclientMonthlyPayment,
          "subclientchart",
          this.selectedMonth + " Payment by Sub-Client"
        );
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  generateMonthlyChart(year: any): any {
    try {
      for (const payment of this.chartData.payments) {
        if (payment.paymentyear == year) {
          const monthlyDistribution = payment.paymentmonthlydistribution;
          this.ClientMonthlyPayment = [["Month", "Amount"]];
          if (monthlyDistribution !== "") {
            const splited = monthlyDistribution.split(",");
            let count = 0;
            for (const monthPayment of splited) {
              this.ClientMonthlyPayment.push([
                this.month[count],
                +monthPayment
              ]);
              count++;
            }
          }
        }
      }
      if (this.ClientMonthlyPayment.length == 13) {
        // console.log(this.ClientMonthlyPayment);
        this.drawChart(
          this.ClientMonthlyPayment,
          "clientmonthlychart",
          this.selectedYear + " Monthly Payment Distribution"
        );
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
  topCardsBind() {
    const x = new Array();
    x[0] = ["JAN"];
    x[1] = ["FEB"];
    x[2] = ["MAR"];
    x[3] = ["APR"];
    x[4] = ["MAY"];
    x[5] = ["JUNE"];
    const exp_collection = new Array();
    exp_collection[0] = ["Allowed Amount"];
    exp_collection[1] = [50];
    exp_collection[2] = [210];
    exp_collection[3] = [250];
    exp_collection[4] = [350];
    exp_collection[5] = [400];
    /*     var chart = c3.generate({
    bindto: "#allowedchart",
    data: {
      columns: [
        ["data1", 30, 200, 100, 400, 150, 250],
      
      ]
    }
  }); */
    const charta = c3.generate({
      bindto: "#expectcol",
      data: {
        columns: [["data1", 30, 200, 100, 400, 150, 250]],
        type: "bar"
      },
      bar: {
        width: 10 // this makes bar width 100px
      },

      legend: {
        hide: true
      },
      axis: {
        y: {
          show: false,
          tick: {
            format: d3.format("$,")
          }
        },
        x: {
          show: false,
          type: "category",
          categories: x
        }
      },
      size: {
        height: 100
      },
      color: {
        pattern: ["#0edceb"]
      }
    });
    const chartb = c3.generate({
      bindto: "#totalcheck",
      data: {
        columns: [["data1", 30, 200, 100, 400, 150, 250]]
        //  type: "area-spline"
      },
      bar: {
        width: 10 // this makes bar width 100px
      },

      legend: {
        hide: true
      },
      axis: {
        y: {
          show: false,
          tick: {
            format: d3.format("$,")
          }
        },
        x: {
          show: false,
          type: "category",
          categories: x
        }
      },
      size: {
        height: 100
      },
      color: {
        pattern: ["#420eeb"]
      }
    });
    const chartc = c3.generate({
      bindto: "#totalpaid",
      data: {
        columns: [["data1", 30, 200, 100, 400, 150, 250]],
        type: "bar"
      },
      bar: {
        width: 10 // this makes bar width 100px
      },

      legend: {
        hide: true
      },
      axis: {
        y: {
          show: false,
          tick: {
            format: d3.format("$,")
          }
        },
        x: {
          show: false,
          type: "category",
          categories: x
        }
      },
      size: {
        height: 100
      },
      color: {
        pattern: ["#1862c6"]
      }
    });
    const chartd = c3.generate({
      bindto: "#Adjusted",
      data: {
        columns: [["data1", 30, 200, 100, 400, 150, 250]],
        type: "area-spline"
      },
      bar: {
        width: 10 // this makes bar width 100px
      },

      legend: {
        hide: true
      },
      axis: {
        y: {
          show: false,
          tick: {
            format: d3.format("$,")
          }
        },
        x: {
          show: false,
          type: "category",
          categories: x
        }
      },
      size: {
        height: 100
      },
      color: {
        pattern: ["#eb0ed9"]
      }
    });

    const charte = c3.generate({
      bindto: "#totalpatrespamt",
      data: {
        columns: [["data1", 30, 200, 100, 400, 150, 250]]
        // type: "area-spline"
      },
      bar: {
        width: 10 // this makes bar width 100px
      },

      legend: {
        hide: true
      },
      axis: {
        y: {
          show: false,
          tick: {
            format: d3.format("$,")
          }
        },
        x: {
          show: false,
          type: "category",
          categories: x
        }
      },
      size: {
        height: 100
      },
      color: {
        pattern: ["#54eb0e"]
      }
    });
    const chartf = c3.generate({
      bindto: "#totclaims",
      data: {
        columns: [["data1", 30, 200, 100, 400, 150, 250]],
        type: "area-spline"
      },
      bar: {
        width: 10 // this makes bar width 100px
      },

      legend: {
        hide: true
      },
      axis: {
        y: {
          show: false,
          tick: {
            format: d3.format("$,")
          }
        },
        x: {
          show: false,
          type: "category",
          categories: x
        }
      },
      size: {
        height: 100
      },
      color: {
        pattern: ["#eb2f0e"]
      }
    });
  }
  practiceparam: {} = {};
  // testCall() {
  //   this.api.getFunctionName("practiceList");
  //   const practiceftr = this.api.BindData(this.practiceparam).share();
  //   practiceftr
  //     .map(res => res.json())
  //     .subscribe(res => {
  //       // console.log("Practice list: " + res);
  //     });
  // }
  ngOnInit() {
    this.api.insertActivityLog("Dashboard Viewed", "Dashboard", "READ");
    // testing qinsight service call
    // this.testCall();

    // top card
    // this.topCardsBind();

    /*  filter panel */
    /*     $(document).ready(function() {
      $("#open").click(function() {
        $("#panel").css({
          right: "13px"
        });
      });
    });
    $(document).ready(function() {
      $("#close, .cancel").click(function() {
        $("#panel").css({
          right: "-1500px"
        });
      });
    }); */
    // year filter bind
    /*  const year = new Date();
    this.yearlist[0] = year.getFullYear();
    for (let i = 1; i < 5; i++) {
      this.yearlist[i] = year.getFullYear() - i;
    } */
    /*  End sidepanel */

    try {
      this.getClientlist();
      this.getCardsData("0");
      // this.fetchChartData();
      // this.clientForm = this.fb.group({
      //   clientControl: []
      // });
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  fetchChartData() {
    try {
      const clientId = this.SelectedClientId;
      this.chartAllData = this.dataService.getChartData();
      for (const client of this.chartAllData) {
        if (client.clientid == clientId) {
          this.chartData = client;
          // console.log(this.chartData.clientname);
          // console.log(this.chartData.payments);

          this.clientchartName = this.chartData.clientname;
          this.setClientPayments(this.chartData.payments);
        }
      }

      // this.clientPayments = this.chartData[0].payments;
      // console.log(JSON.stringify(this.chartData));
      // console.log(JSON.stringify(this.chartData[0].payments));
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  setClientPayments(payments: any) {
    try {
      this.clientPayments = [["Year", "Amount"]];
      for (const payment of payments) {
        this.clientPayments.push([
          payment.paymentyear,
          +payment.paymentyearsum
        ]);
      }
      this.drawChart(
        this.clientPayments,
        "clientyearlychart",
        this.clientchartName
      );
      // this.clientYearlyChart.options.title = this.clientchartName;
      // this.clientYearlyChart.dataTable = this.clientPayments;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  drawChart(data: any, type: string, name: string) {
    try {
      // console.log(data);
      // console.log(type);
      // console.log(name);
      switch (type.toLowerCase()) {
        case "clientyearlychart":
          this.clientYearlyChart.dataTable = data;
          // this.clientYearlyChart.options['title'] = name;
          const ccyearlyComponent = this.clientYearlyChart.component;
          const ccyearlyWrapper = ccyearlyComponent.wrapper;
          ccyearlyComponent.draw();
          break;
        case "clientmonthlychart":
          this.clientMonthlyChart.dataTable = data;
          this.clientMonthlyChart.options["title"] = name;
          const ccmonthlyComponent = this.clientMonthlyChart.component;
          const ccmonthlyWrapper = ccmonthlyComponent.wrapper;
          ccmonthlyComponent.draw();
          break;
        case "subclientchart":
          this.subClientChart.dataTable = data;
          this.subClientChart.options["title"] = name;

          const ccsubClientChartComponent = this.subClientChart.component;
          const ccsubClientChartWrapper = ccsubClientChartComponent.wrapper;
          ccsubClientChartComponent.draw();
          break;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onValueChange(event) {
    try {
      // if (event.target.value != 0) {
      // } else {
      //   this.clientPayments = [];
      // }
      const client = this.Client.find(n => n.clientid == event.target.value);
      this.SubclientGroup.length = 0;
      for (const subclient of this.Subclient) {
        if (subclient.clientid === client.clientid) {
          // console.log(subclient.clientid);
          // console.log(client.clientid);
          this.SubclientGroup.push(subclient);
        }
      }
      this.SelectedClientId = client.clientid;
      // this.fetchChartData();
      this.getCardsData(event.target.value);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  totalfiles: number;
  totalcheck: number;
  totalpaidamt: string;
  totaladjsamt: string;
  totalpatrespamt: string;

  getCardsData(clientid: string) {
    this.cardsData = this.dataService.getAllCardsData();
    for (const client of this.cardsData) {
      if (client.clientid == clientid) {
        this.cardclientid = clientid;
        this.totalfiles = client.totalfiles;
        this.totalcheck = client.totalcheck;
        this.totalpaidamt = client.totalpaidamt;
        this.totaladjsamt = client.totaladjsamt;
        this.totalpatrespamt = client.totalpatrespamt;
      }
    }
  }
  onSubclientChange(event) {
    try {
      if (event.target.value == "0") {
        this.getCardsData(this.cardclientid);
      } else {
        this.cardsData = this.dataService.getSubclientCardsData();
        for (const client of this.cardsData) {
          if (client.subclientcode == event.target.value) {
            this.totalfiles = client.totalfiles;
            this.totalcheck = client.totalcheck;
            this.totalpaidamt = client.totalpaidamt;
            this.totaladjsamt = client.totaladjsamt;
            this.totalpatrespamt = client.totalpatrespamt;
          }
        }
      }

      // alert(event.target.value);
      // if (event.target.value != 0) {
      //   this.isSubClientSelected = true;
      //   this.fetchSubClientDetails(event.target.value);
      // } else {
      //   this.isSubClientSelected = false;
      //   this.fetchSubClientDetails(event.target.value);
      // }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  fetchSubClientDetails(subclientcode: any): any {
    try {
      this.chartAllData = this.dataService.getChartData();

      for (const client of this.chartAllData) {
        if (subclientcode == 0) {
          this.chartData = client;
          this.clientchartName = this.chartData.clientname;
          this.setClientPayments(this.chartData.payments);
        } else {
          for (const subclient of client.subclient) {
            // console.log(JSON.stringify(subclient));
            // console.log(subclient.subclientcode);
            if (subclient.subclientcode === subclientcode) {
              this.chartData = subclient;
              // console.log(this.chartData.clientname);
              // console.log(this.chartData.payments);
              this.clientchartName = this.chartData.subclientname;
              this.setClientPayments(this.chartData.payments);
            }
          }
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public listItems: Array<{ text: string; value: number }> = [
    { text: "Small", value: 1 },
    { text: "Medium", value: 2 },
    { text: "Large", value: 3 },
    { text: "XL", value: 4 },
    { text: "XXL", value: 5 }
  ];
  public value: any = [{ text: "Medium", value: 2 }];

  public isItemSelected(itemText: string): boolean {
    return this.value.some(item => item.text === itemText);
  }

  handleFilter(value) {
    this.copygroupList = this.groupList.filter(
      s => s.clientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  subclienthandleFilter(value) {
    this.copysubclientlist = this.subClientList.filter(
      s => s.subclientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  getClientlist() {
    this.loading = true;
    let getclient: { clientid: string; clientstatus: boolean } = {
      clientid: "0",
      clientstatus: false
    };
    let seq = this.api.post("GetClient", getclient);
    seq.subscribe(
      res => {
        this.groupList = res;
        if (
          this.groupList != null &&
          this.groupList != undefined &&
          this.groupList.length > 0
        ) {
          this.loading = false;
          this.copygroupList = this.groupList.slice();
        } else {
          this.groupList = [];
          this.loading = false;
          this.copygroupList = [];
        }
      },
      err => {
        this.loading = false;
        this.clsUtility.LogError(err);
      }
    );
  }

  getsubClientlist(clientid: any) {
    let getsubclient: { clientid: string; subclientcode: string } = {
      clientid: clientid,
      subclientcode: ""
    };
    let seq = this.api.post("SubClient/GetSubClient", getsubclient);
    seq.subscribe(
      res => {
        this.subClientList = res;
        if (
          this.subClientList != null &&
          this.subClientList != undefined &&
          this.subClientList.length > 0
        ) {
          this.copysubclientlist = this.subClientList.slice();
        } else {
          this.subClientList = [];
          this.copysubclientlist = [];
        }
        // console.log("GetSubClient Response");
        // console.log(res);
        if (res != null || res != undefined) {
          // console.log("res not null");
        } else {
          // console.log("res null");
        }
      },
      err => {
        this.clsUtility.LogError(err);
      }
    );
  }

  cmbclientchange(event) {
    // console.log("cmbclientchange");
    this.currentsubclientid = "";
    this.subClientList = [];
    this.copysubclientlist = [];
    // console.log(this.currentclientid);
    // console.log(this.frmclient.controls.c_client.value);

    if (
      this.frmclient.controls.c_client.value == undefined ||
      this.frmclient.controls.c_client.value == ""
    ) {
      this.frmclient.controls["c_subclient"].setValue("");
    } else {
      this.getsubClientlist(this.frmclient.controls.c_client.value);
    }
    // if (this.currentclientid == undefined || this.currentclientid == "") {
    // } else {
    //   this.getsubClientlist(this.currentclientid);
    // }
  }

  cmbsubclientchange() {}

  getsummaryinfo() {
    this.cardexpand = true;
    this.loading = true;

    var nsubclient =
      this.frmclient.controls.c_subclient.value == ""
        ? "0"
        : this.frmclient.controls.c_subclient.value;

    try {
      let getdata: { nclientid: string; nsubclientid: string } = {
        nclientid: this.frmclient.controls.c_client.value,
        nsubclientid: nsubclient
      };
      let seq = this.api.post_edi(
        "api/Dashboard/getDashboardSummaryByFilter",
        getdata
      );
      seq.subscribe(
        res => {
          this.loading = false;
          // console.log('getDashboardSummaryByFilter');
          // console.log(res);
          this.tilesummary = res;
          //this.currentclient = this.copygroupList.filter(s => s.clientid.toString().indexOf(this.frmclient.controls.c_client.value) !== -1)[0].clientname;
          let objclient = this.copygroupList.find(
            s => s.clientid.toString() == this.frmclient.controls.c_client.value
          );
          this.currentclient = this.copygroupList.find(
            s => s.clientid.toString() == this.frmclient.controls.c_client.value
          )["clientname"];
          // console.log('this.currentclient');
          // console.log(this.currentclient)
          // console.log(this.currentclient['clientname']);
          // console.log(this.currentclient[0]);
        },
        err => {
          this.loading = false;
          this.clsUtility.LogError(err);
        }
      );
    } catch (error) {
      this.loading = false;
      this.clsUtility.LogError(error);
    }
  }
}
