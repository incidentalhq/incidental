FROM debian:bookworm-slim
WORKDIR /srv

# install 
RUN apt-get update && \
    apt-get install -y  \
    curl \
    nginx

COPY . .
COPY conf/website.conf /etc/nginx/conf.d/default.conf
COPY conf/nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000
ENTRYPOINT ["nginx", "-g", "daemon off;"]