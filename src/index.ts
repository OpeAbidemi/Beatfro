import "dotenv/config";
import "reflect-metadata";
import express from 'express'
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/UserResolver";
import { BlogResolver } from "./resolvers/BlogResolver";
import cors from 'cors'
import tokenRouter from "./routes/tokenRoute";
import cookieParser from "cookie-parser";
import { createServer } from "http";

(async () => {
    const app = express();

    app.use(cookieParser())

    app.use(
        cors({
          origin: "http://localhost:3000",
          credentials: true
        })
    );
    
    app.use("/",tokenRouter);

    const resolvers : readonly[Function, ...Function[]] | [Function, ...Function[]] | readonly[string, ...string[]] | [string, ...string[]] =[
        BlogResolver,
        UserResolver
    ]

    app.get("/", (_, res) => {
        res.send("Hello World")
    });

    await createConnection();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers
        }),
        context : ({req, res}) => ({ req, res })
    });

    apolloServer.applyMiddleware({ app, cors: false });
    
    const httpServer = createServer(app);

    await apolloServer.installSubscriptionHandlers(httpServer);
    
    const PORT = process.env.port || 4000

    httpServer.listen(PORT, () => {
        console.log(`Server Started at port http://localhost:${PORT}`);
    })
})();