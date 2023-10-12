"use server";
import { SERVICE } from "@/types/enums";
import { getSocketConfig } from "../endpoint";
import { getLogger } from "../logger";

const logger = getLogger("wrapper");

export async function getCollaborationSocketConfig() {
  const config = await getSocketConfig(SERVICE.COLLABORATION);
  return config;
}
