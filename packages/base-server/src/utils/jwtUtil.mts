import jsonwebtoken from "jsonwebtoken";

import baseKeyConfig from "../configs/baseKey.config.mjs";
namespace UserTypes {
  export interface User {}
}

if (!baseKeyConfig.JWT_ID_TOKEN_SIGNING_KEY || !baseKeyConfig.JWT_PRIVATE_KEY) {
  throw new Error("required jwt id token signing key and private key");
}

const REFRESH_TOKEN_EXPIRES = 30 * 24 * 60 * 60 * 1000; // 30 days
const INVITATION_TOKEN_EXPIRES = 180 * 24 * 60 * 60 * 1000;

const ACCESS_TOKEN_EXPIRES = 30 * 24 * 60 * 60 * 1000; // 30 days
const OAUTH_AUTHENTICATE_CODE_EXPIRES = 5 * 60 * 10000; // 5 minutes
const SUBSCRIBER_API_TOKEN_EXPIRES = 20 * 365 * 24 * 60 * 60 * 1000; // 20 years
const EMAIL_VERIFICATION_TOKEN_EXPIRES = 15 * 60 * 10000; // 15 minutes

type AccessTokenPayload = {
  userId: string;
  user: UserTypes.User;
  tenantId?: string;
  requester?: string;
};
type OnetimeTokenPayload = { onetimeTokenId: string; tenantId: string };
type SessionTokenPayload = { sessionId?: string };
type OAuthAuthenticateCodePayload = {
  userId: string;
  tenantId: string;
  client_id: string;
  client_secret: string;
  requester: string;
};
type SubscriberApiTokenPayload = { tenantId: string };
type EmailVerifyTokenPayload = {
  onetimeTokenId: string;
};

class JwtUtil {
  public static accessToken = {
    sign: async ({
      accessTokenPayload,
      expiresIn = ACCESS_TOKEN_EXPIRES,
    }: {
      accessTokenPayload: AccessTokenPayload;
      expiresIn?: number | string;
    }): Promise<string> => {
      try {
        const token: string = await new Promise((resolve, reject) =>
          jsonwebtoken.sign(
            accessTokenPayload,
            baseKeyConfig.JWT_ID_TOKEN_SIGNING_KEY,
            {
              algorithm: "HS256",
              expiresIn,
            },
            (error, encoded) => {
              if (error || !encoded) {
                return reject(error);
              }
              resolve(encoded);
            }
          )
        );
        return token;
      } catch (error) {
        console.error("FAILED SIGN JWT for login session");
        throw error;
      }
    },
    verify: async ({ accessToken }: { accessToken: string }) => {
      const accessTokenPayload: AccessTokenPayload = await new Promise(
        (resolve, reject) =>
          jsonwebtoken.verify(
            accessToken,
            baseKeyConfig.JWT_ID_TOKEN_SIGNING_KEY,
            (error, decoded) => {
              if (error || !decoded) {
                return reject(error);
              }
              resolve(decoded as AccessTokenPayload);
            }
          )
      );
      return accessTokenPayload;
    },
  };

  public static refreshToken = {
    sign: async ({
      refreshTokenPayload,
      expiresIn = REFRESH_TOKEN_EXPIRES,
    }: {
      refreshTokenPayload: AccessTokenPayload;
      expiresIn?: number | string;
    }): Promise<string> => {
      try {
        const token: string = await new Promise((resolve, reject) =>
          jsonwebtoken.sign(
            refreshTokenPayload,
            baseKeyConfig.JWT_PRIVATE_KEY,
            {
              algorithm: "RS256",
              expiresIn,
            },
            (error, encoded) => {
              if (error || !encoded) {
                return reject(error);
              }
              resolve(encoded);
            }
          )
        );
        return token;
      } catch (error) {
        console.error("FAILED SIGN JWT for login session - ", error);
        throw error;
      }
    },
    verify: async ({ refreshToken }: { refreshToken: string }) => {
      const refreshTokenPayload: AccessTokenPayload = await new Promise(
        (resolve, reject) =>
          jsonwebtoken.verify(
            refreshToken,
            baseKeyConfig.JWT_PRIVATE_KEY,
            { algorithms: ["RS256"] },
            (error, decoded) => {
              if (error || !decoded) {
                return reject(error);
              }
              resolve(decoded as AccessTokenPayload);
            }
          )
      );
      return refreshTokenPayload;
    },
  };

