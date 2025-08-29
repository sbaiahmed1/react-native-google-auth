import GoogleAuth from './NativeGoogleAuth';

export function multiply(a: number, b: number): Promise<number> {
  return GoogleAuth.multiply(a, b);
}
