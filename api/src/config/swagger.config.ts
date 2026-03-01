import { DocumentBuilder } from '@nestjs/swagger';

export function buildSwaggerConfig() {
	return new DocumentBuilder()
		.setTitle((process.env.PROJECT_NAME ?? '') + ' API Documentation')
		.setDescription(
			`This documentation lists all available endpoints.\n\n` +
				`### Authentication\n` +
				`Most routes are protected by a **Bearer JWT** token. ` +
				`Click the **Authorize 🔓** button at the top right to authenticate.\n\n`,
		)
		.setVersion('1.0')
		.addBearerAuth()
		.build();
}
