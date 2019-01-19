import DiscordEvent from "../core/discord-event";
import {DecoratorUtils} from "./decorator-utils";

export enum EventListenerType {
    Once,
    On
}

export interface IEventListener {
    readonly type: EventListenerType;
    readonly event: DiscordEvent;

    invoker(...args: any): void;
}

export const EventListeners: IEventListener[] = [];

export function Once(event: DiscordEvent): any {
    return function (target: any, prop: string) {
        DecoratorUtils.ensureFunc(target[prop]);

        EventListeners.push({
            invoker: target[prop],
            type: EventListenerType.Once,
            event
        });
    };
}

export function On(event: DiscordEvent): any {
    return function (target: any, prop: string) {
        DecoratorUtils.ensureFunc(target[prop]);

        EventListeners.push({
            invoker: target[prop],
            type: EventListenerType.Once,
            event
        });
    };
}
