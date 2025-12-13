export declare enum SSOProviderType {
    SAML = "SAML",
    GOOGLE = "GOOGLE",
    MICROSOFT = "MICROSOFT"
}
export declare class SSOCallbackDto {
    code: string;
    state?: string;
    provider?: SSOProviderType;
    SAMLResponse?: string;
    RelayState?: string;
}
