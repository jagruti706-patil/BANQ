import { Component, OnInit, OnDestroy } from "@angular/core";
import { SortDescriptor, orderBy, GroupDescriptor,process } from "@progress/kendo-data-query";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { GridDataResult } from "@progress/kendo-angular-grid";
import { isNullOrUndefined } from "util";
import { SubSink } from "subsink";
import { FileDetailsService } from "src/app/Services/file-details.service";

@Component({
  selector: "app-file-summary-info",
  templateUrl: "./file-summary-info.component.html",
  styleUrls: ["./file-summary-info.component.css"]
})
export class FileSummaryInfoComponent implements OnInit, OnDestroy {
  public FileSummaryInfoGridView: GridDataResult;
  FileSummaryInfoItems: any[] = [];
  public FileSummaryInfoResponse: any;
  private subscription = new SubSink();
  public sort: SortDescriptor[] = [];
  private clsUtility: Utility;
  claimtotalpaid: string;
  loading: boolean = false;
  groups: GroupDescriptor[]=[];

  constructor(
    private toastr: ToastrService,
    private filedetailService: FileDetailsService
  ) {
    this.clsUtility = new Utility(toastr);
  }

  ngOnInit() {}

  resetGrid() {
    try {
      this.FileSummaryInfoGridView = null;
      this.FileSummaryInfoResponse = null;
      this.FileSummaryInfoItems = [];
      this.claimtotalpaid = null;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getFileSummaryInfo(nspliid: string) {
    try {
      let summaryinfoinput: {
        nspliid: string;
      } = {
        nspliid: nspliid
      };
      this.resetGrid();
      this.loading = true;
      this.subscription.add(
        this.filedetailService.getFileSummaryInfo(summaryinfoinput).subscribe(
          data => {
            console.log(data);
            if (data) {
              this.FileSummaryInfoResponse = data;
              if (this.FileSummaryInfoResponse[0].content)
                this.FileSummaryInfoItems = this.FileSummaryInfoResponse[0].content.content;
              this.claimtotalpaid = this.FileSummaryInfoResponse[0].claimtotalpaid;
              // this.loadItems();
              this.groupItem();
            }
            this.loading = false;
          },
          error => {
            this.loading = false;
            this.clsUtility.LogError(error);
          }
        )
      );
    } catch (error) {
      this.loading = false;
      this.clsUtility.showError(error);
    }
  }

  // sortChange(sort: SortDescriptor[]): void {
  //   try {
  //     this.sort = sort;
  //     this.loadItems();
  //   } catch (error) {
  //     this.clsUtility.LogError(error);
  //   }
  // }

  // private loadItems(): void {
  //   try {
  //     if (!isNullOrUndefined(this.FileSummaryInfoItems)) {
  //       if (this.FileSummaryInfoItems.length > 0) {
  //         this.FileSummaryInfoGridView = {
  //           data: orderBy(this.FileSummaryInfoItems, this.sort),
  //           total: this.FileSummaryInfoItems.length
  //         };
  //       }
  //     }
  //   } catch (error) {
  //     this.clsUtility.LogError(error);
  //   }
  // }

  public groupChange(groups: GroupDescriptor[]): void {
    this.groups = groups;
    this.groupItem();
  }
  private groupItem(): void {
    try {
      if (!isNullOrUndefined(this.FileSummaryInfoItems)) {
        if (this.FileSummaryInfoItems.length > 0) {
          this.FileSummaryInfoGridView = process(
            this.FileSummaryInfoItems,
            { group: this.groups }
          );
        }
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
}
