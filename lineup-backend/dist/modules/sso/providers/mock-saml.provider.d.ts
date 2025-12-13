export interface SAMLUserClaims {
    email: string;
    firstName: string;
    lastName: string;
    nameId?: string;
}
export declare class MockSAMLProvider {
    static generateAuthRequest(config: {
        samlSsoUrl?: string;
        samlEntityId?: string;
        samlAcsUrl?: string;
    }): string;
    static parseSAMLResponse(samlResponse: string): SAMLUserClaims;
    static validateSAMLAssertion(assertion: string, certificate?: string): {
        valid: boolean;
        error?: string;
    };
    static generateLogoutRequest(config: {
        samlLogoutUrl?: string;
        nameId?: string;
    }): string;
}
