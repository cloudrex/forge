import {Message, Role, Snowflake} from "discord.js";
import {EventEmitter} from "events";

/**
 * @todo CRITICAL (not here maybe) When loading auth store .json, if it's empty (not containing "[]") it will throw "Unexpected end of JSON" error
 * @extends EventEmitter
 */
export default abstract class CommandAuthStore extends EventEmitter {
    public schema: any;

    /**
     * @abstract
     * @param {Snowflake} guildId
     * @param {*} identifier
     * @return {number}
     */
    public abstract getAuthLevel(guildId: Snowflake, identifier: any): number;

    /**
     * @abstract
     * @param {Snowflake} guildId
     * @param {Array<string>} roles
     * @return {number}
     */
    public abstract getHighestAuthLevelByRoles(guildId: Snowflake, roles: Array<string>): number;

    /**
     * @todo TYPESCRIPT Fix initializer in implementations (not allowed in typescript abstract methods)
     * @abstract
     * @param {Snowflake} guildId
     * @param {Snowflake} userId
     * @param {Array<string>} roles
     * @return {number} The authority of the user
     */
    public abstract getAuthority(guildId: Snowflake, userId: Snowflake, roles: Array<string>/* = ["@everyone"]*/): number;

    /**
     * Create a default auth store entry
     * @abstract
     * @param {Snowflake} guildId
     * @return {boolean} Whether the entry was created
     */
    public abstract create(guildId: Snowflake): boolean;

    /**
     * Remove an auth store entry
     * @abstract
     * @param {Snowflake} guildId
     * @return {boolean} Whether the entry was removed
     */
    public abstract remove(guildId: Snowflake): boolean;

    /**
     * Manage the Auth Level of an user
     * @param {Snowflake} guildId
     * @param {Snowflake} userId
     * @param {number} authLevel
     */
    public abstract setUserAuthority(guildId: Snowflake, userId: Snowflake, authLevel: number): boolean;

    /**
     * Determine whether this auth store contains an entry
     * @param {Snowflake} guildId
     * @return {boolean} Whether the entry exists
     */
    public abstract contains(guildId: Snowflake): boolean;

    /**
     * @param {Snowflake} guildId
     * @param {Message} message
     * @param {number} authLevel
     * @return {boolean}
     */
    public hasAuthority(guildId: Snowflake, message: Message, authLevel: number): boolean {
        // TODO: Message.member may return undefined in private channels (DMs)
        return this.getAuthority(guildId, message.author.id, message.member.roles.array().map((role: Role) => role.name)) >= authLevel;
    }

    /**
     * @param {number} rank
     * @return {string | null}
     */
    public getSchemaRankName(rank: number): string | null {
        const keys = Object.keys(this.schema);

        for (let i = 0; i < keys.length; i++) {
            if (this.schema[keys[i]].rank === rank) {
                return keys[i];
            }
        }

        return null;
    }
}
