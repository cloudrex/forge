// tslint:disable-next-line:no-var-requires
require("dotenv").config();

import {Guild, Message, Snowflake, TextChannel} from "discord.js";
import path from "path";
import List from "../collections/collection";
import Context from "../commands/command-context";
import Bot from "../core/bot";
import {EBotEvents} from "../core/bot-extra";
import Log, {LogLevel} from "../core/log";
import BotMessages from "../core/messages";
import ResponseHelper from "../core/response-helper";
import Settings from "../core/settings";
import Rgb from "../misc/rgb";
import Rgba from "../misc/rgba";
import {ITestState, TestStoreActionType} from "../state/store";

// --------- STATIC TESTS

export const TestSubjects = {
    ids: [
        "<@285578743324606482>",
        "<#432269407654248459>",
        "<&457741550970077195>",
        "285578743324606482"
    ],

    // Note: This is a regenerated token just for pattern matching!
    token: "NDMzMzg0MzM1MjExNjI2NDk4.DqrIbQ.cC0MAvHKTwbOVrPEa-Xddz356vc",

    rgb: new Rgb(5, 10, 15),

    rgba: new Rgba({
        red: 5,
        green: 10,
        blue: 15,
        alpha: 1
    }),

    collection: new List<any>(["hello", "it's me", {
        name: "John Doe"
    }]),

    settingsPath: path.resolve(path.join(__dirname, "./../../src/test/test-settings.json")),

    settingsPathTwo: path.resolve(path.join(__dirname, "./../../src/test/test-settings-2.json")),

    switches: {
        short: "base arg -h",
        long: "base arg --help",
        longValue: "base --help=hello",
        longQuotedValue: 'base --help="hello world"',
        multiple: "base arg -h -q --hello --world",
        multipleValues: "base arg -h -q --hello=world --world=hello",
        multipleQuotedValues: 'base arg -h -q --hello="world hello" --world="hello world"'
    }
};

const token: string = process.env.TEST_BOT_TOKEN as string;
const testGuildId: Snowflake = process.env.TEST_GUILD_ID as Snowflake;
const testGuildChannelId: Snowflake = process.env.TEST_CHANNEL_ID as Snowflake;

/*
    TODO: The Tempo Engine's interval isn't getting
    cleared at bot.dispose() (on shutdown) therefore leaving tests hanging.
    Hotfixed by disabling tempo engine in tests.
*/

if (!token) {
    throw new Error(BotMessages.TEST_EXPECT_TOKEN);
}
else if (!testGuildId) {
    throw new Error(BotMessages.TEST_EXPECT_GUILD);
}
else if (!testGuildChannelId) {
    throw new Error(BotMessages.TEST_EXPECT_CHANNEL);
}

Log.level = LogLevel.None;

export default class TestBot extends Bot<ITestState, TestStoreActionType> {
    public static testGuild: Guild;
    public static testChannel: TextChannel;

    public async deleteLastMessage(): Promise<void> {
        if (!this.client.user) {
            return;
        }

        const lastMessage: Message = this.getLastMessage();

        if (!lastMessage) {
            return;
        }
        else if (lastMessage.deletable) {
            await lastMessage.delete();
        }
    }

    public getLastMessage(): Message {
        return this.client.user.lastMessage;
    }

    public getContext(): Context {
        return new Context({
            bot: this,
            label: "?",

            // TODO: Should we check for a message?
            msg: this.getLastMessage() as Message
        });
    }

    public getResponseHelper(): ResponseHelper {
        return new ResponseHelper(TestBot.testChannel, this, this.client.user);
    }

    // Tests
    public async $sendEmbedMessageOk(): Promise<Message> {
        await this.getResponseHelper().ok("hello world");

        return this.getLastMessage();
    }

    public async $sendEmbedMessageFail(): Promise<Message> {
        await this.getResponseHelper().fail("failed message");

        return this.getLastMessage();
    }

    public async $sendEmbedMessageSend(): Promise<Message> {
        await this.getResponseHelper().send("hello world");

        return this.getLastMessage();
    }

    public async $longMessages(msg: string): Promise<Message> {
        await this.getResponseHelper().ok(msg);

        return this.getLastMessage();
    }
}

export let testBot: TestBot = new TestBot({
    settings: new Settings({
        general: {
            prefix: ["!"],
            token
        }
    })
}, true);

export async function init(): Promise<void> {
    return new Promise<void>(async (resolve) => {
        testBot.once(EBotEvents.Ready, () => {
            resolve();
        });

        await testBot.connect();

        // Retrieve test guild and channel
        if (!testBot.client.guilds.has(testGuildId)) {
            throw new Error(BotMessages.TEST_NO_GUILD);
        }

        const testGuild: Guild = testBot.client.guilds.get(testGuildId) as Guild;

        if (!testGuild.channels.has(testGuildChannelId)) {
            throw new Error(BotMessages.TEST_CHANNEL_NO_EXIST);
        }

        const testChannel: TextChannel = testGuild.channels.get(testGuildChannelId) as TextChannel;

        if (testChannel.type !== "text") {
            throw new Error(BotMessages.TEST_CHANNEL_NOT_TEXT);
        }

        // Set channels
        TestBot.testGuild = testGuild;
        TestBot.testChannel = testChannel;
    });
}