# 1. Use an official Node.js image as the base.
# The alpine version is lightweight and good for production.
FROM node:18-alpine

# 2. Set the working directory inside the container.
WORKDIR /app

# 3. Copy package.json and package-lock.json to the container.
# This allows us to install dependencies efficiently.
COPY package*.json ./

# 4. Install project dependencies.
RUN npm install

# 5. Copy the rest of your application code into the container.
COPY . .

# 6. Build the Next.js application for production.
RUN npm run build

# 7. Expose port 3000, which is the default port for Next.js.
EXPOSE 3000

# 8. The command to run when the container starts.
CMD ["npm", "start"]