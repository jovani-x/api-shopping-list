import type { Request, Response } from "express";
import { Card } from "@/models/Card.js";
import { User } from "@/models/User.js";
import { UserRequest } from "@/data/types.js";
import { getUserCards } from "@/services/cardServices.js";
import { getUserFriends, getUserRequests } from "@/services/friendServices.js";

const INTERVAL_DURATION = 30000; // 30 sec

const updatesController = {
  updates: async (req: Request, res: Response) => {
    if (
      req.headers.accept &&
      (req.headers.accept === "text/event-stream" ||
        req.headers.accept === "*/*")
    ) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const sendData = ({
        data,
        eventName,
      }: {
        data: { [key: string]: any };
        eventName?: string;
      }) => {
        const idStr = `id: ${new Date().valueOf()}\n`;
        const eventStr = eventName ? `event: ${eventName}\n` : "";
        const dataStr = `data: ${JSON.stringify(data)}\n\n`;
        const event = `${idStr}${eventStr}${dataStr}`;

        res.write(event);
      };

      const intervalObj: {
        duration: number;
        intervalIns: NodeJS.Timeout | undefined;
        start: Function;
        stop: Function;
      } = {
        duration: INTERVAL_DURATION,
        intervalIns: undefined,
        start: function () {
          if (!this.intervalIns) {
            this.intervalIns = setInterval(() => {
              sendData({ data: { message: "keep-alive" } });
            }, this.duration);
          }
        },
        stop: function () {
          if (this.intervalIns) {
            clearInterval(this.intervalIns);
            this.intervalIns = undefined;
          }
        },
      };

      intervalObj.start();

      const getUpdatedUsers = async ({ ownerId }: { ownerId: string }) => {
        const [friends, requests] = await Promise.all([
          getUserFriends({ ownerId }),
          getUserRequests(ownerId, UserRequest.becomeFriend),
        ]);

        return { friends, requests };
      };

      const processUpdate = async ({ coll }: { coll: string }) => {
        const ownerId = req.body.userId;

        try {
          if (coll === "cards") {
            sendData({
              data: { cards: await getUserCards({ ownerId }) },
              eventName: "cardsupdate",
            });
          } else if (coll === "users") {
            sendData({
              data: await getUpdatedUsers({ ownerId }),
              eventName: "usersupdate",
            });
          } else {
            const [cards, users] = await Promise.all([
              getUserCards({ ownerId }),
              getUpdatedUsers({ ownerId }),
            ]);
            sendData({
              data: { cards: cards },
              eventName: "cardsupdate",
            });
            sendData({
              data: users,
              eventName: "usersupdate",
            });
          }
        } catch (err) {
          return { message: err };
        }
      };

      const changeHandle = async (change: any) => {
        const { ns, operationType } = change;
        const collStr =
          operationType === "update" &&
          change?.updateDescription?.updatedFields &&
          Object.keys(change.updateDescription.updatedFields).filter(
            (key) => key.indexOf("cards") === 0
          ).length > 0
            ? ""
            : ns.coll;

        intervalObj.stop();
        await processUpdate({ coll: collStr });
        intervalObj.start();
      };

      const changeStreamUser = User.watch();
      changeStreamUser.on("change", changeHandle);

      const changeStreamCard = Card.watch();
      changeStreamCard.on("change", changeHandle);

      const closeConnection = () => {
        intervalObj.stop();

        if (!changeStreamCard.closed) {
          changeStreamCard.close();
        }
        if (!changeStreamUser.closed) {
          changeStreamUser.close();
        }
      };

      req.socket.on("end", () => closeConnection());
      req.on("close", () => closeConnection());
    } else {
      console.log("Return a 404 response for non-SSE requests");
      return res.status(404).json({ message: "non-SSE requests" }).end();
    }
  },
};

export default updatesController;
