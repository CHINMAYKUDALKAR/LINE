export declare enum SSOProviderType {
    SAML = "SAML",
    GOOGLE = "GOOGLE",
    MICROSOFT = "MICROSOFT"
}
export declare class InitiateSSODto {
    provider?: SSOProviderType;
    returnUrl?: string;
}
