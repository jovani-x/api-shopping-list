import express from "express";
import routes from "@/routes/routes.js";
import cardRoutes from "@/routes/cardRoutes.js";
import authRoutes from "@/routes/authRoutes.js";
import friendRoutes from "@/routes/friendRoutes.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { ensureAuthenticated } from "@/services/authServices.js";
import i18next from "i18next";
import { LanguageDetector, handle } from "i18next-http-middleware";
import Backend, { FsBackendOptions } from "i18next-fs-backend";

const app = express();
const PORT = process.env.PORT || 3001;
const ENV_MODE = process.env.ENV || "development";
export const isDevMode = ENV_MODE === "development";

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
      cookieSameSite: "Strict",
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

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(handle(i18next));

app.use("/", routes);
app.use("/api/auth", authRoutes);
app.use("/api/cards", ensureAuthenticated, cardRoutes);
app.use("/api/users", ensureAuthenticated, friendRoutes);

const db_uri = process.env.DB_URI;

if (!db_uri) {
  console.error("There is no DB_URI in .env");
  process.exit(1);
}

mongoose
  .connect(db_uri)
  .then(() =>
    app.listen(PORT, () => {
      console.log(`app listening on a port ${PORT}`);
    })
  )
  .catch((err) => console.log(err));
