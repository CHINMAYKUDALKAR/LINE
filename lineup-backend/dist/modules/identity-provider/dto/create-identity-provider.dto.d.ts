export declare enum SSOProviderType {
    SAML = "SAML",
    GOOGLE = "GOOGLE",
    MICROSOFT = "MICROSOFT"
}
export declare class CreateIdentityProviderDto {
    providerType: SSOProviderType;
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    domainRestriction?: string;
    samlMetadataUrl?: string;
    samlEntityId?: string;
    samlCertificate?: string;
    samlAcsUrl?: string;
    samlSsoUrl?: string;
    samlLogoutUrl?: string;
    autoProvision?: boolean;
    enabled?: boolean;
}
