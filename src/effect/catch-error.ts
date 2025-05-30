import { Effect, pipe, Record as RR, Either } from "effect"

export class ParseJsonError {
  readonly _tag = "ParseJsonError"
  constructor(readonly msg: string, readonly data: Record<string, unknown>) {}
}

class EmptyJsonError {
  readonly _tag = "EmptyJsonError"
  constructor(readonly name: string) {}
}

export const getObjFromError = (err: Error) => {
  return {
    msg: err?.message,
    stack: err?.stack,
    name: err?.name,
    cause: err?.cause,
  }
}

const parseJson2 = (s: string) =>
  pipe(
    Effect.if(s === "", {
      onTrue: () => Effect.fail(new EmptyJsonError("empty string")),
      onFalse: () =>Effect.succeed(s),
    }),
    Effect.tryMap({
      try: () => JSON.parse(s) as Record<string, string>,
      catch: (e) =>
        new ParseJsonError("problem parsing json", {
          s,
          srcErr: getObjFromError(e as Error),
        }),
    }),
  )

const parseJson = (s: string) =>
  Effect.try({
    try: () => JSON.parse(s) as Record<string, string>,
    catch: (e) =>
      new ParseJsonError("problem parsing json", {
        s,
        srcErr: getObjFromError(e as Error),
      }),
  })

/**
 * Parses a string into a JSON object and retrieves the "ip" property.
 * If parsing fails, a DbError is thrown with details about the error.
 * If the "ip" property is missing, a DbError is thrown.
 *
 * @param s - The string to parse.
 * @returns The value of the "ip" property.
 *
 * @remarks
 * This function is a good example of how to use Effect.catchTags in order to transform errors.
 */
const getIp = (s: string) =>
  pipe(
    parseJson(s),
    Effect.flatMap(RR.get("ip")),
    Effect.catchTags({
      ParseJsonError: (e) => Effect.fail(e),
      NoSuchElementException: (e) =>
        Effect.fail(new ParseJsonError("ip property missing", getObjFromError(e))),
    }),
  )

/**
 * Retrieves the IP address from a JSON string.
 * If the JSON parsing fails, it returns a default IP address.
 *
 * @param s - The JSON string to parse.
 * @returns A string representing the IP address.
 *
 * @remarks:
 * This function is a good example of how to use Effect.catchTag in order to recover from a specific error
 */
const getIp2 = (s: string) =>
  pipe(
    parseJson(s),
    Effect.flatMap(RR.get("ip")),
    Effect.catchTag("ParseJsonError", (err) => Effect.succeed("178.1.1.1")),
    Effect.map((s) => `IP is ${s}`),
  )

/**
 * Retrieves the IP address from a JSON string.
 * If the JSON parsing fails with an "EmptyJsonError", a default IP address is returned.
 *
 * @param s - The JSON string to parse.
 * @returns The IP address extracted from the JSON, or a default IP address if parsing fails.
 *
 * @remarks:
 * This function use Effect.gen as the main approach
 */
const getIp3 = (s: string) =>
  Effect.gen(function* ($) {
    const json = yield* $(
      parseJson2(s).pipe(
        Effect.catchTag("EmptyJsonError", (err) =>
          Effect.succeed({ ip: "176.1.1.1", name: "whatever" }),
        ),
      ),
    )
    const ip = yield* $(RR.get("ip")(json))
    return ip
  })

const getIp4 = (s: string, emptyJson: "error" | "noError") =>
  Effect.gen(function* ($) {
    const json =
      emptyJson === "noError"
        ? yield* $(
            parseJson2(s).pipe(
              Effect.catchTag("EmptyJsonError", (err) =>
                Effect.succeed({ ip: "176.1.1.1", name: "whatever" }),
              ),
            ),
          )
        : yield* $(parseJson2(s))
    const ip = yield* $(RR.get("ip")(json))
    return ip
  })

const getIp5 = (s: string, emptyJson: "error" | "noError") =>
  pipe(
    parseJson(s),
    Effect.flatMap(RR.get("ip")),
    Effect.catchTag("ParseJsonError", (err) => Effect.succeed("178.1.1.1")),
    Effect.map((s) => `IP is ${s}`),
  )

  const getIp6 = (s: string) =>
    Effect.gen(function* () {
      const t = "test"
      const json = yield* parseJson2(s)
      const ip = yield* RR.get("ip")(json)

      return Either.match
    })
  

const jsonStrings = {
  wrong: `{"ip": "192.168.0.1", "name" "whatever"}`,
  missingIp: `{"p": "192.168.0.1", "name": "whatever"}`,
  right: `{"ip": "192.168.0.1", "name": "whatever"}`,
  empty: "",
}


for (const [k, v] of Object.entries(jsonStrings)) {
  const res = Effect.runSyncExit(getIp4(v, 'noError'))
  console.log(k, res)
}
