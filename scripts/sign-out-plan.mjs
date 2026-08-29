/**
 * Small, dependency-free auth sequencing helpers. Keeping the sequencing here
 * makes the browser auth client deterministic and unit-testable.
 */
export async function runPreSignInSignOut({
  livePreview,
  hasBearer,
  requestSignOut,
  clearToken,
}) {
  if (!hasBearer && !livePreview) return;
  try {
    await requestSignOut();
  } finally {
    // A preview bearer token is local session state; always clear it when we
    // start switching identities, even if the server request failed.
    clearToken();
  }
}

export async function runSignOut({
  livePreview,
  hasBearer,
  requestSignOut,
  clearToken,
  redirect,
}) {
  if (livePreview || hasBearer) {
    await requestSignOut();
    clearToken();
    redirect();
    return;
  }

  await requestSignOut();
  clearToken();
  redirect();
}
