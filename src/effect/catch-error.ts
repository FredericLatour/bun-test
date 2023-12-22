import { Effect, pipe, ReadonlyRecord as RR } from "effect"

export class DbError {
  readonly _tag = "DbError"
  constructor(readonly msg: string, readonly data: Record<string, unknown>) {}
}

export const getObjFromError = (err: Error) => {
  return {
    msg: err?.message,
    stack: err?.stack,
    name: err?.name,
    cause: err?.cause,
  }
}

const getIp = (s: string) =>
  pipe(
    Effect.try({
      try: () => JSON.parse(s) as Record<string, string>,
      catch: (e) =>
        new DbError("problem parsing json", {
          s,
          srcErr: getObjFromError(e as Error),
        }),
    }),
    Effect.flatMap(RR.get("ip")),
    Effect.catchTags({
      DbError: (e) => Effect.fail(e),
      NoSuchElementException: (e) =>
        Effect.fail(new DbError("ip property missing", getObjFromError(e))),
    }),
  )

const jsonStrings = {
  wrong: `{"ip": "192.168.0.1", "name" "whatever"}`,
  missingIp: `{"p": "192.168.0.1", "name": "whatever"}`,
  right: `{"ip": "192.168.0.1", "name": "whatever"}`,
}

// for (const [k, v] of Object.entries(jsonStrings)) {
//     const res = Effect.runSyncExit(getIp(v));
//     console.log(res);
// }

for ( const [k, v] of Object.entries(jsonStrings)) {
    const res =  Effect.runSyncExit(getIp(v))
    console.log(k, res)
}