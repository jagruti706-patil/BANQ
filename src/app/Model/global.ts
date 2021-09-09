export class Global {
  encryKey = "Banq_key_1234567";
  qoreencryKey = "glotest123456789";

  private static _myQOneUrl = "http://dev58:1095/";
  public static get myQOneUrl() {
    return Global._myQOneUrl;
  }
  public static set myQOneUrl(value) {
    Global._myQOneUrl = value;
  }

  public static _MasterDataService =
    "http://dev53:9084/BANQRegistrationService/Client/";
  public static get MasterDataService() {
    return Global._MasterDataService;
  }
  public static set MasterDataService(value) {
    Global._MasterDataService = value;
  }
}
