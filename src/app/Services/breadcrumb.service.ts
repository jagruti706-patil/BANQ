import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class BreadcrumbService {
  varbreadcrumb: boolean = false;
  varfilesummary: boolean = false;
  varchecksummary: boolean = false;
  varclaimsvcsummary: boolean = false;
  varsplitfilessummary: boolean = false;
  varplbsummary: boolean = false;
  varreportfilesummary: boolean = false;

  varFilesbreadcrumb: boolean = false;
  varMasterFilesbreadcrumb: boolean = false;
  varSplitFilesbreadcrumb: boolean = false;
  varUnMatchedClaimsbreadcrumb: boolean = false;
  varFilesClaimDetailsbreadcrumb: boolean = false;
  varUnMatchedPLBsbreadcrumb: boolean = false;

  constructor() {
    this.varbreadcrumb = false;
    this.varFilesbreadcrumb = false;
  }

  showbreadcrumb() {
    this.varbreadcrumb = true;
  }

  hidebreadcrumb() {
    this.varbreadcrumb = false;
  }

  showfilesummary() {
    this.varfilesummary = true;
    this.varchecksummary = false;
    this.varclaimsvcsummary = false;
    this.varplbsummary = false;
  }

  hidefilesummary() {
    this.varfilesummary = false;
    this.varchecksummary = false;
    this.varclaimsvcsummary = false;
    this.varplbsummary = false;
  }

  showchecksummary() {
    this.varfilesummary = true;
    this.varchecksummary = true;
    this.varclaimsvcsummary = false;
    this.varplbsummary = false;
  }

  hidechecksummary() {
    this.varfilesummary = true;
    this.varchecksummary = false;
    this.varclaimsvcsummary = false;
    this.varplbsummary = false;
  }

  showclaimsvcsummary() {
    this.varfilesummary = true;
    this.varchecksummary = true;
    this.varclaimsvcsummary = true;
    this.varplbsummary = false;
  }

  hideclaimsvcsummary() {
    this.varfilesummary = true;
    this.varchecksummary = true;
    this.varclaimsvcsummary = false;
    this.varplbsummary = false;
  }

  showplbsummary() {
    this.varfilesummary = true;
    this.varchecksummary = true;
    this.varclaimsvcsummary = false;
    this.varplbsummary = true;
  }

  hideplbsummary() {
    this.varfilesummary = true;
    this.varchecksummary = true;
    this.varclaimsvcsummary = false;
    this.varplbsummary = false;
  }

  showall() {
    this.varfilesummary = true;
    this.varchecksummary = true;
    this.varclaimsvcsummary = true;
    this.varsplitfilessummary = true;
    this.varplbsummary = true;
    this.varreportfilesummary = true;
  }

  hideall() {
    this.varfilesummary = false;
    this.varchecksummary = false;
    this.varclaimsvcsummary = false;
    this.varsplitfilessummary = false;
    this.varplbsummary = false;
    this.varreportfilesummary = false;
  }

  showsplitfilesummary() {
    this.varsplitfilessummary = true;
  }

  hidesplitfilesummary() {
    this.varsplitfilessummary = false;
  }

  showreportfilesummary() {
    this.varfilesummary = true;
    this.varchecksummary = false;
    this.varclaimsvcsummary = false;
    this.varplbsummary = false;
    this.varreportfilesummary = true;
  }

  hidereportfilesummary() {
    this.varfilesummary = true;
    this.varchecksummary = false;
    this.varclaimsvcsummary = false;
    this.varplbsummary = false;
    this.varreportfilesummary = false;
    this.varreportfilesummary = false;
  }

  showhideFilesbreadcrumb(bResult: boolean = false, sFiles: string = "") {
    if (bResult == true && sFiles == "MasterFiles") {
      this.varFilesbreadcrumb = true;
      this.showhideFileDetails(sFiles);
    } else if (bResult == true && sFiles == "SplitFiles") {
      this.varFilesbreadcrumb = true;
      this.showhideFileDetails(sFiles);
    } else if (bResult == true && sFiles == "UnMatchedClaims") {
      this.varFilesbreadcrumb = true;
      this.showhideFileDetails(sFiles);
    } else if (bResult == true && sFiles == "FilesClaimDetails") {
      this.varFilesbreadcrumb = true;
      this.showhideFileDetails(sFiles);
    } else if (bResult == true && sFiles == "UnMatchedPLBs") {
      this.varFilesbreadcrumb = true;
      this.showhideFileDetails(sFiles);
    } else {
      this.varFilesbreadcrumb = false;
    }
  }

  showhideFileDetails(sFiles: string) {
    if (sFiles == "MasterFiles") {
      this.varMasterFilesbreadcrumb = true;
      this.varSplitFilesbreadcrumb = false;
      this.varUnMatchedClaimsbreadcrumb = false;
      this.varFilesClaimDetailsbreadcrumb = false;
      this.varUnMatchedPLBsbreadcrumb = false;
    } else if (sFiles == "SplitFiles") {
      this.varMasterFilesbreadcrumb = true;
      this.varSplitFilesbreadcrumb = true;
      this.varUnMatchedClaimsbreadcrumb = false;
      this.varFilesClaimDetailsbreadcrumb = false;
      this.varUnMatchedPLBsbreadcrumb = false;
    } else if (sFiles == "UnMatchedClaims") {
      this.varMasterFilesbreadcrumb = true;
      this.varSplitFilesbreadcrumb = false;
      this.varUnMatchedClaimsbreadcrumb = true;
      this.varFilesClaimDetailsbreadcrumb = false;
      this.varUnMatchedPLBsbreadcrumb = false;
    } else if (sFiles == "FilesClaimDetails") {
      this.varMasterFilesbreadcrumb = true;
      this.varSplitFilesbreadcrumb = false;
      this.varUnMatchedClaimsbreadcrumb = false;
      this.varFilesClaimDetailsbreadcrumb = true;
      this.varUnMatchedPLBsbreadcrumb = false;
    } else if (sFiles == "UnMatchedPLBs") {
      this.varMasterFilesbreadcrumb = true;
      this.varSplitFilesbreadcrumb = false;
      this.varUnMatchedClaimsbreadcrumb = false;
      this.varUnMatchedPLBsbreadcrumb = true;
      this.varFilesClaimDetailsbreadcrumb = false;
    }
  }
}
