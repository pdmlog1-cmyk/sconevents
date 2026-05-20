/* =============================================================================
   Cloudflare R2 helpers for JSON record storage
   -----------------------------------------------------------------------------
   Used by the registration / payment persistence pipeline. R2 is S3-compatible
   and the same credentials power /api/upload (abstract files).

   Path convention (matches the existing upload route):
     addiction/registration/<token>.json
     addiction/payment/<token>.json

   All functions are best-effort and never throw — callers receive a typed
   result object and can decide how to proceed. We deliberately don't crash
   form submissions when R2 is unreachable: payments and CMS forwarding
   happen through other channels.
   ============================================================================= */

import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  type S3ServiceException,
} from '@aws-sdk/client-s3';

export const PROJECT_NAMESPACE = 'addiction';

export type R2PutResult =
  | { ok: true; key: string }
  | { ok: false; error: string };

export type R2HeadResult =
  | { ok: true; exists: true; key: string }
  | { ok: true; exists: false; key: string }
  | { ok: false; error: string };

export type R2GetResult<T> =
  | { ok: true; data: T; key: string }
  | { ok: false; reason: 'not_found' | 'error'; error?: string };

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

export function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ENDPOINT &&
    process.env.R2_BUCKET &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY,
  );
}

function client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

const BUCKET = () => process.env.R2_BUCKET!;

function isNotFound(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false;
  const x = e as Partial<S3ServiceException> & {
    $metadata?: { httpStatusCode?: number };
    name?: string;
  };
  return x.$metadata?.httpStatusCode === 404 || x.name === 'NotFound' || x.name === 'NoSuchKey';
}

/* -------------------------------------------------------------------------- */
/*  Operations                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Write a JSON object at the given key. ifNoneMatch=true uses a HEAD precheck
 * so an existing key is not overwritten (anti-replay for payments).
 *
 * Note: Cloudflare R2 also supports a native If-None-Match: * header, but the
 * AWS S3 SDK's PutObject doesn't expose that flag directly — the explicit
 * HEAD-then-PUT pattern is portable and easy to reason about.
 */
export async function r2PutJson(
  key: string,
  data: unknown,
  opts: { ifNoneMatch?: boolean; contentDisposition?: string } = {},
): Promise<R2PutResult & { conflict?: boolean }> {
  if (!r2Configured()) return { ok: false, error: 'R2 not configured' };

  const c = client();

  if (opts.ifNoneMatch) {
    try {
      await c.send(new HeadObjectCommand({ Bucket: BUCKET(), Key: key }));
      // Object exists — refuse to overwrite.
      return { ok: false, error: 'Already exists', conflict: true };
    } catch (e) {
      if (!isNotFound(e)) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
      // Falls through — key doesn't exist, safe to PUT.
    }
  }

  try {
    await c.send(new PutObjectCommand({
      Bucket: BUCKET(),
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json; charset=utf-8',
      ...(opts.contentDisposition ? { ContentDisposition: opts.contentDisposition } : {}),
    }));
    return { ok: true, key };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Check whether an object exists. Distinguishes "doesn't exist" (200 ok with
 * exists:false) from "I couldn't ask R2" (ok:false).
 */
export async function r2Head(key: string): Promise<R2HeadResult> {
  if (!r2Configured()) return { ok: false, error: 'R2 not configured' };
  try {
    await client().send(new HeadObjectCommand({ Bucket: BUCKET(), Key: key }));
    return { ok: true, exists: true, key };
  } catch (e) {
    if (isNotFound(e)) return { ok: true, exists: false, key };
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Fetch and parse a JSON object. not_found is a normal outcome here (the
 * caller decides whether to retry, redirect, or 404).
 */
export async function r2GetJson<T = unknown>(key: string): Promise<R2GetResult<T>> {
  if (!r2Configured()) return { ok: false, reason: 'error', error: 'R2 not configured' };
  try {
    const r = await client().send(new GetObjectCommand({ Bucket: BUCKET(), Key: key }));
    const body = await r.Body?.transformToString('utf-8');
    if (!body) return { ok: false, reason: 'error', error: 'Empty body' };
    const data = JSON.parse(body) as T;
    return { ok: true, data, key };
  } catch (e) {
    if (isNotFound(e)) return { ok: false, reason: 'not_found' };
    return { ok: false, reason: 'error', error: e instanceof Error ? e.message : String(e) };
  }
}

/* -------------------------------------------------------------------------- */
/*  Path builders                                                             */
/* -------------------------------------------------------------------------- */

export function registrationKey(token: string): string {
  return `${PROJECT_NAMESPACE}/registration/${token}.json`;
}

export function paymentKey(token: string): string {
  return `${PROJECT_NAMESPACE}/payment/${token}.json`;
}
