FROM debian:bookworm-slim
WORKDIR /srv

# install 
RUN apt-get update && \
    apt-get install -y  \
    curl \
    nginx \
    npm

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

COPY . .
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN . ~/.bashrc && nvm install
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build


EXPOSE 3000
ENTRYPOINT ["nginx", "-g", "daemon off;"]