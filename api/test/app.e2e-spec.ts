import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	// E2E TESTS

	describe('GET /', () => {
		it('should return 404 Not Found', () => {
			// There is no app controller -> Not Found
			return request(app.getHttpServer())
				.get('/')
				.expect(HttpStatus.NOT_FOUND);
		});
	});
});
