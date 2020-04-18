FROM node:13.13.0
RUN mkdir /message_relay
COPY --chown=node package*.json /message_relay/
WORKDIR /message_relay
RUN npm install
COPY --chown=node ./ /message_relay
USER node
ENTRYPOINT ["node", "main.js"]