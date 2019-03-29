import EmbedBuilder from "../../Builders/EmbedBuilder";
import MsgBuilder from "../../Builders/MsgBuilder";
import Command from "../../commands/command";
import Context from "../../commands/context";
import Util from "../../util/util";
import {name, desc, args} from "../../decorators/general";
import {Constraint} from "../../decorators/Constraint";
import {Type} from "../../commands/type";

interface IArgs {
    readonly code: string;
    readonly silent: boolean;
}

@name("eval")
@desc("Evaluate code")
@args(
    {
        name: "code",
        description: "The code to evaluate",
        type: Type.string,
        required: true
    },
    {
        name: "silent",
        description: "Send result or not",
        type: Type.boolean,
        required: false
    }
)
@Constraint.ownerOnly
export default class extends Command<IArgs> {
    public async run($: Context, args: IArgs): Promise<void> {
        const started: number = Date.now();

        let result: string;

        try {
            // tslint:disable-next-line:no-eval
            result = await eval(args.code);
        } catch (err) {
            // TODO: Should prefix with 'Error: '?
            result = err.message;
        }

        if (args.silent) {
            return;
        }

        const embed: EmbedBuilder = new EmbedBuilder();

        embed.footer(`Evaluated in ${(Date.now() - started)}ms`);

        embed.field(`Input`, new MsgBuilder()
            .block("js")
            .append(args.code)
            .block()
            .build());

        embed.field(`Output`,
            new MsgBuilder()
                .block("js")
                .append(Util.escapeText(result.toString().trim() === "" || !result ? "No return value." : result.toString(), $.bot.client.token))
                .block()
                .build()
        );

        embed.color("#36393f");

        $.send(embed.build());
    }
}
