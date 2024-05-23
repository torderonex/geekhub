FROM docker:latest

RUN apk update && \
    apk add --no-cache \
    bash \
    git \
    openssl \
    sudo \
    curl \
    go

RUN curl -LO https://golang.org/dl/go1.22.1.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go1.22.1.linux-amd64.tar.gz && \
    rm go1.22.1.linux-amd64.tar.gz

ENV PATH="/usr/local/go/bin:${PATH}"
ENV GOPATH="/go"
ENV PATH="${GOPATH}/bin:${PATH}"

WORKDIR /go/src/app

COPY . .

RUN go build -o main cmd/app/main.go

EXPOSE 8080

COPY scripts/dockerd-entrypoint.sh /usr/local/bin/
COPY scripts/containerd-poststart /etc/docker/containerd-poststart

RUN chmod +x /usr/local/bin/dockerd-entrypoint.sh
RUN chmod +x /etc/docker/containerd-poststart

ENTRYPOINT ["dockerd-entrypoint.sh"]

CMD ["./main"]