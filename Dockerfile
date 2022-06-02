# Use image from HAProxy Docker LTS
FROM haproxy:lts

# Create app directory
WORKDIR /usr/src/app

# Switch to root user and install NodeJS and curl
USER root
RUN wget -qO- https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get update \  
     && apt-get install --yes --no-install-recommends nodejs

RUN nodejs -v
RUN npm -v

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install only production modules
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080

# Switch back to HAProxy user before starting
USER haproxy

CMD [ "node", "server.js" ]
