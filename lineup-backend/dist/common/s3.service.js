"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var S3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let S3Service = S3Service_1 = class S3Service {
    s3;
    logger = new common_1.Logger(S3Service_1.name);
    bucket;
    constructor() {
        this.bucket = process.env.S3_BUCKET_NAME || 'lineup-assets';
        const endpoint = process.env.S3_ENDPOINT;
        const s3Config = {
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        };
        if (endpoint) {
            s3Config.endpoint = endpoint;
            s3Config.forcePathStyle = process.env.S3_USE_PATH_STYLE === 'true';
        }
        this.s3 = new client_s3_1.S3Client(s3Config);
        this.logger.log(`S3 Service initialized with bucket: ${this.bucket}`);
    }
    async getPresignedUploadUrl(key, contentType = 'application/octet-stream', expiresIn = 3600) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn });
        return url;
    }
    async getPresignedDownloadUrl(key, filename, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ResponseContentDisposition: filename ? `attachment; filename="${filename}"` : undefined,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn });
        return url;
    }
    async streamFile(key) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        const response = await this.s3.send(command);
        return response.Body;
    }
    async deleteFile(key) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        await this.s3.send(command);
        this.logger.log(`Deleted file: ${key}`);
    }
    async copyFile(sourceKey, destKey) {
        const command = new client_s3_1.CopyObjectCommand({
            Bucket: this.bucket,
            CopySource: `${this.bucket}/${sourceKey}`,
            Key: destKey,
        });
        await this.s3.send(command);
        this.logger.log(`Copied file from ${sourceKey} to ${destKey}`);
    }
    getBucket() {
        return this.bucket;
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = S3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], S3Service);
//# sourceMappingURL=s3.service.js.map