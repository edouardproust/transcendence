import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameServiceMock, ongoingGameFixture } from './game.service.mock';
import { Socket, Server } from 'socket.io';
import { WsJwtGuard } from '../auth/guard/ws-jwt.guard';
import { UsersService } from '../users/users.service';
import { GameStatus } from '../prisma/generated/enums';

describe('GameGateway', () => {
	let gateway: GameGateway;
	let gameService: GameService;

	const fetchSocketsMock = jest.fn().mockResolvedValue([]);
	const mockServer = {
		to: jest.fn().mockReturnThis(),
		emit: jest.fn(),
		in: jest.fn().mockReturnValue({
			fetchSockets: fetchSocketsMock,
		}),
	};

	const mockClientToEmit = jest.fn();
	const mockClient = {
		id: 'client-123',
		join: jest.fn(),
		leave: jest.fn(),
		emit: jest.fn(),
		to: jest.fn().mockReturnValue({ emit: mockClientToEmit }),
		data: {
			user: {
				sub: ongoingGameFixture.whiteId,
				username: 'testUser',
			},
		},
	} as unknown as Socket;

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
			.useValue({
				canActivate: jest.fn(() => true),
			})
			.compile();

		gateway = module.get<GameGateway>(GameGateway);
		gameService = module.get<GameService>(GameService);

		gateway.server = mockServer as unknown as Server;

		jest.clearAllMocks();
		fetchSocketsMock.mockResolvedValue([]);
	});

	afterEach(() => {
		jest.clearAllTimers();
	});

	it('should be defined', () => {
		expect(gateway).toBeDefined();
	});

	describe('handleConnection', () => {
		it('should log when a client connects', () => {
			const consoleSpy = jest.spyOn(console, 'log');
			gateway.handleConnection(mockClient);
			expect(consoleSpy).toHaveBeenCalledWith(
				'Client connected:',
				mockClient.id,
			);
		});
	});

	describe('handleJoinGame', () => {
		it('should make the client join the correct room', async () => {
			fetchSocketsMock.mockResolvedValue([]);

			await gateway.handleJoinGame(
				{ gameId: ongoingGameFixture.id },
				mockClient,
			);
			expect(mockClient.join).toHaveBeenCalledWith(
				`game:${ongoingGameFixture.id}`,
			);
		});

		it('should emit playerReconnected when user was already connected', async () => {
			// Premier join pour enregistrer mockClient dans socketGameMap
			fetchSocketsMock.mockResolvedValue([]);
			await gateway.handleJoinGame(
				{ gameId: ongoingGameFixture.id },
				mockClient,
			);

			const mockClient2ToEmit = jest.fn();
			const mockClient2 = {
				...mockClient,
				id: 'client-456',
				emit: jest.fn(),
				to: jest.fn().mockReturnValue({ emit: mockClient2ToEmit }),
				data: {
					user: {
						sub: ongoingGameFixture.whiteId,
						username: 'testUser',
					},
				},
			} as unknown as Socket;

			jest.spyOn(gameService, 'getGame').mockResolvedValue(
				ongoingGameFixture as any,
			);
			fetchSocketsMock.mockResolvedValue([
				{ id: 'client-123' } as Socket,
			]);

			await gateway.handleJoinGame(
				{ gameId: ongoingGameFixture.id },
				mockClient2,
			);

			expect(mockClient2ToEmit).toHaveBeenCalledWith(
				'playerReconnected',
				{
					playerId: ongoingGameFixture.whiteId,
				},
			);
			expect((mockClient2 as any).emit).toHaveBeenCalledWith(
				'gameUpdate',
				expect.objectContaining({ id: ongoingGameFixture.id }),
			);
		});

		it('should emit error when game room is full', async () => {
			fetchSocketsMock.mockResolvedValue([
				{ id: 'client-1' } as Socket,
				{ id: 'client-2' } as Socket,
				{ id: 'client-3' } as Socket,
			]);

			await gateway.handleJoinGame(
				{ gameId: ongoingGameFixture.id },
				mockClient,
			);

			expect(mockClient.leave).toHaveBeenCalledWith(
				`game:${ongoingGameFixture.id}`,
			);
			expect(mockClient.emit).toHaveBeenCalledWith('error', {
				message: 'Game room is full',
			});
		});

		it('should start game and emit events when second player joins', async () => {
			jest.spyOn(gameService, 'startGame').mockResolvedValue(
				ongoingGameFixture as any,
			);

			// Premier joueur rejoint
			fetchSocketsMock.mockResolvedValue([
				{ id: 'client-123' } as Socket,
			]);
			await gateway.handleJoinGame(
				{ gameId: ongoingGameFixture.id },
				mockClient,
			);

			jest.clearAllMocks();
			jest.spyOn(gameService, 'startGame').mockResolvedValue(
				ongoingGameFixture as any,
			);

			// Deuxième joueur rejoint - fetchSockets retourne 2 sockets
			fetchSocketsMock.mockResolvedValue([
				{ id: 'client-123' } as Socket,
				{ id: 'client-456' } as Socket,
			]);

			const mockClient2 = {
				...mockClient,
				id: 'client-456',
				emit: jest.fn(),
				to: jest.fn().mockReturnValue({ emit: jest.fn() }),
				data: {
					user: {
						sub: ongoingGameFixture.blackId,
						username: 'testUser2',
					},
				},
			} as unknown as Socket;

			await gateway.handleJoinGame(
				{ gameId: ongoingGameFixture.id },
				mockClient2,
			);

			expect(gameService.startGame).toHaveBeenCalled();
			expect(mockServer.to).toHaveBeenCalledWith(
				`game:${ongoingGameFixture.id}`,
			);
			expect(mockServer.emit).toHaveBeenCalledWith(
				'playerJoined',
				expect.objectContaining({ status: ongoingGameFixture.status }),
			);
			expect(mockServer.emit).toHaveBeenCalledWith(
				'gameUpdate',
				expect.objectContaining({
					timeLeft: {
						white: ongoingGameFixture.whiteTimeLeft,
						black: ongoingGameFixture.blackTimeLeft,
					},
				}),
			);
		});
	});

	describe('handleMove', () => {
		const moveData = {
			gameId: ongoingGameFixture.id,
			move: { from: 'e2', to: 'e4' },
		};

		it('should call gameService.makeMove and emit gameUpdate', async () => {
			jest.spyOn(gameService, 'makeMove').mockResolvedValue({
				...ongoingGameFixture,
				currentFen:
					'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
			} as any);

			await gateway.handleMove(moveData, mockClient);

			expect(gameService.makeMove).toHaveBeenCalledWith(
				moveData.gameId,
				{ move: moveData.move },
				mockClient.data.user.sub,
			);
			expect(mockServer.to).toHaveBeenCalledWith(
				`game:${moveData.gameId}`,
			);
			expect(mockServer.emit).toHaveBeenCalledWith(
				'gameUpdate',
				expect.objectContaining({
					timeLeft: {
						white: ongoingGameFixture.whiteTimeLeft,
						black: ongoingGameFixture.blackTimeLeft,
					},
				}),
			);
		});

		it('should stop timer and emit gameEnd when game finishes', async () => {
			const finishedGame = {
				...ongoingGameFixture,
				status: 'FINISHED' as const,
				winnerId: ongoingGameFixture.whiteId,
				endReason: 'checkmate',
			};
			jest.spyOn(gameService, 'makeMove').mockResolvedValue(
				finishedGame as any,
			);

			await gateway.handleMove(moveData, mockClient);

			expect(mockServer.emit).toHaveBeenCalledWith('gameEnd', {
				winnerId: finishedGame.winnerId,
				reason: finishedGame.endReason,
			});
		});

		it('should emit error to client if makeMove throws', async () => {
			jest.spyOn(gameService, 'makeMove').mockRejectedValue(
				new Error('Invalid move'),
			);

			await gateway.handleMove(moveData, mockClient);

			expect(mockClient.emit).toHaveBeenCalledWith('error', {
				message: 'Invalid move',
			});
		});

		it('should start timer on first move', async () => {
			const setIntervalSpy = jest.spyOn(global, 'setInterval');
			jest.spyOn(gameService, 'makeMove').mockResolvedValue(
				ongoingGameFixture as any,
			);

			await gateway.handleMove(moveData, mockClient);

			expect(setIntervalSpy).toHaveBeenCalled();
		});
	});

	describe('handleCancelGame', () => {
		it('should emit gameCancelled when a waiting game is aborted', async () => {
			jest.spyOn(gameService, 'cancelGame').mockResolvedValue({
				...ongoingGameFixture,
				status: GameStatus.ABORTED,
				winnerId: null,
				endReason: 'cancelled',
			} as any);

			await gateway.handleCancelGame(ongoingGameFixture.id, mockClient);

			expect(mockServer.to).toHaveBeenCalledWith(
				`game:${ongoingGameFixture.id}`,
			);
			expect(mockServer.emit).toHaveBeenCalledWith('gameCancelled');
		});

		it('should emit gameEnd when an active game is cancelled', async () => {
			jest.spyOn(gameService, 'cancelGame').mockResolvedValue({
				...ongoingGameFixture,
				status: GameStatus.FINISHED,
				winnerId: ongoingGameFixture.blackId,
				endReason: 'resignation',
			} as any);

			await gateway.handleCancelGame(ongoingGameFixture.id, mockClient);

			expect(mockServer.emit).toHaveBeenCalledWith('gameEnd', {
				winnerId: ongoingGameFixture.blackId,
				reason: 'resignation',
			});
		});

		it('should stop timer on cancel', async () => {
			const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
			const setIntervalSpy = jest.spyOn(global, 'setInterval');
			jest.spyOn(gameService, 'cancelGame').mockResolvedValue({
				...ongoingGameFixture,
				status: GameStatus.ABORTED,
			} as any);

			gateway.startGameTimer(ongoingGameFixture.id, '10+0');
			const intervalId = setIntervalSpy.mock.results[0].value;

			await gateway.handleCancelGame(ongoingGameFixture.id, mockClient);

			expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
		});

		it('should emit error if cancelGame throws', async () => {
			jest.spyOn(gameService, 'cancelGame').mockRejectedValue(
				new Error('Not authorized'),
			);

			await gateway.handleCancelGame(ongoingGameFixture.id, mockClient);

			expect(mockClient.emit).toHaveBeenCalledWith('error', {
				message: 'Not authorized',
			});
		});
	});

	describe('handleResign', () => {
		it('should emit gameEnd with resignation reason', async () => {
			const resignedGame = {
				...ongoingGameFixture,
				status: GameStatus.FINISHED,
				winnerId: ongoingGameFixture.blackId,
				endReason: 'resignation',
			};
			jest.spyOn(gameService, 'resignGame').mockResolvedValue(
				resignedGame as any,
			);

			await gateway.handleResign(ongoingGameFixture.id, mockClient);

			expect(mockServer.to).toHaveBeenCalledWith(
				`game:${ongoingGameFixture.id}`,
			);
			expect(mockServer.emit).toHaveBeenCalledWith('gameEnd', {
				winnerId: ongoingGameFixture.blackId,
				reason: 'resignation',
			});
			expect(mockServer.emit).toHaveBeenCalledWith(
				'gameUpdate',
				expect.objectContaining({
					timeLeft: {
						white: ongoingGameFixture.whiteTimeLeft,
						black: ongoingGameFixture.blackTimeLeft,
					},
				}),
			);
		});

		it('should stop timer on resignation', async () => {
			const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
			const setIntervalSpy = jest.spyOn(global, 'setInterval');
			jest.spyOn(gameService, 'resignGame').mockResolvedValue(
				ongoingGameFixture as any,
			);

			gateway.startGameTimer(ongoingGameFixture.id, '10+0');
			const intervalId = setIntervalSpy.mock.results[0].value;

			await gateway.handleResign(ongoingGameFixture.id, mockClient);

			expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
		});

		it('should emit error if resignGame throws', async () => {
			jest.spyOn(gameService, 'resignGame').mockRejectedValue(
				new Error('Game already finished'),
			);

			await gateway.handleResign(ongoingGameFixture.id, mockClient);

			expect(mockClient.emit).toHaveBeenCalledWith('error', {
				message: 'Game already finished',
			});
		});
	});

	describe('handleOfferDraw', () => {
		it('should emit drawOffered to opponent', async () => {
			jest.spyOn(gameService, 'offerDraw').mockResolvedValue(
				undefined as any,
			);

			await gateway.handleOfferDraw(ongoingGameFixture.id, mockClient);

			expect(mockClient.to).toHaveBeenCalledWith(
				`game:${ongoingGameFixture.id}`,
			);
			expect(mockClientToEmit).toHaveBeenCalledWith('drawOffered', {
				playerId: mockClient.data.user.sub,
			});
		});

		it('should emit error if offerDraw throws', async () => {
			jest.spyOn(gameService, 'offerDraw').mockRejectedValue(
				new Error('Not your turn'),
			);

			await gateway.handleOfferDraw(ongoingGameFixture.id, mockClient);

			expect(mockClient.emit).toHaveBeenCalledWith('error', {
				message: 'Not your turn',
			});
		});
	});

	describe('handleAcceptDraw', () => {
		it('should emit drawAccepted, gameEnd and gameUpdate', async () => {
			const drawGame = {
				...ongoingGameFixture,
				status: GameStatus.FINISHED,
				winnerId: null,
				endReason: 'draw',
			};
			jest.spyOn(gameService, 'acceptDraw').mockResolvedValue(
				drawGame as any,
			);

			await gateway.handleAcceptDraw(ongoingGameFixture.id, mockClient);

			expect(mockServer.to).toHaveBeenCalledWith(
				`game:${ongoingGameFixture.id}`,
			);
			expect(mockServer.emit).toHaveBeenCalledWith('drawAccepted');
			expect(mockServer.emit).toHaveBeenCalledWith('gameEnd', {
				winnerId: null,
				reason: 'draw',
			});
			expect(mockServer.emit).toHaveBeenCalledWith(
				'gameUpdate',
				expect.objectContaining({
					timeLeft: {
						white: ongoingGameFixture.whiteTimeLeft,
						black: ongoingGameFixture.blackTimeLeft,
					},
				}),
			);
		});

		it('should stop timer on draw accepted', async () => {
			const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
			const setIntervalSpy = jest.spyOn(global, 'setInterval');
			jest.spyOn(gameService, 'acceptDraw').mockResolvedValue(
				ongoingGameFixture as any,
			);

			gateway.startGameTimer(ongoingGameFixture.id, '10+0');
			const intervalId = setIntervalSpy.mock.results[0].value;

			await gateway.handleAcceptDraw(ongoingGameFixture.id, mockClient);

			expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
		});
	});

	describe('handleDeclineDraw', () => {
		it('should emit drawDeclined to opponent', async () => {
			jest.spyOn(gameService, 'declineDraw').mockResolvedValue(
				undefined as any,
			);

			await gateway.handleDeclineDraw(ongoingGameFixture.id, mockClient);

			expect(mockClient.to).toHaveBeenCalledWith(
				`game:${ongoingGameFixture.id}`,
			);
			expect(mockClientToEmit).toHaveBeenCalledWith('drawDeclined', {
				playerId: mockClient.data.user.sub,
			});
		});
	});

	describe('handleChatMessage', () => {
		it('should emit chatMessage to room with username', async () => {
			const chatMessage = 'Hello opponent!';
			jest.spyOn(gameService, 'getGame').mockResolvedValue(
				ongoingGameFixture as any,
			);

			await gateway.handleChatMessage(
				{ gameId: ongoingGameFixture.id, message: chatMessage },
				mockClient,
			);

			expect(mockClient.to).toHaveBeenCalledWith(
				`game:${ongoingGameFixture.id}`,
			);
			expect(mockClientToEmit).toHaveBeenCalledWith(
				'chatMessage',
				expect.objectContaining({
					userId: mockClient.data.user.sub,
					username: 'testUser',
					message: chatMessage,
					timestamp: expect.any(String),
				}),
			);
		});
	});

	describe('handleDisconnect', () => {
		it('should not call handlePlayerDisconnect if no session exists', async () => {
			const spy = jest.spyOn(gameService, 'handlePlayerDisconnect');

			await gateway.handleDisconnect(mockClient);

			expect(spy).not.toHaveBeenCalled();
		});

		it('should not call handlePlayerDisconnect if another socket for same user exists', async () => {
			const mockClient2 = {
				...mockClient,
				id: 'client-456',
				emit: jest.fn(),
				to: jest.fn().mockReturnValue({ emit: jest.fn() }),
				data: {
					user: {
						sub: ongoingGameFixture.whiteId,
						username: 'testUser',
					},
				},
			} as unknown as Socket;

			fetchSocketsMock.mockResolvedValue([
				{ id: 'client-456' } as Socket,
			]);

			await gateway.handleJoinGame(
				{ gameId: ongoingGameFixture.id },
				mockClient,
			);
			await gateway.handleJoinGame(
				{ gameId: ongoingGameFixture.id },
				mockClient2,
			);

			jest.clearAllMocks();
			const spy = jest.spyOn(gameService, 'handlePlayerDisconnect');

			await gateway.handleDisconnect(mockClient);

			expect(spy).not.toHaveBeenCalled();
		});

		it('should finish game on disconnect and emit gameEnd', async () => {
			fetchSocketsMock.mockResolvedValue([
				{ id: 'client-123' } as Socket,
			]);
			jest.spyOn(gameService, 'handlePlayerDisconnect').mockResolvedValue(
				{
					...ongoingGameFixture,
					status: GameStatus.FINISHED,
					winnerId: ongoingGameFixture.blackId,
					endReason: 'disconnect',
				} as any,
			);

			await gateway.handleJoinGame(
				{ gameId: ongoingGameFixture.id },
				mockClient,
			);
			jest.clearAllMocks();

			await gateway.handleDisconnect(mockClient);

			expect(gameService.handlePlayerDisconnect).toHaveBeenCalledWith(
				ongoingGameFixture.id,
				ongoingGameFixture.whiteId,
			);
			expect(mockServer.emit).toHaveBeenCalledWith('gameEnd', {
				winnerId: ongoingGameFixture.blackId,
				reason: 'disconnect',
			});
		});

		it('should emit gameCancelled if game is aborted on disconnect', async () => {
			fetchSocketsMock.mockResolvedValue([
				{ id: 'client-123' } as Socket,
			]);
			jest.spyOn(gameService, 'handlePlayerDisconnect').mockResolvedValue(
				{
					...ongoingGameFixture,
					status: GameStatus.ABORTED,
				} as any,
			);

			await gateway.handleJoinGame(
				{ gameId: ongoingGameFixture.id },
				mockClient,
			);
			jest.clearAllMocks();

			await gateway.handleDisconnect(mockClient);

			expect(mockServer.emit).toHaveBeenCalledWith('gameCancelled');
		});
	});

	describe('timer functions', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('should start game timer with valid time control', () => {
			const setIntervalSpy = jest.spyOn(global, 'setInterval');

			gateway.startGameTimer('game-123', '10+5');

			expect(setIntervalSpy).toHaveBeenCalledWith(
				expect.any(Function),
				1000,
			);
		});

		it('should not start timer for unlimited time control', () => {
			const setIntervalSpy = jest.spyOn(global, 'setInterval');

			gateway.startGameTimer('game-123', 'unlimited');

			expect(setIntervalSpy).not.toHaveBeenCalled();
		});

		it('should not start timer for invalid time control', () => {
			const setIntervalSpy = jest.spyOn(global, 'setInterval');

			gateway.startGameTimer('game-123', 'invalid');

			expect(setIntervalSpy).not.toHaveBeenCalled();
		});

		it('should stop game timer', () => {
			jest.spyOn(global, 'setInterval');
			const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

			gateway.startGameTimer('game-123', '10+0');
			gateway.stopGameTimer('game-123');

			expect(clearIntervalSpy).toHaveBeenCalled();
		});

		it('should update game turn', () => {
			jest.spyOn(global, 'setInterval');
			jest.spyOn(gameService, 'decrementTime').mockResolvedValue({
				whiteTimeLeft: 500,
				blackTimeLeft: 500,
			} as any);

			gateway.startGameTimer('game-123', '10+0');
			gateway.updateGameTurn('game-123', 'b');

			expect(gateway['gameTurnMap'].get('game-123')).toBe('b');
		});

		it('should decrement time on timer tick', async () => {
			jest.spyOn(global, 'setInterval');
			jest.spyOn(gameService, 'decrementTime').mockResolvedValue({
				...ongoingGameFixture,
				whiteTimeLeft: 590,
				blackTimeLeft: 600,
			} as any);

			gateway.startGameTimer('game-123', '10+0');
			gateway.updateGameTurn('game-123', 'w');

			jest.advanceTimersByTime(1000);
			await Promise.resolve();
			await Promise.resolve();

			expect(gameService.decrementTime).toHaveBeenCalled();
			expect(mockServer.emit).toHaveBeenCalledWith(
				'gameUpdate',
				expect.objectContaining({
					timeLeft: {
						white: 590,
						black: 600,
					},
					turn: 'w',
				}),
			);
		});

		it('should stop timer and emit gameEnd when time runs out', async () => {
			const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
			jest.spyOn(global, 'setInterval');
			jest.spyOn(gameService, 'decrementTime').mockResolvedValue({
				...ongoingGameFixture,
				whiteTimeLeft: 0,
				blackTimeLeft: 500,
				status: GameStatus.FINISHED,
			} as any);

			gateway.startGameTimer('game-123', '10+0');

			jest.advanceTimersByTime(1000);
			await Promise.resolve();
			await Promise.resolve();

			expect(clearIntervalSpy).toHaveBeenCalled();
			expect(mockServer.emit).toHaveBeenCalledWith('gameEnd', {
				winnerId: ongoingGameFixture.blackId,
				reason: 'timeout',
			});
		});

		it('should replace existing timer when starting new one', () => {
			const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
			const setIntervalSpy = jest.spyOn(global, 'setInterval');

			gateway.startGameTimer('game-123', '10+0');
			gateway.startGameTimer('game-123', '15+10');

			expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
			expect(setIntervalSpy).toHaveBeenCalledTimes(2);
		});
	});
});
