export type Efr_Branches = {
    BranchID: number;
    BranchName: string;
    VersionInfo: string;
    StartDateTime: Date;
    ReSendDate: Date;
    Query: string;
    CallCenterTime: Date;
    CountryName: string;
    CurrencyName: string;
    Region: string;
    ExternalCode: string;
    AccountingCode: string;
    RevenueCenterCode: string;
    ProjectCode: string;
    AccountingRegisterAccount: string;
    GtfFileDirectory: string;
    Addresss: string;
    CustomField1: string;
    CustomField2: string;
    CustomField3: string;
    CustomField4: string;
    CustomField5: string;
    IsActive: boolean;
    LastDailyControlDatetime: Date;
    LastDailyControl_Notes: string;
    LastInstantControlDatetime: Date;
    Ciro: number;
    BranchSquareMeter: number;
    NumberOfServicePersonnel: number;
    OpeningTime: string;
    ClosingTime: string;
    CustomField6: string;
    CustomField7: string;
    CustomField8: string;
    CustomField9: string;
    CustomField10: string;
    CustomField11: string;
    ShowDashboard: boolean;
    CustomField12: string;
    CustomField13: string;
    CustomField14: string;
    CustomField15: string;
    CustomField16: string;
    LogoWarehouseCode: string;
    OrderNumber: number;
    CpmBranchID: number;
    IntegrationCompany: string;
    RegionID: number;
    Operasyon_Muduru: string;
    Operasyon_Grup_Muduru: string;
    Paket_Tipi: string;
    OfficeID: string;
    BranchReportOrder: number;
    WebMails: string;
    ParentBranchID: number;
    BranchMenuCode: string;
    InvestorMail: string;
    RegionalDirectorMail: string;
    RegionalManagerMail: string;
    LogoExternalCode: string;
}

export type ProjectSettings = {
    AutoID: number;
    Kod: string;
    Value: string;
    Description: string;
    Project: string;
}

export type Efr_Tags = {
    TagID: number;
    TagTitle: string;
    IsDefault: boolean;
    CurrencyName: string;
    BranchID: number[];
}
