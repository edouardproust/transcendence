import { Game } from '../prisma/generated/models/Game';

export function serializeGame(game: Game) {
	return {
		id: game.id,
		status: game.status.toLowerCase(), // "WAITING" → "waiting"
		mode: game.mode.toLowerCase(), // "ONLINE"  → "online"
		white_player_id: game.whiteId,
		black_player_id: game.blackId ?? null,
		winner_id: game.winnerId ?? null,
		current_fen: game.currentFen ?? null,
		pgn: game.pgn ?? null,
		time_control: game.timeControl,
		created_at: game.createdAt,
		updated_at: game.updatedAt,
	};
}
