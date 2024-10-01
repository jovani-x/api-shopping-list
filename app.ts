import express from "express";
import https from "https";
import http from "http";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import tsConfigPaths from "tsconfig-paths";
import tsConfig from "./tsconfig.json";
import cors from "cors";
import routes from "@/routes/routes.js";
import cardRoutes from "@/routes/cardRoutes.js";
import authRoutes from "@/routes/authRoutes.js";
import friendRoutes from "@/routes/friendRoutes.js";
import updatesRoutes from "@/routes/updatesRoutes.js";
import { connectToDb } from "@/lib/utils.js";
import cookieParser from "cookie-parser";
import { ensureAuthenticated } from "@/services/authServices.js";
import i18next from "i18next";
import { LanguageDetector, handle } from "i18next-http-middleware";
import Backend, { FsBackendOptions } from "i18next-fs-backend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

tsConfigPaths.register({
  baseUrl: "./",
  paths: tsConfig.compilerOptions.paths,
});

const app = express();
const PORT = process.env.PORT || 3001;
const ENV_MODE = process.env.ENV || "development";
export const isDevMode = ENV_MODE === "development";
const isTestMode = ENV_MODE === "test";
const APP_ORIGIN = process.env.APP_ORIGIN;

const options = isTestMode
  ? {}
  : {
      key: fs.readFileSync(
        path.resolve(__dirname, "./certs/server.key"),
        "utf8"
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, "./certs/server.crt"),
        "utf8"
      ),
    };

await connectToDb();

const i18nConfig = {
  locales: ["en", "pl"],
  defaultLocale: "en",
  defaultNamespace: "common",
};
const namespace = i18nConfig.defaultNamespace;
const lng = i18nConfig.defaultLocale;
let locale = lng;

i18next
  .use(Backend)
  .use(LanguageDetector)
  .init<FsBackendOptions>({
    backend: {
      loadPath: "src/locales/{{lng}}.json",
      // loadPath:
      // !namespace || namespace === i18nConfig.defaultNamespace
      //     ? "src/locales/{{lng}}.json"
      //     : "src/locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      caches: false, // ['cookie']
      cookieSameSite: "Lax",
      order: ["cookie"],
      lookupCookie: "NEXT_LOCALE",
      convertDetectedLanguage: (l: string) => {
        locale = l;
        i18next.changeLanguage(l);
        return l;
      },
    },
    load: "languageOnly",
    lng: locale,
    // resources,
    fallbackLng: i18nConfig.defaultLocale,
    supportedLngs: i18nConfig.locales,
    defaultNS: namespace,
    fallbackNS: namespace,
    ns: [namespace],
    preload: i18nConfig.locales,
    saveMissing: true,
  });

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [APP_ORIGIN];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,DELETE,PUT,PATCH,HEAD,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
    preflightContinue: true,
  })
);
app.options("*", cors(), function (_req, res, _next) {
  res.status(200).end();
});
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(handle(i18next));

app.use("/", routes);
app.use("/api/auth", authRoutes);
app.use("/api/cards", ensureAuthenticated, cardRoutes);
app.use("/api/users", ensureAuthenticated, friendRoutes);
app.use("/api/updates-stream", ensureAuthenticated, updatesRoutes);

if (!isTestMode) {
  https.createServer(options, app).listen(PORT, () => {
    console.log(`app listening on a port ${PORT}`);
  });

  // Create HTTP server for redirection to HTTPS
  http
    .createServer((req, res) => {
      res.writeHead(301, { location: `https://${req.headers.host}${req.url}` });
      res.end();
    })
    .listen(80, () => {
      console.log("HTTP Server is running on port 80 and redirecting to HTTPS");
    });
}

export default app;
