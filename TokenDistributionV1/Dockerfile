# Parent image
FROM node:20

# Container's working directory
WORKDIR /usr/src/app

# package.json and package-lock.json
COPY package*.json ./

# Install internal dependencies
RUN npm install

# Copy all the application
COPY . .

# Install external dependencies
RUN chmod +x ./docker-dependencies/install-*.sh
RUN ./docker-dependencies/install-pip.sh
RUN ./docker-dependencies/install-echidna.sh