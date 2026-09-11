FROM node:20-alpine AS frontend
WORKDIR /app
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ .
RUN npm run build

FROM maven:3-eclipse-temurin-17 AS backend
WORKDIR /build
COPY backend/pom.xml .
COPY backend/src src
COPY --from=frontend /app/dist src/main/resources/static
RUN mvn -DskipTests package

FROM eclipse-temurin:17-jre
COPY --from=backend /build/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
