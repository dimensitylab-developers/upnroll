import { describe, expect, it } from "vitest";
import { ensureMongoDatabaseName, mongoDatabaseNameFromUri } from "./mongo-uri";

describe("ensureMongoDatabaseName", () => {
  it("injects a database when the path is missing", () => {
    expect(ensureMongoDatabaseName("mongodb+srv://u:p@cluster0.example.mongodb.net", "test")).toBe(
      "mongodb+srv://u:p@cluster0.example.mongodb.net/test"
    );
  });

  it("injects a database when the path is only a slash", () => {
    expect(ensureMongoDatabaseName("mongodb+srv://u:p@cluster0.example.mongodb.net/", "test")).toBe(
      "mongodb+srv://u:p@cluster0.example.mongodb.net/test"
    );
  });

  it("preserves query string when injecting", () => {
    expect(
      ensureMongoDatabaseName("mongodb+srv://u:p@cluster0.example.mongodb.net/?retryWrites=true", "test")
    ).toBe("mongodb+srv://u:p@cluster0.example.mongodb.net/test?retryWrites=true");
  });

  it("leaves an existing database name alone", () => {
    expect(ensureMongoDatabaseName("mongodb://127.0.0.1:27017/upnroll", "test")).toBe(
      "mongodb://127.0.0.1:27017/upnroll"
    );
  });
});

describe("mongoDatabaseNameFromUri", () => {
  it("reads the path segment", () => {
    expect(mongoDatabaseNameFromUri("mongodb://127.0.0.1:27017/upnroll")).toBe("upnroll");
  });

  it("returns null when the path is empty", () => {
    expect(mongoDatabaseNameFromUri("mongodb+srv://u:p@cluster0.example.mongodb.net")).toBeNull();
  });
});
