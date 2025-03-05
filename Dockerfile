# specify the base image with your desired version
FROM guergeiro/pnpm:22-10

WORKDIR /app

COPY . .
RUN pnpm install
RUN pnpm run build
CMD ["pnpm", "start"]

# Install Docker on your machine.
# Build and Run your container:
#   docker build -t lank-mui . && docker run -dp 3000:3000 lank-mui