  public static sessionToken = {
    sign: async ({
      sessionTokenPayload,
      expiresIn = REFRESH_TOKEN_EXPIRES,
    }: {
      sessionTokenPayload: SessionTokenPayload;
      expiresIn?: number | string;
    }): Promise<string> => {
      try {
        const token: string = await new Promise((resolve, reject) =>
          jsonwebtoken.sign(
            sessionTokenPayload,
            baseKeyConfig.JWT_ID_TOKEN_SIGNING_KEY,
            {
              algorithm: "HS256",
              expiresIn,
            },
            (error, encoded) => {
              if (error || !encoded) {
                return reject(error);
              }
              resolve(encoded);
            }
          )
        );
        return token;
      } catch (error) {
        console.error("FAILED SIGN JWT for login session - ", error);
        throw error;
      }
    },
    verify: async ({ sessionToken }: { sessionToken: string }) => {
      const sessionTokenPayload: SessionTokenPayload = await new Promise(
        (resolve, reject) =>
          jsonwebtoken.verify(
            sessionToken,
            baseKeyConfig.JWT_ID_TOKEN_SIGNING_KEY,
            (error, decoded) => {
              if (error || !decoded) {
                return reject(error);
              }
              resolve(decoded as SessionTokenPayload);
            }
          )
      );
      return sessionTokenPayload;
    },
  };

  public static onetimeToken = {
    sign: async ({
      onetimeTokenPayload,
      expiresIn = INVITATION_TOKEN_EXPIRES,
    }: {
      onetimeTokenPayload: OnetimeTokenPayload;
      expiresIn?: number | string;
    }): Promise<string> => {
      try {
        const token: string = await new Promise((resolve, reject) =>
          jsonwebtoken.sign(
            onetimeTokenPayload,
            baseKeyConfig.JWT_PRIVATE_KEY,
            {
              algorithm: "RS256",
              expiresIn,
            },
            (error, encoded) => {
              if (error || !encoded) {
                return reject(error);
              }
              resolve(encoded);
            }
          )
        );
        return token;
      } catch (error) {
        console.error("FAILED SIGN JWT for invitation token - ", error);
        throw error;
      }
    },
    verify: async ({ onetimeToken }: { onetimeToken: string }) => {
      const onetimeTokenPayload: OnetimeTokenPayload = await new Promise(
        (resolve, reject) =>
          jsonwebtoken.verify(
            onetimeToken,
            baseKeyConfig.JWT_PRIVATE_KEY,
            { algorithms: ["RS256"] },
            (error, decoded) => {
              if (error || !decoded) {
                return reject(error);
              }
              resolve(decoded as OnetimeTokenPayload);
            }
          )
      );
      return onetimeTokenPayload;
    },
  };

