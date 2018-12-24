import Service from "../../../services/service";
import {IFragmentMeta} from "../../..";

export default class WatchdogService extends Service {
    readonly meta: IFragmentMeta = {
        name: "watchdog",
        description: "Bot status supervision service"
    };

    public start(): void {
        //Log.debug("Watchdog service started! Hello from watchdog!");
        // TODO:
    }
}