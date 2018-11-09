import Log from "../core/log";
import Bot from "../core/bot";
import Command, {GenericCommand} from "./command";
import CommandContext from "./command-context";
import {Snowflake} from "discord.js";
import FragmentLoader, {ICommandPackage} from "../fragments/fragment-loader";
import Utils from "../core/utils";

/**
 * @enum {number}
 */
export enum CommandManagerEvent {
    DisallowedEnvironment,
    DisabledCommand,
    ArgumentAmountMismatch,
    CommandMayNotExecute,
    InvalidArguments,
    MissingSelfPermissions,
    MissingIssuerPermissions,
    CommandError,
    NoAuthority,
    UnderCooldown
}

export type ICommandCooldown = {
    readonly context: CommandContext;
    readonly command: Command;
    readonly end: number;
}

const validCommandNamePattern: RegExp = /^[a-z_0-9-]{1,40}$/mi;

export type ICommandMap = Map<string, ICommandPackage>;

export type IReadonlyCommandMap = ReadonlyMap<string, ICommandPackage>;

export default class CommandStore {
    public readonly bot: Bot;
    public readonly cooldowns: Map<Snowflake, Map<string, number>>;

    public simpleCommands: Map<string, any>;

    private readonly commands: ICommandMap;
    private readonly aliases: Map<string, string>;

    /**
     * @param {Bot} bot
     */
    constructor(bot: Bot) {
        /**
         * @type {Bot}
         * @private
         * @readonly
         */
        this.bot = bot;

        /**
         * @type {ICommandMap}
         * @private
         */
        this.commands = new Map();

        /**
         * @type {Map<string, string>}
         * @private
         */
        this.aliases = new Map();

        /**
         * @type {ICommandCooldown[]}
         * @private
         * @readonly
         */
        this.cooldowns = new Map();

        /**
         * @type {Map<string, any>}
         */
        this.simpleCommands = new Map();
    }

    /**
     * @param {string} commandName
     * @return {Promise<boolean>}
     */
    public async reload(commandName: string): Promise<boolean> {
        if (!this.commands.has(commandName)) {
            return false;
        }

        const packg: ICommandPackage = this.commands.get(commandName) as ICommandPackage;
        const reloadedPackage: ICommandPackage | null = await FragmentLoader.reload(packg.path) as ICommandPackage | null;

        if (reloadedPackage === null) {
            return false;
        }

        // Delete current command
        this.commands.delete(commandName);

        // Register new one
        this.register({
            // TODO: CRITICAL: We shouldn't have to re-instianciate the module, it should be already instanciated at this point
            module: new (reloadedPackage.module as any)(),
            
            path: reloadedPackage.path
        });

        return true;
    }

    /**
     * Reload all commands
     * @return {Promise<number>} The amount of commands that were reloaded
     */
    public async reloadAll(): Promise<number> {
        let reloaded: number = 0;

        for (let [base, command] of this.commands) {
            if (await this.reload(base)) {
                reloaded++;
            }
        }

        return reloaded;
    }

    /**
     * Register a command
     * @param {ICommandPackage} commandPackage
     */
    public register(commandPackage: ICommandPackage): boolean {
        if (Utils.isEmpty(commandPackage) || typeof commandPackage !== "object") {
            return false;
        }

        const commandName: string = commandPackage.module.meta.name.trim();

        if (validCommandNamePattern.test(commandName) === false) {
            Log.warn(`[CommandStore.register] Failed to register command '${commandName}' (Invalid name)`);

            return false;
        }
        else if (this.get(commandName) !== null) {
            Log.warn(`[CommandStore.register] Failed to register command '${commandName}' (Already exists)`);

            return false;
        }

        // Also register aliases
        if (commandPackage.module.aliases && commandPackage.module.aliases.length > 0) {
            for (let i: number = 0; i < commandPackage.module.aliases.length; i++) {
                if (this.aliases.get(commandPackage.module.aliases[i]) !== undefined) {
                    // TODO: Is undoIdx < i correct? or should it be undoIdx <= i
                    // Undo
                    for (let undoIdx = 0; undoIdx < i; undoIdx++) {
                        this.aliases.delete(commandPackage.module.aliases[undoIdx]);
                    }

                    Log.warn(`[CommandStore.register] Failed to register command '${commandName}' (A command with the same alias already exists)`);

                    return false;
                }

                this.aliases.set(commandPackage.module.aliases[i], commandName);
            }
        }

        this.commands.set(commandName, commandPackage);

        return true;
    }

