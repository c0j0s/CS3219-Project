"use server";
import { SERVICE } from "@/types/enums";
import { getSocketConfig } from "../endpoint";

export async function getCollaborationSocketConfig() {
  return await getSocketConfig(SERVICE.COLLABORATION);
}
