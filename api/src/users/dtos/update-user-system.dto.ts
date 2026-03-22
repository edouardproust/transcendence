/*
 * DTO for internal system updates (e.g. presence tracking).
 * Not exposed via public endpoints — no validation decorators needed.
 */
export class UpdateUserSystemDto {
	lastSeen?: Date;
	isOnline?: boolean;
}