    /**
     * @param {string} commandBase
     * @return {boolean} Whether the command was removed
     */
    public remove(commandBase: string): boolean {
        // TODO: Verify that command is only Command and not WeakCommand etc.
        const command: Command = this.get(commandBase) as Command;

        // Remove any command aliases that might exist
        if (command.aliases && command.aliases.length > 0) {
            for (let i: number = 0; i < command.aliases.length; i++) {
                this.aliases.delete(command.aliases[i]);
            }
        }

        return this.commands.delete(commandBase);
    }

    /**
     * @param {string} commandBase
     * @return {boolean}
     */
    public contains(commandBase: string): boolean {
        if (!commandBase) {
            return false;
        }

        return this.commands.has(commandBase) || this.aliases.has(commandBase);
    }

    /**
     * @param {string} commandBase
     * @return {Command | null}
     */
    public get(commandBase: string): Command | null {
        // TODO: CRITICAL: Will probably error since property may be undefined (Trying to access .module of undefined)
        if (this.aliases.get(commandBase) !== undefined) {
            const command: ICommandPackage | null = (this.commands.get(this.aliases.get(commandBase) as string) as ICommandPackage) || null;

            return command === null ? null : command.module;
        }

        const command: ICommandPackage | null = (this.commands.get(commandBase) as ICommandPackage) || null;

        return command === null ? null : command.module;
    }

    /**
     * @param {ICommandPackage[]} commands
     * @return {CommandStore}
     */
    public registerMultiple(commands: ICommandPackage[]): this {
        for (let i = 0; i < commands.length; i++) {
            this.register(commands[i]);
        }

        return this;
    }

    /**
     * Get all the registered commands
     * @return {IReadonlyCommandMap}
     */
    public getAll(): IReadonlyCommandMap {
        return this.commands as IReadonlyCommandMap;
    }

    /**
     * @param {Snowflake} userId
     * @param {string} commandName
     * @return {number | null} The cooldown
     */
    public getCooldown(userId: Snowflake, commandName: string): number | null {
        const issuerCooldowns: Map<string, number> | null = this.cooldowns.get(userId) || null;

        if (issuerCooldowns === null) {
            return null;
        }

        return issuerCooldowns.get(commandName) || null;
    }

    /**
     * @param {Snowflake} userId
     * @param {Command} commandName
     * @return {boolean}
     */
    public cooldownExpired(userId: Snowflake, commandName: string): boolean {
        const cooldown: number | null = this.getCooldown(userId, commandName);

        return (cooldown !== null && Date.now() > cooldown) || cooldown === null;
    }

    /**
     * @param {Snowflake} userId
     * @param {string} commandName
     * @return {boolean}
     */
    public clearCooldown(userId: Snowflake, commandName: string): boolean {
        const issuerCooldowns: Map<string, number> | null = this.cooldowns.get(userId) || null;

        if (issuerCooldowns) {
            issuerCooldowns.delete(commandName);

            return true;
        }

        return false;
    }

    /**
     * @param {Snowflake} userId
     * @param {number} cooldown
     * @param {string} commandName
     */
    public setCooldown(userId: Snowflake, cooldown: number, commandName: string): void {
        const currentCooldown: number | null = this.getCooldown(userId, commandName);

        if (currentCooldown !== null) {
            // Must exist at this point
            (this.cooldowns.get(userId) as Map<string, number>).set(commandName, cooldown);

            return;
        }

        const newCooldowns: Map<string, number> = new Map();

        newCooldowns.set(commandName, cooldown);

        this.cooldowns.set(userId, newCooldowns);
    }

    /**
     * @return {Promise<void>}
     */
    public async disposeAll(): Promise<void> {
        for (let [base, command] of this.commands) {
            if (command instanceof GenericCommand) {
                await command.dispose();
            }
        }
    }

    /**
     * Unload all commandStore
     */
    public unloadAll(): void {
        if (this.commands.size > 0) {
            const count = this.commands.size;

            this.commands.clear();
            Log.success(`[CommandManager.unloadAll] Unloaded ${count} command(s)`);
        }
    }
}
