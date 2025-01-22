import cookie from "cookie"
import cookieParser from "cookie-parser"
import {notifyUserStatusChange} from "@/subscriptions/user"
import {TOKEN_NAME} from "@/model/user"
import {Errors} from "@/constants/errors"
import {verifyJWT} from "@/shared/jwt"
import {sendError, sendSuccess} from "@/shared/messages/responses"

import type {Request, Response} from "express"

export async function logout(req: Request<{}, {}, {}>, res: Response) {
  const parsedCookies = cookie.parse(req.headers.cookie || "")
  const cookies = cookieParser.signedCookies(parsedCookies, process.env.COOKIE_SECRET || "")

  if (!cookies[TOKEN_NAME]) {
    return sendError(res, Errors.Unauthorized, 401)
  }
  try {
    const result = verifyJWT(cookies[TOKEN_NAME])

    if (!result) {
      return sendError(res, Errors.Unauthorized, 401)
    }
    console.log("result", result)

    res.clearCookie(TOKEN_NAME)
    notifyUserStatusChange("guest")
    sendSuccess(res, {success: true})
  } catch (error) {
    sendError(res, error.message ?? Errors.InternalServerError, error.message ? 400 : 500)
  }
}
