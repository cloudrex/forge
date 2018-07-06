import JsonAuthStore from "../../commands/auth-stores/json-auth-store";
import Bot from "../../core/bot";
import Settings from "../../core/settings";
import Log, {LogLevel} from "../../core/log";
import ConsumerAPI, {ConsumerAPIv2} from "./consumer-api";
import JsonProvider from "../../data-providers/json-provider";
import {TextChannel} from "discord.js";

const path = require("path");
const baseDir = "./src/test/consumer";

Log.level = LogLevel.Debug;

const settings = new Settings({
    general: {
        token: process.env.AC_TOKEN ? process.env.AC_TOKEN : "",
        prefixes: process.env.AC_PREFIX ? process.env.AC_PREFIX.split(",") : ["!"]
    },

    paths: {
        commands: path.resolve(path.join(__dirname, "./commands")),
        behaviours: path.resolve(path.join(__dirname, "./behaviours"))
    }
});

async function start() {
    const userMentionRegex = /(^[0-9]{17,18}$|^<@!?[0-9]{17,18}>$)/;

    const bot = new Bot({
        argumentTypes: {
            user: userMentionRegex,
            role: /(^[0-9]{18}$|^<&[0-9]{18}>$)/,
            channel: /(^[0-9]{18}$|^<#[0-9]{18}>$)/,
            member: userMentionRegex
        },

        settings: settings,

        authStore: new JsonAuthStore(path.resolve(path.join(baseDir, "auth/schema.json")), path.resolve(path.join(baseDir, "auth/store.json"))),

        dataStore: new JsonProvider(path.resolve(path.join(__dirname, "data.json"))),

        autoDeleteCommands: false
    });

    if (bot.dataStore) {
        const store: JsonProvider = <JsonProvider>bot.dataStore;

        await store.reload();

        const api: ConsumerAPIv2 = new ConsumerAPIv2({
            guild: "286352649610199052",
            bot: bot,

            channels: {
                suggestions: "458337067299242004",
                modLog: "458794765308395521"
            }
        });

        await (await bot.setup(api)).connect();


        //////////////
        ConsumerAPI.store = store;

        const storedCounter = store.get("case_counter");

        ConsumerAPI.caseCounter = storedCounter ? storedCounter : 0;

        const gamingCorner = bot.client.guilds.get("286352649610199052");

        if (gamingCorner) {
            const modLogChannel: TextChannel = <TextChannel>gamingCorner.channels.get("458794765308395521");

            if (modLogChannel) {
                ConsumerAPI.modLogChannel = modLogChannel;
            }
            else {
                Log.error("[Consumer.start] The ModLog channel was not found");
            }
        }
        else {
            Log.error("[Consumer.start] The Gaming Corner guild was not found");
        }

        /* await ConsumerAPI.reportCase({
            color: "RED",
            reason: "test",
            moderator: bot.client.guilds.get("286352649610199052").member("439373663905513473"),
            member: bot.client.guilds.get("286352649610199052").member("285578743324606482"),
            title: "Ban"
        }); */
    }
}

start();
