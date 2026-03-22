import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

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

	async upload(key: string, file: Express.Multer.File): Promise<string> {
		const command = new PutObjectCommand({
			Bucket: this.bucket,
			Key: key,
			Body: file.buffer,
			ContentType: file.mimetype,
		});
		await this.client.send(command);
		return this.getUrl(key);
	}

	async delete(key: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: this.bucket,
			Key: key,
		});
		await this.client.send(command);
	}

	getUrl(key: string): string {
		if (this.isDev) {
			// Dev URL (MinIO)
			return `${process.env.S3_PUBLIC_URL}/${this.bucket}/${key}`;
		}
		// Prod URL (AWS S3)
		return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
	}
}
