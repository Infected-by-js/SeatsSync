import type {MessageRequest} from "@/core/ws/messages"
import type {WebSocket} from "ws"

export type IWebSocketClient = WebSocket & {
  id: string
  isAlive: boolean
  context?: {
    id: string
    token: string | null
    username: () => string | null
    isAuthenticated: () => boolean
  }
}

export type OnMessageHandler = (ws: IWebSocketClient, message: MessageRequest<any, any>) => boolean
export type WebSocketOnMessage = (ws: IWebSocketClient, message: MessageRequest<any, any>) => void

export type WebSocketClientOptions = {
  pingMsg?: string | number
  pingInterval?: number
  autoCloseTimeout?: number
  enablePingPong?: boolean
} & WebSocketCallbacks

export type WebSocketCallbacks = {
  onConnect?: (ws: IWebSocketClient) => void
  onDisconnect?: (ws: IWebSocketClient) => void
  onDestroy?: () => void
  onMessage?: WebSocketOnMessage
  onSend?: (ws: WebSocket, message: string) => void
}
