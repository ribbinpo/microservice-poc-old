import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

import { ExampleHandlers } from "./proto_gen/example_package/Example";
import { ProtoGrpcType } from "./proto_gen/example";
import { ClientMessage } from "./proto_gen/example_package/ClientMessage";
import { ServerMessage } from "./proto_gen/example_package/ServerMessage";

const PORT = 50051;
const PROTO_FILE = "src/grpc/proto/example.proto";

const exampleServer: ExampleHandlers = {
  unaryCall: handleUnaryCall,
  serverStreamingCall: handleServerStreamingCall,
  clientStreamingCall: handleClientStreamingCall,
  bidirectionalStreamingCall: handleBidirectionalStreamingCall,
};

function handleUnaryCall(
  call: grpc.ServerUnaryCall<ClientMessage, ServerMessage>,
  callback: grpc.sendUnaryData<ServerMessage>
) {
  if (call.request) {
    console.log(`(server) Got client message: ${call.request.clientMessage}`);
  }
  callback(null, {
    serverMessage: 'Message from server',
  });
}

function handleServerStreamingCall(
  call: grpc.ServerWritableStream<ClientMessage, ServerMessage>
) {
  call.write({
    serverMessage: 'Message from server',
  });
}

function handleClientStreamingCall(
  call: grpc.ServerReadableStream<ClientMessage, ServerMessage>
) {
  call.on('data', (clientMessage: ClientMessage) => {
    console.log(
      `(server) Got client message: ${clientMessage.clientMessage}`
    );
  });
}

function handleBidirectionalStreamingCall(
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
}

function loadProtoFile(): ProtoGrpcType {
  const packageDefinition = protoLoader.loadSync(PROTO_FILE, {
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  return grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;
}

function createServer(proto: ProtoGrpcType): grpc.Server {
  const server = new grpc.Server();
  server.addService(proto.example_package.Example.service, exampleServer);
  return server;
}

function startServer(server: grpc.Server) {
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

function main() {
  const proto = loadProtoFile();
  const server = createServer(proto);
  startServer(server);
}

export default main;