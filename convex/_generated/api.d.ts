/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as helpers from "../helpers.js";
import type * as lib_dates from "../lib/dates.js";
import type * as lib_errors from "../lib/errors.js";
import type * as preferences from "../preferences.js";
import type * as stats from "../stats.js";
import type * as translations from "../translations.js";
import type * as translator from "../translator.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  helpers: typeof helpers;
  "lib/dates": typeof lib_dates;
  "lib/errors": typeof lib_errors;
  preferences: typeof preferences;
  stats: typeof stats;
  translations: typeof translations;
  translator: typeof translator;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
