// Create Post node
CREATE CONSTRAINT ON (p:Post) ASSERT p.id IS UNIQUE;

CREATE (p:Post {id: 1, name: 'First Post', createdAt: datetime(), updatedAt: datetime()});