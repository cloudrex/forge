import {Unit, Test, Assert, Is} from "unit";
import Command, {CommandRunner, RestrictGroup} from "../../../commands/command";
import {Message} from "discord.js";
import Permission from "../../../core/permission";
import {dependsOn, guard, connect, attachedLoggerFn, attachedLogger} from "../../../decorators/other";
import {args, description, name, meta} from "../../../decorators/general";
import {Constraint} from "../../../decorators/constraints";
import {Type} from "../../../commands/type";
import {deprecated} from "../../../decorators/utility";
import DiscordEvent from "../../../core/discord-event";
import {On} from "../../../decorators/events";
import {IMeta} from "../../../fragments/fragment";
import {testBot} from "../test-bot";

const testConnection: CommandRunner = (x, args): void => {
    //
};

@name("mycmd")
@description("Used for testing")
@attachedLogger()
@args(
    {
        name: "name",
        type: Type.string
    }
)
@connect(testConnection)
@guard("testGuard")
@dependsOn("service-name-1", "service-name-2")
@Constraint.cooldown(5)
@Constraint.ownerOnly
@Constraint.issuerPermissions(Permission.AddReactions)
@Constraint.selfPermissions(Permission.Admin, Permission.BanMembers)
@Constraint.specific([RestrictGroup.ServerModerator])
export class MyCommand extends Command {
    @deprecated()
    public testGuard(): boolean {
        //

        return false;
    }

    @On(DiscordEvent.Message)
    public onMessage(msg: Message): void {
        //
    }

    public run(): void {
        // ...
    }
}

@meta({
    name: "meta-test",
    description: "Testing meta",
    author: "John Doe",
    version: "1.0.0"
})
class MetaTest {
    public readonly meta!: IMeta;
}

const instance: MyCommand = new (MyCommand as any)(null as any);
const metaInstance: MetaTest = new MetaTest();

@Unit("Decorators")
default class {
    @Test("instance should be an object")
    public instanceBeObj() {
        Assert.that(instance,
            Is.object,
            Is.instanceOf(MyCommand)
        );
    }

    @Test("should register commands with helper decorators")
    public registerCommandsWithDecorators() {
        Assert.equal(testBot.registry.contains("test-decorator-command"), true);
    }

    @Test("should have a meta property")
    public haveMeta() {
        Assert.that(instance.meta, Is.object);
        Assert.equal(Object.keys(instance.meta).length, 2);
    }

    @Test("should have a constraints property")
    public haveConstraints() {
        Assert.that(instance.constraints, Is.object);
        Assert.that(instance.constraints.specific, Is.array);
    }

    @Test("should have a connections property")
    public haveConnections() {
        Assert.that(instance.connections, Is.arrayWithLength(2));
    }

    @Test("@name: should bind command name")
    public name_bind() {
        Assert.equal(instance.meta.name, "mycmd");
    }

    @Test("@description: should bind command description")
    public description_bind() {
        Assert.equal(instance.meta.description, "Used for testing");
    }

    @Test("@args: should bind command arguments")
    public args_bind() {
        Assert.that(instance.args, Is.arrayWithLength(1));
    }

    @Test("@meta: should bind fragment meta")
    public meta_bind() {
        Assert.that(metaInstance.meta, Is.object);
        Assert.equal(Object.keys(metaInstance.meta).length, 4);
        Assert.equal(metaInstance.meta.name, "meta-test");
        Assert.equal(metaInstance.meta.description, "Testing meta");
        Assert.equal(metaInstance.meta.version, "1.0.0");
        Assert.equal(metaInstance.meta.author, "John Doe");
    }

    @Test("@ownerOnly: should bind the specific bot owner only constraint")
    public ownerOnly_bind() {
        Assert.equal(instance.constraints.specific.includes(RestrictGroup.BotOwner), true);
    }

    @Test("@specific: should bind specific constraint")
    public specific_bind() {
        Assert.equal(instance.constraints.specific.includes(RestrictGroup.ServerModerator), true);
    }

    @Test("@guard: should bind command guards")
    public guard_bind() {
        Assert.that(instance.guards, Is.arrayWithLength(1));
        Assert.equal(instance.guards[0], instance.testGuard);
    }

    @Test("@issuerPermissions: should bind required issuer permissions")
    public issuerPermissions_bind() {
        Assert.that(instance.constraints.issuerPermissions, Is.arrayWithLength(1));
        Assert.equal(instance.constraints.issuerPermissions[0], Permission.AddReactions);
    }

    @Test("@selfPermissions: should bind required self permissions")
    public selfPermissions_bind() {
        Assert.that(instance.constraints.selfPermissions, Is.arrayWithLength(2));
        Assert.equal(instance.constraints.selfPermissions[0], Permission.Admin);
        Assert.equal(instance.constraints.selfPermissions[1], Permission.BanMembers);
    }

    @Test("@dependsOn: should append command dependencies")
    public dependsOn_bind() {
        Assert.that(instance.dependsOn, Is.arrayWithLength(2));
        Assert.equal(instance.dependsOn[0], "service-name-1");
        Assert.equal(instance.dependsOn[1], "service-name-2");
    }

    @Test("@connect: should append command connections")
    public connect_bind() {
        Assert.equal(instance.connections[0], testConnection);
    }

    @Test("@attachedLogger: should append the attached logger connection")
    public attachedLogger_bind() {
        Assert.equal(instance.connections[1], attachedLoggerFn);
    }

    @Test("@deprecated: should replace input with a proxy method")
    public deprecated_replace() {
        // TODO.
    }
}