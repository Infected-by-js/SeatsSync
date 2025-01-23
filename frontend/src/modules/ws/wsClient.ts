import {randomUUID} from "@/utils/random"
import {BehaviorSubject, catchError, distinctUntilChanged, EMPTY, filter, interval, map, Subject, takeUntil, tap} from "rxjs"
import {webSocket} from "rxjs/webSocket"

import type {Observable} from "rxjs"
import type {WebSocketSubject} from "rxjs/webSocket"
import type {
  ConnectionState,
  MessageType,
  RequestMessage,
  ResponseMessage,
  ResponseMessageError,
  ResponseMessageSuccess,
  ResponseStatus,
  WebSocketMessage,
} from "./types"

type State = {
  connectionState: ConnectionState
  connectAttempts: number
}

export class WebSocketClient {
  private socket$: WebSocketSubject<WebSocketMessage<any>> | null = null
  private readonly maxReconnectAttempts = 5
  private readonly pingInterval = 2000
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  private readonly disconnect$ = new Subject<void>()
  private readonly state$ = new BehaviorSubject<State>({connectionState: "disconnected", connectAttempts: 0})
  private prevState: State | null = null

  constructor(private readonly url: string) {
    this.startPing()
    this.connect()
  }

  private startPing() {
    interval(this.pingInterval)
      .pipe(
        takeUntil(this.disconnect$),
        filter(() => this.state$.getValue().connectionState === "connected" && this.socket$ !== null),
        tap(() => this.socket$ && this.socket$.next(1)),
        catchError(() => EMPTY),
      )
      .subscribe()
  }

  private connect() {
    if (this.socket$) {
      this.socket$.complete()
      this.socket$ = null
    }

    this.updateState({connectionState: "connecting"})

    this.socket$ = webSocket<WebSocketMessage<any>>({
      url: this.url,
      openObserver: {
        next: () => {
          this.updateState({connectionState: "connected", connectAttempts: 0})
        },
      },
    })

    this.socket$.subscribe({error: () => this.reconnect()})
  }

  private updateState(patch: Partial<State>) {
    const currentState = this.state$.getValue()
    const newState = {...currentState, ...patch}

    this.prevState = currentState
    this.state$.next(newState)
  }

  private reconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    const {connectAttempts} = this.state$.getValue()

    const attempts = connectAttempts + 1

    if (attempts >= this.maxReconnectAttempts) {
      console.log("Max reconnect attempts reached")
      this.updateState({connectionState: "disconnected"})
      return
    }

    const minTimeout = 2_000
    const maxTimeout = 20_000
    const backoffFactor = 1.2
    const delay = Math.trunc(Math.min(minTimeout * backoffFactor ** attempts, maxTimeout))

    this.updateState({connectAttempts: attempts})

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  send<T = any>(message: RequestMessage<T>) {
    if (!this.socket$ || this.state$.getValue().connectionState !== "connected") return

    message.eid = message.eid ?? randomUUID()
    this.socket$.next(message as WebSocketMessage<T>)
  }

  on(type: MessageType, status: "error"): Observable<ResponseMessageError>
  on<T = any>(type: MessageType, status: Exclude<ResponseStatus, "error">): Observable<ResponseMessageSuccess<T>>
  on<T = any>(type: MessageType): Observable<ResponseMessage<T>>
  on<T = any>(type?: MessageType, status?: ResponseStatus): Observable<ResponseMessage<T>> {
    if (!this.socket$) return EMPTY

    return this.socket$.pipe(
      takeUntil(this.disconnect$),
      filter((message): message is ResponseMessage<T> => typeof message === "object" && "status" in message),
      filter((message) => (type && type !== "*" ? message.type === type : true)),
      filter((message) => (status ? message.status === status : true)),
      catchError((err) => {
        console.log("WebSocket message error:", err)
        return EMPTY
      }),
    )
  }

  get connectionState(): Observable<{state: ConnectionState; prevState: ConnectionState | null}> {
    return this.state$.pipe(
      map((state) => state.connectionState),
      distinctUntilChanged(),
      map((state) => ({state, prevState: this.prevState?.connectionState ?? null})),
    )
  }

  reconnectForce() {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.socket$) {
      this.socket$.complete()
      this.socket$ = null
    }

    this.updateState({connectionState: "disconnected", connectAttempts: 0})

    this.connect()
  }

  destroy() {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.disconnect$.next()
    this.disconnect$.complete()
    this.socket$?.complete()
    this.socket$ = null
    this.updateState({connectionState: "disconnected", connectAttempts: 0})
  }
}
