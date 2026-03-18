import { Prisma } from './generated/client';

export enum PrismaErrorCode {
	UNIQUE_CONSTRAINT = 'P2002',
	NOT_FOUND = 'P2025',
	FOREIGN_KEY_CONSTRAINT = 'P2003',
}

export const isPrismaError = (
	error: unknown,
	code: PrismaErrorCode,
): boolean => {
	return (
		error instanceof Prisma.PrismaClientKnownRequestError &&
		error.code === code
	);
};

export const getUniqueConstraintFields = (error: unknown): string[] => {
	const prismaError = error as Prisma.PrismaClientKnownRequestError;
	const driverError = prismaError.meta?.driverAdapterError as any;
	return (driverError?.cause?.constraint?.fields as string[]) ?? [];
};
