import Log from "../core/log";
import {IArgument} from "./command";

export interface IArgumentParser {
    resolve(type: string, arg: string, resolvers: {}): TemplateStringsArray;
    getRequiredArguments(schema: IArgument[]): IArgument[];
}

/**
 * Utility class for parsing command arguments.
 */
export default class ArgumentParser {
    public resolve(type: string, arg: string, resolvers: {}): TemplateStringsArray {
        const keys: string[] = Object.keys(resolvers);

        for (const key of keys) {
            if (key === type) {
                return resolvers[key](arg);
            }
        }

        throw Log.error(`Argument resolver not defined: ${type}`);
    }

    public getRequiredArguments(schema: IArgument[]): IArgument[] {
        return schema.filter((arg: IArgument) => arg.required);
    }
}
