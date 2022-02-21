CREATE TABLE series (
    id UUID PRIMARY KEY NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary VARCHAR(255) NOT NULL,
    chapCount INTEGER NOT NULL,
    cover text NOT NULL,
    createdAt TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP NOT NULL,
    seriesStatus VARCHAR(1) NOT NULL,
    chaps UUID[],
    adaptation UUID,
	creator UUID NOT NULL,
    novel BOOL NOT NULL
)