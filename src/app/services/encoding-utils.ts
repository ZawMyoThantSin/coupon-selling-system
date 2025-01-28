import { deflate, inflate } from 'pako';

const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export class EncodingUtils {
  // Encode the string to a 6-character Base62 string and store in localStorage
  static encode(original: string): string {
    // Compress the original string using pako
    const compressed = deflate(original);

    // Convert the compressed data to Base62
    const base62String = toBase62(compressed);

    // Generate a 6-character identifier
    const identifier = base62String.slice(0, 6);

    // Convert the compressed data to base64 (string format) for storage

    return identifier;
  }

  // Decode the 6-character Base62 string and retrieve from localStorage
  static decode(encoded: string): string {
    // Retrieve the base64-encoded compressed data from localStorage
    const base64Compressed = encoded;

    if (!base64Compressed) {
      throw new Error(`Unable to decode: Identifier "${encoded}" not found.`);
    }

    // Decode the base64 string back into a Uint8Array
    const compressed = new Uint8Array(atob(base64Compressed).split('').map((char) => char.charCodeAt(0)));

    // Decompress the data to get the original string
    const original = inflate(compressed, { to: 'string' });

    return original;
  }
}

// Helper function for Base62 encoding
function toBase62(array: Uint8Array): string {
  let value = BigInt(0);
  array.forEach((byte) => {
    value = (value << 8n) | BigInt(byte);
  });

  let base62 = '';
  while (value > 0) {
    const index = Number(value % 62n);
    base62 = BASE62_CHARS[index] + base62;
    value /= 62n;
  }

  return base62;
}

// Helper function for Base62 decoding
function fromBase62(base62: string): Uint8Array {
  let value = BigInt(0);
  for (const char of base62) {
    value = value * 62n + BigInt(BASE62_CHARS.indexOf(char));
  }

  const bytes = [];
  while (value > 0) {
    bytes.unshift(Number(value & 0xffn));
    value >>= 8n;
  }

  return new Uint8Array(bytes);
}
