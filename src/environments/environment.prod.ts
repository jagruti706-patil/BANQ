export const environment = {
  production: true,
  currentEnvironment: "Production",
  offset: new Date().getTimezoneOffset(),
  version: "1.0",
  baseServiceUrl: "https://hub.myqone.com/banq/",
  coreServiceUrl: "https://hub.myqone.com/banq/Client/",
  emailServiceUrl: "https://hub.myqone.com/banq/Email/",
  fileServiceUrl: "https://hub.myqone.com/banq/EraHub/",
  configBANQEDIServiceUrl: "https://hub.myqone.com/editranslator/",
  logServiceUrl: "http://dev53:9096/Logger/",
  configParserServiceUrl:
    "https://banqstaging.triarqclouds.com/Q835Parser-0.1.0staging/BANKQParserScheduler/",
  configRivenServiceUrl:
    "https://banqstaging.triarqclouds.com/Q835Riven-1.1staging/BANKQRivenScheduler/",
  authServiceUrl: "https://qore.myqone.com/auth/",
  ssoServiceLoginUrl:
    "https://accounts.myqone.com/#/login?continue=https://hub.myqone.com/puthash/setSID",
  ssoServiceLogoutUrl:
    "https://accounts.myqone.com/#/logout?continue=https://hub.myqone.com/puthash/setSID",

  //qinsight service url
  RestService_url: "https://qinsight-dev.myqone.com/restservice/"
};
