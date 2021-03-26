/* eslint-disable camelcase */

import { ApiContext } from '../../types';

export default async function getCurrentBearerToken({ client, config }: ApiContext): Promise<string> {
  const token = await config.auth.getOAuthToken();
  if (!token) {
    return;
  }

  const tokenExpiresAt = token.created_at + token.expires_in;
  const currentTime = Date.now() / 1000;

  if (currentTime < tokenExpiresAt) {
    return token.access_token;
  }

  const result = await client.authentication.refreshToken({ refresh_token: token.refresh_token });
  if (result.isFail()) {
    throw result.fail();
  }

  const newToken = result.success();
  await config.auth.changeToken(newToken);

  return newToken.access_token;
}
