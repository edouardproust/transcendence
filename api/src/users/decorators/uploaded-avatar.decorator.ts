import {
	ParseFilePipe,
	MaxFileSizeValidator,
	FileTypeValidator,
	UploadedFile,
} from '@nestjs/common';
import { CONSTRAINTS } from '../../common/constants';

export const UploadedAvatar = () =>
	UploadedFile(
		new ParseFilePipe({
			validators: [
				new MaxFileSizeValidator({
					maxSize: CONSTRAINTS.user.avatar.maxSize,
				}),
				new FileTypeValidator({
					fileType: CONSTRAINTS.user.avatar.fileType,
				}),
			],
		}),
	);
