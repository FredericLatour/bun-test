import { Effect, Context, Console, Layer, pipe, Runtime, FiberRefs, Scope } from "effect"


  const Foo = Context.Tag<number>();

  const Check = Effect.flatMap(Foo, Effect.log);
  
  Check.pipe(
    Effect.andThen(Check),
    Effect.andThen(Check),
    Effect.andThen(Check),
    Effect.annotateLogs("position", "before"),
    Effect.andThen(() =>
      Check.pipe(
        Effect.andThen(Check),
        Effect.andThen(Check),
        Effect.andThen(Check),
        Effect.andThen(Check),
        Effect.andThen(Check),
        Effect.andThen(Check),
        Effect.provideService(Foo, 5),
        Effect.annotateLogs("level", 1),
      )
    ),
    Effect.andThen(Check),
    Effect.andThen(Check),
    Effect.andThen(Check),
    Effect.andThen(Check),
    Effect.andThen(Check),
    Effect.andThen(Check),
    Effect.andThen(Check),
    Effect.provideService(Foo, 10),
    Effect.annotateLogs("level", 0),
    Effect.annotateLogs("position", "after"),
    Effect.runSync,
  );
  
  
  const provide10 = Effect.provideService(Foo,10)
  const provide5 = Effect.provideService(Foo,5)
  
  provide10( // <- see how everything is inside of it?
    Effect.andThen(Check, // 10
      Effect.andThen(Check, // 10
        Effect.andThen(Check, Check) // 10, 10
      )
    )
  )
  
  provide10( 
    Effect.andThen(Check, // 10
      Effect.andThen(Check, // 10
        provide5(Effect.andThen(Check, Check)) // 5,5
        // ^now this guy containes them^
      )
    )
  )
  
  provide10( 
    Effect.andThen(Check, // 10
      Effect.andThen(provide5(Check), // 5 
  //         Only this guy^ is inside provide5
        Effect.andThen(Check, Check) // 10,10
      )
    )
  )
  
  Check.pipe( // 10
    Effect.andThen(Check), // 10
    Effect.andThen(Check), // 10
    Effect.andThen(Check), // 10
    Effect.andThen(Check), // 10
    provide10
  )
  
  Check.pipe( // 5
    Effect.andThen(Check), // 5
    provide5,
    Effect.andThen(Check), // 10
    Effect.andThen(Check), // 10
    Effect.andThen(Check), // 10
    provide10
  )
  
  Check.pipe( // 10
    Effect.andThen(Check), // 10
    Effect.andThen(provide5(Check)), // 5
    Effect.andThen(Check), // 10
    Effect.andThen(Check), // 10
    provide10
  )
