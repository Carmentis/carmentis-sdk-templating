import { DataUrl } from "./DataUrl";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// PNGs are decoded by pdfmake: guard against huge declared sizes
const MAX_PNG_PIXELS = 25_000_000;

export class ImageUrl {
    static imageKind(bytes: Uint8Array): 'png' | 'jpeg' | null {
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
        if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
        return null;
    }

    /**
     * Accepts only base64 PNG/JPEG data URLs whose content matches the declared type; anything else becomes '#'.
     */
    static sanitizeImageDataUrl(url: string): string {
        return ImageUrl.isValidImageDataUrl(url) ? url : '#';
    }

    private static isValidImageDataUrl(url: string): boolean {
        // Cheap check first: never decode a huge string just to reject it.
        // The margin covers the "data:image/jpeg;base64," prefix and the padding.
        if (url.length > Math.ceil(MAX_IMAGE_BYTES * 4 / 3) + 64) return false;

        try {
            const kind = DataUrl.getType(url, "image").subType;
            if (kind !== 'png' && kind !== 'jpeg') return false;

            const bytes = DataUrl.getDataAsBinary(url);
            if (bytes.length > MAX_IMAGE_BYTES || ImageUrl.imageKind(bytes) !== kind) return false;

            if (kind === 'png') {
                // width/height are big-endian uint32 at offsets 16 and 20 (IHDR)
                if (bytes.length < 24) return false;
                const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
                if (view.getUint32(16) * view.getUint32(20) > MAX_PNG_PIXELS) return false;
            }
            return true;
        } catch {
            // invalid base64: treated as an invalid image, not as a fatal error
            return false;
        }
    }
}
