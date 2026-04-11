import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Server } from 'http';
import { io, Socket } from 'socket.io-client';
import { GameGateway } from '../src/game/game.gateway';
import { GameService } from '../src/game/game.service';
import {
	GameServiceMock,
	ongoingGameFixture,
} from '../src/game/game.service.mock';
import { WsJwtGuard } from '../src/auth/guard/ws-jwt.guard';
import { UsersService } from '../src/users/users.service';

// WebSocket serializes Date objects to ISO strings, so we normalize the fixture before comparing
const serializeGame = (game: any) => ({
	...game,
	createdAt: game.createdAt?.toISOString(),
	updatedAt: game.updatedAt?.toISOString(),
});

describe('GameGateway (e2e)', () => {
	let app: INestApplication;
	let httpServer: Server;
	let client: Socket;
	let gameService: GameService;

	const mockWsGuard = {
		canActivate: (ctx) => {
			const client = ctx.switchToWs().getClient();
			client.data = {
				user: {
					sub: ongoingGameFixture.whiteId,
					username: 'testUser',
				},
			};
			return true;
		},
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GameGateway,
				GameServiceMock,
				{
					provide: UsersService,
					useValue: {
						findOneById: jest.fn().mockResolvedValue({
							id: ongoingGameFixture.whiteId,
							username: 'testUser',
						}),
					},
				},
			],
		})
			.overrideGuard(WsJwtGuard)
			.useValue(mockWsGuard)
			.compile();

		app = module.createNestApplication();
		await app.listen(0);

		httpServer = app.getHttpServer();
		gameService = module.get<GameService>(GameService);

		await new Promise<void>((resolve) => {
			client = io(
				`http://localhost:${(httpServer.address() as any).port}`,
				{
					transports: ['websocket'],
				},
			);
			client.on('connect', () => resolve());
		});

		jest.clearAllMocks();
	});

	afterEach(async () => {
		if (client && client.connected) client.disconnect();
		await app.close();
	});

	describe('makeMove', () => {
		it('should emit gameUpdate when move is valid', (done) => {
			jest.spyOn(gameService, 'makeMove').mockResolvedValue(
				ongoingGameFixture as any,
			);

			client.on('gameUpdate', (data) => {
				expect(data).toEqual(
					expect.objectContaining({
						...serializeGame(ongoingGameFixture),
						timeLeft: {
							white: ongoingGameFixture.whiteTimeLeft,
							black: ongoingGameFixture.blackTimeLeft,
						},
					}),
				);
				expect(gameService.makeMove).toHaveBeenCalled();
				done();
			});

			client.emit('joinGame', {
				gameId: ongoingGameFixture.id,
			});

			setTimeout(() => {
				client.emit('makeMove', {
					gameId: ongoingGameFixture.id,
					move: 'e2e4',
				});
			}, 100);
		});

		it('should emit error when move fails', (done) => {
			jest.spyOn(gameService, 'makeMove').mockRejectedValue(
				new Error('Invalid move'),
			);

			client.on('error', (err) => {
				expect(err.message).toBe('Invalid move');
				done();
			});

			client.emit('makeMove', {
				gameId: ongoingGameFixture.id,
				move: 'invalid',
			});
		});
	});
});
