# Use image from HAProxy Docker LTS
FROM haproxy:lts

# Create app directory
WORKDIR /usr/src/app

# Switch to root user and install NodeJS and curl
USER root
RUN apt-get update \  
     && apt-get install --yes wget
RUN wget -qO- https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install --yes nodejs

RUN node -v
RUN npm -v

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install only production modules
RUN npm ci --only=production

# Bundle app source
COPY . .

# Switch back to HAProxy user before starting
USER haproxy

CMD [ "node", "app.js" ]
