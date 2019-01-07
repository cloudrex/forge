import {IArgument, default as Command, TrivialArgType} from "../../../commands/command";
import Context from "../../../commands/command-context";
import {IDecoratorCommand} from "../../../decorators/decorators";

interface Args {
    readonly command: string;
}

/**
 * @extends Command
 */
export default class UsageCommand extends Command<Args> {
    readonly meta = {
        name: "usage",
        description: "View the usage of a command"
    };

    readonly arguments: IArgument[] = [
        {
            name: "command",
            type: TrivialArgType.String,
            required: true,
            description: "The command to inspect"
        }
    ];

    public async run(x: Context, args: Args): Promise<void> {
        const targetCommand: Command | IDecoratorCommand | null = await x.bot.commandStore.get(args.command);

        if (!targetCommand) {
            x.fail("That command doesn't exist.");

            return;
        }
        else if ((targetCommand as any).type !== undefined) {

        }

        await x.fail("Not yet implemented");

        // TODO: New decorator commands broke it
        /* else if (targetCommand.arguments.length === 0) {
            context.fail("That command doesn't accept any arguments.");

            return;
        }

        let usageArgs: string[] = [targetCommand.meta.name];

        for (let i: number = 0; i < targetCommand.arguments.length; i++) {
            usageArgs.push(targetCommand.arguments[i].required ? targetCommand.arguments[i].name : `[${targetCommand.arguments[i].name}]`);
        }

        context.ok(usageArgs.join(" ")); */
    }
};
