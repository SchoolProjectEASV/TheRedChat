# Use the official Node.js 18 image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy only the package.json and package-lock.json for dependency installation
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --verbose

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy the rest of the application files
COPY . .

# Expose the default Angular port
EXPOSE 4200

# Start the Angular application
CMD ["ng", "serve", "--host", "0.0.0.0"]
