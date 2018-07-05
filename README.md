<p align="center">
  <img alt="Anvil Logo" src="https://raw.githubusercontent.com/CloudRex/Anvil/master/logo2.png">
  <br />
  <img alt="Build Status" src="https://travis-ci.org/CloudRex/Anvil.svg?branch=master">
  <img alt="NPM Version" src="https://badge.fury.io/js/discord-anvil.svg">
  <img alt="Documentation" src="https://cloudrex.github.io/Anvil/badge.svg">
</p>

<br/>

Anvil is a powerful, fully-modular and self-contained bot development framework.

**Note**: Anvil is a Discord client wrapper and not a Discord API library.

=> [Click here to view the NPM package](https://www.npmjs.com/package/discord-anvil)

=> [Click here to view the library reference](https://cloudrex.github.io/Anvil/)

=> [Click here to view the documentation](https://cloudrex.gitbook.io/anvil/)

*Powering the [Tux](https://github.com/CloudRex/Tux) and [War](https://github.com/CloudRex/War) bots | Powered by [Discord.js](https://discord.js.org/)*

#### Quick Start

First, make sure to install Anvil: `npm install discord-anvil --save`

index.js:
```js
const { Bot, ObjectProvider, JsonAuthStore } = require("discord-anvil");
const path = require("path");

// Create the bot
const bot = new Bot({
    paths: {
    	// The file containing our bot token and prefix
    	settings: "settings.json",
    	
    	authLevels: "auth-levels.json",
    	
    	// The directory containing our command files
    	commands: path.join(__dirname, "commands")
    },
    
    /**
     * The auth store file will store our per-guild
     * auth data, it will be automatically created if
     * it doesn't exist.
     */
    authStore: new JsonAuthStore("auth-schema.json", "auth-store.json")
});

// Connect the client
bot.connect();
```

settings.json: ([Click here](https://discordapp.com/developers/applications/me) to find your bot's token)
```json
{
    "general": {
        "token": "<Your bot's token here>",
        "prefix": "!"
    }
}
```

auth-schema.json:
```json
{
    "default": {
        "rank": 0
    },
    
	"developer": {
	    "rank": 1,
	    "global": true
	}
}
```

commands/hello.js:
```js
const { AccessLevelType, CommandCategoryType } = require("discord-anvil");

// Export the command to be automatically loaded
module.exports = {
	// When the command is executed
	executed(context) {
		context.ok("Hello world!");
	},
	
	// Information about the command
	meta: {
		name: "hello", // The name of the command
		desc: "Hello world", // The description of the command
		authLevel: AccessLevelType.Member, // Who can issue this command
		category: CommandCategoryType.Utility, // The category of the command
	}
};
```

#### Building
To build the project, use `npm run build` or `yarn build` if using [yarn](https://yarnpkg.com/).

To build the docs, use `npm run docs` or `yarn docs`.

Make sure that you have previously installed the project dependencies (`npm install` or `yarn`).


#### Versioning
When contributing, please follow the [Semantic Versioning](https://semver.org/) guidelines.
