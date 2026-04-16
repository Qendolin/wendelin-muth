-- npx wrangler d1 execute default --remote --file=./schema.sql

DROP TABLE polls;
DROP TABLE options;
DROP TABLE votes;

-- 1. The Polls Table
CREATE TABLE polls_polls (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. The Options Table (Notice the new 'vote_count' column)
CREATE TABLE polls_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    poll_id TEXT NOT NULL,
    text TEXT NOT NULL,
    vote_count INTEGER DEFAULT 0,
    FOREIGN KEY(poll_id) REFERENCES polls_polls(id)
);

-- 3. The Votes Table (Records who voted for what to prevent duplicates/allow changes)
CREATE TABLE polls_votes (
    poll_id TEXT NOT NULL,
    option_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    PRIMARY KEY (poll_id, option_id, user_id),
    FOREIGN KEY(poll_id) REFERENCES polls_polls(id),
    FOREIGN KEY(option_id) REFERENCES polls_options(id)
);

-- 4. THE MAGIC: Triggers to keep 'vote_count' automatically updated
CREATE TRIGGER polls_after_vote_insert
AFTER INSERT ON polls_votes
BEGIN
    UPDATE polls_options SET vote_count = vote_count + 1 WHERE id = NEW.option_id;
END;

CREATE TRIGGER polls_after_vote_delete
AFTER DELETE ON polls_votes
BEGIN
    UPDATE polls_options SET vote_count = vote_count - 1 WHERE id = OLD.option_id;
END;
