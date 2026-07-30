#!/bin/bash

# Vai nella cartella root del progetto
cd "$(dirname "$0")"

echo "Avviando i container backend (users e bugboard)..."
docker compose -f compose.base.yaml -f compose.localdev.yaml up -d users bugboard

echo "Aspetto qualche secondo per assicurarmi che i container siano pronti..."
sleep 3

echo "Avviando Spring Boot sul container 'users' in background..."
docker compose -f compose.base.yaml -f compose.localdev.yaml exec -T -d users bash -c "cd /BugBoard26/backend/users && nohup ./mvnw spring-boot:run > spring-boot.log 2>&1"

echo "Avviando Spring Boot sul container 'bugboard' in background..."
docker compose -f compose.base.yaml -f compose.localdev.yaml exec -T -d bugboard bash -c "cd /BugBoard26/backend/bugboard && nohup ./mvnw spring-boot:run > spring-boot.log 2>&1"

echo "Fatto! I backend stanno partendo in background nei rispettivi container."
echo ""
echo "Puoi controllare i log in qualsiasi momento eseguendo:"
echo "  docker compose -f compose.base.yaml -f compose.localdev.yaml exec users tail -f /BugBoard26/backend/users/spring-boot.log"
echo "  docker compose -f compose.base.yaml -f compose.localdev.yaml exec bugboard tail -f /BugBoard26/backend/bugboard/spring-boot.log"
