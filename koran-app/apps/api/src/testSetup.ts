// Runs before every test file: point the DB at a fresh in-memory database so
// tests never touch or depend on the real data.sqlite3 file.
process.env.DB_PATH = ":memory:";
