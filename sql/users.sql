CREATE TABLE users (
    id VARCHAR PRIMARY KEY NOT NULL,
    premium BOOLEAN NOT NULL,
    credits INTEGER NOT NULL,
    username VARCHAR NOT NULL,
    revenue FLOAT NOT NULL,
    creator BOOLEAN NOT NULL
)