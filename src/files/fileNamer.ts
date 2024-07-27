import { v4 as uuid } from 'uuid';

import { Request } from 'express';

type CallbackFunction = (error: Error | null, fileName: string | false) => void;

export const fileNamer = (
  req: Request,
  file: Express.Multer.File,
  callback: CallbackFunction,
) => {
  if (!file) return callback(new Error('File is empty'), false);

  const fileExtension = file.mimetype.split('/')[1];

  const fileName = `${uuid()}.${fileExtension}`;

  callback(null, fileName);
};
