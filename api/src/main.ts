import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { buildSwaggerConfig } from './config/swagger.config';

async function bootstrap() {
	// Init NestJS
	const app = await NestFactory.create(AppModule);

	// Config NestJS
	app.useGlobalPipes(new ValidationPipe());

	// Config Swagger (only in dev)
	if (process.env.NODE_ENV !== 'production') {
		const document = SwaggerModule.createDocument(
			app,
			buildSwaggerConfig(),
		);
		SwaggerModule.setup('', app, document);
	}

	// Listen for requests
	const port = parseInt(process.env.PORT || '3000', 10);
	await app.listen(port);

	// Development logs
	if (process.env.NODE_ENV !== 'production') {
		console.log();
		console.log(`Swagger is running on: http://localhost:${port}`);
		console.log(`Compodoc: 'npm run doc'`);
	}
}
bootstrap();
