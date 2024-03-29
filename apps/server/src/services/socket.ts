import { Server } from "socket.io";
import Redis from "ioredis";
import prismaClient from "./prisma";




const pub = new Redis({
  host: "",
  port: 18760,
  username: "default",
  password: "",
});

const sub = new Redis({
  host: "",
  port: 18760,
  username: "default",
  password: "",
});

class SocketService {
  private _io: Server;

  constructor() {
    console.log("Init Socket Service...");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    sub.subscribe("MESSAGES");
  }
  public initListeners() {
    const io = this.io;
    console.log("Init Socket Listeners...");
    io.on("connect", (socket) => {
      console.log(`New Socket Connected`, socket.id);
      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New Message Rec.", message);
        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    sub.on("message", async (channel, message) => {
      if (channel === "MESSAGES") {
        console.log("new message from redis", message);
        io.emit("message", message);
        await prismaClient.message.create({
          data: {
            text: message,
          },
        })
      }
    });
  }
  get io() {
    return this._io;
  }
}

export default SocketService;
