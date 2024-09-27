import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as fs from "fs";
import path from "path";

import { ProtoGrpcType } from "../proto_gen/example";
import { ServerMessage } from "../proto_gen/example_package/ServerMessage";

const host = "localhost:50051";
const packageDefinition = protoLoader.loadSync("src/grpc/proto/example.proto", {
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(
  packageDefinition
) as unknown as ProtoGrpcType;

// uncomment this line to use SSL
// const credentials = grpc.credentials.createSsl(
//   fs.readFileSync(path.join(__dirname, "../../../certs/ca.crt")),
//   fs.readFileSync(path.join(__dirname, "../../../certs/client.key")),
//   fs.readFileSync(path.join(__dirname, "../../../certs/client.crt")),
// );

// for SSL, comment grpc.credentials.createInsecure(), and uncomment credentials
const client = new proto.example_package.Example(
  host,
  grpc.credentials.createInsecure(),
  // credentials,
);

const deadline = new Date();
deadline.setSeconds(deadline.getSeconds() + 5);
client.waitForReady(deadline, (error?: Error) => {
  if (error) {
    console.log(`Client connect error: ${error.message}`);
  } else {
    onClientReady();
  }
});

function onClientReady() {
  switch (process.argv[process.argv.length - 1]) {
    case "--unary":
      doUnaryCall();
      break;
    case "--server-streaming":
      doServerStreamingCall();
      break;
    case "--client-streaming":
      doClientStreamingCall();
      break;
    case "--bidi-streaming":
      doBidirectionalStreamingCall();
      break;
    default:
      throw new Error("Example not specified");
  }
}

function doUnaryCall() {
  const meta = new grpc.Metadata();
  meta.set("auth", "value"); // add metadata JWT token
  client.unaryCall(
    {
      clientMessage: "Message from client",
    },
    meta,
    (error?: grpc.ServiceError | null, serverMessage?: ServerMessage) => {
      if (error) {
        console.error(error.message);
      } else if (serverMessage) {
        console.log(
          `(client) Got server message: ${serverMessage.serverMessage}`
        );
      }
    }
  );
}

function doServerStreamingCall() {
  const meta = new grpc.Metadata();
  meta.set("auth", "value"); // add metadata JWT token
  const stream = client.serverStreamingCall({
    clientMessage: "Message from client",
  }, meta);
  stream.on("data", (serverMessage: ServerMessage) => {
    console.log(`(client) Got server message: ${serverMessage.serverMessage}`);
  });
}

function doClientStreamingCall() {
  const meta = new grpc.Metadata();
  meta.set("auth", "value"); // add metadata JWT token
  const stream = client.clientStreamingCall(
    meta,
    (error?: grpc.ServiceError | null) => {
      if (error) {
        console.error(error.message);
      }
    }
  );
  stream.write({
    clientMessage: "Message from client",
  });
}

function doBidirectionalStreamingCall() {
  const meta = new grpc.Metadata();
  meta.set("auth", "value"); // add metadata JWT token
  const stream = client.bidirectionalStreamingCall(meta);

  // Server stream
  stream.on("data", (serverMessage: ServerMessage) => {
    console.log(`(client) Got server message: ${serverMessage.serverMessage}`);
  });

  // Client stream
  stream.write({
    clientMessage: "Message from client",
  });
}
