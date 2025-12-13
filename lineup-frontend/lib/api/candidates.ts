/**
 * Candidates API Service
 * Handles all API calls related to candidates including resume uploads
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface UploadUrlResponse {
    fileId: string;
    uploadUrl: string;
    s3Key: string;
}

interface AttachResumeRequest {
    fileId: string;
    s3Key: string;
    mimeType?: string;
    size?: number;
}

/**
 * Upload a resume for a candidate
 * This handles the complete 3-step upload flow:
 * 1. Request presigned upload URL
 * 2. Upload file to S3
 * 3. Confirm upload to backend
 */
export async function uploadCandidateResume(
    candidateId: string,
    file: File,
    token: string
): Promise<{ success: boolean; fileId: string }> {
    try {
        // Step 1: Request upload URL
        const uploadUrlResponse = await fetch(
            `${API_BASE_URL}/api/v1/candidates/${candidateId}/resume/upload-url`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    filename: file.name,
                }),
            }
        );

        if (!uploadUrlResponse.ok) {
            throw new Error('Failed to get upload URL');
        }

        const { fileId, uploadUrl, s3Key }: UploadUrlResponse = await uploadUrlResponse.json();

        // Step 2: Upload to S3
        const s3Response = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });

        if (!s3Response.ok) {
            throw new Error('Failed to upload file to S3');
        }

        // Step 3: Confirm upload
        const attachRequest: AttachResumeRequest = {
            fileId,
            s3Key,
            mimeType: file.type,
            size: file.size,
        };

        const attachResponse = await fetch(
            `${API_BASE_URL}/api/v1/candidates/${candidateId}/resume/attach`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(attachRequest),
            }
        );

        if (!attachResponse.ok) {
            throw new Error('Failed to confirm upload');
        }

        const result = await attachResponse.json();

        return {
            success: true,
            fileId: result.fileId,
        };
    } catch (error) {
        console.error('Resume upload failed:', error);
        throw error;
    }
}

/**
 * Get candidate details
 */
export async function getCandidate(candidateId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/candidates/${candidateId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch candidate');
    }

    return response.json();
}

/**
 * List all candidates with filters
 */
export async function listCandidates(
    token: string,
    params?: {
        page?: number;
        perPage?: number;
        stage?: string;
        source?: string;
        q?: string;
    }
) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.perPage) queryParams.append('perPage', params.perPage.toString());
    if (params?.stage) queryParams.append('stage', params.stage);
    if (params?.source) queryParams.append('source', params.source);
    if (params?.q) queryParams.append('q', params.q);

    const response = await fetch(
        `${API_BASE_URL}/api/v1/candidates?${queryParams.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch candidates');
    }

    return response.json();
}
