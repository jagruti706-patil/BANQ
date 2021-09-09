import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";
import { Global } from "../Model/global";
import * as CryptoJS from "crypto-js";
import { isNullOrUndefined } from "util";
var loginUserName: "";
var loginUserRole: "";

export enum enumNavbarLinks {
  Home = "1.1.P1",
  Client = "1.1.P1",
  Dashboard = "1.2.P1",
  ServiceController = "1.3.P1",
  Remitfiles = "1.4.P1",
  ServiceLogs = "1.5.P1",
}

export class Utility {
  private global: Global = new Global();
  public configPageSize: number = 50;
  public pagesize: number = 300;
  BanqEncryptKey = this.global.encryKey;
  public delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  constructor(private toastr?: ToastrService) {}
  ApplicationName: "Qonductor";

  public LogError(error: any): any {
    this.showError(error);
  }

  showSuccess(message: string) {
    this.toastr.success(message, this.ApplicationName);
  }

  showError(message: string) {
    this.toastr.error(message, this.ApplicationName);
  }

  showWarning(message: string) {
    this.toastr.warning(message, this.ApplicationName);
  }

  showInfo(message: string) {
    this.toastr.info(message, this.ApplicationName);
  }

  CheckEmptyString(strValue: string): boolean {
    const validateString: string = strValue.trim();
    if (this.isBlankString(validateString)) {
      return true;
    }
    if (validateString.length === 0) {
      return true;
    }
    return false;
  }
  private isBlankString(strValue: string): boolean {
    if (strValue === null || strValue === undefined) {
      return true;
    }
    return false;
  }

  public currentDateTime(): string {
    const datepipe = new DatePipe("en-US");
    const currentDate = datepipe.transform(
      Date.now(),
      "yyyy-MM-ddTHH:mm:ss.SSSZ"
    );
    // return currentDate + "Z";
    return currentDate;
  }

  encryptAES(string): any {
    const key = CryptoJS.enc.Utf8.parse(this.BanqEncryptKey);
    const iv = CryptoJS.enc.Utf8.parse(this.BanqEncryptKey);
    const encrypted = CryptoJS.AES.encrypt(string, key, {
      keySize: 16,
      iv: iv,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted;
  }

  decryptAES(string): any {
    const key = CryptoJS.enc.Utf8.parse(this.BanqEncryptKey);
    const iv = CryptoJS.enc.Utf8.parse(this.BanqEncryptKey);
    const decrypted = CryptoJS.AES.decrypt(string, key, {
      keySize: 16,
      iv: iv,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
    return decrypted;
  }

  jsondiff(obj1, obj2) {
    const result = {};
    if (Object.is(obj1, obj2)) {
      return undefined;
    }
    if (!obj2 || typeof obj2 !== "object") {
      return obj2;
    }
    Object.keys(obj1 || {})
      .concat(Object.keys(obj2 || {}))
      .forEach((key) => {
        if (obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) {
          result[key] = obj2[key];
        }
        if (typeof obj2[key] === "object" && typeof obj1[key] === "object") {
          const value = this.jsondiff(obj1[key], obj2[key]);
          if (value !== undefined) {
            result[key] = value;
          }
        }
      });

    if (
      !isNullOrUndefined(result) &&
      JSON.stringify(result) != "{}" &&
      result.hasOwnProperty("createdon")
    ) {
      delete result["createdon"];
    }
    return result;
  }
}
