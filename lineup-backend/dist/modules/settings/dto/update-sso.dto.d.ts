export declare class UpdateSsoDto {
    provider?: 'saml' | 'oauth' | null;
    samlEntityId?: string;
    samlSsoUrl?: string;
    samlCertificate?: string;
    oauthClientId?: string;
    oauthClientSecret?: string;
}
