# specify the base image with your desired version
FROM guergeiro/pnpm:22-10
COPY . .
RUN pnpm install
CMD ["pnpm", "start"]
