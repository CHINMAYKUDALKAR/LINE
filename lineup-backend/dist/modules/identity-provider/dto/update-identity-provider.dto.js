"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateIdentityProviderDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_identity_provider_dto_1 = require("./create-identity-provider.dto");
class UpdateIdentityProviderDto extends (0, swagger_1.PartialType)(create_identity_provider_dto_1.CreateIdentityProviderDto) {
}
exports.UpdateIdentityProviderDto = UpdateIdentityProviderDto;
//# sourceMappingURL=update-identity-provider.dto.js.map