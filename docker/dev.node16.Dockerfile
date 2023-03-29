FROM node:16.19.1-alpine3.17

WORKDIR /data/apps/app

# enter user
ARG gUser=yuh
ARG gId=1000

# remove user node
RUN deluser --remove-home node

# add user
RUN adduser -D -u ${gId} ${gUser}

# add sudo
RUN apk --no-cache add sudo && \
    echo "${gUser} ALL=(ALL) NOPASSWD: ALL" | tee -a /etc/sudoers

# chown mount volume
RUN mkdir -p /data/apps/app && \
    chown -R ${gUser}:${gUser} /data/apps/app

RUN apk --no-cache add bash

USER ${gUser}

CMD ["bash", "-c", "yarn run start:dev"]


