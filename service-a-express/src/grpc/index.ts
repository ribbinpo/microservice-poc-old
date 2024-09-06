import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

import { ExampleHandlers } from "./proto_gen/example_package/Example";
import { ProtoGrpcType } from "./proto_gen/example";
import { ClientMessage } from "./proto_gen/example_package/ClientMessage";
import { ServerMessage } from "./proto_gen/example_package/ServerMessage";


const PORT = "50051";
const PROTO_FILE = "src/grpc/proto/example.proto";

const exampleServer: ExampleHandlers = {
  unaryCall(
    call: grpc.ServerUnaryCall<ClientMessage, ServerMessage>,
    callback: grpc.sendUnaryData<ServerMessage>
  ) {
    if (call.request) {
      console.log(`(server) Got client message: ${call.request.clientMessage}`);
    }
    callback(null, {
      serverMessage: 'Message from server',
    });
  },

  serverStreamingCall(
    call: grpc.ServerWritableStream<ClientMessage, ServerMessage>
  ) {
    call.write({
      serverMessage: 'Message from server',
    });
  },

  clientStreamingCall(
    call: grpc.ServerReadableStream<ClientMessage, ServerMessage>
  ) {
    call.on('data', (clientMessage: ClientMessage) => {
      console.log(
        `(server) Got client message: ${clientMessage.clientMessage}`
      );
    });
  },

  bidirectionalStreamingCall(
    call: grpc.ServerDuplexStream<ClientMessage, ServerMessage>
  ) {
    call.write({
      serverMessage: 'Message from server',
    });
    call.on('data', (clientMessage: ClientMessage) => {
      console.log(
        `(server) Got client message: ${clientMessage.clientMessage}`
      );
    });
  },
};

function main() {
  const packageDefinition = protoLoader.loadSync(PROTO_FILE, {
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const proto = grpc.loadPackageDefinition(
    packageDefinition
  ) as unknown as ProtoGrpcType;
  const server = new grpc.Server();

  server.addService(proto.example_package.Example.service, exampleServer);

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err: Error | null, port: number) => {
      if (err) {
        console.error(`Server error: ${err.message}`);
        return;
      }
      console.log(`Server bound on port: ${port}`);
      server.start();
    }
  );
}

export default main;