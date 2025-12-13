"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockSAMLProvider = void 0;
class MockSAMLProvider {
    static generateAuthRequest(config) {
        const mockUrl = new URL(config.samlSsoUrl || 'https://mock-idp.example.com/sso');
        mockUrl.searchParams.set('SAMLRequest', 'MOCK_SAML_REQUEST_BASE64');
        mockUrl.searchParams.set('RelayState', 'mock-relay-state');
        return mockUrl.toString();
    }
    static parseSAMLResponse(samlResponse) {
        console.log('[MOCK SAML] Parsing response (stub):', samlResponse?.substring(0, 50));
        return {
            email: 'user@acme-corp.com',
            firstName: 'John',
            lastName: 'Doe',
            nameId: 'mock-name-id-12345'
        };
    }
    static validateSAMLAssertion(assertion, certificate) {
        console.log('[MOCK SAML] Validating assertion (stub) - always returns valid');
        return { valid: true };
    }
    static generateLogoutRequest(config) {
        const mockUrl = new URL(config.samlLogoutUrl || 'https://mock-idp.example.com/logout');
        mockUrl.searchParams.set('SAMLRequest', 'MOCK_LOGOUT_REQUEST');
        return mockUrl.toString();
    }
}
exports.MockSAMLProvider = MockSAMLProvider;
//# sourceMappingURL=mock-saml.provider.js.map