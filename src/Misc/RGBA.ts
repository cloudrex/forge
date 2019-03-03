import RGB from "./RGB";

export interface IRgbaOptions {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    readonly alpha: number;
}

export default class RGBA extends RGB {
    public static fromHex(hex: string): RGBA | null {
        const result: RegExpExecArray | null = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        if (result === null) {
            return null;
        }

        const options: IRgbaOptions = {
            alpha: 255,
            blue: parseInt(result[2], 16),
            green: parseInt(result[3], 16),
            red: parseInt(result[1], 16)
        };

        // TODO: Also get the Alpha value (instead of being hardcoded).
        return result ? new RGBA(options) : null;
    }

    public readonly alpha: number;

    public constructor(options: IRgbaOptions) {
        super(options.red, options.green, options.blue);

        this.alpha = options.alpha;
    }

    public toString(): string {
        return `${this.red}, ${this.green}, ${this.blue}, ${this.alpha}`;
    }

    public toObject(): any {
        return {
            red: this.red,
            green: this.green,
            blue: this.blue,
            alpha: this.alpha
        };
    }

    // TODO: Support for shorthand hex.
    /* function hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    } */
}
