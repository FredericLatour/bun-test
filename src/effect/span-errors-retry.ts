import { Effect, pipe, Data } from "effect"
import { log } from "effect/Console"

class ParseJsonError extends Data.TaggedError("ParseJsonError")<{
  msg: string
  data: Record<string, unknown>
}> {}

class EmptyJsonError extends Data.TaggedError("EmptyJsonError")<{ msg: string }> {}

class ForcedError extends Data.TaggedError("ForcedError")<{ msg: string }> {}

const getObjFromError = (err: Error) => {
  return {
    msg: err?.message,
    stack: err?.stack,
    name: err?.name,
    cause: err?.cause,
  }
}

const parseJson = (s: string) =>
  pipe(
    Effect.if(s === "", {
      onTrue: () => Effect.fail(new EmptyJsonError({ msg: "empty string" })),
      onFalse: () => Effect.succeed(s),
    }),
    Effect.tryMap({
      try: () => JSON.parse(s) as Record<string, string>,
      catch: (e) =>
        new ParseJsonError({
          msg: "problem parsing json",
          data: {
            s,
            srcErr: getObjFromError(e as Error),
          },
        }),
    }),
  )

type JsonResponseState = "success" | "unparsable" | "fail"

function fakeJsonFunction(state: JsonResponseState): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch (state) {
        case "success":
          resolve(JSON.stringify({ message: "This is parsable JSON" }))
          break
        case "unparsable":
          resolve("This is not parsable as JSON")
          break
        case "fail":
          reject(new Error("Simulated failure"))
          break
      }
    }, 1000) // Simulates async operation with 1 second delay
  })
}

const fakeJsonFunctionEffect = (state: JsonResponseState) =>
  Effect.tryPromise({
    try: () => fakeJsonFunction(state),
    catch: (e) => e,
  })

const addKey = (json: Record<string, string>) => (additionalKey: {key: string, value: string} ) => Effect.if(additionalKey.key === "error", {
  onTrue: () => Effect.logInfo("test").pipe( Effect.andThen( c =>Effect.fail(new ForcedError({msg: "AddKey Forced error"}))))
  ,
  onFalse: () => Effect.succeed({...json, [additionalKey.key]: additionalKey.value})
})


const logErrorAndContinue = <A, E, R, T>(prog: Effect.Effect<A, E, R>, result: T, info: Record<string, any> = {}) =>
  Effect.matchEffect(prog, {
    onSuccess: (res) => Effect.succeed(res),
    onFailure: (err) => Effect.succeed(result).pipe(Effect.tap( c => Effect.logError("logErrorAndContinue", JSON.stringify(info) + JSON.stringify(err)))),
  })

const prog = (state: JsonResponseState) =>
  Effect.gen(function* () {
    yield* Effect.logInfo("Starting program")
    const json = yield* fakeJsonFunctionEffect(state)
    const parsed = yield* parseJson(json)
    const result1 = yield* addKey(parsed)({key: "newKey", value: "newValue"})
    const result2 = yield* logErrorAndContinue(Effect.retry(addKey(result1)({key: "error", value: "World"}), {times: 3}), result1, {key: "result1"})
    const result3 = yield* logErrorAndContinue(addKey(result2)({key: "error", value: "US"}), result2)
     
    const result = yield* addKey(result3)({key: "currency", value: "USD"})
    
    // const test = JSON.parse("{")
    yield*  Effect.logInfo("Ending program")
    return result
  })



// when ForcedError is thrown, I would like to get the following additional information:
//  { json, parsed, result}


try {
  const result = await Effect.runPromise(Effect.match(prog("success"), {
    onSuccess: (res) => res,
    onFailure: (err) => err,
  }))
  console.log("result:", result)
}
catch (e) {
  console.log("myerror:", e)
}


