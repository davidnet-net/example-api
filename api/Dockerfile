FROM denoland/deno:2.4.3
WORKDIR /app

COPY . .
RUN deno cache main.ts

ENTRYPOINT ["deno", "task", "run"]
