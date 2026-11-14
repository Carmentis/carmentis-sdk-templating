const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export class DataUrl {
    static getDataAsString(str: string) {
        const parsed = DataUrl.parse(str);
        if (parsed.type === "") {
            throw new Error('Invalid data URL');
        }
        return parsed.data;
    }

    static getDataAsBinary(str: string) {
        const data = DataUrl.getDataAsString(str);
        return DataUrl.decodeBase64(data);
    }

    static getType(str: string, expectedType?: string) {
        const p = DataUrl.parse(str);
        if (expectedType !== undefined && p.type !== expectedType) {
            return { type: "", subType: "" };
        }
        return { type: p.type, subType: p.subType };
    }

    static encode(type: string, data: Uint8Array) {
        return `data:${type};base64,${DataUrl.encodeBase64(data)}`;
    }

    private static parse(str: string) {
        const m = str.match(/^data:([\w.+-]+)\/([\w.+-]+);base64,([a-zA-Z\d+/]*)(={0,2})$/);
        if (m === null) {
            return { type: "", subType: "", data: "" };
        }
        return { type: m[1], subType: m[2], data: m[3] + m[4] };
    }

    private static encodeBase64(bytes: Uint8Array): string {
        const chars: string[] = [];
        let acc = 0, bits = 0;

        for (const b of bytes) {
            acc = (acc << 8) | b;
            bits += 8;
            while (bits >= 6) {
                bits -= 6;
                chars.push(BASE64[(acc >> bits) & 63]);
            }
            // keep only the pending bits, so acc never overflows
            acc &= (1 << bits) - 1;
        }
        if (bits > 0) {
            // last partial sextet, zero-padded on the right
            chars.push(BASE64[(acc << (6 - bits)) & 63]);
        }
        while (chars.length % 4) chars.push('=');
        return chars.join('');
    }

    private static decodeBase64(str: string): Uint8Array {
        const m = /^([A-Za-z\d+/]*)(={0,2})$/.exec(str);
        if (!m) {
            throw new Error('Invalid base64 content');
        }

        const [, data, pad] = m;

        if (data.length % 4 === 1 || (pad && (data.length + pad.length) % 4 !== 0)) {
            throw new Error('Invalid base64 length');
        }

        const out = new Uint8Array(Math.floor(data.length * 3 / 4));
        let acc = 0, bits = 0, o = 0;
        for (let i = 0; i < data.length; i++) {
            acc = (acc << 6) | BASE64.indexOf(data[i]);
            bits += 6;
            if (bits >= 8) {
                bits -= 8;
                out[o++] = (acc >> bits) & 0xff;
            }
        }
        return out;
    }
}
