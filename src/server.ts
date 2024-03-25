import { buildApp } from "./app";
import { AppOptions } from "./lib/types/global";
import 'dotenv/config'

const start = async (): Promise<void> => {
    const options: AppOptions = {
        logger: true,
    };

    const app = await buildApp(options);

    try {
        await app.listen({
            port: Number(process.env.PORT),
            host: 'localhost',
        });

    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();