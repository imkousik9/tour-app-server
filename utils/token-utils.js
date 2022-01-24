const jwt = require('jsonwebtoken');

const tokenExpiration = {
  access: 5 * 60,
  refresh: 7 * 24 * 60 * 60,
  refreshIfLessThan: 4 * 24 * 60 * 60
};

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: tokenExpiration.access
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: tokenExpiration.refresh
  });
}

const defaultCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',

  path: '/'
};

const refreshTokenCookieOptions = {
  ...defaultCookieOptions,
  maxAge: tokenExpiration.refresh * 1000
};

const accessTokenCookieOptions = {
  ...defaultCookieOptions,
  maxAge: tokenExpiration.access * 1000
};
function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (e) {}
}

function buildTokens(user) {
  const accessPayload = { userId: user._id };
  const refreshPayload = { userId: user._id, version: user.tokenVersion };

  const accessToken = signAccessToken(accessPayload);
  const refreshToken = refreshPayload && signRefreshToken(refreshPayload);

  return { accessToken, refreshToken };
}

function setTokens(res, access, refresh) {
  res.cookie('access', access, accessTokenCookieOptions);
  if (refresh) res.cookie('refresh', refresh, refreshTokenCookieOptions);
}

function refreshTokens(current, tokenVersion) {
  if (tokenVersion !== current.version) throw 'Token revoked';

  const accessPayload = { userId: current.userId };
  let refreshPayload;

  const expiration = new Date(current.exp * 1000);
  const now = new Date();
  const secondsUntilExpiration = (expiration.getTime() - now.getTime()) / 1000;

  if (secondsUntilExpiration < tokenExpiration.refreshIfLessThan) {
    refreshPayload = { userId: current.userId, version: tokenVersion };
  }

  const accessToken = signAccessToken(accessPayload);
  const refreshToken = refreshPayload && signRefreshToken(refreshPayload);

  return { accessToken, refreshToken };
}

function clearTokens(res) {
  res.cookie('access', '', { ...defaultCookieOptions, maxAge: 0 });
  res.cookie('refresh', '', { ...defaultCookieOptions, maxAge: 0 });
}

module.exports = {
  clearTokens,
  refreshTokens,
  setTokens,
  buildTokens,
  verifyAccessToken,
  verifyRefreshToken
};
