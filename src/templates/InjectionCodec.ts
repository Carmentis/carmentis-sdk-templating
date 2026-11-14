export type Segment = {
    injected: boolean;
    value: string
}

// precomputed hexadecimal encoding for the encode() method
const HEX = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));

export class InjectionCodec {
    private static readonly OPEN = '\uE000';
    private static readonly CLOSE = '\uE001';
    private static readonly PATTERN = /\uE000([0-9a-f]*)\uE001/g;
    // Same token once markdown-it has percent-encoded it inside a link destination
    private static readonly PATTERN_IN_URL = /%EE%80%80([0-9a-f]*)%EE%80%81/gi;

    private readonly encoder = new TextEncoder();
    private readonly decoder = new TextDecoder();

    /** Called by template engines for every injected value. */
    encode(value: unknown): string {
        let hex = '';
        for (const b of this.encoder.encode(String(value ?? ''))) hex += HEX[b];
        return `${InjectionCodec.OPEN}${hex}${InjectionCodec.CLOSE}`;
    }

    /** Removes sentinels from untrusted input, so only the engine can create tokens. */
    strip(text: string): string {
        return text.replace(/[\uE000\uE001]/g, '');
    }

    has(text: string): boolean {
        return text.includes(InjectionCodec.OPEN);
    }

    /** Splits text into plain and injected segments, in order. */
    split(text: string): Segment[] {
        const out: Segment[] = [];
        let last = 0;
        for (const m of text.matchAll(InjectionCodec.PATTERN)) {
            if (m.index! > last) out.push({ injected: false, value: text.slice(last, m.index) });
            out.push({ injected: true, value: this.decode(m[1]) });
            last = m.index! + m[0].length;
        }
        if (last < text.length) out.push({ injected: false, value: text.slice(last) });
        return out;
    }

    /** Replaces tokens by their plain value (code blocks, alt text...). */
    reveal(text: string): string {
        return text.replace(InjectionCodec.PATTERN, (_, hex: string) => this.decode(hex));
    }

    /** Same, for tokens percent-encoded in a URL. The value is URL-encoded. */
    revealInUrl(url: string): string {
        return url.replace(InjectionCodec.PATTERN_IN_URL, (_, hex: string) =>
            // keep existing %XX sequences, encode everything else
            encodeURI(this.decode(hex)).replace(/%25(?=[0-9A-Fa-f]{2})/g, '%')
        );
   }

    private decode(hex: string): string {
        const bytes = new Uint8Array(hex.length >> 1);
        for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(2 * i, 2 * i + 2), 16);
        return this.decoder.decode(bytes);
    }
}
