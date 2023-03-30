FROM node:18.12-alpine3.17

WORKDIR /data/apps

# enter user
ARG gUser
ARG gId

# remove user node
RUN deluser --remove-home node

# add user
RUN adduser -D -u ${gId} ${gUser}

# add sudo
RUN apk --no-cache add sudo && \
    echo "${gUser} ALL=(ALL) NOPASSWD: ALL" | tee -a /etc/sudoers

# chown mount volume
RUN mkdir -p /data/apps && \
    chown -R ${gUser}:${gUser} /data/apps

RUN apk --no-cache add bash

USER ${gUser}

CMD ["bash", "-c", "yarn run start:dev"]

