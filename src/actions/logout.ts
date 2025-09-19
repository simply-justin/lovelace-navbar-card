import { GestureAction, IAction } from "@/actions";

export class Logout implements IAction {
    run(target: HTMLElement, gesture: GestureAction, card: any): void {
        throw new Error("Method not implemented.");
    }
}