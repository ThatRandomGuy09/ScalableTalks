import { Server } from "socket.io";
import Redis from "ioredis";




const pub = new Redis({
  host: "redis-1db44290-scaleabletalks.a.aivencloud.com",
  port: 18760,
  username: "default",
  password: "AVNS_KR9MgbEr7EhHr3Gvwi6",
});

const sub = new Redis({
  host: "redis-1db44290-scaleabletalks.a.aivencloud.com",
  port: 18760,
  username: "default",
  password: "AVNS_KR9MgbEr7EhHr3Gvwi6",
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
      }
    });
  }
  get io() {
    return this._io;
  }
}

export default SocketService;
