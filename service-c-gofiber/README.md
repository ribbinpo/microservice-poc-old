## GRPC

1. Install Plugin 
```bash
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
go get -u github.com/golang/protobuf/protoc-gen-go
go get -u google.golang.org/grpc
export PATH=$PATH:$(go env GOPATH)/bin
```
2. Generate proto
```bash
mkdir proto_gen
protoc --proto_path=proto \
        --go_out=./proto_gen \
       --go_opt=paths=source_relative \
       --go-grpc_out=./proto_gen \
       --go-grpc_opt=paths=source_relative \
       proto/example.proto
```
