# Use a Node.js base image, a small and secure version
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory first
# This allows Docker to cache the npm install step
COPY package*.json ./

# Install all dependencies, including dev dependencies needed for compilation
RUN npm install

# Copy the rest of the application's source code, including your .ts and .js files
COPY . .

# Compile TypeScript files into JavaScript
# The output will be a .js file in the same directory as the .ts file
RUN npx tsc

# Expose the port your Express app will listen on.
# We'll use 3000 as a standard port for web apps.
EXPOSE 3001

# Define the command to run your compiled application
# We are running the generated server.js file directly from the app's root
CMD [ "node", "server.js" ]
