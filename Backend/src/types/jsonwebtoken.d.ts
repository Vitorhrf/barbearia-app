declare module "jsonwebtoken" {
  export class JsonWebTokenError extends Error {}
  export class TokenExpiredError extends JsonWebTokenError {}

  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: string,
    options?: {
      expiresIn?: string | number;
    },
  ): string;

  export function verify(token: string, secretOrPublicKey: string): string | Record<string, unknown>;

  const jwt: {
    sign: typeof sign;
    verify: typeof verify;
    JsonWebTokenError: typeof JsonWebTokenError;
    TokenExpiredError: typeof TokenExpiredError;
  };

  export default jwt;
}
