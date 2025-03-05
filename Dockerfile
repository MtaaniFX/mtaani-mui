# specify the base image with your desired version
FROM guergeiro/pnpm:22-10
COPY . .
RUN pnpm install
RUN pnpm run build
CMD ["pnpm", "start"]

# Install Docker on your machine.
# Build your container: docker build -t nextjs-docker .
# Run your container: docker run -p 3000:3000 nextjs-docker
