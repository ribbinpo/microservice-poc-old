## gRPC

Start server

```bash
npm run dev
```

Start Client

1. Build

```bash
npm run build
```

2. Test

```bash
npm run start:client -- --unary
npm run start:client -- --server-streaming
npm run start:client -- --client-streaming
npm run start:client -- --bidi-streaming
```

### Make gRPC server securely with SSL cretificate

1. generate certificate

```bash
chmod u+r+x ./scripts/generate-certs.sh
./scripts/generate-certs.sh
```

2. Open SSL to uncomment code in:

- `src/grpc/test/client.ts` for client
- `src/grpc/index.ts` for server
