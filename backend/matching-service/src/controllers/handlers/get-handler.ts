import { Request, Response } from "express";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import RoomManager from "../../lib/utils/roomManager";

const queueEndpoint = `http://${process.env.QUEUE_URL || "localhost"}:15672/api/overview`
const queueAuthString = 'Basic ' + Buffer.from(`${process.env.QUEUE_ACCOUNT || 'guest'}:${process.env.QUEUE_PASSWORD || 'guest'}`).toString('base64');

export const getHealth = async (_: Request, response: Response) => {
  try {
    const queueResponse = await fetch(queueEndpoint, {
        headers: {
          Authorization: queueAuthString,
      }
    });

    if (queueResponse.ok) {
      response.status(HttpStatusCode.OK).json({ message: "Healthy" });
    } else {
      response.status(queueResponse.status).json({
        message: queueResponse.statusText
      })
    }
  } catch (error) {
    console.log(error);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "An unexpected error has occurred.",
    });
  }
};

export const getStatus = async (_: Request, response: Response) => {
  try {
    const rm = RoomManager.getInstance();
    const queueResponse = await fetch(queueEndpoint, {
      headers: {
        Authorization: queueAuthString,
      }
    });

    const data = {
      count: rm.count(),
      rooms: rm.list(),
      queue: await queueResponse.json()
    }

    response.status(HttpStatusCode.OK).json(data);
  } catch (error) {
    console.log(error);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "An unexpected error has occurred.",
    });
  }
};
