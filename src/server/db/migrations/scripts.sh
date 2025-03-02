# Mount migrations directory and run all migration files
docker exec -v "$(pwd)/src/server/db/migrations:/migrations" neo4j \
    cypher-shell -u neo4j -p password -f /migrations/001-initial-schema.cypher

# Display node counts by label
docker exec neo4j cypher-shell -u neo4j -p password \
    "MATCH (n) RETURN labels(n) as Labels, count(n) as Count;"

# Display relationship counts by type
docker exec neo4j cypher-shell -u neo4j -p password \
    "MATCH ()-[r]->() RETURN type(r) as RelationType, count(r) as Count;"