  public static oAuthAuthenticateCode = {
    sign: async ({
      oAuthAuthenticateCodePayload,
      expiresIn = OAUTH_AUTHENTICATE_CODE_EXPIRES,
    }: {
      oAuthAuthenticateCodePayload: OAuthAuthenticateCodePayload;
      expiresIn?: number | string;
    }): Promise<string> => {
      try {
        const token: string = await new Promise((resolve, reject) =>
          jsonwebtoken.sign(
            oAuthAuthenticateCodePayload,
            baseKeyConfig.JWT_PRIVATE_KEY,
            {
              algorithm: "RS256",
              expiresIn,
            },
            (error, encoded) => {
              if (error || !encoded) {
                return reject(error);
              }
              resolve(encoded);
            }
          )
        );
        return token;
      } catch (error) {
        console.error("FAILED SIGN JWT for OAuth authentication - ", error);
        throw error;
      }
    },
    verify: async ({
      oAuthAuthenticateCode,
    }: {
      oAuthAuthenticateCode: string;
    }) => {
      const oAuthAuthenticateCodePayload: OAuthAuthenticateCodePayload =
        await new Promise((resolve, reject) =>
          jsonwebtoken.verify(
            oAuthAuthenticateCode,
            baseKeyConfig.JWT_PRIVATE_KEY,
            { algorithms: ["RS256"] },
            (error, decoded) => {
              if (error || !decoded) {
                return reject(error);
              }
              resolve(decoded as OAuthAuthenticateCodePayload);
            }
          )
        );
      return oAuthAuthenticateCodePayload;
    },
  };
  public static subscriberApiToken = {
    sign: async ({
      subscriberApiTokenPayload,
      expiresIn = SUBSCRIBER_API_TOKEN_EXPIRES,
    }: {
      subscriberApiTokenPayload: SubscriberApiTokenPayload;
      expiresIn?: number | string;
    }): Promise<string> => {
      try {
        const token: string = await new Promise((resolve, reject) =>
          jsonwebtoken.sign(
            subscriberApiTokenPayload,
            baseKeyConfig.JWT_PRIVATE_KEY,
            {
              algorithm: "RS256",
              expiresIn,
            },
            (error, encoded) => {
              if (error || !encoded) {
                return reject(error);
              }
              resolve(encoded);
            }
          )
        );
        return token;
      } catch (error) {
        console.error("FAILED SIGN JWT for subscriber API token - ", error);
        throw error;
      }
    },
    verify: async ({ subscriberApiToken }: { subscriberApiToken: string }) => {
      const subscriberApiTokenPayload: SubscriberApiTokenPayload =
        await new Promise((resolve, reject) =>
          jsonwebtoken.verify(
            subscriberApiToken,
            baseKeyConfig.JWT_PRIVATE_KEY,
            { algorithms: ["RS256"] },
            (error, decoded) => {
              if (error || !decoded) {
                return reject(error);
              }
              resolve(decoded as SubscriberApiTokenPayload);
            }
          )
        );
      return subscriberApiTokenPayload;
    },
  };

  public static emailVerificationToken = {
    sign: async ({
      emailVerifyTokenPayload,
      expiresIn = EMAIL_VERIFICATION_TOKEN_EXPIRES,
    }: {
      emailVerifyTokenPayload: EmailVerifyTokenPayload;
      expiresIn?: number | string;
    }): Promise<string> => {
      try {
        const token: string = await new Promise((resolve, reject) =>
          jsonwebtoken.sign(
            emailVerifyTokenPayload,
            baseKeyConfig.JWT_PRIVATE_KEY,
            {
              algorithm: "RS256",
              expiresIn,
            },
            (error, encoded) => {
              if (error || !encoded) {
                return reject(error);
              }
              resolve(encoded);
            }
          )
        );
        return token;
      } catch (error) {
        console.error(
          "FAILED SIGN JWT for self sign up verification token - ",
          error
        );
        throw error;
      }
    },
    verify: async ({
      emailVerificationToken,
    }: {
      emailVerificationToken: string;
    }) => {
      const onetimeTokenPayload: EmailVerifyTokenPayload = await new Promise(
        (resolve, reject) =>
          jsonwebtoken.verify(
            emailVerificationToken,
            baseKeyConfig.JWT_PRIVATE_KEY,
            { algorithms: ["RS256"] },
            (error, decoded) => {
              if (error || !decoded) {
                return reject(error);
              }
              resolve(decoded as EmailVerifyTokenPayload);
            }
          )
      );
      return onetimeTokenPayload;
    },
  };
}

export default JwtUtil;
