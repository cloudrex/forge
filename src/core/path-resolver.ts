import path from "path";
import {ISettingsPaths} from "./settings";

export interface IPathResolver {
    command(name: string): string;
    service(name: string): string;
    task(name: string): string;
    language(name: string): string;
}

export default class PathResolver implements IPathResolver {
    public static resolve(...paths: string[]): string {
        return path.resolve(path.join(...paths));
    }

    protected paths: ISettingsPaths;

    public constructor(paths: ISettingsPaths) {
        this.paths = paths;
    }

    public command(name: string): string {
        return path.resolve(this.paths.commands, `${name}.js`);
    }

    public service(name: string): string {
        return path.resolve(this.paths.commands, `${name}.js`);
    }

    public task(name: string): string {
        return path.resolve(this.paths.tasks, `${name}.js`);
    }

    public language(name: string): string {
        return PathResolver.resolve(this.paths.languages, `${name}.json`);
    }
}
