// import session from "express-session";
// import RedisStore from "connect-redis";
// import redis from "redis";

// const RedisClient = redis.createClient();

// const sessionMiddleware = session({
//   store: new RedisStore({ client: RedisClient }),
//   secret: "your_session_secret",
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production", // Use secure cookies in production
//     maxAge: 24 * 60 * 60 * 1000, // 1 day
//   },
// });

// export default sessionMiddleware;
