import { Effect as E, Array as A, Record as R, pipe } from "effect"
import z from "zod"
import * as Zod from "./Zod"
import { Logger } from "tslog"

const log = new Logger()

const parsePath = <Key extends string, Fields extends Array<Key>>(
  fields: Fields,
  path: string = "",
): E.Effect<{
  [K in Fields[number]]?: string
}> =>
  E.gen(function* () {
    const parts = path.length > 0 ? path.split("/") : []
    return pipe(A.zip(fields, parts), R.fromEntries)
  }) as any

const tests = [
  { fields: ["a", "b", "c"], path: "a/b/c", expected: { a: "a", b: "b", c: "c" } },
  { fields: ["a", "b", "c"], path: "a/b", expected: { a: "a", b: "b" } },
  { fields: ["a", "b", "c"], path: "a/b/c/d", expected: { a: "a", b: "b", c: "c" } },
  { fields: ["a", "b", "c"], path: "", expected: {} },
  { fields: ["a", "b", "c"], path: "a", expected: { a: "a" } },
  { fields: ["a", "b", "c"], path: undefined, expected: {} },
]

// for (const t of tests) {
//   const res = E.runSync(parsePath(t.fields, t.path))
//   console.log(res)
//   console.log(t.expected)
//   console.log("-----")
// }

const schema = z.object({
  a: z.string(),
  b: z.string(),
  c: z.string(),
})

const prog = () => pipe(parsePath(["a", "b"], "a/b"), Zod.parse(schema))

log.info(
  E.runSync(
    E.match(prog(), {
      onSuccess: (v) => ({ _tag: "success", value: v }),
      onFailure: (e) => ({ _tag: "failure", value: e.toJSON() }),
    }),
  ),
)
