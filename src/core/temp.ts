import {FileOps} from "tusk";
import {Snowflake} from "discord.js";
import fs from "fs";
import path from "path";
import {default as main} from "require-main-filename";
import Log from "./log";
import {PromiseOr} from "@atlas/xlib";
import JsonUtil from "../util/json";

export interface ITemp {
    setup(id: Snowflake): this;
    create(): PromiseOr<this>;
    reset(): PromiseOr<this>;
    store(data: any, file: string): PromiseOr<this>;
}

// TODO: Temp base path should be optionally determined from settings.
/**
 * Allows management of temporary data storage.
 */
export default class Temp implements ITemp {
    public static resolvePath(id: string): string {
        return path.join(Temp.resolveRootPath(), `u${id}`);
    }

    public static resolveRootPath(): string {
        return path.join(path.dirname(main()), "tmp");
    }

    protected id?: string;
    protected resolvedPath?: string;

    public setup(id: Snowflake): this {
        this.id = id;
        this.resolvedPath = Temp.resolvePath(this.id);

        return this;
    }

    /**
     * Create the temp folder for the bot.
     */
    public async create(): Promise<this> {
        return new Promise<this>((resolve) => {
            if (!this.resolvedPath) {
                throw Log.error("Trying to create when the resolved path is undefined");
            }

            if (!fs.existsSync(this.resolvedPath)) {
                if (!fs.existsSync(Temp.resolveRootPath())) {
                    fs.mkdirSync(Temp.resolveRootPath());
                }

                fs.mkdir(this.resolvedPath, (error: Error) => {
                    if (error) {
                        Log.error(`There was an error creating the temp folder for the bot: ${this.id} (${error.message})`);
                    }

                    resolve(this);
                });
            }
            else {
                Log.warn(`Temp folder already exists for the bot: ${this.id}. This may be due to an improper bot shutdown.`);

                resolve(this);
            }
        });
    }

    /**
     * Clear all files and folders until the temp directory.
     */
    public async reset(): Promise<this> {
        if (!this.resolvedPath) {
            return this;
        }
        else if (fs.existsSync(this.resolvedPath)) {
            FileOps.forceRemoveSync(this.resolvedPath);
        }

        return this;
    }

    /**
     * Write data in JSON into a file in the temp folder for the bot.
     * @param {string} file The file in which to store the data.
     */
    public async store(data: any, file: string): Promise<this> {
        if (!this.resolvedPath) {
            throw Log.error("Trying to store when the resolved path is undefined");
        }

        await JsonUtil.write(path.resolve(path.join(this.resolvedPath, file)), data);

        return this;
    }
}
