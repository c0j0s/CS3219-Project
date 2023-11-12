import Preference from "../../models/types/preference";
import Room from "../../models/types/room";
import { encodePreferences, getOverlappedPreferences, ifPreferenceOverlapped } from "./encoder";
import Partner from "../../models/types/partner";
import logger from "./logger";
import { RabbitMQManager } from './rabbitMQ';

export default class RoomManager {
    private static instance: RoomManager;
    private rooms: Room[] = [];
    private activeSockets = new Set();

    public static getInstance(): RoomManager {
        if (!RoomManager.instance) {
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }

    async findMatchElseWait(
        user: Partner,
        preferences: Preference,
        matched: (room: Room) => void,
        noMatch: () => void,
    ) {
        try {
            // owner preference
            let encoded = encodePreferences(preferences)
            preferences.code = encoded.preferenceId;
            preferences.languageCode = encoded.languageCode;
            preferences.difficultyCode = encoded.difficultyCode;
            preferences.topicCode = encoded.topicCode;

            const myRoom: Room = {
                id: `${encoded.preferenceId}-${user.id}`,
                owner: user,
                matched: false,
                preferences: preferences
            }

            // add request to public queue to get replies from waiting users
            const manager = new RabbitMQManager();
            manager.publishPublicAndConsumeMatched(user.id, myRoom, (message) => {
                let receivedRoom = JSON.parse(message);
                console.log(receivedRoom);
                if (receivedRoom.id !== myRoom.id) {
                    try {
                        if (this.activeSockets.has(user.socketId) && this.activeSockets.has(receivedRoom.owner.socketId)) {
                            logger.debug(receivedRoom, `[RoomManager][publishPublicAndConsumeMatched]: `);
                            receivedRoom.matched = true;
                            receivedRoom.partner = user;
                            receivedRoom.preferences = getOverlappedPreferences(myRoom.preferences.code!, receivedRoom.preferences.code);
                            
                            this.rooms.push(receivedRoom);
                            matched(receivedRoom);
                        }
                    } catch (error) {
                        logger.error(`[RoomManager][publishPublicAndConsumeMatched.error]: Invalid socket id ${user.socketId} ${receivedRoom.partner.socketId}`);
                        noMatch();
                    }
                }
            }, 
            noMatch,
            (room) => {
                return ifPreferenceOverlapped(myRoom.preferences, JSON.parse(room).preferences)
            });
            
        } catch (error) {
            logger.error(error, `[RoomManager][findMatchElseWait]`);
            throw error;
        }
    }

    getActiveSockets() {
        return this.activeSockets;
    }

    getRoomById(id: string) {
        return this.rooms.find(x => x.id === id);
    }

    closeRoom(id: string) {
        try {
            this.rooms = this.rooms.filter(x => x.id !== id)
        } catch (error) {
            console.log("[closeRoom] Invalid room id.");
        }
    }

    count() {
        return this.rooms.length;
    }

    list() {
        return this.rooms;
    }
}