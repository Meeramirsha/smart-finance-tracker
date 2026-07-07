# Stage 1: Build the Maven application
FROM maven:3.8.8-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the backend files using root-relative paths
COPY backend/pom.xml ./backend/pom.xml
COPY backend/src ./backend/src

# Set working directory to backend to build it
WORKDIR /app/backend
RUN mvn clean package -DskipTests

# Stage 2: Run the Spring Boot application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
