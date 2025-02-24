export type WebSocketMessageType =
  | "cinema.get_cinemas"
  | "hall.subscribe"
  | "seats.purchase"
  | "user.subscribe"
  | "user.auth_start"
  | "user.auth_reset"
  | "user.login"
  | "user.register"
  | "user.save_recovery_phrase"
  | "user.logout"

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType
  data: T
  eid?: string
}

export interface WebSocketResponse<T = unknown> {
  data: T
  error?: string
}

export interface WebSocketSubscription<TResponse = unknown, TMessage = unknown> {
  msg: WebSocketMessage<TMessage>
  isOnce?: boolean
  onResult?: (response: TResponse) => void
  onSnapshot?: (response: TResponse) => void
  onUpdate?: (response: TResponse) => void
}
