export class HandledError {
  code: number
  name: string
  message: string

  constructor(message, code?) {
    // super(message);
    this.name = 'HandledError';
    this.code = code;
    this.message = message
  }
}

export function errorJSON(error, res) {

  let message = 'Internal server error'
  let code = 500

  if (error instanceof HandledError) {
    message = error.message
    code =  error.code || 500
  }

  console.log('errorJSON', message, code, 'error', error.message, error instanceof HandledError, typeof error)
  return res
    .status(code)
    .json({message})

}
