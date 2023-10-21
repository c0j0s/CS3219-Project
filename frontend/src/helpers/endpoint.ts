"use server";
import { HTTP_METHODS, DOMAIN } from "@/types/enums";
import { getLogger } from "./logger";
import { cookies } from "next/headers";
import HttpStatusCode from "@/types/HttpStatusCode";

const logger = getLogger("endpoint");

const host = process.env.ENDPOINT || "http://localhost";

/**
 * Configuration object for API calls.
 */
type ApiConfig = {
  method: HTTP_METHODS; // HTTP method.
  domain: DOMAIN; // Enum representing the domain type.
  header?: {}; // Optional headers
  path?: string; // Optional endpoint path.
  body?: {}; // Optional request body.
  tags?: string[]; // Optional array of caching scopes.
  cache?: RequestCache;
  deleteJWTCookie?: boolean;
};

/**
 * Response object for API calls.
 */
type ApiResponse = {
  status: number; // HTTP status code.
  message: string;
  data?: any; // Response data.
};

/**
 * Handles API calls to the backend gateway.
 * @param config {ApiConfig} - Configuration object for the API call.
 * @returns {Promise<ApiResponse>} - Response from the API call.
 */
export default async function api(config: ApiConfig): Promise<ApiResponse> {
  // Configure local domain port based on the 'domain' property in the configuration.
  let servicePort = getServicePorts(config.domain);

  // Build the final API endpoint URL.
  const endpoint = `${host}${servicePort}/${config.domain}/api/${
    config.path || ""
  }`;

  // If JWT cookies exist in the browser, add them to the request header.
  let jwtCookieString = "";
  if (cookies().get("jwt")) {
    jwtCookieString = cookies().toString();
  }

  // Build the final request header
  const header = {
    ...(config.body ? { "Content-Type": "application/json" } : {}),
    ...config.header,
    Cookie: jwtCookieString,
  };
  logger.info(header, `[endpoint] ${config.method}: ${endpoint}`);

  // Log the request body if it exists.
  if (config.body) {
    logger.debug(config.body, `[endpoint] request body:`);
  }

  try {
    // Fetch data from the constructed API endpoint.
    const res = await fetch(endpoint, {
      method: config.method,
      headers: header,
      body: JSON.stringify(config.body),
      next: {
        tags: config.tags,
      },
      cache: config.cache,
    });

    // If the response contains a JWT cookie, set it in the browser.
    const resCookie = res.headers.get("set-cookie");
    if (resCookie) {
      const jwtCookieString = resCookie
        ?.split(";")
        .find((cookie) => cookie.split("=")[0].trim() == "jwt")
        ?.split("=")[1];

      if (jwtCookieString) {
        cookies().set("jwt", jwtCookieString, {
          httpOnly: true,
          secure: false,
        });
        logger.info(`JWT cookie has been set into browser`);
      }
    }

    // If deleteCookie is true, delete the JWT cookie from the browser.
    if (config.deleteJWTCookie) {
      cookies().delete("jwt");
      logger.info(`JWT cookie has been removed from browser`);
    }

    // Parse the response body for all status codes except 204 (no content), expand this to handle more codes without content.
    let data =
      res.status != HttpStatusCode.NO_CONTENT &&
      res.status != HttpStatusCode.UNAUTHORIZED
        ? await res.json()
        : {};
    logger.info(`[${res.status}] ${config.method}: ${res.url}`);

    // Return an ApiResponse object with status, data, and message.
    return {
      status: res.status,
      message: res.statusText,
      data: data,
    };
  } catch (error) {
    // Handle errors and log them.
    logger.error(error, `[endpoint]`);

    // Return an ApiResponse with a 500 status code and an error message.
    return {
      status: 500,
      message: `Error occurs, please call tech support.`,
    };
  }
}

/**
 * Builds the corresponding Socket IO
 * @param domain
 * @returns
 */
export async function getSocketConfig(domain: DOMAIN) {
  // Configure local domain port.
  let servicePort = getServicePorts(domain);

  // Build the final API endpoint URL.
  const endpoint = `${host}${servicePort}`;
  const path = `/${domain}/socket`;
  logger.info(`[endpoint] socket: ${endpoint}`);
  return { endpoint, path };
}

/**
 * Retrieves the corresponding port number from .env base on services.
 * @param domain {SERVICE}
 * @returns port number
 */
function getServicePorts(domain: DOMAIN) {
  if (process.env.BUILD_ENV == "development") {
    let servicePort = ":";
    switch (domain) {
      case DOMAIN.QUESTION:
        servicePort += process.env.ENDPOINT_QUESTION_PORT || "";
        break;
      case DOMAIN.USER:
        servicePort += process.env.ENDPOINT_USER_PORT || "";
        break;
      case DOMAIN.AUTH:
        servicePort += process.env.ENDPOINT_AUTH_PORT || "";
        break;
      case DOMAIN.MATCHING:
        servicePort += process.env.ENDPOINT_MATCHING_PORT || "";
        break;
      case DOMAIN.COLLABORATION:
        servicePort += process.env.ENDPOINT_COLLABORATION_PORT || "";
        break;
      default:
        servicePort = "";
        break;
    }
    return servicePort;
  }
}
