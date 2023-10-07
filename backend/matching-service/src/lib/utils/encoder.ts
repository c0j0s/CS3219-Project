import crypto from "crypto";
import Preferences from "../../models/types/preferences";
import Complexity from "../enums/Complexity";
import Language from "../enums/Language";
import Topic from "../enums/Topic";

function enumValues<T>(e: any): T[] {
  return Object.keys(e).map((key) => e[key]);
}

export function encodeEnum<E extends object>(enumObj: E, values: E[]): string {
  if (values.length === 0) {
    return "0".repeat(Object.keys(enumObj).length / 2);
  }

  let stringValues = values.map((x) => (x as String).toUpperCase());

  const binaryCode = enumValues(enumObj)
    .map((enumValue) =>
      stringValues.includes(enumValue as string) ? "1" : "0"
    )
    .join("");

  return binaryCode;
}

export function binaryToHex(...input: string[]): string {
  var binaryString = input.join("");
  const decimalValue = parseInt(binaryString, 2);
  const hexString = decimalValue.toString(16); // Convert decimal to hexadecimal
  return hexString;
}

export function encodePreferences(preference: Preferences): string {
  return binaryToHex(
    encodeEnum(Language, preference.languages),
    encodeEnum(Complexity, preference.difficulties),
    encodeEnum(Topic, preference.topics)
  );
}

export function generateRoomId(
  ownerId: string,
  partnerId: string,
  questionId: string,
  language: string
): string {
  const inputString = ownerId + partnerId + questionId + language.toLowerCase();

  const hash = crypto.createHash("sha256");
  hash.update(inputString);

  return hash.digest("hex").slice(0, 20);
}
