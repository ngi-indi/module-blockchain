# Parent image
FROM node:20

# Container's working directory
WORKDIR /usr/src/app

# Copy the application
COPY . .

# Install internal dependencies
RUN npm install

# Install TypeScript and ts-node # TODO: add to package.json
RUN npm install typescript ts-node

# Install express # TODO: add to package.json
RUN npm install --save-dev @types/express

# Expose the port
EXPOSE 5000

# Run the server
#CMD ["npx hardhat run --network bnbTestnet server.ts"]