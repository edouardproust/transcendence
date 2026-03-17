import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { buildSwaggerConfig } from './config/swagger.config';

async function bootstrap() {
	// Init NestJS
	const app = await NestFactory.create(AppModule);
	const corsOrigins = (process.env.CORS_ORIGIN || '')
		.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean);

	// Config NestJS
	// whitelist: true strips any body fields not declared with class-validator decorators in the DTO (security)
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

	// Enable CORS (to allow frontend to communicate with API)
	app.enableCors({
		origin: corsOrigins.length > 0 ? corsOrigins : true,
		credentials: true,
	});

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
		console.log(`
Links:
- View app: https://localhost:8443
- HTTP redirect entrypoint: http://localhost:8080
- View API doc (Swagger): http://localhost:${port}
- View databases (Adminer): http://localhost:8081
Read 'api/README.md' for more details.
`);
	}
}

bootstrap();
