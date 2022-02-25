CREATE TABLE series (
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    title VARCHAR(50) NOT NULL,
    summary VARCHAR(500) NOT NULL,
    chapCount INTEGER NOT NULL DEFAULT 0,
    cover text NOT NULL,
    createdAt  TIMESTAMP NOT NULL DEFAULT current_timestamp,
    updatedAt TIMESTAMP NOT NULL,
    seriesStatus VARCHAR(1) NOT NULL DEFAULT 'd',
    chaps UUID[],
    adaptation UUID DEFAULT NULL,
	creator UUID NOT NULL,
    novel BOOL NOT NULL,
    mature BOOL NOT NULL,
    genre1 VARCHAR NOT NULL,
    genre2 VARCHAR NOT NULL
)