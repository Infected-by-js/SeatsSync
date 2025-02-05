import type {IWebSocketClient} from "@/core/ws"
import type {Response} from "express"

function isFunction<T>(value: T | (() => T | Promise<T>)): value is () => T | Promise<T> {
  return typeof value === "function"
}

export async function early<T>(condition: T | (() => T | Promise<T>), conditionMatchedCb: () => unknown | Promise<unknown>): Promise<boolean> {
  const result = isFunction(condition) ? await condition() : condition

  if (Boolean(result)) {
    await conditionMatchedCb()
    return true
  }

  return false
}

export async function earlyResponse<T>(res: Response, condition: T | (() => T | Promise<T>), status: number, data: any): Promise<boolean> {
  return early(condition, () => res.status(status).json(data))
}

export function earlySocket<T>(ws: IWebSocketClient, condition: T | (() => T | Promise<T>), message: any): Promise<boolean> {
  return early(condition, () => ws.send(message))
}
