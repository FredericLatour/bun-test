import { Data, Effect as E } from "effect"
import { z } from "zod"

export class ZodError extends Data.TaggedError("ZodError")<{
  msg: string
  data: Record<string, unknown>
}> {}

export const parse =
  <T extends z.ZodTypeAny>(schema: T) =>
  (data: unknown): E.Effect<z.infer<T>, ZodError> =>
    E.gen(function*() {
      return yield* E.try({
        try: () => schema.parse(data),
        catch: (e) => new ZodError({ msg: "Error parsing schema", data: { e } }),
      });
    })
