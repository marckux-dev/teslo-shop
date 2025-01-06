

export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: (error: Error, accept: boolean) => void) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
    return callback(null, false);
  } else {
    callback(null, true);
  }
}