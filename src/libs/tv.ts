import { createTV } from "tailwind-variants";

export const tv = createTV({})

export type ExtractSlots<T extends (...args: any) => any> = keyof ReturnType<T>
export type ExtractUi<T extends (...args: any) => any> = Partial<
  Record<ExtractSlots<T>, string>
>
