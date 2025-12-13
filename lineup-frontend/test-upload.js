/**
 * Quick Test Script for Resume Upload
 * Run this in your browser console to test the upload functionality
 */

// Step 1: Set a mock auth token (replace with real token from login)
localStorage.setItem('auth_token', 'REPLACE_WITH_REAL_JWT_TOKEN');

// Step 2: Test the upload API directly
async function testResumeUpload() {
    const API_BASE_URL = 'http://localhost:4000';
    const candidateId = 'test-candidate-123'; // Replace with real candidate ID
    const token = localStorage.getItem('auth_token');

    // Create a test file
    const testContent = 'This is a test resume';
    const file = new File([testContent], 'test-resume.pdf', { type: 'application/pdf' });

    console.log('Step 1: Requesting upload URL...');

    // Step 1: Get upload URL
    const uploadUrlResponse = await fetch(
        `${API_BASE_URL}/api/v1/candidates/${candidateId}/resume/upload-url`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ filename: file.name }),
        }
    );

    if (!uploadUrlResponse.ok) {
        console.error('Failed to get upload URL:', await uploadUrlResponse.text());
        return;
    }

    const { fileId, uploadUrl, s3Key } = await uploadUrlResponse.json();
    console.log('✅ Got upload URL:', { fileId, s3Key });

    // Step 2: Upload to S3
    console.log('Step 2: Uploading to S3...');
    const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
    });

    if (!s3Response.ok) {
        console.error('Failed to upload to S3:', await s3Response.text());
        return;
    }

    console.log('✅ Uploaded to S3');

    // Step 3: Confirm upload
    console.log('Step 3: Confirming upload...');
    const attachResponse = await fetch(
        `${API_BASE_URL}/api/v1/candidates/${candidateId}/resume/attach`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                fileId,
                s3Key,
                mimeType: file.type,
                size: file.size,
            }),
        }
    );

    if (!attachResponse.ok) {
        console.error('Failed to confirm upload:', await attachResponse.text());
        return;
    }

    const result = await attachResponse.json();
    console.log('✅ Upload complete!', result);
    console.log('🎉 Resume uploaded successfully with fileId:', result.fileId);
}

// Run the test
console.log('Starting resume upload test...');
testResumeUpload().catch(console.error);
