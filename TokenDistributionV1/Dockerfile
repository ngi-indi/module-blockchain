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

# Build arguments (default value is false if not overwritten by the compose.yaml file):
ARG INSTALL_PIP=false
ARG INSTALL_CONFUZZIUS=false
ARG INSTALL_ECHIDNA=false

# Install external dependencies
RUN chmod +x ./docker-dependencies/install-*.sh
RUN ./docker-dependencies/install-apt.sh
RUN if [ $INSTALL_PIP = true ]; then ./docker-dependencies/install-pip.sh; fi
RUN if [ $INSTALL_CONFUZZIUS = true ]; then ./docker-dependencies/install-confuzzius.sh; fi
RUN if [ $INSTALL_ECHIDNA = true ]; then ./docker-dependencies/install-echidna.sh; fi