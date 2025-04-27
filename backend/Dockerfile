# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21 AS builder

# Set working directory inside the builder
WORKDIR /app

# Copy Maven project files
COPY pom.xml .
COPY src ./src

# Package the application (download dependencies + build jar)
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM openjdk:21-jdk-slim

# Set working directory for runtime image
WORKDIR /app

# Copy the jar from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the backend port
EXPOSE 9090

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
