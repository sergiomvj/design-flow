import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    // For SQLite, the URL is used for migrations
    url: "file:./dev.db",
  },
});
