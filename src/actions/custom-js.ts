import { GestureAction, IAction } from "@/actions";

export class CustomJS implements IAction {
    run(target: HTMLElement, gesture: GestureAction, card: any): void {
        throw new Error("Method not implemented.");
    }
}