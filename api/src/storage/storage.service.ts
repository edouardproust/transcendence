import {
	DeleteObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { DEFAULTS } from '../common/constants';

/**
 * Service handling file storage via S3-compatible object storage.
 * Uses MinIO in development and AWS S3 in production.
 */
@Injectable()
export class StorageService {
	private readonly client: S3Client;
	private readonly bucket: string;
	private readonly isDev: boolean = process.env.NODE_ENV !== 'production';

	constructor() {
		this.bucket = process.env.S3_BUCKET!;
		this.client = new S3Client({
			region: process.env.AWS_REGION!,
			endpoint: this.isDev ? process.env.S3_ENDPOINT : undefined,
			forcePathStyle: this.isDev, // required for MinIO
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
			},
		});
	}

	/**
	 * Upload a file to S3/MinIO.
	 *
	 * @param key S3 object key (e.g. 'avatars/uuid.jpg')
	 * @param body File content as Buffer or string
	 * @param contentType MIME type of the file
	 */
	async uploadFile(
		key: string,
		body: Buffer | string,
		contentType: string,
	): Promise<void> {
		await this.client.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				Body: body,
				ContentType: contentType,
			}),
		);
	}

	/**
	 * Delete a file from S3/MinIO.
	 *
	 * @param key S3 object key (e.g. 'avatars/uuid.jpg')
	 */
	async delete(key: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: this.bucket,
			Key: key,
		});
		await this.client.send(command);
	}

	/**
	 * Build the public URL for a given S3 object key.
	 * Uses S3_PUBLIC_URL in development (MinIO), and AWS S3 URL in production.
	 *
	 * @param key S3 object key (e.g. 'avatars/uuid.jpg')
	 * @returns Public URL of the file
	 */
	getUrl(key: string): string {
		if (this.isDev) {
			// Dev URL (MinIO)
			return `${process.env.S3_PUBLIC_URL}/${this.bucket}/${key}`;
		}
		// Prod URL (AWS S3)
		return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
	}

	/**
	 * Upload a local asset to S3/MinIO if it does not already exist.
	 *
	 * @param localPath Path to the file relative to the project root (e.g. 'assets/default-avatar.svg')
	 * @param remoteKey S3 object key to store the file under
	 * @param contentType MIME type of the file
	 */
	private async ensureAsset(
		localPath: string,
		remoteKey: string,
		contentType: string,
	): Promise<void> {
		try {
			// HEAD request to check the file exists
			await this.client.send(
				new HeadObjectCommand({
					Bucket: this.bucket,
					Key: remoteKey,
				}),
			);
			// Already exists, skip
		} catch {
			const content = readFileSync(
				`${process.cwd()}/${localPath}`,
				'utf-8',
			);
			await this.uploadFile(remoteKey, content, contentType);
		}
	}

	/**
	 * Ensure all default static assets exist in S3/MinIO.
	 * Called once at application startup.
	 */
	async ensureDefaultAssets(): Promise<void> {
		await this.ensureAsset(
			DEFAULTS.avatar.localPath,
			DEFAULTS.avatar.remoteKey,
			DEFAULTS.avatar.contentType,
		);
		// Add more assets here if needed
	}
}
